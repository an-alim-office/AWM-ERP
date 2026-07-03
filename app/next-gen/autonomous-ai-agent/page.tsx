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
  Bot,
  BrainCircuit,
  CheckCircle2,
  CloudCog,
  Command,
  Cpu,
  DatabaseZap,
  Filter,
  Globe2,
  Layers3,
  Loader2,
  Network,
  Orbit,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react";

type AgentStatus = "ACTIVE" | "TRAINING" | "IDLE" | "RISK";

type AgentNode = {
  id: string;
  name: string;
  provider: string;
  status: AgentStatus;
  tasks: number;
  autonomy: number;
  latency: string;
  memory: string;
};

const agentNodes: AgentNode[] = [
  {
    id: "AGT-001",
    name: "Executive Decision Agent",
    provider: "OpenAI Cluster",
    status: "ACTIVE",
    tasks: 842,
    autonomy: 98,
    latency: "12ms",
    memory: "18TB",
  },
  {
    id: "AGT-002",
    name: "Workflow Automation Core",
    provider: "Azure Neural Grid",
    status: "TRAINING",
    tasks: 412,
    autonomy: 88,
    latency: "24ms",
    memory: "11TB",
  },
  {
    id: "AGT-003",
    name: "Risk Intelligence Agent",
    provider: "Secure AI Vault",
    status: "RISK",
    tasks: 221,
    autonomy: 72,
    latency: "41ms",
    memory: "8TB",
  },
  {
    id: "AGT-004",
    name: "Autonomous Research Agent",
    provider: "Quantum Mesh",
    status: "ACTIVE",
    tasks: 1251,
    autonomy: 99,
    latency: "9ms",
    memory: "31TB",
  },
  {
    id: "AGT-005",
    name: "Customer Operations AI",
    provider: "Hybrid Neural Fabric",
    status: "IDLE",
    tasks: 102,
    autonomy: 64,
    latency: "18ms",
    memory: "5TB",
  },
];

const overviewStats = [
  {
    title: "Autonomous Agents",
    value: "482",
    growth: "+18.2%",
    icon: Bot,
  },
  {
    title: "Tasks Executed",
    value: "14.8M",
    growth: "+24.1%",
    icon: Workflow,
  },
  {
    title: "AI Stability",
    value: "99.99%",
    growth: "+6.7%",
    icon: ShieldCheck,
  },
  {
    title: "Neural Operations",
    value: "6.2PF",
    growth: "+12.5%",
    icon: BrainCircuit,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const NeuralChart = lazy(() =>
  Promise.resolve({
    default: memo(function NeuralChart() {
      const metrics = [34, 52, 68, 82, 97, 88, 92];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-950 to-violet-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.15),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                Neural Autonomy
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                99.4%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Autonomous orchestration efficiency
              </p>
            </div>

            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-sky-300">
              <Orbit className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {metrics.map((value, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-sky-500 via-cyan-400 to-violet-300 shadow-[0_20px_40px_rgba(14,165,233,0.28)] transition-all duration-500 group-hover:scale-y-105"
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

export default function AutonomousAIAgentPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "TRAINING" | "IDLE" | "RISK"
  >("ALL");

  const deferredSearch = useDeferredValue(search);

  const filteredAgents = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return agentNodes.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(normalized) ||
        agent.provider.toLowerCase().includes(normalized) ||
        agent.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "ALL" || agent.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-sky-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              AUTONOMOUS AGENTIC CORE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Autonomous AI Agent
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade autonomous AI orchestration platform with
              self-governing agents, multi-model reasoning, workflow autonomy,
              neural task delegation, and realtime operational intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {overviewStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30"
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

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sky-300">
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
            {/* Search & Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Agentic Command Center
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Multi-agent orchestration with autonomous execution and
                      realtime decision intelligence.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-5 text-sm font-black text-sky-300 transition-all duration-300 hover:border-sky-300/40 hover:bg-sky-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Global Neural Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-sky-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search agents, providers, orchestration nodes..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-sky-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-violet-400/30 bg-violet-500/10 px-6 text-sm font-black text-violet-300 transition-all duration-300 hover:border-violet-300/50 hover:bg-violet-500/20"
                  >
                    <Zap className="h-4 w-4" />
                    Deploy Agent
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {["ALL", "ACTIVE", "TRAINING", "IDLE", "RISK"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setFilter(
                            item as
                              | "ALL"
                              | "ACTIVE"
                              | "TRAINING"
                              | "IDLE"
                              | "RISK"
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                          filter === item
                            ? "border-sky-400/40 bg-sky-500/15 text-sky-300"
                            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {item}
                      </button>
                    )
                  )}
                </div>

                {/* Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Neural Grid
                      </p>

                      <Network className="h-4 w-4 text-sky-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Synced
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Distributed autonomous mesh online.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        AI Decisions
                      </p>

                      <Command className="h-4 w-4 text-violet-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      2.4M
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Autonomous decisions executed.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-sky-500/10 to-violet-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Security Layer
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Protected
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      AI governance protocols active.
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
                    Autonomous Agent Nodes
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Self-governing AI orchestration infrastructure.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredAgents.length} Agents
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Agent",
                        "Status",
                        "Tasks",
                        "Autonomy",
                        "Memory",
                        "Latency",
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
                    {filteredAgents.length > 0 ? (
                      filteredAgents.map((agent) => (
                        <tr
                          key={agent.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sky-300">
                                <Bot className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {agent.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {agent.provider} • {agent.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                agent.status === "ACTIVE"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : agent.status === "TRAINING"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : agent.status === "IDLE"
                                  ? "bg-slate-500/15 text-slate-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {agent.status === "ACTIVE" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {agent.status === "TRAINING" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {agent.status === "IDLE" && (
                                <TimerReset className="h-3 w-3" />
                              )}

                              {agent.status === "RISK" && (
                                <TriangleAlert className="h-3 w-3" />
                              )}

                              {agent.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-sky-300">
                              <Workflow className="h-4 w-4" />
                              {agent.tasks.toLocaleString()}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
                                  style={{
                                    width: `${agent.autonomy}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-violet-300">
                                {agent.autonomy}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <DatabaseZap className="h-4 w-4 text-cyan-300" />
                              {agent.memory}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                            {agent.latency}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No autonomous agents found.
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
              <NeuralChart />
            </Suspense>

            {/* AI Lifecycle */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Agent Lifecycle
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Autonomous Pipeline
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-sky-500/10 p-3 text-sky-300">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Neural task decomposition initialized",
                  "Autonomous execution chain synchronized",
                  "Multi-agent collaboration enabled",
                  "Governance and safety policies active",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />

                    <span className="text-sm font-semibold text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-950 to-violet-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Agentic Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Self-Governing AI
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-violet-300">
                  <CloudCog className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Advanced autonomous orchestration infrastructure powered by
                multi-agent reasoning, self-learning execution pipelines,
                distributed intelligence coordination, and enterprise-scale AI
                governance systems.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Autonomous Processing Load
                  </span>

                  <span className="text-sm font-black text-sky-300">
                    96%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-sky-400 to-violet-400" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}