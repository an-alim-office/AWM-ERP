import crypto from "crypto";
import { hashValue, randomCode } from "@/lib/security/Hashing";
import { SECURITY_CONSTANTS } from "@/lib/security/SecurityConstants";
import type { MfaEnrollInput, MfaMethod, MfaRecord, MfaVerifyInput } from "@/types/identity";
import { validateMfaEnrollInput, validateMfaVerifyInput } from "./IdentityValidator";
import { identityCache } from "./IdentityCache";

export class MfaManager {
  private readonly store = new Map<string, MfaRecord>();

  enroll(input: MfaEnrollInput): { record: MfaRecord; secret?: string; backupCodes: string[] } {
    validateMfaEnrollInput(input);

    const id = hashValue(`${input.tenantId}:${input.userId}:${input.method}:${Date.now()}`);
    const secret = input.method === "totp" ? crypto.randomBytes(20).toString("hex") : undefined;
    const backupCodes = Array.from({ length: SECURITY_CONSTANTS.BACKUP_CODE_COUNT }, () => randomCode());

    const record: MfaRecord = {
      id,
      tenantId: input.tenantId,
      userId: input.userId,
      enabled: false,
      method: input.method,
      secret,
      backupCodesHash: backupCodes.map((code) => hashValue(code)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.store.set(this.key(input.tenantId, input.userId), record);
    identityCache.set(this.key(input.tenantId, input.userId), record, 3600);

    return { record, secret, backupCodes };
  }

  verify(input: MfaVerifyInput): { ok: boolean; method: MfaMethod; backupCodeUsed?: boolean } {
    validateMfaVerifyInput(input);

    const record = this.store.get(this.key(input.tenantId, input.userId));
    if (!record) return { ok: false, method: input.method ?? "totp" };

    if (record.backupCodesHash?.includes(hashValue(input.code))) {
      record.enabled = true;
      record.verifiedAt = new Date();
      record.updatedAt = new Date();
      this.store.set(this.key(input.tenantId, input.userId), record);
      return { ok: true, method: record.method, backupCodeUsed: true };
    }

    if (record.method === "totp" && record.secret) {
      const expected = record.secret.slice(0, 6);
      if (input.code === expected) {
        record.enabled = true;
        record.verifiedAt = new Date();
        record.updatedAt = new Date();
        this.store.set(this.key(input.tenantId, input.userId), record);
        return { ok: true, method: record.method };
      }
    }

    return { ok: false, method: record.method };
  }

  disable(tenantId: string, userId: string): boolean {
    const record = this.store.get(this.key(tenantId, userId));
    if (!record) return false;
    record.enabled = false;
    record.disabledAt = new Date();
    record.updatedAt = new Date();
    this.store.set(this.key(tenantId, userId), record);
    return true;
  }

  get(tenantId: string, userId: string): MfaRecord | undefined {
    return this.store.get(this.key(tenantId, userId));
  }

  private key(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }
}

export const mfaManager = new MfaManager();