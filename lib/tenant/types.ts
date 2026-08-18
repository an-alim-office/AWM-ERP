/**
 * lib/tenant/types.ts
 *
 * AWM-ERP — Multi-Tenant Architecture — Core Type Definitions
 *
 * MongoDB-first tenant architecture.
 *
 * This file is the single source of truth for tenant-related
 * types used throughout the application.
 *
 * IMPORTANT:
 * - MongoDB is currently the active database engine.
 * - Tenant registry is stored in MongoDB.
 * - Tenant application data may use shared-database + tenantId isolation.
 * - Database credentials are server-side only.
 */

// ============================================================================
// 1. Core Enums / Literal Unions
// ============================================================================

export type TenantStatus =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'archived';

export type TenantPlan =
  | 'free'
  | 'pro'
  | 'enterprise';

/**
 * Supported database engines.
 *
 * MongoDB is currently the primary application database.
 */
export type DatabaseProvider =
  | 'mongodb'
  | 'mysql'
  | 'postgresql'
  | 'mariadb'
  | 'mssql'
  | 'sqlite';

/**
 * Physical/logical tenant isolation strategy.
 *
 * MongoDB:
 * - database-per-tenant
 * - shared-database
 *
 * PostgreSQL / SQL-style systems may additionally use:
 * - database-per-tenant
 * - schema-per-tenant
 * - shared-schema
 */
export type TenantIsolationStrategy =
  | 'database-per-tenant'
  | 'schema-per-tenant'
  | 'shared-schema'
  | 'shared-database';

export type TenantResolutionSource =
  | 'header'
  | 'cookie'
  | 'query'
  | 'subdomain'
  | 'custom-domain';

// ============================================================================
// 2. Database Configuration
// ============================================================================

export interface TenantDBConfig {
  provider: DatabaseProvider;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionLimit: number;
  connectionTimeoutMs?: number;
  idleTimeoutMs?: number;
  schema?: string;
  poolMin?: number;
  poolMax?: number;
  readReplicaHost?: string;
  extra?: Record<string, unknown>;
}

// ============================================================================
// 3. Tenant Connection Pool
// ============================================================================

export interface TenantConnectionPoolEntry {
  tenantId: string;
  config: TenantDBConfig;
  createdAt: Date;
  lastUsedAt: Date;
  isHealthy: boolean;
  activeConnections: number;
}

export interface ConnectionPoolStats {
  totalPools: number;
  totalActiveConnections: number;
  totalIdleConnections: number;
  unhealthyTenantIds: string[];
  generatedAt: Date;
}

// ============================================================================
// 4. Tenant Core
// ============================================================================

export interface TenantContactInfo {
  ownerName: string;
  email: string;
  phone?: string;
  companyAddress?: string;
}

export interface TenantBillingInfo {
  billingEmail?: string;
  trialEndsAt?: Date | null;
  subscriptionId?: string | null;
  nextBillingDate?: Date | null;
}

export interface TenantLimits {
  maxUsers?: number;
  maxStorageMb?: number;
  maxApiRequestsPerMinute?: number;
  maxConcurrentConnections?: number;
}

/**
 * Canonical server-side Tenant record.
 *
 * NEVER expose this object directly through an API.
 */
export interface Tenant {
  id: string;
  slug: string;
  customDomain?: string | null;
  name: string;
  status: TenantStatus;
  plan: TenantPlan;
  isolationStrategy: TenantIsolationStrategy;
  dbConfig: TenantDBConfig;
  contact: TenantContactInfo;
  billing?: TenantBillingInfo;
  limits?: TenantLimits;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  suspendedAt?: Date | null;
  archivedAt?: Date | null;
}

/**
 * Client-safe tenant representation.
 *
 * Only database provider is exposed.
 *
 * NEVER expose:
 * - host
 * - port
 * - username
 * - password
 * - databaseName
 * - connection limits
 */
export type PublicTenant =
  Omit<Tenant, 'dbConfig' | 'billing'> & {
    dbConfig: Pick<TenantDBConfig, 'provider'>;
  };

export type TenantUpdatePayload = Partial<
  Pick<
    Tenant,
    | 'name'
    | 'slug'
    | 'customDomain'
    | 'status'
    | 'plan'
    | 'limits'
    | 'metadata'
  >
>;

