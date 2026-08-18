/**
 * app/api/tenant/create/route.ts
 *
 * AWM-ERP — Tenant Create API
 *
 * POST /api/tenant/create
 *
 * Creates and provisions a new tenant.
 *
 * Security:
 * - Never exposes database credentials.
 * - Uses TenantManager.toPublic() for API-safe tenant output.
 * - Provisioning remains delegated to ProvisioningService.
 */

import { NextResponse } from "next/server";

import type {
  ApiError,
  ApiResponse,
  CreateTenantRequest,
  CreateTenantResponseData,
  DBSelectionOptions,
  ProvisioningPayload,
} from "@/lib/tenant/types";

import { TenantError } from "@/lib/tenant/types";
import { tenantManager } from "@/lib/tenant/TenantManager";
import { provisioningService } from "@/lib/provisioning/ProvisioningService";

// ============================================================================
// Helpers
// ============================================================================

function createMeta() {
  return {
    timestamp: new Date().toISOString(),
  };
}

function errorResponse(
  errors: ApiError[],
  status: number,
): NextResponse {
  const response: ApiResponse<never> = {
    success: false,
    errors,
    meta: createMeta(),
  };

  return NextResponse.json(response, { status });
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function trimmedString(value: unknown): string {
  return isString(value) ? value.trim() : "";
}

function isProvider(
  value: unknown,
): value is DBSelectionOptions["provider"] {
  return (
    value === "mysql" ||
    value === "postgresql" ||
    value === "mariadb" ||
    value === "mssql" ||
    value === "sqlite"
  );
}

function isIsolationStrategy(
  value: unknown,
): value is DBSelectionOptions["isolationStrategy"] {
  return (
    value === "database-per-tenant" ||
    value === "schema-per-tenant" ||
    value === "shared-database" ||
    value === "shared-schema"
  );
}

type DbSelectionValidationResult =
  | { ok: true; value: DBSelectionOptions }
  | { ok: false; error: ApiError };

function validateDbSelection(
  body: Record<string, unknown>,
): DbSelectionValidationResult {
  if (body.dbSelection === undefined) {
    return {
      ok: true,
      value: {
        provider: "postgresql",
        isolationStrategy: "database-per-tenant",
      },
    };
  }

  if (!isRecord(body.dbSelection)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "dbSelection must be an object.",
        field: "dbSelection",
      },
    };
  }

  const raw = body.dbSelection;

  if (!isProvider(raw.provider)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "dbSelection.provider is invalid.",
        field: "dbSelection.provider",
      },
    };
  }

  if (!isIsolationStrategy(raw.isolationStrategy)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "dbSelection.isolationStrategy is invalid.",
        field: "dbSelection.isolationStrategy",
      },
    };
  }

  if (raw.region !== undefined && !isString(raw.region)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "dbSelection.region must be a string.",
        field: "dbSelection.region",
      },
    };
  }

  if (raw.preferredHost !== undefined && !isString(raw.preferredHost)) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "dbSelection.preferredHost must be a string.",
        field: "dbSelection.preferredHost",
      },
    };
  }

  return {
    ok: true,
    value: {
      provider: raw.provider,
      isolationStrategy: raw.isolationStrategy,
      ...(isString(raw.region) ? { region: raw.region.trim() } : {}),
      ...(isString(raw.preferredHost) ? { preferredHost: raw.preferredHost.trim() } : {}),
    },
  };
}

