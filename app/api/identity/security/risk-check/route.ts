import { NextResponse } from "next/server";
import { riskEngine } from "@/lib/identity/RiskEngine";
import type { ApiResponse } from "@/lib/tenant/types";
import type { RiskCheckInput } from "@/types/identity";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, errors: [{ code, message }], meta: meta() } satisfies ApiResponse<never>,
    { status },
  );
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);
    }

    const input = body as Record<string, unknown>;

    const tenantId = isString(input.tenantId) ? input.tenantId.trim() : "";
    const ip = isString(input.ip) ? input.ip.trim() : "";
    const userId = isString(input.userId) ? input.userId.trim() : undefined;
    const userAgent = isString(input.userAgent) ? input.userAgent.trim() : undefined;
    const deviceId = isString(input.deviceId) ? input.deviceId.trim() : undefined;
    const sessionId = isString(input.sessionId) ? input.sessionId.trim() : undefined;
    const mfaEnabled = isBoolean(input.mfaEnabled) ? input.mfaEnabled : undefined;
    const trustedDevice = isBoolean(input.trustedDevice) ? input.trustedDevice : undefined;

    if (!tenantId || !ip) {
      return errorResponse("VALIDATION_ERROR", "tenantId and ip are required.", 400);
    }

    const riskInput: RiskCheckInput = {
      tenantId,
      userId,
      ip,
      userAgent,
      deviceId,
      sessionId,
      mfaEnabled,
      trustedDevice,
    };

    const result = riskEngine.assess(riskInput);

    return NextResponse.json(
      { success: true, data: result, meta: meta() } satisfies ApiResponse<typeof result>,
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(
      "RISK_CHECK_FAILED",
      error instanceof Error ? error.message : "Failed to compute risk.",
      500,
    );
  }
}