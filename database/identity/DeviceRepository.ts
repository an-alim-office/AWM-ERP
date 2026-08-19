import type { DeviceRecord } from "@/types/identity";

export class DeviceRepository {
  private readonly rows = new Map<string, DeviceRecord>();

  save(record: DeviceRecord): DeviceRecord {
    this.rows.set(record.id, record);
    return record;
  }

  findById(deviceId: string): DeviceRecord | undefined {
    return this.rows.get(deviceId);
  }

  findByTenant(tenantId: string): DeviceRecord[] {
    return [...this.rows.values()].filter((row) => row.tenantId === tenantId);
  }

  findByTenantAndUser(tenantId: string, userId: string): DeviceRecord[] {
    return [...this.rows.values()].filter((row) => row.tenantId === tenantId && row.userId === userId);
  }

  revoke(deviceId: string): boolean {
    const row = this.rows.get(deviceId);
    if (!row) return false;
    row.status = "revoked";
    row.trustLevel = "blocked";
    row.revokedAt = new Date();
    row.updatedAt = new Date();
    this.rows.set(deviceId, row);
    return true;
  }
}

export const deviceRepository = new DeviceRepository();