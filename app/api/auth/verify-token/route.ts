import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Safe ObjectId converter
function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // cookies() is sync — do NOT await
    const cookieStore = await cookies();
   const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "AUTH_TOKEN_MISSING",
          message: "No auth token found. Please log in.",
        },
        { status: 401 }
      );
    }

    const db = await getDb();
    const sessions = db.collection("sessions");
    const users = db.collection("users");

    type SessionDoc = {
      _id: ObjectId;
      token: string;
      userId: string;
      revoked?: boolean;
      expiresAt?: Date | string | null;
      expiredAt?: Date | string | null;
      updatedAt?: Date | string | null;
    };

    // Find session by raw token (adjust if you store a hash)
    const session = await sessions.findOne<SessionDoc>({ token });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "SESSION_NOT_FOUND",
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // Revoked
    if (session.revoked === true) {
      await sessions.updateOne(
        { _id: session._id },
        { $set: { expiredAt: new Date(), updatedAt: new Date() } }
      );
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "SESSION_REVOKED",
          message: "This session has been logged out. Please log in again.",
        },
        { status: 401 }
      );
    }

    // Expired
    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
    if (expiresAt && expiresAt < new Date()) {
      await sessions.updateOne(
        { _id: session._id },
        { $set: { expiredAt: new Date(), updatedAt: new Date() } }
      );
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "SESSION_EXPIRED",
          message: "Session has expired.",
        },
        { status: 401 }
      );
    }

    // Optional: auto-renew (+30 min)
    const newExpiry = new Date(Date.now() + 1000 * 60 * 30);
    await sessions.updateOne(
      { _id: session._id },
      { $set: { expiresAt: newExpiry, updatedAt: new Date() } }
    );

    // Load user
    const userObjectId = toObjectId(session.userId);
    if (!userObjectId) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "USER_ID_INVALID",
          message: "Invalid user reference on session.",
        },
        { status: 401 }
      );
    }

    const user = await users.findOne<{
      _id: ObjectId;
      name?: string;
      email?: string;
      role?: string;
      password?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>(
      { _id: userObjectId },
      {
        projection: {
          password: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          error: "USER_NOT_FOUND",
          message: "User not found.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAuthorized: true,
        message: "User verified successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const err = error as { message?: string; stack?: string };
    console.error("verify-token route error:", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        isAuthorized: false,
        error: "SERVER_ERROR",
        message: "Server error during verification.",
      },
      { status: 500 }
    );
  }
}
