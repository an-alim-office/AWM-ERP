import { hashValue } from "@/lib/security/Hashing";
import type { DeviceCreateInput, DeviceRecord } from "@/types/identity";
import { validateDeviceCreateInput } from "./IdentityValidator";
import { identityCache } from "./IdentityCache";

export class DeviceManager {
  private readonly devices = new Map<string, DeviceRecord>();

  register(input: DeviceCreateInput): DeviceRecord {
    validateDeviceCreateInput(input);

    const record: DeviceRecord = {
      id: hashValue(`${input.tenantId}:${input.userId}:${input.fingerprint}:${Date.now()}`),
      tenantId: input.tenantId,
      userId: input.userId,
      name: input.name.trim(),
      fingerprint: input.fingerprint.trim(),
      trustLevel: "untrusted",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      ip: input.ip,
      userAgent: input.userAgent,
    };

    this.devices.set(this.key(input.tenantId, input.userId, record.id), record);
    identityCache.set(this.key(input.tenantId, input.userId, record.id), record, 3600);
    return record;
  }

  trust(tenantId: string, userId: string, deviceId: string): DeviceRecord | undefined {
    const record = this.devices.get(this.key(tenantId, userId, deviceId));
    if (!record) return undefined;
    record.trustLevel = "trusted";
    record.updatedAt = new Date();
    record.lastSeenAt = new Date();
    this.devices.set(this.key(tenantId, userId, deviceId), record);
    return record;
  }

  revoke(tenantId: string, userId: string, deviceId: string): boolean {
    const record = this.devices.get(this.key(tenantId, userId, deviceId));
    if (!record) return false;
    record.status = "revoked";
    record.trustLevel = "blocked";
    record.revokedAt = new Date();
    record.updatedAt = new Date();
    this.devices.set(this.key(tenantId, userId, deviceId), record);
    return true;
  }

  list(tenantId: string, userId: string): DeviceRecord[] {
    return [...this.devices.values()].filter((d) => d.tenantId === tenantId && d.userId === userId);
  }

  private key(tenantId: string, userId: string, deviceId: string): string {
    return `${tenantId}:${userId}:${deviceId}`;
  }
}

export const deviceManager = new DeviceManager();