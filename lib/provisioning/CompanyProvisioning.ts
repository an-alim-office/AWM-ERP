/**
 * lib/provisioning/CompanyProvisioning.ts
 *
 * AWM-ERP — Tenant Provisioning — Company / Registry Step
 *
 * Production-grade control-plane provisioning step.
 *
 * Responsibilities:
 * - Validate company + admin provisioning payload
 * - Normalize provisioning input
 * - Register tenant in the master registry
 * - Ensure tenant starts in pending state
 * - Prevent duplicate registration where supported by TenantManager
 * - Preserve TenantError / validation error information
 * - Provide safe rollback support
 * - Never expose credentials
 * - Never perform physical tenant database provisioning
 * - Never hash passwords
 * - Never open a database connection directly
 */

import type {
  Tenant,
  ProvisioningPayload,
  ProvisioningError,
  CreateTenantRequest,
  TenantError,
} from '../tenant/types';

import {
  TenantManager,
  tenantManager,
} from '../tenant/TenantManager';

import {
  validateCreateTenantRequest,
} from '../tenant/TenantValidator';

import {
  normalizeEmail,
  sanitizeTenantSlug,
  toSafeString,
  isNonEmptyString,
  getErrorMessage,
  sanitizeForLog,
} from './utils';

export interface CompanyProvisioningResult {
  success: boolean;
  tenant?: Tenant;
  errors: ProvisioningError[];
  registered: boolean;
}

export interface CompanyProvisioningOptions {
  normalizeInput?: boolean;
  enableRollback?: boolean;
  logger?: CompanyProvisioningLogger;
}

export interface CompanyProvisioningLogger {
  debug?: (
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;

  info?: (
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;

  warn?: (
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;

  error?: (
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;
}

const defaultLogger: CompanyProvisioningLogger = {
  debug: (message, metadata) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `[CompanyProvisioning] ${message}`,
        metadata ? sanitizeForLog(metadata) : undefined,
      );
    }
  },

  info: (message, metadata) => {
    console.info(
      `[CompanyProvisioning] ${message}`,
      metadata ? sanitizeForLog(metadata) : undefined,
    );
  },

  warn: (message, metadata) => {
    console.warn(
      `[CompanyProvisioning] ${message}`,
      metadata ? sanitizeForLog(metadata) : undefined,
    );
  },

  error: (message, metadata) => {
    console.error(
      `[CompanyProvisioning] ${message}`,
      metadata ? sanitizeForLog(metadata) : undefined,
    );
  },
};

export class CompanyProvisioning {
  private readonly manager: TenantManager;

  private readonly options: Required<
    Pick<
      CompanyProvisioningOptions,
      'normalizeInput' | 'enableRollback'
    >
  > & {
    logger: CompanyProvisioningLogger;
  };

  constructor(
    manager: TenantManager = tenantManager,
    options: CompanyProvisioningOptions = {},
  ) {
    this.manager = manager;

    this.options = {
      normalizeInput: options.normalizeInput ?? true,
      enableRollback: options.enableRollback ?? true,
      logger: options.logger ?? defaultLogger,
    };
  }

  public async provision(
    payload: ProvisioningPayload,
  ): Promise<CompanyProvisioningResult> {
    const startedAt = Date.now();

    if (!payload || typeof payload !== 'object') {
      return this.failure(
        [
          this.createError(
            'validating',
            'TENANT_INVALID_REQUEST',
            'Provisioning payload একটি valid object হতে হবে।',
          ),
        ],
        false,
      );
    }

    const normalizedPayload =
      this.options.normalizeInput
        ? this.normalizePayload(payload)
        : payload;

    const createRequest =
      this.buildCreateRequest(
        normalizedPayload,
      );

    const validationErrors =
      validateCreateTenantRequest(
        createRequest,
      );

    if (
      validationErrors.length > 0
    ) {
      this.options.logger.warn?.(
        'Tenant provisioning validation failed.',
        {
          slug: createRequest.companyDetails.slug,
          errorCount: validationErrors.length,
          durationMs: Date.now() - startedAt,
        },
      );

      return this.failure(
        validationErrors.map(
          (error) =>
            this.createError(
              'validating',
              error.code,
              error.message,
              error.field
                ? { field: error.field }
                : undefined,
            ),
        ),
        false,
      );
    }

    try {
      this.options.logger.info?.(
        'Registering tenant in master registry.',
        {
          slug: createRequest.companyDetails.slug,
          email: createRequest.adminUser.email,
          plan: createRequest.plan,
          provider: createRequest.dbSelection?.provider,
          isolationStrategy:
            createRequest.dbSelection?.isolationStrategy,
        },
      );

      const tenant =
        await this.manager.registerTenant(
          createRequest,
        );

      if (!tenant || !tenant.id) {
        this.options.logger.error?.(
          'TenantManager returned an invalid tenant.',
          {
            slug: createRequest.companyDetails.slug,
          },
        );

        return this.failure(
          [
            this.createError(
              'registering-tenant',
              'REGISTRATION_FAILED',
              'Tenant registration completed but no valid tenant record was returned.',
            ),
          ],
          false,
        );
      }

      this.options.logger.info?.(
        'Tenant registered successfully.',
        {
          tenantId: tenant.id,
          slug: tenant.slug,
          status: tenant.status,
          durationMs: Date.now() - startedAt,
        },
      );

      return {
        success: true,
        tenant,
        errors: [],
        registered: true,
      };
    } catch (error: unknown) {
      const normalized =
        this.normalizeProvisioningError(
          error,
        );

      this.options.logger.error?.(
        'Tenant registration failed.',
        {
          slug: createRequest.companyDetails.slug,
          code: normalized.code,
          message: normalized.message,
          durationMs: Date.now() - startedAt,
        },
      );

      return {
        success: false,
        errors: [normalized],
        registered: false,
      };
    }
  }

