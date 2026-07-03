import { NextResponse } from "next/server";

// কর্তন বা ডিডাকশনের জন্য ডেটা ইন্টারফেস
interface DeductionBody {
  workerId: string;
  latePenalty: number;
  advanceTaken: number;
  taxDeduction: number;
  otherDeductions?: number;
  reason?: string;
}

export async function POST(request: Request) {
  try {
    const body: DeductionBody = await request.json();
    const { workerId, latePenalty, advanceTaken, taxDeduction, otherDeductions, reason } = body;

    // ১. কর্মী আইডি (workerId) পাঠানো হয়েছে কিনা চেক করা (বাধ্যতামূলক)
    if (!workerId) {
      return NextResponse.json(
        { success: false, message: "কর্মচারীর আইডি (workerId) প্রদান করা বাধ্যতামূলক।" },
        { status: 400 }
      );
    }

    console.log(`Processing payroll deductions for Worker ID: ${workerId}`);

    // ২. মোট কর্তন হিসাব করা
    const extraDeduction = otherDeductions || 0;
    const totalDeductionAmount = latePenalty + advanceTaken + taxDeduction + extraDeduction;

    // ৩. ডামি রেসপন্স (পরবর্তীতে এখানে আপনার ডেটাবেজ বা মঙ্গোডিবি সেভ লজিক বসবে)
    const deductionSummary = {
      workerId,
      breakdown: {
        latePenalty,
        advanceTaken,
        taxDeduction,
        otherDeductions: extraDeduction,
      },
      totalDeduction: totalDeductionAmount,
      reason: reason || "Monthly auto-calculated deductions",
      calculatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "বেতন কর্তনের হিসাব সফলভাবে সংরক্ষিত হয়েছে!",
        data: deductionSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deductions API Error:", error);
    return NextResponse.json(
      { success: false, message: "কর্তনের হিসাব প্রসেস করার সময় সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}