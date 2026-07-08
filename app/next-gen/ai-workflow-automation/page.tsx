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
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  DatabaseZap,
  Filter,
  GitBranchPlus,
  Globe2,
  Layers3,
  Loader2,
  PlayCircle,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  TimerReset,
  TrendingUp,
  TriangleAlert,
  WandSparkles,
  Workflow,
  Zap,
} from "lucide-react";

type WorkflowStatus =
  | "RUNNING"
  | "QUEUED"
  | "PAUSED"
  | "FAILED";

type WorkflowItem = {
  id: string;
  workflow: string;
  department: string;
  executions: string;
  latency: string;
  aiConfidence: number;
  status: WorkflowStatus;
};

const workflows: WorkflowItem[] = [
  {
    id: "WF-001",
    workflow: "Autonomous Invoice Routing",
    department: "Finance",
    executions: "4.8M",
    latency: "12ms",
    aiConfidence: 99,
    status: "RUNNING",
  },
  {
    id: "WF-002",
    workflow: "AI Customer Escalation",
    department: "Support",
    executions: "1.2M",
    latency: "19ms",
    aiConfidence: 93,
    status: "QUEUED",
  },
  {
    id: "WF-003",
    workflow: "Predictive Inventory Sync",
    department: "Supply Chain",
    executions: "2.9M",
    latency: "8ms",
    aiConfidence: 97,
    status: "RUNNING",
  },
  {
    id: "WF-004",
    workflow: "Dynamic Workforce Allocation",
    department: "Operations",
    executions: "847K",
    latency: "22ms",
    aiConfidence: 88,
    status: "PAUSED",
  },
  {
    id: "WF-005",
    workflow: "Fraud Detection Escalation",
    department: "Security",
    executions: "564K",
    latency: "5ms",
    aiConfidence: 76,
    status: "FAILED",
  },
];

const stats = [
  {
    title: "Workflow Runs",
    value: "18.2M",
    growth: "+26.4%",
    icon: Workflow,
  },
  {
    title: "AI Automation",
    value: "99.4%",
    growth: "+8.2%",
    icon: BrainCircuit,
  },
  {
    title: "Realtime Latency",
    value: "7ms",
    growth: "-4ms",
    icon: Zap,
  },
  {
    title: "Pipeline Nodes",
    value: "3,842",
    growth: "+19.8%",
    icon: GitBranchPlus,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const WorkflowAnalyticsChart = lazy(() =>
  Promise.resolve({
    default: memo(function WorkflowAnalyticsChart() {
      const graph = [30, 44, 58, 72, 84, 91, 100];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950 to-cyan-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                Workflow Intelligence
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                99.4%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                AI orchestration execution accuracy
              </p>
            </div>

            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-300">
              <Radar className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {graph.map((value, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-violet-500 via-fuchsia-400 to-cyan-400 shadow-[0_20px_40px_rgba(139,92,246,0.28)] transition-all duration-500 group-hover:scale-y-105"
                  style={{
                    height: `${value}%`,
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

export default function AIWorkflowAutomationPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "RUNNING" | "QUEUED" | "PAUSED" | "FAILED"
  >("ALL");

  const deferredSearch = useDeferredValue(search);

  const filteredWorkflows = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return workflows.filter((item) => {
      const matchesSearch =
        item.workflow.toLowerCase().includes(normalized) ||
        item.department.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "ALL" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-violet-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              AI ORCHESTRATION PLATFORM
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              AI Workflow Automation
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade autonomous workflow orchestration system with
              realtime AI pipeline execution, intelligent automation,
              adaptive business logic routing, and distributed task
              optimization infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {stats.map((item) => {
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Intelligent Automation Center
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Adaptive AI workflow orchestration and enterprise-grade
                      automation infrastructure.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 text-sm font-black text-violet-300 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Pipeline Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-violet-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search AI workflows..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-cyan-400/30 bg-cyan-500/10 px-6 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-500/20"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Deploy Workflow
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {[
                    "ALL",
                    "RUNNING",
                    "QUEUED",
                    "PAUSED",
                    "FAILED",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(
                          item as
                            | "ALL"
                            | "RUNNING"
                            | "QUEUED"
                            | "PAUSED"
                            | "FAILED"
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

                {/* Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        AI Runtime
                      </p>

                      <Cpu className="h-4 w-4 text-violet-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Stable
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Distributed orchestration active.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Neural AI
                      </p>

                      <Bot className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Optimized
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Intelligent task automation enabled.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Governance
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Protected
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Adaptive AI workflow controls enabled.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Table */}
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Realtime Workflow Matrix
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    AI-driven enterprise pipeline orchestration and execution.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredWorkflows.length} Workflows
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Workflow",
                        "Status",
                        "Executions",
                        "AI Confidence",
                        "Latency",
                        "Access",
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
                    {filteredWorkflows.length > 0 ? (
                      filteredWorkflows.map((item) => (
                        <tr
                          key={item.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-violet-300">
                                <Workflow className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {item.workflow}
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
                                item.status === "RUNNING"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : item.status === "QUEUED"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : item.status === "PAUSED"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {item.status === "RUNNING" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {item.status === "QUEUED" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {item.status === "PAUSED" && (
                                <TimerReset className="h-3 w-3" />
                              )}

                              {item.status === "FAILED" && (
                                <TriangleAlert className="h-3 w-3" />
                              )}

                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
                              <TrendingUp className="h-4 w-4" />
                              {item.executions}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
                                  style={{
                                    width: `${item.aiConfidence}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-violet-300">
                                {item.aiConfidence}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <Clock3 className="h-4 w-4 text-cyan-300" />
                              {item.latency}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-slate-300 transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
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
                          No AI workflows found.
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
              <WorkflowAnalyticsChart />
            </Suspense>

            {/* Automation Layers */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Automation Layers
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Adaptive AI Pipeline
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-3 text-violet-300">
                  <SplitSquareVertical className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Realtime AI workflow balancing enabled",
                  "Distributed task routing synchronized",
                  "Adaptive logic orchestration operational",
                  "Autonomous error recovery stabilized",
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

            {/* Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Workflow Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Autonomous Orchestrator
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <DatabaseZap className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Futuristic AI orchestration architecture powered by adaptive
                workflow intelligence, autonomous task delegation, predictive
                execution routing, and realtime distributed automation systems.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Automation Load
                  </span>

                  <span className="text-sm font-black text-violet-300">
                    96%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <WandSparkles className="h-3.5 w-3.5" />
                    AI Nodes
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    84K
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Active automation units
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <Activity className="h-3.5 w-3.5" />
                    Stability
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    99.98%
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Workflow runtime integrity
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
                      Automation Runtime Stable
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

              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-violet-400/20 bg-violet-500/10 px-5 py-4 text-sm font-black text-violet-300 transition-all duration-300 hover:border-violet-300/40 hover:bg-violet-500/20"
              >
                Open AI Workflow Studio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}