import { hashValue } from "@/lib/security/Hashing";
import type { LoginAttemptInput, LoginAttemptRecord } from "@/types/identity";
import { validateLoginAttemptInput } from "./IdentityValidator";
import { identityCache } from "./IdentityCache";

export class LoginAttemptManager {
  private readonly attempts = new Map<string, LoginAttemptRecord[]>();

  record(input: LoginAttemptInput): LoginAttemptRecord {
    validateLoginAttemptInput(input);

    const record: LoginAttemptRecord = {
      id: hashValue(`${input.tenantId}:${input.ip}:${Date.now()}:${Math.random()}`),
      tenantId: input.tenantId,
      userId: input.userId,
      email: input.email,
      ip: input.ip,
      userAgent: input.userAgent,
      success: input.success,
      riskLevel: input.riskLevel,
      reason: input.reason,
      createdAt: new Date(),
    };

    const key = `login-attempts:${input.tenantId}:${input.userId ?? input.email ?? input.ip}`;
    const list = this.attempts.get(key) ?? [];
    list.unshift(record);
    this.attempts.set(key, list.slice(0, 100));
    identityCache.set(key, list.slice(0, 100), 3600);

    return record;
  }

  countRecentByIp(tenantId: string, ip: string, minutes = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let count = 0;

    for (const records of this.attempts.values()) {
      for (const attempt of records) {
        if (attempt.tenantId === tenantId && attempt.ip === ip && attempt.createdAt.getTime() >= cutoff) {
          count += 1;
        }
      }
    }

    return count;
  }

  listByTenant(tenantId: string): LoginAttemptRecord[] {
    const out: LoginAttemptRecord[] = [];
    for (const records of this.attempts.values()) {
      out.push(...records.filter((r) => r.tenantId === tenantId));
    }
    return out.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const loginAttemptManager = new LoginAttemptManager();