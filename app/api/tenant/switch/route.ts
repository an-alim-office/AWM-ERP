/**
 * app/api/tenant/switch/route.ts
 *
 * AWM-ERP — Tenant Switch API
 *
 * POST /api/tenant/switch
 * Body: { "targetSlugOrId": "acme" }
 */

import { NextResponse } from "next/server";
import type {
  ApiError,
  ApiResponse,
  SwitchTenantRequest,
  SwitchTenantResponse,
  SwitchTenantResponseData,
} from "@/lib/tenant/types";
import { TenantError } from "@/lib/tenant/types";
import { tenantManager } from "@/lib/tenant/TenantManager";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  const response: ApiResponse<never> = {
    success: false,
    errors: [{ code, message }],
    meta: meta(),
  };

  return NextResponse.json(response, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Request body must contain valid JSON.", 400);
    }

    if (!isRecord(body)) {
      return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);
    }

    const targetSlugOrId = isString(body.targetSlugOrId) ? body.targetSlugOrId.trim() : "";
    if (!targetSlugOrId) {
      return errorResponse("VALIDATION_ERROR", "targetSlugOrId is required.", 400);
    }

    const switchRequest: SwitchTenantRequest = {
      targetSlugOrId,
    };

    const tenant = await tenantManager.switchTenant(switchRequest.targetSlugOrId);
    const publicTenant = tenantManager.toPublic(tenant);

    const data: SwitchTenantResponseData = {
      tenant: publicTenant,
    };

    const response: SwitchTenantResponse = {
      success: true,
      data,
      meta: meta(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof TenantError) {
      const status =
        error.code === "TENANT_NOT_FOUND"
          ? 404
          : error.code === "TENANT_SUSPENDED" || error.code === "TENANT_ARCHIVED"
            ? 403
            : 422;

      const response: SwitchTenantResponse = {
        success: false,
        errors: [{ code: error.code, message: error.message }],
        meta: meta(),
      };

      return NextResponse.json(response, { status });
    }

    const response: SwitchTenantResponse = {
      success: false,
      errors: [
        {
          code: "TENANT_RESOLUTION_FAILED",
          message: error instanceof Error ? error.message : "Tenant switch failed.",
        },
      ],
      meta: meta(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}