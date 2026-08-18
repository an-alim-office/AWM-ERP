/**
 * database/tenants/drivers/PostgresRegistryDriver.ts
 *
 * AWM-ERP — PostgreSQL Master Registry Driver
 * (মূল database/tenants/MasterRegistry.ts থেকে extract করা)
 *
 * EXPECTED MASTER DB SCHEMA (PostgreSQL):
 *
 *   CREATE TABLE tenants (
 *     id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     slug               VARCHAR(63)  NOT NULL UNIQUE,
 *     custom_domain      VARCHAR(255) UNIQUE,
 *     name               VARCHAR(255) NOT NULL,
 *     status             VARCHAR(20)  NOT NULL DEFAULT 'pending',
 *     plan               VARCHAR(20)  NOT NULL DEFAULT 'free',
 *     isolation_strategy VARCHAR(30)  NOT NULL DEFAULT 'database-per-tenant',
 *     db_config          JSONB        NOT NULL,
 *     contact            JSONB        NOT NULL,
 *     billing            JSONB,
 *     limits             JSONB,
 *     metadata           JSONB,
 *     created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 *     updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
 *     suspended_at       TIMESTAMPTZ,
 *     archived_at        TIMESTAMPTZ
 *   );
 *
 *   CREATE INDEX idx_tenants_slug   ON tenants (slug);
 *   CREATE INDEX idx_tenants_domain ON tenants (custom_domain);
 *   CREATE INDEX idx_tenants_status ON tenants (status);
 *
 * DEPENDENCY: npm install pg  &&  npm install -D @types/pg
 */

import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import {
  Tenant,
  TenantStatus,
  TenantPlan,
  TenantDBConfig,
  TenantIsolationStrategy,
  TenantContactInfo,
  TenantBillingInfo,
  TenantLimits,
  ProvisioningPayload,
  ProvisioningResult,
  ProvisioningStep,
  ProvisioningError,
  MasterRegistryEntry,
  MasterRegistryQueryOptions,
  TenantError,
} from '../../../lib/tenant/types';
import type {
  TenantRegistryDriver,
  RegistryListResult,
  RegistryHealth,
} from '../../../lib/db/registryDriver';

interface TenantRow extends QueryResultRow {
  id: string;
  slug: string;
  custom_domain: string | null;
  name: string;
  status: TenantStatus;
  plan: TenantPlan;
  isolation_strategy: TenantIsolationStrategy;
  db_config: TenantDBConfig;
  contact: TenantContactInfo;
  billing: TenantBillingInfo | null;
  limits: TenantLimits | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  suspended_at: Date | null;
  archived_at: Date | null;
}

interface TenantListRow extends QueryResultRow {
  id: string;
  slug: string;
  custom_domain: string | null;
  status: TenantStatus;
  plan: TenantPlan;
  db_config: TenantDBConfig;
  created_at: Date;
  updated_at: Date;
}

function normalizeLookup(value: string): string {
  return value.trim().toLowerCase();
}

function mapRowToTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    customDomain: row.custom_domain,
    name: row.name,
    status: row.status,
    plan: row.plan,
    isolationStrategy: row.isolation_strategy,
    dbConfig: row.db_config,
    contact: row.contact,
    billing: row.billing ?? undefined,
    limits: row.limits ?? undefined,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    suspendedAt: row.suspended_at,
    archivedAt: row.archived_at,
  };
}

