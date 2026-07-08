"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setStatus("error");
      setMessage("Enter valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage(null);

    try {
      // replace with real API
      await new Promise((res) => setTimeout(res, 1200));

      setStatus("success");
      setMessage("OTP Verified Successfully");
    } catch {
      setStatus("error");
      setMessage("OTP verification failed");
    } finally {
      setLoading(false);
    }
  }, [otp]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_25%),#020617]">

      <div className="w-full max-w-md">

        <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.10)] p-6 md:p-8">

          <div className="flex flex-col items-center text-center">

            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              OTP Verification
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter the 6-digit code sent to your email
            </p>

            <div className="w-full mt-6 space-y-3">

              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="••••••"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-center tracking-[0.4em] text-lg font-black outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 via-violet-500 to-blue-500 shadow-[0_20px_60px_rgba(168,85,247,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
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
                  href="/auth/login"
                  className="text-sm font-semibold text-purple-600 hover:underline"
                >
                  Back to Login
                </Link>
              </div>

            </div>

          </div>

        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Secure OTP authentication layer
        </div>

      </div>

    </main>
  );
}