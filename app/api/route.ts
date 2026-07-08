import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface ZakatRecord {
  name?: string;
  assets: number;
  liabilities?: number;
  zakatDue: number;
  nisabEligible?: boolean;
  notes?: string;
  createdAt?: Date;
}

const DATABASE_NAME = "awm_synapse_db";
const COLLECTION_NAME = "zakat_records";

/**
 * GET - Fetch all zakat records
 */
export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const records = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        message: "Zakat records fetched successfully",
        count: records.length,
        data: records,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET /zakat-management error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch zakat records",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST - Create new zakat record
 */
export async function POST(request: NextRequest) {
  try {
    const body: ZakatRecord = await request.json();

    /**
     * Validation
     */
    if (
      body.assets === undefined ||
      body.zakatDue === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Assets and zakatDue are required",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Prevent negative values
     */
    if (body.assets < 0 || body.zakatDue < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Values cannot be negative",
        },
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const newRecord: ZakatRecord = {
      name: body.name || "Unnamed Record",
      assets: Number(body.assets),
      liabilities: Number(body.liabilities || 0),
      zakatDue: Number(body.zakatDue),
      nisabEligible: Boolean(body.nisabEligible),
      notes: body.notes || "",
      createdAt: new Date(),
    };

    const result = await db
      .collection(COLLECTION_NAME)
      .insertOne(newRecord);

    return NextResponse.json(
      {
        success: true,
        message: "Zakat record created successfully",
        insertedId: result.insertedId,
        data: newRecord,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /zakat-management error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create zakat record",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}