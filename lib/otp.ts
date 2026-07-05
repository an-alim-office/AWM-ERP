import crypto from "crypto";
import { Resend } from "resend";

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_TYPE_LOGIN = "login";
export const OTP_TYPE_REGISTRATION = "registration";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOTP(inputOtp: string, hashedOtp: string) {
  return hashOTP(inputOtp) === hashedOtp;
}

export function getOTPExpiryDate(minutes = OTP_EXPIRY_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function generateSessionToken() {
  return crypto.randomBytes(48).toString("hex");
}

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const resend = getResendClient();
    const normalizedEmail = normalizeEmail(email);

    const result = await resend.emails.send({
      from: "AWM ERP <no-reply@awmerp.com>",
      to: normalizedEmail,
      subject: "Your AWM ERP Login OTP Code",
      text: `Your AWM ERP OTP is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px">
          <h2 style="margin-top:0;color:#222">AWM ERP Login Verification</h2>
          <p style="color:#555">Your One-Time Password (OTP) for login is:</p>
          <div style="background:#f4f4f4;padding:14px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px;color:#2563eb;margin:20px 0;border-radius:8px">
            ${otp}
          </div>
          <p style="color:#777;font-size:13px">
            This code will expire in ${OTP_EXPIRY_MINUTES} minutes.
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    if ((result as any)?.error) {
      return {
        success: false,
        error: (result as any).error,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("sendOTPEmail error:", {
      message: error?.message,
      name: error?.name,
    });

    return {
      success: false,
      error: error?.message || "Failed to send OTP email",
    };
  }
}
