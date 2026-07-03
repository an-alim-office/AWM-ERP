"use client";

import React, { useEffect, useMemo, useState } from "react";

interface LineStatus {
  id: string;
  lineName: string;
  status: "Running" | "Idle" | "Maintenance";
  output: number;
  efficiency: number;
  shift: "A" | "B" | "C";
  lastUpdated: string;
}

type Theme = "dark" | "light";

function StatusBadge({ status }: { status: LineStatus["status"] }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-bold tracking-wide transition";

  if (status === "Running") {
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-400`}>
        ● RUNNING
      </span>
    );
  }

  if (status === "Maintenance") {
    return (
      <span className={`${base} bg-yellow-500/10 text-yellow-400`}>
        ● MAINTENANCE
      </span>
    );
  }

  return (
    <span className={`${base} bg-red-500/10 text-red-400`}>
      ● IDLE
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse bg-[#161b22] border border-gray-800 p-6 rounded-xl h-[90px]" />
  );
}

export default function LineManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<LineStatus["status"] | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<"output" | "efficiency">(
    "output"
  );

  const [lines] = useState<LineStatus[]>([
    {
      id: "L-01",
      lineName: "Assembly Line A",
      status: "Running",
      output: 1250,
      efficiency: 94,
      shift: "A",
      lastUpdated: "2026-06-29 10:15",
    },
    {
      id: "L-02",
      lineName: "Packaging Line B",
      status: "Maintenance",
      output: 0,
      efficiency: 0,
      shift: "B",
      lastUpdated: "2026-06-29 09:40",
    },
    {
      id: "L-03",
      lineName: "Quality Check C",
      status: "Running",
      output: 1120,
      efficiency: 89,
      shift: "A",
      lastUpdated: "2026-06-29 10:05",
    },
    {
      id: "L-04",
      lineName: "Logistics Line D",
      status: "Idle",
      output: 300,
      efficiency: 72,
      shift: "C",
      lastUpdated: "2026-06-29 08:55",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let data = [...lines];

    if (search) {
      data = data.filter((l) =>
        l.lineName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((l) => l.status === statusFilter);
    }

    data.sort((a, b) => {
      if (sortKey === "output") return b.output - a.output;
      return b.efficiency - a.efficiency;
    });

    return data;
  }, [lines, search, statusFilter, sortKey]);

  const summary = useMemo(() => {
    return {
      total: lines.length,
      running: lines.filter((l) => l.status === "Running").length,
      maintenance: lines.filter((l) => l.status === "Maintenance").length,
      idle: lines.filter((l) => l.status === "Idle").length,
      totalOutput: lines.reduce((a, b) => a + b.output, 0),
    };
  }, [lines]);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-all duration-500 p-6 font-mono ${
        theme === "dark"
          ? "bg-[#0d1117] text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Line Management</h1>
          <p className="text-sm text-gray-400">
            Real-time production line orchestration system
          </p>
        </div>

        <button
          onClick={() =>
            setTheme((p) => (p === "dark" ? "light" : "dark"))
          }
          className="px-4 py-2 rounded-lg border border-gray-700 hover:scale-105 transition"
        >
          Toggle Theme
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-gray-800 bg-[#161b22]">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-bold">{summary.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#161b22]">
          <p className="text-xs text-emerald-400">Running</p>
          <p className="text-xl font-bold text-emerald-400">
            {summary.running}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#161b22]">
          <p className="text-xs text-yellow-400">Maintenance</p>
          <p className="text-xl font-bold text-yellow-400">
            {summary.maintenance}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#161b22]">
          <p className="text-xs text-red-400">Idle</p>
          <p className="text-xl font-bold text-red-400">
            {summary.idle}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-gray-800 bg-[#161b22]">
          <p className="text-xs text-blue-400">Total Output</p>
          <p className="text-xl font-bold text-blue-400">
            {summary.totalOutput}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search production lines..."
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700 outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700"
        >
          <option value="ALL">All Status</option>
          <option value="Running">Running</option>
          <option value="Idle">Idle</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700"
        >
          <option value="output">Sort by Output</option>
          <option value="efficiency">Sort by Efficiency</option>
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {!mounted
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          : filtered.map((line) => (
              <div
                key={line.id}
                className="bg-[#161b22] border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-blue-500 transition-all"
              >
                {/* Left */}
                <div>
                  <h2 className="text-lg font-bold">{line.lineName}</h2>
                  <p className="text-xs text-gray-500 uppercase">
                    ID: {line.id} • Shift: {line.shift} • Updated:{" "}
                    {line.lastUpdated}
                  </p>
                </div>

                {/* Right metrics */}
                <div className="flex gap-6 md:gap-10 text-center items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Output
                    </p>
                    <p className="text-lg font-bold">{line.output}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Efficiency
                    </p>
                    <p className="text-lg font-bold text-emerald-400">
                      {line.efficiency}%
                    </p>
                  </div>

                  <StatusBadge status={line.status} />
                </div>
              </div>
            ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center mt-10 text-gray-400">
          No production lines found
        </div>
      )}
    </div>
  );
}