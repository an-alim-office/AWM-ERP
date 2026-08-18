/**
 * lib/provisioning/drivers/PostgresDatabaseProvisioner.ts
 *
 * AWM-ERP — PostgreSQL Tenant Database Provisioner
 *
 * Pluggable TenantDatabaseProvisionerDriver implementation.
 *
 * Supported isolation modes:
 * 1. database-per-tenant
 * 2. schema-per-tenant
 * 3. shared-database
 * 4. shared-schema (backward compatible alias)
 *
 * IMPORTANT:
 * - database-per-tenant requires MASTER_DB_* privileges.
 * - Generated tenant passwords are returned only in TenantDBConfig.
 * - PostgreSQL-only SQL helpers are kept local to this driver so this file
 *   does not depend on missing utils.ts exports.
 */

import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';

import type {
  CompanyDetails,
  DBSelectionOptions,
  TenantDBConfig,
  TenantIsolationStrategy,
} from '../../tenant/types';

import { TenantError } from '../../tenant/types';

import type {
  TenantDatabaseProvisionerDriver,
} from './databaseProvisionerDriver';

// ============================================================================
// Configuration
// ============================================================================

interface PostgresProvisioningConfig {
  host: string;
  port: number;
  adminDatabase: string;
  adminUser: string;
  adminPassword: string;
  ssl: boolean;
}

function loadPostgresProvisioningConfig(): PostgresProvisioningConfig {
  const host = process.env.MASTER_DB_HOST ?? '';
  const adminUser = process.env.MASTER_DB_USER ?? '';

  if (!host || !adminUser) {
    throw new TenantError(
      'TENANT_PROVISIONING_FAILED',
      'PostgreSQL provisioning-এর জন্য MASTER_DB_HOST / MASTER_DB_USER environment variable পাওয়া যায়নি।'
    );
  }

  const parsedPort = Number(process.env.MASTER_DB_PORT ?? 5432);

  return {
    host,
    port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5432,
    adminDatabase: process.env.MASTER_DB_NAME ?? 'postgres',
    adminUser,
    adminPassword: process.env.MASTER_DB_PASSWORD ?? '',
    ssl: process.env.MASTER_DB_SSL === 'true',
  };
}

// ============================================================================
// PostgreSQL SQL helpers
// ============================================================================

function buildSafeIdentifier(value: string): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!safe) {
    throw new TenantError(
      'TENANT_INVALID_REQUEST',
      'Valid PostgreSQL identifier তৈরি করা যায়নি।'
    );
  }

  // PostgreSQL identifiers are limited to NAMEDATALEN-1 bytes (normally 63).
  return safe.slice(0, 63);
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function generateSecurePassword(): string {
  // URL-safe password: no quotes or whitespace, suitable for SQL literal.
  return randomBytes(32).toString('base64url');
}

// ============================================================================
// Driver
// ============================================================================

