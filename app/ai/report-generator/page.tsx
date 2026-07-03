"use client";

import React, {
  memo,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutDashboard,
  Loader2,
  PieChart,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ReportStatus =
  | "Generated"
  | "Processing"
  | "Queued";

interface ReportItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  format: string;
  status: ReportStatus;
  size: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const REPORTS: ReportItem[] = [
  {
    id: "REP-1001",
    name: "Enterprise Revenue Analysis",
    type: "Finance",
    createdAt: "2026-06-28",
    format: "PDF",
    status: "Generated",
    size: "2.4 MB",
  },
  {
    id: "REP-1002",
    name: "HR Attendance Intelligence",
    type: "HR",
    createdAt: "2026-06-27",
    format: "XLSX",
    status: "Processing",
    size: "1.1 MB",
  },
  {
    id: "REP-1003",
    name: "AI Sales Forecast",
    type: "Prediction",
    createdAt: "2026-06-26",
    format: "PDF",
    status: "Generated",
    size: "3.9 MB",
  },
  {
    id: "REP-1004",
    name: "Inventory Risk Report",
    type: "Warehouse",
    createdAt: "2026-06-24",
    format: "CSV",
    status: "Queued",
    size: "870 KB",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ReportGeneratorAIPage() {
  const [search, setSearch] =
    useState("");
  const [filter, setFilter] =
    useState<
      "All" | ReportStatus
    >("All");
  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     FILTERED DATA
  ========================================================= */

  const filteredReports =
    useMemo(() => {
      return REPORTS.filter(
        (report) => {
          const matchSearch =
            report.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            report.type
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchStatus =
            filter === "All"
              ? true
              : report.status ===
                filter;

          return (
            matchSearch &&
            matchStatus
          );
        }
      );
    }, [search, filter]);

  /* =========================================================
     AI GENERATION
  ========================================================= */

  const handleGenerate =
    useCallback(async () => {
      try {
        setLoading(true);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1800
            )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 text-slate-900 transition-colors duration-300 dark:from-[#020617] dark:via-[#071120] dark:to-[#020617] dark:text-white">
      <div className="mx-auto max-w-[1700px] p-4 md:p-6 xl:p-8">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_22%)]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">

            {/* LEFT */}

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300">
                <ShieldCheck size={14} />
                AI Enterprise Reporting
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl xl:text-6xl">
                Report Generator AI
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                Intelligent enterprise
                reporting system with
                predictive analytics,
                automated PDF/XLSX
                generation, real-time
                dashboard insights,
                AI-powered summarization,
                export automation and
                business intelligence.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Financial Reports",
                  "HR Analytics",
                  "Sales Forecast",
                  "Inventory Summary",
                  "Operational Insights",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4 xl:w-[560px]">

              <StatsCard
                title="Generated"
                value="1,284"
                subtitle="Reports"
                icon={
                  <FileText size={20} />
                }
                color="cyan"
              />

              <StatsCard
                title="AI Accuracy"
                value="98.2%"
                subtitle="Prediction"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="violet"
              />

              <StatsCard
                title="Exports"
                value="PDF/XLSX"
                subtitle="Supported"
                icon={
                  <FileSpreadsheet
                    size={20}
                  />
                }
                color="emerald"
              />

              <StatsCard
                title="System"
                value="Realtime"
                subtitle="Optimized"
                icon={
                  <Activity size={20} />
                }
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            DASHBOARD GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">

            {/* QUICK ACTION */}

            <GlassCard>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                    <Sparkles size={14} />
                    AI Automation
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Smart Report Engine
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Generate enterprise
                    reports with AI insights,
                    auto-summary,
                    forecasting intelligence,
                    financial analytics and
                    export-ready documents.
                  </p>
                </div>

                <button
                  onClick={
                    handleGenerate
                  }
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-6 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2
                        size={18}
                      />
                      Generate AI Report
                    </>
                  )}
                </button>
              </div>

              {loading && (
                <div className="mt-6 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400" />
                </div>
              )}
            </GlassCard>

            {/* REPORT TABLE */}

            <GlassCard>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Generated Reports
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI-powered reporting
                    history & analytics
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Search report..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={filter}
                      onChange={(e) =>
                        setFilter(
                          e.target
                            .value as
                            | "All"
                            | ReportStatus
                        )
                      }
                      className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition-all focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="All">
                        All
                      </option>

                      <option value="Generated">
                        Generated
                      </option>

                      <option value="Processing">
                        Processing
                      </option>

                      <option value="Queued">
                        Queued
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-100/70 dark:bg-white/[0.04]">
                      <tr>
                        {[
                          "Report",
                          "Type",
                          "Created",
                          "Format",
                          "Size",
                          "Status",
                          "Action",
                        ].map((item) => (
                          <th
                            key={item}
                            className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReports.map(
                        (
                          report
                        ) => (
                          <tr
                            key={
                              report.id
                            }
                            className="border-t border-slate-200/70 transition-all hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                          >
                            <td className="px-5 py-5">
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">
                                  {
                                    report.name
                                  }
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    report.id
                                  }
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                              {
                                report.type
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                              {
                                report.createdAt
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                              {
                                report.format
                              }
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                              {
                                report.size
                              }
                            </td>

                            <td className="px-5 py-5">
                              <StatusBadge
                                status={
                                  report.status
                                }
                              />
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2">
                                <ActionButton
                                  icon={
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  }
                                />

                                <ActionButton
                                  icon={
                                    <Download
                                      size={
                                        16
                                      }
                                    />
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="space-y-8">

            {/* INSIGHTS */}

            <GlassCard>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Smart business analytics
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                  <PieChart
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">

                <InsightCard
                  title="Revenue Growth"
                  value="+28.4%"
                  subtitle="Compared to last month"
                  icon={
                    <TrendingUp
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="AI Prediction"
                  value="96.7%"
                  subtitle="Forecast accuracy"
                  icon={
                    <BrainCircuit
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Export Queue"
                  value="12 Pending"
                  subtitle="Auto-processing active"
                  icon={
                    <Clock3
                      size={18}
                    />
                  }
                />
              </div>
            </GlassCard>

            {/* WORKFLOW */}

            <GlassCard>

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Workflow Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise automation
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <LayoutDashboard
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">

                {[
                  {
                    title:
                      "Data Collection",
                    progress: "100%",
                  },
                  {
                    title:
                      "AI Analytics",
                    progress: "92%",
                  },
                  {
                    title:
                      "PDF Rendering",
                    progress: "81%",
                  },
                  {
                    title:
                      "Cloud Export",
                    progress: "74%",
                  },
                ].map((item) => (
                  <div
                    key={
                      item.title
                    }
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {
                          item.title
                        }
                      </p>

                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300">
                        {
                          item.progress
                        }
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{
                          width:
                            item.progress,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* FOOTER */}

            <GlassCard>

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Enterprise Ready
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    AI-powered reporting
                    architecture optimized
                    for large-scale business
                    intelligence,
                    automated analytics,
                    export orchestration,
                    predictive reporting and
                    enterprise-grade
                    scalability.
                  </p>

                  <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-600 transition-all hover:gap-3 dark:text-cyan-300">
                    Explore AI Capabilities
                    <ArrowRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

const GlassCard = memo(
  function GlassCard({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-[30px] border border-slate-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] md:p-7">
        {children}
      </div>
    );
  }
);

const StatsCard = memo(
  function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color:
      | "cyan"
      | "violet"
      | "emerald"
      | "amber";
  }) {
    const colors = {
      cyan:
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
      violet:
        "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300",
      emerald:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
      amber:
        "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    };

    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    );
  }
);

const InsightCard = memo(
  function InsightCard({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h4 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: ReportStatus;
  }) {
    const styles = {
      Generated:
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300",
      Processing:
        "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-300",
      Queued:
        "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {status}
      </span>
    );
  }
);

const ActionButton = memo(
  function ActionButton({
    icon,
  }: {
    icon: React.ReactNode;
  }) {
    return (
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300">
        {icon}
      </button>
    );
  }
);