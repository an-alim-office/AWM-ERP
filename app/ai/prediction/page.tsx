"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Cpu,
  Database,
  Gauge,
  Globe2,
  Layers3,
  LineChart,
  Radar,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PredictionModel = {
  id: number;
  model: string;
  accuracy: string;
  latency: string;
  status: "Active" | "Training" | "Queued";
  dataset: string;
};

type ForecastMetric = {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
};

type ActivityItem = {
  id: number;
  title: string;
  time: string;
  type: string;
};

/* =========================================================
   STATIC DATA
========================================================= */

const forecastMetrics: ForecastMetric[] = [
  {
    title: "Prediction Accuracy",
    value: "98.7%",
    growth: "+4.2%",
    icon: <TargetIcon />,
  },
  {
    title: "Active Models",
    value: "24",
    growth: "+8",
    icon: <BrainCircuit size={20} />,
  },
  {
    title: "AI Processing",
    value: "4.2M",
    growth: "+14%",
    icon: <Cpu size={20} />,
  },
  {
    title: "Forecast Confidence",
    value: "94.1%",
    growth: "+7.6%",
    icon: <Gauge size={20} />,
  },
];

const predictionModels: PredictionModel[] = [
  {
    id: 1,
    model: "Revenue Forecast AI",
    accuracy: "98.2%",
    latency: "240ms",
    status: "Active",
    dataset: "Financial",
  },
  {
    id: 2,
    model: "Customer Churn Engine",
    accuracy: "95.8%",
    latency: "410ms",
    status: "Training",
    dataset: "CRM",
  },
  {
    id: 3,
    model: "Inventory Demand Predictor",
    accuracy: "96.9%",
    latency: "190ms",
    status: "Active",
    dataset: "Warehouse",
  },
  {
    id: 4,
    model: "Market Trend Neural AI",
    accuracy: "97.4%",
    latency: "320ms",
    status: "Queued",
    dataset: "Global",
  },
];

const realtimeActivities: ActivityItem[] = [
  {
    id: 1,
    title: "Quarterly sales forecast updated",
    time: "2 min ago",
    type: "Forecast",
  },
  {
    id: 2,
    title: "AI anomaly detected in retail chain",
    time: "8 min ago",
    type: "Alert",
  },
  {
    id: 3,
    title: "Predictive model retraining completed",
    time: "12 min ago",
    type: "Training",
  },
  {
    id: 4,
    title: "Supply chain prediction synchronized",
    time: "18 min ago",
    type: "Sync",
  },
];

const quickInsights = [
  "AI demand prediction increased by 18%",
  "Operational risk probability decreased",
  "Market sentiment trending positive",
  "Smart forecasting latency optimized",
];

/* =========================================================
   PAGE
========================================================= */

