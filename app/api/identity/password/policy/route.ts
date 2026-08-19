import { NextResponse } from "next/server";
import { DEFAULT_SECURITY_POLICY } from "@/lib/identity/SecurityPolicy";
import type { ApiResponse } from "@/lib/tenant/types";

function meta() {
  return { timestamp: new Date().toISOString() };
}

export async function GET(): Promise<NextResponse> {
  const response: ApiResponse<typeof DEFAULT_SECURITY_POLICY> = {
    success: true,
    data: DEFAULT_SECURITY_POLICY,
    meta: meta(),
  };

  return NextResponse.json(response, { status: 200 });
}