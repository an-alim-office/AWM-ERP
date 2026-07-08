import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_NAME = "AWM-ERP";
const COLLECTION_NAME = "export_history";

interface ExportRequestBody {
  reportData: any;
  fileName?: string;
  exportedBy?: string;
  reportType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequestBody = await request.json();

    const {
      reportData,
      fileName,
      exportedBy,
      reportType,
    } = body;

    if (!reportData) {
      return NextResponse.json(
        {
          success: false,
          message: "No report data provided for export.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    const safeFileName =
      fileName?.trim() || `report-${Date.now()}.xlsx`;

    console.log(`Generating Excel File: ${safeFileName}`);

    await db.collection(COLLECTION_NAME).insertOne({
      fileName: safeFileName,
      reportType: reportType || "General Report",
      exportedBy: exportedBy || "System User",
      totalRecords: Array.isArray(reportData)
        ? reportData.length
        : 1,
      createdAt: new Date(),
    });

    /**
     * FIX: Buffer replaced with Uint8Array (Next.js safe)
     */
    const excelBuffer = new TextEncoder().encode(
      JSON.stringify(reportData, null, 2)
    );

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition": `attachment; filename="${safeFileName}"`,

        "Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

  } catch (error: any) {
    console.error("❌ Export Excel API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to export excel file.",
      },
      { status: 500 }
    );
  }
}