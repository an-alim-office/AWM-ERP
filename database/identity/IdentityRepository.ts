import type { IdentityPublicStatus, SecurityPolicyConfig } from "@/types/identity";

export interface IdentitySummaryRow {
  tenantId: string;
  userId: string;
  email?: string;
  status: "active" | "inactive" | "pending" | "locked" | "suspended";
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class IdentityRepository {
  private readonly rows = new Map<string, IdentitySummaryRow>();

  upsert(row: IdentitySummaryRow): IdentitySummaryRow {
    this.rows.set(this.key(row.tenantId, row.userId), row);
    return row;
  }

  findByTenantAndUser(tenantId: string, userId: string): IdentitySummaryRow | undefined {
    return this.rows.get(this.key(tenantId, userId));
  }

  findByTenantAndEmail(tenantId: string, email: string): IdentitySummaryRow | undefined {
    for (const row of this.rows.values()) {
      if (row.tenantId === tenantId && row.email?.toLowerCase() === email.toLowerCase()) return row;
    }
    return undefined;
  }

  lock(tenantId: string, userId: string): IdentitySummaryRow | undefined {
    const row = this.findByTenantAndUser(tenantId, userId);
    if (!row) return undefined;
    row.status = "locked";
    row.updatedAt = new Date();
    this.rows.set(this.key(tenantId, userId), row);
    return row;
  }

  setStatus(
    tenantId: string,
    userId: string,
    status: IdentitySummaryRow["status"],
  ): IdentitySummaryRow | undefined {
    const row = this.findByTenantAndUser(tenantId, userId);
    if (!row) return undefined;
    row.status = status;
    row.updatedAt = new Date();
    this.rows.set(this.key(tenantId, userId), row);
    return row;
  }

  getPublicStatus(
    tenantId: string,
    userId: string,
    policy: SecurityPolicyConfig,
  ): IdentityPublicStatus | undefined {
    const row = this.findByTenantAndUser(tenantId, userId);
    if (!row) return undefined;

    return {
      tenantId,
      userId,
      sessionCount: 0,
      deviceCount: 0,
      mfaEnabled: row.mfaEnabled,
      riskLevel: "low",
      locked: row.status === "locked",
      passwordPolicy: policy,
    };
  }

  private key(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }
}

export const identityRepository = new IdentityRepository();