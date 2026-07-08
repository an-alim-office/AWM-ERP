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
  BatteryCharging,
  BrainCircuit,
  CheckCircle2,
  CloudLightning,
  Cpu,
  Filter,
  Gauge,
  Globe2,
  Layers3,
  Loader2,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Signal,
  Sparkles,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";

type DeviceStatus = "ONLINE" | "CALIBRATING" | "OFFLINE";

type IoTDevice = {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  battery: number;
  temperature: number;
  signal: number;
  latency: string;
};

const devices: IoTDevice[] = [
  {
    id: "IOT-001",
    name: "Sensor Node Alpha",
    location: "Riyadh Hub",
    status: "ONLINE",
    battery: 94,
    temperature: 28,
    signal: 98,
    latency: "8ms",
  },
  {
    id: "IOT-002",
    name: "Industrial Gateway Core",
    location: "Dubai Sector",
    status: "ONLINE",
    battery: 86,
    temperature: 31,
    signal: 92,
    latency: "12ms",
  },
  {
    id: "IOT-003",
    name: "Climate Sensor Matrix",
    location: "Berlin Zone",
    status: "CALIBRATING",
    battery: 62,
    temperature: 37,
    signal: 71,
    latency: "25ms",
  },
  {
    id: "IOT-004",
    name: "Power Monitoring Relay",
    location: "Tokyo Facility",
    status: "OFFLINE",
    battery: 0,
    temperature: 0,
    signal: 0,
    latency: "--",
  },
  {
    id: "IOT-005",
    name: "Warehouse Motion Grid",
    location: "Toronto Cluster",
    status: "ONLINE",
    battery: 91,
    temperature: 24,
    signal: 95,
    latency: "10ms",
  },
];

const overviewStats = [
  {
    title: "Connected Devices",
    value: "18,482",
    growth: "+14.2%",
    icon: Wifi,
  },
  {
    title: "Realtime Data Streams",
    value: "4.2M",
    growth: "+22.7%",
    icon: Activity,
  },
  {
    title: "Network Stability",
    value: "99.97%",
    growth: "+4.1%",
    icon: ShieldCheck,
  },
  {
    title: "Edge AI Processing",
    value: "812TB",
    growth: "+11.8%",
    icon: BrainCircuit,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const LiveNetworkChart = lazy(() =>
  Promise.resolve({
    default: memo(function LiveNetworkChart() {
      const graph = [42, 58, 71, 86, 92, 96, 88];

      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-cyan-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_30%)]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                Device Throughput
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                96.4%
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Real-time IoT synchronization health
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
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
                  className="w-full rounded-t-[28px] bg-gradient-to-t from-emerald-500 via-cyan-400 to-sky-300 shadow-[0_20px_40px_rgba(16,185,129,0.28)] transition-all duration-500 group-hover:scale-y-105"
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

export default function LiveIoTDevicesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ONLINE" | "CALIBRATING" | "OFFLINE"
  >("ALL");

  const deferredSearch = useDeferredValue(search);

  const filteredDevices = useMemo(() => {
    const normalized = deferredSearch.toLowerCase().trim();

    return devices.filter((device) => {
      const matchesSearch =
        device.name.toLowerCase().includes(normalized) ||
        device.location.toLowerCase().includes(normalized) ||
        device.id.toLowerCase().includes(normalized);

      const matchesFilter =
        filter === "ALL" || device.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredSearch, filter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              IOT DEVICE COMMAND GRID
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Live IoT Devices
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade real-time IoT monitoring platform with sensor
              telemetry, edge AI processing, predictive device diagnostics,
              secure network orchestration, and live infrastructure analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[430px]">
            {overviewStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30"
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

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-emerald-300">
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
          {/* Left Side */}
          <section className="space-y-6">
            {/* Search & Controls */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Device Monitoring Center
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Realtime telemetry aggregation and intelligent edge-device
                      orchestration.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 text-sm font-black text-emerald-300 transition-all duration-300 hover:border-emerald-300/40 hover:bg-emerald-500/20"
                  >
                    <Globe2 className="h-4 w-4" />
                    Global Sync
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-emerald-300" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search devices, gateways, sensor nodes..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-emerald-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-cyan-400/30 bg-cyan-500/10 px-6 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-500/20"
                  >
                    <Zap className="h-4 w-4" />
                    Deploy Edge AI
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {["ALL", "ONLINE", "CALIBRATING", "OFFLINE"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setFilter(
                            item as
                              | "ALL"
                              | "ONLINE"
                              | "CALIBRATING"
                              | "OFFLINE"
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                          filter === item
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
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
                        Network Grid
                      </p>

                      <Network className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Stable
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Distributed IoT mesh online.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Live Signals
                      </p>

                      <Signal className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      98%
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Ultra-low latency telemetry.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        AI Protection
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Enabled
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Autonomous threat monitoring active.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Table */}
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    Active IoT Infrastructure
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Enterprise sensor telemetry and edge computing analytics.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Layers3 className="h-3.5 w-3.5" />
                  {filteredDevices.length} Devices
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Device",
                        "Status",
                        "Battery",
                        "Temperature",
                        "Signal",
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
                    {filteredDevices.length > 0 ? (
                      filteredDevices.map((device) => (
                        <tr
                          key={device.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-emerald-300">
                                <Cpu className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {device.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {device.location} • {device.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                device.status === "ONLINE"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : device.status === "CALIBRATING"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {device.status === "ONLINE" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {device.status === "CALIBRATING" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {device.status === "OFFLINE" && (
                                <AlertTriangle className="h-3 w-3" />
                              )}

                              {device.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                  style={{
                                    width: `${device.battery}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-emerald-300">
                                {device.battery}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300">
                              <Thermometer className="h-4 w-4 text-amber-300" />
                              {device.temperature > 0
                                ? `${device.temperature}°C`
                                : "--"}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-3">
                              <Gauge className="h-4 w-4 text-cyan-300" />

                              <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-300"
                                  style={{
                                    width: `${device.signal}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-cyan-300">
                                {device.signal}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                            {device.latency}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No IoT devices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right Side */}
          <aside className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              }
            >
              <LiveNetworkChart />
            </Suspense>

            {/* Device Intelligence */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Edge Intelligence
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Autonomous IoT Grid
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300">
                  <CloudLightning className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Realtime anomaly detection active",
                  "Edge AI inference synchronization enabled",
                  "Encrypted device communication online",
                  "Autonomous self-healing mesh operational",
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

            {/* AI Core */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Device Intelligence Core
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Neural Edge AI
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <BatteryCharging className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Distributed enterprise IoT infrastructure with predictive edge
                computing, autonomous telemetry processing, secure device mesh
                networking, and AI-powered realtime operational analytics.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Device Synchronization
                  </span>

                  <span className="text-sm font-black text-emerald-300">
                    97%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}