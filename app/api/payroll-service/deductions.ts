import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * =========================================================
 * AWM ERP 2026 - PAYROLL DEDUCTIONS API
 * =========================================================
 * ✅ Enterprise Payroll Deduction Engine
 * ✅ MongoDB Integrated
 * ✅ Advanced Validation
 * ✅ Salary Deduction Breakdown
 * ✅ Auto Calculation
 * ✅ Audit Ready
 * ✅ ERP Production Architecture
 * ✅ Secure API Structure
 * =========================================================
 */

const DATABASE_NAME = "AWM-ERP";
const COLLECTION_NAME = "payroll_deductions";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface DeductionBody {
  workerId: string;
  latePenalty?: number;
  advanceTaken?: number;
  taxDeduction?: number;
  otherDeductions?: number;
  reason?: string;
  processedBy?: string;
}

/**
 * =========================================================
 * HELPER FUNCTIONS
 * =========================================================
 */

function sanitizeNumber(
  value: unknown
): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

/**
 * =========================================================
 * GET
 * Load deduction records
 * =========================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const workerId =
      searchParams.get("workerId");

    const page = Number(
      searchParams.get("page") || 1
    );

    const limit = Number(
      searchParams.get("limit") || 10
    );

    const skip = (page - 1) * limit;

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    /**
     * Query
     */
    const query: Record<
      string,
      unknown
    > = {};

    if (workerId) {
      query.workerId = workerId;
    }

    /**
     * Fetch Records
     */
    const data = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total =
      await collection.countDocuments(
        query
      );

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
  } catch (error) {
    console.error(
      "❌ Payroll Deduction GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load payroll deductions.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create payroll deduction
 * =========================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    const body: DeductionBody =
      await request.json();

    const {
      workerId,
      latePenalty = 0,
      advanceTaken = 0,
      taxDeduction = 0,
      otherDeductions = 0,
      reason,
      processedBy,
    } = body;

    /**
     * Validation
     */
    if (!workerId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Worker ID is required.",
        },
        { status: 400 }
      );
    }

    /**
     * Sanitize Values
     */
    const safeLatePenalty =
      sanitizeNumber(latePenalty);

    const safeAdvanceTaken =
      sanitizeNumber(advanceTaken);

    const safeTaxDeduction =
      sanitizeNumber(taxDeduction);

    const safeOtherDeductions =
      sanitizeNumber(otherDeductions);

    /**
     * Negative Validation
     */
    const values = [
      safeLatePenalty,
      safeAdvanceTaken,
      safeTaxDeduction,
      safeOtherDeductions,
    ];

    const hasNegativeValue =
      values.some((v) => v < 0);

    if (hasNegativeValue) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Deduction values cannot be negative.",
        },
        { status: 400 }
      );
    }

    /**
     * Total Deduction
     */
    const totalDeduction =
      safeLatePenalty +
      safeAdvanceTaken +
      safeTaxDeduction +
      safeOtherDeductions;

    /**
     * Payload
     */
    const payload = {
      workerId: workerId.trim(),

      breakdown: {
        latePenalty:
          safeLatePenalty,

        advanceTaken:
          safeAdvanceTaken,

        taxDeduction:
          safeTaxDeduction,

        otherDeductions:
          safeOtherDeductions,
      },

      totalDeduction,

      reason:
        reason?.trim() ||
        "Monthly payroll deductions",

      processedBy:
        processedBy?.trim() ||
        "System Auto Processor",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    /**
     * MongoDB Insert
     */
    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection =
      db.collection(COLLECTION_NAME);

    const result =
      await collection.insertOne(payload);

    /**
     * Success Response
     */
    return NextResponse.json(
      {
        success: true,

        message:
          "Payroll deductions processed successfully.",

        data: {
          _id: result.insertedId,
          ...payload,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "❌ Payroll Deduction POST Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Server error while processing payroll deductions.",
      },
      { status: 500 }
    );
  }
}
