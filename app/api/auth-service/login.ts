import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

/**
 * ================================
 * AWM ERP 2026 - LOGIN + OTP INIT
 * STEP 1: Credential Verification
 * STEP 2: OTP Generation (Secure)
 * STEP 3: Device Binding Preparation
 * ================================
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, deviceId } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    // USERS COLLECTION
    const user = await db.collection("users").findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        { status: 401 }
      );
    }

    // NOTE: Replace with bcrypt in production
    const passwordMatch =
      user.password === password;

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        { status: 401 }
      );
    }

    /**
     * DEVICE CHECK (basic binding layer)
     */
    const isNewDevice =
      user.deviceId &&
      deviceId &&
      user.deviceId !== deviceId;

    /**
     * OTP GENERATION (6-digit secure)
     */
    const otp = crypto
      .randomInt(100000, 999999)
      .toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    ); // 5 min

    // STORE OTP
    await db.collection("otps").insertOne({
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      deviceId: deviceId || null,
      createdAt: new Date(),
    });

    /**
     * TODO (PRODUCTION):
     * - Send OTP via Email/SMS (Resend/Twilio)
     * - Add rate limiting
     * - Add IP logging
     */

    console.log("OTP GENERATED:", otp);

    return NextResponse.json(
      {
        success: true,
        message:
          "OTP sent successfully.",
        requiresOtp: true,
        isNewDevice,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error during login process.",
      },
      { status: 500 }
    );
  }
}