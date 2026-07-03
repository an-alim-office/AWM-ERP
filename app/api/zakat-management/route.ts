import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  records,
  ZakatRecord,
} from "@/lib/zakat-store";

/* =========================================================
   GET RECORDS
========================================================= */

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        count: records.length,
        data: records,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch records",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CREATE RECORD
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    /* VALIDATION */

    if (
      !body.name ||
      body.assets === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name and assets are required",
        },
        {
          status: 400,
        }
      );
    }

    const assets = Number(body.assets);

    const liabilities = Number(
      body.liabilities || 0
    );

    if (
      isNaN(assets) ||
      isNaN(liabilities)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid numeric values",
        },
        {
          status: 400,
        }
      );
    }

    const zakatDue =
      (assets - liabilities) * 0.025;

    const newRecord: ZakatRecord = {
      _id: crypto.randomUUID(),

      name: body.name,

      assets,

      liabilities,

      zakatDue,

      createdAt:
        new Date().toISOString(),
    };

    records.unshift(newRecord);

    return NextResponse.json(
      {
        success: true,
        message:
          "Record created successfully",
        data: newRecord,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create record",
      },
      {
        status: 500,
      }
    );
  }
}