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

  const sendOtp = useCallback(
    async (email: string, password: string, deviceId: string): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth-service/login", {
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