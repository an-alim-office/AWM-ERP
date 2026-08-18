/**
 * lib/provisioning/SeederProvisioning.ts
 *
 * AWM-ERP — Tenant Provisioning — Default / Demo Data Step
 *
 * Production-grade tenant seeding orchestration layer.
 *
 * Responsibilities:
 * - Run baseline tenant seeders
 * - Run optional demo seeders
 * - Control deterministic seeder ordering
 * - Prevent duplicate seeder registration
 * - Prevent concurrent seeding for the same tenant
 * - Support retry + timeout
 * - Collect per-seeder execution results
 * - Normalize seeder errors
 * - Support runtime seeder registration
 * - Support unregistering seeders
 * - Preserve tenant isolation boundaries
 * - Never open database connections directly
 *
 * IMPORTANT:
 * - Actual database writes belong inside individual seeders.
 * - This file only orchestrates seed execution.
 * - Seeders should be idempotent whenever possible.
 * - Password hashing does NOT belong here.
 * - Tenant registration does NOT belong here.
 * - Database provisioning does NOT belong here.
 */

import {
  Tenant,
  ProvisioningError,
} from '../tenant/types';

import {
  getErrorMessage,
  sanitizeForLog,
} from './utils';

export type SeederKind =
  | 'baseline'
  | 'demo'
  | 'industry'
  | 'custom';

export type SeederExecutionStatus =
  | 'seeded'
  | 'skipped'
  | 'failed';

export interface TenantSeederContext {
  tenant: Tenant;
  seedDemoData: boolean;
  attempt: number;
  signal?: AbortSignal;
}

export interface TenantSeeder {
  readonly name: string;
  readonly kind?: SeederKind;
  readonly priority?: number;
  shouldRun(
    tenant: Tenant,
    seedDemoData: boolean,
  ): boolean | Promise<boolean>;
  run(
    tenant: Tenant,
    context?: TenantSeederContext,
  ): Promise<void>;
}

export interface SeederExecutionResult {
  name: string;
  kind: SeederKind;
  status: SeederExecutionStatus;
  attempts: number;
  durationMs: number;
  error?: string;
}

export interface SeederProvisioningResult {
  success: boolean;
  seededCount: number;
  skippedCount: number;
  failedCount: number;
  errors: ProvisioningError[];
  results: SeederExecutionResult[];
  durationMs: number;
}

export interface SeederProvisioningOptions {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  failFast?: boolean;
  logger?: SeederProvisioningLogger;
}

export interface SeederProvisioningLogger {
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

const defaultLogger: SeederProvisioningLogger = {
  debug(
    message,
    metadata,
  ) {
    if (
      process.env.NODE_ENV !==
      'production'
    ) {
      console.debug(
        `[SeederProvisioning] ${message}`,
        metadata
          ? sanitizeForLog(metadata)
          : undefined,
      );
    }
  },

  info(
    message,
    metadata,
  ) {
    console.info(
      `[SeederProvisioning] ${message}`,
      metadata
        ? sanitizeForLog(metadata)
        : undefined,
    );
  },

  warn(
    message,
    metadata,
  ) {
    console.warn(
      `[SeederProvisioning] ${message}`,
      metadata
        ? sanitizeForLog(metadata)
        : undefined,
    );
  },

  error(
    message,
    metadata,
  ) {
    console.error(
      `[SeederProvisioning] ${message}`,
      metadata
        ? sanitizeForLog(metadata)
        : undefined,
    );
  },
};

export class DefaultSettingsSeeder
  implements TenantSeeder
{
  readonly name =
    'default-settings';

  readonly kind: SeederKind =
    'baseline';

  readonly priority = 10;

  shouldRun(
    _tenant: Tenant,
    _seedDemoData: boolean,
  ): boolean {
    return true;
  }

  async run(
    tenant: Tenant,
    _context?: TenantSeederContext,
  ): Promise<void> {
    console.info(
      `[SeederProvisioning] (noop) seeding default settings for "${tenant.slug}"`,
    );
  }
}

export class DemoDataSeeder
  implements TenantSeeder
{
  readonly name =
    'demo-data';

  readonly kind: SeederKind =
    'demo';

  readonly priority = 100;

  shouldRun(
    _tenant: Tenant,
    seedDemoData: boolean,
  ): boolean {
    return seedDemoData;
  }

  async run(
    tenant: Tenant,
    _context?: TenantSeederContext,
  ): Promise<void> {
    console.info(
      `[SeederProvisioning] (noop) seeding demo data for "${tenant.slug}"`,
    );
  }
}

const activeTenantSeeds =
  new Set<string>();

export class SeederProvisioning {
  private readonly seeders: TenantSeeder[];

