"use client";

import React, { useEffect, useMemo, useState } from "react";

type Status = "ONLINE" | "OFFLINE" | "MAINTENANCE";

interface Equipment {
  id: number;
  name: string;
  line: string;
  status: Status;
  uptime: number;
  lastMaintenance: string;
}

const initialData: Equipment[] = [
  { id: 1, name: "Production Line A", line: "A", status: "ONLINE", uptime: 98.4, lastMaintenance: "2026-06-20" },
  { id: 2, name: "Production Line B", line: "B", status: "OFFLINE", uptime: 0, lastMaintenance: "2026-06-18" },
  { id: 3, name: "Assembly Unit C", line: "C", status: "MAINTENANCE", uptime: 76.2, lastMaintenance: "2026-06-25" },
  { id: 4, name: "Packaging Unit D", line: "D", status: "ONLINE", uptime: 99.1, lastMaintenance: "2026-06-22" },
];

export default function EquipmentStatusPage() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<"name" | "uptime">("name");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let data = [...initialData];

    if (search) {
      data = data.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((d) => d.status === statusFilter);
    }

    data.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return b.uptime - a.uptime;
    });

    return data;
  }, [search, statusFilter, sortKey]);

  const stats = useMemo(() => {
    return {
      total: initialData.length,
      online: initialData.filter((d) => d.status === "ONLINE").length,
      offline: initialData.filter((d) => d.status === "OFFLINE").length,
      maintenance: initialData.filter((d) => d.status === "MAINTENANCE").length,
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-all duration-500 p-6 font-mono ${
        dark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-700 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Equipment Status</h1>
          <p className="text-sm text-gray-400">
            Real-time operational intelligence dashboard
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDark((p) => !p)}
            className="px-3 py-2 rounded-lg border border-gray-700 hover:scale-105 transition"
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-gray-700 bg-[#161b22]">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-700 bg-[#161b22]">
          <p className="text-xs text-emerald-400">Online</p>
          <p className="text-xl font-bold text-emerald-400">{stats.online}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-700 bg-[#161b22]">
          <p className="text-xs text-red-400">Offline</p>
          <p className="text-xl font-bold text-red-400">{stats.offline}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-700 bg-[#161b22]">
          <p className="text-xs text-yellow-400">Maintenance</p>
          <p className="text-xl font-bold text-yellow-400">
            {stats.maintenance}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search equipment..."
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700 outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700"
        >
          <option value="ALL">All Status</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-gray-700"
        >
          <option value="name">Sort by Name</option>
          <option value="uptime">Sort by Uptime</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-[#161b22] text-gray-400">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Line</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Uptime %</th>
              <th className="text-left p-3">Last Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-800 hover:bg-[#1f2937] transition"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.line}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === "ONLINE"
                        ? "text-emerald-400"
                        : item.status === "OFFLINE"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    ● {item.status}
                  </span>
                </td>
                <td className="p-3">{item.uptime}%</td>
                <td className="p-3">{item.lastMaintenance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center mt-10 text-gray-400">
          No equipment found
        </div>
      )}
    </div>
  );
}