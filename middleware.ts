/**
 * middleware.ts
 *
 * AWM-ERP — Authentication + Multi-Tenant Middleware
 *
 * Responsibilities:
 * 1. JWT authentication
 * 2. Tenant identifier extraction (from JWT ONLY — never from client headers)
 * 3. Tenant context headers (re-injected into the downstream request)
 * 4. Public tenant API bypass
 * 5. Protected API enforcement
 *
 * SECURITY MODEL (read this before touching tenant logic):
 * - The tenant a request belongs to is determined SOLELY by the verified
 *   JWT payload (`payload.tenantId`), which is set once at login time by
 *   the auth/login route and signed with JWT_SECRET.
 * - A client-supplied `x-tenant-id` / `x-tenant-slug` header is NEVER
 *   trusted for authorization. If present, it is only used as a
 *   consistency check — a mismatch is treated as a spoofing attempt and
 *   the request is rejected with 403.
 * - This is what prevents "logged in as user@company-a.com but sends
 *   x-tenant-id: company-b" from ever reaching a route handler.
 * - Downstream API routes should read tenant/user context ONLY from the
 *   headers this middleware sets on the outgoing request
 *   (`x-tenant-id`, `x-auth-user-id`) — never re-parse the JWT or trust
 *   any other header for tenant scoping.
 * - Never expose JWT_SECRET.
 * - TenantResolver / TenantManager (in your route/service layer) should
 *   still re-validate that the tenantId is active/exists — this
 *   middleware only guarantees the tenantId is authentic, not that the
 *   tenant record is valid, active, or not-suspended.
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
// Tenant Identifier — SOURCE OF TRUTH IS THE JWT, NOT CLIENT HEADERS
// ============================================================================

/**
 * Extracts the trusted tenant identifier from the verified JWT payload.
 *
 * IMPORTANT: This intentionally does NOT read `x-tenant-id` /
 * `x-tenant-slug` from the incoming request. Those headers are
 * client-controlled and must never be treated as authoritative — doing
 * so would let any authenticated user access another tenant's data
 * simply by changing a header value.
 */
function getTrustedTenantFromPayload(
  payload: Record<string, unknown>,
): {
  tenantId?: string;
  tenantSlug?: string;
} {
  const tenantId =
    typeof payload.tenantId === "string" && payload.tenantId.trim()
      ? payload.tenantId.trim()
      : undefined;

  const tenantSlug =
    typeof payload.tenantSlug === "string" && payload.tenantSlug.trim()
      ? payload.tenantSlug.trim()
      : undefined;

  return {
    tenantId,
    tenantSlug,
  };
}

/**
 * If the client ALSO sent x-tenant-id / x-tenant-slug, treat any
 * mismatch against the JWT-derived tenant as a spoofing attempt.
 * (We don't require the client to send these — we only reject when
 * they're present AND wrong.)
 */
function clientTenantHeadersMismatch(
  request: NextRequest,
  trustedTenantId?: string,
  trustedTenantSlug?: string,
): boolean {
  const clientTenantId =
    request.headers.get("x-tenant-id")?.trim();
  const clientTenantSlug =
    request.headers.get("x-tenant-slug")?.trim();

  if (
    clientTenantId &&
    clientTenantId !== trustedTenantId
  ) {
    return true;
  }

  if (
    clientTenantSlug &&
    clientTenantSlug !== trustedTenantSlug
  ) {
    return true;
  }

  return false;
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
    // 5. Extract JWT subject (user)
    // ========================================================================

    const userId =
      typeof verified.payload.sub ===
      "string"
        ? verified.payload.sub
        : undefined;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Token is missing a valid subject (user id).",
          },
        },
        { status: 401 },
      );
    }

    // ========================================================================
    // 6. Extract tenant information — FROM THE JWT ONLY
    // ========================================================================

    const {
      tenantId,
      tenantSlug,
    } = getTrustedTenantFromPayload(
      verified.payload as Record<string, unknown>,
    );

    // A protected API request with no tenant bound to the token has no
    // business touching tenant-scoped data. Reject outright rather than
    // letting a downstream handler decide "no tenant = no filter".
    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TENANT_REQUIRED",
            message:
              "Authentication token is not associated with a tenant.",
          },
        },
        { status: 403 },
      );
    }

    // If the client also sent tenant headers that disagree with the
    // token's tenant, this is a spoofing/tenant-confusion attempt —
    // reject rather than silently preferring one source over the other.
    if (
      clientTenantHeadersMismatch(
        request,
        tenantId,
        tenantSlug,
      )
    ) {
      console.error(
        "[middleware] Tenant header mismatch for user:",
        userId,
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TENANT_MISMATCH",
            message:
              "Requested tenant does not match the authenticated tenant.",
          },
        },
        { status: 403 },
      );
    }

    // ========================================================================
    // 7. Build the downstream request with trusted, server-set headers
    // ========================================================================
    //
    // We rewrite the OUTGOING REQUEST headers (not just the response),
    // so that Route Handlers / Server Components reading
    // `request.headers` or `headers()` see the authoritative values.
    // Any client-sent x-tenant-id / x-tenant-slug / x-auth-user-id are
    // stripped and overwritten here — they must never pass through
    // unmodified.
    // ------------------------------------------------------------------------

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-auth-user-id", userId);
    requestHeaders.set("x-tenant-id", tenantId);

    if (tenantSlug) {
      requestHeaders.set("x-tenant-slug", tenantSlug);
    } else {
      requestHeaders.delete("x-tenant-slug");
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Also mirror on the response, in case anything downstream inspects
    // response headers directly (e.g. logging/observability).
    response.headers.set("x-auth-user-id", userId);
    response.headers.set("x-tenant-id", tenantId);

    if (tenantSlug) {
      response.headers.set("x-tenant-slug", tenantSlug);
    }

    // ========================================================================
    // 8. Return authenticated, tenant-scoped request
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