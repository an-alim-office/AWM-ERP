import type {
  DeviceCreateInput,
  LoginAttemptInput,
  MfaEnrollInput,
  MfaVerifyInput,
  PasswordChangeInput,
  RiskCheckInput,
  SessionCreateInput,
} from "@/types/identity";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateSessionCreateInput(input: SessionCreateInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.userId)) throw new Error("userId is required.");
}

export function validateDeviceCreateInput(input: DeviceCreateInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.userId)) throw new Error("userId is required.");
  if (!isNonEmptyString(input.name)) throw new Error("Device name is required.");
  if (!isNonEmptyString(input.fingerprint)) throw new Error("Device fingerprint is required.");
}

export function validatePasswordChangeInput(input: PasswordChangeInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.userId)) throw new Error("userId is required.");
  if (!isNonEmptyString(input.currentPassword)) throw new Error("currentPassword is required.");
  if (!isNonEmptyString(input.newPassword)) throw new Error("newPassword is required.");
}

export function validateMfaEnrollInput(input: MfaEnrollInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.userId)) throw new Error("userId is required.");
}

export function validateMfaVerifyInput(input: MfaVerifyInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.userId)) throw new Error("userId is required.");
  if (!isNonEmptyString(input.code)) throw new Error("code is required.");
}

export function validateRiskCheckInput(input: RiskCheckInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.ip)) throw new Error("ip is required.");
}

export function validateLoginAttemptInput(input: LoginAttemptInput): void {
  if (!isNonEmptyString(input.tenantId)) throw new Error("tenantId is required.");
  if (!isNonEmptyString(input.ip)) throw new Error("ip is required.");
}