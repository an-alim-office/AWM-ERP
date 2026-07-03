import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportData, fileName } = body;

    // ১. ডেটা চেক করা
    if (!reportData) {
      return NextResponse.json(
        { success: false, message: "এক্সপোর্ট করার জন্য কোনো ডেটা পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    console.log(`Generating Excel file: ${fileName || "report.xlsx"}`);

    // ২. ডামি এক্সেল ফাইল বাফার জেনারেশন (ডেভেলপমেন্ট ও সফল বিল্ডের জন্য)
    // পরবর্তীতে এখানে আপনার 'exceljs' বা 'xlsx' লাইব্রেরির কোড বসবে যা আসল এক্সেল শিট তৈরি করবে।
    const dummyExcelBuffer = Buffer.from("AWM-ERP-EXCEL-DATA-STREAM");

    // ৩. এক্সেল ফাইল ডাউনলোডের জন্য প্রয়োজনীয় হেডার সেট করে রেসপন্স পাঠানো
    return new NextResponse(new Uint8Array(dummyExcelBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${fileName || "report.xlsx"}`,
      },
    });

  } catch (error) {
    console.error("Export Excel API Error:", error);
    return NextResponse.json(
      { success: false, message: "এক্সেল ফাইল এক্সপোর্ট করার সময় সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}