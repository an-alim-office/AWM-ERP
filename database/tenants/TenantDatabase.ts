/**
 * database/tenants/TenantDatabase.ts
 *
 * AWM-ERP — Tenant Database
 *
 * Represents one tenant's database connection.
 */

import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";

import type {
  Tenant,
  TenantDBConfig,
} from "../../lib/tenant/types";

import { DatabaseFactory } from "./DatabaseFactory";

export class TenantDatabase {
  private readonly tenant: Tenant;
  private readonly config: TenantDBConfig;
  private readonly pool: Pool;
  private closed = false;

  constructor(tenant: Tenant, pool?: Pool) {
    this.tenant = tenant;
    this.config = tenant.dbConfig;

    if (this.config.provider !== "postgresql") {
      throw new Error(
        `TenantDatabase currently supports only PostgreSQL. Received: ${this.config.provider}`,
      );
    }

    this.pool = pool ?? DatabaseFactory.createPool(this.config);
  }

  public getTenant(): Tenant {
    return this.tenant;
  }

  public getConfig(): TenantDBConfig {
    return this.config;
  }

  public getPool(): Pool {
    this.ensureOpen();
    return this.pool;
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: unknown[] = [],
  ): Promise<QueryResult<T>> {
    this.ensureOpen();
    return this.pool.query<T>(text, values);
  }

  public async connect(): Promise<PoolClient> {
    this.ensureOpen();
    return this.pool.connect();
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    this.ensureOpen();

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      if (this.config.schema) {
        await client.query("SELECT set_config('search_path', $1, false)", [
          this.config.schema,
        ]);
      }

      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original error.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    message?: string;
  }> {
    this.ensureOpen();

    const startedAt = Date.now();
    try {
      await this.pool.query("SELECT 1");
      return {
        healthy: true,
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : "Database health check failed.",
      };
    }
  }

  public getSchema(): string {
    return this.config.schema ?? "public";
  }

  public async setSearchPath(client: PoolClient): Promise<void> {
    const schema = this.getSchema();
    await client.query("SELECT set_config('search_path', $1, false)", [schema]);
  }

  public async close(): Promise<void> {
    if (this.closed) {
      return;
    }

    this.closed = true;
    await this.pool.end();
  }

  private ensureOpen(): void {
    if (this.closed) {
      throw new Error(`Tenant database "${this.tenant.slug}" is already closed.`);
    }
  }
}

export default TenantDatabase;