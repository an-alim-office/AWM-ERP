import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId, type Collection, type Document } from "mongodb";
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
 
/**
 * =========================================
 * AWM ERP 2026 - নিরাপদ নিবন্ধন (Registration) API
 * - ইমেইল নরমালাইজেশন (lib/otp থেকে, পুরো অ্যাপে অভিন্ন)
 * - bcrypt-ভিত্তিক শক্তিশালী পাসওয়ার্ড হ্যাশিং (শুধু পাসওয়ার্ডের জন্য)
 * - OTP হ্যাশিং lib/otp এর hashOTP দিয়ে, verify-otp রুটের সাথে সামঞ্জস্যপূর্ণ
 * - OTP তৈরি, সংরক্ষণ ও প্রকৃত sendOTPEmail দিয়ে ইমেইল প্রেরণ
 * - ত্রুটি ব্যবস্থাপনা ও ব্যর্থ হলে নিরাপদ ক্লিনআপ
 * - _id ফিল্ডগুলো এখন সঠিকভাবে ObjectId টাইপ (আগে "unknown" থাকায় TypeScript এরর হচ্ছিল)
 * =========================================
 */
 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
 
const পাসওয়ার্ড_সল্ট_রাউন্ড = 12;
 
function নিরাপদ_টেক্সট(মান: unknown): string {
  if (typeof মান !== "string") {
    return "";
  }
  return মান.trim();
}
 
async function নিরাপদ_ক্লিনআপ(
  ব্যবহারকারীসংগ্রহ: Collection<Document>,
  otpসংগ্রহ: Collection<Document>,
  ব্যবহারকারীআইডি: ObjectId | null,
  otpআইডি: ObjectId | null
): Promise<void> {
  const মুছুন: Promise<unknown>[] = [];
 
  if (otpআইডি) {
    মুছুন.push(otpসংগ্রহ.deleteOne({ _id: otpআইডি }).catch(() => undefined));
  }
 
  if (ব্যবহারকারীআইডি) {
    মুছুন.push(
      ব্যবহারকারীসংগ্রহ.deleteOne({ _id: ব্যবহারকারীআইডি }).catch(() => undefined)
    );
  }
 
  await Promise.allSettled(মুছুন);
}
 
