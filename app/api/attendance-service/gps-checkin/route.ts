// app/api/attendance-legacy/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION = "attendance";
const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

let indexesEnsured = false;

async function ensureIndexes(db: Awaited<ReturnType<typeof getDb>>) {
  if (indexesEnsured) return;
  await Promise.all([
    db.collection(COLLECTION).createIndex({ employeeId: 1, createdAt: -1 }),
    db.collection(COLLECTION).createIndex({ createdAt: -1 }),
  ]);
  indexesEnsured = true;
}

function isValidLatLng(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function GET(req: Request) {
  try {
    const db = await getDb();
    await ensureIndexes(db);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const limitParam = parseInt(searchParams.get("limit") || "", 10);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (employeeId) filter.employeeId = employeeId;

    const col = db.collection(COLLECTION);

    const [data, total] = await Promise.all([
      col
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      col.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[attendance-legacy:GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { employeeId, latitude, longitude, verificationType, status } = body;

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json(
        { success: false, message: "employeeId is required" },
        { status: 400 }
      );
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      (latitude !== undefined || longitude !== undefined) &&
      !isValidLatLng(lat, lng)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid latitude/longitude values" },
        { status: 400 }
      );
    }

    const allowedVerificationTypes = ["GPS", "QR", "FACE", "FINGERPRINT", "MANUAL"];
    const vType =
      typeof verificationType === "string" &&
      allowedVerificationTypes.includes(verificationType.toUpperCase())
        ? verificationType.toUpperCase()
        : "GPS";

    const allowedStatuses = ["Present", "Late", "Absent", "OnLeave"];
    const finalStatus =
      typeof status === "string" && allowedStatuses.includes(status)
        ? status
        : "Present";

    const db = await getDb();
    await ensureIndexes(db);

    const now = new Date();
    const newAttendance = {
      employeeId,
      latitude: isValidLatLng(lat, lng) ? lat : 0,
      longitude: isValidLatLng(lat, lng) ? lng : 0,
      verificationType: vType,
      status: finalStatus,
      createdAt: now,
      timestamp: now,
    };

    const result = await db.collection(COLLECTION).insertOne(newAttendance);

    return NextResponse.json(
      {
        success: true,
        message: "Attendance saved successfully",
        data: { id: result.insertedId, ...newAttendance },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[attendance-legacy:POST]", error);
    return NextResponse.json(
      { success: false, message: "Server error occurred" },
      { status: 500 }
    );
  }
}