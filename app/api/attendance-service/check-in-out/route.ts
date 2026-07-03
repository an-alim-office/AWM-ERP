import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const toISO = (v: any) => {
  try {
    return v ? new Date(v).toISOString() : new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const getDateKey = (iso: string) => iso.slice(0, 10);

function roundTimeForDedup(iso: string, minutes = 5) {
  const d = new Date(iso);
  const ms = d.getTime();
  const step = minutes * 60 * 1000;
  return new Date(Math.floor(ms / step) * step).toISOString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      workerId,
      action, // "IN" | "OUT"
      source, // "phone" | etc
      bioMode, // "fingerprint" | "face"
      sessionToken,
      eventTime,
      geo,
      requestId,
    } = body ?? {};

    if (!workerId) {
      return NextResponse.json(
        { success: false, message: "workerId required" },
        { status: 400 }
      );
    }

    if (action !== "IN" && action !== "OUT") {
      return NextResponse.json(
        { success: false, message: "action must be IN/OUT" },
        { status: 400 }
      );
    }

    const receivedAt = new Date().toISOString();
    const at = toISO(eventTime);
    const dateKey = getDateKey(at);
    const dedupKeyTime = roundTimeForDedup(at, 5);

    const db = await getDb();

    // Duplicate prevention
    if (requestId) {
      const dup = await db.collection("attendanceEvents").findOne({
        requestId,
        source,
      });

      if (dup) {
        return NextResponse.json(
          { success: true, data: { workerId, action, eventTime: at, ignored: true } },
          { status: 200 }
        );
      }
    } else {
      const dup = await db.collection("attendanceEvents").findOne({
        workerId,
        dateKey,
        action,
        dedupKeyTime,
        source,
      });

      if (dup) {
        return NextResponse.json(
          { success: true, data: { workerId, action, eventTime: at, ignored: true } },
          { status: 200 }
        );
      }
    }

    // Insert raw event + audit trail
    const inserted = await db.collection("attendanceEvents").insertOne({
      workerId,
      source: source ?? "phone",
      bioMode: bioMode ?? null,
      deviceId: null,
      machineUserCode: null,
      action,
      eventTime: at,
      receivedAt,
      dateKey,
      sessionToken: sessionToken ?? null,
      geo: geo ?? null,
      requestId: requestId ?? null,
      dedupKeyTime,
      status: "RECORDED",
      createdAt: receivedAt,
    });

    // Update daily summary
    const updateField = action === "IN" ? { checkIn: at } : { checkOut: at };

    await db.collection("attendanceDaily").updateOne(
      { workerId, dateKey },
      {
        $set: {
          workerId,
          dateKey,
          lastSource: source ?? "phone",
          bioMode: bioMode ?? null,
          updatedAt: receivedAt,
          ...updateField,
        },
        $setOnInsert: { createdAt: receivedAt },
      },
      { upsert: true }
    );

    // Anomaly alert (example: 00:00-05:00)
    const hour = new Date(at).getHours();
    const isAbnormal = hour >= 0 && hour <= 5;

    if (isAbnormal) {
      await db.collection("attendanceAlerts").insertOne({
        workerId,
        type: "ANOMALY_TIME",
        severity: "HIGH",
        message: `Unusual ${action} time recorded at ${at}.`,
        eventRef: inserted.insertedId,
        createdAt: receivedAt,
      });
    }

    return NextResponse.json(
      { success: true, data: { workerId, action, eventTime: at } },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}