export class PostgresDatabaseProvisioner
  implements TenantDatabaseProvisionerDriver
{
  private readonly config: PostgresProvisioningConfig;
  private adminPool: Pool | null = null;

  constructor(
    config: PostgresProvisioningConfig = loadPostgresProvisioningConfig()
  ) {
    this.config = config;
  }

  private getAdminPool(): Pool {
    if (!this.adminPool) {
      this.adminPool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.adminDatabase,
        user: this.config.adminUser,
        password: this.config.adminPassword,
        ssl: this.config.ssl
          ? { rejectUnauthorized: false }
          : undefined,
        max: 5,
      });

      this.adminPool.on('error', (error) => {
        console.error(
          '[PostgresDatabaseProvisioner] Unexpected admin pool error:',
          error
        );
      });
    }

    return this.adminPool;
  }

  // ==========================================================================
  // Create
  // ==========================================================================

  public async createTenantDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    if (dbSelection.provider !== 'postgresql') {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `PostgresDatabaseProvisioner শুধুমাত্র 'postgresql' provider সাপোর্ট করে, পাওয়া গেছে: '${dbSelection.provider}'।`
      );
    }

    switch (dbSelection.isolationStrategy) {
      case 'database-per-tenant':
        return this.createDedicatedDatabase(companyDetails, dbSelection);

      case 'schema-per-tenant':
        return this.createTenantSchema(companyDetails, dbSelection);

      case 'shared-database':
      case 'shared-schema':
        return this.useSharedDatabase(companyDetails, dbSelection);

      default: {
        const exhaustiveCheck: never =
          dbSelection.isolationStrategy;

        throw new TenantError(
          'TENANT_PROVISIONING_FAILED',
          `অজানা isolation strategy: ${String(exhaustiveCheck)}`
        );
      }
    }
  }

  // ==========================================================================
  // Drop / Rollback
  // ==========================================================================

  public async dropTenantDatabase(
    dbConfig: TenantDBConfig,
    isolationStrategy: TenantIsolationStrategy
  ): Promise<void> {
    if (dbConfig.provider !== 'postgresql') {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `PostgresDatabaseProvisioner শুধুমাত্র 'postgresql' provider-এর config গ্রহণ করে, পাওয়া গেছে: '${dbConfig.provider}'।`
      );
    }

    switch (isolationStrategy) {
      case 'database-per-tenant':
        await this.dropDedicatedDatabase(dbConfig);
        return;

      case 'schema-per-tenant':
        await this.dropTenantSchema(dbConfig);
        return;

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

  // ==========================================================================
  // database-per-tenant
  // ==========================================================================

  private async createDedicatedDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    const safeSlug = this.sanitizeSlug(companyDetails.slug);
    const databaseName = buildSafeIdentifier(`awm_tenant_${safeSlug}`);
    const roleName = buildSafeIdentifier(`awm_role_${safeSlug}`);
    const password = generateSecurePassword();

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      const roleExists = await client.query(
        'SELECT 1 FROM pg_roles WHERE rolname = $1',
        [roleName]
      );

      if ((roleExists.rowCount ?? 0) === 0) {
        await client.query(
          `CREATE ROLE ${quoteIdentifier(roleName)} LOGIN PASSWORD ${quoteLiteral(password)}`
        );
      } else {
        await client.query(
          `ALTER ROLE ${quoteIdentifier(roleName)} WITH LOGIN PASSWORD ${quoteLiteral(password)}`
        );
      }

      const dbExists = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [databaseName]
      );

      if ((dbExists.rowCount ?? 0) === 0) {
        await client.query(
          `CREATE DATABASE ${quoteIdentifier(databaseName)} OWNER ${quoteIdentifier(roleName)}`
        );
      }

      await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${quoteIdentifier(databaseName)} TO ${quoteIdentifier(roleName)}`
      );

      return {
        provider: 'postgresql',
        host: dbSelection.preferredHost ?? this.config.host,
        port: this.config.port,
        databaseName,
        username: roleName,
        password,
        ssl: this.config.ssl,
        connectionLimit: 20,
        connectionTimeoutMs: 10_000,
        idleTimeoutMs: 45_000,
        extra: {
          tenantSlug: companyDetails.slug,
          isolationStrategy: 'database-per-tenant',
        },
      };
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Dedicated PostgreSQL database "${databaseName}" তৈরি করা যায়নি।`,
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  private async dropDedicatedDatabase(
    dbConfig: TenantDBConfig
  ): Promise<void> {
    const databaseName = dbConfig.databaseName;

    if (!databaseName.startsWith('awm_tenant_')) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Refusing to drop non-tenant PostgreSQL database "${databaseName}".`
      );
    }

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      await client.query(
        `SELECT pg_terminate_backend(pid)
         FROM pg_stat_activity
         WHERE datname = $1
           AND pid <> pg_backend_pid()`,
        [databaseName]
      );

      await client.query(
        `DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`
      );

      if (dbConfig.username) {
        await client.query(
          `DROP ROLE IF EXISTS ${quoteIdentifier(dbConfig.username)}`
        );
      }
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Rollback-এর সময় PostgreSQL database "${databaseName}" drop করা যায়নি।`,
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // schema-per-tenant
  // ==========================================================================

  private async createTenantSchema(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    const safeSlug = this.sanitizeSlug(companyDetails.slug);
    const schemaName = buildSafeIdentifier(`tenant_${safeSlug}`);
    const databaseName =
      dbSelection.databaseName ?? this.config.adminDatabase;

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      await client.query(
        `CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schemaName)}`
      );

      return {
        provider: 'postgresql',
        host: dbSelection.preferredHost ?? this.config.host,
        port: this.config.port,
        databaseName,
        username: this.config.adminUser,
        password: '',
        ssl: this.config.ssl,
        connectionLimit: 20,
        connectionTimeoutMs: 10_000,
        idleTimeoutMs: 45_000,
        schema: schemaName,
        extra: {
          tenantSlug: companyDetails.slug,
          isolationStrategy: 'schema-per-tenant',
        },
      };
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `PostgreSQL schema "${schemaName}" তৈরি করা যায়নি।`,
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  private async dropTenantSchema(
    dbConfig: TenantDBConfig
  ): Promise<void> {
    if (!dbConfig.schema) return;

    const schemaName = dbConfig.schema;

    if (!schemaName.startsWith('tenant_')) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Refusing to drop non-tenant PostgreSQL schema "${schemaName}".`
      );
    }

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      await client.query(
        `DROP SCHEMA IF EXISTS ${quoteIdentifier(schemaName)} CASCADE`
      );
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `Rollback-এর সময় PostgreSQL schema "${schemaName}" drop করা যায়নি।`,
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // shared-database / shared-schema
  // ==========================================================================

  private async useSharedDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions
  ): Promise<TenantDBConfig> {
    const databaseName =
      dbSelection.databaseName ?? this.config.adminDatabase;

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS _tenant_metadata (
          tenant_slug TEXT PRIMARY KEY,
          tenant_name TEXT NOT NULL,
          isolation_strategy TEXT NOT NULL,
          provisioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(
        `INSERT INTO _tenant_metadata
           (tenant_slug, tenant_name, isolation_strategy)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_slug)
         DO UPDATE SET
           tenant_name = EXCLUDED.tenant_name,
           isolation_strategy = EXCLUDED.isolation_strategy`,
        [
          companyDetails.slug,
          companyDetails.name,
          dbSelection.isolationStrategy,
        ]
      );

      return {
        provider: 'postgresql',
        host: dbSelection.preferredHost ?? this.config.host,
        port: this.config.port,
        databaseName,
        username: this.config.adminUser,
        password: '',
        ssl: this.config.ssl,
        connectionLimit: 20,
        connectionTimeoutMs: 10_000,
        idleTimeoutMs: 45_000,
        extra: {
          tenantSlug: companyDetails.slug,
          tenantScopeIdentifier: companyDetails.slug,
          tenantIdField: 'tenant_id',
          isolationStrategy: dbSelection.isolationStrategy,
        },
      };
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        'Shared PostgreSQL tenant metadata initialize করা যায়নি।',
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  private async removeTenantMetadata(
    dbConfig: TenantDBConfig
  ): Promise<void> {
    const tenantSlug =
      typeof dbConfig.extra?.tenantSlug === 'string'
        ? dbConfig.extra.tenantSlug
        : undefined;

    if (!tenantSlug) return;

    const pool = this.getAdminPool();
    const client = await pool.connect();

    try {
      await client.query(
        `DELETE FROM _tenant_metadata WHERE tenant_slug = $1`,
        [tenantSlug]
      );
    } catch (error: unknown) {
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        'Tenant metadata rollback করা যায়নি।',
        undefined,
        error
      );
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private sanitizeSlug(slug: string): string {
    const safe = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!safe) {
      throw new TenantError(
        'TENANT_INVALID_REQUEST',
        'Tenant slug থেকে valid PostgreSQL identifier তৈরি করা যায়নি।'
      );
    }

    return safe;
  }
}

export default PostgresDatabaseProvisioner;