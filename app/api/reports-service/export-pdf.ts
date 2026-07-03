import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, fileName } = body;

    // =========================
    // VALIDATION
    // =========================
    if (!reportData) {
      return NextResponse.json(
        {
          success: false,
          message: "পিডিএফ এক্সপোর্ট করার জন্য কোনো ডেটা পাওয়া যায়নি।",
        },
        { status: 400 }
      );
    }

    const safeFileName = fileName?.trim() || "report.pdf";

    console.log(`Generating PDF file: ${safeFileName}`);

    // =========================
    // SAFE PDF MOCK BUFFER
    // (real pdfkit later replace হবে)
    // =========================
    const pdfContent = {
      type: "AWM-ERP-PDF",
      generatedAt: new Date().toISOString(),
      data: reportData,
    };

    const pdfBuffer = new TextEncoder().encode(
      JSON.stringify(pdfContent, null, 2)
    );

    // =========================
    // RESPONSE
    // =========================
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

  } catch (error: any) {
    console.error("Export PDF API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "PDF export failed",
      },
      { status: 500 }
    );
  }
}