  private readonly options: Required<
    Pick<
      SeederProvisioningOptions,
      | 'retries'
      | 'retryDelayMs'
      | 'timeoutMs'
      | 'failFast'
    >
  > & {
    logger: SeederProvisioningLogger;
  };

  constructor(
    seeders: TenantSeeder[] = [
      new DefaultSettingsSeeder(),
      new DemoDataSeeder(),
    ],
    options: SeederProvisioningOptions = {},
  ) {
    this.seeders = [];

    this.options = {
      retries: Math.max(
        0,
        options.retries ?? 2,
      ),
      retryDelayMs: Math.max(
        0,
        options.retryDelayMs ?? 500,
      ),
      timeoutMs: Math.max(
        1,
        options.timeoutMs ?? 30_000,
      ),
      failFast:
        options.failFast ?? false,
      logger:
        options.logger ??
        defaultLogger,
    };

    for (
      const seeder of seeders
    ) {
      this.register(seeder);
    }
  }

  public async run(
    tenant: Tenant,
    seedDemoData = false,
  ): Promise<SeederProvisioningResult> {
    const startedAt =
      Date.now();

    const errors: ProvisioningError[] = [];
    const results: SeederExecutionResult[] = [];

    let seededCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    if (
      !tenant ||
      typeof tenant !== 'object' ||
      !tenant.id ||
      !tenant.slug
    ) {
      return {
        success: false,
        seededCount: 0,
        skippedCount: 0,
        failedCount: 1,
        errors: [
          {
            step: 'seeding-data',
            code:
              'TENANT_INVALID_REQUEST',
            message:
              'Valid tenant record is required before seeding.',
          },
        ],
        results: [],
        durationMs:
          Date.now() - startedAt,
      };
    }

    const lockKey =
      tenant.id;

    if (
      activeTenantSeeds.has(
        lockKey,
      )
    ) {
      return {
        success: false,
        seededCount: 0,
        skippedCount: 0,
        failedCount: 1,
        errors: [
          {
            step: 'seeding-data',
            code:
              'TENANT_PROVISIONING_FAILED',
            message:
              `Tenant "${tenant.slug}" is already being seeded.`,
          },
        ],
        results: [],
        durationMs:
          Date.now() - startedAt,
      };
    }

    activeTenantSeeds.add(
      lockKey,
    );

    try {
      const orderedSeeders =
        this.getOrderedSeeders();

      this.options.logger.info?.(
        'Starting tenant seeding.',
        {
          tenantId:
            tenant.id,
          slug:
            tenant.slug,
          seedDemoData,
          seederCount:
            orderedSeeders.length,
        },
      );

      for (
        const seeder of orderedSeeders
      ) {
        let shouldRun = false;

        try {
          shouldRun =
            await seeder.shouldRun(
              tenant,
              seedDemoData,
            );
        } catch (error: unknown) {
          failedCount++;

          const message =
            `${seeder.name}: ${this.getErrorMessage(error)}`;

          errors.push({
            step:
              'seeding-data',
            code:
              'TENANT_PROVISIONING_FAILED',
            message,
          });

          results.push({
            name:
              seeder.name,
            kind:
              this.getSeederKind(
                seeder,
              ),
            status:
              'failed',
            attempts: 0,
            durationMs: 0,
            error:
              message,
          });

          if (
            this.options.failFast
          ) {
            break;
          }

          continue;
        }

        if (!shouldRun) {
          skippedCount++;

          results.push({
            name:
              seeder.name,
            kind:
              this.getSeederKind(
                seeder,
              ),
            status:
              'skipped',
            attempts: 0,
            durationMs: 0,
          });

          this.options.logger.debug?.(
            'Seeder skipped.',
            {
              tenantId:
                tenant.id,
              seeder:
                seeder.name,
            },
          );

          continue;
        }

        const result =
          await this.executeSeeder(
            tenant,
            seeder,
            seedDemoData,
          );

        results.push(
          result,
        );

        if (
          result.status ===
          'seeded'
        ) {
          seededCount++;
          continue;
        }

        failedCount++;

        errors.push({
          step:
            'seeding-data',
          code:
            'TENANT_PROVISIONING_FAILED',
          message:
            `${seeder.name}: ${
              result.error ??
              'Seeder failed.'
            }`,
        });

        if (
          this.options.failFast
        ) {
          break;
        }
      }

      const success =
        failedCount === 0;

      this.options.logger.info?.(
        success
          ? 'Tenant seeding completed successfully.'
          : 'Tenant seeding completed with errors.',
        {
          tenantId:
            tenant.id,
          slug:
            tenant.slug,
          seededCount,
          skippedCount,
          failedCount,
          durationMs:
            Date.now() - startedAt,
        },
      );

      return {
        success,
        seededCount,
        skippedCount,
        failedCount,
        errors,
        results,
        durationMs:
          Date.now() - startedAt,
      };
    } finally {
      activeTenantSeeds.delete(
        lockKey,
      );
    }
  }

