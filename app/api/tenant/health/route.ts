/**
 * app/api/tenant/health/route.ts
 *
 * AWM-ERP — Tenant Health API
 *
 * GET /api/tenant/health
 * GET /api/tenant/health?tenantId=...
 */

import { NextResponse } from "next/server";
import type {
  TenantHealthCheckResult,
  TenantHealthResponse,
  TenantHealthStatus,
} from "@/lib/tenant/types";
import { TenantError } from "@/lib/tenant/types";
import { masterRegistry } from "@/database/tenants/MasterRegistry";
import { TenantConfig } from "@/lib/tenant/TenantConfig";

function createMeta() {
  return {
    timestamp: new Date().toISOString(),
  };
}

function getTenantIdentifier(request: Request): string | undefined {
  const url = new URL(request.url);

  const queryTenant = url.searchParams.get("tenantId");
  if (queryTenant && queryTenant.trim()) {
    return queryTenant.trim();
  }

  const headerTenant = request.headers.get("x-tenant-id");
  if (headerTenant && headerTenant.trim()) {
    return headerTenant.trim();
  }

  return undefined;
}

function buildResponse(
  success: boolean,
  data?: TenantHealthCheckResult,
  errors?: Array<{ code: string; message: string }>,
): TenantHealthResponse {
  const response: TenantHealthResponse = {
    success,
    meta: createMeta(),
    ...(data ? { data } : {}),
    ...(errors ? { errors } : {}),
  };

  return response;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const tenantIdentifier = getTenantIdentifier(request);

    const registryHealth = await masterRegistry.healthCheck();

    let tenantExists: boolean | undefined;
    if (tenantIdentifier) {
      const tenant = await masterRegistry.getTenantById(tenantIdentifier);
      tenantExists = tenant !== null;
    }

    const dbStatus: TenantHealthStatus = registryHealth.healthy
      ? "healthy"
      : "unreachable";
    const status = registryHealth.healthy ? 200 : 503;

    const messageParts = [
      `Master registry (${TenantConfig.master.provider}) is ${
        registryHealth.healthy ? "reachable" : "unreachable"
      }.`,
    ];

    if (tenantIdentifier) {
      messageParts.push(
        tenantExists
          ? `Tenant "${tenantIdentifier}" was found.`
          : `Tenant "${tenantIdentifier}" was not found.`,
      );
    }

    const result: TenantHealthCheckResult = {
      tenantId: tenantIdentifier ?? "system",
      dbStatus,
      latencyMs: registryHealth.latencyMs,
      lastCheckedAt: new Date(),
      message: messageParts.join(" "),
    };

    const response = buildResponse(true, result);

    return NextResponse.json(response, { status });
  } catch (error: unknown) {
    if (error instanceof TenantError) {
      const response = buildResponse(false, undefined, [
        {
          code: error.code,
          message: error.message,
        },
      ]);

      return NextResponse.json(response, { status: 503 });
    }

    const response = buildResponse(false, undefined, [
      {
        code: "TENANT_DB_CONNECTION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Tenant health check failed.",
      },
    ]);

    return NextResponse.json(response, { status: 503 });
  }
}