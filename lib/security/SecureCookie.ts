import { NextResponse } from "next/server";
import { SECURITY_CONSTANTS } from "./SecurityConstants";

export interface SecureCookieOptions {
  maxAgeSeconds?: number;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
}

export function setSecureCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: SecureCookieOptions = {},
): NextResponse {
  response.cookies.set({
    name,
    value,
    httpOnly: options.httpOnly ?? true,
    sameSite: options.sameSite ?? "lax",
    secure: options.secure ?? true,
    path: options.path ?? "/",
    maxAge: options.maxAgeSeconds ?? SECURITY_CONSTANTS.ACCESS_TOKEN_TTL_MINUTES * 60,
  });
  return response;
}

export function clearSecureCookie(response: NextResponse, name: string): NextResponse {
  response.cookies.set({
    name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}