import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_LOGIN,
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
        { success: false, message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const rawEmail = body?.email;
    const otp = body?.otp;
    const deviceId = body?.deviceId || null;
    const type = body?.type || OTP_TYPE_LOGIN;
    const trustedDevice = body?.trustedDevice || false;

    if (
      !rawEmail ||
      typeof rawEmail !== "string" ||
      !otp ||
      typeof otp !== "string" ||
      otp.length !== 6
    ) {
      return NextResponse.json(
        { success: false, message: "Email and 6-digit OTP are required." },
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

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const now = new Date();

    const otpRecord = await otps.findOne({
      email,
      type,
      consumed: false,
      expiresAt: { $gt: now },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // Check max attempts
    const maxAttempts = 5;
    if (otpRecord.attempts >= maxAttempts) {
      await otps.updateOne(
        { _id: otpRecord._id },
        { $set: { consumed: true, invalidatedAt: new Date() } }
      );
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Increment attempts
    await otps.updateOne(
      { _id: otpRecord._id },
      { $inc: { attempts: 1 } }
    );

    // Verify OTP hash
    const inputOtpHash = hashOTP(otp);
    if (otpRecord.otpHash !== inputOtpHash) {
      const remainingAttempts = maxAttempts - (otpRecord.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        },
        { status: 400 }
      );
    }

    // Mark OTP as consumed
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

    // Handle REGISTRATION type
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

      const sessionToken = generateSessionToken();

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully.",
          token: sessionToken,
        },
        { status: 200 }
      );
    }

    // Handle FORGOT_PASSWORD type
    if (type === OTP_TYPE_FORGOT_PASSWORD) {
      const resetToken = generateSessionToken();

      await users.updateOne(
        { email },
        {
          $set: {
            resetToken,
            resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
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

    // Handle LOGIN type (default)
    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Update device info if trusted
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

    const sessionToken = generateSessionToken();

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        token: sessionToken,
        user: {
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
      { success: false, message: "Server error during OTP verification." },
      { status: 500 }
    );
  }
}