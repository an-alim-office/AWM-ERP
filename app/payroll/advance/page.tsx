"use client";

import React, { useMemo, useState } from "react";

type MessageState = {
  text: string;
  isError: boolean;
};

type PayrollRecord = {
  workerId: string;
  amount: number;
  reason?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdvancePayrollPage() {
  const [workerId, setWorkerId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: "", isError: false });

  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState<string>("");

  const stats = useMemo(() => {
    const total = records.length;
    const pending = records.filter((r) => r.status === "pending").length;
    const approved = records.filter((r) => r.status === "approved").length;
    const rejected = records.filter((r) => r.status === "rejected").length;

    const totalAmount = records.reduce((acc, r) => acc + r.amount, 0);

    return { total, pending, approved, rejected, totalAmount };
  }, [records]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerId.trim() || !amount.trim()) {
      setMessage({
        text: "অনুগ্রহ করে কর্মী আইডি এবং টাকার পরিমাণ সঠিকভাবে লিখুন।",
        isError: true,
      });
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage({
        text: "টাকার পরিমাণ সঠিক হতে হবে।",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      setTimeout(() => {
        const newRecord: PayrollRecord = {
          workerId: workerId.trim(),
          amount: numericAmount,
          reason: reason.trim(),
          date: new Date().toISOString(),
          status: "pending",
        };

        setRecords((prev) => [newRecord, ...prev]);

        setMessage({
          text: "অগ্রিম বেতনের আবেদন সফলভাবে জমা হয়েছে।",
          isError: false,
        });

        setWorkerId("");
        setAmount("");
        setReason("");
        setLoading(false);
      }, 900);
    } catch {
      setMessage({
        text: "আবেদন প্রসেস করতে সমস্যা হয়েছে।",
        isError: true,
      });
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = filter === "all" ? true : r.status === filter;
      const matchSearch =
        r.workerId.toLowerCase().includes(search.toLowerCase()) ||
        r.reason?.toLowerCase().includes(search.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [records, filter, search]);

  const updateStatus = (index: number, status: PayrollRecord["status"]) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, status } : r))
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Advance Payroll Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enterprise-grade salary advance control system
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
          { label: "Amount", value: stats.totalAmount },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40"
          >
            <div className="text-xs text-slate-400">{s.label}</div>
            <div className="text-lg font-bold">{s.value}</div>
          </div>
        ))}
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm uppercase tracking-widest text-blue-400 mb-4">
            New Advance Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Worker ID"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none resize-none"
              rows={3}
            />

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 font-semibold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search worker / reason..."
              className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-auto">
            {filteredRecords.length === 0 ? (
              <div className="text-slate-500 text-sm">No records found</div>
            ) : (
              filteredRecords.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/40"
                >
                  <div className="flex justify-between">
                    <div className="font-semibold">{r.workerId}</div>
                    <div className="text-xs text-slate-400">{r.status}</div>
                  </div>

                  <div className="text-sm text-slate-300">
                    SAR {r.amount}
                  </div>

                  {r.reason && (
                    <div className="text-xs text-slate-500 mt-1">
                      {r.reason}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateStatus(i, "approved")}
                      className="text-xs px-2 py-1 rounded bg-emerald-500/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(i, "rejected")}
                      className="text-xs px-2 py-1 rounded bg-red-500/20"
                    >
                      Reject
                    </button>
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