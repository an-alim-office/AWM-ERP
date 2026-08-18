/**
 * lib/tenant/TenantValidator.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Validation
 *
 * Pure validation functions for tenant-related payloads.
 * Never touches the database.
 */

import {
  ApiError,
  CompanyDetails,
  AdminUserPayload,
  DBSelectionOptions,
  CreateTenantRequest,
  TenantUpdatePayload,
} from './types';

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUSTOM_DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'master', 'system', 'root', 'auth',
  'static', 'assets', 'cdn', 'mail', 'ftp', 'billing', 'support',
]);

export function isValidSlug(slug: string): boolean {
  return typeof slug === 'string' && SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

export function isValidCustomDomain(domain: string): boolean {
  return typeof domain === 'string' && CUSTOM_DOMAIN_REGEX.test(domain);
}

export function isStrongPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}

export function validateCompanyDetails(company: CompanyDetails): ApiError[] {
  const errors: ApiError[] = [];

  if (!company?.name || company.name.trim().length < 2) {
    errors.push({
      code: 'INVALID_COMPANY_NAME',
      message: 'Company name must be at least 2 characters.',
      field: 'companyDetails.name',
    });
  }

  if (!company?.slug) {
    errors.push({
      code: 'SLUG_REQUIRED',
      message: 'Company slug is required.',
      field: 'companyDetails.slug',
    });
  } else if (!isValidSlug(company.slug)) {
    errors.push({
      code: 'INVALID_SLUG',
      message: 'Slug must be lowercase alphanumeric with optional hyphens (3-63 chars) and not a reserved word.',
      field: 'companyDetails.slug',
    });
  }

  return errors;
}

export function validateAdminUser(admin: AdminUserPayload): ApiError[] {
  const errors: ApiError[] = [];

  if (!admin?.fullName || admin.fullName.trim().length < 2) {
    errors.push({
      code: 'INVALID_ADMIN_NAME',
      message: 'Admin full name must be at least 2 characters.',
      field: 'adminUser.fullName',
    });
  }

  if (!admin?.email || !isValidEmail(admin.email)) {
    errors.push({
      code: 'INVALID_ADMIN_EMAIL',
      message: 'A valid admin email is required.',
      field: 'adminUser.email',
    });
  }

  if (!admin?.password || !isStrongPassword(admin.password)) {
    errors.push({
      code: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters.',
      field: 'adminUser.password',
    });
  }

  return errors;
}

export function validateDbSelection(
  dbSelection?: DBSelectionOptions,
): ApiError[] {
  const errors: ApiError[] = [];
  if (!dbSelection) return errors;

  const validProviders = [
    'mongodb',
    'mysql',
    'postgresql',
    'mariadb',
    'mssql',
    'sqlite',
  ];

  if (!validProviders.includes(dbSelection.provider)) {
    errors.push({
      code: 'INVALID_DB_PROVIDER',
      message: `Unsupported database provider: ${dbSelection.provider}`,
      field: 'dbSelection.provider',
    });
  }

  const validStrategies = [
    'database-per-tenant',
    'schema-per-tenant',
    'shared-schema',
  ];

  if (!validStrategies.includes(dbSelection.isolationStrategy)) {
    errors.push({
      code: 'INVALID_ISOLATION_STRATEGY',
      message: `Unsupported isolation strategy: ${dbSelection.isolationStrategy}`,
      field: 'dbSelection.isolationStrategy',
    });
  }

  return errors;
}

export function validateCreateTenantRequest(
  payload: CreateTenantRequest,
): ApiError[] {
  if (!payload) {
    return [
      {
        code: 'INVALID_PAYLOAD',
        message: 'Request body is required.',
      },
    ];
  }

  return [
    ...validateCompanyDetails(payload.companyDetails),
    ...validateAdminUser(payload.adminUser),
    ...validateDbSelection(payload.dbSelection),
  ];
}

export function validateTenantUpdatePayload(
  payload: TenantUpdatePayload,
): ApiError[] {
  const errors: ApiError[] = [];
  if (!payload) return errors;

  if (payload.name !== undefined && payload.name.trim().length < 2) {
    errors.push({
      code: 'INVALID_COMPANY_NAME',
      message: 'Company name must be at least 2 characters.',
      field: 'name',
    });
  }

  if (
    payload.customDomain !== undefined &&
    payload.customDomain !== null &&
    !isValidCustomDomain(payload.customDomain)
  ) {
    errors.push({
      code: 'INVALID_CUSTOM_DOMAIN',
      message: 'Custom domain format is invalid.',
      field: 'customDomain',
    });
  }

  if (payload.status !== undefined) {
    const validStatuses = [
      'active',
      'suspended',
      'pending',
      'archived',
    ];
    if (!validStatuses.includes(payload.status)) {
      errors.push({
        code: 'INVALID_STATUS',
        message: `Unsupported status: ${payload.status}`,
        field: 'status',
      });
    }
  }

  if (payload.plan !== undefined) {
    const validPlans = ['free', 'pro', 'enterprise'];
    if (!validPlans.includes(payload.plan)) {
      errors.push({
        code: 'INVALID_PLAN',
        message: `Unsupported plan: ${payload.plan}`,
        field: 'plan',
      });
    }
  }

  return errors;
}

export function assertValid(errors: ApiError[]): void {
  if (errors.length > 0) {
    throw new Error(
      errors
        .map((e) => `[${e.field ?? 'general'}] ${e.message}`)
        .join(' | '),
    );
  }
}