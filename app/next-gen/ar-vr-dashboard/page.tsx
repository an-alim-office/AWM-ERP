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
  ArrowUpRight,
  Box,
  BrainCircuit,
  ChevronRight,
  Cpu,
  Eye,
  Filter,
  Globe2,
  Headset,
  Layers3,
  Loader2,
  MonitorSmartphone,
  Orbit,
  Radar,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  TriangleAlert,
  Waves,
  Workflow,
  Zap,
} from "lucide-react";

type SpatialStatus =
  | "RENDERING"
  | "ONLINE"
  | "SYNCING"
  | "OFFLINE";

type EnvironmentItem = {
  id: string;
  environment: string;
  engine: string;
  fps: number;
  latency: string;
  status: SpatialStatus;
  devices: number;
};

const environments: EnvironmentItem[] = [
  {
    id: "AR-001",
    environment: "Digital Factory Twin",
    engine: "XR Neural Engine",
    fps: 144,
    latency: "8ms",
    status: "ONLINE",
    devices: 84,
  },
  {
    id: "VR-002",
    environment: "Immersive Finance Grid",
    engine: "Quantum Spatial Core",
    fps: 122,
    latency: "11ms",
    status: "RENDERING",
    devices: 42,
  },
  {
    id: "AR-003",
    environment: "Warehouse Spatial Mapping",
    engine: "Meta Vision Fabric",
    fps: 98,
    latency: "16ms",
    status: "SYNCING",
    devices: 28,
  },
  {
    id: "VR-004",
    environment: "Remote Ops Command Room",
    engine: "Realtime XR Cloud",
    fps: 160,
    latency: "6ms",
    status: "ONLINE",
    devices: 133,
  },
  {
    id: "AR-005",
    environment: "Retail Simulation Hub",
    engine: "Adaptive Render Mesh",
    fps: 72,
    latency: "28ms",
    status: "OFFLINE",
    devices: 0,
  },
];

const stats = [
  {
    title: "Spatial Sessions",
    value: "1.8M",
    growth: "+18.4%",
    icon: Headset,
  },
  {
    title: "3D Environments",
    value: "482",
    growth: "+12.8%",
    icon: Box,
  },
  {
    title: "XR Stability",
    value: "99.98%",
    growth: "+6.1%",
    icon: ShieldCheck,
  },
  {
    title: "Realtime Sync",
    value: "6ms",
    growth: "-3ms",
    icon: Zap,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const XRAnalyticsChart = lazy(() =>
  Promise.resolve({
    default: memo(function XRAnalyticsChart() {
      const graph = [36, 48, 64, 74, 88, 94, 100];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-fuchsia-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.16),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                XR Render Intelligence
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                99.7%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Spatial rendering optimization accuracy
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
              <Orbit className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {graph.map((value, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-cyan-500 via-sky-400 to-fuchsia-400 shadow-[0_20px_40px_rgba(34,211,238,0.28)] transition-all duration-500 group-hover:scale-y-105"
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

export default function ARVRDashboardPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ONLINE" | "RENDERING" | "SYNCING" | "OFFLINE"
  >("ALL");

  const deferredSearch = useDeferredValue(search);

  const filteredEnvironments = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return environments.filter((item) => {
      const matchesSearch =
        item.environment.toLowerCase().includes(normalized) ||
        item.engine.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "ALL" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              IMMERSIVE XR PLATFORM
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              AR / VR Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade immersive spatial intelligence platform with
              realtime 3D rendering, AR/VR operational visualization,
              metaverse-ready monitoring, and distributed XR collaboration.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {stats.map((item) => {
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Spatial Intelligence Center
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Advanced immersive visualization and realtime XR
                      operational management infrastructure.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Spatial Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search immersive environments..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-fuchsia-400/30 bg-fuchsia-500/10 px-6 text-sm font-black text-fuchsia-300 transition-all duration-300 hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20"
                  >
                    <Headset className="h-4 w-4" />
                    Launch XR
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {[
                    "ALL",
                    "ONLINE",
                    "RENDERING",
                    "SYNCING",
                    "OFFLINE",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(
                          item as
                            | "ALL"
                            | "ONLINE"
                            | "RENDERING"
                            | "SYNCING"
                            | "OFFLINE"
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
                  ))}
                </div>

                {/* Widgets */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        XR Mesh
                      </p>

                      <Radar className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Synced
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Distributed spatial rendering active.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Neural XR
                      </p>

                      <BrainCircuit className="h-4 w-4 text-fuchsia-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      AI Enabled
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Predictive rendering optimization online.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-5">
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
                      XR governance and access controls enabled.
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
                    Spatial Environment Matrix
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Immersive realtime rendering and XR synchronization systems.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredEnvironments.length} Environments
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Environment",
                        "Status",
                        "FPS",
                        "Devices",
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
                    {filteredEnvironments.length > 0 ? (
                      filteredEnvironments.map((item) => (
                        <tr
                          key={item.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-300">
                                <Headset className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {item.environment}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.engine} • {item.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                item.status === "ONLINE"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : item.status === "RENDERING"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : item.status === "SYNCING"
                                  ? "bg-fuchsia-500/15 text-fuchsia-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {item.status === "ONLINE" && (
                                <Activity className="h-3 w-3" />
                              )}

                              {item.status === "RENDERING" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {item.status === "SYNCING" && (
                                <TimerReset className="h-3 w-3" />
                              )}

                              {item.status === "OFFLINE" && (
                                <TriangleAlert className="h-3 w-3" />
                              )}

                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
                              <TrendingUp className="h-4 w-4" />
                              {item.fps} FPS
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <MonitorSmartphone className="h-4 w-4 text-fuchsia-300" />
                              {item.devices}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <Zap className="h-4 w-4 text-cyan-300" />
                              {item.latency}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white"
                            >
                              Enter
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
                          No immersive environments found.
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
              <XRAnalyticsChart />
            </Suspense>

            {/* XR Layers */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    XR Spatial Layers
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Immersive Pipeline
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-cyan-500/10 p-3 text-cyan-300">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Realtime volumetric rendering synchronized",
                  "Distributed XR networking enabled",
                  "Spatial AI object tracking active",
                  "Immersive telemetry processing stabilized",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                    <span className="text-sm font-semibold text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* XR Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-fuchsia-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Immersive Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Spatial XR Engine
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-fuchsia-300">
                  <Eye className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Futuristic immersive visualization architecture powered by
                distributed XR rendering, AI-enhanced object recognition,
                realtime telemetry fusion, and enterprise-scale spatial
                collaboration systems.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Spatial Processing Load
                  </span>

                  <span className="text-sm font-black text-cyan-300">
                    98%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <ScanSearch className="h-3.5 w-3.5" />
                    Object Sync
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    14.8M
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Spatial objects tracked
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    <Waves className="h-3.5 w-3.5" />
                    XR Stability
                  </div>

                  <h4 className="mt-3 text-2xl font-black text-white">
                    99.9%
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Rendering consistency
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
                      Spatial Runtime Stable
                    </p>

                    <p className="text-xs text-slate-500">
                      XR orchestration operational
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