export default function PredictionAIPage() {
  const [search, setSearch] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const filteredModels = useMemo(() => {
    return predictionModels.filter(
      (item) =>
        item.model
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.dataset
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [search]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 1400)
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_20%),#020617] text-white">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />

          <div className="relative flex flex-col gap-8 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
                <Sparkles size={14} />
                Enterprise Predictive Intelligence
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                Prediction AI Engine
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                Futuristic predictive analytics
                platform with autonomous AI
                forecasting, real-time anomaly
                detection, operational trend
                intelligence and enterprise
                decision automation system.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Revenue Forecast",
                  "Market Analytics",
                  "Demand Intelligence",
                  "Risk Prediction",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:w-[620px]">
              {forecastMetrics.map(
                (metric) => (
                  <MetricCard
                    key={metric.title}
                    title={metric.title}
                    value={metric.value}
                    growth={metric.growth}
                    icon={metric.icon}
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">
            {/* AI FORECAST */}

            <GlassCard>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                    <Radar size={14} />
                    Real-Time Forecast Models
                  </div>

                  <h2 className="mt-4 text-3xl font-black text-white">
                    AI Forecast Pipeline
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Enterprise prediction
                    orchestration and adaptive
                    learning infrastructure.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search models..."
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-violet-400 sm:w-[260px]"
                    />
                  </div>

                  <button
                    onClick={
                      handleRefresh
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/10"
                  >
                    <RefreshCcw
                      size={16}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Sync
                  </button>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead className="bg-white/[0.04]">
                      <tr>
                        {[
                          "Model",
                          "Dataset",
                          "Accuracy",
                          "Latency",
                          "Status",
                          "Action",
                        ].map((item) => (
                          <th
                            key={item}
                            className="px-5 py-5 text-left text-xs font-bold uppercase tracking-[0.22em] text-slate-400"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        Array.from({
                          length: 4,
                        }).map((_, i) => (
                          <SkeletonRow
                            key={i}
                          />
                        ))
                      ) : filteredModels.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-16 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <CircleAlert className="mb-4 text-slate-500" />

                              <p className="text-sm text-slate-400">
                                No prediction
                                model found
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredModels.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                                    <LineChart
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-white">
                                      {
                                        item.model
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Neural
                                      Intelligence
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.dataset
                                }
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                  {
                                    item.accuracy
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.latency
                                }
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge
                                  status={
                                    item.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-5">
                                <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-200 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/10">
                                  Open
                                  <ChevronRight
                                    size={
                                      14
                                    }
                                  />
                                </button>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>

            {/* PREDICTIVE ANALYTICS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Predictive Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI-powered enterprise
                    trend simulation system
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {quickInsights.map(
                  (item) => (
                    <InsightCard
                      key={item}
                      title={item}
                    />
                  )
                )}
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        Smart Prediction
                        Graph
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Adaptive enterprise
                        analytics
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                      LIVE
                    </div>
                  </div>

                  <div className="mt-8 flex h-[280px] items-end gap-4">
                    {[38, 72, 54, 88, 65, 96, 74].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center gap-3"
                        >
                          <div
                            style={{
                              height: `${height}%`,
                            }}
                            className="w-full rounded-t-[22px] bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 transition-all duration-500"
                          />

                          <span className="text-xs text-slate-500">
                            Q
                            {index + 1}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        AI Infrastructure
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Autonomous workflow
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                      <Workflow size={22} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <InfrastructureCard
                      icon={
                        <Database
                          size={18}
                        />
                      }
                      title="Realtime Dataset Sync"
                      status="Operational"
                    />

                    <InfrastructureCard
                      icon={
                        <Globe2
                          size={18}
                        />
                      }
                      title="Global Prediction API"
                      status="Connected"
                    />

                    <InfrastructureCard
                      icon={
                        <ShieldCheck
                          size={18}
                        />
                      }
                      title="Security Layer"
                      status="Protected"
                    />

                    <InfrastructureCard
                      icon={
                        <Layers3
                          size={18}
                        />
                      }
                      title="Neural AI Layer"
                      status="Optimized"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* =====================================================
              RIGHT SIDEBAR
          ===================================================== */}

          <div className="space-y-8">
            {/* STATUS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Core Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Enterprise prediction
                    infrastructure
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <Zap size={24} />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <StatusProgress
                  label="Neural Training"
                  value="92%"
                />

                <StatusProgress
                  label="Forecast Stability"
                  value="87%"
                />

                <StatusProgress
                  label="Risk Intelligence"
                  value="95%"
                />

                <StatusProgress
                  label="Realtime Sync"
                  value="99%"
                />
              </div>
            </GlassCard>

            {/* LIVE ACTIVITIES */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Realtime Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI monitoring timeline
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <Activity size={24} />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {realtimeActivities.map(
                  (item) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                    />
                  )
                )}
              </div>
            </GlassCard>

            {/* ENTERPRISE NOTICE */}

            <GlassCard>
              <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                    <CalendarClock
                      size={24}
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-cyan-100">
                      Enterprise AI Runtime
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-cyan-100/70">
                      Intelligent predictive
                      infrastructure optimized
                      for enterprise analytics,
                      autonomous forecasting,
                      AI risk simulation and
                      global business decision
                      support systems.
                    </p>

                    <button className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-200 transition-all duration-300 hover:bg-cyan-400/20">
                      Open AI Console
                      <ArrowUpRight
                        size={16}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
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
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-7">
        {children}
      </div>
    );
  }
);

const MetricCard = memo(
  function MetricCard({
    title,
    value,
    growth,
    icon,
  }: ForecastMetric) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            {icon}
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <TrendingUp size={12} />
            {growth}
          </div>
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-black text-white">
          {value}
        </h3>
      </div>
    );
  }
);

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status:
      | "Active"
      | "Training"
      | "Queued";
  }) {
    const variants = {
      Active:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      Training:
        "border-amber-500/20 bg-amber-500/10 text-amber-300",
      Queued:
        "border-violet-500/20 bg-violet-500/10 text-violet-300",
    };

    return (
      <div
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${variants[status]}`}
      >
        {status}
      </div>
    );
  }
);

const SkeletonRow = memo(
  function SkeletonRow() {
    return (
      <tr className="border-t border-white/5">
        {Array.from({
          length: 6,
        }).map((_, i) => (
          <td
            key={i}
            className="px-5 py-5"
          >
            <div className="h-10 animate-pulse rounded-2xl bg-white/[0.05]" />
          </td>
        ))}
      </tr>
    );
  }
);

const InsightCard = memo(
  function InsightCard({
    title,
  }: {
    title: string;
  }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-500/5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
          <Sparkles size={20} />
        </div>

        <h3 className="text-sm font-semibold leading-7 text-slate-200">
          {title}
        </h3>
      </div>
    );
  }
);

const InfrastructureCard = memo(
  function InfrastructureCard({
    icon,
    title,
    status,
  }: {
    icon: React.ReactNode;
    title: string;
    status: string;
  }) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
            {icon}
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {title}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              Enterprise Layer
            </p>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          {status}
        </div>
      </div>
    );
  }
);

const StatusProgress = memo(
  function StatusProgress({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {label}
          </span>

          <span className="text-xs font-bold text-violet-300">
            {value}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            style={{
              width: value,
            }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
          />
        </div>
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
      <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-violet-400/20 hover:bg-violet-500/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
          <Activity size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold leading-7 text-white">
                {item.title}
              </h4>

              <p className="mt-2 text-xs text-slate-500">
                {item.time}
              </p>
            </div>

            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              {item.type}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function TargetIcon() {
  return <Radar size={20} />;
}