/**
 * lib/tenant/TenantRegistry.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Master Registry
 *
 * Control-plane directory of every tenant.
 */

import {
  Tenant,
  MasterRegistryEntry,
  MasterRegistryQueryOptions,
  TenantUpdatePayload,
  TenantStatus,
  TenantError,
} from './types';

export interface TenantRegistryAdapter {
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findByCustomDomain(domain: string): Promise<Tenant | null>;
  insert(tenant: Tenant): Promise<Tenant>;
  update(id: string, patch: Partial<Tenant>): Promise<Tenant>;
  remove(id: string): Promise<void>;
  listAll(): Promise<Tenant[]>;
}

function normalizeId(value: string): string {
  return String(value ?? '').trim();
}

function normalizeSlug(value: string): string {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeDomain(
  value: string | null | undefined,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
}

export class InMemoryTenantRegistryAdapter
  implements TenantRegistryAdapter
{
  private tenants = new Map<string, Tenant>();

  async findById(
    id: string,
  ): Promise<Tenant | null> {
    return this.tenants.get(normalizeId(id)) ?? null;
  }

  async findBySlug(
    slug: string,
  ): Promise<Tenant | null> {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) return null;

    for (const tenant of this.tenants.values()) {
      if (normalizeSlug(tenant.slug) === normalizedSlug) {
        return tenant;
      }
    }

    return null;
  }

  async findByCustomDomain(
    domain: string,
  ): Promise<Tenant | null> {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) return null;

    for (const tenant of this.tenants.values()) {
      const tenantDomain = tenant.customDomain
        ? normalizeDomain(tenant.customDomain)
        : '';

      if (
        tenantDomain &&
        tenantDomain === normalizedDomain
      ) {
        return tenant;
      }
    }

    return null;
  }

  async insert(
    tenant: Tenant,
  ): Promise<Tenant> {
    this.tenants.set(normalizeId(tenant.id), tenant);
    return tenant;
  }

  async update(
    id: string,
    patch: Partial<Tenant>,
  ): Promise<Tenant> {
    const normalizedId = normalizeId(id);
    const existing = this.tenants.get(normalizedId);

    if (!existing) {
      throw new TenantError(
        'TENANT_NOT_FOUND',
        `Tenant ${id} not found.`,
        id,
      );
    }

    const updated: Tenant = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date(),
    };

    this.tenants.set(normalizedId, updated);
    return updated;
  }

  async remove(
    id: string,
  ): Promise<void> {
    this.tenants.delete(normalizeId(id));
  }

  async listAll(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }
}

export class TenantRegistry {
  constructor(
    private readonly adapter: TenantRegistryAdapter =
      new InMemoryTenantRegistryAdapter(),
  ) {}

  async getById(
    id: string,
  ): Promise<Tenant | null> {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return null;
    return this.adapter.findById(normalizedId);
  }

