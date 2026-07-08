"use client";

import React, { useMemo, useState } from "react";

interface DepartmentBreakdown {
  dept: string;
  total: number;
  status: "Processed" | "Pending Approval";
}

interface SalaryReportData {
  month: string;
  summary: {
    totalStaff: number;
    paidStaff: number;
    unpaidStaff: number;
    totalBaseSalary: number;
    totalOvertime: number;
    totalDeductions: number;
    netPayout: number;
  };
  departmentBreakdown: DepartmentBreakdown[];
}

const summarySkeleton = Array.from({ length: 4 });

export default function SalaryReportPage() {
  const [reportYearMonth, setReportYearMonth] = useState("2026-05");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [salaryReportData, setSalaryReportData] =
    useState<SalaryReportData | null>(null);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setSalaryReportData(null);

    setTimeout(() => {
      setSalaryReportData({
        month: reportYearMonth,
        summary: {
          totalStaff: 150,
          paidStaff: 142,
          unpaidStaff: 8,
          totalBaseSalary: 410000,
          totalOvertime: 45000,
          totalDeductions: 18000,
          netPayout: 437000,
        },
        departmentBreakdown: [
          {
            dept: "Construction",
            total: 245000,
            status: "Processed",
          },
          {
            dept: "Engineering",
            total: 112000,
            status: "Processed",
          },
          {
            dept: "Logistics",
            total: 80000,
            status: "Pending Approval",
          },
          {
            dept: "Procurement",
            total: 52000,
            status: "Processed",
          },
        ],
      });

      setIsGenerating(false);
    }, 1200);
  };

  const filteredDepartments = useMemo(() => {
    if (!salaryReportData) return [];

    return salaryReportData.departmentBreakdown.filter((item) =>
      item.dept.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [salaryReportData, searchQuery]);

  const paymentCompletion = useMemo(() => {
    if (!salaryReportData) return 0;

    return Math.round(
      (salaryReportData.summary.paidStaff /
        salaryReportData.summary.totalStaff) *
        100
    );
  }, [salaryReportData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 text-slate-900 transition-colors duration-300 dark:from-[#020617] dark:via-[#071127] dark:to-[#020817] dark:text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%)]" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-blue-600 dark:text-blue-300">
                ENTERPRISE PAYROLL ANALYTICS
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Salary Report Center
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  AI-powered payroll intelligence, department expense analytics,
                  payout monitoring and workforce compensation overview.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Payroll Accuracy",
                  value: "99.8%",
                },
                {
                  label: "Auto Processed",
                  value: "91%",
                },
                {
                  label: "Pending Review",
                  value: "08",
                },
                {
                  label: "Compliance",
                  value: "PASS",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>

                  <h3 className="mt-2 text-lg font-black">{item.value}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleGenerateReport}
          className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Salary Cycle Month
            </label>

            <input
              type="month"
              value={reportYearMonth}
              onChange={(e) => setReportYearMonth(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none ring-0 transition-all duration-300 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)] dark:border-white/10 dark:bg-[#0f172a]/80 dark:text-white"
              required
            />
          </div>

          <div className="lg:col-span-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Search Department
            </label>

            <input
              type="text"
              placeholder="Search department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-all duration-300 focus:border-violet-500 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)] dark:border-white/10 dark:bg-[#0f172a]/80 dark:text-white"
            />
          </div>

          <div className="flex items-end lg:col-span-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Processing Payroll Intelligence...
                </div>
              ) : (
                "Generate Salary Report"
              )}
            </button>
          </div>
        </form>

        {/* Loading */}
        {isGenerating && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summarySkeleton.map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-3xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
                  <div className="mt-5 h-8 w-36 rounded bg-slate-200 dark:bg-white/10" />
                  <div className="mt-6 h-2 w-full rounded bg-slate-200 dark:bg-white/10" />
                </div>
              ))}
            </div>

            <div className="animate-pulse rounded-3xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-5 h-5 w-48 rounded bg-slate-200 dark:bg-white/10" />

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-14 rounded-2xl bg-slate-200 dark:bg-white/10"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data */}
        {salaryReportData && !isGenerating && (
          <div className="space-y-6 animate-[fadeIn_.4s_ease]">
            {/* KPI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Net Payroll Payout",
                  value: `${salaryReportData.summary.netPayout.toLocaleString()} SAR`,
                  description: "Total distributed payroll amount",
                  accent:
                    "from-blue-500/20 to-indigo-500/5 border-blue-500/20",
                },
                {
                  title: "Base Salary",
                  value: `${salaryReportData.summary.totalBaseSalary.toLocaleString()} SAR`,
                  description: "Core compensation expense",
                  accent:
                    "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
                },
                {
                  title: "Overtime Bonus",
                  value: `+${salaryReportData.summary.totalOvertime.toLocaleString()} SAR`,
                  description: "Additional overtime payout",
                  accent:
                    "from-amber-500/20 to-orange-500/5 border-amber-500/20",
                },
                {
                  title: "Deductions",
                  value: `-${salaryReportData.summary.totalDeductions.toLocaleString()} SAR`,
                  description: "Late & policy deductions",
                  accent:
                    "from-red-500/20 to-rose-500/5 border-red-500/20",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${card.accent} p-5 shadow-sm backdrop-blur-xl dark:bg-white/[0.04]`}
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative z-10">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {card.title}
                    </span>

                    <h3 className="mt-4 text-2xl font-black tracking-tight">
                      {card.value}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Payment Completion
                      </p>

                      <h3 className="mt-3 text-4xl font-black">
                        {paymentCompletion}%
                      </h3>
                    </div>

                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/10">
                      <svg
                        className="absolute inset-0 h-full w-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-200 dark:text-white/10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={251.2}
                          strokeDashoffset={
                            251.2 - (251.2 * paymentCompletion) / 100
                          }
                          className="text-blue-500 transition-all duration-700"
                        />
                      </svg>

                      <span className="text-sm font-black">
                        {paymentCompletion}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {[
                      {
                        label: "Total Staff",
                        value: salaryReportData.summary.totalStaff,
                      },
                      {
                        label: "Paid Staff",
                        value: salaryReportData.summary.paidStaff,
                      },
                      {
                        label: "Pending Salary",
                        value: salaryReportData.summary.unpaidStaff,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {item.label}
                        </span>

                        <span className="text-lg font-black">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="xl:col-span-8">
                <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-black">
                        Department Payroll Distribution
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Salary cycle: {salaryReportData.month}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Payroll Status Synced
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-100/80 dark:bg-white/[0.03]">
                        <tr>
                          {[
                            "Department",
                            "Payout",
                            "Status",
                            "Distribution",
                          ].map((head) => (
                            <th
                              key={head}
                              className="px-6 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredDepartments.map((row, index) => {
                          const percentage = Math.round(
                            (row.total /
                              salaryReportData.summary.netPayout) *
                              100
                          );

                          return (
                            <tr
                              key={`${row.dept}-${index}`}
                              className="border-t border-slate-200/70 transition-all duration-300 hover:bg-slate-50/80 dark:border-white/10 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-6 py-5">
                                <div>
                                  <p className="font-bold">{row.dept}</p>

                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Enterprise payroll division
                                  </p>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <div className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                                  {row.total.toLocaleString()} SAR
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                                    row.status === "Processed"
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  }`}
                                >
                                  <span className="h-2 w-2 rounded-full bg-current" />
                                  {row.status === "Processed"
                                    ? "Processed"
                                    : "Pending Approval"}
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span>{percentage}%</span>

                                    <span className="text-slate-500 dark:text-slate-400">
                                      Allocation
                                    </span>
                                  </div>

                                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-700"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredDepartments.length === 0 && (
                      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                            />
                          </svg>
                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                          No Department Found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Try searching with another department keyword.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Overview */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {[
                {
                  title: "AI Payroll Insight",
                  text: "Construction department consumed highest salary allocation this cycle.",
                },
                {
                  title: "Financial Recommendation",
                  text: "Optimize overtime hours in Logistics to reduce monthly payout variance.",
                },
                {
                  title: "Compliance Status",
                  text: "Payroll processing is compliant with internal audit & workforce policy.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                    {item.title}
                  </div>

                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}