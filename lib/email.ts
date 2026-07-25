export {
  sendOTPEmail,
  generateOTP,
  hashOTP,
  getOTPExpiryDate,
  isValidEmail,
  normalizeEmail,
  normalizeOtpType,
  generateSessionToken,
  OTP_TYPE_LOGIN,
  OTP_TYPE_REGISTRATION,
  OTP_TYPE_FORGOT_PASSWORD,
  OTP_EXPIRY_MINUTES,
} from "@/lib/otp";

export type { OtpEmailType } from "@/lib/otp";