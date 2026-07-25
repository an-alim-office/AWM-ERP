import crypto from "crypto";
import { Resend } from "resend";

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_TYPE_LOGIN = "login";
export const OTP_TYPE_REGISTRATION = "registration";
export const OTP_TYPE_FORGOT_PASSWORD = "forgot_password";

export type OtpEmailType =
  | typeof OTP_TYPE_LOGIN
  | typeof OTP_TYPE_REGISTRATION
  | typeof OTP_TYPE_FORGOT_PASSWORD;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

function getFromAddress() {
  return (
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    "AWM ERP <no-reply@awmerp.com>"
  );
}

export function normalizeEmail(email: string) {
  return email
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .replace(/\s+/g, "");
}

/**
 * Generic email validator — works with ANY valid email domain
 * (Gmail, Yahoo, Outlook, custom company domains, etc.).
 * There is intentionally no domain whitelist/blacklist here.
 *
 * Rules enforced:
 *  - exactly one "@"
 *  - local part allows standard RFC-5322-safe characters
 *  - domain must have at least one dot and valid label characters
 *  - overall length capped at 254 chars (RFC 5321 limit)
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;

  // Must contain exactly one "@"
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) return false;

  const [localPart, domainPart] = trimmed.split("@");
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (domainPart.length === 0 || domainPart.length > 255) return false;
  if (!domainPart.includes(".")) return false;

  return true;
}

/**
 * Normalizes a raw OTP "type" value coming from a request body into
 * one of the three known OTP type constants. Falls back to LOGIN
 * for any unrecognized or missing value so verify-otp never crashes
 * on an unexpected/undefined type.
 */
export function normalizeOtpType(rawType: unknown): OtpEmailType {
  if (typeof rawType !== "string") return OTP_TYPE_LOGIN;

  const value = rawType.trim().toLowerCase();

  if (value === OTP_TYPE_REGISTRATION) return OTP_TYPE_REGISTRATION;
  if (value === OTP_TYPE_FORGOT_PASSWORD) return OTP_TYPE_FORGOT_PASSWORD;
  if (value === OTP_TYPE_LOGIN) return OTP_TYPE_LOGIN;

  return OTP_TYPE_LOGIN;
}

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

export function getOTPExpiryDate(minutes = OTP_EXPIRY_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Generates a cryptographically secure, URL-safe session/reset token.
 * Used for auth session cookies and password-reset tokens.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getEmailContent(type: OtpEmailType, otp: string) {
  const expiryText = `${OTP_EXPIRY_MINUTES} minutes`;

  if (type === OTP_TYPE_REGISTRATION) {
    return {
      subject: `${otp} is your AWM ERP registration code`,
      heading: "Verify Your Email",
      intro: "Use this code to complete your AWM ERP registration:",
    };
  }

  if (type === OTP_TYPE_FORGOT_PASSWORD) {
    return {
      subject: `${otp} is your AWM ERP password reset code`,
      heading: "Password Reset Verification",
      intro: "Use this code to reset your AWM ERP password:",
    };
  }

  return {
    subject: `${otp} is your AWM ERP login code`,
    heading: "Login Verification",
    intro: "Use this code to sign in to AWM ERP:",
  };
}

/**
 * MOBILE‑SAFE HTML TEMPLATE
 * - No hidden preheader
 * - No letter-spacing
 * - No monospace font
 * - Pure table-based layout (Gmail/iOS safe)
 * - No CSS that Resend strips
 */
function buildOtpEmailHtml(otp: string, heading: string, intro: string) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;background:#f4f7fb;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:10px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">${heading}</h2>
                <p style="margin:0 0 20px;font-size:15px;color:#4b5563;">${intro}</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
                  <tr>
                    <td align="center" style="padding:16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;">Verification Code</p>
                      <p style="margin:10px 0 0;font-size:32px;font-weight:bold;color:#1d4ed8;">${otp}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0;font-size:14px;color:#6b7280;">
                  This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: OtpEmailType = OTP_TYPE_LOGIN
) {
  try {
    const resend = getResendClient();
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return { success: false, error: "Invalid recipient email address" };
    }

    const content = getEmailContent(type, otp);

    const textBody = `${content.intro}\n\n${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, please ignore this email.`;

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [normalizedEmail],
      subject: content.subject,
      text: textBody,
      html: buildOtpEmailHtml(otp, content.heading, content.intro),

      // reply-to must match domain of "from"
      replyTo: process.env.RESEND_FROM || "no-reply@awmerp.com",

      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },

      tags: [
        { name: "category", value: "otp" },
        { name: "type", value: type },
      ],
    });

    if (error) {
      console.error("sendOTPEmail Resend error:", error);
      return { success: false, error: error.message };
    }

    if (!data?.id) {
      return { success: false, error: "Email provider did not return a message id" };
    }

    return { success: true, messageId: data.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to send OTP email" };
  }
}