import { NextResponse } from "next/server";
import { loginAttemptManager } from "@/lib/identity/LoginAttemptManager";
import type { ApiResponse } from "@/lib/tenant/types";

function meta() {
  return { timestamp: new Date().toISOString() };
}

function errorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, errors: [{ code, message }], meta: meta() } satisfies ApiResponse<never>, { status });
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenantId")?.trim();
  if (!tenantId) return errorResponse("VALIDATION_ERROR", "tenantId is required.", 400);

  const attempts = loginAttemptManager.listByTenant(tenantId);
  return NextResponse.json({ success: true, data: { attempts }, meta: meta() } satisfies ApiResponse<{ attempts: unknown[] }>, { status: 200 });
}