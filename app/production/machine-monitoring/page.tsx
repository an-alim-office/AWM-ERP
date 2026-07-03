"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type MachineStatus = "Operational" | "Warning" | "Down";

interface Machine {
  id: string;
  name: string;
  temp: number;
  status: MachineStatus;
  uptime: string;
  powerUsage: number;
  vibration: number;
  lastUpdated: string;
  productionRate: number;
}

type SortKey =
  | "name"
  | "temp"
  | "powerUsage"
  | "productionRate";

const initialMachines: Machine[] = [
  {
    id: "M-101",
    name: "CNC Router 01",
    temp: 45,
    status: "Operational",
    uptime: "99.9%",
    powerUsage: 68,
    vibration: 1.2,
    lastUpdated: "2 sec ago",
    productionRate: 96,
  },
  {
    id: "M-102",
    name: "Hydraulic Press",
    temp: 78,
    status: "Warning",
    uptime: "92.5%",
    powerUsage: 89,
    vibration: 3.9,
    lastUpdated: "10 sec ago",
    productionRate: 71,
  },
  {
    id: "M-103",
    name: "Laser Cutter",
    temp: 0,
    status: "Down",
    uptime: "0.0%",
    powerUsage: 0,
    vibration: 0,
    lastUpdated: "1 min ago",
    productionRate: 0,
  },
  {
    id: "M-104",
    name: "Industrial Conveyor",
    temp: 51,
    status: "Operational",
    uptime: "98.2%",
    powerUsage: 59,
    vibration: 1.5,
    lastUpdated: "5 sec ago",
    productionRate: 88,
  },
];

const statusStyles: Record<
  MachineStatus,
  {
    badge: string;
    dot: string;
    glow: string;
    progress: string;
  }
> = {
  Operational: {
    badge:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    progress: "bg-emerald-400",
  },
  Warning: {
    badge:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.15)]",
    progress: "bg-amber-400",
  },
  Down: {
    badge:
      "bg-red-500/10 text-red-400 border border-red-500/20",
    dot: "bg-red-400",
    glow: "shadow-[0_0_30px_rgba(248,113,113,0.15)]",
    progress: "bg-red-400",
  },
};

const SkeletonCard = memo(() => (
  <div className="h-[280px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

const ProgressBar = memo(
  ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
);

ProgressBar.displayName = "ProgressBar";

export default function MachineMonitoringPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    MachineStatus | "All"
  >("All");
  const [sortBy, setSortBy] = useState<SortKey>("temp");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredMachines = useMemo(() => {
    let data = [...initialMachines];

    if (search.trim()) {
      data = data.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((m) => m.status === statusFilter);
    }

    data.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return Number(b[sortBy]) - Number(a[sortBy]);
    });

    return data;
  }, [search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const operational = initialMachines.filter(
      (m) => m.status === "Operational"
    ).length;

    const warning = initialMachines.filter(
      (m) => m.status === "Warning"
    ).length;

    const down = initialMachines.filter(
      (m) => m.status === "Down"
    ).length;

    const avgTemp = Math.round(
      initialMachines.reduce((acc, cur) => acc + cur.temp, 0) /
        initialMachines.length
    );

    return {
      operational,
      warning,
      down,
      avgTemp,
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d1117] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#0d1117] text-gray-100"
          : "bg-[#f4f7fb] text-gray-900"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Smart IoT Monitoring
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Machine Monitoring
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Real-time industrial equipment analytics, predictive
              monitoring, and operational intelligence dashboard.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Operational
            </p>
            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              {stats.operational}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Warning
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-400">
              {stats.warning}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Down
            </p>
            <h2 className="mt-2 text-3xl font-black text-red-400">
              {stats.down}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Avg Temperature
            </p>
            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {stats.avgTemp}°C
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="relative">
            <input
              aria-label="Search machine"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search machine, ID..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
            />
          </div>

          <select
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as MachineStatus | "All"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="All">All Status</option>
            <option value="Operational">Operational</option>
            <option value="Warning">Warning</option>
            <option value="Down">Down</option>
          </select>

          <select
            aria-label="Sort machines"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="temp">Sort by Temperature</option>
            <option value="powerUsage">Sort by Power Usage</option>
            <option value="productionRate">
              Sort by Production Rate
            </option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredMachines.map((machine) => {
            const style = statusStyles[machine.status];

            return (
              <div
                key={machine.id}
                className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 ${style.glow}`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:scale-125" />

                {/* Top */}
                <div className="relative z-10 mb-6 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${style.dot} animate-pulse`}
                      />

                      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                        {machine.id}
                      </span>
                    </div>

                    <h2 className="text-lg font-black tracking-tight">
                      {machine.name}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
                  >
                    {machine.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="relative z-10 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-gray-400">
                      <span>Temperature</span>
                      <span className="font-bold text-white">
                        {machine.temp}°C
                      </span>
                    </div>

                    <ProgressBar
                      value={machine.temp}
                      color={style.progress}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-gray-400">
                      <span>Production Rate</span>
                      <span className="font-bold text-white">
                        {machine.productionRate}%
                      </span>
                    </div>

                    <ProgressBar
                      value={machine.productionRate}
                      color="bg-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">
                        Uptime
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        {machine.uptime}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">
                        Power
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        {machine.powerUsage}kW
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">
                        Vibration
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {machine.vibration} mm/s
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">
                        Updated
                      </p>

                      <p className="mt-1 text-sm font-bold text-cyan-300">
                        {machine.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty */}
        {filteredMachines.length === 0 && (
          <div className="mt-16 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No machines found
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Try changing filters or search keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}