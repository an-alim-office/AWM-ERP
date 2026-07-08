import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "May-2026";
    const status = searchParams.get("status"); // Paid or Pending

    console.log(`Fetching salary report for month: ${month}`);

    // ডামী স্যালারি রিপোর্ট ডাটা (পরবর্তীতে এখানে আপনার ডেটাবেজ বা মঙ্গোডিবি কোয়েরি বসবে)
    const mockSalaryReport = {
      reportName: "Monthly Salary Overview",
      billingCycle: month,
      financials: {
        totalDisbursed: 520000,
        currency: "SAR", // আপনার প্রোজেক্টের রিকোয়ারমেন্ট অনুযায়ী কারেন্সি
        averageSalary: 4500,
        highestSalary: 12000
      },
      departmentCost: [
        { department: "IT & Software", total: 180000 },
        { department: "Operations", total: 200000 },
        { department: "HR & Admin", total: 140000 }
      ],
      filterApplied: status || "All Statuses",
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        message: `${month} মাসের স্যালারি রিপোর্ট সফলভাবে তৈরি হয়েছে।`,
        data: mockSalaryReport
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Salary Report API Error:", error);
    return NextResponse.json(
      { success: false, message: "স্যালারি রিপোর্ট তৈরি করার সময় সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}