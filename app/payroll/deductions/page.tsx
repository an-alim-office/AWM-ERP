"use client";

import React, { useMemo, useState } from "react";

type Deduction = {
  id: string;
  workerId: string;
  type: string;
  amount: number;
  note?: string;
  timestamp: number;
};

const TYPES = [
  "Late Arrival",
  "Advance Repayment",
  "Unexcused Absence",
  "Tax/Insurance",
  "Performance Penalty",
];

export default function DeductionsPage() {
  const [workerId, setWorkerId] = useState("");
  const [penaltyType, setPenaltyType] = useState(TYPES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const [records, setRecords] = useState<Deduction[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const stats = useMemo(() => {
    const total = records.length;
    const totalAmount = records.reduce((acc, r) => acc + r.amount, 0);

    return { total, totalAmount };
  }, [records]);

  const handleDeductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amt = Number(amount);

    if (!workerId.trim() || !amount.trim() || !amt || amt <= 0) {
      setMessage({
        text: "অনুগ্রহ করে সঠিক তথ্য প্রদান করুন (Worker ID & Amount).",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    setTimeout(() => {
      const newRecord: Deduction = {
        id: crypto.randomUUID(),
        workerId: workerId.trim(),
        type: penaltyType,
        amount: amt,
        note: note.trim(),
        timestamp: Date.now(),
      };

      setRecords((prev) => [newRecord, ...prev]);

      setMessage({
        text: "বেতন কর্তন সফলভাবে রেকর্ড করা হয়েছে।",
        isError: false,
      });

      setWorkerId("");
      setAmount("");
      setNote("");
      setLoading(false);
    }, 900);
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.workerId.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        (r.note || "").toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : r.type === filter;

      return matchSearch && matchFilter;
    });
  }, [records, search, filter]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          Payroll Deduction Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Smart penalty & deduction management system
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total Records</div>
          <div className="text-xl font-bold">{stats.total}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total Deduction</div>
          <div className="text-xl font-bold text-red-400">
            SAR {stats.totalAmount.toLocaleString()}
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
          <h2 className="text-xs uppercase tracking-widest text-red-400 mb-4">
            New Deduction Entry
          </h2>

          <form onSubmit={handleDeductionSubmit} className="space-y-4">
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Worker ID"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (SAR)"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none resize-none"
              rows={3}
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "Saving..." : "Confirm Deduction"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-400">
              Deduction Records
            </h2>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
            >
              <option value="all">All</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
                    <div className="text-red-400 text-sm">- SAR {r.amount}</div>
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    {r.type}
                  </div>

                  {r.note && (
                    <div className="text-xs text-slate-500 mt-1">
                      {r.note}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}