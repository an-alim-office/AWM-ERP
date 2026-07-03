"use client";

import React, { useMemo, useState } from "react";

type MessageState = {
  text: string;
  isError: boolean;
};

type PayrollRecord = {
  id: string;
  workerId: string;
  hours: number;
  rate: number;
  total: number;
  timestamp: number;
};

export default function HourlyPayrollPage() {
  const [workerId, setWorkerId] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>({ text: "", isError: false });

  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [search, setSearch] = useState("");

  const calculatedTotal = useMemo(() => {
    const h = Number(totalHours);
    const r = Number(hourlyRate);
    if (!h || !r || h <= 0 || r <= 0) return 0;
    return h * r;
  }, [totalHours, hourlyRate]);

  const stats = useMemo(() => {
    const totalWorkers = records.length;
    const totalPayout = records.reduce((acc, r) => acc + r.total, 0);
    const avg = totalWorkers ? totalPayout / totalWorkers : 0;

    return { totalWorkers, totalPayout, avg };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.workerId.toLowerCase().includes(search.toLowerCase()) ||
        String(r.total).includes(search)
    );
  }, [records, search]);

  const handleHourlySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const h = Number(totalHours);
    const r = Number(hourlyRate);

    if (!workerId.trim() || !h || !r || h <= 0 || r <= 0) {
      setMessage({
        text: "অনুগ্রহ করে সঠিক Worker ID, Hours এবং Rate প্রদান করুন।",
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
        hours: h,
        rate: r,
        total: calculatedTotal,
        timestamp: Date.now(),
      };

      setRecords((prev) => [record, ...prev]);

      setMessage({
        text: `Worker ${workerId} এর ${calculatedTotal} SAR মজুরি সফলভাবে রেকর্ড করা হয়েছে।`,
        isError: false,
      });

      setWorkerId("");
      setTotalHours("");
      setHourlyRate("");
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Hourly Payroll Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Smart contract-based hourly wage calculation system
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Workers</div>
          <div className="text-lg font-bold">{stats.totalWorkers}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total Payout</div>
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

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORM */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
            Hourly Wage Entry
          </h2>

          <form onSubmit={handleHourlySubmit} className="space-y-4">
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Worker ID"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              placeholder="Total Hours"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Hourly Rate (SAR)"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            {/* LIVE TOTAL */}
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40">
              <div className="text-xs text-slate-400 uppercase">
                Live Total
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                SAR {calculatedTotal.toLocaleString()}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "Saving..." : "Submit Payroll"}
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
                      SAR {r.total.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {r.hours}h × {r.rate} SAR
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