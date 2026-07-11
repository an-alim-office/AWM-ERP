"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  LockKeyhole,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type Step = "details" | "otp" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [deviceId, setDeviceId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  const nameValid = name.trim().length >= 2;
  const otpValue = otp.join("");
  const otpValid = otpValue.length === 6;
  const canSubmit = emailValid && passwordValid && passwordsMatch && nameValid && agreedToTerms;

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
        const next = document.getElementById(`reg-otp-${index + 1}`);
        next?.focus();
      }
    },
    [otp]
  );

  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prev = document.getElementById(`reg-otp-${index - 1}`);
        prev?.focus();
      }
    },
    [otp]
  );

  const handleRegister = async () => {
    if (!canSubmit) {
      showToast("error", "Please fill all fields correctly");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth-service/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setStep("otp");
      setOtpCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      showToast("success", "Verification OTP sent to your email");
    } catch (err: any) {
      showToast("error", err.message || "Registration failed");
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
          email: email.trim().toLowerCase(),
          otp: otpValue,
          deviceId,
          type: "REGISTRATION",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      if (data.token) {
        localStorage.setItem("awm-auth-token", data.token);
      }

      setStep("success");
    } catch (err: any) {
      showToast("error", err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth-service/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          deviceId,
        }),
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_25%),#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.10)] p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {step === "details" && "Create Account"}
              {step === "otp" && "Verify Email"}
              {step === "success" && "Welcome Aboard!"}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {step === "details" && "Join our secure enterprise platform"}
              {step === "otp" && `Enter the 6-digit code sent to ${email}`}
              {step === "success" && "Your account is now verified and ready"}
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
              {step === "details" && (
                <>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Full name"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-900 dark:text-white"
                    />
                  </div>
                  {!emailValid && email.length > 0 && (
                    <p className="text-xs text-rose-400 text-left">Please enter a valid email</p>
                  )}

                  <div className="relative">
                    <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 chars)"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-900 dark:text-white"
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
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        password.length >= 10
                          ? "w-full bg-emerald-400"
                          : password.length >= 6
                          ? "w-2/3 bg-amber-400"
                          : password.length > 0
                          ? "w-1/3 bg-rose-400"
                          : "w-0"
                      }`}
                    />
                  </div>

                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-rose-400 text-left">Passwords do not match</p>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={() => setAgreedToTerms(!agreedToTerms)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                      I agree to the{" "}
                      <Link href="/terms" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <button
                    onClick={handleRegister}
                    disabled={!canSubmit || loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 shadow-[0_20px_60px_rgba(6,182,212,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </>
              )}

              {step === "otp" && (
                <>
                  <div className="flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`reg-otp-${index}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="h-14 w-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center text-xl font-black text-slate-900 dark:text-white outline-none transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-cyan-500/40"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Expires in <span className="font-bold text-cyan-500">{otpCountdown}s</span>
                    </span>
                    <button
                      onClick={handleResendOTP}
                      disabled={otpCountdown > 0 || loading}
                      className={`font-semibold transition-all ${
                        otpCountdown > 0 || loading
                          ? "text-slate-400 cursor-not-allowed"
                          : "text-cyan-500 hover:text-cyan-400"
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={!otpValid || loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 shadow-[0_20px_60px_rgba(6,182,212,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Email <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStep("details");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition"
                  >
                    ← Back to registration
                  </button>
                </>
              )}

              {step === "success" && (
                <div className="space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
                    🎉
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your account has been verified successfully. Welcome to the platform!
                  </p>
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 shadow-[0_20px_60px_rgba(6,182,212,0.25)] hover:-translate-y-[2px] active:scale-95 transition"
                  >
                    Go to Login <ArrowRight size={18} />
                  </Link>
                </div>
              )}

              {step === "details" && (
                <div className="pt-2 text-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Enterprise-grade security with email verification
        </div>
      </div>
    </main>
  );
}