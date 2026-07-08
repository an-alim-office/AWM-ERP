"use client";

import React, { useMemo, useState } from "react";

type MessageState = {
  text: string;
  isError: boolean;
};

type PayrollRecord = {
  id: string;
  workerId: string;
  month: string;
  baseSalary: number;
  allowance: number;
  gross: number;
  createdAt: number;
};

export default function MonthlyPayrollPage() {
  const [workerId, setWorkerId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [allowance, setAllowance] = useState("");
  const [month, setMonth] = useState("2026-05");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>({ text: "", isError: false });

  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [search, setSearch] = useState("");

  const grossSalary = useMemo(() => {
    const base = Number(baseSalary) || 0;
    const allow = Number(allowance) || 0;
    return base + allow;
  }, [baseSalary, allowance]);

  const stats = useMemo(() => {
    const total = records.length;
    const totalPayout = records.reduce((acc, r) => acc + r.gross, 0);
    const avg = total ? totalPayout / total : 0;

    return { total, totalPayout, avg };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.workerId.toLowerCase().includes(search.toLowerCase()) ||
        r.month.includes(search)
    );
  }, [records, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const base = Number(baseSalary);
    const allow = Number(allowance);

    if (!workerId.trim() || !base || base <= 0) {
      setMessage({
        text: "Worker ID এবং Base Salary সঠিকভাবে প্রদান করুন।",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    setTimeout(() => {
      const record: PayrollRecord = {
        id: crypto.randomUUID(),
        workerId: workerId.trim(),
        month,
        baseSalary: base,
        allowance: allow || 0,
        gross: grossSalary,
        createdAt: Date.now(),
      };

      setRecords((prev) => [record, ...prev]);

      setMessage({
        text: `Worker ${workerId} এর ${month} মাসের গ্রস স্যালারি ${grossSalary} SAR সেট করা হয়েছে।`,
        isError: false,
      });

      setWorkerId("");
      setBaseSalary("");
      setAllowance("");
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Monthly Payroll Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enterprise salary structure & compensation engine
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Employees</div>
          <div className="text-lg font-bold">{stats.total}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total Payroll</div>
          <div className="text-lg font-bold text-emerald-400">
            SAR {stats.totalPayout.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 outline-none text-sm"
          />
        </div>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            message.isError
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
            Salary Setup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Worker ID"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              placeholder="Base Salary"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              placeholder="Allowance (optional)"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            {/* LIVE GROSS */}
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40">
              <div className="text-xs text-slate-400 uppercase">
                Gross Salary
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                SAR {grossSalary.toLocaleString()}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "Saving..." : "Set Monthly Salary"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-4">
            Payroll Records
          </h2>

          <div className="space-y-3 max-h-[420px] overflow-auto">
            {filtered.length === 0 ? (
              <div className="text-slate-500 text-sm">No records found</div>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/40"
                >
                  <div className="flex justify-between">
                    <div className="font-semibold">{r.workerId}</div>
                    <div className="text-emerald-400 font-bold">
                      SAR {r.gross.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {r.month} • Base: {r.baseSalary} + Allowance: {r.allowance}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}