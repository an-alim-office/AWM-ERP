/**
 * app/api/tenant/info/route.ts
 *
 * AWM-ERP — Tenant Information API
 *
 * GET /api/tenant/info
 *
 * Supported tenant identifiers:
 *   /api/tenant/info?tenantId=...
 *   /api/tenant/info?slug=...
 *
 * Headers:
 *   x-tenant-id: ...
 *   x-tenant-slug: ...
 *
 * IMPORTANT:
 * Database credentials are never exposed.
 */

import { NextResponse } from "next/server";

import type {
  ApiError,
  ApiResponse,
  PublicTenant,
  Tenant,
} from "@/lib/tenant/types";

import { TenantError } from "@/lib/tenant/types";
import { tenantRegistry } from "@/lib/tenant/TenantRegistry";

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

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function trimmed(value: unknown): string | undefined {
  if (!isString(value)) return undefined;
  const result = value.trim();
  return result || undefined;
}

// ============================================================================
// Convert Tenant -> PublicTenant
// ============================================================================

function toPublicTenant(tenant: Tenant): PublicTenant {
  const { dbConfig, billing, ...tenantWithoutSensitiveData } = tenant;

  void billing;

  return {
    ...tenantWithoutSensitiveData,
    dbConfig: {
      provider: dbConfig.provider,
    },
  };
}

// ============================================================================
// Tenant Identifier
// ============================================================================

function getIdentifier(request: Request): {
  tenantId?: string;
  slug?: string;
} {
  const url = new URL(request.url);

  return {
    tenantId:
      trimmed(url.searchParams.get("tenantId")) ??
      trimmed(request.headers.get("x-tenant-id")),

    slug:
      trimmed(url.searchParams.get("slug")) ??
      trimmed(request.headers.get("x-tenant-slug")),
  };
}

// ============================================================================
// GET /api/tenant/info
// ============================================================================

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { tenantId, slug } = getIdentifier(request);

    if (!tenantId && !slug) {
      const response: ApiResponse<never> = {
        success: false,
        errors: [
          {
            code: "TENANT_NOT_FOUND",
            message: "Tenant identifier is required. Provide tenantId or slug.",
          },
        ],
        meta: createMeta(),
      };

      return NextResponse.json(response, { status: 400 });
    }

    let tenant: Tenant | null = null;

    if (tenantId) {
      tenant = await tenantRegistry.getById(tenantId);
    }

    if (!tenant && slug) {
      tenant = await tenantRegistry.getBySlug(slug);
    }

    if (!tenant) {
      const identifier = tenantId ? `Tenant "${tenantId}"` : `Tenant "${slug}"`;

      const response: ApiResponse<never> = {
        success: false,
        errors: [
          {
            code: "TENANT_NOT_FOUND",
            message: `${identifier} was not found.`,
          },
        ],
        meta: createMeta(),
      };

      return NextResponse.json(response, { status: 404 });
    }

    const publicTenant = toPublicTenant(tenant);

    const response: ApiResponse<{
      tenant: PublicTenant;
    }> = {
      success: true,
      data: {
        tenant: publicTenant,
      },
      meta: createMeta(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof TenantError) {
      const response: ApiResponse<never> = {
        success: false,
        errors: [
          {
            code: error.code,
            message: error.message,
          },
        ],
        meta: createMeta(),
      };

      return NextResponse.json(response, { status: 422 });
    }

    const response: ApiResponse<never> = {
      success: false,
      errors: [
        {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve tenant information.",
        },
      ],
      meta: createMeta(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}