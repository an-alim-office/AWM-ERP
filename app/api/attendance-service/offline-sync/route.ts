// app/api/attendance/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MongoServerError } from "mongodb";

interface IncomingItem {
  workerId?: string;
  action?: "IN" | "OUT";
  source?: string;
  bioMode?: string | null;
  eventTime?: string;
  requestId?: string | null;
  deviceId?: string | null;
  machineUserCode?: string | null;
  geo?: { lat: number; lng: number } | null;
}

let indexesEnsured = false;

async function ensureIndexes(db: Awaited<ReturnType<typeof getDb>>) {
  if (indexesEnsured) return;
  await Promise.all([
    db.collection("attendanceEvents").createIndex(
      { requestId: 1, source: 1 },
      { unique: true, partialFilterExpression: { requestId: { $type: "string" } } }
    ),
    db.collection("attendanceEvents").createIndex({
      workerId: 1,
      dateKey: 1,
      action: 1,
      source: 1,
    }),
    db.collection("attendanceDaily").createIndex(
      { workerId: 1, dateKey: 1 },
      { unique: true }
    ),
    db.collection("attendanceAlerts").createIndex({ workerId: 1, createdAt: -1 }),
  ]);
  indexesEnsured = true;
}

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    await ensureIndexes(db);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { items } = body as { items?: IncomingItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items array required" },
        { status: 400 }
      );
    }

    if (items.length > 500) {
      return NextResponse.json(
        { success: false, message: "Batch too large. Max 500 items per request." },
        { status: 413 }
      );
    }

    let recorded = 0;
    let ignored = 0;
    let invalid = 0;

    const eventsCol = db.collection("attendanceEvents");
    const dailyCol = db.collection("attendanceDaily");
    const alertsCol = db.collection("attendanceAlerts");

    for (const it of items) {
      const {
        workerId,
        action,
        source,
        bioMode,
        eventTime,
        requestId,
        deviceId,
        machineUserCode,
        geo,
      } = it ?? {};

      if (!workerId || typeof workerId !== "string") {
        invalid++;
        continue;
      }
      if (action !== "IN" && action !== "OUT") {
        invalid++;
        continue;
      }

      const receivedAt = new Date().toISOString();
      const parsedEventTime = eventTime ? new Date(eventTime) : new Date();
      if (!isValidDate(parsedEventTime)) {
        invalid++;
        continue;
      }

      const at = parsedEventTime.toISOString();
      const dateKey = at.slice(0, 10);
      const src = typeof source === "string" && source.trim() ? source : "phone";
      const reqId = requestId && typeof requestId === "string" ? requestId : null;

      let insertedId;

      try {
        const result = await eventsCol.insertOne({
          workerId,
          source: src,
          bioMode: bioMode ?? null,
          deviceId: deviceId ?? null,
          machineUserCode: machineUserCode ?? null,
          action,
          eventTime: at,
          receivedAt,
          dateKey,
          sessionToken: null,
          geo: geo ?? null,
          requestId: reqId,
          status: "RECORDED",
          createdAt: receivedAt,
        });
        insertedId = result.insertedId;
      } catch (err) {
        if (err instanceof MongoServerError && err.code === 11000) {
          ignored++;
          continue;
        }
        throw err;
      }

      if (!reqId) {
        const dupCheck = await eventsCol.countDocuments({
          workerId,
          dateKey,
          action,
          source: src,
          _id: { $ne: insertedId },
        });
        if (dupCheck > 0) {
          await eventsCol.deleteOne({ _id: insertedId });
          ignored++;
          continue;
        }
      }

      const updateField = action === "IN" ? { checkIn: at } : { checkOut: at };

      await dailyCol.updateOne(
        { workerId, dateKey },
        {
          $set: {
            workerId,
            dateKey,
            lastSource: src,
            bioMode: bioMode ?? null,
            updatedAt: receivedAt,
            ...updateField,
          },
          $setOnInsert: { createdAt: receivedAt },
        },
        { upsert: true }
      );

      const hour = parsedEventTime.getHours();
      const isAbnormal = hour >= 0 && hour <= 5;

      if (isAbnormal) {
        await alertsCol.insertOne({
          workerId,
          type: "ANOMALY_TIME",
          severity: "HIGH",
          message: `Unusual ${action} time recorded at ${at}.`,
          eventRef: insertedId,
          createdAt: receivedAt,
        });
      }

      recorded++;
    }

    return NextResponse.json(
      {
        success: true,
        data: { recorded, ignored, invalid, total: items.length },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[attendance:POST]", e);
    return NextResponse.json(
      { success: false, message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}