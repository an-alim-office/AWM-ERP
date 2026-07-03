"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type OrderStatus =
  | "Running"
  | "Pending"
  | "Delayed"
  | "Completed";

interface ProductionOrder {
  id: string;
  product: string;
  line: string;
  progress: number;
  quantity: number;
  deadline: string;
  status: OrderStatus;
}

const ordersData: ProductionOrder[] = [
  {
    id: "PO-1001",
    product: "Industrial Motor",
    line: "Assembly Line A",
    progress: 84,
    quantity: 1200,
    deadline: "2026-07-02",
    status: "Running",
  },
  {
    id: "PO-1002",
    product: "Hydraulic Valve",
    line: "Packaging Line B",
    progress: 46,
    quantity: 850,
    deadline: "2026-07-03",
    status: "Pending",
  },
  {
    id: "PO-1003",
    product: "Laser Module",
    line: "QC Line C",
    progress: 18,
    quantity: 400,
    deadline: "2026-07-05",
    status: "Delayed",
  },
  {
    id: "PO-1004",
    product: "CNC Component",
    line: "Assembly Line D",
    progress: 100,
    quantity: 1500,
    deadline: "2026-06-30",
    status: "Completed",
  },
];

const statusStyles: Record<OrderStatus, string> = {
  Running:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Pending:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Delayed:
    "bg-red-500/10 text-red-400 border border-red-500/20",
  Completed:
    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[130px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          value >= 80
            ? "bg-emerald-400"
            : value >= 40
            ? "bg-amber-400"
            : "bg-red-400"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function ProductionPlanningPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    OrderStatus | "ALL"
  >("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = useMemo(() => {
    let data = [...ordersData];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.product
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.id.toLowerCase().includes(search.toLowerCase())
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
      activeShifts: 12,
      pendingOrders: 45,
      utilization: 88,
      running: ordersData.filter(
        (o) => o.status === "Running"
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
      {/* Background */}
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
              Smart Production AI
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Production Planning
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Enterprise-grade scheduling, resource allocation,
              production forecasting, and intelligent factory
              planning system.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* KPI */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Active Shifts
            </p>

            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {metrics.activeShifts}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Pending Orders
            </p>

            <h2 className="mt-2 text-3xl font-black text-amber-400">
              {metrics.pendingOrders}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Capacity Utilization
            </p>

            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              {metrics.utilization}%
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Running Orders
            </p>

            <h2 className="mt-2 text-3xl font-black text-purple-400">
              {metrics.running}
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            aria-label="Search production orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order or product..."
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          />

          <select
            aria-label="Filter order status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as OrderStatus | "ALL"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="ALL">All Status</option>
            <option value="Running">Running</option>
            <option value="Pending">Pending</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Production Orders Table */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-white/5 bg-black/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Production Line
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Quantity
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Progress
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Deadline
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold tracking-tight">
                          {order.id}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Smart Factory Queue
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold">
                      {order.product}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {order.line}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-cyan-300">
                      {order.quantity.toLocaleString()}
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Completion</span>

                          <span className="font-bold text-white">
                            {order.progress}%
                          </span>
                        </div>

                        <ProgressBar value={order.progress} />
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {order.deadline}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gantt / Timeline Section */}
        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Smart Production Timeline
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                AI-optimized production sequencing & scheduling
              </p>
            </div>

            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-cyan-300">
              Real-Time Sync
            </div>
          </div>

          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div key={order.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      {order.product}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.line}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-gray-400">
                    {order.progress}%
                  </span>
                </div>

                <div className="relative h-5 overflow-hidden rounded-full bg-black/20">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
                      order.progress >= 80
                        ? "bg-emerald-400"
                        : order.progress >= 40
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                    style={{
                      width: `${order.progress}%`,
                    }}
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] animate-[pulse_2s_linear_infinite]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty */}
        {filteredOrders.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No production plans found
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