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
    const method = typeof (body as Record<string, unknown>).method === "string" ? String((body as Record<string, unknown>).method) : "totp";

    if (!tenantId || !userId) return errorResponse("VALIDATION_ERROR", "tenantId and userId are required.", 400);

    const result = mfaManager.enroll({ tenantId, userId, method: method as "totp" | "backup-code" | "sms" | "email" });
    return NextResponse.json({ success: true, data: result, meta: meta() } satisfies ApiResponse<typeof result>, { status: 201 });
  } catch (error: unknown) {
    return errorResponse("MFA_ENROLL_FAILED", error instanceof Error ? error.message : "Failed to enroll MFA.", 500);
  }
}