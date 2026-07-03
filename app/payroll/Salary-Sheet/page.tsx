"use client";

import React, { useMemo, useState } from "react";

type SalaryStatus = "Paid" | "Pending";

type SalaryRecord = {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  month: string;
  baseSalary: number;
  allowance: number;
  deductions: number;
  status: SalaryStatus;
};

export default function SalarySheetPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("2026-05");
  const [status, setStatus] = useState<"All" | SalaryStatus>("All");

  const [records] = useState<SalaryRecord[]>([
    {
      id: "SAL-001",
      employeeId: "W101",
      name: "John Doe",
      department: "Operations",
      month: "2026-05",
      baseSalary: 5000,
      allowance: 1000,
      deductions: 300,
      status: "Paid",
    },
    {
      id: "SAL-002",
      employeeId: "W102",
      name: "Ali Khan",
      department: "HR",
      month: "2026-05",
      baseSalary: 4500,
      allowance: 800,
      deductions: 500,
      status: "Pending",
    },
    {
      id: "SAL-003",
      employeeId: "W103",
      name: "Sara Ahmed",
      department: "Finance",
      month: "2026-05",
      baseSalary: 6000,
      allowance: 1200,
      deductions: 700,
      status: "Paid",
    },
  ]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const net = r.baseSalary + r.allowance - r.deductions;

      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());

      const matchMonth = r.month === month;

      const matchStatus = status === "All" ? true : r.status === status;

      return matchSearch && matchMonth && matchStatus && net >= 0;
    });
  }, [records, search, month, status]);

  const stats = useMemo(() => {
    const totalNet = filtered.reduce(
      (acc, r) => acc + (r.baseSalary + r.allowance - r.deductions),
      0
    );

    const paid = filtered
      .filter((r) => r.status === "Paid")
      .reduce((acc, r) => acc + (r.baseSalary + r.allowance - r.deductions), 0);

    const pending = filtered
      .filter((r) => r.status === "Pending")
      .reduce((acc, r) => acc + (r.baseSalary + r.allowance - r.deductions), 0);

    return { totalNet, paid, pending };
  }, [filtered]);

  const exportCSV = () => {
    const header = [
      "Employee ID",
      "Name",
      "Department",
      "Base",
      "Allowance",
      "Deductions",
      "Net",
      "Status",
    ];

    const rows = filtered.map((r) => [
      r.employeeId,
      r.name,
      r.department,
      r.baseSalary,
      r.allowance,
      r.deductions,
      r.baseSalary + r.allowance - r.deductions,
      r.status,
    ]);

    const csv = [header, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-sheet-${month}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Salary Sheet Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time payroll computation & salary analytics
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="mt-3 md:mt-0 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 font-semibold active:scale-95 transition"
        >
          Export CSV
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee..."
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none"
        />

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="p-3 rounded-xl bg-slate-950 border border-slate-800 outline-none"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Records</div>
          <div className="text-lg font-bold text-blue-400">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400 uppercase">Total Net</div>
          <div className="text-lg font-bold text-blue-400">
            SAR {stats.totalNet.toLocaleString()}
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
                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Dept</th>
                <th className="p-4 text-left">Base</th>
                <th className="p-4 text-left">Allowance</th>
                <th className="p-4 text-left">Deductions</th>
                <th className="p-4 text-left">Net</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No salary records found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const net =
                    r.baseSalary + r.allowance - r.deductions;

                  return (
                    <tr
                      key={r.id}
                      className="border-t border-slate-800 hover:bg-slate-950/40 transition"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-blue-400">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.employeeId}
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">
                        {r.department}
                      </td>

                      <td className="p-4">{r.baseSalary}</td>
                      <td className="p-4 text-emerald-400">
                        {r.allowance}
                      </td>
                      <td className="p-4 text-red-400">
                        {r.deductions}
                      </td>

                      <td className="p-4 font-bold text-blue-400">
                        {net}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            r.status === "Paid"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}