"use client";

import React, { useMemo, useState } from "react";

type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  note: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
};

export default function BankingPage() {
  const [balance, setBalance] = useState<number>(125000);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState<
    "all" | "credit" | "debit" | "completed" | "pending" | "failed"
  >("all");

  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const totalCredit = transactions
      .filter((t) => t.type === "credit")
      .reduce((a, b) => a + b.amount, 0);

    const totalDebit = transactions
      .filter((t) => t.type === "debit")
      .reduce((a, b) => a + b.amount, 0);

    return {
      totalCredit,
      totalDebit,
      net: totalCredit - totalDebit,
      count: transactions.length,
    };
  }, [transactions]);

  const addTransaction = (type: "credit" | "debit") => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    setLoading(true);

    setTimeout(() => {
      const tx: Transaction = {
        id: crypto.randomUUID(),
        type,
        amount: amt,
        note,
        timestamp: Date.now(),
        status: "completed",
      };

      setTransactions((prev) => [tx, ...prev]);

      setBalance((prev) =>
        type === "credit" ? prev + amt : prev - amt
      );

      setAmount("");
      setNote("");
      setLoading(false);
    }, 800);
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.note.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all"
          ? true
          : filter === "credit" || filter === "debit"
          ? t.type === filter
          : t.status === filter;

      return matchSearch && matchFilter;
    });
  }, [transactions, filter, search]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Enterprise Banking System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time ledger, transactions & balance control
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Balance</div>
          <div className="text-lg font-bold text-emerald-400">
            SAR {balance.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Credit</div>
          <div className="text-lg font-bold text-blue-400">
            {stats.totalCredit}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Debit</div>
          <div className="text-lg font-bold text-red-400">
            {stats.totalDebit}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Net Flow</div>
          <div className="text-lg font-bold text-cyan-400">
            {stats.net}
          </div>
        </div>
      </div>

      {/* ACTION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
            New Transaction
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => addTransaction("credit")}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 disabled:opacity-50"
            >
              Credit
            </button>

            <button
              onClick={() => addTransaction("debit")}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 disabled:opacity-50"
            >
              Debit
            </button>
          </div>
        </div>

        {/* SEARCH / FILTER */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none mb-3"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
          >
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
        <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-4">
          Transaction Ledger
        </h2>

        <div className="space-y-3 max-h-[420px] overflow-auto">
          {filtered.length === 0 ? (
            <div className="text-slate-500 text-sm">No transactions found</div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-semibold">{t.note || "No note"}</div>
                  <div className="text-xs text-slate-500">
                    {t.id.slice(0, 8)} • {new Date(t.timestamp).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`text-sm font-bold ${
                    t.type === "credit" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"} SAR {t.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}