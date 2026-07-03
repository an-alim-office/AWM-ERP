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
  CheckCircle2,
  Clock3,
  Cpu,
  Eye,
  FileSearch,
  Filter,
  Globe2,
  Layers3,
  Loader2,
  Radar,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ResultStatus =
  | "Indexed"
  | "Processing"
  | "Archived";

type ResultPriority =
  | "High"
  | "Medium"
  | "Low";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  source: string;
  searchedAt: string;
  status: ResultStatus;
  priority: ResultPriority;
  confidence: number;
  latency: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: "SR-1001",
    title: "Enterprise Payroll Analytics",
    category: "HR",
    source: "Internal AI Index",
    searchedAt: "2026-06-28",
    status: "Indexed",
    priority: "High",
    confidence: 98,
    latency: "0.4s",
  },
  {
    id: "SR-1002",
    title: "Realtime Financial Insights",
    category: "Finance",
    source: "Cloud Sync Engine",
    searchedAt: "2026-06-27",
    status: "Processing",
    priority: "Medium",
    confidence: 92,
    latency: "1.1s",
  },
  {
    id: "SR-1003",
    title: "Inventory Forecast Prediction",
    category: "Warehouse",
    source: "AI Neural Layer",
    searchedAt: "2026-06-26",
    status: "Indexed",
    priority: "High",
    confidence: 99,
    latency: "0.6s",
  },
  {
    id: "SR-1004",
    title: "Retail Demand Intelligence",
    category: "Retail",
    source: "Predictive Cluster",
    searchedAt: "2026-06-24",
    status: "Archived",
    priority: "Low",
    confidence: 86,
    latency: "1.8s",
  },
  {
    id: "SR-1005",
    title: "Customer Behaviour Signals",
    category: "CRM",
    source: "Realtime Event Grid",
    searchedAt: "2026-06-22",
    status: "Indexed",
    priority: "High",
    confidence: 96,
    latency: "0.5s",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ResultsPage() {
  const [search, setSearch] =
    useState("");

  const deferredSearch =
    useDeferredValue(search);

  const [filter, setFilter] =
    useState<
      "All" | ResultStatus
    >("All");

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredResults =
    useMemo(() => {
      return SEARCH_RESULTS.filter(
        (item) => {
          const keyword =
            deferredSearch.toLowerCase();

          const matchSearch =
            item.title
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
        indexed:
          SEARCH_RESULTS.filter(
            (item) =>
              item.status ===
              "Indexed"
          ).length,
        accuracy: "99.1%",
        queries: "28.4K",
        latency: "0.6s",
      };
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

  const handleSync =
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.10),transparent_25%),#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_25%),#020617] dark:text-white">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">

            <div className="max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">
                <Sparkles size={14} />
                Smart Search Intelligence
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl xl:text-6xl">
                Search Results AI
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                AI-powered enterprise
                search ecosystem with
                realtime indexing,
                predictive ranking,
                contextual intelligence,
                ultra-fast discovery and
                advanced analytics.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Realtime Search",
                  "AI Ranking",
                  "Neural Matching",
                  "Smart Filter",
                  "Enterprise Insights",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-sky-400 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-sky-400/30 dark:hover:bg-sky-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:w-[580px]">

              <StatsCard
                title="Indexed"
                value={String(
                  analytics.indexed
                )}
                subtitle="AI Results"
                icon={
                  <FileSearch
                    size={20}
                  />
                }
                color="sky"
              />

              <StatsCard
                title="Accuracy"
                value={
                  analytics.accuracy
                }
                subtitle="Search Engine"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="violet"
              />

              <StatsCard
                title="Queries"
                value={
                  analytics.queries
                }
                subtitle="Processed"
                icon={
                  <Radar
                    size={20}
                  />
                }
                color="emerald"
              />

              <StatsCard
                title="Latency"
                value={
                  analytics.latency
                }
                subtitle="Realtime Speed"
                icon={
                  <Zap size={20} />
                }
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">

          {/* LEFT */}

          <div className="space-y-8">

            <GlassCard>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                    <Cpu size={14} />
                    AI Search Engine
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Intelligent Discovery
                    Pipeline
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Neural search,
                    predictive matching,
                    intelligent ranking and
                    enterprise-scale
                    realtime indexing with
                    optimized cloud
                    orchestration.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={
                      handleRefresh
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-sky-400 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-sky-400/30 dark:hover:bg-sky-500/10"
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
                      handleSync
                    }
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                        />
                        Smart Sync
                      </>
                    )}
                  </button>
                </div>
              </div>

              {(loading ||
                refreshing) && (
                <div className="mt-6 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />
                </div>
              )}
            </GlassCard>

            {/* TABLE */}

            <GlassCard>

              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Search Results
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI indexed enterprise
                    search data
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
                      placeholder="Search results..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
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
                            | ResultStatus
                        )
                      }
                      className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-sky-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="All">
                        All
                      </option>

                      <option value="Indexed">
                        Indexed
                      </option>

                      <option value="Processing">
                        Processing
                      </option>

                      <option value="Archived">
                        Archived
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 dark:border-white/10">
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[980px]">

                    <thead className="bg-slate-100/80 dark:bg-white/[0.04]">
                      <tr>

                        {[
                          "Result",
                          "Source",
                          "Confidence",
                          "Latency",
                          "Priority",
                          "Status",
                          "Action",
                        ].map(
                          (item) => (
                            <th
                              key={item}
                              className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                            >
                              <div className="inline-flex items-center gap-2">
                                {item}

                                <ArrowUpRight
                                  size={14}
                                  className="opacity-40"
                                />
                              </div>
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
                      ) : filteredResults.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-20 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">

                              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                                <Search
                                  size={28}
                                />
                              </div>

                              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                No Results Found
                              </h3>

                              <p className="mt-2 text-sm text-slate-500">
                                Try changing
                                search keyword
                                or filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredResults.map(
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

                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                                    <Layers3
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">
                                      {
                                        item.title
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        item.id
                                      }{" "}
                                      •{" "}
                                      {
                                        item.category
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Globe2
                                    size={
                                      16
                                    }
                                  />
                                  {
                                    item.source
                                  }
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
                                  <Zap
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    item.confidence
                                  }
                                  %
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {
                                  item.latency
                                }
                              </td>

                              <td className="px-5 py-5">
                                <PriorityBadge
                                  priority={
                                    item.priority
                                  }
                                />
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge
                                  status={
                                    item.status
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
                                      <Activity
                                        size={
                                          16
                                        }
                                      />
                                    }
                                  />

                                  <ActionButton
                                    icon={
                                      <ShieldCheck
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

          {/* RIGHT */}

          <div className="space-y-8">

            <GlassCard>

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Realtime neural
                    analytics
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <BrainCircuit
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">

                <InsightCard
                  title="AI Match Rate"
                  value="98.8%"
                  subtitle="Neural search accuracy"
                  icon={
                    <Sparkles
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Realtime Index"
                  value="12.8K"
                  subtitle="Indexed this hour"
                  icon={
                    <Radar
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Active Queries"
                  value="1.4K"
                  subtitle="Running globally"
                  icon={
                    <TrendingUp
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
                    System Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Smart orchestration
                    engine
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <Cpu size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-4">

                {[
                  {
                    title:
                      "Neural Search Layer",
                    progress:
                      "100%",
                  },
                  {
                    title:
                      "Realtime Indexing",
                    progress:
                      "93%",
                  },
                  {
                    title:
                      "AI Ranking Engine",
                    progress:
                      "88%",
                  },
                  {
                    title:
                      "Cloud Sync Grid",
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
                    Enterprise Search
                    Ready
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Optimized for
                    enterprise-scale
                    intelligent discovery,
                    realtime indexing,
                    predictive ranking and
                    AI-powered global
                    search operations.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <FeatureTag
                      icon={
                        <Sparkles
                          size={14}
                        />
                      }
                      label="AI Powered"
                    />

                    <FeatureTag
                      icon={
                        <ShieldCheck
                          size={14}
                        />
                      }
                      label="Secure Search"
                    />

                    <FeatureTag
                      icon={
                        <Clock3
                          size={14}
                        />
                      }
                      label="Realtime Index"
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
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] md:p-7">
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
      | "sky"
      | "violet"
      | "emerald"
      | "amber";
  }) {
    const colors = {
      sky: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
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

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
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

          <span className="text-xs font-black text-sky-700 dark:text-sky-300">
            {progress}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
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
    status: ResultStatus;
  }) {
    const styles = {
      Indexed:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      Processing:
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      Archived:
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

const PriorityBadge = memo(
  function PriorityBadge({
    priority,
  }: {
    priority: ResultPriority;
  }) {
    const styles = {
      High: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      Medium:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      Low: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[priority]}`}
      >
        {priority}
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
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-sky-400/30 dark:hover:bg-sky-500/10 dark:hover:text-sky-300">
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