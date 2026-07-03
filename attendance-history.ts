import { NextResponse } from "next/server";

// হাজিরা হিস্ট্রির একটি ডামি ইন্টারফেস (আপনার ডেটাবেজ মডেল অনুযায়ী পরে কানেক্ট করতে পারবেন)
interface AttendanceRecord {
  id: string;
  workerId: string;
  name: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  method: "Face" | "Fingerprint" | "GPS" | "QR";
  time: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    // ডামি ডেটা (টেস্টিং এর জন্য)
    const mockHistory: AttendanceRecord[] = [
      {
        id: "1",
        workerId: "W101",
        name: "H.M. Alim Uddin",
        date: "2026-05-28",
        status: "Present",
        method: "Face",
        time: "08:45 AM",
      },
      {
        id: "2",
        workerId: "W102",
        name: "Ayman Rahman",
        date: "2026-05-28",
        status: "Present",
        method: "GPS",
        time: "08:50 AM",
      },
    ];

    // যদি সুনির্দিষ্ট কোনো কর্মীর হিস্ট্রি খোঁজা হয়
    if (workerId) {
      const filteredHistory = mockHistory.filter(item => item.workerId === workerId);
      return NextResponse.json({ success: true, data: filteredHistory }, { status: 200 });
    }

    // সব হাজিরার হিস্ট্রি রিটার্ন
    return NextResponse.json({ success: true, data: mockHistory }, { status: 200 });
  } catch (error) {
    console.error("Attendance History Error:", error);
    return NextResponse.json(
      { success: false, message: "হাজিরা রেকর্ড লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

// নতুন হাজিরা রেকর্ড ম্যানুয়ালি যোগ করার জন্য POST মেথড
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId, status, method } = body;

    if (!workerId || !status || !method) {
      return NextResponse.json(
        { success: false, message: "প্রয়োজনীয় তথ্য মিসিং রয়েছে।" },
        { status: 400 }
      );
    }

    // এখানে আপনার মঙ্গোডিবি (MongoDB) সেভ লজিক হবে
    const newRecord = {
      id: Math.random().toString(36).substr(2, 9),
      workerId,
      date: new Date().toISOString().split("T")[0],
      status,
      method,
      time: new Date().toLocaleTimeString(),
    };

    return NextResponse.json(
      { success: true, message: "হাজিরা রেকর্ড সফলভাবে সংরক্ষিত হয়েছে।", data: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save Attendance History Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}