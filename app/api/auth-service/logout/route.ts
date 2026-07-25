import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    // cookies() is synchronous — no await
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;

    if (token) {
      const db = await getDb();
      const sessions = db.collection("sessions");

      await sessions.updateOne(
        { token },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            expiredAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    }

    // Build response with no-store to avoid caching
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Clear cookie securely
    // Note: In local HTTP dev, `secure: true` prevents cookie from being set/cleared.
    // If you face issues locally, make this conditional on NODE_ENV.
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: true, // consider: process.env.NODE_ENV === "production"
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    const err = error as { message?: string; stack?: string };
    console.error("Logout API error:", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Server error during logout.",
      },
      { status: 500 }
    );
  }
}
