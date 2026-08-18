/**
 * lib/tenant/TenantConnection.ts
 *
 * টেন্যান্ট DB কানেকশন পাওয়া/বন্ধ করার জন্য পাবলিক API।
 */

import type {
  PoolClient,
  QueryResult,
  QueryResultRow,
} from 'pg';

import {
  tenantConnectionPoolRegistry,
} from '../../database/tenants/ConnectionPool';

import type {
  ConnectionPoolStats,
  Tenant,
  TenantConnectionPoolEntry,
} from './types';

import {
  TenantError,
  isTenantOperational,
} from './types';

export async function getTenantConnection(
  tenant: Tenant,
): Promise<PoolClient> {
  if (!tenant?.id) {
    throw new TenantError(
      'TENANT_DB_CONNECTION_FAILED',
      'getTenantConnection: বৈধ tenant.id ছাড়া কানেকশন তৈরি করা যাবে না।',
    );
  }

  if (!isTenantOperational(tenant)) {
    throw new TenantError(
      tenant.status === 'suspended'
        ? 'TENANT_SUSPENDED'
        : 'TENANT_ARCHIVED',
      `টেন্যান্ট "${tenant.slug}" বর্তমানে '${tenant.status}' অবস্থায় আছে — কানেকশন দেওয়া যাবে না।`,
      tenant.id,
    );
  }

  const pool =
    tenantConnectionPoolRegistry.getOrCreatePool(tenant);

  try {
    return await pool.connect();
  } catch (err: unknown) {
    throw new TenantError(
      'TENANT_DB_CONNECTION_FAILED',
      'ডেটাবেস কানেকশন গ্রহণ করার সময় ব্যর্থ হয়েছে (হোস্ট/ক্রেডেনশিয়াল যাচাই করুন)।',
      tenant.id,
      err,
    );
  }
}

export async function withTenantConnection<T>(
  tenant: Tenant,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getTenantConnection(tenant);
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

export async function queryTenant<
  T extends QueryResultRow = QueryResultRow,
>(
  tenant: Tenant,
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> {
  if (!isTenantOperational(tenant)) {
    throw new TenantError(
      tenant.status === 'suspended'
        ? 'TENANT_SUSPENDED'
        : 'TENANT_ARCHIVED',
      `টেন্যান্ট "${tenant.slug}" বর্তমানে '${tenant.status}' অবস্থায় আছে — কোয়েরি চালানো যাবে না।`,
      tenant.id,
    );
  }

  tenantConnectionPoolRegistry.getOrCreatePool(tenant);
  return tenantConnectionPoolRegistry.query<T>(
    tenant.id,
    text,
    params,
  );
}

export async function closeTenantConnection(
  tenantId: string,
): Promise<void> {
  if (!tenantId) {
    throw new TenantError(
      'TENANT_DB_CONNECTION_FAILED',
      'closeTenantConnection: বৈধ tenantId প্রয়োজন।',
    );
  }

  await tenantConnectionPoolRegistry.closePool(tenantId);
}

export async function closeAllTenantConnections(): Promise<void> {
  await tenantConnectionPoolRegistry.closeAll();
}

export function getTenantConnectionStats(
  tenantId: string,
): TenantConnectionPoolEntry | undefined {
  return tenantConnectionPoolRegistry.getStats(tenantId);
}

export function getAllTenantConnectionStats(): ConnectionPoolStats {
  return tenantConnectionPoolRegistry.getAggregateStats();
}

export function isTenantConnectionActive(
  tenantId: string,
): boolean {
  return tenantConnectionPoolRegistry.hasPool(tenantId);
}

process.once('SIGTERM', () => {
  void closeAllTenantConnections().finally(() => process.exit(0));
});

process.once('SIGINT', () => {
  void closeAllTenantConnections().finally(() => process.exit(0));
});