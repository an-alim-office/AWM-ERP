/**
 * lib/provisioning/utils.ts
 *
 * AWM-ERP — Tenant Provisioning — Shared Postgres Utilities
 *
 * Small, dependency-free helpers used by the provisioning layer (currently
 * DatabaseProvisioner.ts) for building safe SQL identifiers/literals and
 * generating strong per-tenant database passwords. Kept separate from
 * lib/tenant/TenantFactory.ts because these are Postgres-specific SQL
 * string helpers, not tenant-object builders.
 */

import crypto from 'crypto';

// ============================================================================
// 1. Identifier building
// ============================================================================

const MAX_POSTGRES_IDENTIFIER_LENGTH = 63;

/**
 * Converts a tenant slug into a safe, lowercase, underscore-separated
 * Postgres identifier (used as a database name, role name, or schema
 * name). Postgres identifiers are limited to 63 bytes and can't start
 * with a digit — and even though double-quoting allows almost any
 * character, we deliberately restrict the *unquoted* character set here
 * to avoid surprises with case-folding, hyphens, and reserved words.
 */
export function buildSafeIdentifier(slug: string, prefix: string = 'tenant_'): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('buildSafeIdentifier: slug must be a non-empty string.');
  }

  const normalized = slug
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  if (!normalized) {
    throw new Error(`buildSafeIdentifier: slug "${slug}" produced an empty identifier.`);
  }

  let identifier = `${prefix}${normalized}`;

  // Identifiers can't start with a digit, even after prefixing.
  if (/^[0-9]/.test(identifier)) {
    identifier = `_${identifier}`;
  }

  if (identifier.length > MAX_POSTGRES_IDENTIFIER_LENGTH) {
    // Truncate and append a short hash suffix so collisions stay unlikely
    // even after truncation.
    const hash = crypto.createHash('sha1').update(identifier).digest('hex').slice(0, 8);
    const keep = MAX_POSTGRES_IDENTIFIER_LENGTH - hash.length - 1;
    identifier = `${identifier.slice(0, keep)}_${hash}`;
  }

  return identifier;
}

// ============================================================================
// 2. SQL quoting
// ============================================================================

/**
 * Safely quotes a Postgres identifier (database/role/schema name) for
 * interpolation into DDL that the `pg` driver can't parameterize
 * (CREATE DATABASE, CREATE ROLE, etc. don't accept bound parameters).
 * Doubles any embedded double-quotes per the SQL standard.
 */
export function quoteIdentifier(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('quoteIdentifier: name must be a non-empty string.');
  }
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Safely quotes a Postgres string literal for interpolation into DDL
 * statements that don't support parameter binding. Doubles any embedded
 * single-quotes per the SQL standard.
 */
export function quoteLiteral(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('quoteLiteral: value must be a string.');
  }
  return `'${value.replace(/'/g, "''")}'`;
}

// ============================================================================
// 3. Secrets
// ============================================================================

/** Generates a cryptographically random, URL-safe password for a provisioned tenant DB role. */
export function generateSecurePassword(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}