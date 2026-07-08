"use client";

import React, { useMemo, useState } from "react";

type KPI = {
  label: string;
  value: number;
  type: "revenue" | "expense" | "tax" | "profit";
};

export default function ProfitLossPage() {
  const [period, setPeriod] = useState("June 2026");

  const data = useMemo(
    () => ({
      totalRevenue: 155000,
      totalExpenses: 85000,
      taxDeductions: 12000,
    }),
    []
  );

  const netProfit = useMemo(
    () => data.totalRevenue - data.totalExpenses - data.taxDeductions,
    [data]
  );

  const profitMargin = useMemo(() => {
    if (!data.totalRevenue) return 0;
    return (netProfit / data.totalRevenue) * 100;
  }, [netProfit, data.totalRevenue]);

  const kpis: KPI[] = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: data.totalRevenue,
        type: "revenue",
      },
      {
        label: "Total Expenses",
        value: data.totalExpenses,
        type: "expense",
      },
      {
        label: "Tax Deductions",
        value: data.taxDeductions,
        type: "tax",
      },
      {
        label: "Net Profit",
        value: netProfit,
        type: "profit",
      },
    ],
    [data, netProfit]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Profit & Loss Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time financial intelligence engine
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="mt-3 md:mt-0 p-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
        >
          <option>June 2026</option>
          <option>May 2026</option>
          <option>April 2026</option>
        </select>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40"
          >
            <div className="text-xs uppercase tracking-widest text-slate-400">
              {k.label}
            </div>

            <div
              className={`text-2xl font-bold mt-2 ${
                k.type === "revenue"
                  ? "text-blue-400"
                  : k.type === "expense"
                  ? "text-red-400"
                  : k.type === "tax"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              SAR {k.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Net Profit</div>
          <div className="text-2xl font-bold text-emerald-400">
            SAR {netProfit.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Profit Margin</div>
          <div className="text-2xl font-bold text-purple-400">
            {profitMargin.toFixed(2)}%
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">
            Financial Health
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {netProfit > 0 ? "POSITIVE" : "NEGATIVE"}
          </div>
        </div>
      </div>

      {/* CHART PLACEHOLDER */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-widest text-slate-400">
            Performance Analytics
          </h2>
        </div>

        <div className="h-72 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
          Revenue vs Expenses vs Profit (Advanced Analytics Chart Module)
        </div>
      </div>
    </div>
  );
}