// ============================================================================
// POST /api/tenant/create
// ============================================================================

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    // ========================================================================
    // 1. Parse JSON
    // ========================================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        [
          {
            code: "INVALID_JSON",
            message: "Request body must contain valid JSON.",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 2. Validate root object
    // ========================================================================

    if (!isRecord(body)) {
      return errorResponse(
        [
          {
            code: "INVALID_REQUEST",
            message: "Request body must be a JSON object.",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 3. Validate companyDetails
    // ========================================================================

    if (!isRecord(body.companyDetails)) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "companyDetails is required.",
            field: "companyDetails",
          },
        ],
        400,
      );
    }

    const companyDetails = body.companyDetails;

    // ========================================================================
    // 4. Validate company name
    // ========================================================================

    const companyName = trimmedString(companyDetails.name);
    if (!companyName) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "Company name is required.",
            field: "companyDetails.name",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 5. Validate company slug
    // ========================================================================

    const companySlug = trimmedString(companyDetails.slug);
    if (!companySlug) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "Company slug is required.",
            field: "companyDetails.slug",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 6. Validate adminUser
    // ========================================================================

    if (!isRecord(body.adminUser)) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "adminUser is required.",
            field: "adminUser",
          },
        ],
        400,
      );
    }

    const adminUser = body.adminUser;

    // ========================================================================
    // 7. Validate admin full name
    // ========================================================================

    const adminFullName = trimmedString(adminUser.fullName);
    if (!adminFullName) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "Admin full name is required.",
            field: "adminUser.fullName",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 8. Validate admin email
    // ========================================================================

    const adminEmail = trimmedString(adminUser.email).toLowerCase();
    if (!adminEmail) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "Admin email is required.",
            field: "adminUser.email",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 9. Validate admin password
    // ========================================================================

    if (!isString(adminUser.password) || adminUser.password.length < 8) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "Admin password must contain at least 8 characters.",
            field: "adminUser.password",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 10. Validate plan
    // ========================================================================

    if (body.plan !== "free" && body.plan !== "pro" && body.plan !== "enterprise") {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "plan must be free, pro, or enterprise.",
            field: "plan",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 11. Validate optional dbSelection
    // ========================================================================

    const dbSelectionResult = validateDbSelection(body);
    if (!dbSelectionResult.ok) {
      return errorResponse([dbSelectionResult.error], 400);
    }

    // ========================================================================
    // 12. Validate seedDemoData
    // ========================================================================

    if (
      body.seedDemoData !== undefined &&
      typeof body.seedDemoData !== "boolean"
    ) {
      return errorResponse(
        [
          {
            code: "VALIDATION_ERROR",
            message: "seedDemoData must be a boolean.",
            field: "seedDemoData",
          },
        ],
        400,
      );
    }

    // ========================================================================
    // 13. Build typed CreateTenantRequest
    // ========================================================================

    const createRequest: CreateTenantRequest = {
      companyDetails: {
        name: companyName,
        slug: companySlug,
        ...(isString(companyDetails.industry) ? { industry: companyDetails.industry.trim() } : {}),
        ...(isString(companyDetails.companySize) ? { companySize: companyDetails.companySize.trim() } : {}),
        ...(isString(companyDetails.country) ? { country: companyDetails.country.trim() } : {}),
        ...(isString(companyDetails.timezone) ? { timezone: companyDetails.timezone.trim() } : {}),
      },
      adminUser: {
        fullName: adminFullName,
        email: adminEmail,
        password: adminUser.password,
        ...(isString(adminUser.phone) ? { phone: adminUser.phone.trim() } : {}),
      },
      plan: body.plan,
      dbSelection: dbSelectionResult.value,
    };

    // ========================================================================
    // 14. Build ProvisioningPayload
    // ========================================================================

    const validatedDbSelection = dbSelectionResult.value;

    const provisioningPayload: ProvisioningPayload = {
      companyDetails: createRequest.companyDetails,
      adminUser: createRequest.adminUser,
      plan: createRequest.plan,
      dbSelection: validatedDbSelection,
      seedDemoData: body.seedDemoData === true,
    };

    // ========================================================================
    // 15. Run provisioning
    // ========================================================================

    const provisioning = await provisioningService.provision(
      provisioningPayload,
    );

    // ========================================================================
    // 16. Provisioning failed
    // ========================================================================

    if (!provisioning.success) {
      const errors: ApiError[] = provisioning.errors.map((error) => ({
        code: error.code,
        message: error.message,
      }));

      return errorResponse(
        errors.length > 0
          ? errors
          : [
              {
                code: "TENANT_PROVISIONING_FAILED",
                message: "Tenant provisioning failed.",
              },
            ],
        422,
      );
    }

    // ========================================================================
    // 17. Validate provisioning identity
    // ========================================================================

    if (!provisioning.tenantId) {
      return errorResponse(
        [
          {
            code: "TENANT_PROVISIONING_FAILED",
            message: "Provisioning completed without returning tenant identity.",
          },
        ],
        500,
      );
    }

    // ========================================================================
    // 18. Load the actual registered Tenant
    // ========================================================================
    //
    // IMPORTANT:
    // Do NOT construct a fake Tenant object here.
    //
    // TenantManager owns the canonical Tenant representation.
    //
    // ========================================================================

    const tenant = await tenantManager.getById(
      provisioning.tenantId,
    );

    if (!tenant) {
      return errorResponse(
        [
          {
            code: "TENANT_PROVISIONING_FAILED",
            message: "Tenant was provisioned but could not be loaded from the tenant registry.",
          },
        ],
        500,
      );
    }

    // ========================================================================
    // 19. Convert canonical Tenant to PublicTenant
    // ========================================================================
    //
    // TenantManager.toPublic() delegates to TenantFactory.toPublicTenant().
    //
    // Therefore:
    //
    // dbConfig.password
    // dbConfig.username
    // dbConfig.host
    // dbConfig.port
    // connection settings
    // billing
    //
    // are never exposed by this API.
    //
    // ========================================================================

    const publicTenant = tenantManager.toPublic(
      tenant,
    );

    // ========================================================================
    // 20. Build response data
    // ========================================================================

    const responseData: CreateTenantResponseData = {
      tenant: publicTenant,
      provisioning,
    };

    // ========================================================================
    // 21. Success response
    // ========================================================================

    const response: ApiResponse<CreateTenantResponseData> = {
      success: true,
      data: responseData,
      meta: createMeta(),
    };

    return NextResponse.json(
      response,
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    // ========================================================================
    // 22. TenantError
    // ========================================================================

    if (error instanceof TenantError) {
      return errorResponse(
        [
          {
            code: error.code,
            message: error.message,
          },
        ],
        422,
      );
    }

    // ========================================================================
    // 23. Unexpected error
    // ========================================================================

    return errorResponse(
      [
        {
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "An unexpected server error occurred.",
        },
      ],
      500,
    );
  }
}