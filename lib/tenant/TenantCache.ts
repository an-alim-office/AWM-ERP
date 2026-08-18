/**
 * lib/tenant/TenantCache.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Production Tenant Cache
 *
 * Process-local in-memory cache with TTL and LRU eviction.
 */

import type { Tenant } from './types';
import {
  TENANT_CACHE_TTL_MS,
  TENANT_CACHE_MAX_ENTRIES,
} from './TenantConfig';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface TenantCacheStats {
  cachedTenants: number;
  cachedSlugs: number;
  cachedDomains: number;
  hits: number;
  misses: number;
  hitRate: number;
  maxEntries: number;
  ttlMs: number;
  generatedAt: Date;
}

class LruTtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  set(
    key: string,
    value: T,
    ttlMs: number = this.ttlMs,
  ): void {
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) return;

    this.store.delete(key);

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    this.evictIfNecessary();
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  cleanupExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  private evictIfNecessary(): void {
    const maxEntries =
      Number.isFinite(this.maxEntries) && this.maxEntries > 0
        ? Math.floor(this.maxEntries)
        : 1;

    while (this.store.size > maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey === undefined) break;
      this.store.delete(oldestKey);
    }
  }
}

export class TenantCache {
  private readonly byId = new LruTtlCache<Tenant>(
    TENANT_CACHE_TTL_MS,
    TENANT_CACHE_MAX_ENTRIES,
  );

  private readonly bySlug = new Map<string, string>();
  private readonly byDomain = new Map<string, string>();

  private hits = 0;
  private misses = 0;

  getById(id: string): Tenant | undefined {
    const normalizedId = this.normalizeId(id);
    if (!normalizedId) {
      this.recordMiss();
      return undefined;
    }

    const tenant = this.byId.get(normalizedId);
    if (!tenant) {
      this.recordMiss();
      return undefined;
    }

    this.recordHit();
    return tenant;
  }

  getBySlug(slug: string): Tenant | undefined {
    const normalizedSlug = this.normalizeSlug(slug);
    if (!normalizedSlug) {
      this.recordMiss();
      return undefined;
    }

    const tenantId = this.bySlug.get(normalizedSlug);
    if (!tenantId) {
      this.recordMiss();
      return undefined;
    }

    const tenant = this.byId.get(tenantId);

    if (!tenant) {
      this.bySlug.delete(normalizedSlug);
      this.recordMiss();
      return undefined;
    }

    if (this.normalizeSlug(tenant.slug) !== normalizedSlug) {
      this.bySlug.delete(normalizedSlug);
      this.recordMiss();
      return undefined;
    }

    this.recordHit();
    return tenant;
  }

  getByCustomDomain(domain: string): Tenant | undefined {
    const normalizedDomain = this.normalizeDomain(domain);
    if (!normalizedDomain) {
      this.recordMiss();
      return undefined;
    }

    const tenantId = this.byDomain.get(normalizedDomain);
    if (!tenantId) {
      this.recordMiss();
      return undefined;
    }

    const tenant = this.byId.get(tenantId);

    if (!tenant) {
      this.byDomain.delete(normalizedDomain);
      this.recordMiss();
      return undefined;
    }

    const tenantDomain = tenant.customDomain
      ? this.normalizeDomain(tenant.customDomain)
      : '';

    if (tenantDomain !== normalizedDomain) {
      this.byDomain.delete(normalizedDomain);
      this.recordMiss();
      return undefined;
    }

    this.recordHit();
    return tenant;
  }

  set(tenant: Tenant): void {
    if (!tenant || !tenant.id) return;

    const normalizedId = this.normalizeId(tenant.id);
    if (!normalizedId) return;

    const normalizedSlug = this.normalizeSlug(tenant.slug);
    const normalizedDomain = tenant.customDomain
      ? this.normalizeDomain(tenant.customDomain)
      : '';

    const previousTenant = this.byId.get(normalizedId);

    if (previousTenant) {
      const previousSlug = this.normalizeSlug(previousTenant.slug);
      if (previousSlug && previousSlug !== normalizedSlug) {
        const mappedId = this.bySlug.get(previousSlug);
        if (mappedId === normalizedId) this.bySlug.delete(previousSlug);
      }

      const previousDomain = previousTenant.customDomain
        ? this.normalizeDomain(previousTenant.customDomain)
        : '';

      if (previousDomain && previousDomain !== normalizedDomain) {
        const mappedId = this.byDomain.get(previousDomain);
        if (mappedId === normalizedId) this.byDomain.delete(previousDomain);
      }
    }

    if (normalizedSlug) {
      const existingSlugOwner = this.bySlug.get(normalizedSlug);
      if (existingSlugOwner && existingSlugOwner !== normalizedId) {
        this.bySlug.delete(normalizedSlug);
      }
    }

    if (normalizedDomain) {
      const existingDomainOwner = this.byDomain.get(normalizedDomain);
      if (existingDomainOwner && existingDomainOwner !== normalizedId) {
        this.byDomain.delete(normalizedDomain);
      }
    }

    this.byId.set(normalizedId, tenant);

    if (normalizedSlug) {
      this.bySlug.set(normalizedSlug, normalizedId);
    }

    if (normalizedDomain) {
      this.byDomain.set(normalizedDomain, normalizedId);
    }

    this.cleanupIndexes();
  }

