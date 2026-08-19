import type { IdentityPublicStatus, SecurityPolicyConfig } from "@/types/identity";
import { DEFAULT_SECURITY_POLICY } from "./SecurityPolicy";
import { sessionManager } from "./SessionManager";
import { deviceManager } from "./DeviceManager";
import { mfaManager } from "./MfaManager";
import { loginAttemptManager } from "./LoginAttemptManager";
import { riskEngine } from "./RiskEngine";

export class IdentityManager {
  getPublicStatus(
    tenantId: string,
    userId: string,
    policy: SecurityPolicyConfig = DEFAULT_SECURITY_POLICY,
  ): IdentityPublicStatus {
    const sessions = sessionManager.list(tenantId, userId);
    const devices = deviceManager.list(tenantId, userId);
    const mfa = mfaManager.get(tenantId, userId);

    return {
      tenantId,
      userId,
      sessionCount: sessions.filter((s) => s.status === "active").length,
      deviceCount: devices.filter((d) => d.status === "active").length,
      mfaEnabled: Boolean(mfa?.enabled),
      riskLevel: riskEngine.assess({
        tenantId,
        userId,
        ip: "0.0.0.0",
        mfaEnabled: Boolean(mfa?.enabled),
        trustedDevice: devices.some((d) => d.trustLevel === "trusted"),
      }).level,
      locked: loginAttemptManager.countRecentByIp(tenantId, "0.0.0.0", policy.lockoutMinutes) >= policy.maxLoginAttempts,
      passwordPolicy: policy,
    };
  }
}

export const identityManager = new IdentityManager();