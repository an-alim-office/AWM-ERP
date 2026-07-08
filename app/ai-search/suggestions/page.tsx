"use client";

import React, {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Filter,
  Flame,
  Lightbulb,
  Mic2,
  Search,
  ShieldCheck,
  Sparkles,
  Stars,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SuggestionCategory =
  | "AI"
  | "Productivity"
  | "Workflow"
  | "Analytics";

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  trending: boolean;
  confidence: number;
  usage: string;
}

/* =========================================================
   DATA
========================================================= */

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "SG-1001",
    title: "Generate AI Finance Summary",
    description:
      "Create automated financial insights with predictive trend analysis.",
    category: "AI",
    trending: true,
    confidence: 98,
    usage: "24.8K",
  },
  {
    id: "SG-1002",
    title: "Smart Voice Workflow",
    description:
      "Control enterprise workflow using multilingual voice commands.",
    category: "Workflow",
    trending: true,
    confidence: 96,
    usage: "14.2K",
  },
  {
    id: "SG-1003",
    title: "Realtime KPI Tracker",
    description:
      "Monitor operational KPIs with AI-driven anomaly detection.",
    category: "Analytics",
    trending: false,
    confidence: 92,
    usage: "9.4K",
  },
  {
    id: "SG-1004",
    title: "Productivity Automation",
    description:
      "Automate repetitive business tasks with adaptive AI logic.",
    category: "Productivity",
    trending: true,
    confidence: 97,
    usage: "18.1K",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function SuggestionsPage() {
  const [search, setSearch] =
    useState("");

  const deferredSearch =
    useDeferredValue(search);

  const [category, setCategory] =
    useState<
      "All" | SuggestionCategory
    >("All");

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSuggestions =
    useMemo(() => {
      return SUGGESTIONS.filter(
        (item) => {
          const keyword =
            deferredSearch.toLowerCase();

          const matchSearch =
            item.title
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword);

          const matchCategory =
            category === "All"
              ? true
              : item.category ===
                category;

          return (
            matchSearch &&
            matchCategory
          );
        }
      );
    }, [
      deferredSearch,
      category,
    ]);

  const analytics =
    useMemo(() => {
      return {
        total:
          SUGGESTIONS.length,
        trending:
          SUGGESTIONS.filter(
            (item) =>
              item.trending
          ).length,
        avgConfidence:
          "95.7%",
        automation:
          "99.2%",
      };
    }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%),#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_24%),#020617] dark:text-white">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">

            <div className="max-w-3xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                <Sparkles size={14} />
                Smart AI Suggestions
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl xl:text-6xl">
                Search Suggestions
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                AI-powered intelligent
                search assistance with
                predictive recommendation
                engine, workflow guidance,
                automation intelligence and
                enterprise productivity
                optimization.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "AI Prediction",
                  "Realtime Suggestion",
                  "Smart Workflow",
                  "Voice Trigger",
                  "Automation",
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

            <div className="grid grid-cols-2 gap-4 xl:w-[580px]">

              <StatsCard
                title="Suggestions"
                value={String(
                  analytics.total
                )}
                subtitle="AI Generated"
                icon={
                  <Lightbulb
                    size={20}
                  />
                }
                color="cyan"
              />

              <StatsCard
                title="Trending"
                value={String(
                  analytics.trending
                )}
                subtitle="Popular"
                icon={
                  <Flame size={20} />
                }
                color="amber"
              />

              <StatsCard
                title="Accuracy"
                value={
                  analytics.avgConfidence
                }
                subtitle="AI Confidence"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="violet"
              />

              <StatsCard
                title="Automation"
                value={
                  analytics.automation
                }
                subtitle="Workflow AI"
                icon={
                  <Zap size={20} />
                }
                color="emerald"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <section className="mt-8">

          <GlassCard>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Intelligent Suggestion
                  Engine
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Advanced enterprise AI
                  recommendation system
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
                        e.target.value
                      )
                    }
                    placeholder="Search intelligent suggestions..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target
                          .value as
                          | "All"
                          | SuggestionCategory
                      )
                    }
                    className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  >
                    <option value="All">
                      All
                    </option>

                    <option value="AI">
                      AI
                    </option>

                    <option value="Workflow">
                      Workflow
                    </option>

                    <option value="Analytics">
                      Analytics
                    </option>

                    <option value="Productivity">
                      Productivity
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* =====================================================
                GRID
            ===================================================== */}

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              {!mounted ? (
                Array.from({
                  length: 4,
                }).map((_, index) => (
                  <SuggestionSkeleton
                    key={index}
                  />
                ))
              ) : filteredSuggestions.length ===
                0 ? (
                <div className="col-span-full flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 text-center dark:border-white/10 dark:bg-white/[0.03]">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-200 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                    <Search size={28} />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    No Suggestions Found
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Try searching with a
                    different keyword or
                    category filter.
                  </p>
                </div>
              ) : (
                filteredSuggestions.map(
                  (item) => (
                    <SuggestionCard
                      key={item.id}
                      item={item}
                    />
                  )
                )
              )}
            </div>
          </GlassCard>
        </section>

        {/* =====================================================
            FOOTER GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-3">

          <FeaturePanel
            title="Voice AI"
            value="Enabled"
            icon={
              <Mic2 size={22} />
            }
            description="Realtime multilingual voice interaction and enterprise workflow command system."
          />

          <FeaturePanel
            title="Enterprise Security"
            value="Protected"
            icon={
              <ShieldCheck
                size={22}
              />
            }
            description="Advanced AI access validation, activity monitoring and secure automation pipeline."
          />

          <FeaturePanel
            title="Predictive Engine"
            value="Realtime"
            icon={
              <Stars size={22} />
            }
            description="Context-aware recommendation engine with enterprise-grade predictive intelligence."
          />
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

const SuggestionCard = memo(
  function SuggestionCard({
    item,
  }: {
    item: SuggestionItem;
  }) {
    return (
      <div className="group relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-[4px] hover:border-cyan-400/30 dark:border-white/10 dark:bg-white/[0.04]">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                <Wand2 size={22} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  {item.trending && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                      <TrendingUp
                        size={10}
                      />
                      Trending
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300">
              <ArrowUpRight
                size={18}
              />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-700 dark:text-cyan-300">
              <Zap size={12} />
              {item.confidence}%
              Confidence
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-700 dark:text-violet-300">
              <Sparkles
                size={12}
              />
              {item.category}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <Clock3 size={12} />
              {item.usage}
              Usage
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"
              style={{
                width: `${item.confidence}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

const FeaturePanel = memo(
  function FeaturePanel({
    title,
    value,
    icon,
    description,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
  }) {
    return (
      <div className="rounded-[30px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-[3px] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            {icon}
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
          <CheckCircle2
            size={14}
          />
          Enterprise Active
        </div>
      </div>
    );
  }
);

const SuggestionSkeleton = memo(
  function SuggestionSkeleton() {
    return (
      <div className="rounded-[30px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">

        <div className="h-6 w-1/2 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-5 h-4 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-3 h-4 w-4/5 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-8 flex gap-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }
);