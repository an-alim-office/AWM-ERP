"use client";

import React, { useMemo, useState } from "react";

interface TaxRecord {
  id: string;
  employeeName: string;
  department: string;
  taxableIncome: number;
  taxRate: number;
  taxAmount: number;
  period: string;
  status: "Paid" | "Pending";
}

export default function TaxManagementPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("June 2026");
  const [status, setStatus] = useState<"All" | "Paid" | "Pending">("All");

  const [taxData] = useState<TaxRecord[]>([
    {
      id: "TAX-2026-001",
      employeeName: "Ahmed Ali",
      department: "Finance",
      taxableIncome: 15000,
      taxRate: 15,
      taxAmount: 2250,
      period: "June 2026",
      status: "Paid",
    },
    {
      id: "TAX-2026-002",
      employeeName: "Sara Mansour",
      department: "HR",
      taxableIncome: 12000,
      taxRate: 10,
      taxAmount: 1200,
      period: "June 2026",
      status: "Pending",
    },
    {
      id: "TAX-2026-003",
      employeeName: "Omar Khan",
      department: "Operations",
      taxableIncome: 18000,
      taxRate: 20,
      taxAmount: 3600,
      period: "June 2026",
      status: "Paid",
    },
  ]);

  const filtered = useMemo(() => {
    return taxData.filter((t) => {
      const matchSearch =
        t.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.department.toLowerCase().includes(search.toLowerCase());

      const matchPeriod = t.period === period;
      const matchStatus = status === "All" ? true : t.status === status;

      return matchSearch && matchPeriod && matchStatus;
    });
  }, [taxData, search, period, status]);

  const stats = useMemo(() => {
    const totalTax = filtered.reduce((a, b) => a + b.taxAmount, 0);
    const paid = filtered
      .filter((t) => t.status === "Paid")
      .reduce((a, b) => a + b.taxAmount, 0);
    const pending = filtered
      .filter((t) => t.status === "Pending")
      .reduce((a, b) => a + b.taxAmount, 0);

    return { totalTax, paid, pending };
  }, [filtered]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#05070f] via-[#0b1220] to-[#05070f] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Tax Intelligence Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated tax tracking, compliance & reporting system
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tax records..."
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 outline-none text-sm"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none text-sm"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-xs text-slate-400">Records</div>
          <div className="text-lg font-bold text-amber-400">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Total Tax</div>
          <div className="text-lg font-bold text-orange-400">
            SAR {stats.totalTax.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Paid</div>
          <div className="text-lg font-bold text-emerald-400">
            SAR {stats.paid.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Pending</div>
          <div className="text-lg font-bold text-red-400">
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
                <th className="p-4 text-left">Tax ID</th>
                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Dept</th>
                <th className="p-4 text-left">Income</th>
                <th className="p-4 text-left">Rate</th>
                <th className="p-4 text-left">Tax</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No tax records found
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-slate-800 hover:bg-slate-950/40 transition"
                  >
                    <td className="p-4 font-bold text-orange-400">{t.id}</td>

                    <td className="p-4">
                      <div className="font-semibold">{t.employeeName}</div>
                    </td>

                    <td className="p-4 text-slate-300">{t.department}</td>

                    <td className="p-4 text-blue-400">
                      {t.taxableIncome.toLocaleString()}
                    </td>

                    <td className="p-4 text-amber-400">
                      {t.taxRate}%
                    </td>

                    <td className="p-4 font-bold text-red-400">
                      {t.taxAmount.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          t.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {t.status}
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