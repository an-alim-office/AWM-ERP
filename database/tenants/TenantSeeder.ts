/**
 * database/tenants/TenantSeeder.ts
 *
 * AWM-ERP — Tenant Database Seeder
 *
 * Executes database-level seeders for a tenant.
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

export interface TenantDatabaseSeeder {
  /**
   * Unique stable name.
   */
  name: string;

  /**
   * Run seed.
   */
  run(
    client: PoolClient,
    tenant: Tenant,
  ): Promise<void>;
}

export interface TenantSeederResult {
  success: boolean;
  seeded: string[];
  failed: string[];
  errors: Array<{
    seeder: string;
    message: string;
  }>;
}

export class TenantSeeder {
  private readonly database: TenantDatabase;
  private readonly seeders: TenantDatabaseSeeder[];

  constructor(
    database: TenantDatabase,
    seeders: TenantDatabaseSeeder[] = [],
  ) {
    this.database = database;
    this.seeders = [...seeders];
  }

  public register(
    seeder: TenantDatabaseSeeder,
  ): void {
    const name = seeder.name.trim();
    if (!name) {
      throw new Error("Seeder name is required.");
    }

    const exists = this.seeders.some((item) => item.name === name);
    if (exists) {
      throw new Error(`Seeder "${name}" is already registered.`);
    }

    this.seeders.push({ ...seeder, name });
  }

  public async run(
    tenant: Tenant,
  ): Promise<TenantSeederResult> {
    const seeded: string[] = [];
    const failed: string[] = [];
    const errors: Array<{
      seeder: string;
      message: string;
    }> = [];

    if (this.seeders.length === 0) {
      return {
        success: true,
        seeded,
        failed,
        errors,
      };
    }

    const client = await this.database.connect();

    try {
      await client.query("BEGIN");

      await client.query(`
        CREATE TABLE IF NOT EXISTS tenant_metadata (
          tenant_id VARCHAR(255) PRIMARY KEY,
          tenant_slug VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      for (const seeder of this.seeders) {
        try {
          await seeder.run(client, tenant);
          seeded.push(seeder.name);
        } catch (error) {
          failed.push(seeder.name);
          errors.push({
            seeder: seeder.name,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (errors.length > 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          seeded: [],
          failed,
          errors,
        };
      }

      await client.query("COMMIT");

      return {
        success: true,
        seeded,
        failed,
        errors,
      };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve original error.
      }

      return {
        success: false,
        seeded: [],
        failed,
        errors: [
          ...errors,
          {
            seeder: "transaction",
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    } finally {
      client.release();
    }
  }
}

export class DefaultTenantSeeder implements TenantDatabaseSeeder {
  public readonly name = "default-tenant";

  public async run(
    client: PoolClient,
    tenant: Tenant,
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO tenant_metadata (
          tenant_id,
          tenant_slug
        )
        VALUES ($1, $2)
        ON CONFLICT (tenant_id)
        DO UPDATE SET
          tenant_slug = EXCLUDED.tenant_slug,
          updated_at = NOW()
      `,
      [
        tenant.id,
        tenant.slug,
      ],
    );
  }
}

export default TenantSeeder;