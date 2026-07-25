"use client";

import { useState, useCallback } from "react";

interface AuthResponse {
  success: boolean;
  message: string;
  requiresOtp?: boolean;
  isNewDevice?: boolean;
  token?: string;
  user?: {
    email: string;
    name: string;
    role: string;
  };
}

export function useAuth() {
  const [loading, setLoading] = useState(false);

  /**
   * STEP 1 → SEND OTP (Login)
   * -----------------------------------------
   * Calls: /api/auth-service/send-otp
   * Backend validates:
   * - email (accepts ANY valid email domain — no whitelist)
   * - password
   * - deviceId
   * Then sends OTP.
   */
  const sendOtp = useCallback(
    async (
      email: string,
      password: string,
      deviceId: string
    ): Promise<AuthResponse> => {
      setLoading(true);

      try {
        const res = await fetch("/api/auth-service/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, deviceId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to send OTP");
        }

        return data;
      } catch (error: any) {
        throw new Error(error.message || "Network error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * STEP 2 → VERIFY OTP (Login)
   * -----------------------------------------
   * Calls: /api/auth-service/verify-otp
   * Backend validates:
   * - OTP hash
   * - attempts
   * - expiry
   * - trustedDevice flag
   * Then creates session + cookie.
   */
  const verifyOtp = useCallback(
    async (
      email: string,
      otp: string,
      deviceId: string,
      trustedDevice: boolean
    ): Promise<AuthResponse> => {
      setLoading(true);

      try {
        const res = await fetch("/api/auth-service/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            deviceId,
            type: "login",
            trustedDevice,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "OTP verification failed");
        }

        return data;
      } catch (error: any) {
        throw new Error(error.message || "Network error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    sendOtp,
    verifyOtp,
    loading,
  };
}