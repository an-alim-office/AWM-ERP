"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type MaintenanceStatus =
  | "PENDING"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface MaintenanceTask {
  id: string;
  machine: string;
  category: string;
  engineer: string;
  date: string;
  duration: string;
  priority: Priority;
  status: MaintenanceStatus;
  healthScore: number;
}

const maintenanceData: MaintenanceTask[] = [
  {
    id: "MT-001",
    machine: "CNC Router 01 Inspection",
    category: "Predictive",
    engineer: "Alex Carter",
    date: "2026-07-02",
    duration: "2h",
    priority: "HIGH",
    status: "PENDING",
    healthScore: 68,
  },
  {
    id: "MT-002",
    machine: "Hydraulic Press Oil Change",
    category: "Preventive",
    engineer: "Sarah Khan",
    date: "2026-07-03",
    duration: "1.5h",
    priority: "MEDIUM",
    status: "SCHEDULED",
    healthScore: 82,
  },
  {
    id: "MT-003",
    machine: "Laser Cutter Calibration",
    category: "Corrective",
    engineer: "David Lee",
    date: "2026-07-04",
    duration: "4h",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    healthScore: 41,
  },
  {
    id: "MT-004",
    machine: "Packaging Line Motor Check",
    category: "Preventive",
    engineer: "Emily Stone",
    date: "2026-07-05",
    duration: "3h",
    priority: "LOW",
    status: "COMPLETED",
    healthScore: 96,
  },
];

const statusStyles: Record<MaintenanceStatus, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  SCHEDULED:
    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  IN_PROGRESS:
    "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const priorityStyles: Record<Priority, string> = {
  LOW: "text-emerald-400",
  MEDIUM: "text-cyan-400",
  HIGH: "text-amber-400",
  CRITICAL: "text-red-400",
};

const SkeletonCard = memo(() => {
  return (
    <div className="h-[140px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
  );
});

SkeletonCard.displayName = "SkeletonCard";

function HealthBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          value >= 80
            ? "bg-emerald-400"
            : value >= 60
            ? "bg-amber-400"
            : "bg-red-400"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function MaintenancePage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    MaintenanceStatus | "ALL"
  >("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredData = useMemo(() => {
    let data = [...maintenanceData];

    if (search.trim()) {
      data = data.filter((item) =>
        item.machine.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (item) => item.status === statusFilter
      );
    }

    return data;
  }, [search, statusFilter]);

  const metrics = useMemo(() => {
    return {
      total: maintenanceData.length,
      active: maintenanceData.filter(
        (m) => m.status === "IN_PROGRESS"
      ).length,
      completed: maintenanceData.filter(
        (m) => m.status === "COMPLETED"
      ).length,
      critical: maintenanceData.filter(
        (m) => m.priority === "CRITICAL"
      ).length,
    };
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
          : "bg-[#f5f7fb] text-gray-900"
      }`}
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Smart Maintenance AI
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Maintenance Control Center
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Enterprise-grade predictive maintenance scheduling,
              asset health intelligence, and operational tracking.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Total Tasks
            </p>
            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {metrics.total}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Active
            </p>
            <h2 className="mt-2 text-3xl font-black text-purple-400">
              {metrics.active}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Completed
            </p>
            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              {metrics.completed}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Critical Alerts
            </p>
            <h2 className="mt-2 text-3xl font-black text-red-400">
              {metrics.critical}
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            aria-label="Search maintenance"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search maintenance task..."
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          />

          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as MaintenanceStatus | "ALL"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-white/5 bg-black/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Machine
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Engineer
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Schedule
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Health
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Priority
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold tracking-tight">
                          {task.machine}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {task.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full border border-white/5 bg-black/20 px-3 py-1 text-xs font-semibold">
                        {task.category}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {task.engineer}
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-semibold">
                          {task.date}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Duration: {task.duration}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 min-w-[180px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Health Score</span>

                          <span className="font-bold text-white">
                            {task.healthScore}%
                          </span>
                        </div>

                        <HealthBar value={task.healthScore} />
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`text-sm font-black tracking-wide ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[task.status]}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No maintenance tasks found
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Try adjusting search keywords or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}