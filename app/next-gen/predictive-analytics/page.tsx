"use client";

import React, {
  lazy,
  memo,
  Suspense,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Filter,
  Globe2,
  Layers3,
  LineChart,
  Loader2,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Waves,
  Zap,
} from "lucide-react";

type PredictionModel = {
  id: string;
  model: string;
  category: string;
  confidence: number;
  status: "Active" | "Training" | "Risk";
  trend: string;
  updatedAt: string;
};

const predictionModels: PredictionModel[] = [
  {
    id: "ML-9201",
    model: "Revenue Forecast AI",
    category: "Finance",
    confidence: 98,
    status: "Active",
    trend: "+18.4%",
    updatedAt: "2m ago",
  },
  {
    id: "ML-4481",
    model: "Supply Chain Optimizer",
    category: "Operations",
    confidence: 91,
    status: "Training",
    trend: "+9.2%",
    updatedAt: "14m ago",
  },
  {
    id: "ML-1188",
    model: "Risk Detection Neural Grid",
    category: "Security",
    confidence: 87,
    status: "Risk",
    trend: "-2.1%",
    updatedAt: "31m ago",
  },
  {
    id: "ML-7751",
    model: "Customer Retention Engine",
    category: "Marketing",
    confidence: 96,
    status: "Active",
    trend: "+11.8%",
    updatedAt: "1h ago",
  },
  {
    id: "ML-3019",
    model: "Demand Forecast Matrix",
    category: "Retail",
    confidence: 94,
    status: "Active",
    trend: "+16.2%",
    updatedAt: "3h ago",
  },
];

const overviewCards = [
  {
    title: "Forecast Accuracy",
    value: "99.2%",
    growth: "+4.8%",
    icon: Target,
  },
  {
    title: "AI Predictions",
    value: "84.5K",
    growth: "+21.2%",
    icon: BrainCircuit,
  },
  {
    title: "Live Data Streams",
    value: "2.8M",
    growth: "+14.1%",
    icon: Waves,
  },
  {
    title: "Business Signals",
    value: "12.4K",
    growth: "+8.7%",
    icon: Radar,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const ForecastChart = lazy(() =>
  Promise.resolve({
    default: memo(function ForecastChart() {
      const chartBars = [32, 48, 56, 74, 82, 96, 88];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950 to-cyan-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.14),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                Predictive Forecast
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                +28.8%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Expected business growth projection
              </p>
            </div>

            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {chartBars.map((bar, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-violet-500 via-fuchsia-400 to-cyan-300 shadow-[0_20px_40px_rgba(168,85,247,0.28)] transition-all duration-500 group-hover:scale-y-105"
                  style={{
                    height: `${bar}%`,
                  }}
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {
                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
                      index
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }),
  })
);

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-6 ${shimmer}`}
    >
      <div className="h-4 w-24 rounded-full bg-white/10" />
      <div className="mt-5 h-8 w-36 rounded-full bg-white/10" />
      <div className="mt-8 h-24 rounded-3xl bg-white/10" />
    </div>
  );
});

export default function PredictiveAnalyticsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Active" | "Training" | "Risk"
  >("All");

  const deferredSearch = useDeferredValue(search);

  const filteredModels = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return predictionModels.filter((item) => {
      const matchesSearch =
        item.model.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-violet-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              PREDICTIVE INTELLIGENCE CORE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Predictive Analytics
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              AI-powered statistical forecasting, business intelligence
              modeling, trend identification, predictive simulations, and
              enterprise-grade future analytics orchestration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {overviewCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {item.title}
                      </p>

                      <h3 className="mt-3 text-2xl font-black text-white">
                        {item.value}
                      </h3>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        {item.growth}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-violet-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Layout */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left */}
          <section className="space-y-6">
            {/* Search + Filters */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Forecasting Engine
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      AI-driven trend analysis with real-time predictive
                      business simulations.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 text-sm font-black text-violet-300 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Global Forecast Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-violet-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search models, categories, AI engines..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-cyan-400/30 bg-cyan-500/10 px-6 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-500/20"
                  >
                    <Zap className="h-4 w-4" />
                    Run Simulation
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {["All", "Active", "Training", "Risk"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(
                          item as
                            | "All"
                            | "Active"
                            | "Training"
                            | "Risk"
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                        filter === item
                          ? "border-violet-400/40 bg-violet-500/15 text-violet-300"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {item}
                    </button>
                  ))}
                </div>

                {/* Smart Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Neural Forecast
                      </p>

                      <BrainCircuit className="h-4 w-4 text-violet-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Active
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Multi-layer AI predictions online.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Data Streams
                      </p>

                      <Activity className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      2.8M
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Real-time signal ingestion active.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Risk Intelligence
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Stable
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Predictive anomaly detection enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Models Table */}
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Predictive AI Models
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Live statistical engines and business intelligence models.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredModels.length} Models
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Model",
                        "Category",
                        "Confidence",
                        "Status",
                        "Trend",
                        "Updated",
                      ].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <tr
                          key={model.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-violet-300">
                                <BrainCircuit className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {model.model}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {model.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {model.category}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
                                  style={{
                                    width: `${model.confidence}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-violet-300">
                                {model.confidence}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                model.status === "Active"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : model.status === "Training"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {model.status === "Training" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {model.status === "Risk" && (
                                <TriangleAlert className="h-3 w-3" />
                              )}

                              {model.status === "Active" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {model.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center gap-2 text-sm font-bold ${
                                model.trend.startsWith("+")
                                  ? "text-emerald-300"
                                  : "text-rose-300"
                              }`}
                            >
                              <TrendingUp className="h-4 w-4" />
                              {model.trend}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                            {model.updatedAt}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No predictive models found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              }
            >
              <ForecastChart />
            </Suspense>

            {/* AI Timeline */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Forecast Timeline
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    AI Prediction Cycle
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-3 text-violet-300">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Historical pattern aggregation",
                  "Neural statistical processing",
                  "Trend anomaly detection",
                  "Future scenario simulation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />

                    <span className="text-sm font-semibold text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligence Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Autonomous AI
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <LineChart className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Advanced forecasting infrastructure powered by neural analytics,
                predictive learning, autonomous statistical processing, and
                enterprise-scale business intelligence orchestration.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Neural Processing Load
                  </span>

                  <span className="text-sm font-black text-violet-300">
                    94%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}