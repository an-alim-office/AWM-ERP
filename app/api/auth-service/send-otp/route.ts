import { NextResponse } from "next/server";
import { generateOTP, hashOTP, sendOTPEmail } from "@/lib/otp";

// প্রজেক্ট বিল্ডে যেন কোনো সমস্যা না হয়, তাই এক্সপোর্ট টাইপ নির্দিষ্ট করে দেওয়া হলো
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // ১. রিকোয়েস্ট বডি সেফলি রিড করা (খালি বডি আসলে যেন ক্র্যাশ না করে)
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body or empty request" },
        { status: 400 }
      );
    }

    const { email } = body;

    // ২. ইমেইল ভ্যালিডেশন
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // ৩. ওটিপি জেনারেট করা (lib/otp থেকে)
    const otp = generateOTP();

    // ৪. ওটিপি ইমেইলে পাঠানো (lib/otp থেকে)
    const emailResult = await sendOTPEmail(email, otp);

    // টাইপ সেফটি নিশ্চিত করে চেক করা হচ্ছে
    if (!emailResult || !emailResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to send OTP email via provider" },
        { status: 500 }
      );
    }

    // ৫. ওটিপি হ্যাশ করা ডেটাবেজে সেভ করার জন্য
    const hashedOtp = hashOTP(otp);

    // =========================================================================
    // TODO: আপনার ডেটাবেজ লজিকটি ঠিক এই লাইনের নিচে লিখবেন। যেমন:
    // await connectToDatabase();
    // await OTPModel.create({ email: email.trim().toLowerCase(), hashedOtp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    // =========================================================================

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email.",
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in OTP route:", error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}