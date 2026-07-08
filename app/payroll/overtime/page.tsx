"use client";

import React, { useMemo, useState } from "react";

type MessageState = {
  text: string;
  isError: boolean;
};

type OvertimeRecord = {
  id: string;
  workerId: string;
  date: string;
  hours: number;
  rate: number;
  total: number;
  createdAt: number;
};

export default function OvertimePage() {
  const [workerId, setWorkerId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    text: "",
    isError: false,
  });

  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [search, setSearch] = useState("");

  const totalOvertimeAmount = useMemo(() => {
    const h = Number(hours);
    const r = Number(rate);
    if (!h || !r || h <= 0 || r <= 0) return 0;
    return h * r;
  }, [hours, rate]);

  const stats = useMemo(() => {
    const totalEntries = records.length;
    const totalPayout = records.reduce((acc, r) => acc + r.total, 0);
    const totalHours = records.reduce((acc, r) => acc + r.hours, 0);

    return { totalEntries, totalPayout, totalHours };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.workerId.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search)
    );
  }, [records, search]);

  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const h = Number(hours);
    const r = Number(rate);

    if (!workerId.trim() || !h || !r || h <= 0 || r <= 0) {
      setMessage({
        text: "Worker ID, Hours এবং Rate সঠিকভাবে প্রদান করুন।",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    setTimeout(() => {
      const record: OvertimeRecord = {
        id: crypto.randomUUID(),
        workerId: workerId.trim(),
        date,
        hours: h,
        rate: r,
        total: totalOvertimeAmount,
        createdAt: Date.now(),
      };

      setRecords((prev) => [record, ...prev]);

      setMessage({
        text: `Worker ${workerId} এর ${totalOvertimeAmount} SAR ওভারটাইম সফলভাবে সংরক্ষণ করা হয়েছে।`,
        isError: false,
      });

      setWorkerId("");
      setHours("");
      setRate("");
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Overtime Management System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Advanced overtime tracking & compensation engine
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Entries</div>
          <div className="text-lg font-bold">{stats.totalEntries}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total Hours</div>
          <div className="text-lg font-bold text-amber-400">
            {stats.totalHours}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Payout</div>
          <div className="text-lg font-bold text-emerald-400">
            SAR {stats.totalPayout.toLocaleString()}
          </div>
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
          <h2 className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Overtime Entry
          </h2>

          <form onSubmit={handleOvertimeSubmit} className="space-y-4">
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Worker ID"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Overtime Hours"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Hourly OT Rate"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            {/* LIVE TOTAL */}
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40">
              <div className="text-xs text-slate-400 uppercase">
                Live Overtime Payout
              </div>
              <div className="text-2xl font-bold text-amber-400">
                SAR {totalOvertimeAmount.toLocaleString()}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "Saving..." : "Add Overtime"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-400">
              Overtime Records
            </h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="p-2 text-sm rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />
          </div>

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
                    <div className="text-amber-400 font-bold">
                      SAR {r.total.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {r.date} • {r.hours}h × {r.rate}
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