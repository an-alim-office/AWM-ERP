import crypto from "crypto";
import { SECURITY_CONSTANTS } from "./SecurityConstants";
import { hashValue, randomToken } from "./Hashing";
import type { IdentityTokenPayload } from "@/types/identity";

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Buffer {
  const pad = 4 - (input.length % 4 || 4);
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad === 4 ? 0 : pad);
  return Buffer.from(normalized, "base64");
}

export interface TokenBundle {
  token: string;
  tokenHash: string;
  expiresAt: Date;
  jti: string;
}

export class TokenManager {
  constructor(private readonly secret: string) {}

  issue(payload: IdentityTokenPayload, ttlMinutes = SECURITY_CONSTANTS.ACCESS_TOKEN_TTL_MINUTES): TokenBundle {
    const header = { alg: "HS256", typ: "JWT" };
    const jti = randomToken(16);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlMinutes * 60;
    const body = {
      ...payload,
      jti,
      iat: now,
      exp,
      iss: payload.issuer ?? SECURITY_CONSTANTS.TOKEN_ISSUER,
      aud: payload.audience ?? SECURITY_CONSTANTS.TOKEN_AUDIENCE,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));
    const signature = crypto.createHmac("sha256", this.secret).update(`${encodedHeader}.${encodedBody}`).digest();
    const token = `${encodedHeader}.${encodedBody}.${base64UrlEncode(signature)}`;

    return {
      token,
      tokenHash: hashValue(token),
      expiresAt: new Date(exp * 1000),
      jti,
    };
  }

  verify<T extends IdentityTokenPayload = IdentityTokenPayload>(token: string): T {
    const [encodedHeader, encodedBody, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedBody || !encodedSignature) {
      throw new Error("Invalid token format.");
    }

    const expected = crypto.createHmac("sha256", this.secret).update(`${encodedHeader}.${encodedBody}`).digest();
    const actual = base64UrlDecode(encodedSignature);
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      throw new Error("Invalid token signature.");
    }

    const payload = JSON.parse(base64UrlDecode(encodedBody).toString("utf8")) as T & { exp?: number };
    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      throw new Error("Token expired.");
    }

    return payload;
  }

  createOpaqueToken(length = 64): string {
    return randomToken(length);
  }
}