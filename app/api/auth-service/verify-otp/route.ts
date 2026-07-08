import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  generateSessionToken,
  hashOTP,
  isValidEmail,
  normalizeEmail,
  OTP_TYPE_LOGIN,
} from "@/lib/otp";
 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
 
// === নতুন: OTP ব্রুট-ফোর্স প্রতিরোধে সর্বোচ্চ ব্যর্থ চেষ্টার সীমা ===
const MAX_OTP_ATTEMPTS = 5;
 
export async function POST(req: Request) {
  try {
    let body: any;
 
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body",
        },
        { status: 400 }
      );
    }
 
    const rawEmail = body?.email;
    const otp = body?.otp;
    const deviceId = body?.deviceId || null;
    const trustedDevice = !!body?.trustedDevice;
 
    if (
      !rawEmail ||
      typeof rawEmail !== "string" ||
      !otp ||
      typeof otp !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and OTP are required",
        },
        { status: 400 }
      );
    }
 
    const email = normalizeEmail(rawEmail);
 
    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or OTP format",
        },
        { status: 400 }
      );
    }
 
    const db = await getDb();
    const otps = db.collection("otps");
    const users = db.collection("users");
    const sessions = db.collection("sessions");
 
    const otpRecord = await otps.findOne(
      {
        email,
        type: OTP_TYPE_LOGIN,
        consumed: false,
      },
      {
        sort: { createdAt: -1 },
      }
    );
 
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "No active OTP found",
        },
        { status: 404 }
      );
    }
 
    if (otpRecord.expiresAt && new Date(otpRecord.expiresAt) < new Date()) {
      await otps.updateOne(
        { _id: otpRecord._id },
        {
          $set: {
            consumed: true,
            expiredAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
 
      return NextResponse.json(
        {
          success: false,
          error: "OTP has expired",
        },
        { status: 401 }
      );
    }
 
    // === নতুন: ব্যর্থ চেষ্টার সীমা পার হয়েছে কিনা যাচাই ===
    // hashOTP তুলনা করার আগেই এই চেক করা হচ্ছে, যাতে সীমা পার হওয়ার পর
    // আর কোনো অনুমান-চেষ্টা কার্যকর না হয়।
    if (
      typeof otpRecord.attempts === "number" &&
      otpRecord.attempts >= MAX_OTP_ATTEMPTS
    ) {
      await otps.updateOne(
        { _id: otpRecord._id },
        {
          $set: {
            consumed: true,
            invalidatedAt: new Date(),
            invalidationReason: "max_attempts_exceeded",
            updatedAt: new Date(),
          },
        }
      );
 
      return NextResponse.json(
        {
          success: false,
          error:
            "সর্বোচ্চ ব্যর্থ চেষ্টার সীমা পার হয়েছে। অনুগ্রহ করে নতুন OTP অনুরোধ করুন।",
        },
        { status: 429 }
      );
    }
 
    const hashedInput = hashOTP(otp);
 
    if (hashedInput !== otpRecord.otpHash) {
      const updatedAttempts = (otpRecord.attempts ?? 0) + 1;
 
      const updateFields: Record<string, unknown> = {
        updatedAt: new Date(),
      };
 
      // এই চেষ্টার পরই সীমা পার হয়ে গেলে সাথে সাথে OTP-টি অকার্যকর করে দেওয়া হয়
      if (updatedAttempts >= MAX_OTP_ATTEMPTS) {
        updateFields.consumed = true;
        updateFields.invalidatedAt = new Date();
        updateFields.invalidationReason = "max_attempts_exceeded";
      }
 
      await otps.updateOne(
        { _id: otpRecord._id },
        {
          $inc: { attempts: 1 },
          $set: updateFields,
        }
      );
 
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP",
        },
        { status: 401 }
      );
    }
 
    const user = await users.findOne({ email });
 
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }
 
    await otps.updateOne(
      { _id: otpRecord._id },
      {
        $set: {
          consumed: true,
          consumedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
 
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 
    await sessions.insertOne({
      token,
      email,
      userId: user._id,
      deviceId,
      trustedDevice,
      // === নতুন: logout.ts এর revoked চেকের সাথে সামঞ্জস্যপূর্ণ রাখতে স্পষ্টভাবে false ===
      revoked: false,
      createdAt: new Date(),
      expiresAt,
    });
 
    const response = NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
 
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
 
    return response;
  } catch (error: any) {
    console.error("verify-otp route error:", {
      message: error?.message,
      stack: error?.stack,
    });
 
    return NextResponse.json(
      {
        success: false,
        error: "Server error while verifying OTP",
      },
      { status: 500 }
    );
  }
}