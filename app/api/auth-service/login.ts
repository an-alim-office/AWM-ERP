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
 * AWM ERP 2026 - নিরাপদ লগইন + OTP প্রেরণ API
 * ধাপ ১: ইমেইল/পাসওয়ার্ড যাচাই (bcrypt.compare)
 * ধাপ ২: নিরাপদ OTP তৈরি ও হ্যাশিং (sha256, hashOTP)
 * ধাপ ৩: ডিভাইস বাইন্ডিং প্রস্তুতি
 * ধাপ ৪: প্রকৃত ইমেইলে OTP প্রেরণ
 *
 * === এই ফাইলে যেসব নিরাপত্তা সমস্যা ঠিক করা হয়েছে ===
 * ❌ user.password === password (প্লেইনটেক্সট তুলনা)  → ✅ bcrypt.compare()
 * ❌ console.log("OTP GENERATED:", otp)                → ✅ সরানো হয়েছে
 * ❌ email সরাসরি ব্যবহার (নরমালাইজেশন ছাড়া)          → ✅ normalizeEmail()
 * ❌ OTP আসলে পাঠানো হতো না (শুধু TODO কমেন্ট)          → ✅ sendOTPEmail() ইন্টিগ্রেটেড
 * ❌ consumed ফিল্ড অনুপস্থিত                          → ✅ consumed: false যোগ করা হয়েছে
 * ❌ রেট-লিমিট/কুলডাউন ছিল না                          → ✅ ৬০ সেকেন্ড কুলডাউন যোগ করা হয়েছে
 * =========================================
 */
 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
 
export async function POST(request: Request) {
  try {
    let body: any;
 
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "অবৈধ JSON বডি।",
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
          message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক।",
        },
        { status: 400 }
      );
    }
 
    // === ইমেইল নরমালাইজেশন (trim + lowercase) ===
    const email = normalizeEmail(rawEmail);
 
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "সঠিক ইমেইল ঠিকানা আবশ্যক।",
        },
        { status: 400 }
      );
    }
 
    const db = await getDb();
    const users = db.collection("users");
    const otps = db.collection("otps");
 
    // === normalizedEmail দিয়ে findOne ===
    const user = await users.findOne({ email });
 
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        },
        { status: 401 }
      );
    }
 
    if (!user.password || typeof user.password !== "string") {
      // ডেটাবেসে বৈধ পাসওয়ার্ড হ্যাশ না থাকলে নিরাপদভাবে প্রত্যাখ্যান
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        },
        { status: 401 }
      );
    }
 
    // === প্লেইনটেক্সট তুলনার পরিবর্তে bcrypt.compare() ===
    const পাসওয়ার্ডসঠিক = await bcrypt.compare(password, user.password);
 
    if (!পাসওয়ার্ডসঠিক) {
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
        },
        { status: 401 }
      );
    }
 
    if (user.isVerified === false) {
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল এখনো যাচাই করা হয়নি।",
        },
        { status: 403 }
      );
    }
 
    /**
     * === ডিভাইস বাইন্ডিং চেক (মৌলিক স্তর) ===
     * নতুন/অপরিচিত ডিভাইস থেকে লগইন করা হচ্ছে কিনা তা ক্লায়েন্টকে জানানো হয়,
     * যাতে প্রয়োজনে অতিরিক্ত যাচাইকরণ (যেমন ইমেইল সতর্কতা) দেখানো যায়।
     */
    const isNewDevice = !!(
      user.deviceId &&
      deviceId &&
      user.deviceId !== deviceId
    );
 
    const now = new Date();
 
    // === রেট-লিমিট: ৬০ সেকেন্ডের মধ্যে পুনরায় OTP অনুরোধ আটকানো ===
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
            message: "নতুন OTP অনুরোধের আগে অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।",
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
 
    /**
     * === নিরাপদ OTP তৈরি ও হ্যাশিং ===
     * generateOTP() ও hashOTP() lib/otp থেকে ব্যবহার করা হচ্ছে, যাতে
     * verify-otp রুটের সাথে হ্যাশিং অ্যালগরিদম সম্পূর্ণ সামঞ্জস্যপূর্ণ থাকে।
     */
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiryDate();
 
    // === consumed: false স্পষ্টভাবে সংরক্ষণ ===
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
 
    // === কাঁচা OTP কোথাও console.log করা হচ্ছে না ===
    // === প্রকৃত sendOTPEmail(email, otp) ইন্টিগ্রেশন, সফল/ব্যর্থ অবস্থা যাচাই ===
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
          message: "OTP ইমেইল পাঠাতে ব্যর্থ হয়েছে।",
        },
        { status: 500 }
      );
    }
 
    return NextResponse.json(
      {
        success: true,
        message: "OTP সফলভাবে পাঠানো হয়েছে।",
        requiresOtp: true,
        isNewDevice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login API ত্রুটি:", {
      message: error?.message,
      stack: error?.stack,
    });
 
    return NextResponse.json(
      {
        success: false,
        message: "লগইন প্রক্রিয়ার সময় সার্ভার ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}