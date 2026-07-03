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
     * নিচের ভেরিয়েবলগুলো কেবল ডেমো/placeholder:
     *
     * - bioSubject: fingerprint/face যে ব্যবহারকারীকে verify করেছে তার কোনো key
     * - machineUserCode বা cardId ইত্যাদি আপনার ডিভাইস থেকে আসতে পারে
     *
     * আপনি আপনার input body অনুযায়ী এগুলো বের করবেন।
     */
    const bioSubject =
      body?.bioSubject ??
      body?.userCode ??
      body?.machineUserCode ??
      body?.cardId ??
      null;

    // TODO: আপনার real biometric verify logic চালান
    // const verified = await verifyBio(mode, bioSubject, ...);
    const verified = true;

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
     * workerId ছাড়া attendance items বানানো যাবে না।
     * এখানে আমরা একটি সহজ mapping skeleton রাখলাম:
     * collection: attendanceDeviceMappings (একইভাবে আপনি চাইলে অন্য collection নাম দিন)
     *
     * ধরলাম bioSubject -> workerId lookup key।
     */
    let workerId: string | null = null;

    if (bioSubject) {
      const db = await getDb();

      // Example mapping strategy (আপনার ডেটা অনুযায়ী adjust করুন)
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

      // যদি আপনার mapping key ভিন্ন হয়, এখানে শুধু filter/fields বদলালেই হবে।
    }

    /**
     * যদি workerId না পাওয়া যায়, UI কে বলবে কীভাবে ঠিক করতে হবে।
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
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}