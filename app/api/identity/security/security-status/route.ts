import { NextResponse } from "next/server";
import { identityManager } from "@/lib/identity/IdentityManager";
import { DEFAULT_SECURITY_POLICY } from "@/lib/identity/SecurityPolicy";
import type { ApiResponse } from "@/lib/tenant/types";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, errors: [{ code, message }], meta: meta() } satisfies ApiResponse<never>,
    { status },
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId");
    const userId = url.searchParams.get("userId");

    if (!isString(tenantId) || !tenantId.trim() || !isString(userId) || !userId.trim()) {
      return errorResponse("VALIDATION_ERROR", "tenantId and userId are required.", 400);
    }

    const status = identityManager.getPublicStatus(tenantId.trim(), userId.trim(), DEFAULT_SECURITY_POLICY);

    return NextResponse.json(
      { success: true, data: { status }, meta: meta() } satisfies ApiResponse<{ status: typeof status }>,
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(
      "SECURITY_STATUS_FAILED",
      error instanceof Error ? error.message : "Failed to load security status.",
      500,
    );
  }
}