import type { DeviceRecord, IdentityPublicStatus, LoginAttemptRecord, MfaRecord, SessionRecord } from "@/types/identity";

type CacheValue =
  | SessionRecord
  | DeviceRecord
  | MfaRecord
  | LoginAttemptRecord[]
  | IdentityPublicStatus;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class IdentityCache {
  private readonly cache = new Map<string, CacheEntry<CacheValue>>();

  set<T extends CacheValue>(key: string, value: T, ttlSeconds = 300): void {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  get<T extends CacheValue>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clearPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
}

export const identityCache = new IdentityCache();