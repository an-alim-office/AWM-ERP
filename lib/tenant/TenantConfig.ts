/**
 * lib/tenant/TenantConfig.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Runtime Configuration
 *
 * MongoDB-first configuration.
 *
 * IMPORTANT:
 * - MongoDB is currently the active database engine.
 * - Master tenant registry uses MongoDB.
 * - Default tenant isolation is shared-database.
 * - This file does not connect to MongoDB.
 * - It only reads, validates, normalizes and exposes configuration.
 */

import {
  TenantResolverOptions,
  DatabaseProvider,
  TenantIsolationStrategy,
  DEFAULT_TENANT_RESOLVER_OPTIONS,
} from './types';

function env(
  name: string,
  fallback?: string,
): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return fallback;
  return value.trim();
}

function envInt(
  name: string,
  fallback: number,
): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function envPositiveInt(
  name: string,
  fallback: number,
): number {
  const value = envInt(name, fallback);
  return value > 0 ? value : fallback;
}

function envNonNegativeInt(
  name: string,
  fallback: number,
): number {
  const value = envInt(name, fallback);
  return value >= 0 ? value : fallback;
}

function envBool(
  name: string,
  fallback: boolean,
): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  switch (raw.trim().toLowerCase()) {
    case 'true':
    case '1':
    case 'yes':
    case 'on':
      return true;
    case 'false':
    case '0':
    case 'no':
    case 'off':
      return false;
    default:
      return fallback;
  }
}

function envEnum<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const raw = env(name);
  if (raw && allowed.includes(raw as T)) return raw as T;
  return fallback;
}

function normalizeHostname(
  value?: string,
): string | undefined {
  if (!value) return undefined;
  let hostname = value.trim().toLowerCase();
  if (!hostname) return undefined;
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    try {
      hostname = new URL(hostname).hostname;
    } catch {
      return undefined;
    }
  }
  hostname = hostname.replace(/\/+$/, '').replace(/\.$/, '');
  if (hostname.includes(':') && !hostname.startsWith('[')) {
    const parts = hostname.split(':');
    if (parts.length === 2) hostname = parts[0];
  }
  return hostname || undefined;
}

const SUPPORTED_DATABASE_PROVIDERS: readonly DatabaseProvider[] = [
  'mongodb',
  'mysql',
  'postgresql',
  'mariadb',
  'mssql',
  'sqlite',
];

const SUPPORTED_ISOLATION_STRATEGIES: readonly TenantIsolationStrategy[] = [
  'database-per-tenant',
  'schema-per-tenant',
  'shared-schema',
  'shared-database',
];

export interface MasterDbConfig {
  provider: DatabaseProvider;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  ssl: boolean;
}

export function getMasterDbConfig(): MasterDbConfig {
  const provider = envEnum(
    'MASTER_DB_PROVIDER',
    SUPPORTED_DATABASE_PROVIDERS,
    'mongodb',
  );

  return {
    provider,
    host: env('MASTER_DB_HOST', 'localhost')!,
    port: envPositiveInt(
      'MASTER_DB_PORT',
      PROVIDER_DEFAULT_PORTS[provider],
    ),
    databaseName: env(
      'MASTER_DB_NAME',
      process.env.MONGODB_DB_NAME || 'awm_erp',
    )!,
    username: env('MASTER_DB_USER', '')!,
    password: env('MASTER_DB_PASSWORD', '')!,
    ssl: envBool('MASTER_DB_SSL', false),
  };
}

export function getTenantResolverOptions(): TenantResolverOptions {
  const rootDomain = normalizeHostname(
    env('TENANT_ROOT_DOMAIN', 'awm-erp.com'),
  );

  return {
    ...DEFAULT_TENANT_RESOLVER_OPTIONS,
    headerName: env(
      'TENANT_HEADER_NAME',
      DEFAULT_TENANT_RESOLVER_OPTIONS.headerName,
    )!,
    cookieName: env(
      'TENANT_COOKIE_NAME',
      DEFAULT_TENANT_RESOLVER_OPTIONS.cookieName,
    )!,
    queryParam: env(
      'TENANT_QUERY_PARAM',
      DEFAULT_TENANT_RESOLVER_OPTIONS.queryParam,
    )!,
    defaultSlug: env('TENANT_DEFAULT_SLUG'),
    allowSubdomain: envBool('TENANT_ALLOW_SUBDOMAIN', true),
    allowCustomDomain: envBool('TENANT_ALLOW_CUSTOM_DOMAIN', true),
    rootDomain,
    resolutionOrder: DEFAULT_TENANT_RESOLVER_OPTIONS.resolutionOrder,
  };
}

