/**
 * app/api/tenant/resolve/route.ts
 *
 * AWM-ERP — Tenant Resolution API
 *
 * GET /api/tenant/resolve
 *
 * Supported:
 *   ?slug=acme
 *   ?customDomain=erp.acme.com
 *   ?headerValue=tenant-id
 *
 * Headers:
 *   x-tenant-id: tenant-id
 *   x-tenant-slug: acme
 *
 * Resolution is delegated to TenantResolver.
 */

import { NextRequest, NextResponse } from "next/server";

import type {
  ApiError,
  ApiResponse,
  PublicTenant,
  Tenant,
} from "@/lib/tenant/types";

import { TenantError } from "@/lib/tenant/types";
import { tenantResolver } from "@/lib/tenant/TenantResolver";

// ============================================================================
// Response Types
// ============================================================================

interface TenantResolveData {
  tenant: PublicTenant;
  source: string;
  resolvedAt: Date;
}

// ============================================================================
// Helpers
// ============================================================================

function createMeta() {
  return {
    timestamp: new Date().toISOString(),
  };
}

function errorResponse(errors: ApiError[], status: number): NextResponse {
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

/**
 * Converts the server-side Tenant object into a client-safe tenant object.
 *
 * Database credentials and billing information must never be exposed
 * through this API.
 */
function toPublicTenant(
  tenant: Tenant,
): PublicTenant {
  const { dbConfig, billing, ...publicTenant } = tenant;

  void dbConfig;
  void billing;

  return {
    ...publicTenant,
    dbConfig: {
      provider: dbConfig.provider,
    },
  };
}

// ============================================================================
// GET /api/tenant/resolve
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    // ------------------------------------------------------------------------
    // 1. Read incoming values
    // ------------------------------------------------------------------------

    const url = request.nextUrl;

    const slug = trimmed(url.searchParams.get("slug"));
    const customDomain = trimmed(url.searchParams.get("customDomain"));
    const headerValue = trimmed(url.searchParams.get("headerValue"));
    const tenantIdHeader = trimmed(request.headers.get("x-tenant-id"));
    const tenantSlugHeader = trimmed(request.headers.get("x-tenant-slug"));

    // ------------------------------------------------------------------------
    // 2. Validate input
    // ------------------------------------------------------------------------

    if (
      !slug &&
      !customDomain &&
      !headerValue &&
      !tenantIdHeader &&
      !tenantSlugHeader
    ) {
      return errorResponse(
        [
          {
            code: "TENANT_RESOLUTION_FAILED",
            message:
              "Tenant resolution requires slug, customDomain, headerValue, x-tenant-id, or x-tenant-slug.",
          },
        ],
        400,
      );
    }

    // ------------------------------------------------------------------------
    // 3. Build resolver request
    // ------------------------------------------------------------------------
    //
    // TenantResolver is configured through TenantConfig.ts.
    //
    // We do NOT call guessed methods such as:
    //
    //   resolveBySlug()
    //   resolveById()
    //   resolveByDomain()
    //
    // Only the existing:
    //
    //   tenantResolver.resolve(request)
    //
    // is used.
    //
    // ------------------------------------------------------------------------

    const resolverUrl = new URL(request.url);

    // ------------------------------------------------------------------------
    // 4. Explicit slug
    // ------------------------------------------------------------------------
    //
    // TenantResolver reads its configured query parameter.
    // TenantConfig ultimately gets this from:
    //
    // TENANT_QUERY_PARAM
    //
    // We cannot safely assume its name here, so the existing request
    // is copied and the slug is placed in the "slug" parameter only
    // when the route itself was explicitly called with ?slug=.
    //
    // ------------------------------------------------------------------------

    if (slug) {
      resolverUrl.searchParams.set("slug", slug);
    }

    // ------------------------------------------------------------------------
    // 5. Explicit custom domain
    // ------------------------------------------------------------------------

    if (customDomain) {
      resolverUrl.searchParams.set("customDomain", customDomain);
    }

    // ------------------------------------------------------------------------
    // 6. Explicit headerValue
    // ------------------------------------------------------------------------

    if (headerValue) {
      resolverUrl.searchParams.set("headerValue", headerValue);
    }

    // ------------------------------------------------------------------------
    // 7. Preserve tenant headers
    // ------------------------------------------------------------------------

    const resolverHeaders = new Headers(request.headers);

    if (tenantIdHeader) {
      resolverHeaders.set("x-tenant-id", tenantIdHeader);
    }

    if (tenantSlugHeader) {
      resolverHeaders.set("x-tenant-slug", tenantSlugHeader);
    }

    // ------------------------------------------------------------------------
    // 8. Create NextRequest for TenantResolver
    // ------------------------------------------------------------------------

    const resolverRequest = new NextRequest(
      new Request(resolverUrl.toString(), {
        method: "GET",
        headers: resolverHeaders,
      }),
    );

    // ------------------------------------------------------------------------
    // 9. Resolve tenant
    // ------------------------------------------------------------------------

    const resolved = await tenantResolver.resolve(resolverRequest);

    // ------------------------------------------------------------------------
    // 10. Public tenant
    // ------------------------------------------------------------------------

    const publicTenant = toPublicTenant(resolved.tenant);

    // ------------------------------------------------------------------------
    // 11. Build response
    // ------------------------------------------------------------------------

    const response: ApiResponse<TenantResolveData> = {
      success: true,
      data: {
        tenant: publicTenant,
        source: resolved.source,
        resolvedAt: resolved.resolvedAt,
      },
      meta: createMeta(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    // ------------------------------------------------------------------------
    // TenantError
    // ------------------------------------------------------------------------

    if (error instanceof TenantError) {
      const status = error.code === "TENANT_NOT_FOUND" ? 404 : 422;

      return errorResponse(
        [
          {
            code: error.code,
            message: error.message,
          },
        ],
        status,
      );
    }

    // ------------------------------------------------------------------------
    // Generic error
    // ------------------------------------------------------------------------

    return errorResponse(
      [
        {
          code: "TENANT_RESOLUTION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Tenant resolution failed.",
        },
      ],
      500,
    );
  }
}