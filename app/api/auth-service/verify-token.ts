import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
 
/**
 * =========================================
 * AWM ERP 2026 - নিরাপদ সেশন/টোকেন যাচাইকরণ API
 * - Next.js 15+ এ cookies() এখন async, তাই await ব্যবহার করা হয়েছে
 * - সেশন লুকআপের পর userId দিয়ে ব্যবহারকারী খোঁজা হচ্ছে (email পরিবর্তনেও সেশন বৈধ থাকে)
 * - মেয়াদোত্তীর্ণ সেশন পাওয়া গেলে ডেটাবেস থেকে অকার্যকর করে দেওয়া হয়
 * - পাসওয়ার্ড হ্যাশ কখনোই ক্লায়েন্টে ফেরত পাঠানো হয় না (projection: password: 0)
 * =========================================
 */
 
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
 
export async function GET() {
  try {
    // === প্রয়োজনীয়তা: Next.js 15+ এ cookies() অ্যাসিঙ্ক্রোনাস, তাই await আবশ্যক ===
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
 
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "কোনো auth token পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।",
        },
        { status: 401 }
      );
    }
 
    const db = await getDb();
    const sessions = db.collection("sessions");
    const users = db.collection("users");
 
    const session = await sessions.findOne({ token });
 
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "অবৈধ অথবা মেয়াদোত্তীর্ণ সেশন।",
        },
        { status: 401 }
      );
    }
 
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      // মেয়াদোত্তীর্ণ সেশনটি ডেটাবেস থেকে অকার্যকর করে দেওয়া হচ্ছে, যাতে
      // পরবর্তী প্রতিটি অনুরোধে বারবার এই একই টোকেন যাচাই করতে না হয়
      await sessions
        .updateOne(
          { _id: session._id },
          {
            $set: {
              expiredAt: new Date(),
            },
          }
        )
        .catch(() => undefined);
 
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "সেশনের মেয়াদ শেষ হয়ে গেছে।",
        },
        { status: 401 }
      );
    }
 
    // userId দিয়ে খোঁজা হচ্ছে — ব্যবহারকারী পরবর্তীতে ইমেইল পরিবর্তন করলেও সেশন বৈধ থাকবে
    const user = await users.findOne(
      { _id: session.userId },
      {
        projection: {
          password: 0,
        },
      }
    );
 
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isAuthorized: false,
          message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।",
        },
        { status: 401 }
      );
    }
 
    return NextResponse.json(
      {
        success: true,
        isAuthorized: true,
        message: "ব্যবহারকারী সফলভাবে যাচাই হয়েছে।",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("verify-token route error:", {
      message: error?.message,
      stack: error?.stack,
    });
 
    return NextResponse.json(
      {
        success: false,
        isAuthorized: false,
        message: "যাচাইকরণের সময় সার্ভার ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}