  async getBySlug(
    slug: string,
  ): Promise<Tenant | null> {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) return null;
    return this.adapter.findBySlug(normalizedSlug);
  }

  async getByCustomDomain(
    domain: string,
  ): Promise<Tenant | null> {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) return null;
    return this.adapter.findByCustomDomain(normalizedDomain);
  }

  async register(
    tenant: Tenant,
  ): Promise<Tenant> {
    const normalizedSlug = normalizeSlug(tenant.slug);
    if (!normalizedSlug) {
      throw new TenantError(
        'TENANT_INVALID_REQUEST',
        'Tenant slug is required.',
        tenant.id,
      );
    }

    const existingSlug =
      await this.adapter.findBySlug(normalizedSlug);

    if (existingSlug && existingSlug.id !== tenant.id) {
      throw new TenantError(
        'TENANT_SLUG_TAKEN',
        `Slug "${normalizedSlug}" is already in use.`,
        tenant.id,
      );
    }

    if (tenant.customDomain) {
      const normalizedDomain = normalizeDomain(tenant.customDomain);
      if (normalizedDomain) {
        const existingDomain =
          await this.adapter.findByCustomDomain(
            normalizedDomain,
          );
        if (existingDomain && existingDomain.id !== tenant.id) {
          throw new TenantError(
            'TENANT_INVALID_REQUEST',
            `Custom domain "${normalizedDomain}" is already in use.`,
            tenant.id,
          );
        }
      }
    }

    const normalizedTenant: Tenant = {
      ...tenant,
      slug: normalizedSlug,
      customDomain: tenant.customDomain
        ? normalizeDomain(tenant.customDomain) || null
        : null,
    };

    return this.adapter.insert(normalizedTenant);
  }

  async update(
    id: string,
    payload: TenantUpdatePayload,
  ): Promise<Tenant> {
    const normalizedId = normalizeId(id);
    if (!normalizedId) {
      throw new TenantError(
        'TENANT_INVALID_REQUEST',
        'Tenant ID is required.',
        id,
      );
    }

    const existing =
      await this.adapter.findById(normalizedId);

    if (!existing) {
      throw new TenantError(
        'TENANT_NOT_FOUND',
        `Tenant ${id} not found.`,
        id,
      );
    }

    const patch: Partial<Tenant> = {
      ...payload,
    };

    if ('slug' in payload && payload.slug !== undefined) {
      const nextSlug = normalizeSlug(payload.slug);
      if (!nextSlug) {
        throw new TenantError(
          'TENANT_INVALID_REQUEST',
          'Tenant slug cannot be empty.',
          id,
        );
      }

      const slugOwner =
        await this.adapter.findBySlug(nextSlug);

      if (slugOwner && slugOwner.id !== normalizedId) {
        throw new TenantError(
          'TENANT_SLUG_TAKEN',
          `Slug "${nextSlug}" is already in use.`,
          id,
        );
      }

      patch.slug = nextSlug;
    }

    if ('customDomain' in payload) {
      const nextDomain = payload.customDomain
        ? normalizeDomain(payload.customDomain)
        : '';

      if (nextDomain) {
        const domainOwner =
          await this.adapter.findByCustomDomain(
            nextDomain,
          );

        if (domainOwner && domainOwner.id !== normalizedId) {
          throw new TenantError(
            'TENANT_INVALID_REQUEST',
            `Custom domain "${nextDomain}" is already in use.`,
            id,
          );
        }

        patch.customDomain = nextDomain;
      } else {
        patch.customDomain = null;
      }
    }

    return this.adapter.update(normalizedId, patch);
  }

  async setStatus(
    id: string,
    status: TenantStatus,
  ): Promise<Tenant> {
    const normalizedId = normalizeId(id);

    const existing =
      await this.adapter.findById(normalizedId);

    if (!existing) {
      throw new TenantError(
        'TENANT_NOT_FOUND',
        `Tenant ${id} not found.`,
        id,
      );
    }

    const now = new Date();
    const patch: Partial<Tenant> = { status };

    if (status === 'active' || status === 'pending') {
      patch.suspendedAt = null;
      patch.archivedAt = null;
    }

    if (status === 'suspended') {
      patch.suspendedAt = existing.suspendedAt ?? now;
    }

    if (status === 'archived') {
      patch.archivedAt = existing.archivedAt ?? now;
    }

    return this.adapter.update(normalizedId, patch);
  }

  async remove(
    id: string,
  ): Promise<void> {
    const normalizedId = normalizeId(id);
    const existing =
      await this.adapter.findById(normalizedId);

    if (!existing) {
      throw new TenantError(
        'TENANT_NOT_FOUND',
        `Tenant ${id} not found.`,
        id,
      );
    }

    await this.adapter.remove(normalizedId);
  }

  async query(
    options: MasterRegistryQueryOptions = {},
  ): Promise<{
    entries: MasterRegistryEntry[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const all = await this.adapter.listAll();

    let filtered = all;

    if (options.status) {
      filtered = filtered.filter(
        (tenant) => tenant.status === options.status,
      );
    }

    if (options.plan) {
      filtered = filtered.filter(
        (tenant) => tenant.plan === options.plan,
      );
    }

    if (options.search) {
      const q = options.search.trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(
          (tenant) =>
            tenant.name.toLowerCase().includes(q) ||
            tenant.slug.toLowerCase().includes(q),
        );
      }
    }

    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'desc';
    const direction = sortOrder === 'asc' ? 1 : -1;

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name) * direction;
      if (sortBy === 'status') return a.status.localeCompare(b.status) * direction;
      return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
    });

    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(
      100,
      Math.max(1, options.pageSize ?? 20),
    );

    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    return {
      entries: pageItems.map((tenant) => this.toMasterEntry(tenant)),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  private toMasterEntry(
    tenant: Tenant,
  ): MasterRegistryEntry {
    return {
      tenantId: tenant.id,
      slug: tenant.slug,
      customDomain: tenant.customDomain ?? null,
      status: tenant.status,
      plan: tenant.plan,
      dbHost: tenant.dbConfig.host,
      dbName: tenant.dbConfig.databaseName,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}

export const tenantRegistry = new TenantRegistry();
export default tenantRegistry;