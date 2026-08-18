/**
 * lib/tenant/TenantResolver.ts
 *
 * AWM-ERP — Multi-tenant Architecture — Tenant Resolver
 *
 * Determines which tenant an incoming request belongs to.
 *
 * Resolution sources:
 *   1. custom-domain
 *   2. header
 *   3. cookie
 *   4. subdomain
 *   5. query
 */

import type { NextRequest } from 'next/server';

import {
  ResolvedTenantContext,
  Tenant,
  TenantResolverOptions,
  TenantResolutionSource,
  TenantError,
} from './types';

import { getTenantResolverOptions } from './TenantConfig';

import {
  TenantRegistry,
  tenantRegistry,
} from './TenantRegistry';

import {
  TenantCache,
  tenantCache,
} from './TenantCache';

export class TenantResolver {
  private readonly options: TenantResolverOptions;

  constructor(
    private readonly registry: TenantRegistry = tenantRegistry,
    private readonly cache: TenantCache = tenantCache,
    options?: Partial<TenantResolverOptions>,
  ) {
    this.options = {
      ...getTenantResolverOptions(),
      ...options,
    };
  }

  async resolve(
    request: NextRequest,
  ): Promise<ResolvedTenantContext> {
    const order =
      this.options.resolutionOrder ?? [
        'custom-domain',
        'header',
        'cookie',
        'subdomain',
        'query',
      ];

    for (const source of order) {
      const identifier = this.extract(request, source);
      if (!identifier) continue;

      const tenant = await this.lookup(
        identifier,
        source,
      );

      if (tenant) {
        return {
          tenant,
          source,
          resolvedAt: new Date(),
        };
      }
    }

    if (this.options.defaultSlug) {
      const defaultSlug = this.normalizeIdentifier(
        this.options.defaultSlug,
      );

      if (defaultSlug) {
        const tenant = await this.lookup(
          defaultSlug,
          'query',
        );

        if (tenant) {
          return {
            tenant,
            source: 'query',
            resolvedAt: new Date(),
          };
        }
      }
    }

    throw new TenantError(
      'TENANT_RESOLUTION_FAILED',
      'Could not resolve a tenant for this request.',
    );
  }

  private extract(
    request: NextRequest,
    source: TenantResolutionSource,
  ): string | null {
    switch (source) {
      case 'header': {
        const value = request.headers.get(this.options.headerName);
        return this.normalizeIdentifier(value);
      }

      case 'cookie': {
        const value = request.cookies.get(this.options.cookieName)?.value ?? null;
        return this.normalizeIdentifier(value);
      }

      case 'query': {
        const value = request.nextUrl.searchParams.get(this.options.queryParam);
        return this.normalizeIdentifier(value);
      }

      case 'subdomain': {
        if (!this.options.allowSubdomain) return null;
        return this.extractSubdomain(request);
      }

      case 'custom-domain': {
        if (!this.options.allowCustomDomain) return null;
        return this.extractCustomDomain(request);
      }

      default:
        return null;
    }
  }

  private extractSubdomain(
    request: NextRequest,
  ): string | null {
    const hostname = this.getHostname(request);
    const rootDomain = this.normalizeHostname(this.options.rootDomain);

    if (!hostname || !rootDomain) return null;
    if (hostname === rootDomain) return null;

    const suffix = `.${rootDomain}`;
    if (!hostname.endsWith(suffix)) return null;

    const subdomain = hostname.slice(0, -suffix.length);
    if (!subdomain) return null;
    if (subdomain.includes('.')) return null;

    return this.normalizeIdentifier(subdomain);
  }

  private extractCustomDomain(
    request: NextRequest,
  ): string | null {
    const hostname = this.getHostname(request);
    if (!hostname) return null;

    const rootDomain = this.normalizeHostname(this.options.rootDomain);

    if (
      rootDomain &&
      (
        hostname === rootDomain ||
        hostname.endsWith(`.${rootDomain}`)
      )
    ) {
      return null;
    }

    return this.normalizeHostname(hostname);
  }

  private async lookup(
    identifier: string,
    source: TenantResolutionSource,
  ): Promise<Tenant | null> {
    const normalized =
      source === 'custom-domain'
        ? this.normalizeHostname(identifier)
        : this.normalizeIdentifier(identifier);

    if (!normalized) return null;

    if (source === 'custom-domain') {
      const cached = this.cache.getByCustomDomain(normalized);
      if (cached) return cached;

      const tenant = await this.registry.getByCustomDomain(normalized);
      if (tenant) this.cache.set(tenant);
      return tenant;
    }

    const cachedBySlug = this.cache.getBySlug(normalized);
    if (cachedBySlug) return cachedBySlug;

    const cachedById = this.cache.getById(normalized);
    if (cachedById) return cachedById;

    let tenant = await this.registry.getBySlug(normalized);
    if (!tenant) tenant = await this.registry.getById(normalized);

    if (tenant) this.cache.set(tenant);
    return tenant;
  }

  private getHostname(
    request: NextRequest,
  ): string | null {
    const hostname =
      request.nextUrl.hostname ||
      request.headers.get('host');

    return this.normalizeHostname(hostname);
  }

  private normalizeHostname(
    value?: string | null,
  ): string | null {
    if (!value) return null;

    let hostname = value.trim().toLowerCase();
    if (!hostname) return null;

    if (
      hostname.startsWith('http://') ||
      hostname.startsWith('https://')
    ) {
      try {
        hostname = new URL(hostname).hostname;
      } catch {
        return null;
      }
    }

    hostname = hostname.replace(/\.$/, '');

    if (
      hostname.includes(':') &&
      !hostname.startsWith('[')
    ) {
      const parts = hostname.split(':');
      if (parts.length === 2) hostname = parts[0];
    }

    return hostname || null;
  }

  private normalizeIdentifier(
    value?: string | null,
  ): string | null {
    if (!value) return null;
    const normalized = value.trim();
    return normalized || null;
  }
}

export const tenantResolver = new TenantResolver();
export default tenantResolver;