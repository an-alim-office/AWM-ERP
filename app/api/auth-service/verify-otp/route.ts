import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import {
  hashOTP,
  isValidEmail,
  normalizeEmail,
  normalizeOtpType,
  OTP_TYPE_REGISTRATION,
  OTP_TYPE_FORGOT_PASSWORD,
  generateSessionToken,
} from "@/lib/otp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "INVALID_JSON", message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const rawEmail = body?.email;
    const otp = body?.otp;
    const deviceId = body?.deviceId || null;
    const type = normalizeOtpType(body?.type);
    const trustedDevice = !!body?.trustedDevice;

    if (
      !rawEmail ||
      typeof rawEmail !== "string" ||
      !otp ||
      typeof otp !== "string" ||
      otp.length !== 6
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FIELDS",
          message: "Email and 6-digit OTP are required.",
        },
        { status: 400 }
      );
    }

    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_EMAIL",
          message: "Valid email is required.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");
    const sessions = db.collection("sessions");

    const now = new Date();

    const otpRecord = await otps.findOne(
      {
        email,
        type,
        consumed: false,
        expiresAt: { $gt: now },
      },
      { sort: { createdAt: -1 } }
    );

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP_NOT_FOUND",
          message: "Invalid or expired OTP.",
        },
        { status: 400 }
      );
    }

    const maxAttempts = 5;

    if (otpRecord.attempts >= maxAttempts) {
      await otps.updateOne(
        { _id: otpRecord._id },
        { $set: { consumed: true, invalidatedAt: new Date() } }
      );

      return NextResponse.json(
        {
          success: false,
          error: "OTP_LOCKED",
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    const inputOtpHash = hashOTP(otp);

    if (otpRecord.otpHash !== inputOtpHash) {
      const newAttempts = otpRecord.attempts + 1;
      const remainingAttempts = maxAttempts - newAttempts;

      await otps.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 }, $set: { updatedAt: new Date() } }
      );

      return NextResponse.json(
        {
          success: false,
          error: "INVALID_OTP",
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        },
        { status: 400 }
      );
    }

    await otps.updateOne(
      { _id: otpRecord._id },
      {
        $set: {
          consumed: true,
          consumedAt: new Date(),
          verifiedDeviceId: deviceId,
        },
      }
    );

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "USER_NOT_FOUND",
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // REGISTRATION FLOW
    if (type === OTP_TYPE_REGISTRATION) {
      await users.updateOne(
        { email },
        {
          $set: {
            isVerified: true,
            verifiedAt: new Date(),
            deviceId: deviceId || otpRecord.deviceId,
            updatedAt: new Date(),
          },
        }
      );

      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await sessions.insertOne({
        userId: user._id,
        token,
        deviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt,
        revoked: false,
      });

     const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully.",
          session: { token, expiresAt },
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          },
        },
        { status: 200 }
      );
    }

    // FORGOT PASSWORD FLOW
    if (type === OTP_TYPE_FORGOT_PASSWORD) {
      const resetToken = generateSessionToken();

      await users.updateOne(
        { email },
        {
          $set: {
            resetToken,
            resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        {
          success: true,
          message: "OTP verified. You can now reset your password.",
          resetToken,
        },
        { status: 200 }
      );
    }

    // LOGIN FLOW (default)
    if (trustedDevice && deviceId) {
      await users.updateOne(
        { email },
        {
          $set: {
            deviceId,
            trustedDevice: true,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await users.updateOne(
        { email },
        {
          $set: {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await sessions.insertOne({
      userId: user._id,
      token,
      deviceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
      revoked: false,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        session: { token, expiresAt },
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role || "user",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify OTP API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "Server error during OTP verification.",
      },
      { status: 500 }
    );
  }
}