// ============================================================================
// 5. Tenant Resolver
// ============================================================================

export interface TenantResolverOptions {
  headerName: string;
  cookieName: string;
  queryParam: string;
  defaultSlug?: string;
  allowSubdomain?: boolean;
  allowCustomDomain?: boolean;
  rootDomain?: string;
  resolutionOrder?: TenantResolutionSource[];
}

export interface ResolvedTenantContext {
  tenant: Tenant;
  source: TenantResolutionSource;
  resolvedAt: Date;
}

export interface TenantContextType {
  tenant: PublicTenant | null;
  isLoading: boolean;
  error: string | null;
  switchTenant: (
    slugOrId: string,
  ) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

// ============================================================================
// 6. Provisioning
// ============================================================================

export interface CompanyDetails {
  name: string;
  slug: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
}

export interface AdminUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Database selection requested during tenant creation.
 *
 * MongoDB currently supports:
 *
 *   provider: "mongodb"
 *   isolationStrategy: "shared-database"
 *
 * Optional database-per-tenant can be added later.
 */
export interface DBSelectionOptions {
  provider: DatabaseProvider;
  isolationStrategy: TenantIsolationStrategy;
  region?: string;
  preferredHost?: string;
  databaseName?: string;
}

export interface ProvisioningPayload {
  companyDetails: CompanyDetails;
  adminUser: AdminUserPayload;
  plan: TenantPlan;
  dbSelection: DBSelectionOptions;
  seedDemoData?: boolean;
}

export type ProvisioningStep =
  | 'validating'
  | 'creating-database'
  | 'running-migrations'
  | 'seeding-data'
  | 'creating-admin-user'
  | 'registering-tenant'
  | 'finalizing';

export interface ProvisioningError {
  step: ProvisioningStep;
  code: string;
  message: string;
  details?: unknown;
}

export interface ProvisioningResult {
  success: boolean;
  tenantId?: string;
  slug?: string;
  dbDetails?: {
    databaseName: string;
    host: string;
    provider: DatabaseProvider;
  };
  completedSteps: ProvisioningStep[];
  errors: ProvisioningError[];
  durationMs?: number;
}

// ============================================================================
// 7. Migration
// ============================================================================

export type MigrationState =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'rolled-back';

export interface TenantMigrationStatus {
  tenantId: string;
  migrationName: string;
  state: MigrationState;
  appliedAt?: Date | null;
  batch?: number;
  errorMessage?: string | null;
}

export interface TenantMigrationSummary {
  tenantId: string;
  totalMigrations: number;
  appliedMigrations: number;
  pendingMigrations: number;
  lastMigrationAt?: Date | null;
  isUpToDate: boolean;
}

// ============================================================================
// 8. MongoDB Tenant Scope
// ============================================================================

/**
 * MongoDB shared-database isolation configuration.
 *
 * Every tenant-owned document should contain:
 *
 * tenantId: string
 *
 * Example:
 *
 * {
 *   tenantId: "tenant-id",
 *   name: "Product A"
 * }
 */
export interface TenantScope {
  tenantId: string;
}

/**
 * Common MongoDB tenant document shape.
 *
 * This is intentionally generic so individual collections
 * can extend it.
 */
export interface TenantDocument {
  tenantId: string;
}

// ============================================================================
// 9. Master Registry
// ============================================================================

export interface MasterRegistryEntry {
  tenantId: string;
  slug: string;
  customDomain?: string | null;
  status: TenantStatus;
  plan: TenantPlan;
  dbHost: string;
  dbName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterRegistryQueryOptions {
  status?: TenantStatus;
  plan?: TenantPlan;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?:
    | 'createdAt'
    | 'name'
    | 'status';
  sortOrder?:
    | 'asc'
    | 'desc';
}

// ============================================================================
// 10. Generic API Envelope
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponseMeta {
  requestId?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: ApiError[];
  meta?: ApiResponseMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T>
  extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}

// ============================================================================
// 11. Tenant API — Create
// ============================================================================

export interface CreateTenantRequest {
  companyDetails: CompanyDetails;
  adminUser: AdminUserPayload;
  plan: TenantPlan;
  dbSelection?: DBSelectionOptions;
}

export interface CreateTenantResponseData {
  tenant: PublicTenant;
  provisioning: ProvisioningResult;
}

export type CreateTenantResponse =
  ApiResponse<CreateTenantResponseData>;

// ============================================================================
// 12. Tenant API — Switch
// ============================================================================

export interface SwitchTenantRequest {
  targetSlugOrId: string;
}

export interface SwitchTenantResponseData {
  tenant: PublicTenant;
  sessionToken?: string;
}

export type SwitchTenantResponse =
  ApiResponse<SwitchTenantResponseData>;

// ============================================================================
// 13. Tenant API — Resolve
// ============================================================================

export interface ResolveTenantRequest {
  slug?: string;
  customDomain?: string;
  headerValue?: string;
}

export interface ResolveTenantResponseData {
  tenant: PublicTenant;
  source: TenantResolutionSource;
}

export type ResolveTenantResponse =
  ApiResponse<ResolveTenantResponseData>;

// ============================================================================
// 14. Tenant API — Health
// ============================================================================

export type TenantHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'unreachable';

export interface TenantHealthCheckResult {
  tenantId: string;
  dbStatus: TenantHealthStatus;
  latencyMs?: number;
  activeConnections?: number;
  lastCheckedAt: Date;
  message?: string;
}

export type TenantHealthResponse =
  ApiResponse<TenantHealthCheckResult>;

// ============================================================================
// 15. Error Codes
// ============================================================================

export type TenantErrorCode =
  | 'TENANT_NOT_FOUND'
  | 'TENANT_SLUG_TAKEN'
  | 'TENANT_SUSPENDED'
  | 'TENANT_ARCHIVED'
  | 'TENANT_DB_CONNECTION_FAILED'
  | 'TENANT_PROVISIONING_FAILED'
  | 'TENANT_MIGRATION_FAILED'
  | 'TENANT_RESOLUTION_FAILED'
  | 'TENANT_LIMIT_EXCEEDED'
  | 'TENANT_UNAUTHORIZED'
  | 'TENANT_INVALID_REQUEST'
  | 'TENANT_DATABASE_NOT_FOUND';

export class TenantError extends Error {
  public readonly code: TenantErrorCode;
  public readonly tenantId?: string;
  public readonly details?: unknown;

