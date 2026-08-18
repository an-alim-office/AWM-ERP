/**
 * lib/tenant/TenantManager.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Tenant Manager
 *
 * Central application entry point for tenant lifecycle operations.
 */

import type { NextRequest } from 'next/server';

import {
  Tenant,
  PublicTenant,
  CreateTenantRequest,
  TenantUpdatePayload,
  TenantStatus,
  TenantError,
  ResolvedTenantContext,
  MasterRegistryQueryOptions,
} from './types';

import {
  TenantRegistry,
  tenantRegistry,
} from './TenantRegistry';

import {
  TenantCache,
  tenantCache,
} from './TenantCache';

import {
  TenantResolver,
  tenantResolver,
} from './TenantResolver';

import { TenantFactory } from './TenantFactory';

import {
  validateCreateTenantRequest,
  validateTenantUpdatePayload,
  assertValid,
} from './TenantValidator';

import {
  TenantConfig,
} from './TenantConfig';

export class TenantManager {
  constructor(
    private registry: TenantRegistry = tenantRegistry,
    private cache: TenantCache = tenantCache,
    private resolver: TenantResolver = tenantResolver,
  ) {}

  async getById(
    id: string,
  ): Promise<Tenant | null> {
    const cached = this.cache.getById(id);
    if (cached) return cached;

    return this.loadAndCache(() => this.registry.getById(id));
  }

  async getBySlug(
    slug: string,
  ): Promise<Tenant | null> {
    const cached = this.cache.getBySlug(slug);
    if (cached) return cached;

    return this.loadAndCache(() => this.registry.getBySlug(slug));
  }

  async getByCustomDomain(
    domain: string,
  ): Promise<Tenant | null> {
    return this.loadAndCache(() => this.registry.getByCustomDomain(domain));
  }

  async resolveFromRequest(
    request: NextRequest,
  ): Promise<ResolvedTenantContext> {
    return this.resolver.resolve(request);
  }

  async list(
    options: MasterRegistryQueryOptions = {},
  ) {
    return this.registry.query(options);
  }

  async registerTenant(
    payload: CreateTenantRequest,
  ): Promise<Tenant> {
    const errors =
      validateCreateTenantRequest(payload);
    assertValid(errors);

    const tenant =
      TenantFactory.buildTenant({
        companyDetails: payload.companyDetails,
        adminUser: payload.adminUser,
        plan: payload.plan,
        dbSelection: payload.dbSelection ?? {
          provider: TenantConfig.defaultProvider,
          isolationStrategy: TenantConfig.defaultIsolationStrategy,
        },
      });

    const saved = await this.registry.register(tenant);
    this.cache.set(saved);
    return saved;
  }

  async updateTenant(
    id: string,
    payload: TenantUpdatePayload,
  ): Promise<Tenant> {
    const errors =
      validateTenantUpdatePayload(payload);
    assertValid(errors);

    const updated = await this.registry.update(id, payload);

    this.cache.invalidate(updated);
    this.cache.set(updated);

    return updated;
  }

  async setStatus(
    id: string,
    status: TenantStatus,
  ): Promise<Tenant> {
    const updated = await this.registry.setStatus(id, status);

    this.cache.invalidate(updated);
    this.cache.set(updated);

    return updated;
  }

  activate(
    id: string,
  ): Promise<Tenant> {
    return this.setStatus(id, 'active');
  }

  suspend(
    id: string,
  ): Promise<Tenant> {
    return this.setStatus(id, 'suspended');
  }

  archive(
    id: string,
  ): Promise<Tenant> {
    return this.setStatus(id, 'archived');
  }

  async switchTenant(
    targetSlugOrId: string,
  ): Promise<Tenant> {
    let tenant = await this.getBySlug(targetSlugOrId);
    if (!tenant) tenant = await this.getById(targetSlugOrId);

    if (!tenant) {
      throw new TenantError(
        'TENANT_NOT_FOUND',
        `Tenant "${targetSlugOrId}" not found.`,
      );
    }

    if (tenant.status === 'suspended') {
      throw new TenantError(
        'TENANT_SUSPENDED',
        `Tenant "${tenant.slug}" is suspended.`,
        tenant.id,
      );
    }

    if (tenant.status === 'archived') {
      throw new TenantError(
        'TENANT_ARCHIVED',
        `Tenant "${tenant.slug}" is archived.`,
        tenant.id,
      );
    }

    if (
      tenant.status !== 'active' &&
      tenant.status !== 'pending'
    ) {
      throw new TenantError(
        'TENANT_INVALID_REQUEST',
        `Tenant "${tenant.slug}" is not operational.`,
        tenant.id,
      );
    }

    return tenant;
  }

  toPublic(
    tenant: Tenant,
  ): PublicTenant {
    return TenantFactory.toPublicTenant(tenant);
  }

  private async loadAndCache(
    loader: () => Promise<Tenant | null>,
  ): Promise<Tenant | null> {
    const tenant = await loader();
    if (tenant) this.cache.set(tenant);
    return tenant;
  }
}

export const tenantManager = new TenantManager();
export default tenantManager;