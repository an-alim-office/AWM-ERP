import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOTPEmail(email: string, otp: string) {
  await resend.emails.send({
    from: "AWM ERP <no-reply@awmerp.com>",
    to: email,
    subject: "Your Login OTP Code",
    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>AWM ERP Login Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:5px">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  });
}