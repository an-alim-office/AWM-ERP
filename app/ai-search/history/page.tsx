"use client";

import React, {
  memo,
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
  CheckCircle2,
  Clock3,
  Command,
  Filter,
  Globe2,
  History,
  Layers3,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User2,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SearchStatus =
  | "Completed"
  | "AI Processed"
  | "Realtime";

type SearchCategory =
  | "Analytics"
  | "HR"
  | "Finance"
  | "Inventory"
  | "Voice AI";

interface SearchHistoryItem {
  id: string;
  query: string;
  category: SearchCategory;
  status: SearchStatus;
  searchedBy: string;
  timestamp: string;
  aiConfidence: number;
  executionTime: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const SEARCH_HISTORY: SearchHistoryItem[] =
  [
    {
      id: "SRH-1001",
      query:
        "AI payroll prediction analytics",
      category: "Finance",
      status: "AI Processed",
      searchedBy: "Admin",
      timestamp:
        "2026-06-29 09:14 AM",
      aiConfidence: 98,
      executionTime: "0.42s",
    },
    {
      id: "SRH-1002",
      query:
        "Realtime employee attendance",
      category: "HR",
      status: "Completed",
      searchedBy: "HR Manager",
      timestamp:
        "2026-06-29 08:46 AM",
      aiConfidence: 94,
      executionTime: "0.31s",
    },
    {
      id: "SRH-1003",
      query:
        "Warehouse inventory risk",
      category: "Inventory",
      status: "Realtime",
      searchedBy: "Supervisor",
      timestamp:
        "2026-06-29 08:20 AM",
      aiConfidence: 96,
      executionTime: "0.28s",
    },
    {
      id: "SRH-1004",
      query:
        "Voice command AI logs",
      category: "Voice AI",
      status: "Completed",
      searchedBy: "System",
      timestamp:
        "2026-06-28 11:30 PM",
      aiConfidence: 92,
      executionTime: "0.52s",
    },
    {
      id: "SRH-1005",
      query:
        "Enterprise sales forecast",
      category: "Analytics",
      status: "AI Processed",
      searchedBy: "Director",
      timestamp:
        "2026-06-28 09:42 PM",
      aiConfidence: 99,
      executionTime: "0.37s",
    },
  ];

/* =========================================================
   PAGE
========================================================= */

export default function HistoryPage() {
  const [search, setSearch] =
    useState("");

  const deferredSearch =
    useDeferredValue(search);

  const [filter, setFilter] =
    useState<
      "All" | SearchStatus
    >("All");

  const [mounted, setMounted] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHistory =
    useMemo(() => {
      return SEARCH_HISTORY.filter(
        (item) => {
          const keyword =
            deferredSearch.toLowerCase();

          const matchSearch =
            item.query
              .toLowerCase()
              .includes(keyword) ||
            item.category
              .toLowerCase()
              .includes(keyword) ||
            item.id
              .toLowerCase()
              .includes(keyword);

          const matchFilter =
            filter === "All"
              ? true
              : item.status ===
                filter;

          return (
            matchSearch &&
            matchFilter
          );
        }
      );
    }, [
      deferredSearch,
      filter,
    ]);

  const analytics =
    useMemo(() => {
      return {
        searches: "24.8K",
        aiAccuracy: "98.7%",
        realtime: "99.9%",
        execution: "0.31s",
      };
    }, []);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1200
          )
      );

      setRefreshing(false);
    };

  const handleClear =
    async () => {
      setLoading(true);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1400
          )
      );

      setLoading(false);
    };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_24%),#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_24%),#020617] dark:text-white">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[38px] border border-slate-200/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT */}

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
                <Sparkles size={14} />
                Enterprise Search Analytics
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl xl:text-6xl">
                Search History Intelligence
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                Advanced enterprise-level search history management with AI-powered analytics, realtime query tracking, smart monitoring and secure operational insights.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "AI Search Logs",
                  "Realtime Monitoring",
                  "Advanced Analytics",
                  "Enterprise Tracking",
                  "Secure Activity",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4 xl:w-[580px]">
              <StatsCard
                title="Total Searches"
                value={
                  analytics.searches
                }
                subtitle="Enterprise Queries"
                icon={
                  <Search
                    size={20}
                  />
                }
                color="cyan"
              />

              <StatsCard
                title="AI Accuracy"
                value={
                  analytics.aiAccuracy
                }
                subtitle="Smart Detection"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="violet"
              />

              <StatsCard
                title="Realtime"
                value={
                  analytics.realtime
                }
                subtitle="Cloud Sync"
                icon={
                  <Globe2
                    size={20}
                  />
                }
                color="emerald"
              />

              <StatsCard
                title="Execution"
                value={
                  analytics.execution
                }
                subtitle="Average Speed"
                icon={
                  <Zap
                    size={20}
                  />
                }
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT */}

          <div className="space-y-8">
            {/* ACTION BAR */}

            <GlassCard>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                    <Activity size={14} />
                    Realtime Activity
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Smart Search Tracking
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Monitor enterprise-level search activity, AI-driven query insights and realtime operational history with advanced analytics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={
                      handleRefresh
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
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
                      handleClear
                    }
                    disabled={
                      loading
                    }
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2
                          size={18}
                        />
                        Clear History
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

            {/* TABLE */}

            <GlassCard>
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Search Logs
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise search history monitoring
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  {/* SEARCH */}

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Search history..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>

                  {/* FILTER */}

                  <div className="relative">
                    <Filter
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={filter}
                      onChange={(
                        e
                      ) =>
                        setFilter(
                          e.target
                            .value as
                            | "All"
                            | SearchStatus
                        )
                      }
                      className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="All">
                        All
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="AI Processed">
                        AI Processed
                      </option>

                      <option value="Realtime">
                        Realtime
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE */}

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px]">
                    <thead className="bg-slate-100/80 dark:bg-white/[0.04]">
                      <tr>
                        {[
                          "Query",
                          "Category",
                          "User",
                          "Timestamp",
                          "AI Confidence",
                          "Execution",
                          "Status",
                        ].map(
                          (
                            item
                          ) => (
                            <th
                              key={
                                item
                              }
                              className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                            >
                              {item}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {!mounted ? (
                        Array.from({
                          length: 4,
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
                      ) : filteredHistory.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-20 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                                <History
                                  size={
                                    28
                                  }
                                />
                              </div>

                              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                No Search History
                              </h3>

                              <p className="mt-2 text-sm text-slate-500">
                                No matching search activity found.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                              className="border-t border-slate-200/70 transition-all duration-300 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-start gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                                    <Search
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">
                                      {
                                        item.query
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        item.id
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-700 dark:text-blue-300">
                                  <Layers3
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    item.category
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <User2
                                    size={
                                      16
                                    }
                                  />
                                  {
                                    item.searchedBy
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <CalendarClock
                                    size={
                                      16
                                    }
                                  />
                                  {
                                    item.timestamp
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-700 dark:text-cyan-300">
                                  <BrainCircuit
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    item.aiConfidence
                                  }
                                  %
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {
                                  item.executionTime
                                }
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge
                                  status={
                                    item.status
                                  }
                                />
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

          {/* RIGHT */}

          <div className="space-y-8">
            {/* AI INSIGHTS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Search Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Smart query intelligence
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <BrainCircuit
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InsightCard
                  title="Search Growth"
                  value="+28.4%"
                  subtitle="Compared to last week"
                  icon={
                    <TrendingUp
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Realtime Tracking"
                  value="99.9%"
                  subtitle="Cloud synchronization"
                  icon={
                    <Activity
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="AI Suggestions"
                  value="12.4K"
                  subtitle="Generated recommendations"
                  icon={
                    <Command
                      size={18}
                    />
                  }
                />
              </div>
            </GlassCard>

            {/* PIPELINE */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Search Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise orchestration
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                  <ShieldCheck
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "AI Query Parsing",
                    progress:
                      "100%",
                  },
                  {
                    title:
                      "Realtime Indexing",
                    progress:
                      "95%",
                  },
                  {
                    title:
                      "Enterprise Sync",
                    progress:
                      "90%",
                  },
                  {
                    title:
                      "Cloud Security",
                    progress:
                      "88%",
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

            {/* FOOTER */}

            <GlassCard>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Enterprise Monitoring
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Fully optimized for enterprise-level search tracking, AI query analytics, secure realtime history management and scalable operational intelligence.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <FeatureTag
                      icon={
                        <Sparkles
                          size={14}
                        />
                      }
                      label="AI Tracking"
                    />

                    <FeatureTag
                      icon={
                        <ShieldCheck
                          size={14}
                        />
                      }
                      label="Secure Monitoring"
                    />

                    <FeatureTag
                      icon={
                        <Clock3
                          size={14}
                        />
                      }
                      label="Realtime Engine"
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
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] md:p-7">
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
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.04]">
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
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
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
    status: SearchStatus;
  }) {
    const styles = {
      Completed:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      "AI Processed":
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      Realtime:
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
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