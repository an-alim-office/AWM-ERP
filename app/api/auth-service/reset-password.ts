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
        { success: false, message: "Invalid JSON body." },
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
        { success: false, message: "Email, OTP, and new password are required." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const now = new Date();

    // Find valid OTP
    const otpRecord = await otps.findOne({
      email,
      type: OTP_TYPE_FORGOT_PASSWORD,
      consumed: false,
      expiresAt: { $gt: now },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    const inputOtpHash = hashOTP(otp);
    if (otpRecord.otpHash !== inputOtpHash) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP." },
        { status: 400 }
      );
    }

    // Mark OTP as consumed
    await otps.updateOne(
      { _id: otpRecord._id },
      { $set: { consumed: true, consumedAt: new Date() } }
    );

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
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
      { success: true, message: "Password reset successful." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { success: false, message: "Server error during password reset." },
      { status: 500 }
    );
  }
}