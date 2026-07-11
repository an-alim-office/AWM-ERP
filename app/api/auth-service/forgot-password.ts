import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  generateOTP,
  getOTPExpiryDate,
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_FORGOT_PASSWORD,
  sendOTPEmail,
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
    const deviceId = body?.deviceId || null;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email address is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    // Rate limit check
    const recentOtp = await otps.findOne(
      {
        email,
        type: OTP_TYPE_FORGOT_PASSWORD,
        consumed: false,
        expiresAt: { $gt: now },
      },
      { sort: { createdAt: -1 } }
    );

    if (recentOtp?.createdAt) {
      const elapsedSeconds = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        return NextResponse.json(
          { success: false, message: "Please wait before requesting a new OTP." },
          { status: 429 }
        );
      }
    }

    // Invalidate previous OTPs
    await otps.updateMany(
      { email, type: OTP_TYPE_FORGOT_PASSWORD, consumed: false },
      { $set: { consumed: true, invalidatedAt: new Date() } }
    );

    // Generate and save OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiryDate();

    await otps.insertOne({
      email,
      type: OTP_TYPE_FORGOT_PASSWORD,
      otpHash,
      consumed: false,
      attempts: 0,
      expiresAt,
      deviceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      await otps.updateMany(
        { email, type: OTP_TYPE_FORGOT_PASSWORD, consumed: false, otpHash },
        { $set: { consumed: true, invalidatedAt: new Date(), sendFailed: true } }
      );

      return NextResponse.json(
        { success: false, message: "Failed to send OTP email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "OTP sent successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}