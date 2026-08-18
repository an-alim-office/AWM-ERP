/**
 * database/tenants/ConnectionPool.ts
 *
 * প্রতিটি টেন্যান্টের জন্য আলাদা PostgreSQL Connection Pool ক্যাশ ও ম্যানেজ করে।
 * এই মডিউলটি lib/tenant/types.ts-কে single source of truth হিসেবে ব্যবহার করে —
 * কোনো tenant শেপ এখানে পুনরায় ডিক্লেয়ার করা হয়নি।
 *
 * স্কোপ: Step 3-এর requirement অনুযায়ী এই রেজিস্ট্রি শুধুমাত্র
 * dbConfig.provider === 'postgresql' এমন টেন্যান্ট হ্যান্ডেল করে। অন্য কোনো
 * provider (mysql/mariadb/mssql/sqlite) পাস করা হলে TenantError থ্রো হবে।
 */

import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg";
import type {
  ConnectionPoolStats,
  Tenant,
  TenantConnectionPoolEntry,
  TenantDBConfig,
} from "../../lib/tenant/types";
import { TenantError } from "../../lib/tenant/types";

const DEFAULT_MAX_CONNECTIONS = Number(process.env.TENANT_DB_POOL_MAX ?? 10);
const DEFAULT_MIN_CONNECTIONS = Number(process.env.TENANT_DB_POOL_MIN ?? 0);
const DEFAULT_IDLE_TIMEOUT_MS = Number(process.env.TENANT_DB_IDLE_TIMEOUT_MS ?? 30_000);
const DEFAULT_CONNECTION_TIMEOUT_MS = Number(process.env.TENANT_DB_CONN_TIMEOUT_MS ?? 5_000);
const POOL_REAP_AFTER_MS = Number(process.env.TENANT_DB_POOL_REAP_MS ?? 30 * 60 * 1000);
const REAP_SWEEP_INTERVAL_MS = Number(process.env.TENANT_DB_REAP_INTERVAL_MS ?? 5 * 60 * 1000);

interface InternalPoolRecord {
  pool: Pool;
  entry: TenantConnectionPoolEntry;
}

function normalizeTenantId(value: string): string {
  return value.trim();
}

export class TenantConnectionPoolRegistry {
  private readonly records: Map<string, InternalPoolRecord> = new Map();
  private reapTimer: ReturnType<typeof setInterval> | null = null;
  private isShuttingDown = false;

  constructor() {
    this.startReapSweep();
  }

  public getOrCreatePool(tenant: Tenant): Pool {
    if (this.isShuttingDown) {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        "ConnectionPool registry শাটডাউন প্রক্রিয়ায় আছে, নতুন পুল তৈরি করা যাবে না।",
        tenant.id
      );
    }

