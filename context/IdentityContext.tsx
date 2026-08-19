"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { IdentityClaims, SecurityMeta, TenantContextMode } from "@/types/identity";

export interface IdentitySessionState {
  mode: TenantContextMode;
  claims?: IdentityClaims;
  meta: SecurityMeta;
  authenticated: boolean;
}

interface IdentityContextValue extends IdentitySessionState {
  setState: React.Dispatch<React.SetStateAction<IdentitySessionState>>;
  clear: () => void;
}

const defaultState: IdentitySessionState = {
  mode: "platform",
  claims: undefined,
  meta: {},
  authenticated: false,
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IdentitySessionState>(defaultState);

  const value = useMemo<IdentityContextValue>(
    () => ({
      ...state,
      setState,
      clear: () => setState(defaultState),
    }),
    [state],
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity must be used within IdentityProvider.");
  }
  return context;
}

export { IdentityContext };