export const TENANT_CACHE_TTL_MS =
  envPositiveInt('TENANT_CACHE_TTL_MS', 5 * 60 * 1000);

export const TENANT_CACHE_MAX_ENTRIES =
  envPositiveInt('TENANT_CACHE_MAX_ENTRIES', 500);

export const DEFAULT_CONNECTION_LIMIT =
  envPositiveInt('TENANT_DB_CONNECTION_LIMIT', 50);

export const DEFAULT_CONNECTION_TIMEOUT_MS =
  envPositiveInt('TENANT_DB_CONNECTION_TIMEOUT_MS', 10_000);

export const DEFAULT_IDLE_TIMEOUT_MS =
  envPositiveInt('TENANT_DB_IDLE_TIMEOUT_MS', 45_000);

export const DEFAULT_DB_PROVIDER: DatabaseProvider =
  envEnum(
    'TENANT_DEFAULT_DB_PROVIDER',
    SUPPORTED_DATABASE_PROVIDERS,
    'mongodb',
  );

export const DEFAULT_ISOLATION_STRATEGY: TenantIsolationStrategy =
  envEnum(
    'TENANT_DEFAULT_ISOLATION_STRATEGY',
    SUPPORTED_ISOLATION_STRATEGIES,
    'shared-database',
  );

export const PROVIDER_DEFAULT_PORTS: Record<DatabaseProvider, number> = {
  mongodb: 27017,
  mysql: 3306,
  postgresql: 5432,
  mariadb: 3306,
  mssql: 1433,
  sqlite: 0,
};

export interface MongoTenantConfig {
  databaseName: string;
  tenantIdField: string;
  maxPoolSize: number;
  minPoolSize: number;
  connectTimeoutMS: number;
  socketTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

export function getMongoTenantConfig(): MongoTenantConfig {
  const maxPoolSize = envPositiveInt('MONGODB_MAX_POOL_SIZE', 50);
  const minPoolSize = envNonNegativeInt('MONGODB_MIN_POOL_SIZE', 5);

  return {
    databaseName: env(
      'MONGODB_DB_NAME',
      getMasterDbConfig().databaseName,
    )!,
    tenantIdField: env('TENANT_ID_FIELD', 'tenantId')!,
    maxPoolSize,
    minPoolSize: Math.min(minPoolSize, maxPoolSize),
    connectTimeoutMS: envPositiveInt(
      'MONGODB_CONNECT_TIMEOUT_MS',
      10_000,
    ),
    socketTimeoutMS: envPositiveInt(
      'MONGODB_SOCKET_TIMEOUT_MS',
      45_000,
    ),
    serverSelectionTimeoutMS: envPositiveInt(
      'MONGODB_SERVER_SELECTION_TIMEOUT_MS',
      10_000,
    ),
    retryWrites: envBool('MONGODB_RETRY_WRITES', true),
    retryReads: envBool('MONGODB_RETRY_READS', true),
  };
}

export const TenantConfig = {
  master: getMasterDbConfig(),
  resolver: getTenantResolverOptions(),
  cache: {
    ttlMs: TENANT_CACHE_TTL_MS,
    maxEntries: TENANT_CACHE_MAX_ENTRIES,
  },
  connection: {
    limit: DEFAULT_CONNECTION_LIMIT,
    timeoutMs: DEFAULT_CONNECTION_TIMEOUT_MS,
    idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
  },
  defaultProvider: DEFAULT_DB_PROVIDER,
  defaultIsolationStrategy: DEFAULT_ISOLATION_STRATEGY,
  providerDefaultPorts: PROVIDER_DEFAULT_PORTS,
  mongodb: getMongoTenantConfig(),
} as const;

export default TenantConfig;