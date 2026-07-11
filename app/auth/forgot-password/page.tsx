"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem("awm-device-id");
    if (existing) {
      setDeviceId(existing);
    } else {
      const generated = crypto.randomUUID();
      localStorage.setItem("awm-device-id", generated);
      setDeviceId(generated);
    }
  }, []);

  useEffect(() => {
    if (step !== "otp") return;
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  const otpValue = otp.join("");
  const otpValid = otpValue.length === 6;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length >= 6;

  const showToast = (type: "success" | "error", msg: string) => {
    setStatus(type);
    setMessage(msg);
    setTimeout(() => {
      setStatus("idle");
      setMessage(null);
    }, 5000);
  };

  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      if (!/^\d?$/.test(value)) return;
      const updated = [...otp];
      updated[index] = value;
      setOtp(updated);

      if (value && index < 5) {
        const next = document.getElementById(`fp-otp-${index + 1}`);
        next?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prev = document.getElementById(`fp-otp-${index - 1}`);
        prev?.focus();
      }
    },
    [otp]
  );

  const handleSendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast("error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      const res = await fetch("/api/auth-service/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setStep("otp");
      setOtpCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      showToast("success", "OTP sent to your email");
    } catch (err: any) {
      showToast("error", err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth-service/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpValue,
          deviceId,
          type: "forgot_password",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      setStep("reset");
      showToast("success", "OTP verified successfully");
    } catch (err: any) {
      showToast("error", err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth-service/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setOtpCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      showToast("success", "New OTP sent");
    } catch (err: any) {
      showToast("error", err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordsMatch) {
      showToast("error", "Passwords must match and be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth-service/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpValue,
          newPassword,
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setStep("success");
    } catch (err: any) {
      showToast("error", err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_25%),#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.10)] p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-300 flex items-center justify-center">
              <LockKeyhole size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {step === "email" && "Reset Password"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "New Password"}
              {step === "success" && "Password Updated"}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {step === "email" && "Enter your email to receive OTP verification code"}
              {step === "otp" && `Enter the 6-digit code sent to ${email}`}
              {step === "reset" && "Create a strong new password"}
              {step === "success" && "Your password has been reset successfully"}
            </p>

            {message && (
              <div
                className={`w-full mt-4 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
                  status === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {message}
              </div>
            )}

            <div className="w-full mt-6 space-y-3">
              {/* STEP: EMAIL */}
              {step === "email" && (
                <>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-[0_20px_60px_rgba(249,115,22,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send OTP <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </>
              )}

              {/* STEP: OTP */}
              {step === "otp" && (
                <>
                  <div className="flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`fp-otp-${index}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="h-14 w-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center text-xl font-black text-slate-900 dark:text-white outline-none transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-orange-500/40"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Expires in <span className="font-bold text-orange-500">{otpCountdown}s</span>
                    </span>
                    <button
                      onClick={handleResendOTP}
                      disabled={otpCountdown > 0 || loading}
                      className={`font-semibold transition-all ${
                        otpCountdown > 0 || loading
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-orange-500 hover:text-orange-400"
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={!otpValid || loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-[0_20px_60px_rgba(249,115,22,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify OTP <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStep("email");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-orange-500 transition"
                  >
                    ← Back to email
                  </button>
                </>
              )}

              {/* STEP: RESET PASSWORD */}
              {step === "reset" && (
                <>
                  <div className="relative">
                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Password strength indicator */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        newPassword.length >= 10
                          ? "w-full bg-emerald-400"
                          : newPassword.length >= 6
                          ? "w-2/3 bg-amber-400"
                          : newPassword.length > 0
                          ? "w-1/3 bg-rose-400"
                          : "w-0"
                      }`}
                    />
                  </div>

                  {!passwordsMatch && confirmPassword.length > 0 && (
                    <p className="text-xs text-rose-400">Passwords must match and be at least 6 characters</p>
                  )}

                  <button
                    onClick={handleResetPassword}
                    disabled={!passwordsMatch || loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-[0_20px_60px_rgba(249,115,22,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Reset Password <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </>
              )}

              {/* STEP: SUCCESS */}
              {step === "success" && (
                <div className="space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
                    ✅
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 shadow-[0_20px_60px_rgba(249,115,22,0.25)] hover:-translate-y-[2px] active:scale-95 transition"
                  >
                    Go to Login <ArrowRight size={18} />
                  </Link>
                </div>
              )}

              {/* Links */}
              {step !== "success" && (
                <div className="pt-2 text-center space-y-2">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
                  >
                    Back to login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Secure password recovery system
        </div>
      </div>
    </main>
  );
}