import { NextResponse } from "next/server";

// টেস্ট করার জন্য কিছু ডামি কর্মচারীর ডেটা (পরবর্তীতে এটা আপনার MongoDB থেকে আসবে)
const dummyEmployees = [
  { id: "1", name: "Alim Uddin", department: "IT", position: "Software Developer" },
  { id: "2", name: "Ayman Rahman", department: "HR", position: "HR Manager" },
  { id: "3", name: "Mohammed Ali", department: "Operations", position: "Supervisor" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";

    // যদি ইউজার কিছু টাইপ করা শুরু করে, তবেই সাজেশন ফিল্টার হবে
    const suggestions = dummyEmployees
      .filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query)
      )
      .map((emp) => `${emp.name} (${emp.department})`);

    return NextResponse.json({ success: true, suggestions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "AI Suggestions failed", error },
      { status: 500 }
    );
  }
}