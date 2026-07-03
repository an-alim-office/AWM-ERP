import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * =====================================================
 * AWM ERP 2026 - ADVANCED SECURE LOGOUT API
 * =====================================================
 * Features:
 * ✅ Secure Cookie Removal
 * ✅ Session Revocation
 * ✅ Refresh Token Cleanup
 * ✅ Device Logout Tracking
 * ✅ Audit Logging
 * ✅ MongoDB Integration
 * ✅ Production Ready Security
 * ✅ Multi Device Support
 * ✅ Type Safety
 * ✅ Clean Error Handling
 * =====================================================
 */

const SESSION_COLLECTION = "sessions";
const AUDIT_COLLECTION = "audit_logs";

interface SessionPayload {
  token?: string;
  refreshToken?: string;
  userId?: string;
}

/**
 * =====================================================
 * Extract Cookie Value
 * =====================================================
 */
function extractCookieValue(
  cookieHeader: string,
  cookieName: string
): string | null {
  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    if (name === cookieName) {
      return value;
    }
  }

  return null;
}

/**
 * =====================================================
 * Logout API
 * =====================================================
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Processing secure logout request...");

    /**
     * ---------------------------------------------
     * Read Cookies
     * ---------------------------------------------
     */
    const cookieHeader =
      request.headers.get("cookie") || "";

    const authToken = extractCookieValue(
      cookieHeader,
      "auth_token"
    );

    const refreshToken = extractCookieValue(
      cookieHeader,
      "refresh_token"
    );

    /**
     * ---------------------------------------------
     * Request Metadata
     * ---------------------------------------------
     */
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      "Unknown IP";

    const userAgent =
      request.headers.get("user-agent") ||
      "Unknown Device";

    /**
     * ---------------------------------------------
     * MongoDB Connection
     * ---------------------------------------------
     */
    const db = await getDb();

    /**
     * ---------------------------------------------
     * Revoke Session
     * ---------------------------------------------
     */
    if (authToken) {
      await db.collection(SESSION_COLLECTION).updateMany(
        {
          token: authToken,
        },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            logoutAt: new Date(),
          },
        }
      );
    }

    /**
     * ---------------------------------------------
     * Remove Refresh Token
     * ---------------------------------------------
     */
    if (refreshToken) {
      await db
        .collection(SESSION_COLLECTION)
        .deleteMany({
          refreshToken,
        });
    }

    /**
     * ---------------------------------------------
     * Create Audit Log
     * ---------------------------------------------
     */
    await db.collection(AUDIT_COLLECTION).insertOne({
      event: "USER_LOGOUT",
      tokenExists: !!authToken,
      refreshExists: !!refreshToken,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });

    /**
     * ---------------------------------------------
     * Success Response
     * ---------------------------------------------
     */
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    /**
     * ---------------------------------------------
     * Remove Auth Cookie
     * ---------------------------------------------
     */
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    /**
     * ---------------------------------------------
     * Remove Refresh Cookie
     * ---------------------------------------------
     */
    response.cookies.set({
      name: "refresh_token",
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    /**
     * ---------------------------------------------
     * Remove Session Cookie
     * ---------------------------------------------
     */
    response.cookies.set({
      name: "session_id",
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    /**
     * ---------------------------------------------
     * Security Headers
     * ---------------------------------------------
     */
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    response.headers.set(
      "Pragma",
      "no-cache"
    );

    response.headers.set(
      "Expires",
      "0"
    );

    return response;
  } catch (error) {
    console.error(
      "Advanced Logout API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error occurred during logout",
      },
      { status: 500 }
    );
  }
}