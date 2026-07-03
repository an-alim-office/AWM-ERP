"use client";

import React, {
  memo,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Filter,
  Layers3,
  Loader2,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users2,
} from "lucide-react";

type Advancement = {
  id: string;
  name: string;
  department: string;
  cycle: string;
  type: string;
  newGrade: string;
  score: string;
};

const advancementData: Advancement[] = [
  {
    id: "ADV-201",
    name: "Ahmed Mansoor",
    department: "Operations",
    cycle: "Q2 2026",
    type: "Promotion & Raise",
    newGrade: "Grade 9",
    score: "94%",
  },
  {
    id: "ADV-202",
    name: "Youssef Al-Harbi",
    department: "Technical Support",
    cycle: "Q2 2026",
    type: "Annual Increment",
    newGrade: "Grade 6",
    score: "88%",
  },
  {
    id: "ADV-203",
    name: "Fahad Mustafa",
    department: "Logistics Management",
    cycle: "Q1 2026",
    type: "Promotion",
    newGrade: "Grade 8",
    score: "91%",
  },
  {
    id: "ADV-204",
    name: "Tariq Abdulaziz",
    department: "Security & Gates",
    cycle: "Q1 2026",
    type: "Skill Badge Upgrade",
    newGrade: "Grade 4",
    score: "85%",
  },
];

const stats = {
  totalPromotions: 34,
  salaryIncrements: 88,
  gradeUpgrades: 42,
  totalAdvancements: 164,
};

function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className={cn(
          "absolute inset-0 opacity-80 blur-3xl transition-all duration-500 group-hover:scale-110",
          gradient
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-4 text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500">
            <TrendingUp className="h-3.5 w-3.5" />
            {subtitle}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800 shadow-lg dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
});

const SkeletonRow = memo(function SkeletonRow() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent dark:via-white/10" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-zinc-200 dark:bg-white/10" />
          <div className="h-6 w-48 rounded-xl bg-zinc-200 dark:bg-white/10" />
          <div className="h-4 w-64 rounded-xl bg-zinc-200 dark:bg-white/10" />
        </div>

        <div className="flex gap-3">
          <div className="h-12 w-24 rounded-2xl bg-zinc-200 dark:bg-white/10" />
          <div className="h-12 w-24 rounded-2xl bg-zinc-200 dark:bg-white/10" />
          <div className="h-12 w-36 rounded-2xl bg-zinc-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
});

