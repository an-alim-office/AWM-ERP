import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import {
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_FORGOT_PASSWORD,
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
    const newPassword = body?.newPassword;
    const deviceId = body?.deviceId || null;

    if (
      !rawEmail ||
      typeof rawEmail !== "string" ||
      !otp ||
      typeof otp !== "string" ||
      !newPassword ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FIELDS",
          message: "Email, OTP, and new password are required.",
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

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const now = new Date();

    const otpRecord = await otps.findOne({
      email,
      type: OTP_TYPE_FORGOT_PASSWORD,
      consumed: false,
      expiresAt: { $gt: now },
    });

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

    const inputOtpHash = hashOTP(otp);

    if (otpRecord.otpHash !== inputOtpHash) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_OTP",
          message: "Invalid OTP.",
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

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await users.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiresAt: null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successful.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "Server error during password reset.",
      },
      { status: 500 }
    );
  }
}