  invalidate(
    tenant: Pick<Tenant, 'id' | 'slug' | 'customDomain'>,
  ): void {
    const normalizedId = this.normalizeId(tenant.id);
    if (!normalizedId) return;

    this.byId.delete(normalizedId);

    const normalizedSlug = this.normalizeSlug(tenant.slug);
    if (normalizedSlug) {
      const mappedId = this.bySlug.get(normalizedSlug);
      if (mappedId === normalizedId) {
        this.bySlug.delete(normalizedSlug);
      }
    }

    if (tenant.customDomain) {
      const normalizedDomain = this.normalizeDomain(tenant.customDomain);
      if (normalizedDomain) {
        const mappedId = this.byDomain.get(normalizedDomain);
        if (mappedId === normalizedId) {
          this.byDomain.delete(normalizedDomain);
        }
      }
    }

    this.removeIndexesForTenant(normalizedId);
  }

  clear(): void {
    this.byId.clear();
    this.bySlug.clear();
    this.byDomain.clear();
    this.resetStats();
  }

  cleanup(): number {
    const removed = this.byId.cleanupExpired();
    this.cleanupIndexes();
    return removed;
  }

  stats(): TenantCacheStats {
    this.cleanup();

    const totalRequests = this.hits + this.misses;
    const hitRate =
      totalRequests === 0 ? 0 : this.hits / totalRequests;

    return {
      cachedTenants: this.byId.size,
      cachedSlugs: this.bySlug.size,
      cachedDomains: this.byDomain.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: Number(hitRate.toFixed(4)),
      maxEntries: TENANT_CACHE_MAX_ENTRIES,
      ttlMs: TENANT_CACHE_TTL_MS,
      generatedAt: new Date(),
    };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  hasById(id: string): boolean {
    return Boolean(this.getById(id));
  }

  hasBySlug(slug: string): boolean {
    return Boolean(this.getBySlug(slug));
  }

  hasByCustomDomain(domain: string): boolean {
    return Boolean(this.getByCustomDomain(domain));
  }

  private cleanupIndexes(): void {
    for (const [slug, tenantId] of this.bySlug.entries()) {
      const tenant = this.byId.get(tenantId);
      if (!tenant || this.normalizeSlug(tenant.slug) !== slug) {
        this.bySlug.delete(slug);
      }
    }

    for (const [domain, tenantId] of this.byDomain.entries()) {
      const tenant = this.byId.get(tenantId);
      const tenantDomain = tenant?.customDomain
        ? this.normalizeDomain(tenant.customDomain)
        : '';

      if (!tenant || tenantDomain !== domain) {
        this.byDomain.delete(domain);
      }
    }
  }

  private removeIndexesForTenant(
    tenantId: string,
  ): void {
    if (!tenantId) return;

    for (const [slug, mappedId] of this.bySlug.entries()) {
      if (mappedId === tenantId) {
        this.bySlug.delete(slug);
      }
    }

    for (const [domain, mappedId] of this.byDomain.entries()) {
      if (mappedId === tenantId) {
        this.byDomain.delete(domain);
      }
    }
  }

  private normalizeId(id: string): string {
    return String(id ?? '').trim();
  }

  private normalizeSlug(slug: string): string {
    return String(slug ?? '').trim().toLowerCase();
  }

  private normalizeDomain(domain: string): string {
    return String(domain ?? '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
      .replace(/\/+$/, '');
  }

  private recordHit(): void {
    this.hits++;
  }

  private recordMiss(): void {
    this.misses++;
  }
}

export const tenantCache = new TenantCache();
export default tenantCache;