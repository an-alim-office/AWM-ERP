export type TenantContextMode = "tenant" | "platform";

export type IdentityStatus =
  | "active"
  | "inactive"
  | "pending"
  | "locked"
  | "suspended";

export type SessionStatus = "active" | "revoked" | "expired";

export type DeviceTrustLevel = "trusted" | "untrusted" | "blocked";

export type MfaMethod = "totp" | "backup-code" | "sms" | "email";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface IdentityTenantRef {
  tenantId: string;
  tenantSlug?: string;
}

export interface IdentityUserRef extends IdentityTenantRef {
  userId: string;
  email?: string;
}

export interface IdentityClaims extends IdentityUserRef {
  sessionId?: string;
  role?: string;
  permissions?: string[];
  issuedAt: string;
  expiresAt: string;
}

export interface SecurityMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
  tenantId?: string;
  actorId?: string;
}

export interface SessionRecord {
  id: string;
  tenantId: string;
  userId: string;
  tokenHash: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  lastSeenAt?: Date;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface DeviceRecord {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  fingerprint: string;
  trustLevel: DeviceTrustLevel;
  status: "active" | "revoked";
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt?: Date;
  revokedAt?: Date;
  ip?: string;
  userAgent?: string;
}

export interface MfaRecord {
  id: string;
  tenantId: string;
  userId: string;
  enabled: boolean;
  method: MfaMethod;
  secret?: string;
  backupCodesHash?: string[];
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  disabledAt?: Date;
}

export interface LoginAttemptRecord {
  id: string;
  tenantId: string;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  riskLevel: RiskLevel;
  reason?: string;
  createdAt: Date;
}

export interface SecurityPolicyConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSymbol: boolean;
  sessionTtlMinutes: number;
  mfaRequired: boolean;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  trustedDeviceDays: number;
  tokenRotationDays: number;
}

export interface PasswordPolicyCheck {
  ok: boolean;
  issues: string[];
}

export interface RiskCheckInput {
  tenantId: string;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
  loginAttemptsLastHour?: number;
  mfaEnabled?: boolean;
  trustedDevice?: boolean;
}

export interface RiskCheckResult {
  level: RiskLevel;
  score: number;
  reasons: string[];
  action: "allow" | "challenge" | "deny";
}

export interface SessionCreateInput {
  tenantId: string;
  userId: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  ttlMinutes?: number;
}

export interface DeviceCreateInput {
  tenantId: string;
  userId: string;
  name: string;
  fingerprint: string;
  ip?: string;
  userAgent?: string;
}

export interface MfaEnrollInput {
  tenantId: string;
  userId: string;
  method: MfaMethod;
}

export interface MfaVerifyInput {
  tenantId: string;
  userId: string;
  code: string;
  method?: MfaMethod;
}

export interface PasswordChangeInput {
  tenantId: string;
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface LoginAttemptInput {
  tenantId: string;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  riskLevel: RiskLevel;
  reason?: string;
}

export interface IdentityPublicStatus {
  tenantId: string;
  userId: string;
  sessionCount: number;
  deviceCount: number;
  mfaEnabled: boolean;
  riskLevel: RiskLevel;
  locked: boolean;
  passwordPolicy: SecurityPolicyConfig;
}

export interface IdentityTokenPayload extends IdentityClaims {
  issuer: string;
  audience: string;
  nonce?: string;
}