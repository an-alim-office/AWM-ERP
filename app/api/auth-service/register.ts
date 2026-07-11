import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import {
  generateOTP,
  getOTPExpiryDate,
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_REGISTRATION,
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

    const name = body?.name;
    const rawEmail = body?.email;
    const password = body?.password;
    const deviceId = body?.deviceId || null;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid name is required." },
        { status: 400 }
      );
    }

    if (!rawEmail || typeof rawEmail !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }

    const now = new Date();

    // Rate limit check
    const recentOtp = await otps.findOne(
      {
        email,
        type: OTP_TYPE_REGISTRATION,
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (unverified)
    await users.insertOne({
      name: name.trim(),
      email,
      password: hashedPassword,
      isVerified: false,
      deviceId,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Invalidate previous OTPs
    await otps.updateMany(
      { email, type: OTP_TYPE_REGISTRATION, consumed: false },
      { $set: { consumed: true, invalidatedAt: new Date() } }
    );

    // Generate and save OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiryDate();

    await otps.insertOne({
      email,
      type: OTP_TYPE_REGISTRATION,
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
        { email, type: OTP_TYPE_REGISTRATION, consumed: false, otpHash },
        { $set: { consumed: true, invalidatedAt: new Date(), sendFailed: true } }
      );

      return NextResponse.json(
        { success: false, message: "Failed to send OTP email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "OTP sent successfully. Please verify your email." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Register API error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { success: false, message: "Server error during registration." },
      { status: 500 }
    );
  }
}