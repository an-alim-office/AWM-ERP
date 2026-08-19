import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/identity/SessionManager";
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);
    }

    const sessionId = typeof (body as Record<string, unknown>).sessionId === "string" ? String((body as Record<string, unknown>).sessionId).trim() : "";
    if (!sessionId) return errorResponse("VALIDATION_ERROR", "sessionId is required.", 400);

    const revoked = sessionManager.revoke(sessionId);
    if (!revoked) return errorResponse("SESSION_NOT_FOUND", "Session not found.", 404);

    return NextResponse.json({ success: true, data: { revoked: true }, meta: meta() } satisfies ApiResponse<{ revoked: true }>, { status: 200 });
  } catch (error: unknown) {
    return errorResponse("SESSION_REVOKE_FAILED", error instanceof Error ? error.message : "Failed to revoke session.", 500);
  }
}