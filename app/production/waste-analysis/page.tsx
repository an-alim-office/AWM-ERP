"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type WasteStatus =
  | "Optimal"
  | "Warning"
  | "Critical";

interface WasteRecord {
  id: string;
  department: string;
  material: string;
  quantity: number;
  recycled: number;
  costImpact: number;
  trend: number;
  status: WasteStatus;
}

const wasteData: WasteRecord[] = [
  {
    id: "WS-001",
    department: "Assembly Unit",
    material: "Steel Scrap",
    quantity: 420,
    recycled: 78,
    costImpact: 8400,
    trend: -12,
    status: "Optimal",
  },
  {
    id: "WS-002",
    department: "Packaging Line",
    material: "Plastic Waste",
    quantity: 185,
    recycled: 44,
    costImpact: 5100,
    trend: 18,
    status: "Warning",
  },
  {
    id: "WS-003",
    department: "Laser Cutting",
    material: "Metal Dust",
    quantity: 310,
    recycled: 22,
    costImpact: 9800,
    trend: 31,
    status: "Critical",
  },
  {
    id: "WS-004",
    department: "Paint Division",
    material: "Chemical Residue",
    quantity: 95,
    recycled: 64,
    costImpact: 3400,
    trend: -6,
    status: "Optimal",
  },
];

const statusStyles: Record<WasteStatus, string> = {
  Optimal:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Warning:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Critical:
    "bg-red-500/10 text-red-400 border border-red-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[120px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

export default function WasteAnalysisPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    WasteStatus | "ALL"
  >("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredWaste = useMemo(() => {
    let data = [...wasteData];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.department
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.material
            .toLowerCase()
            .includes(search.toLowerCase())
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
      totalWaste: 1010,
      recycled: 52,
      carbonReduction: 38,
      savings: 1.8,
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
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Sustainability Intelligence
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Waste Analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              AI-powered waste optimization, recycling efficiency,
              environmental analytics, and industrial sustainability
              tracking.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/30"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* KPI */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Total Waste
            </p>

            <h2 className="mt-2 text-3xl font-black text-red-400">
              {metrics.totalWaste}kg
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Recycled
            </p>

            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              {metrics.recycled}%
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Carbon Reduction
            </p>

            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {metrics.carbonReduction}%
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Cost Savings
            </p>

            <h2 className="mt-2 text-3xl font-black text-amber-400">
              ${metrics.savings}M
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            aria-label="Search waste analytics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department or material..."
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-emerald-400/40"
          />

          <select
            aria-label="Filter waste status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as WasteStatus | "ALL"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-emerald-400/40"
          >
            <option value="ALL">All Status</option>
            <option value="Optimal">Optimal</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Waste Table */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="border-b border-white/5 bg-black/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Waste Material
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Quantity
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Recycled
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Cost Impact
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Trend
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWaste.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold tracking-tight">
                          {item.department}
                        </p>

                        <p className="mt-1 text-xs text-emerald-400">
                          {item.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold">
                      {item.material}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-cyan-300">
                      {item.quantity}kg
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Recovery Rate</span>

                          <span className="font-bold text-white">
                            {item.recycled}%
                          </span>
                        </div>

                        <ProgressBar
                          value={item.recycled}
                          color="bg-emerald-400"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-red-300">
                      ${item.costImpact.toLocaleString()}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`text-sm font-black ${
                          item.trend > 0
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.trend > 0 ? "+" : ""}
                        {item.trend}%
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Panels */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Waste Heatmap */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Waste Heatmap
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Departmental waste intensity analytics
                </p>
              </div>

              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                Live Data
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[78, 44, 92, 61, 33, 55, 88, 26].map(
                (value, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div
                      className={`h-16 rounded-xl transition-all duration-1000 ${
                        value >= 75
                          ? "bg-red-500/30"
                          : value >= 45
                          ? "bg-amber-500/30"
                          : "bg-emerald-500/30"
                      }`}
                    />

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Zone {index + 1}
                      </span>

                      <span className="text-xs font-bold text-white">
                        {value}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Sustainability Goals */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-black tracking-tight">
                Sustainability Goals
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Enterprise ESG & environmental targets
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  label: "Waste Reduction",
                  progress: 74,
                  color: "bg-emerald-400",
                },
                {
                  label: "Recycling Efficiency",
                  progress: 58,
                  color: "bg-cyan-400",
                },
                {
                  label: "Carbon Neutrality",
                  progress: 39,
                  color: "bg-amber-400",
                },
              ].map((goal) => (
                <div key={goal.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {goal.label}
                    </span>

                    <span className="text-xs text-gray-400">
                      {goal.progress}%
                    </span>
                  </div>

                  <ProgressBar
                    value={goal.progress}
                    color={goal.color}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <p className="text-sm font-bold text-emerald-300">
                AI Recommendation
              </p>

              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Optimizing recycling pipelines in Laser Cutting
                division can reduce annual waste processing costs
                by 18.7%.
              </p>
            </div>
          </div>
        </div>

        {/* Empty */}
        {filteredWaste.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No waste analytics found
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