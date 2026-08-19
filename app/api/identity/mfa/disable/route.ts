import { NextResponse } from "next/server";
import { mfaManager } from "@/lib/identity/MfaManager";
import type { ApiResponse } from "@/lib/tenant/types";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, errors: [{ code, message }], meta: meta() } satisfies ApiResponse<never>, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);

    const tenantId = typeof (body as Record<string, unknown>).tenantId === "string" ? String((body as Record<string, unknown>).tenantId).trim() : "";
    const userId = typeof (body as Record<string, unknown>).userId === "string" ? String((body as Record<string, unknown>).userId).trim() : "";

    if (!tenantId || !userId) return errorResponse("VALIDATION_ERROR", "tenantId and userId are required.", 400);

    const disabled = mfaManager.disable(tenantId, userId);
    if (!disabled) return errorResponse("MFA_NOT_FOUND", "MFA enrollment not found.", 404);

    return NextResponse.json({ success: true, data: { disabled: true }, meta: meta() } satisfies ApiResponse<{ disabled: true }>, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("MFA_DISABLE_FAILED", error instanceof Error ? error.message : "Failed to disable MFA.", 500);
  }
}