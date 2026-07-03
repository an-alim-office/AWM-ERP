"use client";

import React, { memo, useCallback, useState } from "react";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSendOTP = useCallback(async () => {
    if (!email) {
      setStatus("error");
      setMessage("Email is required");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      // replace with real API
      await new Promise((res) => setTimeout(res, 1400));

      setStatus("success");
      setMessage("OTP sent successfully");
    } catch {
      setStatus("error");
      setMessage("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_25%),#020617] flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.10)] p-6 md:p-8">

          <div className="flex flex-col items-center text-center">

            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-300 flex items-center justify-center">
              <LockKeyhole size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              Reset Password
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your email to receive OTP verification code
            </p>

            <div className="w-full mt-6 space-y-3">

              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-orange-500/40"
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

              {message && (
                <div
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
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

              <div className="pt-2 text-center">
                <Link
                  href="/auth/otp-verification"
                  className="text-sm font-semibold text-orange-600 hover:underline"
                >
                  Already have OTP? Continue verification
                </Link>
              </div>

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