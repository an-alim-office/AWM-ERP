import { NextResponse } from 'next/server';

// এখানে আপনি আপনার ডেটাবেস কানেকশন (যেমন: MongoDB বা অন্য কিছু) ইম্পোর্ট করবেন
// উদাহরণস্বরূপ: import connectDB from '@/lib/db';

export async function GET() {
  try {
    // ডেটাবেস থেকে ওয়ার্কারদের তালিকা আনার কোড এখানে হবে
    const workers = [
      { id: 1, name: "Worker One", role: "Developer" },
      { id: 2, name: "Worker Two", role: "Designer" }
    ];

    return NextResponse.json({ success: true, data: workers });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // নতুন ওয়ার্কার বা ডেটা ইনসার্ট করার লজিক এখানে হবে
    console.log("Received data:", body);

    return NextResponse.json({ success: true, message: "Data received successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error saving data" }, { status: 500 });
  }
}