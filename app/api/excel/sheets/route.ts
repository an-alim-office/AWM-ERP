/**
 * Excel Studio cloud persistence API.
 * Location: app/api/excel/sheets/route.ts
 *
 * This is the ONLY place database access for the Excel module happens.
 * page.tsx never talks to MongoDB directly — it only calls these endpoints.
 *
 * Auth:
 * - In production, a valid session cookie is required (see SESSION_COOKIE_NAME).
 * - In local development (NODE_ENV !== "production"), a missing session cookie
 *   falls back to a fixed local dev user id, so `npm run dev` works out of the
 *   box without requiring a full login flow. This fallback NEVER applies when
 *   NODE_ENV === "production".
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const SESSION_COOKIE_NAME = "awm_session";
const COLLECTION = "excel_sheets";
const LOCAL_DEV_USER_ID = "local-dev-user";

function getSessionUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) return cookie.value;

  // Local-only fallback so the module is testable without a real login.
  if (process.env.NODE_ENV !== "production") {
    return LOCAL_DEV_USER_ID;
  }

  return null;
}

export async function GET(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  const collection = db.collection(COLLECTION);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid sheet id" }, { status: 400 });
      }

      const sheet = await collection.findOne({ _id: new ObjectId(id), ownerId: userId });
      if (!sheet) {
        return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
      }

      return NextResponse.json({
        sheet: {
          ...sheet,
          id: sheet._id.toString(),
        },
      });
    }

    const sheets = await collection
      .find({ ownerId: userId }, { projection: { name: 1, updatedAt: 1 } })
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      sheets: sheets.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        updatedAt: s.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to read sheets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = body as {
    id?: string;
    name?: string;
    gridRows?: number;
    gridCols?: number;
    cells?: unknown;
    pageSize?: "A4" | "Letter" | "Legal";
    orientation?: "portrait" | "landscape";
    groups?: unknown;
    activeSheetIndex?: number;
    sheets?: unknown;
  };

  const isWorkbook = Array.isArray(data.sheets);

  if (!data.name || typeof data.name !== "string") {
    return NextResponse.json({ error: "Sheet/workbook name is required" }, { status: 400 });
  }

  if (isWorkbook) {
    if (!Array.isArray(data.sheets) || data.sheets.length === 0) {
      return NextResponse.json({ error: "Workbook sheets are required" }, { status: 400 });
    }
  } else if (!data.cells || typeof data.cells !== "object") {
    return NextResponse.json({ error: "Sheet cells are required" }, { status: 400 });
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  const collection = db.collection(COLLECTION);
  const now = new Date();

  const doc = isWorkbook
    ? {
        name: data.name,
        sheets: data.sheets,
        pageSize: data.pageSize || "A4",
        orientation: data.orientation || "landscape",
        activeSheetIndex: Number.isFinite(data.activeSheetIndex) ? data.activeSheetIndex : 0,
        ownerId: userId,
        updatedAt: now,
      }
    : {
        name: data.name,
        gridRows: Number(data.gridRows) || 30,
        gridCols: Number(data.gridCols) || 12,
        cells: data.cells,
        pageSize: data.pageSize || "A4",
        orientation: data.orientation || "landscape",
        groups: Array.isArray(data.groups) ? data.groups : [],
        ownerId: userId,
        updatedAt: now,
      };

  try {
    if (data.id && ObjectId.isValid(data.id)) {
      const existing = await collection.findOne({ _id: new ObjectId(data.id) });

      if (existing && existing.ownerId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await collection.updateOne(
        { _id: new ObjectId(data.id) },
        { $set: doc, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );

      return NextResponse.json({ id: data.id });
    }

    const result = await collection.insertOne({ ...doc, createdAt: now });
    return NextResponse.json({ id: result.insertedId.toString() });
  } catch {
    return NextResponse.json({ error: "Failed to save sheet" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid sheet id" }, { status: 400 });
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  const collection = db.collection(COLLECTION);

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id), ownerId: userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete sheet" }, { status: 500 });
  }
}