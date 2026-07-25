import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import {
  generateOTP,
  getOTPExpiryDate,
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_LOGIN,
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
        { success: false, error: "INVALID_JSON", message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const rawEmail = body?.email;
    const password = body?.password;
    const deviceId = body?.deviceId || null;

    if (
      !rawEmail ||
      !password ||
      typeof rawEmail !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "MISSING_FIELDS", message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Accepts ANY valid email domain (Gmail, Yahoo, Outlook, custom domains, etc.)
    // There is no domain whitelist/restriction by design.
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "INVALID_EMAIL", message: "Valid email address is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const user = await users.findOne({ email });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return NextResponse.json(
        { success: false, error: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_NOT_VERIFIED",
          message: "Email not verified. Please verify your email first.",
        },
        { status: 403 }
      );
    }

    // Device check
    const isNewDevice = !!(user.deviceId && deviceId && user.deviceId !== deviceId);

    const now = new Date();

    // Rate-limit check
    const recentOtp = await otps.findOne(
      {
        email,
        type: OTP_TYPE_LOGIN,
        consumed: false,
        expiresAt: { $gt: now },
      },
      { sort: { createdAt: -1 } }
    );

    if (recentOtp?.createdAt) {
      const elapsedSeconds = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;

      if (elapsedSeconds < 60) {
        return NextResponse.json(
          {
            success: false,
            error: "RATE_LIMIT",
            message: "Please wait before requesting a new OTP.",
          },
          { status: 429 }
        );
      }
    }

    // Invalidate previous OTPs
    await otps.updateMany(
      { email, type: OTP_TYPE_LOGIN, consumed: false },
      { $set: { consumed: true, invalidatedAt: new Date() } }
    );

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiryDate();

    await otps.insertOne({
      email,
      type: OTP_TYPE_LOGIN,
      otpHash,
      consumed: false,
      attempts: 0,
      expiresAt,
      deviceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, OTP_TYPE_LOGIN);

    if (!emailResult.success) {
      await otps.updateMany(
        { email, type: OTP_TYPE_LOGIN, consumed: false, otpHash },
        {
          $set: {
            consumed: true,
            invalidatedAt: new Date(),
            sendFailed: true,
          },
        }
      );

      return NextResponse.json(
        { success: false, error: "EMAIL_FAILED", message: "Failed to send OTP email." },
        { status: 500 }
      );
    }

    // Save deviceId if new
    if (deviceId && user.deviceId !== deviceId) {
      await users.updateOne(
        { _id: user._id },
        { $set: { deviceId, updatedAt: new Date() } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully.",
        requiresOtp: true,
        isNewDevice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "Server error during login process.",
      },
      { status: 500 }
    );
  }
}