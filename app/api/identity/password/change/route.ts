import { NextResponse } from "next/server";
import { passwordManager } from "@/lib/identity/PasswordManager";
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
    const currentPassword = typeof (body as Record<string, unknown>).currentPassword === "string" ? String((body as Record<string, unknown>).currentPassword) : "";
    const newPassword = typeof (body as Record<string, unknown>).newPassword === "string" ? String((body as Record<string, unknown>).newPassword) : "";

    if (!tenantId || !userId || !currentPassword || !newPassword) {
      return errorResponse("VALIDATION_ERROR", "tenantId, userId, currentPassword, and newPassword are required.", 400);
    }

    const currentHash = passwordManager.hash(currentPassword);
    const result = passwordManager.change({ tenantId, userId, currentPassword, newPassword }, currentHash);

    if (!result.ok) return errorResponse("PASSWORD_CHANGE_FAILED", result.issues[0] ?? "Password change failed.", 422);

    return NextResponse.json({ success: true, data: { passwordChanged: true, newHash: result.newHash }, meta: meta() } satisfies ApiResponse<{ passwordChanged: true; newHash?: string }>, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("PASSWORD_CHANGE_ERROR", error instanceof Error ? error.message : "Failed to change password.", 500);
  }
}