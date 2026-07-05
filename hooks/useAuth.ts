"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
 
type ApiResponse = {
  success: boolean;
  isAuthorized?: boolean;
  message?: string;
  error?: string;
  requiresOTP?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
};
 
/**
 * =========================================
 * AWM ERP 2026 - নিরাপদ Auth Hook
 * - সব fetch কলে try/catch ও নেটওয়ার্ক-ব্যর্থতা হ্যান্ডলিং
 * - JSON পার্স ব্যর্থ হলেও অ্যাপ ক্র্যাশ করবে না
 * - logout() ব্যর্থ হলেও ব্যবহারকারীকে নিরাপদে লগইন পেজে পাঠানো হয়
 * =========================================
 */
 
async function নিরাপদ_JSON_পার্স(res: Response): Promise<ApiResponse> {
  try {
    return (await res.json()) as ApiResponse;
  } catch {
    return {
      success: false,
      message: "সার্ভার থেকে অবৈধ প্রতিক্রিয়া পাওয়া গেছে।",
    };
  }
}
 
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
 
  const sendOtp = async (
    email: string,
    password: string,
    deviceId?: string
  ) => {
    setLoading(true);
 
    try {
      const res = await fetch("/api/auth-service/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          deviceId: deviceId || null,
        }),
      });
 
      const data = await নিরাপদ_JSON_পার্স(res);
 
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "OTP পাঠানো যায়নি");
      }
 
      return data;
    } catch (error: any) {
      throw new Error(
        error?.message || "নেটওয়ার্ক ত্রুটির কারণে OTP পাঠানো যায়নি"
      );
    } finally {
      setLoading(false);
    }
  };
 
  const verifyOtp = async (
    email: string,
    otp: string,
    deviceId?: string,
    trustedDevice?: boolean
  ) => {
    setLoading(true);
 
    try {
      const res = await fetch("/api/auth-service/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
          deviceId: deviceId || null,
          trustedDevice: !!trustedDevice,
        }),
      });
 
      const data = await নিরাপদ_JSON_পার্স(res);
 
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "OTP যাচাই ব্যর্থ হয়েছে");
      }
 
      return data;
    } catch (error: any) {
      throw new Error(
        error?.message || "নেটওয়ার্ক ত্রুটির কারণে OTP যাচাই করা যায়নি"
      );
    } finally {
      setLoading(false);
    }
  };
 
  const handleLogin = async (email: string, password: string) => {
    // ক্রেডেনশিয়াল ধাপে ব্যবহৃত হয় — বর্তমানে sendOtp এর সাথে একই আচরণ
    return sendOtp(email, password);
  };
 
  const verifyToken = async (): Promise<ApiResponse> => {
    try {
      const res = await fetch("/api/auth-service/verify-token", {
        method: "GET",
        credentials: "include",
      });
 
      return await নিরাপদ_JSON_পার্স(res);
    } catch {
      return {
        success: false,
        isAuthorized: false,
        message: "সেশন যাচাইকরণে নেটওয়ার্ক ত্রুটি।",
      };
    }
  };
 
  const logout = async () => {
    setLoading(true);
 
    try {
      await fetch("/api/auth-service/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // লগআউট API ব্যর্থ হলেও ব্যবহারকারীকে নিরাপদে বের করে দেওয়া উচিত
      console.error("logout request failed:", error);
    } finally {
      setLoading(false);
      router.push("/auth/login");
    }
  };
 
  return {
    loading,
    sendOtp,
    verifyOtp,
    handleLogin,
    verifyToken,
    logout,
  };
};