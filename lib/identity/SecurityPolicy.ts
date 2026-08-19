import { SECURITY_CONSTANTS } from "@/lib/security/SecurityConstants";
import type { PasswordPolicyCheck, SecurityPolicyConfig } from "@/types/identity";

export const DEFAULT_SECURITY_POLICY: SecurityPolicyConfig = {
  passwordMinLength: SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumber: true,
  passwordRequireSymbol: true,
  sessionTtlMinutes: SECURITY_CONSTANTS.ACCESS_TOKEN_TTL_MINUTES,
  mfaRequired: false,
  maxLoginAttempts: SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS,
  lockoutMinutes: SECURITY_CONSTANTS.LOGIN_LOCKOUT_MINUTES,
  trustedDeviceDays: SECURITY_CONSTANTS.TRUSTED_DEVICE_DAYS,
  tokenRotationDays: SECURITY_CONSTANTS.KEY_ROTATION_DAYS,
};

export function validatePasswordPolicy(
  password: string,
  policy: SecurityPolicyConfig = DEFAULT_SECURITY_POLICY,
): PasswordPolicyCheck {
  const issues: string[] = [];

  if (!password || password.length < policy.passwordMinLength) {
    issues.push(`Password must be at least ${policy.passwordMinLength} characters.`);
  }
  if (policy.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    issues.push("Password must include an uppercase letter.");
  }
  if (policy.passwordRequireLowercase && !/[a-z]/.test(password)) {
    issues.push("Password must include a lowercase letter.");
  }
  if (policy.passwordRequireNumber && !/[0-9]/.test(password)) {
    issues.push("Password must include a number.");
  }
  if (policy.passwordRequireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    issues.push("Password must include a symbol.");
  }

  return { ok: issues.length === 0, issues };
}