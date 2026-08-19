import type { SessionRecord } from "@/types/identity";

export class SessionRepository {
  private readonly rows = new Map<string, SessionRecord>();

  save(record: SessionRecord): SessionRecord {
    this.rows.set(record.id, record);
    return record;
  }

  findById(sessionId: string): SessionRecord | undefined {
    return this.rows.get(sessionId);
  }

  findByTenant(tenantId: string): SessionRecord[] {
    return [...this.rows.values()].filter((row) => row.tenantId === tenantId);
  }

  findByTenantAndUser(tenantId: string, userId: string): SessionRecord[] {
    return [...this.rows.values()].filter((row) => row.tenantId === tenantId && row.userId === userId);
  }

  revoke(sessionId: string): boolean {
    const row = this.rows.get(sessionId);
    if (!row) return false;
    row.status = "revoked";
    row.revokedAt = new Date();
    row.updatedAt = new Date();
    this.rows.set(sessionId, row);
    return true;
  }

  revokeByTenant(tenantId: string): number {
    let count = 0;
    for (const [id, row] of this.rows.entries()) {
      if (row.tenantId === tenantId) {
        row.status = "revoked";
        row.revokedAt = new Date();
        row.updatedAt = new Date();
        this.rows.set(id, row);
        count += 1;
      }
    }
    return count;
  }
}

export const sessionRepository = new SessionRepository();