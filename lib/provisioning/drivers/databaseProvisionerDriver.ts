/**
 * lib/provisioning/drivers/databaseProvisionerDriver.ts
 *
 * AWM-ERP — Pluggable Tenant Database Provisioner Contract
 */

import type {
  CompanyDetails,
  DBSelectionOptions,
  TenantDBConfig,
  TenantIsolationStrategy,
} from '../../tenant/types';

export interface TenantDatabaseProvisionerDriver {
  createTenantDatabase(
    companyDetails: CompanyDetails,
    dbSelection: DBSelectionOptions,
  ): Promise<TenantDBConfig>;

  dropTenantDatabase(
    dbConfig: TenantDBConfig,
    isolationStrategy: TenantIsolationStrategy,
  ): Promise<void>;
}