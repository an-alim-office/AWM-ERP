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
  AlertTriangle,
  ArrowUpRight,
  Bolt,
  CheckCircle2,
  Cpu,
  Factory,
  Filter,
  Globe2,
  Gauge,
  HardDrive,
  Layers3,
  Loader2,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";

type FactoryNode = {
  id: string;
  name: string;
  country: string;
  status: "Operational" | "Warning" | "Offline";
  output: number;
  temperature: number;
  plc: string;
  latency: string;
};

const FACTORIES: FactoryNode[] = [
  {
    id: "FAC-001",
    name: "Riyadh Smart Plant",
    country: "Saudi Arabia",
    status: "Operational",
    output: 96,
    temperature: 34,
    plc: "Connected",
    latency: "12ms",
  },
  {
    id: "FAC-002",
    name: "Berlin Robotics Hub",
    country: "Germany",
    status: "Warning",
    output: 72,
    temperature: 58,
    plc: "Connected",
    latency: "42ms",
  },
  {
    id: "FAC-003",
    name: "Tokyo Automation Core",
    country: "Japan",
    status: "Operational",
    output: 99,
    temperature: 29,
    plc: "Connected",
    latency: "8ms",
  },
  {
    id: "FAC-004",
    name: "Toronto Heavy Systems",
    country: "Canada",
    status: "Offline",
    output: 0,
    temperature: 0,
    plc: "Disconnected",
    latency: "--",
  },
  {
    id: "FAC-005",
    name: "Dubai Manufacturing AI",
    country: "UAE",
    status: "Operational",
    output: 91,
    temperature: 37,
    plc: "Connected",
    latency: "16ms",
  },
];

const insights = [
  {
    title: "Active Factories",
    value: "124",
    growth: "+12.8%",
    icon: Factory,
  },
  {
    title: "PLC Connections",
    value: "3,482",
    growth: "+6.4%",
    icon: Cpu,
  },
  {
    title: "System Stability",
    value: "99.98%",
    growth: "+2.1%",
    icon: ShieldCheck,
  },
  {
    title: "Global Throughput",
    value: "18.4GW",
    growth: "+14.7%",
    icon: Bolt,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const IndustrialGridChart = lazy(() =>
  Promise.resolve({
    default: memo(function IndustrialGridChart() {
      const bars = [44, 72, 56, 88, 94, 76, 98];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-emerald-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                Production Intelligence
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                98.2%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                AI-optimized operational efficiency
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {bars.map((item, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-cyan-500 via-sky-400 to-emerald-300 shadow-[0_20px_40px_rgba(6,182,212,0.25)] transition-all duration-500 group-hover:scale-y-105"
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

export default function RemoteFactoryControlPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Operational" | "Warning" | "Offline"
  >("All");

  const deferredSearch = useDeferredValue(search);

  const filteredFactories = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return FACTORIES.filter((factory) => {
      const matchSearch =
        factory.name.toLowerCase().includes(query) ||
        factory.country.toLowerCase().includes(query) ||
        factory.id.toLowerCase().includes(query);

      const matchFilter =
        filter === "All" || factory.status === filter;

      return matchSearch && matchFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              INDUSTRIAL COMMAND CORE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Remote Factory Control
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Global industrial automation dashboard for remote PLC control,
              machinery orchestration, operational intelligence, predictive
              maintenance, and enterprise-grade safety monitoring.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {insights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30"
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

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left */}
          <section className="space-y-6">
            {/* Search + Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Industrial Command Interface
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Live factory synchronization with AI-assisted remote
                      operational control systems.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-500/20"
                  >
                    <Radar className="h-4 w-4" />
                    Live Monitoring
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search factory, country, node ID..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-emerald-400/30 bg-emerald-500/10 px-6 text-sm font-black text-emerald-300 transition-all duration-300 hover:border-emerald-300/50 hover:bg-emerald-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Connect Region
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {["All", "Operational", "Warning", "Offline"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setFilter(
                            item as
                              | "All"
                              | "Operational"
                              | "Warning"
                              | "Offline"
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                          filter === item
                            ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {item}
                      </button>
                    )
                  )}
                </div>

                {/* Smart Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        PLC Network
                      </p>

                      <Cpu className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Synced
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Multi-node automation active.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Grid Latency
                      </p>

                      <Wifi className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      11ms
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Ultra-low global response.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Safety Protocol
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Secured
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Industrial fail-safe enabled.
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
                    Global Factory Grid
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Real-time industrial monitoring and operational telemetry.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredFactories.length} Nodes
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Factory",
                        "Status",
                        "Output",
                        "Temperature",
                        "PLC",
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
                    {filteredFactories.length > 0 ? (
                      filteredFactories.map((factory) => (
                        <tr
                          key={factory.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-300">
                                <Factory className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {factory.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {factory.country} • {factory.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                factory.status === "Operational"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : factory.status === "Warning"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {factory.status === "Operational" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {factory.status === "Warning" && (
                                <AlertTriangle className="h-3 w-3" />
                              )}

                              {factory.status === "Offline" && (
                                <Loader2 className="h-3 w-3" />
                              )}

                              {factory.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                                  style={{
                                    width: `${factory.output}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-cyan-300">
                                {factory.output}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <Gauge className="h-4 w-4 text-amber-300" />
                              {factory.temperature > 0
                                ? `${factory.temperature}°C`
                                : "--"}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center gap-2 text-sm font-bold ${
                                factory.plc === "Connected"
                                  ? "text-emerald-300"
                                  : "text-rose-300"
                              }`}
                            >
                              <HardDrive className="h-4 w-4" />
                              {factory.plc}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                            {factory.latency}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No factory nodes found.
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
              <IndustrialGridChart />
            </Suspense>

            {/* Safety Matrix */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Safety Matrix
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Industrial Shield
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Emergency shutdown protocol armed",
                  "AI predictive maintenance active",
                  "Hazard detection synchronization online",
                  "Autonomous load balancing secured",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                    <span className="text-sm font-semibold text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Power Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-emerald-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    AI Power Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Autonomous Grid
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <Zap className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Enterprise-grade industrial orchestration with predictive AI,
                autonomous routing, distributed PLC communication, and secure
                remote operational control systems.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Automation Load
                  </span>

                  <span className="text-sm font-black text-cyan-300">
                    91%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}