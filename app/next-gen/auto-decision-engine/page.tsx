"use client";

import React, {
  Suspense,
  lazy,
  memo,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  DatabaseZap,
  Filter,
  Gauge,
  Globe2,
  Layers3,
  Loader2,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  TimerReset,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";

type DecisionStatus =
  | "APPROVED"
  | "PROCESSING"
  | "REVIEW"
  | "BLOCKED";

type DecisionItem = {
  id: string;
  title: string;
  department: string;
  confidence: number;
  latency: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  status: DecisionStatus;
};

const decisionData: DecisionItem[] = [
  {
    id: "DEC-001",
    title: "Inventory Auto Procurement",
    department: "Supply Chain",
    confidence: 98,
    latency: "12ms",
    risk: "LOW",
    status: "APPROVED",
  },
  {
    id: "DEC-002",
    title: "Dynamic Pricing Adjustment",
    department: "Sales AI",
    confidence: 92,
    latency: "19ms",
    risk: "MEDIUM",
    status: "PROCESSING",
  },
  {
    id: "DEC-003",
    title: "Fraud Transaction Detection",
    department: "Security Core",
    confidence: 88,
    latency: "8ms",
    risk: "HIGH",
    status: "REVIEW",
  },
  {
    id: "DEC-004",
    title: "Autonomous Workforce Routing",
    department: "Operations",
    confidence: 99,
    latency: "15ms",
    risk: "LOW",
    status: "APPROVED",
  },
  {
    id: "DEC-005",
    title: "AI Budget Allocation",
    department: "Finance",
    confidence: 76,
    latency: "22ms",
    risk: "HIGH",
    status: "BLOCKED",
  },
];

const stats = [
  {
    title: "Decisions Processed",
    value: "8.4M",
    growth: "+21.8%",
    icon: BrainCircuit,
  },
  {
    title: "Automation Accuracy",
    value: "99.2%",
    growth: "+5.4%",
    icon: ShieldCheck,
  },
  {
    title: "Realtime Execution",
    value: "14ms",
    growth: "-2.1ms",
    icon: Zap,
  },
  {
    title: "AI Workflow Nodes",
    value: "1,248",
    growth: "+14.7%",
    icon: Workflow,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const DecisionAnalytics = lazy(() =>
  Promise.resolve({
    default: memo(function DecisionAnalytics() {
      const graph = [36, 58, 62, 74, 96, 88, 92];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-amber-500/10 via-slate-950 to-orange-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.15),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                AI Decision Accuracy
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                99.2%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Autonomous enterprise logic precision
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-amber-300">
              <Radar className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {graph.map((item, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-300 shadow-[0_20px_40px_rgba(245,158,11,0.28)] transition-all duration-500 group-hover:scale-y-105"
                  style={{
                    height: `${item}%`,
                  }}
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
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

export default function AutoDecisionEnginePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "APPROVED" | "PROCESSING" | "REVIEW" | "BLOCKED"
  >("ALL");

  const deferredSearch = useDeferredValue(search);

  const filteredData = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return decisionData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(normalized) ||
        item.department.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "ALL" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              AUTONOMOUS DECISION CORE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Auto Decision Engine
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade autonomous decision orchestration platform with
              AI-powered logic execution, realtime workflow automation,
              predictive intelligence, and secure adaptive governance systems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30"
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

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Autonomous Logic Center
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      AI-driven enterprise logic orchestration and realtime
                      decision automation infrastructure.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 text-sm font-black text-amber-300 transition-all duration-300 hover:border-amber-300/40 hover:bg-amber-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Global Decision Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search autonomous decisions..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-amber-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-orange-400/30 bg-orange-500/10 px-6 text-sm font-black text-orange-300 transition-all duration-300 hover:border-orange-300/50 hover:bg-orange-500/20"
                  >
                    <Zap className="h-4 w-4" />
                    Execute Logic
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {[
                    "ALL",
                    "APPROVED",
                    "PROCESSING",
                    "REVIEW",
                    "BLOCKED",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(
                          item as
                            | "ALL"
                            | "APPROVED"
                            | "PROCESSING"
                            | "REVIEW"
                            | "BLOCKED"
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                        filter === item
                          ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {item}
                    </button>
                  ))}
                </div>

                {/* Quick Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Decision Grid
                      </p>

                      <Network className="h-4 w-4 text-amber-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Stable
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Neural governance synchronized.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        AI Execution
                      </p>

                      <Cpu className="h-4 w-4 text-orange-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      8.4M
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Decisions autonomously processed.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Governance AI
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Protected
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Adaptive policy enforcement enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Realtime Decision Pipeline
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Autonomous business logic execution matrix.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredData.length} Decisions
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Decision",
                        "Status",
                        "Confidence",
                        "Risk",
                        "Latency",
                        "Flow",
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
                    {filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr
                          key={item.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-amber-300">
                                <Bot className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {item.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.department} • {item.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                item.status === "APPROVED"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : item.status === "PROCESSING"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : item.status === "REVIEW"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {item.status === "APPROVED" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {item.status === "PROCESSING" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {item.status === "REVIEW" && (
                                <TimerReset className="h-3 w-3" />
                              )}

                              {item.status === "BLOCKED" && (
                                <AlertTriangle className="h-3 w-3" />
                              )}

                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                                  style={{
                                    width: `${item.confidence}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-amber-300">
                                {item.confidence}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                item.risk === "LOW"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : item.risk === "MEDIUM"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {item.risk}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <Clock3 className="h-4 w-4 text-orange-300" />
                              {item.latency}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-slate-300 transition-all duration-300 hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-white"
                            >
                              Open
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No autonomous decisions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              }
            >
              <DecisionAnalytics />
            </Suspense>

            {/* Decision Layers */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    AI Logic Layers
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Adaptive Decision Matrix
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-amber-500/10 p-3 text-amber-300">
                  <SplitSquareVertical className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Predictive logic orchestration active",
                  "Realtime governance monitoring enabled",
                  "AI conflict resolution synchronized",
                  "Adaptive workflow optimization online",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                    <span className="text-sm font-semibold text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-amber-500/10 via-slate-950 to-orange-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Autonomous Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Logic AI Engine
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-orange-300">
                  <DatabaseZap className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Intelligent enterprise decision architecture powered by
                realtime predictive analysis, adaptive logic execution,
                autonomous governance, and multi-layer AI optimization systems.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    AI Optimization Load
                  </span>

                  <span className="text-sm font-black text-amber-300">
                    97%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Growth
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    +28%
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    AI operational uplift
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <Gauge className="h-3.5 w-3.5" />
                    Stability
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    99.9%
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Governance integrity
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300">
                    <Activity className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Neural Runtime Stable
                    </p>

                    <p className="text-xs text-slate-500">
                      AI orchestration operational
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-emerald-300">
                  ACTIVE
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}