export default function Page() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] = useState("");

  const [filter, setFilter] =
    useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const filteredAdvancements = useMemo(() => {
    return advancementData.filter((adv) => {
      const matchesSearch =
        adv.name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        adv.department
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        adv.id
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesFilter =
        filter === "ALL"
          ? true
          : adv.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [query, filter]);

  const topPerformer = useMemo(() => {
    return [...advancementData].sort(
      (a, b) =>
        Number.parseInt(b.score) -
        Number.parseInt(a.score)
    )[0];
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-500 dark:from-[#030712] dark:via-[#07111f] dark:to-[#040816] dark:text-white">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)]" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Advancement Intelligence
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Staff Advancement Count
              </h1>

              <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                AI-powered workforce advancement
                analytics dashboard for enterprise
                employee promotions, salary
                increments, KPI evaluations, skill
                growth tracking, and performance-based
                grade progression monitoring.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:min-w-[520px]">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    Cycle
                  </span>
                </div>

                <p className="mt-3 text-lg font-black">
                  Q2 2026
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    Compliance
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-emerald-500">
                  99.8%
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    AI Accuracy
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-cyan-500">
                  97.4%
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Award className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    Workforce
                  </span>
                </div>

                <p className="mt-3 text-lg font-black text-violet-500">
                  Elite
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Advancements"
            value={stats.totalAdvancements}
            subtitle="Enterprise growth"
            icon={<Layers3 className="h-6 w-6" />}
            gradient="bg-blue-500/10"
          />

          <MetricCard
            title="Rank Promotions"
            value={stats.totalPromotions}
            subtitle="Promotion ratio increased"
            icon={<Trophy className="h-6 w-6" />}
            gradient="bg-emerald-500/10"
          />

          <MetricCard
            title="Salary Increments"
            value={stats.salaryIncrements}
            subtitle="Compensation optimization"
            icon={<TrendingUp className="h-6 w-6" />}
            gradient="bg-amber-500/10"
          />

          <MetricCard
            title="Grade Upgrades"
            value={stats.gradeUpgrades}
            subtitle="Skill matrix evolved"
            icon={<Medal className="h-6 w-6" />}
            gradient="bg-violet-500/10"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-5 border-b border-zinc-200/70 p-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Advancement Evaluation Ledger
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Workforce Advancement Matrix
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Intelligent employee advancement
                  tracking, promotion analysis, and
                  KPI-based growth monitoring system.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search employee..."
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white sm:w-[260px]"
                  />
                </div>

                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value)
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white sm:w-[220px]"
                  >
                    <option value="ALL">
                      All Advancement Types
                    </option>

                    <option value="Promotion">
                      Promotion
                    </option>

                    <option value="Promotion & Raise">
                      Promotion & Raise
                    </option>

                    <option value="Annual Increment">
                      Annual Increment
                    </option>

                    <option value="Skill Badge Upgrade">
                      Skill Badge Upgrade
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5">
              <Suspense fallback={null}>
                {!mounted ? (
                  <div className="space-y-4">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAdvancements.map(
                      (advancement) => (
                        <div
                          key={advancement.id}
                          className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-zinc-50/70 p-5 transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_24%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                                <span className="text-xs font-black tracking-[0.18em] text-blue-500">
                                  {advancement.id}
                                </span>
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-black tracking-tight">
                                    {advancement.name}
                                  </h3>

                                  <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500">
                                    <BadgeCheck className="h-3 w-3" />
                                    Verified
                                  </div>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                                  <div className="inline-flex items-center gap-2">
                                    <Users2 className="h-4 w-4" />
                                    {
                                      advancement.department
                                    }
                                  </div>

                                  <span className="h-1 w-1 rounded-full bg-zinc-400" />

                                  <div className="inline-flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    {
                                      advancement.cycle
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                  KPI Matrix
                                </p>

                                <h4 className="mt-2 text-xl font-black text-emerald-500">
                                  {advancement.score}
                                </h4>
                              </div>

                              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                  Target Scale
                                </p>

                                <h4 className="mt-2 text-xl font-black text-violet-500">
                                  {
                                    advancement.newGrade
                                  }
                                </h4>
                              </div>

                              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                                  Advancement Type
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-3">
                                  <span className="text-sm font-black text-blue-500">
                                    {
                                      advancement.type
                                    }
                                  </span>

                                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </Suspense>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                  <Star className="h-3.5 w-3.5" />
                  Top Performer
                </div>

                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {topPerformer.name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {
                        topPerformer.department
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 rounded-[1.8rem] border border-zinc-200/70 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Performance Score
                      </p>

                      <h3 className="mt-2 text-4xl font-black text-emerald-500">
                        {topPerformer.score}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      label:
                        "Promotion approval completed",
                      time: "2 mins ago",
                    },
                    {
                      label:
                        "KPI recalibration synced",
                      time: "15 mins ago",
                    },
                    {
                      label:
                        "Salary matrix optimized",
                      time: "28 mins ago",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                      <div>
                        <p className="text-sm font-semibold">
                          {item.label}
                        </p>

                        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                          {item.time}
                        </span>
                      </div>

                      <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    AI Insights
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight">
                    Advancement Forecast
                  </h2>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  {
                    title:
                      "Promotion Velocity",
                    value: "84%",
                  },
                  {
                    title:
                      "Retention Stability",
                    value: "92%",
                  },
                  {
                    title:
                      "Skill Evolution",
                    value: "88%",
                  },
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {metric.title}
                      </p>

                      <span className="text-sm font-black text-blue-500">
                        {metric.value}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                      <div
                        style={{
                          width: metric.value,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-violet-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.8rem] border border-dashed border-blue-500/20 bg-blue-500/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-blue-500">
                      AI Recommendation
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Workforce performance indicators
                      suggest a 14% increase in
                      advancement opportunities for the
                      next evaluation cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}