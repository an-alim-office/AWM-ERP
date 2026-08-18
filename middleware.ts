/**
 * middleware.ts
 *
 * AWM-ERP — Authentication + Multi-Tenant Middleware
 *
 * Responsibilities:
 * 1. JWT authentication
 * 2. Tenant identifier extraction
 * 3. Tenant context headers
 * 4. Public tenant API bypass
 * 5. Protected API enforcement
 *
 * IMPORTANT:
 * - Never expose JWT_SECRET.
 * - Never trust a client-provided tenant blindly.
 * - TenantResolver / TenantManager remains the source of truth.
 */

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  jwtVerify,
} from "jose";

// ============================================================================
// Constants
// ============================================================================

const PUBLIC_TENANT_ROUTES = [
  "/api/tenant/create",
  "/api/tenant/health",
  "/api/tenant/resolve",
];

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/public",
];

// ============================================================================
// Helpers
// ============================================================================

function isExactOrChildPath(
  pathname: string,
  route: string,
): boolean {
  return (
    pathname === route ||
    pathname.startsWith(`${route}/`)
  );
}

function isPublicRoute(
  pathname: string,
): boolean {
  return (
    PUBLIC_ROUTES.some(
      (route) =>
        isExactOrChildPath(
          pathname,
          route,
        ),
    ) ||
    PUBLIC_TENANT_ROUTES.some(
      (route) =>
        isExactOrChildPath(
          pathname,
          route,
        ),
    )
  );
}

// ============================================================================
// JWT Secret
// ============================================================================

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET;

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "JWT_SECRET must be configured and contain at least 32 characters.",
    );
  }

  return new TextEncoder().encode(
    secret,
  );
}

// ============================================================================
// Authorization
// ============================================================================

function getBearerToken(
  request: NextRequest,
): string | null {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (!authorization) {
    return null;
  }

  const parts =
    authorization.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !==
      "bearer"
  ) {
    return null;
  }

  return parts[1] || null;
}

// ============================================================================
// Tenant Identifier
// ============================================================================

function getTenantIdentifier(
  request: NextRequest,
): {
  tenantId?: string;
  tenantSlug?: string;
} {
  const tenantId =
    request.headers
      .get("x-tenant-id")
      ?.trim() || undefined;

  const tenantSlug =
    request.headers
      .get("x-tenant-slug")
      ?.trim() || undefined;

  return {
    tenantId,
    tenantSlug,
  };
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(
  request: NextRequest,
): Promise<NextResponse> {
  const pathname =
    request.nextUrl.pathname;

  // ==========================================================================
  // 1. Public route
  // ==========================================================================

  if (
    isPublicRoute(pathname)
  ) {
    return NextResponse.next();
  }

  // ==========================================================================
  // 2. Only API routes should be handled here
  // ==========================================================================

  if (
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // ==========================================================================
  // 3. Read JWT
  // ==========================================================================

  const token =
    getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      {
        success: false,

        error: {
          code:
            "UNAUTHORIZED",

          message:
            "Authentication token is required.",
        },
      },
      {
        status: 401,
      },
    );
  }

  // ==========================================================================
  // 4. Verify JWT
  // ==========================================================================

  try {
    const secret =
      getJwtSecret();

    const verified =
      await jwtVerify(
        token,
        secret,
        {
          algorithms: ["HS256"],
        },
      );

    // ========================================================================
    // 5. Extract JWT subject
    // ========================================================================

    const userId =
      typeof verified.payload.sub ===
      "string"
        ? verified.payload.sub
        : undefined;

    // ========================================================================
    // 6. Extract tenant information
    // ========================================================================

    const {
      tenantId,
      tenantSlug,
    } =
      getTenantIdentifier(
        request,
      );

    // ========================================================================
    // 7. Build response
    // ========================================================================

    const response =
      NextResponse.next();

    // ------------------------------------------------------------------------
    // Auth context
    // ------------------------------------------------------------------------

    if (userId) {
      response.headers.set(
        "x-auth-user-id",
        userId,
      );
    }

    // ------------------------------------------------------------------------
    // Tenant context
    // ------------------------------------------------------------------------
    //
    // These headers are internal middleware context.
    // TenantResolver / TenantManager should still validate the tenant.
    //
    // ------------------------------------------------------------------------

    if (tenantId) {
      response.headers.set(
        "x-tenant-id",
        tenantId,
      );
    }

    if (tenantSlug) {
      response.headers.set(
        "x-tenant-slug",
        tenantSlug,
      );
    }

    // ========================================================================
    // 8. Return authenticated request
    // ========================================================================

    return response;
  } catch (error: unknown) {
    // ------------------------------------------------------------------------
    // Invalid JWT
    // ------------------------------------------------------------------------

    if (
      error instanceof Error
    ) {
      console.error(
        "[middleware] JWT verification failed:",
        error.message,
      );
    }

    return NextResponse.json(
      {
        success: false,

        error: {
          code:
            "INVALID_TOKEN",

          message:
            "Authentication token is invalid or expired.",
        },
      },
      {
        status: 401,
      },
    );
  }
}

// ============================================================================
// Matcher
// ============================================================================

export const config = {
  matcher: [
    "/api/:path*",
  ],
};