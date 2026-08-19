import { compareSync, hashSync } from "bcryptjs";
import { SECURITY_CONSTANTS } from "@/lib/security/SecurityConstants";
import { validatePasswordPolicy, DEFAULT_SECURITY_POLICY } from "./SecurityPolicy";
import type { PasswordChangeInput } from "@/types/identity";
import { validatePasswordChangeInput } from "./IdentityValidator";

export class PasswordManager {
  hash(password: string): string {
    return hashSync(password, SECURITY_CONSTANTS.PASSWORD_SALT_ROUNDS);
  }

  verify(password: string, hash: string): boolean {
    return compareSync(password, hash);
  }

  validate(password: string): { ok: boolean; issues: string[] } {
    return validatePasswordPolicy(password, DEFAULT_SECURITY_POLICY);
  }

  change(input: PasswordChangeInput, currentHash: string): { ok: boolean; newHash?: string; issues: string[] } {
    validatePasswordChangeInput(input);

    if (!this.verify(input.currentPassword, currentHash)) {
      return { ok: false, issues: ["Current password is incorrect."] };
    }

    const policy = this.validate(input.newPassword);
    if (!policy.ok) return policy;

    return { ok: true, newHash: this.hash(input.newPassword), issues: [] };
  }
}

export const passwordManager = new PasswordManager();