    if (tenant.dbConfig.provider !== "postgresql") {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        `এই ConnectionPool শুধুমাত্র 'postgresql' provider সাপোর্ট করে, পাওয়া গেছে: '${tenant.dbConfig.provider}'।`,
        tenant.id
      );
    }

    const tenantId = normalizeTenantId(tenant.id);
    const existing = this.records.get(tenantId);
    if (existing) {
      existing.entry.lastUsedAt = new Date();
      existing.entry.activeConnections = existing.pool.totalCount - existing.pool.idleCount;
      return existing.pool;
    }

    const record = this.createRecord(tenant);
    this.records.set(tenantId, record);
    return record.pool;
  }

  public getPoolIfExists(tenantId: string): Pool | undefined {
    return this.records.get(normalizeTenantId(tenantId))?.pool;
  }

  public async closePool(tenantId: string): Promise<void> {
    const normalized = normalizeTenantId(tenantId);
    const record = this.records.get(normalized);
    if (!record) {
      return;
    }

    this.records.delete(normalized);

    try {
      await record.pool.end();
    } catch (err: unknown) {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        "কানেকশন পুল বন্ধ করার সময় সমস্যা হয়েছে।",
        normalized,
        err
      );
    }
  }

  public async closeAll(): Promise<void> {
    this.isShuttingDown = true;
    this.stopReapSweep();

    const tenantIds = Array.from(this.records.keys());
    const results = await Promise.allSettled(
      tenantIds.map((tenantId) => this.closePool(tenantId))
    );

    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    if (failures.length > 0) {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        `${failures.length}টি টেন্যান্ট পুল বন্ধ করতে ব্যর্থ হয়েছে।`,
        undefined,
        failures.map((f) => f.reason)
      );
    }
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    tenantId: string,
    text: string,
    params?: ReadonlyArray<unknown>
  ): Promise<QueryResult<T>> {
    const normalized = normalizeTenantId(tenantId);
    const record = this.records.get(normalized);

    if (!record) {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        "এই টেন্যান্টের জন্য কোনো একটিভ কানেকশন পুল খুঁজে পাওয়া যায়নি।",
        normalized
      );
    }

    record.entry.lastUsedAt = new Date();

    try {
      const result = await record.pool.query<T>(text, params as unknown[] | undefined);
      record.entry.isHealthy = true;
      record.entry.activeConnections = record.pool.totalCount - record.pool.idleCount;
      return result;
    } catch (err: unknown) {
      record.entry.isHealthy = false;
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        `কোয়েরি এক্সিকিউশন ব্যর্থ: ${text.slice(0, 80)}`,
        normalized,
        err
      );
    }
  }

  public getStats(tenantId: string): TenantConnectionPoolEntry | undefined {
    const record = this.records.get(normalizeTenantId(tenantId));
    if (!record) return undefined;

    record.entry.activeConnections = record.pool.totalCount - record.pool.idleCount;
    return { ...record.entry };
  }

  public getAggregateStats(): ConnectionPoolStats {
    let totalActiveConnections = 0;
    let totalIdleConnections = 0;
    const unhealthyTenantIds: string[] = [];

    for (const [tenantId, record] of this.records.entries()) {
      const active = record.pool.totalCount - record.pool.idleCount;
      totalActiveConnections += active;
      totalIdleConnections += record.pool.idleCount;
      if (!record.entry.isHealthy) {
        unhealthyTenantIds.push(tenantId);
      }
    }

    return {
      totalPools: this.records.size,
      totalActiveConnections,
      totalIdleConnections,
      unhealthyTenantIds,
      generatedAt: new Date(),
    };
  }

  public getActiveTenantIds(): string[] {
    return Array.from(this.records.keys());
  }

  public hasPool(tenantId: string): boolean {
    return this.records.has(normalizeTenantId(tenantId));
  }

  private createRecord(tenant: Tenant): InternalPoolRecord {
    const dbConfig: TenantDBConfig = tenant.dbConfig;

    if (dbConfig.provider !== "postgresql") {
      throw new TenantError(
        "TENANT_DB_CONNECTION_FAILED",
        `এই ConnectionPool শুধুমাত্র 'postgresql' provider সাপোর্ট করে, পাওয়া গেছে: '${dbConfig.provider}'।`,
        tenant.id
      );
    }

    const pgConfig: PoolConfig = {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.databaseName,
      user: dbConfig.username,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
      max: dbConfig.poolMax ?? dbConfig.connectionLimit ?? DEFAULT_MAX_CONNECTIONS,
      min: dbConfig.poolMin ?? DEFAULT_MIN_CONNECTIONS,
      idleTimeoutMillis: dbConfig.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMs ?? DEFAULT_CONNECTION_TIMEOUT_MS,
      application_name: `tenant_${tenant.slug}`,
      ...(dbConfig.schema ? { options: `-c search_path=${dbConfig.schema}` } : {}),
    };

    const pool = new Pool(pgConfig);
    const entry: TenantConnectionPoolEntry = {
      tenantId: tenant.id,
      config: dbConfig,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      isHealthy: true,
      activeConnections: 0,
    };

    pool.on("error", (err: Error) => {
      entry.isHealthy = false;
      console.error(
        `[TenantConnectionPool] tenant="${tenant.id}" (${tenant.slug}) idle client error:`,
        err.message
      );
    });

    return { pool, entry };
  }

  private startReapSweep(): void {
    if (this.reapTimer) return;

    this.reapTimer = setInterval(() => {
      void this.reapIdlePools();
    }, REAP_SWEEP_INTERVAL_MS);

    if (typeof this.reapTimer.unref === "function") {
      this.reapTimer.unref();
    }
  }

  private stopReapSweep(): void {
    if (this.reapTimer) {
      clearInterval(this.reapTimer);
      this.reapTimer = null;
    }
  }

  private async reapIdlePools(): Promise<void> {
    const now = Date.now();
    const staleTenantIds: string[] = [];

    for (const [tenantId, record] of this.records.entries()) {
      const isIdleTooLong = now - record.entry.lastUsedAt.getTime() > POOL_REAP_AFTER_MS;
      const hasNoActiveWork =
        record.pool.waitingCount === 0 && record.pool.totalCount === record.pool.idleCount;

      if (isIdleTooLong && hasNoActiveWork) {
        staleTenantIds.push(tenantId);
      }
    }

    for (const tenantId of staleTenantIds) {
      try {
        await this.closePool(tenantId);
        console.info(`[TenantConnectionPool] reaped idle pool for tenant="${tenantId}"`);
      } catch (err: unknown) {
        console.error(`[TenantConnectionPool] reap failed for tenant="${tenantId}"`, err);
      }
    }
  }
}

/** পুরো অ্যাপ্লিকেশনজুড়ে একটিমাত্র রেজিস্ট্রি ইনস্ট্যান্স ব্যবহার করুন */
export const tenantConnectionPoolRegistry = new TenantConnectionPoolRegistry();