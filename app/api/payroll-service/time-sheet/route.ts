import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * =========================================================
 * AWM ERP 2026 - TIMESHEET API
 * =========================================================
 * ✅ Secure MongoDB Integration
 * ✅ Advanced Validation
 * ✅ Production Ready
 * ✅ Pagination Support
 * ✅ Search & Filter Ready
 * ✅ Duplicate Prevention
 * ✅ Clean Error Handling
 * ✅ Type Safe Structure
 * ✅ Enterprise Timesheet System
 * =========================================================
 */

const DATABASE_NAME = "AWM-ERP";
const COLLECTION_NAME = "timesheets";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface TimesheetRow {
  employeeId?: string;
  employeeName?: string;
  [key: string]: unknown;
}

interface TimesheetPayload {
  month: string;
  year: number;
  columns: string[];
  rows: TimesheetRow[];
}

/**
 * =========================================================
 * GET
 * Load Timesheets
 * =========================================================
 *
 * Query Support:
 * ?page=1
 * ?limit=10
 * ?month=May
 * ?year=2026
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const page = Number(
      searchParams.get("page") || 1
    );

    const limit = Number(
      searchParams.get("limit") || 10
    );

    const month =
      searchParams.get("month") || "";

    const year =
      searchParams.get("year") || "";

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> =
      {};

    /**
     * Filters
     */
    if (month) {
      query.month = month;
    }

    if (year) {
      query.year = Number(year);
    }

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    /**
     * Load Data
     */
    const data = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    /**
     * Total Count
     */
    const total =
      await collection.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(
            total / limit
          ),
        },
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "❌ Timesheet GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load timesheets",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create Timesheet
 * =========================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const body: TimesheetPayload =
      await request.json();

    const {
      month,
      year,
      columns,
      rows,
    } = body;

    /**
     * Validation
     */
    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Month and year are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(columns) ||
      columns.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Columns array is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(rows)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rows must be an array.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    /**
     * Duplicate Check
     */
    const existing =
      await collection.findOne({
        month,
        year,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timesheet already exists for this month and year.",
        },
        { status: 409 }
      );
    }

    /**
     * Payload
     */
    const payload = {
      month,
      year,
      columns,
      rows,
      totalRows: rows.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    /**
     * Insert
     */
    const result =
      await collection.insertOne(payload);

    return NextResponse.json(
      {
        success: true,
        insertedId:
          result.insertedId,
        message:
          "Timesheet saved successfully.",
        data: {
          _id: result.insertedId,
          ...payload,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "❌ Timesheet POST Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save timesheet.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * PUT
 * Update Existing Timesheet
 * =========================================================
 */

export async function PUT(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      id,
      month,
      year,
      columns,
      rows,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timesheet ID is required.",
        },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid timesheet ID.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    const result =
      await collection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            month,
            year,
            columns,
            rows,
            totalRows:
              rows?.length || 0,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timesheet not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Timesheet updated successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "❌ Timesheet PUT Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update timesheet.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * DELETE
 * Delete Timesheet
 * =========================================================
 */

export async function DELETE(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timesheet ID is required.",
        },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid timesheet ID.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    const result =
      await collection.deleteOne({
        _id: new ObjectId(id),
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Timesheet not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Timesheet deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "❌ Timesheet DELETE Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete timesheet.",
      },
      { status: 500 }
    );
  }
}
