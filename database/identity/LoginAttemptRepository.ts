import type { LoginAttemptRecord, RiskLevel } from "@/types/identity";

export class LoginAttemptRepository {
  private readonly rows: LoginAttemptRecord[] = [];

  save(record: LoginAttemptRecord): LoginAttemptRecord {
    this.rows.unshift(record);
    return record;
  }

  findByTenant(tenantId: string): LoginAttemptRecord[] {
    return this.rows.filter((row) => row.tenantId === tenantId);
  }

  findByTenantAndIp(tenantId: string, ip: string): LoginAttemptRecord[] {
    return this.rows.filter((row) => row.tenantId === tenantId && row.ip === ip);
  }

  countRecentByTenantAndIp(tenantId: string, ip: string, minutes = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.findByTenantAndIp(tenantId, ip).filter((row) => row.createdAt.getTime() >= cutoff).length;
  }

  countFailuresByTenant(tenantId: string, minutes = 60, level?: RiskLevel): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.rows.filter((row) => {
      if (row.tenantId !== tenantId) return false;
      if (row.createdAt.getTime() < cutoff) return false;
      if (level && row.riskLevel !== level) return false;
      return !row.success;
    }).length;
  }
}

export const loginAttemptRepository = new LoginAttemptRepository();