  private async executeSeeder(
    tenant: Tenant,
    seeder: TenantSeeder,
    seedDemoData: boolean,
  ): Promise<SeederExecutionResult> {
    const startedAt =
      Date.now();

    const maxAttempts =
      this.options.retries + 1;

    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      const controller =
        new AbortController();

      const timeout =
        setTimeout(() => {
          controller.abort();
        }, this.options.timeoutMs);

      try {
        this.options.logger.debug?.(
          'Running seeder.',
          {
            tenantId:
              tenant.id,
            seeder:
              seeder.name,
            attempt,
            maxAttempts,
          },
        );

        await this.withTimeout(
          seeder.run(
            tenant,
            {
              tenant,
              seedDemoData,
              attempt,
              signal:
                controller.signal,
            },
          ),
          this.options.timeoutMs,
          controller.signal,
        );

        clearTimeout(
          timeout,
        );

        const durationMs =
          Date.now() - startedAt;

        this.options.logger.info?.(
          'Seeder completed.',
          {
            tenantId:
              tenant.id,
            seeder:
              seeder.name,
            attempt,
            durationMs,
          },
        );

        return {
          name:
            seeder.name,
          kind:
            this.getSeederKind(
              seeder,
            ),
          status:
            'seeded',
          attempts:
            attempt,
          durationMs,
        };
      } catch (error: unknown) {
        clearTimeout(
          timeout,
        );

        lastError =
          error;

        const message =
          this.getErrorMessage(
            error,
          );

        this.options.logger.warn?.(
          'Seeder attempt failed.',
          {
            tenantId:
              tenant.id,
            seeder:
              seeder.name,
            attempt,
            maxAttempts,
            error:
              message,
          },
        );

        if (
          attempt <
          maxAttempts
        ) {
          await this.delay(
            this.options.retryDelayMs,
          );
        }
      }
    }

