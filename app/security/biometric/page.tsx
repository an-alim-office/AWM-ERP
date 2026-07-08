"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Fingerprint,
  Globe,
  Layers3,
  Loader2,
  LockKeyhole,
  Radar,
  RefreshCcw,
  ScanFace,
  ShieldCheck,
  ShieldEllipsis,
  ShieldHalf,
  Sparkles,
  UserCheck,
  Waves,
} from "lucide-react";

type BiometricMethod = {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "MONITORING" | "DISABLED";
  confidence: number;
  latency: string;
  icon: React.ReactNode;
};

const biometricMethods: BiometricMethod[] = [
  {
    id: "bm-01",
    name: "Facial Recognition",
    description:
      "AI-powered multi-angle facial authentication engine",
    status: "ACTIVE",
    confidence: 99.8,
    latency: "34ms",
    icon: <ScanFace className="h-5 w-5" />,
  },
  {
    id: "bm-02",
    name: "Fingerprint Matrix",
    description:
      "High-resolution fingerprint identity verification",
    status: "ACTIVE",
    confidence: 99.4,
    latency: "21ms",
    icon: <Fingerprint className="h-5 w-5" />,
  },
  {
    id: "bm-03",
    name: "Iris Intelligence",
    description:
      "Retina and iris cryptographic biometric scanning",
    status: "MONITORING",
    confidence: 98.9,
    latency: "42ms",
    icon: <Eye className="h-5 w-5" />,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({
  status,
}: {
  status: BiometricMethod["status"];
}) {
  const styles = {
    ACTIVE:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    MONITORING:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",
    DISABLED:
      "border-red-500/20 bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
        styles[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className={cn(
        "rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]",
        shimmer
      )}
    >
      <div className="h-6 w-40 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-20 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-10 rounded-2xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function BiometricSecurityPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  const activeSystems = useMemo(
    () =>
      biometricMethods.filter(
        (method) => method.status === "ACTIVE"
      ).length,
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0b1020] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Zero-Trust Identity Intelligence
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Biometric Security
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Advanced physiological authentication and
                enterprise-grade identity verification powered
                by AI-driven biometric intelligence systems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100">
                <RefreshCcw className="h-4 w-4" />
                Sync Identity Grid
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <ShieldCheck className="h-4 w-4" />
                Launch Verification
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Authentication Accuracy"
            value="99.8%"
            hint="AI-calibrated biometric precision"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <MetricCard
            title="Active Modalities"
            value={String(activeSystems)}
            hint="Real-time biometric engines online"
            icon={<Layers3 className="h-5 w-5" />}
          />

          <MetricCard
            title="Threat Detection"
            value="Realtime"
            hint="Continuous anomaly prevention"
            icon={<Radar className="h-5 w-5" />}
          />

          <MetricCard
            title="Global Latency"
            value="21ms"
            hint="Ultra-fast identity verification"
            icon={<Globe className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Multi-Modal Authentication Matrix
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Intelligent biometric identity orchestration
                  with adaptive threat intelligence.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Identity network stable
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Suspense fallback={null}>
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  biometricMethods.map((method) => (
                    <div
                      key={method.id}
                      className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/70 p-5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                            {method.icon}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-black tracking-tight">
                                {method.name}
                              </h3>

                              <StatusBadge
                                status={method.status}
                              />
                            </div>

                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                              {method.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Activity className="h-3 w-3" />
                                Confidence {method.confidence}%
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Waves className="h-3 w-3" />
                                Latency {method.latency}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <LockKeyhole className="h-3 w-3" />
                                Quantum-secured pipeline
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 xl:min-w-[220px]">
                          <div>
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                              <span>Verification Stability</span>
                              <span>{method.confidence}%</span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                                style={{
                                  width: `${method.confidence}%`,
                                }}
                              />
                            </div>
                          </div>

                          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                            <UserCheck className="h-4 w-4" />
                            Validate Identity
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Suspense>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-500">
                  <ShieldEllipsis className="h-3.5 w-3.5" />
                  Adaptive Risk Engine
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Neural Identity Core
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Self-learning biometric orchestration system
                  continuously calibrating identity confidence
                  through encrypted behavioral intelligence.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Threat Protection
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        99.99%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <ShieldHalf className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Verification Feed
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    AI-monitored identity activity stream
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Facial vector authenticated",
                    time: "2 seconds ago",
                  },
                  {
                    title: "Fingerprint signature validated",
                    time: "18 seconds ago",
                  },
                  {
                    title: "Anomaly scan completed",
                    time: "1 minute ago",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  Continuous identity synchronization active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}