/**
 * database/tenants/TenantMigration.ts
 *
 * AWM-ERP — Tenant Database Migration Manager
 *
 * Handles versioned migrations inside an individual tenant database.
 */

import type {
  PoolClient,
} from "pg";

import type {
  Tenant,
} from "../../lib/tenant/types";

import {
  TenantDatabase,
} from "./TenantDatabase";

export interface TenantMigration {
  /**
   * Unique migration name.
   *
   * Example:
   * 001-create-users
   */
  name: string;

  /**
   * Apply migration.
   */
  up(client: PoolClient): Promise<void>;

  /**
   * Optional rollback.
   */
  down?(client: PoolClient): Promise<void>;
}

export interface TenantMigrationResult {
  success: boolean;
  applied: string[];
  skipped: string[];
  failed?: string;
  error?: string;
}

type TenantMigrationRecord = {
  id: number;
  migration_name: string;
  applied_at: Date;
};

function sortMigrationNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export class TenantMigrationManager {
  private readonly database: TenantDatabase;
  private readonly migrations: TenantMigration[];

  constructor(database: TenantDatabase, migrations: TenantMigration[] = []) {
    this.database = database;
    this.migrations = [...migrations].sort((a, b) => sortMigrationNames(a.name, b.name));
  }

  public register(migration: TenantMigration): void {
    const name = migration.name.trim();
    if (!name) {
      throw new Error("Migration name is required.");
    }

    const exists = this.migrations.some((item) => item.name === name);
    if (exists) {
      throw new Error(`Migration "${name}" is already registered.`);
    }

    this.migrations.push({ ...migration, name });
    this.migrations.sort((a, b) => sortMigrationNames(a.name, b.name));
  }

  private async ensureMigrationTable(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenant_migrations (
        id BIGSERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private async getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
    const result = await client.query<{ migration_name: string }>(
      `
        SELECT migration_name
        FROM tenant_migrations
        ORDER BY migration_name ASC
      `,
    );

    return new Set(result.rows.map((row) => row.migration_name));
  }

  public async run(tenant?: Tenant): Promise<TenantMigrationResult> {
    const applied: string[] = [];
    const skipped: string[] = [];

    try {
      return await this.database.transaction(async (client) => {
        await this.ensureMigrationTable(client);

        const appliedMigrations = await this.getAppliedMigrations(client);

        for (const migration of this.migrations) {
          if (appliedMigrations.has(migration.name)) {
            skipped.push(migration.name);
            continue;
          }

          try {
            await migration.up(client);

            await client.query(
              `
                INSERT INTO tenant_migrations (
                  migration_name
                )
                VALUES ($1)
              `,
              [migration.name],
            );

            applied.push(migration.name);
          } catch (error) {
            throw new Error(
              tenant
                ? `Migration "${migration.name}" failed for tenant "${tenant.slug}": ${
                    error instanceof Error ? error.message : String(error)
                  }`
                : `Migration "${migration.name}" failed: ${
                    error instanceof Error ? error.message : String(error)
                  }`,
            );
          }
        }

        return {
          success: true,
          applied,
          skipped,
        };
      });
    } catch (error) {
      return {
        success: false,
        applied,
        skipped,
        failed: this.getLastMigrationName(applied),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public async rollbackLast(): Promise<boolean> {
    const client = await this.database.connect();

    try {
      await client.query("BEGIN");

      await this.ensureMigrationTable(client);

      const result = await client.query<TenantMigrationRecord>(
        `
          SELECT id, migration_name, applied_at
          FROM tenant_migrations
          ORDER BY id DESC
          LIMIT 1
        `,
      );

      if (result.rows.length === 0) {
        await client.query("COMMIT");
        return false;
      }

      const last = result.rows[0];

      const migration = this.migrations.find(
        (item) => item.name === last.migration_name,
      );

      if (!migration || !migration.down) {
        throw new Error(
          `Rollback implementation not found for migration "${last.migration_name}".`,
        );
      }

      await migration.down(client);

      await client.query(
        `
          DELETE FROM tenant_migrations
          WHERE id = $1
        `,
        [last.id],
      );

      await client.query("COMMIT");
      return true;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve original error.
      }

      throw error;
    } finally {
      client.release();
    }
  }

  public async status(): Promise<{
    registered: string[];
    applied: string[];
    pending: string[];
  }> {
    const client = await this.database.connect();

    try {
      await this.ensureMigrationTable(client);

      const applied = await this.getAppliedMigrations(client);

      const registered = this.migrations.map((migration) => migration.name);
      const pending = registered.filter((name) => !applied.has(name));

      return {
        registered,
        applied: Array.from(applied),
        pending,
      };
    } finally {
      client.release();
    }
  }

  private getLastMigrationName(applied: string[]): string | undefined {
    if (applied.length === 0) {
      return undefined;
    }

    return applied[applied.length - 1];
  }
}

export default TenantMigrationManager;