"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  LockKeyhole,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = useCallback(
    (key: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.email || !formData.password) {
        setStatus("error");
        setMessage("All fields are required");
        return;
      }

      setLoading(true);
      setStatus("idle");
      setMessage(null);

      try {
        // replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 1200));

        setStatus("success");
        setMessage("Registration successful");

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } catch {
        setStatus("error");
        setMessage("Registration failed");
      } finally {
        setLoading(false);
      }
    },
    [formData, router]
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_25%),#020617]">

      <div className="w-full max-w-md">

        <div className="rounded-[36px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.10)] p-6 md:p-8">

          <div className="flex flex-col items-center text-center">

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Join enterprise system in seconds
            </p>

            <form onSubmit={handleRegister} className="w-full mt-6 space-y-3">

              {/* NAME */}
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 via-green-500 to-blue-500 shadow-[0_20px_60px_rgba(34,197,94,0.25)] hover:-translate-y-[2px] active:scale-95 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Sign Up <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* STATUS */}
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

              {/* FOOTER */}
              <div className="pt-2 text-center text-sm">
                <span className="text-slate-500">Already have an account?</span>{" "}
                <Link
                  href="/auth/login"
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Login
                </Link>
              </div>

            </form>

          </div>

        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Secure enterprise registration system
        </div>

      </div>

    </main>
  );
}