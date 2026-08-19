import type { IdentityClaims, SecurityMeta, TenantContextMode } from "@/types/identity";

export interface IdentityContextValue {
  mode: TenantContextMode;
  claims?: IdentityClaims;
  meta: SecurityMeta;
}

const storage = new WeakMap<object, IdentityContextValue>();

export class IdentityContext {
  static set(target: object, value: IdentityContextValue): void {
    storage.set(target, value);
  }

  static get(target: object): IdentityContextValue | undefined {
    return storage.get(target);
  }

  static clear(target: object): void {
    storage.delete(target);
  }
}