import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
 
type BioMode = "fingerprint" | "face";
 
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode } = body ?? {};
 
    // Validate mode
    const allowedModes = new Set<BioMode>(["fingerprint", "face"]);
    if (!allowedModes.has(mode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mode. Use 'fingerprint' or 'face'.",
          receivedMode: mode ?? null,
          allowedModes: ["fingerprint", "face"],
        },
        { status: 400 }
      );
    }
 
    const sessionToken =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `bio_${Date.now()}`) as string;
 
    /**
     * =========================
     * REAL VERIFICATION PLACEHOLDER
     * =========================
     * এখানে আপনার আসল biometric verification থাকবে।
     * নিচের ভেরিয়েবলগুলো কেবল ডেমো/placeholder:
     *
     * - bioSubject: fingerprint/face যে ব্যবহারকারীকে verify করেছে তার কোনো key
     * - machineUserCode বা cardId ইত্যাদি আপনার ডিভাইস থেকে আসতে পারে
     *
     * আপনি আপনার input body অনুযায়ী এগুলো বের করবেন।
     */
    const rawBioSubject =
      body?.bioSubject ??
      body?.userCode ??
      body?.machineUserCode ??
      body?.cardId ??
      null;
 
    /**
     * === নিরাপত্তা ফিক্স: NoSQL Injection প্রতিরোধ ===
     * bioSubject অবশ্যই একটা প্লেইন স্ট্রিং হতে হবে। যদি ক্লায়েন্ট কোনো অবজেক্ট
     * পাঠায় (যেমন { "$ne": null }), সেটা MongoDB অপারেটর হিসেবে ব্যবহৃত হয়ে
     * ভুলভাবে যেকোনো রেকর্ডের সাথে ম্যাচ করে যেতে পারে। তাই এখানে কড়াকড়িভাবে
     * টাইপ-চেক করা হচ্ছে এবং যেকোনো non-string মান প্রত্যাখ্যান করা হচ্ছে।
     */
    const bioSubject: string | null =
      typeof rawBioSubject === "string" && rawBioSubject.trim().length > 0
        ? rawBioSubject.trim()
        : null;
 
    if (rawBioSubject !== null && rawBioSubject !== undefined && !bioSubject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid bioSubject/userCode/machineUserCode/cardId format. Must be a non-empty string.",
        },
        { status: 400 }
      );
    }
 
    /**
     * ⚠️⚠️⚠️ CRITICAL — এখনো বাস্তবায়ন করা হয়নি ⚠️⚠️⚠️
     * `verified` এখন পর্যন্ত হার্ডকোড করা `true` — অর্থাৎ এই এন্ডপয়েন্ট এখনো
     * কোনো প্রকৃত বায়োমেট্রিক যাচাই করে না। প্রোডাকশনে ডিপ্লয় করার আগে এই
     * লাইনটি আপনার আসল ফিঙ্গারপ্রিন্ট/ফেস ডিভাইস বা SDK থেকে প্রাপ্ত প্রকৃত
     * verification ফলাফল দিয়ে প্রতিস্থাপন করা আবশ্যক। যতক্ষণ না এটা করা হচ্ছে,
     * এই রুটটি কার্যত একটা authentication bypass — যে কেউ সঠিক bioSubject
     * অনুমান করে যেকোনো worker-এর নামে attendance মার্ক করতে পারবে।
     *
     * TODO (আবশ্যক, ঐচ্ছিক নয়):
     * const verified = await verifyBio(mode, bioSubject, ...);
     */
    const verified = true; // ⚠️ প্লেসহোল্ডার — প্রকৃত ডিভাইস/SDK verification দিয়ে বদলান
 
    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Bio verification failed" },
        { status: 401 }
      );
    }
 
    /**
     * =========================
     * WORKER RESOLUTION (IMPORTANT)
     * =========================
     * workerId ছাড়া attendance items বানানো যাবে না।
     * এখানে আমরা একটি সহজ mapping skeleton রাখলাম:
     * collection: attendanceDeviceMappings (একইভাবে আপনি চাইলে অন্য collection নাম দিন)
     *
     * ধরলাম bioSubject -> workerId lookup key।
     */
    let workerId: string | null = null;
 
    if (bioSubject) {
      const db = await getDb();
 
      // Example mapping strategy (আপনার ডেটা অনুযায়ী adjust করুন)
      // Option A: { fingerprintSubject, workerId }
      // Option B: { faceSubject, workerId }
      const mapping = await db
        .collection("attendanceDeviceMappings")
        .findOne({
          ...(mode === "fingerprint"
            ? { fingerprintSubject: bioSubject }
            : { faceSubject: bioSubject }),
        });
 
      workerId = mapping?.workerId ?? null;
 
      // যদি আপনার mapping key ভিন্ন হয়, এখানে শুধু filter/fields বদলালেই হবে।
    }
 
    /**
     * যদি workerId না পাওয়া যায়, UI কে বলবে কীভাবে ঠিক করতে হবে।
     */
    if (!workerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bio verified, but workerId not found. Provide correct bioSubject/userCode/machineUserCode/cardId for mapping.",
          data: {
            mode,
            sessionToken,
            workerId: null,
          },
        },
        { status: 404 }
      );
    }
 
    return NextResponse.json(
      {
        success: true,
        data: {
          workerId,
          mode,
          sessionToken,
          verifiedAt: new Date().toISOString(),
          // Optional: আপনি চাইলে client এ আরও তথ্য দিতে পারেন
          // worker: { name, empId, smartId... }
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    // === নিরাপত্তা ফিক্স: এরর মেসেজ ক্লায়েন্টকে ফেরত পাঠানো হচ্ছে না ===
    // অভ্যন্তরীণ এরর (ডেটাবেস স্ট্রাকচার, স্ট্যাক ট্রেস ইত্যাদি) সার্ভার-সাইড
    // লগে রাখা হচ্ছে, ক্লায়েন্টকে শুধু একটা জেনেরিক বার্তা দেওয়া হচ্ছে।
    console.error("Bio verification route error:", {
      message: error?.message,
      stack: error?.stack,
    });
 
    return NextResponse.json(
      { success: false, message: "Server error during biometric verification" },
      { status: 500 }
    );
  }
}