import { NextResponse } from 'next/server';

// উদাহরণস্বরূপ, এখানে আপনার ডাটাবেজ কোয়েরি থাকবে
export async function GET() {
  try {
    // এখানে আপনার ডাটাবেজ থেকে ডাটা ফেচ করার লজিক লিখুন
    // const employees = await db.employee.findMany(); 

    const employees = [
      { id: 1, name: "উদাহরণ কর্মী ১" },
      { id: 2, name: "উদাহরণ কর্মী ২" }
    ];

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}