/**
 * Excel Studio cloud persistence API.
 * Place at: app/api/excel/sheets/route.ts
 *
 * This is the ONLY place database access for the Excel module happens.
 * page.tsx never talks to MongoDB directly — it only calls these endpoints.
 *
 * Auth: this route checks for the session cookie your platform already sets
 * on login. AWM ERP already has an authentication/session system in place —
 * if your session cookie has a different name than "awm_session", update
 * SESSION_COOKIE_NAME below to match it exactly.
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const SESSION_COOKIE_NAME = "awm_session";
const COLLECTION = "excel_sheets";

function getSessionUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value || null;
}

export async function GET(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const db = await getDb();
  const collection = db.collection(COLLECTION);

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid sheet id" }, { status: 400 });
      }
      const sheet = await collection.findOne({ _id: new ObjectId(id) });
      if (!sheet) {
        return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
      }
      return NextResponse.json({ sheet });
    }

    const sheets = await collection
      .find({}, { projection: { name: 1, updatedAt: 1 } })
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
  } catch (err) {
    return NextResponse.json({ error: "Failed to read sheets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    id,
    name,
    gridRows,
    gridCols,
    cells,
    pageSize,
    orientation,
    groups,
  } = body || {};

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Sheet name is required" }, { status: 400 });
  }
  if (!cells || typeof cells !== "object") {
    return NextResponse.json({ error: "Sheet cells are required" }, { status: 400 });
  }

  const db = await getDb();
  const collection = db.collection(COLLECTION);
  const now = new Date();

  const doc = {
    name,
    gridRows: Number(gridRows) || 30,
    gridCols: Number(gridCols) || 12,
    cells,
    pageSize: pageSize || "A4",
    orientation: orientation || "landscape",
    groups: Array.isArray(groups) ? groups : [],
    ownerId: userId,
    updatedAt: now,
  };

  try {
    if (id && ObjectId.isValid(id)) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: doc },
        { upsert: true }
      );
      return NextResponse.json({ id });
    }

    const result = await collection.insertOne({ ...doc, createdAt: now });
    return NextResponse.json({ id: result.insertedId.toString() });
  } catch (err) {
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

  const db = await getDb();
  const collection = db.collection(COLLECTION);

  try {
    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete sheet" }, { status: 500 });
  }
}
