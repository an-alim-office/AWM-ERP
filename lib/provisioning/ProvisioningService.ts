/**
 * lib/provisioning/ProvisioningService.ts
 *
 * AWM-ERP — Multi-Tenant Provisioning Orchestrator
 *
 * Provisioning pipeline:
 * 1. Validate + register company
 * 2. Create tenant database / schema
 * 3. Seed default / demo data
 * 4. Create initial admin user
 * 5. Finalize provisioning result
 *
 * Rollback:
 * - Database/schema is removed when it was created.
 * - Registered tenant is archived through CompanyProvisioning.rollback().
 *
 * IMPORTANT:
 * DatabaseProvisioner currently supports PostgreSQL.
 */

import {
  ProvisioningPayload,
  ProvisioningResult,
  ProvisioningStep,
  ProvisioningError,
  Tenant,
  TenantDBConfig,
  TenantError,
} from "../tenant/types";

import {
  CompanyProvisioning,
  companyProvisioning,
} from "./CompanyProvisioning";

import {
  DatabaseProvisioner,
} from "./DatabaseProvisioning";

import {
  AdminProvisioning,
  adminProvisioning,
} from "./AdminProvisioning";

import {
  SeederProvisioning,
  seederProvisioning,
} from "./SeederProvisioning";

export interface ProvisioningServiceDependencies {
  company?: CompanyProvisioning;
  database?: DatabaseProvisioner;
  admin?: AdminProvisioning;
  seeder?: SeederProvisioning;
}

export class ProvisioningService {
  private readonly company: CompanyProvisioning;
  private readonly database: DatabaseProvisioner;
  private readonly admin: AdminProvisioning;
  private readonly seeder: SeederProvisioning;

  constructor(
    dependencies: ProvisioningServiceDependencies = {},
  ) {
    this.company = dependencies.company ?? companyProvisioning;
    this.database = dependencies.database ?? new DatabaseProvisioner();
    this.admin = dependencies.admin ?? adminProvisioning;
    this.seeder = dependencies.seeder ?? seederProvisioning;
  }

  public async provision(
    payload: ProvisioningPayload,
  ): Promise<ProvisioningResult> {
    const startedAt = Date.now();

    const completedSteps: ProvisioningStep[] = [];
    const errors: ProvisioningError[] = [];

    let tenant: Tenant | undefined;
    let dbConfig: TenantDBConfig | undefined;

    const companyResult =
      await this.company.provision(payload);

    if (
      !companyResult.success ||
      !companyResult.tenant
    ) {
      errors.push(...companyResult.errors);

      return this.createFailureResult(
        completedSteps,
        errors,
        startedAt,
      );
    }

    tenant = companyResult.tenant;

    completedSteps.push("validating");
    completedSteps.push("registering-tenant");

    try {
      dbConfig =
        await this.database.createTenantDatabase(
          payload.companyDetails,
          payload.dbSelection,
        );

      tenant.dbConfig = dbConfig;

      completedSteps.push("creating-database");
    } catch (error: unknown) {
      errors.push(
        this.createProvisioningError(
          "creating-database",
          error,
          "Failed to create tenant database.",
        ),
      );

      await this.rollback(
        tenant,
        dbConfig,
      );

      return this.createFailureResult(
        completedSteps,
        errors,
        startedAt,
        tenant,
        dbConfig,
      );
    }

    try {
      const seedResult =
        await this.seeder.run(
          tenant,
          payload.seedDemoData ?? false,
        );

      if (
        seedResult.seededCount > 0 ||
        seedResult.skippedCount > 0
      ) {
        completedSteps.push("seeding-data");
      }

      if (!seedResult.success) {
        errors.push(...seedResult.errors);

        await this.rollback(
          tenant,
          dbConfig,
        );

        return this.createFailureResult(
          completedSteps,
          errors,
          startedAt,
          tenant,
          dbConfig,
        );
      }
    } catch (error: unknown) {
      errors.push(
        this.createProvisioningError(
          "seeding-data",
          error,
          "Failed to seed tenant data.",
        ),
      );

      await this.rollback(
        tenant,
        dbConfig,
      );

      return this.createFailureResult(
        completedSteps,
        errors,
        startedAt,
        tenant,
        dbConfig,
      );
    }

    try {
      const adminResult =
        await this.admin.provision(
          tenant,
          payload.adminUser,
        );

      if (!adminResult.success) {
        errors.push(...adminResult.errors);

        await this.rollback(
          tenant,
          dbConfig,
        );

        return this.createFailureResult(
          completedSteps,
          errors,
          startedAt,
          tenant,
          dbConfig,
        );
      }

      completedSteps.push("creating-admin-user");
    } catch (error: unknown) {
      errors.push(
        this.createProvisioningError(
          "creating-admin-user",
          error,
          "Failed to create tenant admin user.",
        ),
      );

      await this.rollback(
        tenant,
        dbConfig,
      );

      return this.createFailureResult(
        completedSteps,
        errors,
        startedAt,
        tenant,
        dbConfig,
      );
    }

    tenant.status = "active";
    completedSteps.push("finalizing");

    return {
      success: true,
      tenantId: tenant.id,
      slug: tenant.slug,
      dbDetails: dbConfig
        ? {
            databaseName: dbConfig.databaseName,
            host: dbConfig.host,
            provider: dbConfig.provider,
          }
        : undefined,
      completedSteps,
      errors: [],
      durationMs: Date.now() - startedAt,
    };
  }

  private async rollback(
    tenant?: Tenant,
    dbConfig?: TenantDBConfig,
  ): Promise<void> {
    if (tenant && dbConfig) {
      try {
        await this.database.dropTenantDatabase(
          dbConfig,
          tenant.isolationStrategy,
        );
      } catch {
      }
    }

    if (tenant) {
      try {
        await this.company.rollback(
          tenant.id,
        );
      } catch {
      }
    }
  }

  private createProvisioningError(
    step: ProvisioningStep,
    error: unknown,
    fallbackMessage: string,
  ): ProvisioningError {
    if (error instanceof TenantError) {
      return {
        step,
        code: error.code,
        message: error.message,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        step,
        code: "TENANT_PROVISIONING_FAILED",
        message: error.message,
      };
    }

    return {
      step,
      code: "TENANT_PROVISIONING_FAILED",
      message: fallbackMessage,
      details: error,
    };
  }

  private createFailureResult(
    completedSteps: ProvisioningStep[],
    errors: ProvisioningError[],
    startedAt: number,
    tenant?: Tenant,
    dbConfig?: TenantDBConfig,
  ): ProvisioningResult {
    return {
      success: false,
      tenantId: tenant?.id,
      slug: tenant?.slug,
      dbDetails: dbConfig
        ? {
            databaseName: dbConfig.databaseName,
            host: dbConfig.host,
            provider: dbConfig.provider,
          }
        : undefined,
      completedSteps,
      errors,
      durationMs: Date.now() - startedAt,
    };
  }
}

export const provisioningService =
  new ProvisioningService();

export default provisioningService;