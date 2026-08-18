/**
 * lib/provisioning/drivers/MongoDatabaseProvisioner.ts
 *
 * AWM-ERP — MongoDB Tenant Database Provisioner
 * (মূল lib/provisioning/DatabaseProvisioner.ts থেকে অপরিবর্তিত লজিক)
 */

import type {
  CompanyDetails,
  DBSelectionOptions,
  TenantDBConfig,
  TenantIsolationStrategy,
} from '../../tenant/types';

import { TenantError } from '../../tenant/types';
import { getMongoClient } from '../../mongodb';
import type { TenantDatabaseProvisionerDriver } from './databaseProvisionerDriver';

interface MongoProvisioningConfig {
  uri: string;
  defaultDatabase: string;
  defaultHost: string;
  defaultPort: number;
  ssl: boolean;
}

function loadMongoProvisioningConfig(): MongoProvisioningConfig {
  const uri = process.env.MONGODB_URI ?? '';
  const defaultDatabase = process.env.MONGODB_DB_NAME ?? '';

  if (!uri) {
    throw new TenantError('TENANT_PROVISIONING_FAILED', 'MONGODB_URI environment variable পাওয়া যায়নি।');
  }
  if (!defaultDatabase) {
    throw new TenantError('TENANT_PROVISIONING_FAILED', 'MONGODB_DB_NAME environment variable পাওয়া যায়নি।');
  }

  const parsedPort = Number(process.env.MONGODB_PORT ?? 27017);

  return {
    uri,
    defaultDatabase,
    defaultHost: process.env.MONGODB_HOST ?? 'localhost',
    defaultPort: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 27017,
    ssl: (process.env.MONGODB_SSL ?? 'false').toLowerCase() === 'true',
  };
}

export class MongoDatabaseProvisioner implements TenantDatabaseProvisionerDriver {
  private readonly config: MongoProvisioningConfig;

  constructor(config: MongoProvisioningConfig = loadMongoProvisioningConfig()) {
    this.config = config;
  }