    return {
      name:
        seeder.name,
      kind:
        this.getSeederKind(
          seeder,
        ),
      status:
        'failed',
      attempts:
        maxAttempts,
      durationMs:
        Date.now() - startedAt,
      error:
        this.getErrorMessage(
          lastError,
          'Seeder failed after retries.',
        ),
    };
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    signal?: AbortSignal,
  ): Promise<T> {
    let timeoutHandle:
      ReturnType<typeof setTimeout> |
      undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<T>(
          (_, reject) => {
            timeoutHandle =
              setTimeout(
                () => {
                  reject(
                    new Error(
                      `Seeder execution exceeded timeout of ${timeoutMs}ms.`,
                    ),
                  );
                },
                timeoutMs,
              );
          },
        ),
        new Promise<T>(
          (_, reject) => {
            if (!signal) return;

            if (
              signal.aborted
            ) {
              reject(
                new Error(
                  'Seeder execution was aborted.',
                ),
              );
              return;
            }

            signal.addEventListener(
              'abort',
              () => {
                reject(
                  new Error(
                    'Seeder execution timed out or was aborted.',
                  ),
                );
              },
              {
                once: true,
              },
            );
          },
        ),
      ]);
    } finally {
      if (
        timeoutHandle
      ) {
        clearTimeout(
          timeoutHandle,
        );
      }
    }
  }

  public register(
    seeder: TenantSeeder,
  ): void {
    this.validateSeeder(
      seeder,
    );

    const exists =
      this.seeders.some(
        (item) =>
          item.name ===
          seeder.name,
      );

    if (exists) {
      throw new Error(
        `Seeder "${seeder.name}" is already registered.`,
      );
    }

    this.seeders.push(
      seeder,
    );

    this.options.logger.debug?.(
      'Seeder registered.',
      {
        name:
          seeder.name,
        kind:
          this.getSeederKind(
            seeder,
          ),
        priority:
          this.getSeederPriority(
            seeder,
          ),
      },
    );
  }

  public unregister(
    name: string,
  ): boolean {
    const index =
      this.seeders.findIndex(
        (seeder) =>
          seeder.name ===
          name,
      );

    if (
      index === -1
    ) {
      return false;
    }

    this.seeders.splice(
      index,
      1,
    );

    return true;
  }

  public has(
    name: string,
  ): boolean {
    return this.seeders.some(
      (seeder) =>
        seeder.name ===
        name,
    );
  }

  public list(): TenantSeeder[] {
    return [
      ...this.getOrderedSeeders(),
    ];
  }

  private getOrderedSeeders():
    TenantSeeder[] {
    return [
      ...this.seeders,
    ].sort(
      (a, b) =>
        this.getSeederPriority(
          a,
        ) -
        this.getSeederPriority(
          b,
        ),
    );
  }

  private validateSeeder(
    seeder: TenantSeeder,
  ): void {
    if (
      !seeder ||
      typeof seeder !==
      'object'
    ) {
      throw new Error(
        'Seeder must be a valid object.',
      );
    }

    if (
      typeof seeder.name !==
        'string' ||
      !seeder.name.trim()
    ) {
      throw new Error(
        'Seeder name is required.',
      );
    }

    if (
      typeof seeder.shouldRun !==
        'function'
    ) {
      throw new Error(
        `Seeder "${seeder.name}" must implement shouldRun().`,
      );
    }

    if (
      typeof seeder.run !==
        'function'
    ) {
      throw new Error(
        `Seeder "${seeder.name}" must implement run().`,
      );
    }
  }

  private getSeederKind(
    seeder: TenantSeeder,
  ): SeederKind {
    return (
      seeder.kind ??
      'custom'
    );
  }

  private getSeederPriority(
    seeder: TenantSeeder,
  ): number {
    const priority =
      seeder.priority;

    if (
      typeof priority !==
      'number'
    ) {
      return 100;
    }

    if (
      !Number.isFinite(
        priority,
      )
    ) {
      return 100;
    }

    return priority;
  }

  private getErrorMessage(
    error: unknown,
    fallback =
      'Seeder execution failed.',
  ): string {
    return getErrorMessage(
      error,
      fallback,
    );
  }

  private async delay(
    milliseconds: number,
  ): Promise<void> {
    if (
      milliseconds <= 0
    ) {
      return;
    }

    await new Promise<void>(
      (resolve) => {
        setTimeout(
          resolve,
          milliseconds,
        );
      },
    );
  }
}

export const seederProvisioning =
  new SeederProvisioning();

export default seederProvisioning;