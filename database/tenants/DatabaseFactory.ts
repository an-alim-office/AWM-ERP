/**
 * database/tenants/DatabaseFactory.ts
 *
 * AWM-ERP — PostgreSQL Tenant Database Factory
 *
 * Creates PostgreSQL connection pools/configurations
 * from TenantDBConfig.
 *
 * NOTE:
 * MongoDB is currently the active application database.
 * This factory is retained for PostgreSQL support and
 * should not be used when TenantDBConfig.provider === "mongodb".
 */

import 'server-only';
import { Pool, type PoolConfig } from "pg";

import type {
  TenantDBConfig,
  DatabaseProvider,
} from "../../lib/tenant/types";

// ============================================================================
// Types
// ============================================================================

export interface DatabaseFactoryOptions {
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  allowExitOnIdle?: boolean;
}

// ============================================================================
// Database Factory
// ============================================================================

export class DatabaseFactory {
  /**
   * Create a PostgreSQL connection pool for a tenant.
   */
  public static createPool(
    config: TenantDBConfig,
    options: DatabaseFactoryOptions = {},
  ): Pool {
    this.validateProvider(config.provider);

    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.databaseName,
      user: config.username,
      password: config.password,
      max: options.max ?? config.poolMax ?? config.connectionLimit ?? 10,
      min: options.min ?? config.poolMin ?? 0,
      idleTimeoutMillis: options.idleTimeoutMillis ?? config.idleTimeoutMs ?? 30_000,
      connectionTimeoutMillis: options.connectionTimeoutMillis ?? config.connectionTimeoutMs ?? 5_000,
      allowExitOnIdle: options.allowExitOnIdle ?? false,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    };

    return new Pool(poolConfig);
  }

  /**
   * Create a PostgreSQL PoolConfig without opening a connection.
   *
   * Useful for migrations, testing, or one-off database operations.
   */
  public static createPoolConfig(
    config: TenantDBConfig,
    options: DatabaseFactoryOptions = {},
  ): PoolConfig {
    this.validateProvider(config.provider);

    return {
      host: config.host,
      port: config.port,
      database: config.databaseName,
      user: config.username,
      password: config.password,
      max: options.max ?? config.poolMax ?? config.connectionLimit ?? 10,
      min: options.min ?? config.poolMin ?? 0,
      idleTimeoutMillis: options.idleTimeoutMillis ?? config.idleTimeoutMs ?? 30_000,
      connectionTimeoutMillis: options.connectionTimeoutMillis ?? config.connectionTimeoutMs ?? 5_000,
      allowExitOnIdle: options.allowExitOnIdle ?? false,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    };
  }

  /**
   * Verify that the provider is supported.
   */
  private static validateProvider(provider: DatabaseProvider): void {
    if (provider !== "postgresql") {
      throw new Error(
        `DatabaseFactory currently supports only PostgreSQL. Received: ${provider}`,
      );
    }
  }
}

export default DatabaseFactory;