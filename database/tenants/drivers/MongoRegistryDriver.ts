/**
 * database/tenants/drivers/MongoRegistryDriver.ts
 *
 * AWM-ERP — MongoDB Master Registry Driver
 *
 * Control-plane tenant metadata একটি `tenants` collection-এ রাখা হয়
 * (master database: MONGODB_DB_NAME / TenantConfig.mongodb.databaseName)।
 * PostgresRegistryDriver-এর সাথে ঠিক একই আচরণ বজায় রাখা হয়েছে যাতে
 * MasterRegistry কোনো caller-visible পার্থক্য ছাড়াই driver সুইচ করতে পারে।
 */

import { getDb } from '../../../lib/mongodb';
import { TenantFactory } from '../../../lib/tenant/TenantFactory';
import {
  Tenant,
  TenantStatus,
  TenantDBConfig,
  ProvisioningPayload,
  ProvisioningResult,
  ProvisioningStep,
  ProvisioningError,
  MasterRegistryEntry,
  MasterRegistryQueryOptions,
  TenantContactInfo,
  TenantError,
} from '../../../lib/tenant/types';
import type {
  TenantRegistryDriver,
  RegistryListResult,
  RegistryHealth,
} from '../../../lib/db/registryDriver';

const COLLECTION_NAME = 'tenants';

interface TenantDocument extends Tenant {}

function normalizeLookup(value: string): string {
  return value.trim().toLowerCase();
}

function toTenant(doc: TenantDocument): Tenant {
  const { _id, ...rest } = doc as TenantDocument & { _id?: unknown };
  void _id;
  return rest as Tenant;
}

function toTenantDocument(doc: TenantDocument | null): Tenant | null {
  return doc ? toTenant(doc) : null;
}

export class MongoRegistryDriver implements TenantRegistryDriver {
  private async collection() {
    const db = await getDb();
    return db.collection<TenantDocument>(COLLECTION_NAME);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(slug);
    if (!normalized) return null;

    const col = await this.collection();
    const doc = await col.findOne({ slug: normalized } as Partial<TenantDocument>);
    return toTenantDocument(doc);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(domain);
    if (!normalized) return null;

    const col = await this.collection();
    const doc = await col.findOne({ customDomain: normalized } as Partial<TenantDocument>);
    return toTenantDocument(doc);
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(id);
    if (!normalized) return null;

    const col = await this.collection();
    const doc = await col.findOne({ id: normalized } as Partial<TenantDocument>);
    return toTenantDocument(doc);
  }

  async listTenants(options: MasterRegistryQueryOptions = {}): Promise<RegistryListResult> {
    const {
      status,
      plan,
      search,
      page = 1,
      pageSize = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escaped) {
        const pattern = new RegExp(escaped, 'i');
        filter.$or = [{ name: pattern }, { slug: pattern }];
      }
    }

    const sortFieldMap: Record<NonNullable<MasterRegistryQueryOptions['sortBy']>, string> = {
      createdAt: 'createdAt',
      name: 'name',
      status: 'status',
    };
    const sortField = sortFieldMap[sortBy] ?? 'createdAt';
    const direction = sortOrder === 'asc' ? 1 : -1;

    const safePage = Math.max(1, page);
    const safePageSize = Math.min(Math.max(1, pageSize), 200);

    const col = await this.collection();

    const [totalItems, docs] = await Promise.all([
      col.countDocuments(filter),
      col
        .find(filter)
        .sort({ [sortField]: direction })
        .skip((safePage - 1) * safePageSize)
        .limit(safePageSize)
        .toArray(),
    ]);

