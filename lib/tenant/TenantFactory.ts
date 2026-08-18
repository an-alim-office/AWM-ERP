/**
 * lib/tenant/TenantFactory.ts
 *
 * AWM-ERP — Multi-Tenant Architecture — Tenant Factory
 *
 * MongoDB-first tenant factory.
 */

import crypto from 'crypto';

import {
  Tenant,
  PublicTenant,
  TenantDBConfig,
  DBSelectionOptions,
  ProvisioningPayload,
  TenantPlan,
  TENANT_PLAN_DEFAULT_LIMITS,
} from './types';

import {
  TenantConfig,
  PROVIDER_DEFAULT_PORTS,
} from './TenantConfig';

const DB_NAME_PREFIX = 'awm_tenant_';
const TENANT_NAMESPACE_PREFIX = 'tenant_';

export class TenantFactory {
  static createTenantId(): string {
    return crypto.randomUUID();
  }

  static generateSecurePassword(length = 24): string {
    if (!Number.isInteger(length) || length < 16) {
      throw new Error(
        'Secure password length must be an integer greater than or equal to 16.',
      );
    }

    return crypto
      .randomBytes(Math.ceil((length * 3) / 4))
      .toString('base64url')
      .slice(0, length);
  }

  static normalizeSlug(slug: string): string {
    const normalized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!normalized) {
      throw new Error(
        'Tenant slug cannot be empty after normalization.',
      );
    }

    return normalized;
  }

  static buildDatabaseName(slug: string): string {
    const safeSlug = this.normalizeSlug(slug);
    return `${DB_NAME_PREFIX}${safeSlug}`;
  }

  static buildTenantNamespace(slug: string): string {
    const safeSlug = this.normalizeSlug(slug);
    return `${TENANT_NAMESPACE_PREFIX}${safeSlug}`;
  }

  static getSharedDatabaseName(
    dbSelection?: DBSelectionOptions,
  ): string {
    return (
      dbSelection?.databaseName ??
      TenantConfig.mongodb.databaseName
    );
  }

  static buildDbConfig(
    slug: string,
    dbSelection?: DBSelectionOptions,
  ): TenantDBConfig {
    const provider =
      dbSelection?.provider ??
      TenantConfig.defaultProvider;

    const isolationStrategy =
      dbSelection?.isolationStrategy ??
      TenantConfig.defaultIsolationStrategy;

    const safeSlug = this.normalizeSlug(slug);
    const isMongoDB = provider === 'mongodb';

    let databaseName: string;

    if (isMongoDB && isolationStrategy === 'shared-database') {
      databaseName = this.getSharedDatabaseName(dbSelection);
    } else if (
      isMongoDB &&
      isolationStrategy === 'database-per-tenant'
    ) {
      databaseName = this.buildDatabaseName(safeSlug);
    } else {
      databaseName =
        dbSelection?.databaseName ??
        this.buildDatabaseName(safeSlug);
    }

    const host =
      dbSelection?.preferredHost ??
      TenantConfig.master.host;

    const port =
      PROVIDER_DEFAULT_PORTS[provider] ??
      TenantConfig.master.port;

    const extra: Record<string, unknown> = {
      tenantIdField: TenantConfig.mongodb.tenantIdField,
      databaseMode: isolationStrategy,
      tenantSlug: safeSlug,
    };

    if (
      isMongoDB &&
      isolationStrategy === 'shared-database'
    ) {
      extra.tenantScopeIdentifier = safeSlug;
      extra.sharedDatabase = true;
    }

    if (
      isMongoDB &&
      isolationStrategy === 'schema-per-tenant'
    ) {
      extra.tenantNamespace =
        this.buildTenantNamespace(safeSlug);
      extra.mongodbSchemaEquivalent =
        'collection-namespace';
    }

    if (
      isMongoDB &&
      isolationStrategy === 'database-per-tenant'
    ) {
      extra.dedicatedDatabase = true;
    }

    const schema =
      isolationStrategy === 'schema-per-tenant'
        ? this.buildTenantNamespace(safeSlug)
        : undefined;

    return {
      provider,
      host,
      port,
      databaseName,
      username: '',
      password: '',
      ssl: TenantConfig.master.ssl,
      connectionLimit: TenantConfig.connection.limit,
      connectionTimeoutMs: TenantConfig.connection.timeoutMs,
      idleTimeoutMs: TenantConfig.connection.idleTimeoutMs,
      schema,
      poolMin: TenantConfig.mongodb.minPoolSize,
      poolMax: TenantConfig.mongodb.maxPoolSize,
      extra,
    };
  }

  static buildTenant(
    payload: ProvisioningPayload,
    id: string = this.createTenantId(),
  ): Tenant {
    const now = new Date();

    const {
      companyDetails,
      adminUser,
      plan,
      dbSelection,
    } = payload;

    const tenantSlug =
      this.normalizeSlug(companyDetails.slug);

    const effectiveDbSelection: DBSelectionOptions = {
      provider:
        dbSelection?.provider ??
        TenantConfig.defaultProvider,
      isolationStrategy:
        dbSelection?.isolationStrategy ??
        TenantConfig.defaultIsolationStrategy,
      region: dbSelection?.region,
      preferredHost: dbSelection?.preferredHost,
      databaseName: dbSelection?.databaseName,
    };

    const dbConfig =
      this.buildDbConfig(
        tenantSlug,
        effectiveDbSelection,
      );

    const limits =
      TENANT_PLAN_DEFAULT_LIMITS[
        plan as TenantPlan
      ];

    return {
      id,
      slug: tenantSlug,
      customDomain: null,
      name: companyDetails.name.trim(),
      status: 'pending',
      plan,
      isolationStrategy:
        effectiveDbSelection.isolationStrategy,
      dbConfig,
      contact: {
        ownerName: adminUser.fullName.trim(),
        email: adminUser.email.trim().toLowerCase(),
        phone: adminUser.phone,
      },
      billing: {
        trialEndsAt:
          plan === 'free'
            ? null
            : this.addDays(now, 14),
        subscriptionId: null,
        nextBillingDate: null,
      },
      limits,
      metadata: {
        industry:
          companyDetails.industry,
        companySize:
          companyDetails.companySize,
        country:
          companyDetails.country,
        timezone:
          companyDetails.timezone,
        databaseProvider:
          effectiveDbSelection.provider,
        isolationStrategy:
          effectiveDbSelection.isolationStrategy,
        tenantIdField:
          TenantConfig.mongodb.tenantIdField,
      },
      createdAt: now,
      updatedAt: now,
      suspendedAt: null,
      archivedAt: null,
    };
  }

  static toPublicTenant(
    tenant: Tenant,
  ): PublicTenant {
    const {
      dbConfig,
      billing,
      ...rest
    } = tenant;

    return {
      ...rest,
      dbConfig: {
        provider: dbConfig.provider,
      },
    };
  }

  private static addDays(
    date: Date,
    days: number,
  ): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export default TenantFactory;