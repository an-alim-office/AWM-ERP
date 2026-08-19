import crypto from "crypto";
import { SECURITY_CONSTANTS } from "./SecurityConstants";

function ensureString(value: string): string {
  return value ?? "";
}

export function hashValue(value: string): string {
  return crypto.createHash("sha256").update(ensureString(value)).digest("hex");
}

export function hmacValue(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(ensureString(value)).digest("hex");
}

export function randomToken(length = 64): string {
  return crypto.randomBytes(length).toString("hex");
}

export function randomCode(length = SECURITY_CONSTANTS.BACKUP_CODE_LENGTH): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) out += chars[bytes[i] % chars.length];
  return out;
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}