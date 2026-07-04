import crypto from "crypto";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

const resend = new Resend(apiKey);

// ১. OTP জেনারেট করার ফাংশন
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ২. OTP হ্যাশ করার ফাংশন
export function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// ৩. ইমেইলে OTP পাঠানোর ফাংশন (যা আপনি এইমাত্র দিলেন)
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: "AWM ERP <no-reply@awmerp.com>",
      to: email.trim(),
      subject: "Your Login OTP Code - AWM ERP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">AWM ERP Login Verification</h2>
          <p style="color: #666;">Your One-Time Password (OTP) for login is:</p>
          <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error };
  }
}