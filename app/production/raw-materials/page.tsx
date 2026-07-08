"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type MaterialStatus =
  | "In Stock"
  | "Low Stock"
  | "Out of Stock";

interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  supplier: string;
  warehouse: string;
  reorderPoint: number;
  consumptionRate: number;
  status: MaterialStatus;
}

const materialsData: Material[] = [
  {
    id: "RM-001",
    name: "Steel Sheets",
    stock: 1500,
    unit: "kg",
    supplier: "Global Steel Ltd",
    warehouse: "WH-A1",
    reorderPoint: 400,
    consumptionRate: 220,
    status: "In Stock",
  },
  {
    id: "RM-002",
    name: "Aluminium Coils",
    stock: 45,
    unit: "pcs",
    supplier: "MetalWorks Inc",
    warehouse: "WH-B2",
    reorderPoint: 80,
    consumptionRate: 35,
    status: "Low Stock",
  },
  {
    id: "RM-003",
    name: "Industrial Bolts",
    stock: 0,
    unit: "boxes",
    supplier: "FastenCorp",
    warehouse: "WH-C3",
    reorderPoint: 120,
    consumptionRate: 55,
    status: "Out of Stock",
  },
  {
    id: "RM-004",
    name: "Copper Wiring",
    stock: 620,
    unit: "m",
    supplier: "ElectroLine",
    warehouse: "WH-A2",
    reorderPoint: 200,
    consumptionRate: 90,
    status: "In Stock",
  },
];

const statusStyles: Record<MaterialStatus, string> = {
  "In Stock":
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Low Stock":
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "Out of Stock":
    "bg-red-500/10 text-red-400 border border-red-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[120px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

function StockBar({
  value,
  reorderPoint,
}: {
  value: number;
  reorderPoint: number;
}) {
  const percentage = Math.min((value / 1600) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500">
        <span>Stock Health</span>

        <span className="font-bold text-white">
          Reorder: {reorderPoint}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            percentage >= 60
              ? "bg-emerald-400"
              : percentage >= 25
              ? "bg-amber-400"
              : "bg-red-400"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function RawMaterialsPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    MaterialStatus | "ALL"
  >("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredMaterials = useMemo(() => {
    let data = [...materialsData];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.name
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
      totalMaterials: materialsData.length,
      lowStock: materialsData.filter(
        (m) => m.status === "Low Stock"
      ).length,
      outOfStock: materialsData.filter(
        (m) => m.status === "Out of Stock"
      ).length,
      inventoryValue: 2.4,
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
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Smart Inventory AI
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Raw Materials
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Real-time inventory visibility, procurement analytics,
              and enterprise-grade material management system.
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
              Materials
            </p>

            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {metrics.totalMaterials}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Low Stock
            </p>

            <h2 className="mt-2 text-3xl font-black text-amber-400">
              {metrics.lowStock}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Out Of Stock
            </p>

            <h2 className="mt-2 text-3xl font-black text-red-400">
              {metrics.outOfStock}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Inventory Value
            </p>

            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              $2.4M
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            aria-label="Search material"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material or ID..."
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          />

          <select
            aria-label="Filter stock status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as MaterialStatus | "ALL"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="ALL">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>
        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="border-b border-white/5 bg-black/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Material
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Supplier
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Warehouse
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Current Stock
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Consumption
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Stock Health
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold tracking-tight">
                          {material.name}
                        </p>

                        <p className="mt-1 text-xs text-cyan-400">
                          {material.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {material.supplier}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full border border-white/5 bg-black/20 px-3 py-1 text-xs font-semibold">
                        {material.warehouse}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {material.stock.toLocaleString()}{" "}
                          {material.unit}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Reorder at{" "}
                          {material.reorderPoint.toLocaleString()}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-cyan-300">
                      {material.consumptionRate}/day
                    </td>

                    <td className="px-6 py-5 min-w-[240px]">
                      <StockBar
                        value={material.stock}
                        reorderPoint={material.reorderPoint}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[material.status]}`}
                      >
                        {material.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Procurement Panel */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  AI Procurement Insights
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Smart reorder & supplier recommendations
                </p>
              </div>

              <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                Live AI
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
                <p className="text-sm font-bold text-amber-300">
                  Aluminium Coils approaching reorder threshold.
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Recommended procurement window within 48
                  hours to avoid production delay risk.
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
                <p className="text-sm font-bold text-red-300">
                  Industrial Bolts currently unavailable.
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Emergency vendor sourcing activated with
                  predictive demand balancing.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-black tracking-tight">
                Warehouse Allocation
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Real-time inventory distribution across storage
                zones
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  warehouse: "WH-A1",
                  usage: 84,
                },
                {
                  warehouse: "WH-B2",
                  usage: 58,
                },
                {
                  warehouse: "WH-C3",
                  usage: 31,
                },
              ].map((item) => (
                <div key={item.warehouse}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {item.warehouse}
                    </span>

                    <span className="text-xs text-gray-400">
                      {item.usage}% Utilized
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-black/20">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.usage >= 75
                          ? "bg-emerald-400"
                          : item.usage >= 45
                          ? "bg-amber-400"
                          : "bg-cyan-400"
                      }`}
                      style={{
                        width: `${item.usage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty */}
        {filteredMaterials.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No materials found
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