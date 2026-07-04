import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DATABASE_NAME = "awm_synapse_db";
const COLLECTION_NAME = "zakat_records";

/* =========================================================
   DELETE RECORD (MongoDB Native Client & Fixed for Vercel)
========================================================= */

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ১. Vercel বিল্ড ফিক্সের জন্য params-কে await করা
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // ২. আইডিটি সঠিক MongoDB ObjectId কি না তা যাচাই করা
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID format",
        },
        { status: 400 }
      );
    }

    // ৩. MongoDB ক্লায়েন্ট কানেক্ট করা এবং ডাটাবেজ সিলেক্ট করা
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // ৪. কালেকশন থেকে নির্দিষ্ট ObjectId অনুযায়ী ডকুমেন্ট ডিলিট করা
    const result = await db.collection(COLLECTION_NAME).deleteOne({
      _id: new ObjectId(id),
    });

    // কোনো ডকুমেন্ট ডিলিট না হলে (যদি আইডি খুঁজে না পাওয়া যায়)
    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Record not found",
        },
        { status: 404 }
      );
    }

    // সফলভাবে ডিলিট হলে রেসপন্স
    return NextResponse.json(
      {
        success: true,
        message: "Record deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete record",
      },
      { status: 500 }
    );
  }
}