  constructor(
    code: TenantErrorCode,
    message: string,
    tenantId?: string,
    details?: unknown,
  ) {
    super(message);

    this.name = 'TenantError';
    this.code = code;
    this.tenantId = tenantId;
    this.details = details;

    Object.setPrototypeOf(
      this,
      TenantError.prototype,
    );
  }
}

// ============================================================================
// 16. Type Guards
// ============================================================================

export function isTenant(
  value: unknown,
): value is Tenant {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'slug' in value &&
    'dbConfig' in value
  );
}

export function isActiveTenant(
  tenant: Pick<Tenant, 'status'>,
): boolean {
  return tenant.status === 'active';
}

export function isTenantOperational(
  tenant: Pick<Tenant, 'status'>,
): boolean {
  return (
    tenant.status === 'active' ||
    tenant.status === 'pending'
  );
}

export function isTenantError(
  error: unknown,
): error is TenantError {
  return error instanceof TenantError;
}

// ============================================================================
// 17. Default Resolver Configuration
// ============================================================================

export const DEFAULT_TENANT_RESOLVER_OPTIONS:
  TenantResolverOptions = {
  headerName: 'x-tenant-id',
  cookieName: 'awm_tenant',
  queryParam: 'tenant',
  allowSubdomain: true,
  allowCustomDomain: true,
  resolutionOrder: [
    'custom-domain',
    'header',
    'cookie',
    'subdomain',
    'query',
  ],
};

// ============================================================================
// 18. Plan Limits
// ============================================================================

export const TENANT_PLAN_DEFAULT_LIMITS:
  Record<TenantPlan, TenantLimits> = {
  free: {
    maxUsers: 3,
    maxStorageMb: 512,
    maxApiRequestsPerMinute: 60,
    maxConcurrentConnections: 2,
  },
  pro: {
    maxUsers: 25,
    maxStorageMb: 10240,
    maxApiRequestsPerMinute: 600,
    maxConcurrentConnections: 10,
  },
  enterprise: {
    maxUsers: Infinity,
    maxStorageMb: Infinity,
    maxApiRequestsPerMinute: Infinity,
    maxConcurrentConnections: 50,
  },
};