/**
 * app/api/tenant/route.ts
 *
 * AWM-ERP — Tenant API Root
 *
 * GET  /api/tenant
 * POST /api/tenant
 *
 * Specific operations live under:
 *
 * /api/tenant/create
 * /api/tenant/resolve
 * /api/tenant/switch
 * /api/tenant/info
 * /api/tenant/health
 */

import { NextResponse } from "next/server";

import type {
  ApiResponse,
} from "@/lib/tenant/types";

function createMeta() {
  return {
    timestamp: new Date().toISOString(),
  };
}

export async function GET(): Promise<NextResponse> {
  const response: ApiResponse<{
    service: string;
    version: string;
    endpoints: string[];
  }> = {
    success: true,
    data: {
      service: "AWM-ERP Tenant API",
      version: "1.0.0",
      endpoints: [
        "/api/tenant/create",
        "/api/tenant/resolve",
        "/api/tenant/switch",
        "/api/tenant/info",
        "/api/tenant/health",
      ],
    },
    meta: createMeta(),
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(): Promise<NextResponse> {
  const response: ApiResponse<never> = {
    success: false,
    errors: [
      {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST /api/tenant/create to create a tenant.",
      },
    ],
    meta: createMeta(),
  };

  return NextResponse.json(response, { status: 405 });
}