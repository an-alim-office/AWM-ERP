import type { MfaRecord } from "@/types/identity";

export class MfaRepository {
  private readonly rows = new Map<string, MfaRecord>();

  save(record: MfaRecord): MfaRecord {
    this.rows.set(this.key(record.tenantId, record.userId), record);
    return record;
  }

  find(tenantId: string, userId: string): MfaRecord | undefined {
    return this.rows.get(this.key(tenantId, userId));
  }

  disable(tenantId: string, userId: string): MfaRecord | undefined {
    const row = this.find(tenantId, userId);
    if (!row) return undefined;
    row.enabled = false;
    row.disabledAt = new Date();
    row.updatedAt = new Date();
    this.rows.set(this.key(tenantId, userId), row);
    return row;
  }

  private key(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }
}

export const mfaRepository = new MfaRepository();