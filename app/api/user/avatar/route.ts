import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/mongodb";

// TODO: replace with your real auth/session lookup.
// Example if you use next-auth:
//   import { getServerSession } from "next-auth";
//   import { authOptions } from "@/lib/auth";
async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  // Placeholder — swap this for your actual session/user resolution.
  // For now it reads an "x-user-id" header so you can test with curl/Postman,
  // or wire it to your existing auth() / getServerSession() helper.
  const headerUserId = req.headers.get("x-user-id");
  return headerUserId ?? null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

function extFromMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

/**
 * POST /api/user/avatar
 * multipart/form-data with a single "file" field.
 * Saves the image to /public/uploads/avatars and stores the resulting
 * public URL on the user's document in MongoDB (users.avatarUrl).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided" } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Only JPG, PNG, WEBP or GIF images are allowed" },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: { message: "Image must be 5MB or smaller" } },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${userId}-${randomUUID()}.${extFromMime(file.type)}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await writeFile(filePath, bytes);

    const publicUrl = `/uploads/avatars/${fileName}`;

    // Save on the user document + remove the old file if one existed.
    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ _id: userId as any });
    const oldAvatarUrl: string | undefined = existing?.avatarUrl;

    await users.updateOne(
      { _id: userId as any },
      { $set: { avatarUrl: publicUrl, avatarUpdatedAt: new Date() } },
      { upsert: false }
    );

    if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", oldAvatarUrl);
      unlink(oldPath).catch(() => {
        /* old file may already be gone — ignore */
      });
    }

    return NextResponse.json({ success: true, data: { avatarUrl: publicUrl } });
  } catch (err) {
    console.error("Avatar upload failed:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to upload avatar" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Removes the current user's avatar and reverts to initials.
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");
    const existing = await users.findOne({ _id: userId as any });
    const oldAvatarUrl: string | undefined = existing?.avatarUrl;

    await users.updateOne(
      { _id: userId as any },
      { $unset: { avatarUrl: "", avatarUpdatedAt: "" } }
    );

    if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", oldAvatarUrl);
      unlink(oldPath).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Avatar delete failed:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to remove avatar" } },
      { status: 500 }
    );
  }
}