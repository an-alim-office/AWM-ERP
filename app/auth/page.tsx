"use client";

import React, { memo, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3,
  Workflow,
  Users,
  Zap,
  Globe,
  Lock,
  Database,
} from "lucide-react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.18),transparent_25%),#020617] text-slate-900 dark:text-white">

      <div className="w-full max-w-4xl">

        <div className="relative overflow-hidden rounded-[48px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_50px_180px_rgba(15,23,42,0.18)] p-8 md:p-14 text-center">

          {/* BACKGROUND GLOW */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.08),transparent_40%)]" />

          <div className="relative flex flex-col items-center">

            <div className="w-18 h-18 p-4 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Sparkles size={30} />
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                AWM-ERP
              </span>
            </h1>

            <p className="mt-5 text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-7">
              Next-generation enterprise ERP system for workforce automation, analytics, AI-driven operations, and secure business management.
            </p>

            {/* FEATURE GRID */}
            {mounted && (
              <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4 w-full">

                <Feature icon={<BarChart3 size={18} />} label="Analytics" />
                <Feature icon={<Workflow size={18} />} label="Automation" />
                <Feature icon={<Shield size={18} />} label="Security" />
                <Feature icon={<Users size={18} />} label="Teams" />
                <Feature icon={<Globe size={18} />} label="Global" />

              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center">

              <Link
                href="/auth/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 shadow-[0_25px_80px_rgba(59,130,246,0.25)] hover:-translate-y-[2px] active:scale-95 transition"
              >
                Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 via-green-500 to-blue-500 shadow-[0_25px_80px_rgba(34,197,94,0.25)] hover:-translate-y-[2px] active:scale-95 transition"
              >
                Register
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>

            </div>

            {/* FOOTER TAGS */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                Secure Platform
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                AI Powered
              </span>
              <span className="px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                Enterprise Grade
              </span>
            </div>

          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} AWM-ERP • Built for scalable enterprise systems
        </div>

      </div>
    </main>
  );
}

const Feature = memo(function Feature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition">
      <div className="text-blue-600 dark:text-blue-300">{icon}</div>
      <span className="text-xs font-black tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </span>
    </div>
  );
});