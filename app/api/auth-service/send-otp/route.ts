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
 * =========================================
 * AWM ERP 2026 - নিরাপদ লগইন OTP প্রেরণ API
 * - ইমেইল নরমালাইজেশন (lib/otp থেকে, register.ts এর সাথে অভিন্ন)
 * - bcrypt.compare() দিয়ে পাসওয়ার্ড যাচাই (register.ts এখন bcrypt দিয়ে হ্যাশ করে)
 * - OTP হ্যাশিং হয় hashOTP (sha256) দিয়ে, verify-otp রুটের সাথে সামঞ্জস্যপূর্ণ
 * - consumed: false স্পষ্টভাবে সংরক্ষিত
 * - কাঁচা OTP কখনোই console.log করা হয় না
 * =========================================
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
          error: "অবৈধ JSON বডি",
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
          error: "ইমেইল এবং পাসওয়ার্ড আবশ্যক",
        },
        { status: 400 }
      );
    }
 
    // === প্রয়োজনীয়তা ১: normalizeEmail (trim + lowercase) ===
    const email = normalizeEmail(rawEmail);
 
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "সঠিক ইমেইল ঠিকানা আবশ্যক",
        },
        { status: 400 }
      );
    }
 
    const db = await getDb();
 
    const users = db.collection("users");
    const otps = db.collection("otps");
 
    // === প্রয়োজনীয়তা ২: normalizedEmail দিয়ে findOne ===
    const user = await users.findOne({ email });
 
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়",
        },
        { status: 401 }
      );
    }
 
    if (!user.password || typeof user.password !== "string") {
      // ডেটাবেসে পাসওয়ার্ড হ্যাশ না থাকলে (অস্বাভাবিক অবস্থা), নিরাপদভাবে প্রত্যাখ্যান
      return NextResponse.json(
        {
          success: false,
          error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়",
        },
        { status: 401 }
      );
    }
 
    /**
     * === প্রয়োজনীয়তা ৩: bcrypt.compare() দিয়ে পাসওয়ার্ড যাচাই ===
     * register.ts এখন bcrypt.hash(password, 12) দিয়ে পাসওয়ার্ড সংরক্ষণ করে,
     * তাই এখানে পুরনো sha256 তুলনার পরিবর্তে bcrypt.compare ব্যবহার করা হচ্ছে।
     */
    const পাসওয়ার্ডসঠিক = await bcrypt.compare(password, user.password);
 
    if (!পাসওয়ার্ডসঠিক) {
      return NextResponse.json(
        {
          success: false,
          error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়",
        },
        { status: 401 }
      );
    }
 
    if (user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          error: "ইমেইল এখনো যাচাই করা হয়নি",
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
      {
        sort: { createdAt: -1 },
      }
    );
 
    if (recentOtp?.createdAt) {
      const elapsedSeconds =
        (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
 
      if (elapsedSeconds < 60) {
        return NextResponse.json(
          {
            success: false,
            error: "নতুন OTP অনুরোধের আগে অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন",
          },
          { status: 429 }
        );
      }
    }
 
    // পূর্ববর্তী অব্যবহৃত OTP গুলো অকার্যকর করা হচ্ছে
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
 
    // === প্রয়োজনীয়তা ৬: consumed: false স্পষ্টভাবে সংরক্ষণ ===
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
 
    // === প্রয়োজনীয়তা ৪: কাঁচা OTP কোথাও console.log করা হচ্ছে না ===
    // === প্রয়োজনীয়তা ৫: প্রকৃত sendOTPEmail(email, otp) ইন্টিগ্রেশন ===
    const emailResult = await sendOTPEmail(email, otp);
 
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
          error: "OTP ইমেইল পাঠাতে ব্যর্থ হয়েছে",
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
        error: "OTP পাঠানোর সময় সার্ভার ত্রুটি হয়েছে",
      },
      { status: 500 }
    );
  }
}