    const entries: MasterRegistryEntry[] = docs.map((doc) => ({
      tenantId: doc.id,
      slug: doc.slug,
      customDomain: doc.customDomain,
      status: doc.status,
      plan: doc.plan,
      dbHost: doc.dbConfig.host,
      dbName: doc.dbConfig.databaseName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return { entries, totalItems, page: safePage, pageSize: safePageSize };
  }

  async registerTenant(data: ProvisioningPayload): Promise<ProvisioningResult> {
    const startedAt = Date.now();
    const completedSteps: ProvisioningStep[] = [];
    const errors: ProvisioningError[] = [];

    try {
      const slug = normalizeLookup(data.companyDetails.slug);
      if (!slug) {
        throw new TenantError('TENANT_PROVISIONING_FAILED', 'Company slug is required.');
      }

      const col = await this.collection();

      const existing = await col.findOne({ slug } as Partial<TenantDocument>);
      if (existing) {
        throw new TenantError('TENANT_SLUG_TAKEN', `Slug "${slug}" is already in use.`);
      }
      completedSteps.push('validating');

      const dbConfig = TenantFactory.buildDbConfig(slug, data.dbSelection);

      const contact: TenantContactInfo = {
        ownerName: data.adminUser.fullName,
        email: data.adminUser.email,
        phone: data.adminUser.phone,
      };

      const now = new Date();
      const doc: TenantDocument = {
        id: TenantFactory.createTenantId(),
        slug,
        customDomain: null,
        name: data.companyDetails.name,
        status: 'pending',
        plan: data.plan,
        isolationStrategy: data.dbSelection.isolationStrategy,
        dbConfig,
        contact,
        billing: undefined,
        limits: undefined,
        metadata: undefined,
        createdAt: now,
        updatedAt: now,
        suspendedAt: null,
        archivedAt: null,
      };

      await col.insertOne(doc);
      completedSteps.push('registering-tenant');

      return {
        success: true,
        tenantId: doc.id,
        slug: doc.slug,
        dbDetails: {
          databaseName: dbConfig.databaseName,
          host: dbConfig.host,
          provider: dbConfig.provider,
        },
        completedSteps,
        errors,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      const code = error instanceof TenantError ? error.code : 'TENANT_PROVISIONING_FAILED';
      const message = error instanceof Error ? error.message : 'Unknown error during tenant registration.';

      errors.push({
        step: completedSteps[completedSteps.length - 1] ?? 'validating',
        code,
        message,
        details: error instanceof TenantError ? error.details : undefined,
      });

      return {
        success: false,
        slug: '',
        completedSteps,
        errors,
        durationMs: Date.now() - startedAt,
      };
    }
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const normalized = normalizeLookup(id);
    if (!normalized) {
      throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to update status.');
    }

    const col = await this.collection();
    const update: Record<string, unknown> = { status, updatedAt: new Date() };

    if (status === 'suspended') update.suspendedAt = new Date();
    else if (status === 'archived') update.archivedAt = new Date();
    else if (status === 'active') {
      update.suspendedAt = null;
      update.archivedAt = null;
    }

    const result = await col.findOneAndUpdate(
      { id: normalized } as Partial<TenantDocument>,
      { $set: update },
      { returnDocument: 'after' }
    );

    const tenant = toTenantDocument(result as TenantDocument | null);
    if (!tenant) {
      throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
    }
    return tenant;
  }

  async updateTenantDBConfig(id: string, dbConfig: TenantDBConfig): Promise<Tenant> {
    const normalized = normalizeLookup(id);
    if (!normalized) {
      throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to update its DB config.');
    }

    const col = await this.collection();
    const result = await col.findOneAndUpdate(
      { id: normalized } as Partial<TenantDocument>,
      { $set: { dbConfig, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const tenant = toTenantDocument(result as TenantDocument | null);
    if (!tenant) {
      throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
    }
    return tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    const normalized = normalizeLookup(id);
    if (!normalized) {
      throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to delete a tenant.');
    }

    const col = await this.collection();
    const result = await col.deleteOne({ id: normalized } as Partial<TenantDocument>);

    if (result.deletedCount === 0) {
      throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
    }
  }

  async healthCheck(): Promise<RegistryHealth> {
    const start = Date.now();
    try {
      const col = await this.collection();
      await col.estimatedDocumentCount();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  async shutdown(): Promise<void> {
    // shared MongoClient (lib/mongodb.ts) নিজের connection lifecycle
    // নিজেই ম্যানেজ করে — এখানে কিছু close করার দরকার নেই।
  }
}