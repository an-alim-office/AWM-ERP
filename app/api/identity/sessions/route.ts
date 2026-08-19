import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/identity/SessionManager";
import type { ApiResponse } from "@/lib/tenant/types";
import type { SessionRecord } from "@/types/identity";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  const response: ApiResponse<never> = { success: false, errors: [{ code, message }], meta: meta() };
  return NextResponse.json(response, { status });
}

function parseObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId")?.trim();
    const userId = url.searchParams.get("userId")?.trim();

    if (!tenantId) return errorResponse("VALIDATION_ERROR", "tenantId is required.", 400);

    const sessions = sessionManager.list(tenantId, userId || undefined);
    const response: ApiResponse<{ sessions: SessionRecord[] }> = {
      success: true,
      data: { sessions },
      meta: meta(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("SESSION_LIST_FAILED", error instanceof Error ? error.message : "Failed to list sessions.", 500);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Request body must contain valid JSON.", 400);
    }

    if (!parseObject(body)) return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);

    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const ip = typeof body.ip === "string" ? body.ip.trim() : undefined;
    const userAgent = typeof body.userAgent === "string" ? body.userAgent.trim() : undefined;
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : undefined;
    const ttlMinutes = typeof body.ttlMinutes === "number" ? body.ttlMinutes : undefined;

    if (!tenantId || !userId) return errorResponse("VALIDATION_ERROR", "tenantId and userId are required.", 400);

    const session = sessionManager.create({ tenantId, userId, ip, userAgent, deviceId, ttlMinutes });

    const response: ApiResponse<{ session: SessionRecord }> = {
      success: true,
      data: { session },
      meta: meta(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    return errorResponse("SESSION_CREATE_FAILED", error instanceof Error ? error.message : "Failed to create session.", 500);
  }
}