  public async createTenantDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    if (dbSelection.provider !== 'mongodb') {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `এই Provisioner শুধুমাত্র 'mongodb' provider সাপোর্ট করে, পাওয়া গেছে: '${dbSelection.provider}'।`
      );
    }

    switch (dbSelection.isolationStrategy) {
      case 'database-per-tenant':
        return this.createDedicatedDatabase(companyDetails, dbSelection);
      case 'shared-database':
        return this.useSharedDatabase(companyDetails, dbSelection, 'shared-database');
      case 'schema-per-tenant':
        return this.createTenantNamespace(companyDetails, dbSelection);
      case 'shared-schema':
        return this.useSharedDatabase(companyDetails, dbSelection, 'shared-schema');
      default: {
        const exhaustiveCheck: never = dbSelection.isolationStrategy;
        throw new TenantError('TENANT_PROVISIONING_FAILED', `অজানা isolation strategy: ${String(exhaustiveCheck)}`);
      }
    }
  }

  public async dropTenantDatabase(
    dbConfig: TenantDBConfig,
    isolationStrategy: TenantIsolationStrategy
  ): Promise<void> {
    switch (isolationStrategy) {
      case 'database-per-tenant':
        await this.dropDedicatedDatabase(dbConfig);
        return;
      case 'schema-per-tenant':
      case 'shared-database':
      case 'shared-schema':
        await this.removeTenantMetadata(dbConfig);
        return;
      default: {
        const exhaustiveCheck: never = isolationStrategy;
        void exhaustiveCheck;
        return;
      }
    }
  }

  private async createDedicatedDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    const databaseName = this.buildTenantDatabaseName(companyDetails.slug);

    try {
      const client = await getMongoClient();
      const db = client.db(databaseName);

      await db.collection('_tenant_metadata').updateOne(
        { tenantSlug: companyDetails.slug },
        {
          $set: {
            tenantSlug: companyDetails.slug,
            tenantName: companyDetails.name,
            provisionedAt: new Date(),
            isolationStrategy: 'database-per-tenant',
          },
        },
        { upsert: true }
      );

      return this.buildTenantDbConfig(databaseName, dbSelection, {
        tenantSlug: companyDetails.slug,
        isolationStrategy: 'database-per-tenant',
      });
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `MongoDB tenant database "${databaseName}" তৈরি করা যায়নি।`,
        undefined,
        error
      );
    }
  }

  private async createTenantNamespace(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    try {
      const client = await getMongoClient();
      const databaseName = dbSelection.databaseName ?? this.config.defaultDatabase;
      const namespace = this.buildTenantNamespace(companyDetails.slug);
      const db = client.db(databaseName);

      await db.collection('_tenant_metadata').updateOne(
        { tenantSlug: companyDetails.slug },
        {
          $set: {
            tenantSlug: companyDetails.slug,
            tenantName: companyDetails.name,
            namespace,
            provisionedAt: new Date(),
            isolationStrategy: 'schema-per-tenant',
          },
        },
        { upsert: true }
      );

      return this.buildTenantDbConfig(databaseName, dbSelection, {
        tenantSlug: companyDetails.slug,
        tenantNamespace: namespace,
        isolationStrategy: 'schema-per-tenant',
      });
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `MongoDB tenant namespace "${companyDetails.slug}" তৈরি করা যায়নি।`,
        undefined,
        error
      );
    }
  }

  private async useSharedDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions,
    mode: 'shared-database' | 'shared-schema'
  ): Promise<TenantDBConfig> {
    try {
      const client = await getMongoClient();
      const databaseName = dbSelection.databaseName ?? this.config.defaultDatabase;
      const db = client.db(databaseName);

      await db.collection('_tenant_metadata').updateOne(
        { tenantSlug: companyDetails.slug },
        {
          $set: {
            tenantSlug: companyDetails.slug,
            tenantName: companyDetails.name,
            provisionedAt: new Date(),
            isolationStrategy: mode,
            tenantId: companyDetails.slug,
          },
        },
        { upsert: true }
      );

      return this.buildTenantDbConfig(databaseName, dbSelection, {
        tenantSlug: companyDetails.slug,
        tenantScopeIdentifier: companyDetails.slug,
        tenantIdField: 'tenantId',
        isolationStrategy: mode,
      });
    } catch (error: unknown) {
      throw new TenantError('TENANT_PROVISIONING_FAILED', 'Shared MongoDB database initialize করা যায়নি।', undefined, error);
    }
  }

  private buildTenantDbConfig(
    databaseName: string,
    dbSelection: DBSelectionOptions,
    extra: Record<string, unknown>
  ): TenantDBConfig {
    return {
      provider: 'mongodb',
      host: dbSelection.preferredHost ?? this.config.defaultHost,
      port: this.config.defaultPort,
      databaseName,
      username: process.env.MONGODB_USERNAME ?? '',
      password: process.env.MONGODB_PASSWORD ?? '',
      ssl: this.config.ssl,
      connectionLimit: 50,
      connectionTimeoutMs: 10_000,
      idleTimeoutMs: 45_000,
      extra,
    };
  }

  private async dropDedicatedDatabase(dbConfig: TenantDBConfig): Promise<void> {
    try {
      const client = await getMongoClient();
      const db = client.db(dbConfig.databaseName);
      await db.dropDatabase();
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Rollback-এর সময় MongoDB database "${dbConfig.databaseName}" drop করা যায়নি।`,
        undefined,
        error
      );
    }
  }

  private async removeTenantMetadata(dbConfig: TenantDBConfig): Promise<void> {
    try {
      const client = await getMongoClient();
      const db = client.db(dbConfig.databaseName);
      const tenantSlug = typeof dbConfig.extra?.tenantSlug === 'string' ? dbConfig.extra.tenantSlug : undefined;
      if (!tenantSlug) return;
      await db.collection('_tenant_metadata').deleteOne({ tenantSlug });
    } catch (error: unknown) {
      throw new TenantError('TENANT_PROVISIONING_FAILED', 'Tenant metadata rollback করা যায়নি।', undefined, error);
    }
  }

  private buildTenantDatabaseName(slug: string): string {
    return `awm_tenant_${this.sanitizeSlug(slug)}`;
  }

  private buildTenantNamespace(slug: string): string {
    return `tenant_${this.sanitizeSlug(slug)}`;
  }

  private sanitizeSlug(slug: string): string {
    const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if (!safeSlug) {
      throw new TenantError('TENANT_INVALID_REQUEST', 'Tenant slug থেকে valid MongoDB identifier তৈরি করা যায়নি।');
    }
    return safeSlug;
  }
}