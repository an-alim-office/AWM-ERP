import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";

/**
 * =====================================
 * AWM ERP 2026 - TOKEN VERIFICATION
 * - JWT/Session ready structure
 * - DB-backed auth validation
 * - Device-aware authorization layer ready
 * =====================================
 */

export async function GET() {
  try {
    console.log("Verifying authentication token...");

    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "No auth token found. Please login.",
        },
        { status: 401 }
      );
    }

    const db = await getDb();

    /**
     * SESSION LOOKUP (recommended production approach)
     * Replace dummy token validation with DB session tracking
     */
    const session = await db
      .collection("sessions")
      .findOne({ token });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    /**
     * OPTIONAL: EXPIRY CHECK
     */
    if (
      session.expiresAt &&
      new Date(session.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "Session expired.",
        },
        { status: 401 }
      );
    }

    /**
     * USER FETCH
     */
    const user = await db
      .collection("users")
      .findOne(
        { email: session.email },
        {
          projection: {
            password: 0,
          },
        }
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "User not found.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAuthorized: true,
        message: "User authenticated successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Token Verification Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error during authentication.",
      },
      { status: 500 }
    );
  }
}