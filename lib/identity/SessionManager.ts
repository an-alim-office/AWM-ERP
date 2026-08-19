import { hashValue, randomToken } from "@/lib/security/Hashing";
import { SECURITY_CONSTANTS } from "@/lib/security/SecurityConstants";
import type { SessionCreateInput, SessionRecord, SessionStatus } from "@/types/identity";
import { validateSessionCreateInput } from "./IdentityValidator";
import { identityCache } from "./IdentityCache";

export class SessionManager {
  private readonly sessions = new Map<string, SessionRecord>();

  create(input: SessionCreateInput): SessionRecord {
    validateSessionCreateInput(input);

    const ttlMinutes = input.ttlMinutes ?? SECURITY_CONSTANTS.ACCESS_TOKEN_TTL_MINUTES;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const token = randomToken(32);

    const record: SessionRecord = {
      id: hashValue(`${input.tenantId}:${input.userId}:${token}`),
      tenantId: input.tenantId,
      userId: input.userId,
      tokenHash: hashValue(token),
      status: "active",
      createdAt: now,
      updatedAt: now,
      expiresAt,
      ip: input.ip,
      userAgent: input.userAgent,
      deviceId: input.deviceId,
      lastSeenAt: now,
    };

    this.sessions.set(record.id, record);
    identityCache.set(`session:${record.id}`, record, ttlMinutes * 60);
    return record;
  }

  get(sessionId: string): SessionRecord | undefined {
    const cached = identityCache.get<SessionRecord>(`session:${sessionId}`);
    if (cached) return cached;
    return this.sessions.get(sessionId);
  }

  revoke(sessionId: string): boolean {
    const record = this.sessions.get(sessionId);
    if (!record) return false;
    record.status = "revoked";
    record.revokedAt = new Date();
    record.updatedAt = new Date();
    this.sessions.set(sessionId, record);
    identityCache.delete(`session:${sessionId}`);
    return true;
  }

  revokeByTenant(tenantId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.tenantId === tenantId) {
        session.status = "revoked";
        session.revokedAt = new Date();
        session.updatedAt = new Date();
        this.sessions.set(id, session);
        identityCache.delete(`session:${id}`);
        count += 1;
      }
    }
    return count;
  }

  list(tenantId: string, userId?: string): SessionRecord[] {
    return [...this.sessions.values()]
      .filter((s) => s.tenantId === tenantId && (userId ? s.userId === userId : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  touch(sessionId: string): SessionRecord | undefined {
    const record = this.sessions.get(sessionId);
    if (!record) return undefined;
    record.lastSeenAt = new Date();
    record.updatedAt = new Date();
    this.sessions.set(sessionId, record);
    identityCache.set(`session:${sessionId}`, record, 3600);
    return record;
  }

  isActive(sessionId: string): boolean {
    const record = this.sessions.get(sessionId);
    if (!record) return false;
    if (record.status !== "active") return false;
    if (record.expiresAt.getTime() <= Date.now()) {
      record.status = "expired";
      this.sessions.set(sessionId, record);
      return false;
    }
    return true;
  }
}

export const sessionManager = new SessionManager();