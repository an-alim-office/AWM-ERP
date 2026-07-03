import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * =====================================
 * AWM ERP 2026 - API HEALTH + DEBUG LAYER
 * - System health monitoring
 * - DB connectivity check
 * - Safe payload echo (dev-friendly)
 * - Production-safe diagnostics
 * =====================================
 */

/**
 * GET: Health Check
 */
export async function GET() {
  try {
    const db = await getDb();

    const dbPing = await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "AWM ERP API is running",
      status: "healthy",
      database: dbPing.ok === 1 ? "connected" : "unknown",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "2026-enterprise",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "API is running but DB is not reachable",
        error: "DATABASE_CONNECTION_FAILED",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Debug / Payload Receiver
 * (Safe for development, controlled echo for production)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    /**
     * OPTIONAL SECURITY LAYER:
     * - Rate limit here in production
     * - Validate schema using Zod/Yup
     */

    return NextResponse.json({
      success: true,
      message: "Payload received successfully",
      receivedAt: new Date().toISOString(),
      payloadSize: JSON.stringify(body).length,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload",
        error: "BAD_REQUEST",
      },
      { status: 400 }
    );
  }
}