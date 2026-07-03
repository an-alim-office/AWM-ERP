import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";

/**
 * =========================================================
 * AWM ERP 2026 - PAYROLL RECORD API
 * =========================================================
 * Features:
 * ✅ MongoDB Connection Pooling
 * ✅ Type-safe Validation
 * ✅ Payroll History API
 * ✅ Advanced Error Handling
 * ✅ Timestamp Tracking
 * ✅ Production-ready Architecture
 * =========================================================
 */

const MONGODB_URI =
  process.env.MONGODB_URI || "";

const DATABASE_NAME =
  process.env.MONGODB_DB_NAME ||
  "PayrollProDB";

const COLLECTION_NAME =
  "payroll_records";

/**
 * Validate Environment Variables
 */
if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable"
  );
}

/**
 * MongoDB Connection Options
 */
const options = {
  maxPoolSize: 50,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

/**
 * Global Cache
 */
declare global {
  // eslint-disable-next-line no-var
  var _payrollMongoClientPromise:
    | Promise<MongoClient>
    | undefined;
}

if (
  process.env.NODE_ENV ===
  "development"
) {
  if (
    !global._payrollMongoClientPromise
  ) {
    client = new MongoClient(
      MONGODB_URI,
      options
    );

    global._payrollMongoClientPromise =
      client.connect();
  }

  clientPromise =
    global._payrollMongoClientPromise;
} else {
  client = new MongoClient(
    MONGODB_URI,
    options
  );

  clientPromise = client.connect();
}

/**
 * Get Database
 */
async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DATABASE_NAME);
}

/**
 * =========================================================
 * POST - CREATE PAYROLL RECORD
 * =========================================================
 */
export async function POST(
  req: NextRequest
) {
  try {
    const db = await getDatabase();

    const body = await req.json();

    const {
      employeeId,
      name,
      department,
      baseSalary,
      overtime,
      deductions,
      net,
      month,
      status,
    } = body;

    /**
     * Validation
     */
    if (
      !name ||
      typeof net !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payroll data.",
        },
        { status: 400 }
      );
    }

    /**
     * Payroll Payload
     */
    const payload = {
      employeeId:
        employeeId || null,

      name,

      department:
        department || "General",

      baseSalary:
        Number(baseSalary) || 0,

      overtime:
        Number(overtime) || 0,

      deductions:
        Number(deductions) || 0,

      net: Number(net),

      month:
        month ||
        new Date().toISOString(),

      status:
        status || "Paid",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    /**
     * Insert Record
     */
    const result =
      await db
        .collection(COLLECTION_NAME)
        .insertOne(payload);

    return NextResponse.json(
      {
        success: true,
        message:
          "Payroll record created successfully.",

        insertedId:
          result.insertedId,

        data: payload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "Payroll POST Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Database connection failed.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * GET - FETCH PAYROLL HISTORY
 * =========================================================
 */
export async function GET(
  request: NextRequest
) {
  try {
    const db = await getDatabase();

    /**
     * Query Params
     */
    const { searchParams } =
      new URL(request.url);

    const employeeId =
      searchParams.get(
        "employeeId"
      );

    const month =
      searchParams.get("month");

    /**
     * Dynamic Query
     */
    const query: any = {};

    if (employeeId) {
      query.employeeId =
        employeeId;
    }

    if (month) {
      query.month = month;
    }

    /**
     * Fetch Records
     */
    const records =
      await db
        .collection(COLLECTION_NAME)
        .find(query)
        .sort({
          createdAt: -1,
        })
        .toArray();

    /**
     * Analytics
     */
    const totalPayroll =
      records.reduce(
        (sum: number, item: any) =>
          sum + (item.net || 0),
        0
      );

    return NextResponse.json(
      {
        success: true,

        totalRecords:
          records.length,

        analytics: {
          totalPayroll,
        },

        data: records,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Payroll GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch payroll history.",
      },
      { status: 500 }
    );
  }
}
