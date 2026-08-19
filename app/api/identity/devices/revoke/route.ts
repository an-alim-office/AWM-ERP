import { NextResponse } from "next/server";
import { deviceManager } from "@/lib/identity/DeviceManager";
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
    const deviceId = typeof (body as Record<string, unknown>).deviceId === "string" ? String((body as Record<string, unknown>).deviceId).trim() : "";

    if (!tenantId || !userId || !deviceId) return errorResponse("VALIDATION_ERROR", "tenantId, userId, and deviceId are required.", 400);

    const revoked = deviceManager.revoke(tenantId, userId, deviceId);
    if (!revoked) return errorResponse("DEVICE_NOT_FOUND", "Device not found.", 404);

    return NextResponse.json({ success: true, data: { revoked: true }, meta: meta() } satisfies ApiResponse<{ revoked: true }>, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("DEVICE_REVOKE_FAILED", error instanceof Error ? error.message : "Failed to revoke device.", 500);
  }
}