export async function POST(request: Request) {
  let ব্যবহারকারীআইডি: ObjectId | null = null;
  let otpআইডি: ObjectId | null = null;
 
  try {
    let body: unknown;
 
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "অবৈধ অনুরোধ বডি। অনুগ্রহ করে বৈধ JSON পাঠান।",
        },
        { status: 400 }
      );
    }
 
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "অবৈধ অনুরোধ ডেটা।",
        },
        { status: 400 }
      );
    }
 
    const { name, email, password, role, deviceId } = body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      role?: unknown;
      deviceId?: unknown;
    };
 
    const নাম = নিরাপদ_টেক্সট(name);
    // === প্রয়োজনীয়তা ১: email.trim().toLowerCase() এর মাধ্যমে ইমেইল নরমালাইজেশন ===
    // lib/otp এর normalizeEmail ব্যবহার করা হচ্ছে, যাতে লগইন রুটের সাথে অভিন্ন থাকে
    const নরমালাইজডইমেইল = normalizeEmail(নিরাপদ_টেক্সট(email));
    const পাসওয়ার্ড = নিরাপদ_টেক্সট(password);
    const ভূমিকা = নিরাপদ_টেক্সট(role) || "Worker";
    const ডিভাইসআইডি = নিরাপদ_টেক্সট(deviceId) || null;
 
    if (!নাম || !নরমালাইজডইমেইল || !পাসওয়ার্ড) {
      return NextResponse.json(
        {
          success: false,
          message: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।",
        },
        { status: 400 }
      );
    }
 
    if (নাম.length < 2 || নাম.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "নামের দৈর্ঘ্য ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।",
        },
        { status: 400 }
      );
    }
 
    if (!isValidEmail(নরমালাইজডইমেইল)) {
      return NextResponse.json(
        {
          success: false,
          message: "সঠিক ইমেইল ঠিকানা প্রদান করুন।",
        },
        { status: 400 }
      );
    }
 
    if (নরমালাইজডইমেইল.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "ইমেইল ঠিকানা অত্যধিক দীর্ঘ।",
        },
        { status: 400 }
      );
    }
 
    if (পাসওয়ার্ড.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।",
        },
        { status: 400 }
      );
    }
 
    if (পাসওয়ার্ড.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "পাসওয়ার্ড অত্যধিক দীর্ঘ।",
        },
        { status: 400 }
      );
    }
 
    const db = await getDb();
    const ব্যবহারকারীসংগ্রহ = db.collection("users");
    const otpসংগ্রহ = db.collection("otps");
 
    /**
     * ১) বিদ্যমান ব্যবহারকারী পরীক্ষা
     * === প্রয়োজনীয়তা ২: সমস্ত findOne/insertOne এ normalizedEmail ব্যবহার ===
     */
    const বিদ্যমানব্যবহারকারী = await ব্যবহারকারীসংগ্রহ.findOne({
      email: নরমালাইজডইমেইল,
    });
 
    if (বিদ্যমানব্যবহারকারী) {
      return NextResponse.json(
        {
          success: false,
          message: "এই ইমেইল ঠিকানায় ইতিমধ্যেই একটি অ্যাকাউন্ট রয়েছে।",
        },
        { status: 409 }
      );
    }
 
    /**
     * ২) শক্তিশালী পাসওয়ার্ড হ্যাশিং
     * === প্রয়োজনীয়তা ৩: crypto.createHash("sha256") এর পরিবর্তে bcrypt (সল্ট রাউন্ড ১২) ===
     * লক্ষ্য করুন: bcrypt শুধুমাত্র পাসওয়ার্ডের জন্য ব্যবহৃত হচ্ছে, OTP এর জন্য নয়,
     * কারণ verify-otp রুট OTP তুলনার জন্য hashOTP (sha256) ব্যবহার করে —
     * OTP-তে bcrypt ব্যবহার করলে যাচাইকরণ কখনোই মিলবে না।
     */
    const পাসওয়ার্ডহ্যাশ = await bcrypt.hash(পাসওয়ার্ড, পাসওয়ার্ড_সল্ট_রাউন্ড);
 
    const এখন = new Date();
 
    /**
     * ৩) ব্যবহারকারী তৈরি
     * - email ও normalizedEmail উভয় ফিল্ডেই নরমালাইজড মান সংরক্ষিত হচ্ছে
     */
    const নতুনব্যবহারকারী = {
      name: নাম,
      email: নরমালাইজডইমেইল,
      normalizedEmail: নরমালাইজডইমেইল,
      password: পাসওয়ার্ডহ্যাশ,
      role: ভূমিকা,
      deviceId: ডিভাইসআইডি,
      isVerified: false,
      createdAt: এখন,
      updatedAt: এখন,
    };
 
    const ব্যবহারকারীরফলাফল = await ব্যবহারকারীসংগ্রহ.insertOne(নতুনব্যবহারকারী);
    ব্যবহারকারীআইডি = ব্যবহারকারীরফলাফল.insertedId;
 
    /**
     * ৪) OTP তৈরি ও সংরক্ষণ
     * === প্রয়োজনীয়তা ৬: consumed: false স্পষ্টভাবে যোগ করা হয়েছে ===
     * === প্রয়োজনীয়তা ৪: কাঁচা OTP console.log করা হচ্ছে না ===
     */
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiryDate();
 
    const otpডকুমেন্ট = {
      email: নরমালাইজডইমেইল,
      normalizedEmail: নরমালাইজডইমেইল,
      otpHash,
      type: OTP_TYPE_REGISTRATION,
      expiresAt,
      attempts: 0,
      consumed: false,
      deviceId: ডিভাইসআইডি,
      createdAt: এখন,
      updatedAt: এখন,
    };
 
    const otpফলাফল = await otpসংগ্রহ.insertOne(otpডকুমেন্ট);
    otpআইডি = otpফলাফল.insertedId;
 
    /**
     * ৫) OTP ইমেইল পাঠানো
     * === প্রয়োজনীয়তা ৫: প্রকৃত sendOTPEmail(email, otp) ইন্টিগ্রেশন,
     * সফল/ব্যর্থ অবস্থা স্পষ্টভাবে যাচাই করা হচ্ছে ===
     */
    const otpপাঠানোরফলাফল = await sendOTPEmail(নরমালাইজডইমেইল, otp);
 
    if (!otpপাঠানোরফলাফল.success) {
      // ইমেইল ব্যর্থ হলে এই OTP রেকর্ড আর ব্যবহারযোগ্য নয়
      await otpসংগ্রহ.updateOne(
        { _id: otpআইডি },
        {
          $set: {
            consumed: true,
            invalidatedAt: new Date(),
            sendFailed: true,
          },
        }
      );
 
      throw new Error("OTP ইমেইল পাঠানো যায়নি।");
    }
 
    return NextResponse.json(
      {
        success: true,
        message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। যাচাইকরণের জন্য OTP পাঠানো হয়েছে।",
        userId: ব্যবহারকারীরফলাফল.insertedId,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (ত্রুটি) {
    console.error("নিবন্ধন API ত্রুটি:", ত্রুটি);
 
    try {
      const db = await getDb();
      const ব্যবহারকারীসংগ্রহ = db.collection("users");
      const otpসংগ্রহ = db.collection("otps");
 
      await নিরাপদ_ক্লিনআপ(ব্যবহারকারীসংগ্রহ, otpসংগ্রহ, ব্যবহারকারীআইডি, otpআইডি);
    } catch (ক্লিনআপ_ত্রুটি) {
      console.error("নিবন্ধন ক্লিনআপ ত্রুটি:", ক্লিনআপ_ত্রুটি);
    }
 
    const mongoত্রুটি = ত্রুটি as { code?: number; message?: string };
 
    if (mongoত্রুটি?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "এই ইমেইল ঠিকানায় ইতিমধ্যেই একটি অ্যাকাউন্ট রয়েছে।",
        },
        { status: 409 }
      );
    }
 
    if (
      typeof mongoত্রুটি?.message === "string" &&
      mongoত্রুটি.message.toLowerCase().includes("otp")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
        },
        { status: 502 }
      );
    }
 
    return NextResponse.json(
      {
        success: false,
        message: "নিবন্ধনের সময় সার্ভার ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}