  public async rollback(
    tenantId: string,
  ): Promise<void> {
    if (
      !this.options.enableRollback
    ) {
      this.options.logger.debug?.(
        'Rollback disabled.',
        {
          tenantId,
        },
      );
      return;
    }

    if (
      !isNonEmptyString(tenantId)
    ) {
      this.options.logger.warn?.(
        'Rollback skipped because tenantId is invalid.',
      );
      return;
    }

    try {
      this.options.logger.warn?.(
        'Rolling back tenant registration.',
        {
          tenantId,
        },
      );

      await this.manager.setStatus(
        tenantId.trim(),
        'archived',
      );

      this.options.logger.info?.(
        'Tenant registration rollback completed.',
        {
          tenantId: tenantId.trim(),
        },
      );
    } catch (error: unknown) {
      this.options.logger.error?.(
        'Tenant rollback failed.',
        {
          tenantId,
          error: getErrorMessage(
            error,
            'Tenant rollback failed.',
          ),
        },
      );
    }
  }

  private buildCreateRequest(
    payload: ProvisioningPayload,
  ): CreateTenantRequest {
    return {
      companyDetails: {
        ...payload.companyDetails,
        name: toSafeString(
          payload.companyDetails.name,
        ),
        slug: sanitizeTenantSlug(
          payload.companyDetails.slug,
        ),
        industry: this.optionalString(
          payload.companyDetails.industry,
        ),
        companySize: this.optionalString(
          payload.companyDetails.companySize,
        ),
        country: this.optionalString(
          payload.companyDetails.country,
        ),
        timezone: this.optionalString(
          payload.companyDetails.timezone,
        ),
      },
      adminUser: {
        ...payload.adminUser,
        fullName: toSafeString(
          payload.adminUser.fullName,
        ),
        email: normalizeEmail(
          payload.adminUser.email,
        ),
        password: payload.adminUser.password,
        phone: this.optionalString(
          payload.adminUser.phone,
        ),
      },
      plan: payload.plan,
      dbSelection: payload.dbSelection,
    };
  }

  private normalizePayload(
    payload: ProvisioningPayload,
  ): ProvisioningPayload {
    return {
      ...payload,
      companyDetails: {
        ...payload.companyDetails,
        name: toSafeString(
          payload.companyDetails.name,
        ),
        slug: toSafeString(
          payload.companyDetails.slug,
        ),
        industry: this.optionalString(
          payload.companyDetails.industry,
        ),
        companySize: this.optionalString(
          payload.companyDetails.companySize,
        ),
        country: this.optionalString(
          payload.companyDetails.country,
        ),
        timezone: this.optionalString(
          payload.companyDetails.timezone,
        ),
      },
      adminUser: {
        ...payload.adminUser,
        fullName: toSafeString(
          payload.adminUser.fullName,
        ),
        email: normalizeEmail(
          payload.adminUser.email,
        ),
        password: payload.adminUser.password,
        phone: this.optionalString(
          payload.adminUser.phone,
        ),
      },
      dbSelection: {
        ...payload.dbSelection,
        preferredHost: this.optionalString(
          payload.dbSelection?.preferredHost,
        ),
        databaseName: this.optionalString(
          payload.dbSelection?.databaseName,
        ),
        region: this.optionalString(
          payload.dbSelection?.region,
        ),
      },
    };
  }

  private optionalString(
    value: unknown,
  ): string | undefined {
    if (
      typeof value !== 'string'
    ) {
      return undefined;
    }

    const trimmed =
      value.trim();

    return trimmed || undefined;
  }

  private normalizeProvisioningError(
    error: unknown,
  ): ProvisioningError {
    const code =
      this.extractErrorCode(
        error,
      );

    const message =
      getErrorMessage(
        error,
        'Failed to register tenant.',
      );

    const details =
      this.extractErrorDetails(
        error,
      );

    return {
      step: 'registering-tenant',
      code,
      message,
      ...(details !== undefined
        ? { details }
        : {}),
    };
  }

  private extractErrorCode(
    error: unknown,
  ): string {
    if (
      this.isTenantErrorLike(error)
    ) {
      return error.code;
    }

    if (
      error &&
      typeof error === 'object' &&
      'code' in error
    ) {
      const code =
        (error as {
          code?: unknown;
        }).code;

      if (
        typeof code === 'string' &&
        code.trim()
      ) {
        return code.trim();
      }
    }

    return 'REGISTRATION_FAILED';
  }

  private extractErrorDetails(
    error: unknown,
  ): unknown {
    if (
      this.isTenantErrorLike(error)
    ) {
      return sanitizeForLog(
        error.details,
      );
    }

    if (
      error &&
      typeof error === 'object' &&
      'details' in error
    ) {
      return sanitizeForLog(
        (
          error as {
            details?: unknown;
          }
        ).details,
      );
    }

    return undefined;
  }

  private isTenantErrorLike(
    error: unknown,
  ): error is TenantError {
    return (
      error instanceof Error &&
      'code' in error
    );
  }

  private createError(
    step: ProvisioningError['step'],
    code: string,
    message: string,
    details?: unknown,
  ): ProvisioningError {
    return {
      step,
      code,
      message,
      ...(details !== undefined
        ? { details }
        : {}),
    };
  }

  private failure(
    errors: ProvisioningError[],
    registered: boolean,
  ): CompanyProvisioningResult {
    return {
      success: false,
      errors,
      registered,
    };
  }
}

export const companyProvisioning =
  new CompanyProvisioning();

export default companyProvisioning;