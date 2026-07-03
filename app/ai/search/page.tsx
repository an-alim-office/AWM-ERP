"use client";

import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  PieChart,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ReportStatus = "Generated" | "Processing" | "Queued";

type ReportFormat = "PDF" | "XLSX" | "CSV";

interface ReportItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  format: ReportFormat;
  status: ReportStatus;
  size: string;
  aiScore: number;
}

type SortKey = "name" | "createdAt" | "aiScore";

type SortDirection = "asc" | "desc";

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
    aiScore: 98,
  },
  {
    id: "REP-1002",
    name: "HR Attendance Intelligence",
    type: "HR",
    createdAt: "2026-06-27",
    format: "XLSX",
    status: "Processing",
    size: "1.1 MB",
    aiScore: 91,
  },
  {
    id: "REP-1003",
    name: "AI Sales Forecast",
    type: "Prediction",
    createdAt: "2026-06-26",
    format: "PDF",
    status: "Generated",
    size: "3.9 MB",
    aiScore: 99,
  },
  {
    id: "REP-1004",
    name: "Inventory Risk Report",
    type: "Warehouse",
    createdAt: "2026-06-24",
    format: "CSV",
    status: "Queued",
    size: "870 KB",
    aiScore: 87,
  },
  {
    id: "REP-1005",
    name: "Retail Demand Projection",
    type: "Retail",
    createdAt: "2026-06-22",
    format: "PDF",
    status: "Generated",
    size: "4.2 MB",
    aiScore: 96,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ReportGeneratorAIPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [filter, setFilter] = useState<"All" | ReportStatus>("All");

  const [sortKey, setSortKey] =
    useState<SortKey>("createdAt");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredReports = useMemo(() => {
    const keyword =
      deferredSearch.toLowerCase();

    const filtered = REPORTS.filter(
      (report) => {
        const matchSearch =
          report.name
            .toLowerCase()
            .includes(keyword) ||
          report.type
            .toLowerCase()
            .includes(keyword) ||
          report.id
            .toLowerCase()
            .includes(keyword);

        const matchStatus =
          filter === "All"
            ? true
            : report.status === filter;

        return (
          matchSearch &&
          matchStatus
        );
      }
    );

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "name") {
        comparison =
          a.name.localeCompare(
            b.name
          );
      }

      if (
        sortKey === "createdAt"
      ) {
        comparison =
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime();
      }

      if (
        sortKey === "aiScore"
      ) {
        comparison =
          a.aiScore -
          b.aiScore;
      }

      return sortDirection ===
        "asc"
        ? comparison
        : -comparison;
    });

    return filtered;
  }, [
    deferredSearch,
    filter,
    sortKey,
    sortDirection,
  ]);

  const analytics = useMemo(() => {
    const generated =
      REPORTS.filter(
        (item) =>
          item.status ===
          "Generated"
      ).length;

    const processing =
      REPORTS.filter(
        (item) =>
          item.status ===
          "Processing"
      ).length;

    return {
      generated,
      processing,
      accuracy: "98.6%",
      exports: "24.8K",
      uptime: "99.99%",
    };
  }, []);

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

  const handleRefresh =
    useCallback(async () => {
      try {
        setRefreshing(true);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1200
            )
        );
      } finally {
        setRefreshing(false);
      }
    }, []);

  const toggleSort =
    useCallback(
      (key: SortKey) => {
        if (
          sortKey === key
        ) {
          setSortDirection(
            (prev) =>
              prev === "asc"
                ? "desc"
                : "asc"
          );

          return;
        }

        setSortKey(key);
        setSortDirection(
          "desc"
        );
      },
      [sortKey]
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)]" />

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/20 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
                <ShieldCheck size={14} />
                Enterprise AI Reporting
              </div>

              <h1 className="bg-gradient-to-r from-slate-900 via-cyan-700 to-blue-600 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-blue-300 md:text-5xl xl:text-6xl">
                Report Generator AI
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                AI-driven enterprise reporting, predictive analytics,
                realtime orchestration, autonomous exports and scalable
                business intelligence workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Financial Reports",
                  "AI Forecast",
                  "HR Analytics",
                  "Realtime Export",
                  "Predictive Insights",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:w-[620px]">
              <StatsCard
                title="Generated"
                value={String(
                  analytics.generated
                )}
                subtitle="AI Reports"
                icon={
                  <FileText size={20} />
                }
                color="cyan"
              />

              <StatsCard
                title="Accuracy"
                value={
                  analytics.accuracy
                }
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
                value={
                  analytics.exports
                }
                subtitle="Processed"
                icon={
                  <FileSpreadsheet
                    size={20}
                  />
                }
                color="emerald"
              />

              <StatsCard
                title="Uptime"
                value={
                  analytics.uptime
                }
                subtitle={
                  refreshing
                    ? "Syncing..."
                    : "Realtime Cloud"
                }
                icon={
                  <Activity
                    size={20}
                  />
                }
                color="amber"
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <GlassCard>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                    <Sparkles size={14} />
                    AI Workflow
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Autonomous Report Engine
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Smart analytics, predictive dashboards, AI
                    summarization, enterprise exports and realtime
                    orchestration pipeline.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={
                      handleRefresh
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-lg hover:shadow-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    <RefreshCcw
                      size={18}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Refresh
                  </button>

                  <button
                    onClick={
                      handleGenerate
                    }
                    disabled={
                      loading
                    }
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
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
              </div>

              {(loading ||
                refreshing) && (
                <div className="mt-6 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" />
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Generated Reports
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise reporting history & AI analytics
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
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
                      placeholder="Search reports..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
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
                      className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
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

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-slate-100/80 dark:bg-white/[0.04]">
                      <tr>
                        {[
                          {
                            label:
                              "Report",
                            key: "name",
                          },
                          {
                            label:
                              "Created",
                            key: "createdAt",
                          },
                          {
                            label:
                              "AI Score",
                            key: "aiScore",
                          },
                        ].map(
                          (
                            item
                          ) => (
                            <th
                              key={
                                item.label
                              }
                              className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                            >
                              <button
                                onClick={() =>
                                  toggleSort(
                                    item.key as SortKey
                                  )
                                }
                                className="inline-flex items-center gap-2 transition-all hover:text-cyan-600 dark:hover:text-cyan-300"
                              >
                                {
                                  item.label
                                }

                                <ArrowUpRight
                                  size={
                                    14
                                  }
                                  className={
                                    sortKey ===
                                    item.key
                                      ? "opacity-100"
                                      : "opacity-30"
                                  }
                                />
                              </button>
                            </th>
                          )
                        )}

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          Format
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          Size
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {!mounted ? (
                        Array.from({
                          length: 5,
                        }).map(
                          (
                            _,
                            index
                          ) => (
                            <SkeletonRow
                              key={
                                index
                              }
                            />
                          )
                        )
                      ) : filteredReports.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-20 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                                <Search
                                  size={
                                    28
                                  }
                                />
                              </div>

                              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                No Reports Found
                              </h3>

                              <p className="mt-2 text-sm text-slate-500">
                                Try changing search or filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map(
                          (
                            report
                          ) => (
                            <tr
                              key={
                                report.id
                              }
                              className="border-t border-slate-200/70 transition-all duration-300 hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-start gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                                    <FileBarChart2
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">
                                      {
                                        report.name
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        report.id
                                      }{" "}
                                      •{" "}
                                      {
                                        report.type
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <CalendarRange
                                    size={
                                      16
                                    }
                                  />
                                  {
                                    report.createdAt
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-700 dark:text-cyan-300">
                                  <Zap
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    report.aiScore
                                  }
                                  %
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
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

                                  <ActionButton
                                    icon={
                                      <MoreHorizontal
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
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-8">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Realtime business intelligence
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
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
                  title="AI Forecast"
                  value="96.8%"
                  subtitle="Prediction accuracy"
                  icon={
                    <BrainCircuit
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Auto Exports"
                  value="12 Pending"
                  subtitle="Background queue"
                  icon={
                    <Clock3
                      size={18}
                    />
                  }
                />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Workflow Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise orchestration
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <LayoutGrid
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "AI Data Collection",
                    progress:
                      "100%",
                  },
                  {
                    title:
                      "Prediction Engine",
                    progress:
                      "94%",
                  },
                  {
                    title:
                      "Realtime Rendering",
                    progress:
                      "87%",
                  },
                  {
                    title:
                      "Cloud Distribution",
                    progress:
                      "76%",
                  },
                ].map((item) => (
                  <PipelineCard
                    key={
                      item.title
                    }
                    title={
                      item.title
                    }
                    progress={
                      item.progress
                    }
                  />
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Enterprise Ready
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Optimized for enterprise-scale reporting,
                    predictive analytics, cloud-ready exports and
                    AI-powered realtime dashboard workflows.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <FeatureTag
                      icon={
                        <Sparkles
                          size={14}
                        />
                      }
                      label="AI Optimized"
                    />

                    <FeatureTag
                      icon={
                        <ShieldCheck
                          size={14}
                        />
                      }
                      label="Secure Export"
                    />

                    <FeatureTag
                      icon={
                        <CalendarClock
                          size={14}
                        />
                      }
                      label="Realtime Sync"
                    />
                  </div>
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
   COMPONENTS
========================================================= */

const GlassCard = memo(
  function GlassCard({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-[32px] border border-slate-200/70 bg-white/70 p-5 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-3xl transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] md:p-7">
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
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      violet:
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      emerald:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      amber:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };

    return (
      <div className="group rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl hover:shadow-slate-200/40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-cyan-500/10">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
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
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h4 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

const PipelineCard = memo(
  function PipelineCard({
    title,
    progress,
  }: {
    title: string;
    progress: string;
  }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {title}
          </p>

          <span className="text-xs font-black text-cyan-700 dark:text-cyan-300">
            {progress}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{
              width: progress,
            }}
          />
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
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      Processing:
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      Queued:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${styles[status]}`}
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
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300">
        {icon}
      </button>
    );
  }
);

const FeatureTag = memo(
  function FeatureTag({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {icon}
        {label}
      </div>
    );
  }
);

const SkeletonRow = memo(
  function SkeletonRow() {
    return (
      <tr className="border-t border-slate-200/70 dark:border-white/5">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <td
            key={index}
            className="px-5 py-5"
          >
            <div className="h-10 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          </td>
        ))}
      </tr>
    );
  }
);