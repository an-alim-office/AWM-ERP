/**
 * lib/tenant/TenantContext.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Server-side Request Context
 */

import { AsyncLocalStorage } from 'async_hooks';
import { ResolvedTenantContext, Tenant, TenantError } from './types';

const storage = new AsyncLocalStorage<ResolvedTenantContext>();

export const TenantContextStore = {
  run<T>(context: ResolvedTenantContext, callback: () => T): T {
    return storage.run(context, callback);
  },

  getContext(): ResolvedTenantContext | null {
    return storage.getStore() ?? null;
  },
};

export function getCurrentTenant(): Tenant | null {
  return storage.getStore()?.tenant ?? null;
}

export function getCurrentTenantOrThrow(): Tenant {
  const tenant = getCurrentTenant();
  if (!tenant) {
    throw new TenantError(
      'TENANT_RESOLUTION_FAILED',
      'No tenant is bound to the current request context.',
    );
  }
  return tenant;
}

export function requireActiveTenant(): Tenant {
  const tenant = getCurrentTenantOrThrow();
  if (tenant.status !== 'active') {
    throw new TenantError(
      tenant.status === 'suspended'
        ? 'TENANT_SUSPENDED'
        : 'TENANT_ARCHIVED',
      `Tenant "${tenant.slug}" is not active (status: ${tenant.status}).`,
      tenant.id,
    );
  }
  return tenant;
}

export default TenantContextStore;