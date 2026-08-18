/**
 * database/tenants/MasterRegistry.ts
 *
 * AWM-ERP — Master Registry Facade (pluggable provider)
 *
 * Public API আগের PostgreSQL-only ভার্সনের মতোই অপরিবর্তিত রাখা হয়েছে,
 * যাতে TenantRegistry.ts, ProvisioningService ইত্যাদি বিদ্যমান caller-রা
 * অপরিবর্তিত থাকে। ভেতরে এখন TenantConfig.master.provider যেই
 * TenantRegistryDriver বেছে নেয় সেটার সাথে delegate করে — আজ MongoDB,
 * ভবিষ্যতে কোনো ক্লায়েন্টের জন্য PostgreSQL (বা অন্য কিছু), অন্য কোনো
 * ফাইল না ছুঁয়েই।
 */

import {
  Tenant,
  TenantStatus,
  TenantDBConfig,
  ProvisioningPayload,
  ProvisioningResult,
  MasterRegistryQueryOptions,
  TenantError,
} from '../../lib/tenant/types';
import { TenantConfig } from '../../lib/tenant/TenantConfig';
import type {
  TenantRegistryDriver,
  RegistryListResult,
  RegistryHealth,
} from '../../lib/db/registryDriver';
import { PostgresRegistryDriver } from './drivers/PostgresRegistryDriver';
import { MongoRegistryDriver } from './drivers/MongoRegistryDriver';

interface CacheEntry {
  value: Tenant;
  expiresAt: number;
}

class TenantCache {
  private readonly bySlug = new Map<string, CacheEntry>();
  private readonly byId = new Map<string, CacheEntry>();
  private readonly byDomain = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number) {}

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  set(tenant: Tenant): void {
    const expiresAt = Date.now() + this.ttlMs;
    const entry: CacheEntry = { value: tenant, expiresAt };
    this.bySlug.set(this.normalize(tenant.slug), entry);
    this.byId.set(this.normalize(tenant.id), entry);
    if (tenant.customDomain) this.byDomain.set(this.normalize(tenant.customDomain), entry);
  }

  getBySlug(slug: string): Tenant | null {
    return this.read(this.bySlug, this.normalize(slug));
  }

  getById(id: string): Tenant | null {
    return this.read(this.byId, this.normalize(id));
  }

  getByDomain(domain: string): Tenant | null {
    return this.read(this.byDomain, this.normalize(domain));
  }

  invalidate(tenant: Pick<Tenant, 'id' | 'slug' | 'customDomain'>): void {
    this.byId.delete(this.normalize(tenant.id));
    this.bySlug.delete(this.normalize(tenant.slug));
    if (tenant.customDomain) this.byDomain.delete(this.normalize(tenant.customDomain));
  }

  clear(): void {
    this.bySlug.clear();
    this.byId.clear();
    this.byDomain.clear();
  }

  private read(store: Map<string, CacheEntry>, key: string): Tenant | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  }
}

const DEFAULT_CACHE_TTL_MS = 60_000;

function createDriver(): TenantRegistryDriver {
  switch (TenantConfig.master.provider) {
    case 'mongodb':
      return new MongoRegistryDriver();
    case 'postgresql':
      return new PostgresRegistryDriver();
    default:
      throw new TenantError(
        'TENANT_PROVISIONING_FAILED',
        `MasterRegistry: provider "${TenantConfig.master.provider}"-এর জন্য কোনো registry driver implement করা হয়নি।`,
      );
  }
}

export class MasterRegistry {
  private static instance: MasterRegistry | null = null;

  private readonly driver: TenantRegistryDriver;
  private readonly cache: TenantCache;

  private constructor() {
    this.driver = createDriver();
    this.cache = new TenantCache(
      Number(process.env.MASTER_DB_CACHE_TTL_MS ?? DEFAULT_CACHE_TTL_MS)
    );
  }

  public static getInstance(): MasterRegistry {
    if (!MasterRegistry.instance) {
      MasterRegistry.instance = new MasterRegistry();
    }
    return MasterRegistry.instance;
  }

  public static async reset(): Promise<void> {
    if (MasterRegistry.instance) {
      await MasterRegistry.instance.shutdown().catch(() => undefined);
    }
    MasterRegistry.instance = null;
  }

  public async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) return null;

    const cached = this.cache.getBySlug(normalized);
    if (cached) return cached;

    const tenant = await this.driver.getTenantBySlug(normalized);
    if (tenant) this.cache.set(tenant);
    return tenant;
  }

  public async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const normalized = domain.trim().toLowerCase();
    if (!normalized) return null;

    const cached = this.cache.getByDomain(normalized);
    if (cached) return cached;

    const tenant = await this.driver.getTenantByDomain(normalized);
    if (tenant) this.cache.set(tenant);
    return tenant;
  }

  public async getTenantById(id: string): Promise<Tenant | null> {
    const normalized = id.trim().toLowerCase();
    if (!normalized) return null;

    const cached = this.cache.getById(normalized);
    if (cached) return cached;

    const tenant = await this.driver.getTenantById(normalized);
    if (tenant) this.cache.set(tenant);
    return tenant;
  }

  public async listTenants(options: MasterRegistryQueryOptions = {}): Promise<RegistryListResult> {
    return this.driver.listTenants(options);
  }

  public async registerTenant(data: ProvisioningPayload): Promise<ProvisioningResult> {
    const result = await this.driver.registerTenant(data);

    if (result.success && result.tenantId) {
      const tenant = await this.driver.getTenantById(result.tenantId);
      if (tenant) this.cache.set(tenant);
    }

    return result;
  }

  public async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.driver.updateTenantStatus(id, status);
    this.cache.invalidate(tenant);
    this.cache.set(tenant);
    return tenant;
  }

  public async updateTenantDBConfig(id: string, dbConfig: TenantDBConfig): Promise<Tenant> {
    const tenant = await this.driver.updateTenantDBConfig(id, dbConfig);
    this.cache.invalidate(tenant);
    this.cache.set(tenant);
    return tenant;
  }

  public async deleteTenant(id: string): Promise<void> {
    const existing = await this.getTenantById(id);
    await this.driver.deleteTenant(id);
    if (existing) this.cache.invalidate(existing);
  }

  public async healthCheck(): Promise<RegistryHealth> {
    return this.driver.healthCheck();
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public async shutdown(): Promise<void> {
    await this.driver.shutdown();
  }
}

export const masterRegistry = MasterRegistry.getInstance();