/**
 * lib/provisioning/AdminProvisioning.ts
 *
 * AWM-ERP — Tenant Provisioning — Admin User Step
 *
 * Production-grade admin provisioning service.
 *
 * Responsibilities:
 * - Validate admin payload
 * - Normalize admin email
 * - Hash password using Node.js scrypt
 * - Verify passwords
 * - Delegate database persistence to a pluggable driver
 * - Prevent plaintext password from reaching the driver layer
 * - Normalize provisioning errors
 * - Support MongoDB-first tenant architecture
 *
 * IMPORTANT:
 * - This file does NOT directly connect to MongoDB.
 * - Database persistence is delegated to AdminProvisioningDriver.
 * - Password hashing happens before driver execution.
 * - Plaintext passwords are never logged.
 * - Password hashes are never returned in API results.
 */

import {
  randomBytes,
  randomUUID,
  scrypt as scryptAsync,
  timingSafeEqual,
} from "node:crypto";

import {
  Tenant,
  AdminUserPayload,
  ProvisioningError,
  TenantError,
} from "../tenant/types";

import {
  normalizeEmail,
  validateAdminPayload,
  getErrorMessage,
} from "./utils";

const PASSWORD_HASH_ALGORITHM = "scrypt";
const PASSWORD_HASH_VERSION = "v1";
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_LENGTH = 64;

const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
} as const;

const DEFAULT_MIN_PASSWORD_LENGTH = 8;
const DEFAULT_MAX_PASSWORD_LENGTH = 256;

interface ParsedPasswordHash {
  version: string;
  algorithm: string;
  salt: string;
  hash: string;
}

function buildPasswordHash(
  salt: string,
  derivedKey: string,
): string {
  return [
    PASSWORD_HASH_VERSION,
    PASSWORD_HASH_ALGORITHM,
    salt,
    derivedKey,
  ].join(":");
}

function parsePasswordHash(
  stored: string,
): ParsedPasswordHash | null {
  if (
    typeof stored !== "string" ||
    !stored.trim()
  ) {
    return null;
  }

  const parts = stored.split(":");
  if (parts.length !== 4) return null;

  const [version, algorithm, salt, hash] = parts;

  if (!version || !algorithm || !salt || !hash) {
    return null;
  }

  if (version !== PASSWORD_HASH_VERSION) {
    return null;
  }

  if (algorithm !== PASSWORD_HASH_ALGORITHM) {
    return null;
  }

  return {
    version,
    algorithm,
    salt,
    hash,
  };
}

