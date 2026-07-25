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

/**
 * AWM ERP 2026 - নিরাপদ লগইন OTP প্রেরণ API (আপডেটেড, এন্টারপ্রাইজ-গ্রেড)
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_JSON",
          message: "অবৈধ JSON বডি",
        },
        { status: 400 }
      );
    }

    const rawEmail = body?.email;
    const password = body?.password;
    const deviceId = body?.deviceId || null;

    if (
      !rawEmail ||
      typeof rawEmail !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_FIELDS",
          message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক",
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
          message: "সঠিক ইমেইল ঠিকানা আবশ্যক",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");

    const user = await users.findOne({ email });

    if (!user || !user.password || typeof user.password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়",
        },
        { status: 401 }
      );
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়",
        },
        { status: 401 }
      );
    }

    if (user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_NOT_VERIFIED",
          message: "ইমেইল এখনো যাচাই করা হয়নি",
        },
        { status: 403 }
      );
    }

    const now = new Date();

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
      const elapsedSeconds =
        (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;

      if (elapsedSeconds < 60) {
        return NextResponse.json(
          {
            success: false,
            error: "RATE_LIMIT",
            message: "নতুন OTP অনুরোধের আগে অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন",
          },
          { status: 429 }
        );
      }
    }

    await otps.updateMany(
      {
        email,
        type: OTP_TYPE_LOGIN,
        consumed: false,
      },
      {
        $set: {
          consumed: true,
          invalidatedAt: new Date(),
        },
      }
    );

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

    const emailResult = await sendOTPEmail(email, otp, OTP_TYPE_LOGIN);

    if (!emailResult.success) {
      await otps.updateMany(
        {
          email,
          type: OTP_TYPE_LOGIN,
          consumed: false,
          otpHash,
        },
        {
          $set: {
            consumed: true,
            invalidatedAt: new Date(),
            sendFailed: true,
          },
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_FAILED",
          message: "OTP ইমেইল পাঠাতে ব্যর্থ হয়েছে",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP সফলভাবে পাঠানো হয়েছে",
        requiresOTP: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("send-otp route error:", {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "OTP পাঠানোর সময় সার্ভার ত্রুটি হয়েছে",
      },
      { status: 500 }
    );
  }
}
