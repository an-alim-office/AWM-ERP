"use client";

import React, { useMemo, useState } from "react";

interface RevenueRecord {
  id: string;
  source: string;
  category: string;
  amount: number;
  date: string;
  status: "Received" | "Pending";
}

export default function RevenuePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Received" | "Pending">("All");

  const [revenueData] = useState<RevenueRecord[]>([
    {
      id: "REV-2026-001",
      source: "Client Project A",
      category: "Consultancy",
      amount: 45000,
      date: "2026-06-25",
      status: "Received",
    },
    {
      id: "REV-2026-002",
      source: "Subscription Fees",
      category: "SaaS",
      amount: 12000,
      date: "2026-06-26",
      status: "Pending",
    },
    {
      id: "REV-2026-003",
      source: "Enterprise Contract",
      category: "B2B",
      amount: 78000,
      date: "2026-06-27",
      status: "Received",
    },
  ]);

  const filteredData = useMemo(() => {
    return revenueData.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.source.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" ? true : r.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [revenueData, search, statusFilter]);

  const stats = useMemo(() => {
    const total = revenueData.reduce((a, b) => a + b.amount, 0);
    const received = revenueData
      .filter((r) => r.status === "Received")
      .reduce((a, b) => a + b.amount, 0);

    const pending = revenueData
      .filter((r) => r.status === "Pending")
      .reduce((a, b) => a + b.amount, 0);

    return { total, received, pending };
  }, [revenueData]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Revenue Intelligence Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time income tracking & analytics engine
          </p>
        </div>

        <div className="flex gap-2 mt-3 md:mt-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search revenue..."
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-sm outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
          >
            <option value="All">All</option>
            <option value="Received">Received</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Total</div>
          <div className="text-lg font-bold text-blue-400">
            SAR {stats.total.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Received</div>
          <div className="text-lg font-bold text-emerald-400">
            SAR {stats.received.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Pending</div>
          <div className="text-lg font-bold text-amber-400">
            SAR {stats.pending.toLocaleString()}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Source</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No revenue records found
                  </td>
                </tr>
              ) : (
                filteredData.map((rev) => (
                  <tr
                    key={rev.id}
                    className="border-t border-slate-800 hover:bg-slate-950/40 transition"
                  >
                    <td className="p-4 text-blue-400 font-semibold">
                      {rev.id}
                    </td>
                    <td className="p-4">{rev.source}</td>
                    <td className="p-4 text-slate-300">{rev.category}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      SAR {rev.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-400">{rev.date}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          rev.status === "Received"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {rev.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}