"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  Clock3,
  Cpu,
  Fingerprint,
  LockKeyhole,
  Radar,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TriangleAlert,
  Waves,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ScanStatus =
  | "idle"
  | "initializing"
  | "scanning"
  | "success"
  | "failed";

interface Metric {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type:
    | "secure"
    | "success"
    | "processing";
}

/* =========================================================
   MOCK DATA
========================================================= */

const ACTIVITY_LOGS: ActivityItem[] =
  [
    {
      id: "FP-1001",
      title:
        "Biometric Engine Initialized",
      time: "1 sec ago",
      type: "processing",
    },
    {
      id: "FP-1002",
      title:
        "Encrypted Identity Layer Active",
      time: "6 sec ago",
      type: "secure",
    },
    {
      id: "FP-1003",
      title:
        "Realtime Verification Synced",
      time: "14 sec ago",
      type: "success",
    },
  ];

/* =========================================================
   PAGE
========================================================= */

export default function FingerprintPage() {
  const [status, setStatus] =
    useState<ScanStatus>(
      "initializing"
    );

  const [result, setResult] =
    useState<string | null>(
      null
    );

  const [progress, setProgress] =
    useState(0);

  const [pulse, setPulse] =
    useState(false);

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    const initTimer =
      setTimeout(() => {
        setStatus("idle");
      }, 1200);

    return () =>
      clearTimeout(initTimer);
  }, []);

  /* =========================================================
     PULSE EFFECT
  ========================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setPulse(
          (prev) => !prev
        );
      }, 1400);

    return () =>
      clearInterval(interval);
  }, []);

  /* =========================================================
     PROGRESS
  ========================================================= */

  useEffect(() => {
    let interval:
      | NodeJS.Timeout
      | undefined;

    if (
      status === "scanning"
    ) {
      interval =
        setInterval(() => {
          setProgress(
            (prev) => {
              if (
                prev >= 96
              ) {
                return 96;
              }

              return prev + 4;
            }
          );
        }, 80);
    }

    return () => {
      if (interval)
        clearInterval(
          interval
        );
    };
  }, [status]);

  /* =========================================================
     METRICS
  ========================================================= */

  const metrics: Metric[] =
    useMemo(
      () => [
        {
          label:
            "AI Accuracy",
          value: "99.4%",
          icon: (
            <Cpu size={18} />
          ),
        },
        {
          label:
            "Verification",
          value: "0.2s",
          icon: (
            <Zap size={18} />
          ),
        },
        {
          label:
            "Encryption",
          value: "AES-256",
          icon: (
            <LockKeyhole
              size={18}
            />
          ),
        },
        {
          label:
            "Security",
          value: "Protected",
          icon: (
            <ShieldCheck
              size={18}
            />
          ),
        },
      ],
      []
    );

  /* =========================================================
     SCAN
  ========================================================= */

  const handleScan =
    useCallback(() => {
      setStatus(
        "scanning"
      );

      setResult(null);

      setProgress(0);

      setTimeout(() => {
        const success =
          Math.random() >
          0.3;

        if (success) {
          setProgress(
            100
          );

          setStatus(
            "success"
          );

          setResult(
            "Fingerprint Verified Successfully"
          );
        } else {
          setProgress(
            100
          );

          setStatus(
            "failed"
          );

          setResult(
            "Fingerprint Verification Failed"
          );
        }
      }, 2600);
    }, []);

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset =
    useCallback(() => {
      setStatus("idle");
      setResult(null);
      setProgress(0);
    }, []);

  /* =========================================================
     UI HELPERS
  ========================================================= */

  const statusConfig =
    useMemo(() => {
      switch (status) {
        case "success":
          return {
            label:
              "Verified",
            color:
              "text-emerald-600 dark:text-emerald-300",
            bg: "bg-emerald-500/10",
            border:
              "border-emerald-500/20",
            icon: (
              <CheckCircle2
                size={22}
              />
            ),
          };

        case "failed":
          return {
            label:
              "Verification Failed",
            color:
              "text-red-600 dark:text-red-300",
            bg: "bg-red-500/10",
            border:
              "border-red-500/20",
            icon: (
              <XCircle
                size={22}
              />
            ),
          };

        case "scanning":
          return {
            label:
              "Scanning Fingerprint",
            color:
              "text-cyan-600 dark:text-cyan-300",
            bg: "bg-cyan-500/10",
            border:
              "border-cyan-500/20",
            icon: (
              <Radar
                size={22}
                className="animate-spin"
              />
            ),
          };

        case "initializing":
          return {
            label:
              "Initializing Engine",
            color:
              "text-violet-600 dark:text-violet-300",
            bg: "bg-violet-500/10",
            border:
              "border-violet-500/20",
            icon: (
              <TimerReset
                size={22}
              />
            ),
          };

        default:
          return {
            label:
              "Ready For Scan",
            color:
              "text-slate-700 dark:text-slate-300",
            bg: "bg-slate-500/10",
            border:
              "border-slate-500/20",
            icon: (
              <Fingerprint
                size={22}
              />
            ),
          };
      }
    }, [status]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_22%),#f8fafc] text-slate-900 dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.18),transparent_22%),#020617] dark:text-white">

      {/* GRID */}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col justify-center p-4 md:p-6 xl:p-8">

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <section className="overflow-hidden rounded-[40px] border border-white/20 bg-white/70 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">

            <div className="relative p-5 md:p-7 xl:p-8">

              {/* HERO */}

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                <div className="max-w-3xl">

                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                    <Sparkles size={14} />
                    Enterprise Biometrics
                  </div>

                  <h1 className="mt-5 bg-gradient-to-r from-slate-900 via-cyan-700 to-violet-700 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-violet-300 md:text-5xl">
                    Fingerprint Authentication
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400">
                    AI-powered biometric authentication system with realtime
                    fingerprint validation, encrypted identity verification and
                    enterprise-grade access security orchestration.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {metrics.map(
                    (item) => (
                      <MetricCard
                        key={
                          item.label
                        }
                        item={item}
                      />
                    )
                  )}
                </div>
              </div>

              {/* SCANNER */}

              <div className="mt-8 overflow-hidden rounded-[34px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_30px_120px_rgba(15,23,42,0.24)] dark:border-white/10">

                <div className="relative flex min-h-[620px] flex-col items-center justify-center overflow-hidden px-6 py-12">

                  {/* BG EFFECT */}

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_50%)]" />

                  {/* PULSE */}

                  <div
                    className={`absolute h-[420px] w-[420px] rounded-full transition-all duration-700 ${
                      pulse
                        ? "scale-110 bg-cyan-500/10 blur-3xl"
                        : "scale-100 bg-violet-500/10 blur-3xl"
                    }`}
                  />

                  {/* TOP STATUS */}

                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        status ===
                        "success"
                          ? "bg-emerald-400"
                          : status ===
                            "failed"
                          ? "bg-red-400"
                          : status ===
                            "scanning"
                          ? "bg-cyan-400 animate-pulse"
                          : "bg-violet-400 animate-pulse"
                      }`}
                    />

                    <span>
                      {
                        statusConfig.label
                      }
                    </span>
                  </div>

                  {/* NETWORK */}

                  <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                    <Wifi
                      size={14}
                    />
                    Secure Identity
                  </div>

                  {/* SCANNER CORE */}

                  <div className="relative z-10 flex flex-col items-center">

                    <div className="relative flex h-[340px] w-[340px] items-center justify-center rounded-full border border-cyan-500/20 bg-white/[0.03] backdrop-blur-xl">

                      {/* OUTER RINGS */}

                      <div
                        className={`absolute inset-0 rounded-full border transition-all duration-700 ${
                          status ===
                          "scanning"
                            ? "scale-110 border-cyan-400/30"
                            : "scale-100 border-white/10"
                        }`}
                      />

                      <div
                        className={`absolute inset-6 rounded-full border transition-all duration-700 ${
                          pulse
                            ? "border-violet-400/20"
                            : "border-cyan-400/20"
                        }`}
                      />

                      {/* SCAN LINE */}

                      {status ===
                        "scanning" && (
                        <div className="absolute inset-x-10 top-0 h-[2px] animate-[fingerprintScan_2.6s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
                      )}

                      {/* FINGERPRINT */}

                      <div
                        className={`relative flex h-[220px] w-[220px] items-center justify-center rounded-full transition-all duration-500 ${
                          status ===
                          "success"
                            ? "bg-emerald-500/10 text-emerald-300 shadow-[0_0_80px_rgba(16,185,129,0.25)]"
                            : status ===
                              "failed"
                            ? "bg-red-500/10 text-red-300 shadow-[0_0_80px_rgba(239,68,68,0.25)]"
                            : "bg-cyan-500/10 text-cyan-300 shadow-[0_0_80px_rgba(34,211,238,0.25)]"
                        }`}
                      >

                        <Fingerprint
                          size={
                            140
                          }
                          className={`transition-all duration-300 ${
                            status ===
                            "scanning"
                              ? "scale-110"
                              : "scale-100"
                          }`}
                        />

                        {/* RADAR */}

                        {status ===
                          "scanning" && (
                          <>
                            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />

                            <div className="absolute inset-8 rounded-full border border-cyan-400/10 animate-pulse" />
                          </>
                        )}
                      </div>
                    </div>

                    {/* RESULT */}

                    <div className="mt-10 text-center">

                      <div
                        className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-black backdrop-blur-xl ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}
                      >
                        {
                          statusConfig.icon
                        }

                        {
                          statusConfig.label
                        }
                      </div>

                      <h2 className="mt-6 text-3xl font-black text-white md:text-4xl">
                        {status ===
                        "success"
                          ? "Authentication Complete"
                          : status ===
                            "failed"
                          ? "Verification Failed"
                          : status ===
                            "scanning"
                          ? "Scanning Fingerprint"
                          : "Ready To Authenticate"}
                      </h2>

                      <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-300">
                        {status ===
                        "success"
                          ? "Biometric identity successfully verified with enterprise-grade AI security validation."
                          : status ===
                            "failed"
                          ? "Fingerprint mismatch detected. Please reposition your finger and try again."
                          : status ===
                            "scanning"
                          ? "Neural biometric engine is processing and validating fingerprint identity."
                          : "Place your finger on the biometric scanner to begin secure verification."}
                      </p>

                      {/* PROGRESS */}

                      <div className="mx-auto mt-8 max-w-md">

                        <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          <span>
                            Verification Progress
                          </span>

                          <span>
                            {progress}
                            %
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              status ===
                              "success"
                                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                : status ===
                                  "failed"
                                ? "bg-gradient-to-r from-red-400 to-rose-500"
                                : "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLOATING STATUS */}

                  <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                    <Activity
                      size={14}
                    />
                    AI Monitoring Active
                  </div>

                  <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                    <Clock3
                      size={14}
                    />
                    Realtime Processing
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 rounded-[30px] border border-slate-200/70 bg-white/70 p-5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-start gap-4">

                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      {
                        statusConfig.icon
                      }
                    </div>

                    <div>

                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Biometric Verification Status
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {result
                          ? result
                          : "Secure AI fingerprint authentication engine is ready."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={
                        handleReset
                      }
                      className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                      <RefreshCcw
                        size={16}
                      />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleScan
                      }
                      disabled={
                        status ===
                          "scanning" ||
                        status ===
                          "initializing"
                      }
                      className={`inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-black text-white transition-all duration-300 ${
                        status ===
                          "scanning" ||
                        status ===
                          "initializing"
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 shadow-[0_20px_60px_rgba(59,130,246,0.35)] hover:-translate-y-[2px] active:scale-[0.98]"
                      }`}
                    >
                      {status ===
                      "scanning" ? (
                        <Radar
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <ScanLine
                          size={18}
                        />
                      )}

                      {status ===
                      "scanning"
                        ? "Scanning..."
                        : "Start Scan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <section className="space-y-8">

            {/* SECURITY */}

            <GlassCard>

              <div className="flex items-start justify-between gap-4">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck
                      size={14}
                    />
                    Security Layer
                  </div>

                  <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">
                    Enterprise Identity Security
                  </h2>

                  <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Advanced biometric identity protection with encrypted neural
                    authentication and realtime fingerprint verification pipeline.
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck
                    size={30}
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <FeatureCard
                  icon={
                    <Fingerprint
                      size={20}
                    />
                  }
                  title="Biometric Scan"
                  value="Realtime"
                />

                <FeatureCard
                  icon={
                    <Cpu
                      size={20}
                    />
                  }
                  title="AI Engine"
                  value="Active"
                />

                <FeatureCard
                  icon={
                    <LockKeyhole
                      size={20}
                    />
                  }
                  title="Data Security"
                  value="Encrypted"
                />

                <FeatureCard
                  icon={
                    <Waves
                      size={20}
                    />
                  }
                  title="Signal Sync"
                  value="Stable"
                />
              </div>
            </GlassCard>

            {/* ACTIVITY */}

            <GlassCard>

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Activity Feed
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Realtime biometric authentication timeline
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <Activity
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {ACTIVITY_LOGS.map(
                  (item) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                    />
                  )
                )}
              </div>
            </GlassCard>

            {/* SYSTEM */}

            <GlassCard>

              <div className="flex items-start gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                  <Cpu size={30} />
                </div>

                <div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Neural Authentication Engine
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Futuristic biometric authentication architecture optimized
                    for enterprise-grade fingerprint identity validation and
                    secure access orchestration.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <Tag label="Realtime AI" />

                    <Tag label="Biometric Security" />

                    <Tag label="Encrypted Identity" />

                    <Tag label="Low Latency" />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ALERT */}

            <div className="rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-5 backdrop-blur-2xl">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  <TriangleAlert
                    size={26}
                  />
                </div>

                <div>

                  <h3 className="text-xl font-black text-amber-800 dark:text-amber-200">
                    Smart Verification Notice
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-amber-700 dark:text-amber-300">
                    Ensure your finger is clean and properly positioned on the
                    scanner for accurate biometric verification and secure access
                    authentication.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ANIMATION */}

      <style jsx>{`
        @keyframes fingerprintScan {
          0% {
            top: 10%;
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          50% {
            opacity: 1;
          }

          100% {
            top: 90%;
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

const GlassCard = memo(
  function GlassCard({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-[34px] border border-white/20 bg-white/70 p-5 shadow-[0_20px_100px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04] md:p-7">
        {children}
      </div>
    );
  }
);

const MetricCard = memo(
  function MetricCard({
    item,
  }: {
    item: Metric;
  }) {
    return (
      <div className="group rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          {item.icon}
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {item.label}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          {item.value}
        </h3>
      </div>
    );
  }
);

const FeatureCard = memo(
  function FeatureCard({
    icon,
    title,
    value,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
          {icon}
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
    );
  }
);

const ActivityCard = memo(
  function ActivityCard({
    item,
  }: {
    item: ActivityItem;
  }) {
    return (
      <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
              <Activity size={20} />
            </div>

            <div>

              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {item.title}
              </h4>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {item.id} • {item.time}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
              item.type ===
              "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : item.type ===
                  "secure"
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />

            {item.type}
          </div>
        </div>
      </div>
    );
  }
);

const Tag = memo(
  function Tag({
    label,
  }: {
    label: string;
  }) {
    return (
      <div className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {label}
      </div>
    );
  }
);