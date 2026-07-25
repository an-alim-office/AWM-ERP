// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  apiVerifyToken,
  apiLogout,
  apiLoginSendOtp,
  apiVerifyOtp,
  apiRegister,
  apiForgotPasswordSendOtp,
  apiResetPassword,
  User,
  Session,
} from "@/lib/auth-client";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  requiresOtp: boolean;
  otpType: "login" | "registration" | "forgot_password" | null;

  loginWithPassword: (args: {
    email: string;
    password: string;
    deviceId?: string | null;
  }) => Promise<void>;

  verifyOtp: (args: {
    email: string;
    otp: string;
    type?: "login" | "registration" | "forgot_password";
    deviceId?: string | null;
    trustedDevice?: boolean;
  }) => Promise<void>;

  register: (args: {
    name: string;
    email: string;
    password: string;
    deviceId?: string | null;
  }) => Promise<void>;

  forgotPasswordSendOtp: (args: {
    email: string;
    deviceId?: string | null;
  }) => Promise<void>;

  resetPassword: (args: {
    email: string;
    otp: string;
    newPassword: string;
    deviceId?: string | null;
  }) => Promise<void>;

  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpType, setOtpType] =
    useState<"login" | "registration" | "forgot_password" | null>(null);

  useEffect(() => {
    refreshSession().catch(() => undefined);
  }, []);

  async function refreshSession() {
    try {
      setStatus("loading");
      const data = await apiVerifyToken();

      if (data?.isAuthorized) {
        setUser(data.user);
        setSession({
          token: data.token,
          expiresAt: data.expiresAt,
        });
        setStatus("authenticated");
      } else {
        setUser(null);
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch {
      setUser(null);
      setSession(null);
      setStatus("unauthenticated");
    }
  }

  async function loginWithPassword(args: {
    email: string;
    password: string;
    deviceId?: string | null;
  }) {
    setStatus("loading");
    setRequiresOtp(false);
    setOtpType(null);

    const data = await apiLoginSendOtp(args);

    if (data?.success && data?.requiresOTP) {
      setRequiresOtp(true);
      setOtpType("login");
      setStatus("unauthenticated");
    } else {
      setStatus("unauthenticated");
      throw new Error(data?.message || "Login OTP request failed");
    }
  }

  async function verifyOtp(args: {
    email: string;
    otp: string;
    type?: "login" | "registration" | "forgot_password";
    deviceId?: string | null;
    trustedDevice?: boolean;
  }) {
    setStatus("loading");

    const type =
      args.type ||
      otpType ||
      ("login" as "login" | "registration" | "forgot_password");

    const data = await apiVerifyOtp({
      email: args.email,
      otp: args.otp,
      type,
      deviceId: args.deviceId,
      trustedDevice: args.trustedDevice,
    });

    if (!data?.success) {
      setStatus("unauthenticated");
      throw new Error(data?.message || "OTP verification failed");
    }

    if (type === "forgot_password") {
      setRequiresOtp(false);
      setOtpType(null);
      setStatus("unauthenticated");
      return;
    }

    if (data?.session && data?.user) {
      setSession({
        token: data.session.token,
        expiresAt: data.session.expiresAt,
      });
      setUser(data.user);
      setRequiresOtp(false);
      setOtpType(null);
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
      throw new Error("Invalid OTP response structure");
    }
  }

  async function register(args: {
    name: string;
    email: string;
    password: string;
    deviceId?: string | null;
  }) {
    setStatus("loading");
    setRequiresOtp(false);
    setOtpType(null);

    const data = await apiRegister(args);

    if (!data?.success) {
      setStatus("unauthenticated");
      throw new Error(data?.message || "Registration failed");
    }

    setRequiresOtp(true);
    setOtpType("registration");
    setStatus("unauthenticated");
  }

  async function forgotPasswordSendOtp(args: {
    email: string;
    deviceId?: string | null;
  }) {
    setStatus("loading");
    setRequiresOtp(false);
    setOtpType(null);

    const data = await apiForgotPasswordSendOtp(args);

    if (!data?.success) {
      setStatus("unauthenticated");
      throw new Error(data?.message || "Forgot password OTP failed");
    }

    setRequiresOtp(true);
    setOtpType("forgot_password");
    setStatus("unauthenticated");
  }

  async function resetPassword(args: {
    email: string;
    otp: string;
    newPassword: string;
    deviceId?: string | null;
  }) {
    setStatus("loading");

    const data = await apiResetPassword(args);

    if (!data?.success) {
      setStatus("unauthenticated");
      throw new Error(data?.message || "Password reset failed");
    }

    setRequiresOtp(false);
    setOtpType(null);
    setStatus("unauthenticated");
  }

  async function logout() {
    setStatus("loading");
    try {
      await apiLogout();
    } catch {}

    setUser(null);
    setSession(null);
    setRequiresOtp(false);
    setOtpType(null);
    setStatus("unauthenticated");
  }

  const value: AuthContextValue = {
    user,
    session,
    status,
    requiresOtp,
    otpType,
    loginWithPassword,
    verifyOtp,
    register,
    forgotPasswordSendOtp,
    resetPassword,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
