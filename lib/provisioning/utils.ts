/**
 * lib/provisioning/utils.ts
 *
 * AWM-ERP — Tenant Provisioning Utilities
 *
 * Shared helper functions used by the tenant provisioning layer.
 *
 * Responsibilities:
 * - Tenant slug normalization
 * - Safe identifier generation
 * - Email normalization
 * - Basic validation helpers
 * - Provisioning error normalization
 * - Safe object utilities
 * - Tenant ID / namespace helpers
 *
 * NOTE:
 * - এই ফাইলে database connection করা যাবে না।
 * - MongoDB / PostgreSQL / MySQL logic এখানে থাকবে না।
 * - Password hashing এখানে থাকবে না।
 *   Password hashing AdminProvisioning.ts-এ আছে।
 */

import { randomUUID } from "node:crypto";

// ============================================================================
// 1. Generic Types
// ============================================================================

export type UnknownRecord = Record<string, unknown>;

// ============================================================================
// 2. String Utilities
// ============================================================================

export function toSafeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export function normalizeString(value: unknown): string {
  return toSafeString(value).toLowerCase();
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// ============================================================================
// 3. Tenant Slug Utilities
// ============================================================================

function rejectReservedIdentifierPrefix(value: string): void {
  if (value.startsWith("pg_")) {
    throw new Error("Reserved PostgreSQL-style identifier prefix detected.");
  }
}

function enforceIdentifierLength(value: string, maxLength = 63): string {
  if (value.length > maxLength) {
    return value.slice(0, maxLength);
  }
  return value;
}

export function sanitizeTenantSlug(slug: string): string {
  const normalized = enforceIdentifierLength(
    toSafeString(slug)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );

  if (!normalized) {
    throw new Error("Tenant slug থেকে valid identifier তৈরি করা যায়নি.");
  }

  rejectReservedIdentifierPrefix(normalized);
  return normalized;
}

export function buildTenantDatabaseName(slug: string): string {
  const value = `awm_tenant_${sanitizeTenantSlug(slug)}`;
  return enforceIdentifierLength(value);
}

export function buildTenantNamespace(slug: string): string {
  const value = `tenant_${sanitizeTenantSlug(slug)}`;
  return enforceIdentifierLength(value);
}

export function buildTenantId(slug: string): string {
  return sanitizeTenantSlug(slug);
}

// ============================================================================
// 4. Email Utilities
// ============================================================================

export function normalizeEmail(email: unknown): string {
  return toSafeString(email).toLowerCase();
}

export function isValidEmail(email: unknown): email is string {
  if (!isNonEmptyString(email)) {
    return false;
  }

  const normalized = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

// ============================================================================
// 5. Identifier Utilities
// ============================================================================

export function sanitizeIdentifier(value: string): string {
  const result = enforceIdentifierLength(
    toSafeString(value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );

  if (!result) {
    throw new Error("Valid identifier তৈরি করা যায়নি.");
  }

  rejectReservedIdentifierPrefix(result);
  return result;
}

export function isSafeIdentifier(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const trimmed = value.trim();
  return /^[a-zA-Z0-9_]+$/.test(trimmed) && !trimmed.startsWith("pg_");
}

// ============================================================================
// 6. Object Utilities
// ============================================================================

export function isPlainObject(value: unknown): value is UnknownRecord {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function removeUndefined<T extends UnknownRecord>(object: T): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) {
      (result as UnknownRecord)[key] = value;
    }
  }

  return result;
}

export function getStringProperty(object: unknown, key: string): string | undefined {
  if (!isPlainObject(object)) {
    return undefined;
  }

  if (!Object.hasOwn(object, key)) {
    return undefined;
  }

  const value = object[key];
  return typeof value === "string" ? value.trim() : undefined;
}

// ============================================================================
// 7. Provisioning Error Utilities
// ============================================================================

export function getErrorMessage(
  error: unknown,
  fallback = "Provisioning operation failed."
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (isPlainObject(error)) {
    const message = error.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export function normalizeError(
  error: unknown,
  fallback = "Provisioning operation failed."
): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(getErrorMessage(error, fallback));
}

// ============================================================================
// 8. Provisioning Request Validation
// ============================================================================

export interface ProvisioningValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCompanyDetails(companyDetails: unknown): ProvisioningValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(companyDetails)) {
    return {
      valid: false,
      errors: ["Company details একটি valid object হতে হবে."],
    };
  }

  const name = companyDetails.name;
  const slug = companyDetails.slug;

  if (!isNonEmptyString(name)) {
    errors.push("Company name প্রয়োজন.");
  }

  if (!isNonEmptyString(slug)) {
    errors.push("Company slug প্রয়োজন.");
  } else {
    try {
      sanitizeTenantSlug(slug);
    } catch {
      errors.push("Company slug একটি valid tenant identifier নয়.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface AdminValidationOptions {
  minimumPasswordLength?: number;
}

export function validateAdminPayload(
  admin: unknown,
  options: AdminValidationOptions = {}
): ProvisioningValidationResult {
  const errors: string[] = [];
  const minimumPasswordLength = options.minimumPasswordLength ?? 8;

  if (!isPlainObject(admin)) {
    return {
      valid: false,
      errors: ["Admin payload একটি valid object হতে হবে."],
    };
  }

  const email = admin.email;
  const password = admin.password;

  if (!isValidEmail(email)) {
    errors.push("Valid admin email প্রয়োজন.");
  }

  if (!isNonEmptyString(password)) {
    errors.push("Admin password প্রয়োজন.");
  } else if (password.length < minimumPasswordLength) {
    errors.push(`Admin password কমপক্ষে ${minimumPasswordLength} characters হতে হবে.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// 10. Tenant Metadata Helpers
// ============================================================================

export interface TenantMetadata {
  tenantSlug: string;
  tenantId: string;
  tenantNamespace?: string;
  databaseName?: string;
  isolationStrategy?: string;
}

export function buildTenantMetadata(
  slug: string,
  options: {
    databaseName?: string;
    namespace?: string;
    isolationStrategy?: string;
  } = {}
): TenantMetadata {
  const tenantSlug = sanitizeTenantSlug(slug);

  return {
    tenantSlug,
    tenantId: tenantSlug,
    databaseName: options.databaseName,
    tenantNamespace: options.namespace,
    isolationStrategy: options.isolationStrategy,
  };
}

// ============================================================================
// 11. Tenant Scope Helpers
// ============================================================================

export function buildTenantScope(tenantId: string): { tenantId: string } {
  const safeTenantId = sanitizeTenantSlug(tenantId);

  return {
    tenantId: safeTenantId,
  };
}

export function withTenantScope<T extends UnknownRecord>(
  document: T,
  tenantId: string
): T & { tenantId: string } {
  return {
    ...document,
    tenantId: sanitizeTenantSlug(tenantId),
  };
}

// ============================================================================
// 12. Date Utilities
// ============================================================================

export function now(): Date {
  return new Date();
}

export function toISOString(value: Date): string {
  return value.toISOString();
}

// ============================================================================
// 13. Retry Utilities
// ============================================================================

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = Math.max(0, options.retries ?? 2);
  const delayMs = Math.max(0, options.delayMs ?? 500);
  const backoffFactor = Math.max(1, options.backoffFactor ?? 2);

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt >= retries) {
        break;
      }

      const waitMs = delayMs * Math.pow(backoffFactor, attempt);
      if (waitMs > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, waitMs);
        });
      }
    }
  }

  throw normalizeError(lastError, "Provisioning operation failed after retries.");
}

// ============================================================================
// 14. Safe Logging Helpers
// ============================================================================

export function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sensitiveKeys = new Set([
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "clientSecret",
    "apiKey",
    "privateKey",
    "credential",
    "credentials",
    "authorization",
    "bearer",
  ]);

  const result: UnknownRecord = {};

  for (const [key, item] of Object.entries(value)) {
    if (sensitiveKeys.has(key)) {
      result[key] = "[REDACTED]";
      continue;
    }

    result[key] = sanitizeForLog(item);
  }

  return result;
}

// ============================================================================
// 15. UUID Helper
// ============================================================================

export function generateId(): string {
  return randomUUID();
}

// ============================================================================
// Default Export
// ============================================================================

const provisioningUtils = {
  toSafeString,
  normalizeString,
  isNonEmptyString,
  sanitizeTenantSlug,
  buildTenantDatabaseName,
  buildTenantNamespace,
  buildTenantId,
  normalizeEmail,
  isValidEmail,
  sanitizeIdentifier,
  isSafeIdentifier,
  isPlainObject,
  removeUndefined,
  getStringProperty,
  getErrorMessage,
  normalizeError,
  validateCompanyDetails,
  validateAdminPayload,
  buildTenantMetadata,
  buildTenantScope,
  withTenantScope,
  now,
  toISOString,
  withRetry,
  sanitizeForLog,
  generateId,
};

export default provisioningUtils;