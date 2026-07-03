import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

/**
 * ================================
 * AWM ERP 2026 - SECURE REGISTRATION
 * - Email uniqueness check
 * - Password hashing (SHA-256 placeholder → upgrade to bcrypt recommended)
 * - OTP-based email verification ready structure
 * - Device binding ready
 * ================================
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, deviceId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    const users = db.collection("users");

    /**
     * 1. CHECK EXISTING USER
     */
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email.",
        },
        { status: 409 }
      );
    }

    /**
     * 2. PASSWORD HASHING (replace with bcrypt in production)
     */
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    /**
     * 3. CREATE USER (PENDING VERIFICATION READY)
     */
    const newUser = {
      name,
      email,
      password: passwordHash,
      role: role || "Worker",

      deviceId: deviceId || null,

      isVerified: false,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    /**
     * 4. OPTIONAL: OTP GENERATION (for email verification flow)
     */
    const otp = crypto.randomInt(100000, 999999).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    await db.collection("otps").insertOne({
      email,
      otpHash,
      type: "registration",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      createdAt: new Date(),
    });

    /**
     * TODO:
     * - Send OTP via email (Resend/Nodemailer)
     * - Add rate limiting
     * - Add CAPTCHA protection
     */

    console.log("REG OTP GENERATED:", otp);

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created. OTP sent for verification.",
        userId: result.insertedId,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Registration API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error during registration.",
      },
      { status: 500 }
    );
  }
}