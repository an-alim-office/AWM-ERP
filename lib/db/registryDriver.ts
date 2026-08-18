/**
 * lib/db/registryDriver.ts
 *
 * AWM-ERP — Pluggable Master Registry Driver Contract
 *
 * Storage-agnostic contract, which every registry backend
 * (MongoDB, PostgreSQL, future providers) can implement.
 *
 * This enables client-transparent database switching —
 * TenantManager and API routes do not need to change.
 */

import {
  Tenant,
  TenantStatus,
  TenantDBConfig,
  ProvisioningPayload,
  ProvisioningResult,
  MasterRegistryEntry,
  MasterRegistryQueryOptions,
} from '../tenant/types';

export interface RegistryListResult {
  entries: MasterRegistryEntry[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export interface RegistryHealth {
  healthy: boolean;
  latencyMs: number;
}

/**
 * Every concrete registry driver (Mongo, Postgres, ...)
 * implements this contract.
 *
 * MasterRegistry never talks directly to the database —
 * it only talks to the driver selected by TenantConfig.master.provider.
 */
export interface TenantRegistryDriver {
  getTenantBySlug(slug: string): Promise<Tenant | null>;
  getTenantByDomain(domain: string): Promise<Tenant | null>;
  getTenantById(id: string): Promise<Tenant | null>;
  listTenants(
    options?: MasterRegistryQueryOptions,
  ): Promise<RegistryListResult>;
  registerTenant(
    data: ProvisioningPayload,
  ): Promise<ProvisioningResult>;
  updateTenantStatus(
    id: string,
    status: TenantStatus,
  ): Promise<Tenant>;
  updateTenantDBConfig(
    id: string,
    dbConfig: TenantDBConfig,
  ): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
  healthCheck(): Promise<RegistryHealth>;
  shutdown(): Promise<void>;
}