// app/api/face-verify/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "faceVerificationLogs";
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

let indexesEnsured = false;

async function ensureIndexes(db: Awaited<ReturnType<typeof getDb>>) {
  if (indexesEnsured) return;
  await db.collection(COLLECTION).createIndex({ employeeId: 1, createdAt: -1 });
  indexesEnsured = true;
}

function isValidBase64Image(input: string): { valid: boolean; sizeBytes: number } {
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(
    input.trim()
  );
  if (!match) return { valid: false, sizeBytes: 0 };
  const base64Data = match[2];
  const sizeBytes = Math.floor((base64Data.length * 3) / 4);
  return { valid: sizeBytes > 0 && sizeBytes <= MAX_IMAGE_SIZE_BYTES, sizeBytes };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Face Verification API Running",
  });
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

    const { employeeId, faceImage } = body as {
      employeeId?: string;
      faceImage?: string;
    };

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json(
        { success: false, message: "employeeId is required" },
        { status: 400 }
      );
    }

    if (!faceImage || typeof faceImage !== "string") {
      return NextResponse.json(
        { success: false, message: "faceImage is required" },
        { status: 400 }
      );
    }

    const { valid, sizeBytes } = isValidBase64Image(faceImage);
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "faceImage must be a valid base64 data URL (png/jpg/webp) under 4MB",
        },
        { status: 400 }
      );
    }

    // ⚠️ PLACEHOLDER: actual face-matching logic is not implemented.
    // Plug in either:
    //   (a) a third-party API (AWS Rekognition, Azure Face, Google Vision), or
    //   (b) an on-server model (face-api.js / ONNX) comparing against a stored
    //       face descriptor/embedding for this employeeId.
    // The block below only validates input and logs the attempt — it does NOT
    // verify identity. Do not treat `matched: true` as real verification.
    const matched = false;
    const confidence = 0;

    const db = await getDb();
    await ensureIndexes(db);

    const now = new Date();
    const logEntry = {
      employeeId,
      imageSizeBytes: sizeBytes,
      matched,
      confidence,
      engine: "NOT_IMPLEMENTED",
      createdAt: now,
    };

    const result = await db.collection(COLLECTION).insertOne(logEntry);

    return NextResponse.json(
      {
        success: false,
        message:
          "Face verification engine not implemented. Request validated and logged only.",
        data: { id: result.insertedId, employeeId, matched, confidence },
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("[face-verify:POST]", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}