function scryptAsyncPromise(
  password: string,
  salt: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptAsync(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      {
        N: SCRYPT_OPTIONS.N,
        r: SCRYPT_OPTIONS.r,
        p: SCRYPT_OPTIONS.p,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(
  plain: string,
): Promise<string> {
  if (
    typeof plain !== "string" ||
    !plain
  ) {
    throw new TenantError(
      "TENANT_INVALID_REQUEST",
      "Password is required.",
    );
  }

  if (
    plain.length < DEFAULT_MIN_PASSWORD_LENGTH
  ) {
    throw new TenantError(
      "TENANT_INVALID_REQUEST",
      `Password must be at least ${DEFAULT_MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  if (
    plain.length > DEFAULT_MAX_PASSWORD_LENGTH
  ) {
    throw new TenantError(
      "TENANT_INVALID_REQUEST",
      `Password must not exceed ${DEFAULT_MAX_PASSWORD_LENGTH} characters.`,
    );
  }

  const salt =
    randomBytes(PASSWORD_SALT_BYTES).toString("hex");

  const derivedKey =
    await scryptAsyncPromise(
      plain,
      salt,
    );

  return buildPasswordHash(
    salt,
    derivedKey.toString("hex"),
  );
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  if (
    typeof plain !== "string" ||
    typeof stored !== "string"
  ) {
    return false;
  }

  const parsed = parsePasswordHash(stored);
  if (!parsed) return false;

  try {
    const derivedKey =
      await scryptAsyncPromise(
        plain,
        parsed.salt,
      );

    const storedBuffer =
      Buffer.from(parsed.hash, "hex");

    if (
      storedBuffer.length !== derivedKey.length
    ) {
      return false;
    }

    return timingSafeEqual(
      storedBuffer,
      derivedKey,
    );
  } catch {
    return false;
  }
}

export interface CreatedAdminUser {
  adminId: string;
  email: string;
}

export interface AdminProvisioningDriver {
  insertAdminUser(
    tenant: Tenant,
    admin: AdminUserPayload,
    passwordHash: string,
  ): Promise<CreatedAdminUser>;
}

export class NoopAdminProvisioningDriver
  implements AdminProvisioningDriver
{
  async insertAdminUser(
    tenant: Tenant,
    admin: AdminUserPayload,
    _passwordHash: string,
  ): Promise<CreatedAdminUser> {
    console.warn(
      `[AdminProvisioning] NOOP driver active. Admin "${normalizeEmail(admin.email)}" would be created for tenant "${tenant.slug}".`,
    );

    return {
      adminId: randomUUID(),
      email: normalizeEmail(admin.email),
    };
  }
}

export interface AdminProvisioningResult {
  success: boolean;
  admin?: CreatedAdminUser;
  errors: ProvisioningError[];
}

export interface AdminProvisioningOptions {
  minimumPasswordLength?: number;
  maximumPasswordLength?: number;
}

export class AdminProvisioning {
  private readonly driver: AdminProvisioningDriver;
  private readonly minimumPasswordLength: number;
  private readonly maximumPasswordLength: number;

  constructor(
    driver: AdminProvisioningDriver = new NoopAdminProvisioningDriver(),
    options: AdminProvisioningOptions = {},
  ) {
    this.driver = driver;

    this.minimumPasswordLength = Math.max(
      8,
      options.minimumPasswordLength ??
        DEFAULT_MIN_PASSWORD_LENGTH,
    );

    this.maximumPasswordLength = Math.max(
      this.minimumPasswordLength,
      options.maximumPasswordLength ??
        DEFAULT_MAX_PASSWORD_LENGTH,
    );
  }

  async provision(
    tenant: Tenant,
    adminPayload: AdminUserPayload,
  ): Promise<AdminProvisioningResult> {
    try {
      if (
        !tenant ||
        typeof tenant !== "object"
      ) {
        throw new TenantError(
          "TENANT_INVALID_REQUEST",
          "Valid tenant information is required.",
        );
      }

      if (
        !tenant.id ||
        !tenant.slug
      ) {
        throw new TenantError(
          "TENANT_INVALID_REQUEST",
          "Tenant ID and slug are required.",
        );
      }

      const validation =
        validateAdminPayload(
          adminPayload,
          {
            minimumPasswordLength:
              this.minimumPasswordLength,
          },
        );

      if (!validation.valid) {
        throw new TenantError(
          "TENANT_INVALID_REQUEST",
          validation.errors.join(" "),
        );
      }

      const normalizedEmail =
        normalizeEmail(adminPayload.email);

      const normalizedAdmin: AdminUserPayload = {
        ...adminPayload,
        email: normalizedEmail,
        fullName: adminPayload.fullName.trim(),
        phone: adminPayload.phone?.trim() || undefined,
      };

      if (!normalizedAdmin.fullName) {
        throw new TenantError(
          "TENANT_INVALID_REQUEST",
          "Admin full name is required.",
        );
      }

      if (
        normalizedAdmin.password.length >
        this.maximumPasswordLength
      ) {
        throw new TenantError(
          "TENANT_INVALID_REQUEST",
          `Admin password must not exceed ${this.maximumPasswordLength} characters.`,
        );
      }

      const passwordHash =
        await hashPassword(
          normalizedAdmin.password,
        );

      const createdAdmin =
        await this.driver.insertAdminUser(
          tenant,
          normalizedAdmin,
          passwordHash,
        );

      if (
        !createdAdmin ||
        !createdAdmin.adminId ||
        !createdAdmin.email
      ) {
        throw new TenantError(
          "TENANT_PROVISIONING_FAILED",
          "Admin provisioning driver returned an invalid result.",
        );
      }

      return {
        success: true,
        admin: {
          adminId: createdAdmin.adminId,
          email: normalizeEmail(
            createdAdmin.email,
          ),
        },
        errors: [],
      };
    } catch (error) {
      return this.buildFailureResult(error);
    }
  }

  private buildFailureResult(
    error: unknown,
  ): AdminProvisioningResult {
    return {
      success: false,
      errors: [
        {
          step: "creating-admin-user",
          code:
            error instanceof TenantError
              ? error.code
              : "TENANT_PROVISIONING_FAILED",
          message: getErrorMessage(
            error,
            "Failed to create the tenant admin user.",
          ),
        },
      ],
    };
  }
}

export const AdminPassword = {
  hash: hashPassword,
  verify: verifyPassword,
} as const;

export const adminProvisioning =
  new AdminProvisioning();

export default adminProvisioning;