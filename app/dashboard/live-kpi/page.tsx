"use client";

import React, {
  memo,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";

type KpiStatus =
  | "Optimal"
  | "Warning"
  | "Critical";

type KpiMetric = {
  id: string;
  title: string;
  value: string;
  growth: string;
  trend: number;
  status: KpiStatus;
  description: string;
};

type Activity = {
  id: number;
  title: string;
  time: string;
  status: KpiStatus;
};

const LivePulseChart = lazy(() =>
  Promise.resolve({
    default: memo(function LivePulseChart({
      trend,
      status,
    }: {
      trend: number;
      status: KpiStatus;
    }) {
      const bars = Array.from(
        { length: 28 },
        (_, i) =>
          Math.max(
            12,
            Math.abs(
              Math.sin(i / 2.2) * 90
            ) +
              trend / 2
          )
      );

      return (
        <div className="mt-5 flex h-24 items-end gap-1 overflow-hidden">
          {bars.map((height, index) => (
            <div
              key={index}
              className={`w-full rounded-full transition-all duration-700 ${
                status === "Optimal"
                  ? "bg-gradient-to-t from-emerald-500/20 via-cyan-400/70 to-cyan-300"
                  : status === "Warning"
                  ? "bg-gradient-to-t from-amber-500/20 via-amber-400/70 to-yellow-300"
                  : "bg-gradient-to-t from-rose-500/20 via-rose-400/70 to-pink-300"
              }`}
              style={{
                height: `${height}%`,
                animationDelay: `${index * 35}ms`,
              }}
            />
          ))}
        </div>
      );
    }),
  })
);

export default function LiveKpiPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [liveTime, setLiveTime] =
    useState("");

  const [kpis] = useState<KpiMetric[]>(
    [
      {
        id: "KPI-001",
        title: "Global Workforce Efficiency",
        value: "96.8%",
        growth: "+4.2%",
        trend: 92,
        status: "Optimal",
        description:
          "Real-time workforce operational output across all branch nodes.",
      },
      {
        id: "KPI-002",
        title: "Biometric Sync Accuracy",
        value: "99.2%",
        growth: "+1.1%",
        trend: 98,
        status: "Optimal",
        description:
          "Biometric terminal synchronization and attendance validation.",
      },
      {
        id: "KPI-003",
        title: "Cloud Node Latency",
        value: "84ms",
        growth: "-12ms",
        trend: 74,
        status: "Warning",
        description:
          "Regional infrastructure response delay under AI balancing.",
      },
      {
        id: "KPI-004",
        title: "Threat Detection Matrix",
        value: "2 Alerts",
        growth: "+1",
        trend: 44,
        status: "Critical",
        description:
          "Security anomaly detection and unauthorized gateway attempts.",
      },
    ]
  );

  const [activities] = useState<
    Activity[]
  >([
    {
      id: 1,
      title:
        "AI Auto-balanced Dammam Cluster",
      time: "11:42 PM",
      status: "Optimal",
    },
    {
      id: 2,
      title:
        "Biometric Node #8 Response Delay",
      time: "10:18 PM",
      status: "Warning",
    },
    {
      id: 3,
      title:
        "Unauthorized Gateway Attempt Blocked",
      time: "09:53 PM",
      status: "Critical",
    },
    {
      id: 4,
      title:
        "ERP Analytics Pipeline Synced",
      time: "08:21 PM",
      status: "Optimal",
    },
  ]);

  useEffect(() => {
    const storedTheme =
      localStorage.getItem(
        "awm-kpi-theme"
      );

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "awm-kpi-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setLiveTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateClock();

    const interval = setInterval(
      updateClock,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  const filteredKpis = useMemo(() => {
    return kpis.filter((item) => {
      const keyword =
        search.toLowerCase();

      const matchSearch =
        item.title
          .toLowerCase()
          .includes(keyword) ||
        item.id
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        selectedStatus === "All" ||
        item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [kpis, search, selectedStatus]);

  const stats = useMemo(() => {
    const optimal = kpis.filter(
      (k) => k.status === "Optimal"
    ).length;

    const warning = kpis.filter(
      (k) => k.status === "Warning"
    ).length;

    const critical = kpis.filter(
      (k) => k.status === "Critical"
    ).length;

    return {
      optimal,
      warning,
      critical,
    };
  }, [kpis]);

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.04]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        soft: "bg-white/[0.03]",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
      }
    : {
        bg: "bg-[#f4f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        soft: "bg-slate-100",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
      };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-44 animate-pulse rounded-[38px] border border-white/10 bg-white/[0.04]" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[30px] border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[340px] animate-pulse rounded-[34px] border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute left-[40%] top-[20%] h-[320px] w-[320px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[38px] border p-6 sm:p-8 xl:p-10 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-400">
                Synapse AI Real-Time Analytics
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Live KPI Monitoring
              </h1>

              <p
                className={`mt-4 text-sm leading-7 sm:text-base ${theme.muted}`}
              >
                Enterprise-grade operational
                intelligence dashboard with live
                KPI streams, AI performance
                analytics, biometric sync
                tracking and infrastructure
                telemetry.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.soft}`}
              >
                <span>
                  {darkMode ? "🌙" : "☀️"}
                </span>

                {darkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>

              <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-400">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>

                Live Stream Active
              </div>
            </div>
          </div>

          {/* LIVE BAR */}
          <div
            className={`mt-8 flex flex-col gap-4 rounded-[30px] border p-5 sm:flex-row sm:items-center sm:justify-between ${theme.soft} ${theme.border}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                AWM Synapse AI
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Network Stable
              </div>

              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-400">
                142 Active Nodes
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-bold ${theme.muted}`}
              >
                Live Time:
              </span>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 font-mono text-sm font-black tracking-[0.14em]">
                {liveTime}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Optimal Nodes",
              value: stats.optimal,
              color:
                "border-emerald-500/10 bg-emerald-500/5 text-emerald-400",
            },
            {
              title: "Warning Alerts",
              value: stats.warning,
              color:
                "border-amber-500/10 bg-amber-500/5 text-amber-400",
            },
            {
              title: "Critical Events",
              value: stats.critical,
              color:
                "border-rose-500/10 bg-rose-500/5 text-rose-400",
            },
            {
              title: "AI Accuracy",
              value: "99.4%",
              color:
                "border-cyan-500/10 bg-cyan-500/5 text-cyan-400",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`group rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.card} ${theme.border}`}
            >
              <div
                className={`inline-flex rounded-2xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${item.color}`}
              >
                {item.title}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <h3 className="text-4xl font-black tracking-tight">
                  {item.value}
                </h3>

                <div className="h-14 w-14 rounded-full border border-white/10 bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section
          className={`mt-8 rounded-[34px] border p-5 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                KPI Intelligence Matrix
              </h2>

              <p
                className={`mt-1 text-sm ${theme.muted}`}
              >
                Filter and monitor live
                operational KPIs.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search KPI..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 sm:w-[260px] ${theme.input}`}
              />

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 ${theme.input}`}
              >
                <option value="All">
                  All Status
                </option>

                <option value="Optimal">
                  Optimal
                </option>

                <option value="Warning">
                  Warning
                </option>

                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* KPI GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {filteredKpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`group relative overflow-hidden rounded-[34px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.card} ${theme.border} backdrop-blur-2xl`}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-400">
                      {kpi.id}
                    </span>

                    <h3 className="mt-4 text-2xl font-black tracking-tight">
                      {kpi.title}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                      kpi.status ===
                      "Optimal"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : kpi.status ===
                          "Warning"
                        ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {kpi.status}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <h2 className="text-5xl font-black tracking-tight">
                    {kpi.value}
                  </h2>

                  <div
                    className={`rounded-2xl border px-3 py-2 text-xs font-black ${
                      kpi.status ===
                      "Optimal"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : kpi.status ===
                          "Warning"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {kpi.growth}
                  </div>
                </div>

                <p
                  className={`mt-4 text-sm leading-7 ${theme.muted}`}
                >
                  {kpi.description}
                </p>

                <Suspense
                  fallback={
                    <div className="mt-5 h-24 animate-pulse rounded-3xl bg-white/[0.04]" />
                  }
                >
                  <LivePulseChart
                    trend={kpi.trend}
                    status={kpi.status}
                  />
                </Suspense>
              </div>
            </div>
          ))}
        </section>

        {/* BOTTOM */}
        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LIVE ACTIVITY */}
          <div
            className={`rounded-[34px] border p-6 ${theme.card} ${theme.border} backdrop-blur-2xl xl:col-span-2`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Live AI Activity Stream
                </h2>

                <p
                  className={`mt-1 text-sm ${theme.muted}`}
                >
                  Real-time infrastructure
                  activity logs.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                Streaming
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className={`group flex flex-col gap-4 rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between ${theme.soft} ${theme.border}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        item.status ===
                        "Optimal"
                          ? "bg-emerald-400"
                          : item.status ===
                            "Warning"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                    />

                    <div>
                      <h4 className="text-sm font-black">
                        {item.title}
                      </h4>

                      <p
                        className={`mt-1 text-xs ${theme.muted}`}
                      >
                        AI monitored operational
                        event
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 font-mono text-xs font-black">
                      {item.time}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        item.status ===
                        "Optimal"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : item.status ===
                            "Warning"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div
            className={`rounded-[34px] border p-6 ${theme.card} ${theme.border} backdrop-blur-2xl`}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                System Health
              </h2>

              <p
                className={`mt-1 text-sm ${theme.muted}`}
              >
                Global infrastructure status
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  label:
                    "AI Decision Engine",
                  value: "99%",
                  color:
                    "from-emerald-400 to-cyan-400",
                },
                {
                  label:
                    "Cloud Replication",
                  value: "94%",
                  color:
                    "from-cyan-400 to-blue-500",
                },
                {
                  label:
                    "Security Gateway",
                  value: "88%",
                  color:
                    "from-amber-400 to-orange-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${theme.muted}`}
                    >
                      {item.label}
                    </span>

                    <span className="text-sm font-black">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      style={{
                        width: item.value,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-8 rounded-[28px] border p-5 ${theme.soft} ${theme.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-[0.18em] ${theme.muted}`}
                  >
                    System Stability
                  </p>

                  <h3 className="mt-3 text-4xl font-black">
                    98.6%
                  </h3>
                </div>

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <div className="absolute h-full w-full animate-ping rounded-full border border-emerald-400/20" />

                  <span className="text-sm font-black text-emerald-400">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3)
            transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}