export class PostgresRegistryDriver implements TenantRegistryDriver {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.MASTER_DB_HOST,
      port: Number(process.env.MASTER_DB_PORT ?? 5432),
      database: process.env.MASTER_DB_NAME,
      user: process.env.MASTER_DB_USER,
      password: process.env.MASTER_DB_PASSWORD,
      ssl: process.env.MASTER_DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.MASTER_DB_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    this.pool.on('error', (err) => {
      console.error('[PostgresRegistryDriver] Unexpected idle client error:', err);
    });
  }

  private async query<T extends QueryResultRow>(
    text: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(text, params);
    } catch (error) {
      throw new TenantError(
        'TENANT_DB_CONNECTION_FAILED',
        `Master registry query failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        { query: text }
      );
    }
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(slug);
    if (!normalized) return null;

    const result = await this.query<TenantRow>(
      `SELECT * FROM tenants WHERE slug = $1 LIMIT 1`,
      [normalized]
    );

    return result.rowCount === 0 ? null : mapRowToTenant(result.rows[0]);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(domain);
    if (!normalized) return null;

    const result = await this.query<TenantRow>(
      `SELECT * FROM tenants WHERE custom_domain = $1 LIMIT 1`,
      [normalized]
    );

    return result.rowCount === 0 ? null : mapRowToTenant(result.rows[0]);
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    const normalized = normalizeLookup(id);
    if (!normalized) return null;

    const result = await this.query<TenantRow>(
      `SELECT * FROM tenants WHERE id = $1 LIMIT 1`,
      [normalized]
    );

    return result.rowCount === 0 ? null : mapRowToTenant(result.rows[0]);
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

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (plan) {
      params.push(plan);
      conditions.push(`plan = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortColumnMap: Record<NonNullable<MasterRegistryQueryOptions['sortBy']>, string> = {
      createdAt: 'created_at',
      name: 'name',
      status: 'status',
    };
    const sortColumn = sortColumnMap[sortBy] ?? 'created_at';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const safePage = Math.max(1, page);
    const safePageSize = Math.min(Math.max(1, pageSize), 200);
    const offset = (safePage - 1) * safePageSize;

    const countResult = await this.query<{ count: string } & QueryResultRow>(
      `SELECT COUNT(*)::text AS count FROM tenants ${whereClause}`,
      params
    );
    const totalItems = Number(countResult.rows[0]?.count ?? 0);

    const dataParams = [...params, safePageSize, offset];
    const dataResult = await this.query<TenantListRow>(
      `SELECT id, slug, custom_domain, status, plan, db_config, created_at, updated_at
       FROM tenants
       ${whereClause}
       ORDER BY ${sortColumn} ${direction}
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    const entries: MasterRegistryEntry[] = dataResult.rows.map((row) => ({
      tenantId: row.id,
      slug: row.slug,
      customDomain: row.custom_domain,
      status: row.status,
      plan: row.plan,
      dbHost: row.db_config.host,
      dbName: row.db_config.databaseName,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { entries, totalItems, page: safePage, pageSize: safePageSize };
  }

  async registerTenant(data: ProvisioningPayload): Promise<ProvisioningResult> {
    const startedAt = Date.now();
    const completedSteps: ProvisioningStep[] = [];
    const errors: ProvisioningError[] = [];
    const slug = normalizeLookup(data.companyDetails.slug);

    if (!slug) {
      return {
        success: false,
        slug: '',
        completedSteps,
        errors: [
          {
            step: 'validating',
            code: 'TENANT_PROVISIONING_FAILED',
            message: 'Company slug is required.',
          },
        ],
        durationMs: 0,
      };
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const existing = await client.query<{ id: string } & QueryResultRow>(
        `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
        [slug]
      );

      if ((existing.rowCount ?? 0) > 0) {
        throw new TenantError('TENANT_SLUG_TAKEN', `Slug "${slug}" is already in use.`);
      }
      completedSteps.push('validating');

      const dbConfig = this.buildInitialDBConfig(data, slug);
      const contact: TenantContactInfo = {
        ownerName: data.adminUser.fullName,
        email: data.adminUser.email,
        phone: data.adminUser.phone,
      };

      const insertResult = await client.query<TenantRow>(
        `INSERT INTO tenants (
           slug, custom_domain, name, status, plan, isolation_strategy,
           db_config, contact, billing, limits, metadata,
           created_at, updated_at
         ) VALUES (
           $1, NULL, $2, 'pending', $3, $4,
           $5::jsonb, $6::jsonb, NULL, NULL, NULL,
           NOW(), NOW()
         )
         RETURNING *`,
        [
          slug,
          data.companyDetails.name,
          data.plan,
          data.dbSelection.isolationStrategy,
          JSON.stringify(dbConfig),
          JSON.stringify(contact),
        ]
      );

      await client.query('COMMIT');
      completedSteps.push('registering-tenant');

      const tenant = mapRowToTenant(insertResult.rows[0]);

      return {
        success: true,
        tenantId: tenant.id,
        slug: tenant.slug,
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
      await client.query('ROLLBACK').catch(() => undefined);

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
        slug,
        completedSteps,
        errors,
        durationMs: Date.now() - startedAt,
      };
    } finally {
      client.release();
    }
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const normalized = normalizeLookup(id);
    if (!normalized) throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to update status.');

    const setClauses = ['status = $2', 'updated_at = NOW()'];
    if (status === 'suspended') setClauses.push('suspended_at = NOW()');
    else if (status === 'archived') setClauses.push('archived_at = NOW()');
    else if (status === 'active') setClauses.push('suspended_at = NULL', 'archived_at = NULL');

    const result = await this.query<TenantRow>(
      `UPDATE tenants SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      [normalized, status]
    );

    if (result.rowCount === 0) throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
    return mapRowToTenant(result.rows[0]);
  }

  async updateTenantDBConfig(id: string, dbConfig: TenantDBConfig): Promise<Tenant> {
    const normalized = normalizeLookup(id);
    if (!normalized) throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to update its DB config.');

    const result = await this.query<TenantRow>(
      `UPDATE tenants SET db_config = $2::jsonb, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [normalized, JSON.stringify(dbConfig)]
    );

    if (result.rowCount === 0) throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
    return mapRowToTenant(result.rows[0]);
  }

  async deleteTenant(id: string): Promise<void> {
    const normalized = normalizeLookup(id);
    if (!normalized) throw new TenantError('TENANT_NOT_FOUND', 'A tenant id is required to delete a tenant.');

    const result = await this.query(`DELETE FROM tenants WHERE id = $1`, [normalized]);
    if (result.rowCount === 0) throw new TenantError('TENANT_NOT_FOUND', `No tenant found with id "${id}".`, id);
  }

  async healthCheck(): Promise<RegistryHealth> {
    const start = Date.now();
    try {
      await this.pool.query('SELECT 1');
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  async shutdown(): Promise<void> {
    await this.pool.end();
  }

  private buildInitialDBConfig(payload: ProvisioningPayload, slug: string): TenantDBConfig {
    const databaseName = `tenant_${slug.replace(/[^a-z0-9_]/g, '_')}`;

    return {
      provider: payload.dbSelection.provider,
      host: payload.dbSelection.preferredHost ?? process.env.TENANT_DB_DEFAULT_HOST ?? 'localhost',
      port: Number(process.env.TENANT_DB_DEFAULT_PORT ?? 5432),
      databaseName,
      username: process.env.TENANT_DB_DEFAULT_USER ?? 'awm_tenant_admin',
      password: process.env.TENANT_DB_DEFAULT_PASSWORD ?? '',
      ssl: process.env.TENANT_DB_DEFAULT_SSL === 'true',
      connectionLimit: Number(process.env.TENANT_DB_DEFAULT_CONN_LIMIT ?? 5),
    };
  }
}