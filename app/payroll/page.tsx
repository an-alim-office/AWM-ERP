'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  Download,
  Activity,
  Database,
  Sparkles,
  RefreshCw
} from "lucide-react";

import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface Employee {
  id: string;
  name: string;
  basic: number;
  allowance: number;
  absent: number;
  late: number;
  overtime: number;
  hourlyRate: number;
  advance: number;
  bonus: number;
  gross?: number;
  net?: string;
  status: "PENDING" | "PROCESSED";
}

export default function IntegratedPayrollSystem() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "employees" | "audit">("dashboard");
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("payroll_data");

    setEmployees(
      saved
        ? JSON.parse(saved)
        : [
            {
              id: "101",
              name: "Rahim Ahmed",
              basic: 50000,
              allowance: 5000,
              absent: 0,
              late: 0,
              overtime: 5,
              hourlyRate: 200,
              advance: 0,
              bonus: 2000,
              status: "PENDING",
            },
            {
              id: "102",
              name: "Sara Khan",
              basic: 42000,
              allowance: 4500,
              absent: 1,
              late: 2,
              overtime: 3,
              hourlyRate: 180,
              advance: 1000,
              bonus: 1500,
              status: "PENDING",
            },
          ]
    );
  }, []);

  const addLog = (msg: string) =>
    setAuditLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev,
    ]);

  const processPayroll = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      const updated = employees.map((emp) => {
        const gross = emp.basic + emp.allowance;
        const deductions =
          (emp.basic / 30) * emp.absent + emp.late * 50 + emp.advance;
        const earnings = emp.overtime * emp.hourlyRate + emp.bonus;
        const net = gross + earnings - deductions;

        return {
          ...emp,
          gross,
          net: net.toFixed(2),
          status: "PROCESSED" as const,
        };
      });

      setEmployees(updated);
      localStorage.setItem("payroll_data", JSON.stringify(updated));
      addLog("Payroll engine executed (batch processed).");
      setLoading(false);
    }, 900);
  }, [employees]);

  const chartData = useMemo(
    () =>
      employees.map((e) => ({
        name: e.name,
        salary: Number(e.net || e.basic),
      })),
    [employees]
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Report (Enterprise)", 20, 12);

    // @ts-ignore
    doc.autoTable({
      head: [["Employee", "Gross", "Net", "Status"]],
      body: employees.map((e) => [
        e.name,
        e.gross ?? "-",
        e.net ?? "-",
        e.status,
      ]),
    });

    doc.save("payroll_report.pdf");
    addLog("PDF exported successfully.");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#020617] via-[#050b1a] to-[#020617] text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950/80 border-r border-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10">
          <Briefcase className="text-indigo-400" />
          <h1 className="text-xl font-bold text-indigo-300">PayrollPro X</h1>
        </div>

        <nav className="space-y-3">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "employees", label: "Employees", icon: Users },
            { id: "audit", label: "Audit Logs", icon: Shield },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-white/5 text-slate-300"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-slate-400">System Status</div>
          <div className="flex items-center gap-2 mt-2 text-emerald-400 text-sm">
            <Activity size={16} /> Online Engine
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-400" /> Analytics Dashboard
              </h2>

              <button
                onClick={processPayroll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Database size={16} />
                )}
                Run Engine
              </button>
            </div>

            <div className="h-[420px] bg-white/5 border border-white/10 rounded-3xl p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="salary" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* EMPLOYEES */}
        {activeTab === "employees" && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between mb-6">
              <button
                onClick={processPayroll}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                {loading ? "Processing..." : "Calculate Batch"}
              </button>

              <button
                onClick={exportPDF}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                <Download size={16} /> Export PDF
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Gross</th>
                  <th className="p-4 text-left">Net</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="p-4 font-semibold">{e.name}</td>
                    <td className="p-4">{e.gross ?? "-"}</td>
                    <td className="p-4 text-indigo-400 font-bold">
                      {e.net ?? "-"}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg text-xs bg-slate-800">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AUDIT */}
        {activeTab === "audit" && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="font-bold mb-4">Audit Logs</h2>

            {auditLogs.length === 0 ? (
              <p className="text-slate-500 text-sm">No logs found</p>
            ) : (
              <div className="space-y-2 text-sm">
                {auditLogs.map((log, i) => (
                  <div
                    key={i}
                    className="border-b border-white/5 pb-2 text-slate-300"
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}