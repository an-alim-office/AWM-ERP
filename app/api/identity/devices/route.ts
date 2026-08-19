import { NextResponse } from "next/server";
import { deviceManager } from "@/lib/identity/DeviceManager";
import type { ApiResponse } from "@/lib/tenant/types";
import type { DeviceRecord } from "@/types/identity";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, errors: [{ code, message }], meta: meta() } satisfies ApiResponse<never>, { status });
}

function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId")?.trim();
    const userId = url.searchParams.get("userId")?.trim();

    if (!tenantId || !userId) return errorResponse("VALIDATION_ERROR", "tenantId and userId are required.", 400);

    const devices = deviceManager.list(tenantId, userId);
    return NextResponse.json({ success: true, data: { devices }, meta: meta() } satisfies ApiResponse<{ devices: DeviceRecord[] }>, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("DEVICE_LIST_FAILED", error instanceof Error ? error.message : "Failed to list devices.", 500);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!isObj(body)) return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);

    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const fingerprint = typeof body.fingerprint === "string" ? body.fingerprint.trim() : "";
    const ip = typeof body.ip === "string" ? body.ip.trim() : undefined;
    const userAgent = typeof body.userAgent === "string" ? body.userAgent.trim() : undefined;

    if (!tenantId || !userId || !name || !fingerprint) {
      return errorResponse("VALIDATION_ERROR", "tenantId, userId, name, and fingerprint are required.", 400);
    }

    const device = deviceManager.register({ tenantId, userId, name, fingerprint, ip, userAgent });
    return NextResponse.json({ success: true, data: { device }, meta: meta() } satisfies ApiResponse<{ device: DeviceRecord }>, { status: 201 });
  } catch (error: unknown) {
    return errorResponse("DEVICE_CREATE_FAILED", error instanceof Error ? error.message : "Failed to register device.", 500);
  }
}