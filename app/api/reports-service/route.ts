import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: সব রিপোর্ট নিয়ে আসার জন্য
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("AWM-ERP"); // আপনার ডাটাবেসের নাম নিশ্চিত করুন

    // 'reports' কালেকশন থেকে সব ডাটা নেওয়া হচ্ছে
    const reports = await db.collection("reports").find({}).toArray();

    return NextResponse.json({ success: true, data: reports }, { status: 200 });
  } catch (error: any) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// POST: নতুন রিপোর্ট তৈরি করার জন্য (যদি প্রয়োজন হয়)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("AWM-ERP");

    const result = await db.collection("reports").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create report", details: error.message },
      { status: 500 }
    );
  }
}