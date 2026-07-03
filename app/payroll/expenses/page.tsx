"use client";

import React, { useEffect, useMemo, useState } from "react";

type ExpenseStatus = "Pending" | "Approved" | "Rejected";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
};

const INITIAL_DATA: Expense[] = [
  {
    id: "EXP-001",
    category: "Travel",
    description: "Business trip to Dubai",
    amount: 2500,
    date: "2026-06-25",
    status: "Approved",
  },
  {
    id: "EXP-002",
    category: "Office",
    description: "Stationery supplies",
    amount: 150,
    date: "2026-06-27",
    status: "Pending",
  },
];

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ExpensesPage() {
  const [mounted, setMounted] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_DATA);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ExpenseStatus>("all");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const total = expenses.length;
    const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
    const pending = expenses.filter((e) => e.status === "Pending").length;
    const approved = expenses.filter((e) => e.status === "Approved").length;

    return { total, totalAmount, pending, approved };
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());

      const matchFilter = filter === "all" ? true : e.status === filter;

      return matchSearch && matchFilter;
    });
  }, [expenses, search, filter]);

  const addExpense = () => {
    const amt = Number(form.amount);

    if (!form.category || !form.description || !amt || amt <= 0) return;

    const newExpense: Expense = {
      id: `EXP-${Math.floor(Math.random() * 9000) + 1000}`,
      category: form.category,
      description: form.description,
      amount: amt,
      date: form.date || new Date().toISOString().slice(0, 10),
      status: "Pending",
    };

    setExpenses((prev) => [newExpense, ...prev]);

    setForm({ category: "", description: "", amount: "", date: "" });
    setShowForm(false);
  };

  const updateStatus = (id: string, status: ExpenseStatus) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Expense Management System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise financial tracking & approval workflow
          </p>
        </div>

        <button
          onClick={() => setShowForm((p) => !p)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-sm font-semibold"
        >
          {showForm ? "Close Form" : "+ New Expense"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total</div>
          <div className="text-lg font-bold">{stats.total}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Amount</div>
          <div className="text-lg font-bold text-cyan-400">
            SAR {stats.totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Pending</div>
          <div className="text-lg font-bold text-amber-400">
            {stats.pending}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Approved</div>
          <div className="text-lg font-bold text-emerald-400">
            {stats.approved}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="flex-1 p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="p-3 rounded-lg bg-slate-950 border border-slate-800"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="mb-6 p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
            Create Expense
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              placeholder="Category"
              className="p-3 rounded-lg bg-slate-950 border border-slate-800"
            />

            <input
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              placeholder="Amount"
              className="p-3 rounded-lg bg-slate-950 border border-slate-800"
            />

            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 md:col-span-2"
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800"
            />
          </div>

          <button
            onClick={addExpense}
            className="mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 font-semibold"
          >
            Save Expense
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-widest">
          Expense Records
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-slate-800 hover:bg-slate-950/40"
                >
                  <td className="p-3 text-blue-400">{e.id}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3 text-slate-300">{e.description}</td>
                  <td className="p-3 text-cyan-400">
                    SAR {e.amount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        STATUS_STYLES[e.status]
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(e.id, "Approved")}
                      className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(e.id, "Rejected")}
                      className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={6}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}