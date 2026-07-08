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
  Bot,
  CheckCircle2,
  Clock3,
  Cpu,
  Eye,
  Globe,
  Loader2,
  Radar,
  RefreshCcw,
  Search,
  ServerCrash,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  TriangleAlert,
  Wifi,
  Workflow,
  Zap,
} from "lucide-react";

type ThreatSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type ThreatStatus =
  | "BLOCKED"
  | "MONITORING"
  | "INVESTIGATING";

type ThreatLog = {
  id: string;
  source: string;
  region: string;
  vector: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  detectedAt: string;
  confidence: number;
  traffic: string;
};

const threatData: ThreatLog[] = [
  {
    id: "TRX-9001",
    source: "AI Botnet Cluster",
    region: "Frankfurt",
    vector: "Suspicious API Flood",
    severity: "CRITICAL",
    status: "BLOCKED",
    detectedAt: "6 sec ago",
    confidence: 99,
    traffic: "4.2M req/min",
  },
  {
    id: "TRX-9002",
    source: "Unknown Proxy Chain",
    region: "Singapore",
    vector: "Credential Enumeration",
    severity: "HIGH",
    status: "INVESTIGATING",
    detectedAt: "1 min ago",
    confidence: 94,
    traffic: "880K req/min",
  },
  {
    id: "TRX-9003",
    source: "Edge Gateway",
    region: "Riyadh",
    vector: "Behavioral Drift",
    severity: "MEDIUM",
    status: "MONITORING",
    detectedAt: "3 mins ago",
    confidence: 87,
    traffic: "290K req/min",
  },
  {
    id: "TRX-9004",
    source: "Darknet Relay",
    region: "Amsterdam",
    vector: "Payload Injection Attempt",
    severity: "CRITICAL",
    status: "BLOCKED",
    detectedAt: "5 mins ago",
    confidence: 98,
    traffic: "1.8M req/min",
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
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
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.08),transparent_32%)]" />

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

function SeverityBadge({
  severity,
}: {
  severity: ThreatSeverity;
}) {
  const styles: Record<ThreatSeverity, string> = {
    LOW: "border-cyan-500/20 bg-cyan-500/10 text-cyan-500",
    MEDIUM:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",
    HIGH:
      "border-orange-500/20 bg-orange-500/10 text-orange-500",
    CRITICAL:
      "border-rose-500/20 bg-rose-500/10 text-rose-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
        styles[severity]
      )}
    >
      {severity}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ThreatStatus;
}) {
  const styles: Record<ThreatStatus, string> = {
    BLOCKED:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    MONITORING:
      "border-blue-500/20 bg-blue-500/10 text-blue-500",
    INVESTIGATING:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",
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

function SkeletonCard() {
  return (
    <div
      className={cn(
        "rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]",
        shimmer
      )}
    >
      <div className="h-6 w-52 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-24 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function ThreatDetectionPage() {
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  const filteredThreats = useMemo(() => {
    return threatData.filter((item) => {
      return (
        item.source
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.vector
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.region
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [search]);

  const criticalThreats = useMemo(
    () =>
      threatData.filter(
        (item) => item.severity === "CRITICAL"
      ).length,
    []
  );

  const blockedThreats = useMemo(
    () =>
      threatData.filter(
        (item) => item.status === "BLOCKED"
      ).length,
    []
  );

  const refreshThreats = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0a0f1d] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
                <Sparkles className="h-3.5 w-3.5" />
                AI Cyber Defense Matrix
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Threat Detection
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Autonomous AI-powered cybersecurity
                monitoring with real-time anomaly
                intelligence, predictive defense systems, and
                enterprise-grade threat orchestration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshThreats}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Sync Threat Feed
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-rose-500/30">
                <ShieldCheck className="h-4 w-4" />
                Activate Shield
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Threats Neutralized"
            value="18,294"
            hint="Autonomous AI mitigation"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <MetricCard
            title="Critical Alerts"
            value={String(criticalThreats)}
            hint="High-severity incidents"
            icon={<ShieldAlert className="h-5 w-5" />}
          />

          <MetricCard
            title="Traffic Monitored"
            value="12.8TB"
            hint="Encrypted telemetry analysis"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Defense Latency"
            value="18ms"
            hint="Realtime mitigation response"
            icon={<Zap className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Live Threat Intelligence Feed
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Continuous attack surface analysis and
                  behavioral anomaly detection.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Security perimeter active
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search threat vectors, regions, sources..."
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
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
                  filteredThreats.map((threat) => (
                    <div
                      key={threat.id}
                      className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/70 p-5 transition-all duration-300 hover:border-rose-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.06),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-rose-500 dark:border-white/10 dark:bg-white/[0.04]">
                            <Shield className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-black tracking-tight">
                                {threat.source}
                              </h3>

                              <SeverityBadge
                                severity={threat.severity}
                              />

                              <StatusBadge
                                status={threat.status}
                              />
                            </div>

                            <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                              {threat.vector}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Globe className="h-3 w-3" />
                                {threat.region}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Wifi className="h-3 w-3" />
                                {threat.traffic}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Clock3 className="h-3 w-3" />
                                {threat.detectedAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="xl:min-w-[240px]">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            <span>Threat Confidence</span>
                            <span>
                              {threat.confidence}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                threat.severity === "CRITICAL"
                                  ? "bg-gradient-to-r from-rose-500 to-red-500"
                                  : threat.severity === "HIGH"
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
                              )}
                              style={{
                                width: `${threat.confidence}%`,
                              }}
                            />
                          </div>

                          <div className="mt-5 flex items-center gap-2">
                            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
                              <Radar className="h-3.5 w-3.5" />
                              Analyze
                            </button>

                            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:-translate-y-0.5">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Mitigate
                            </button>
                          </div>
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
                  <ShieldEllipsis className="h-3.5 w-3.5" />
                  Autonomous Defense AI
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Quantum Defense Grid
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Neural cyber-defense system continuously
                  scanning behavioral telemetry, encrypted
                  traffic, and zero-day attack patterns across
                  global infrastructure.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                        AI Shield Efficiency
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        99.98%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-500">
                      <Cpu className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-rose-500 to-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-rose-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <TriangleAlert className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Security Events
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Realtime cyber anomaly telemetry
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Zero-day exploit pattern intercepted",
                    time: "8 seconds ago",
                    icon: <ServerCrash className="h-4 w-4" />,
                  },
                  {
                    title:
                      "AI behavioral drift recalibrated",
                    time: "2 minutes ago",
                    icon: <Bot className="h-4 w-4" />,
                  },
                  {
                    title:
                      "Threat intelligence synchronized",
                    time: "5 minutes ago",
                    icon: <Eye className="h-4 w-4" />,
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-500">
                      {event.icon}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-rose-500/20 bg-rose-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-rose-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                  Continuous threat synchronization active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}