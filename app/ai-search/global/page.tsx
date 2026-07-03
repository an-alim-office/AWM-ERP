"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Blocks,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Command,
  Cpu,
  Globe2,
  Layers3,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
  WalletCards,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface DashboardMetric {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
  color:
    | "blue"
    | "emerald"
    | "violet"
    | "amber";
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const METRICS: DashboardMetric[] = [
  {
    title: "Active Workforce",
    value: "12,480",
    growth: "+12.8%",
    icon: <Users2 size={20} />,
    color: "blue",
  },
  {
    title: "Enterprise Revenue",
    value: "$4.8M",
    growth: "+18.4%",
    icon: <WalletCards size={20} />,
    color: "emerald",
  },
  {
    title: "AI Automation",
    value: "96.8%",
    growth: "+8.1%",
    icon: <BrainCircuit size={20} />,
    color: "violet",
  },
  {
    title: "System Uptime",
    value: "99.99%",
    growth: "Stable",
    icon: <ShieldCheck size={20} />,
    color: "amber",
  },
];

const ACTIVITIES: ActivityItem[] = [
  {
    id: "ACT-1001",
    title: "Payroll AI Processed",
    description:
      "Automated payroll workflow completed successfully.",
    time: "2 min ago",
  },
  {
    id: "ACT-1002",
    title: "HR Analytics Updated",
    description:
      "Realtime workforce insights synchronized.",
    time: "8 min ago",
  },
  {
    id: "ACT-1003",
    title: "Inventory Forecast Ready",
    description:
      "AI prediction engine generated inventory projection.",
    time: "12 min ago",
  },
  {
    id: "ACT-1004",
    title: "Voice AI Activated",
    description:
      "Enterprise voice-command orchestration connected.",
    time: "20 min ago",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics =
    useMemo(() => {
      return {
        employees: "12.4K",
        departments: "42",
        automations: "184",
        reports: "24.8K",
      };
    }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)]" />

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[42px] border border-white/20 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            {/* LEFT */}

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
                <Sparkles size={14} />
                Enterprise Workforce Platform
              </div>

              <h1 className="bg-gradient-to-r from-slate-900 via-blue-700 to-cyan-600 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-blue-200 dark:to-cyan-300 md:text-5xl xl:text-7xl">
                AWM Workforce ERP
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                Advanced all-in-one enterprise workforce management,
                AI-driven business automation, realtime analytics,
                predictive operations and scalable ERP orchestration.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "AI Automation",
                  "Realtime Analytics",
                  "ERP Intelligence",
                  "Workforce Control",
                  "Cloud Native",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                <MiniStat
                  title="Employees"
                  value={
                    analytics.employees
                  }
                />

                <MiniStat
                  title="Departments"
                  value={
                    analytics.departments
                  }
                />

                <MiniStat
                  title="Automations"
                  value={
                    analytics.automations
                  }
                />

                <MiniStat
                  title="Reports"
                  value={
                    analytics.reports
                  }
                />
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4 xl:w-[620px]">
              {METRICS.map((item) => (
                <StatsCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  growth={item.growth}
                  icon={item.icon}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT */}

          <div className="space-y-8">
            {/* OVERVIEW */}

            <GlassCard>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                    <Cpu size={14} />
                    Smart Operations
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Enterprise Intelligence Hub
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Unified workforce management, AI-driven analytics,
                    realtime automation, enterprise reporting and cloud
                    infrastructure orchestration.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    icon={
                      <Activity
                        size={18}
                      />
                    }
                    label="Realtime Sync"
                  />

                  <PrimaryButton
                    icon={
                      <Zap size={18} />
                    }
                    label="Launch AI Engine"
                  />
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                <OverviewCard
                  title="AI Workforce"
                  value="Operational"
                  icon={
                    <BrainCircuit
                      size={20}
                    />
                  }
                  color="blue"
                />

                <OverviewCard
                  title="Cloud Infrastructure"
                  value="Realtime"
                  icon={
                    <Globe2
                      size={20}
                    />
                  }
                  color="emerald"
                />

                <OverviewCard
                  title="Automation Status"
                  value="Active"
                  icon={
                    <Command
                      size={20}
                    />
                  }
                  color="violet"
                />
              </div>
            </GlassCard>

            {/* MODULES */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Enterprise Modules
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI-powered business ecosystem
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  <Blocks size={24} />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title:
                      "Human Resources",
                    icon: (
                      <Users2
                        size={22}
                      />
                    ),
                  },
                  {
                    title:
                      "Finance & Payroll",
                    icon: (
                      <WalletCards
                        size={22}
                      />
                    ),
                  },
                  {
                    title:
                      "Inventory System",
                    icon: (
                      <Layers3
                        size={22}
                      />
                    ),
                  },
                  {
                    title:
                      "AI Reporting",
                    icon: (
                      <LineChart
                        size={22}
                      />
                    ),
                  },
                  {
                    title:
                      "Business Analytics",
                    icon: (
                      <BarChart3
                        size={22}
                      />
                    ),
                  },
                  {
                    title:
                      "Enterprise Control",
                    icon: (
                      <Building2
                        size={22}
                      />
                    ),
                  },
                ].map((item) => (
                  <ModuleCard
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                  />
                ))}
              </div>
            </GlassCard>

            {/* ACTIVITY */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Realtime Activities
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Live enterprise operational feed
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Activity size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {!mounted
                  ? Array.from({
                      length: 4,
                    }).map(
                      (
                        _,
                        index
                      ) => (
                        <SkeletonCard
                          key={
                            index
                          }
                        />
                      )
                    )
                  : ACTIVITIES.map(
                      (
                        item
                      ) => (
                        <ActivityCard
                          key={
                            item.id
                          }
                          title={
                            item.title
                          }
                          description={
                            item.description
                          }
                          time={
                            item.time
                          }
                        />
                      )
                    )}
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
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Realtime intelligence analytics
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
                  title="AI Efficiency"
                  value="96.8%"
                  subtitle="Operational accuracy"
                  icon={
                    <Cpu size={18} />
                  }
                />

                <InsightCard
                  title="Cloud Stability"
                  value="99.99%"
                  subtitle="Infrastructure uptime"
                  icon={
                    <ShieldCheck
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
                    System Pipeline
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise orchestration workflow
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                  <BriefcaseBusiness
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Realtime Data Sync",
                    progress:
                      "100%",
                  },
                  {
                    title:
                      "AI Automation",
                    progress:
                      "94%",
                  },
                  {
                    title:
                      "Analytics Processing",
                    progress:
                      "88%",
                  },
                  {
                    title:
                      "Cloud Distribution",
                    progress:
                      "79%",
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
                    Enterprise Ready Platform
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Optimized for enterprise-scale workforce operations,
                    AI automation, cloud-native infrastructure and
                    high-performance business intelligence workflows.
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
                      label="Enterprise Security"
                    />

                    <FeatureTag
                      icon={
                        <Clock3
                          size={14}
                        />
                      }
                      label="Realtime Infrastructure"
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
    growth,
    icon,
    color,
  }: {
    title: string;
    value: string;
    growth: string;
    icon: React.ReactNode;
    color:
      | "blue"
      | "emerald"
      | "violet"
      | "amber";
  }) {
    const colors = {
      blue:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      emerald:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      violet:
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      amber:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };

    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl hover:shadow-slate-200/40 dark:border-white/10 dark:bg-white/[0.04]">
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

        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ArrowUpRight
            size={12}
          />
          {growth}
        </div>
      </div>
    );
  }
);

const MiniStat = memo(
  function MiniStat({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h4 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {value}
        </h4>
      </div>
    );
  }
);

const OverviewCard = memo(
  function OverviewCard({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color:
      | "blue"
      | "emerald"
      | "violet";
  }) {
    const styles = {
      blue:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      emerald:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      violet:
        "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    };

    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h4 className="mt-3 text-xl font-black text-slate-900 dark:text-white">
              {value}
            </h4>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[color]}`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

const ModuleCard = memo(
  function ModuleCard({
    title,
    icon,
  }: {
    title: string;
    icon: React.ReactNode;
  }) {
    return (
      <div className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[3px] hover:border-blue-400 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-400/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
          {icon}
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enterprise-grade scalable module infrastructure.
        </p>
      </div>
    );
  }
);

const ActivityCard = memo(
  function ActivityCard({
    title,
    description,
    time,
  }: {
    title: string;
    description: string;
    time: string;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <Activity size={20} />
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white">
                {title}
              </h4>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
            {time}
          </span>
        </div>
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

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
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
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
            style={{
              width: progress,
            }}
          />
        </div>
      </div>
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

const ActionButton = memo(
  function ActionButton({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) {
    return (
      <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10">
        {icon}
        {label}
      </button>
    );
  }
);

const PrimaryButton = memo(
  function PrimaryButton({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) {
    return (
      <button className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
        {icon}
        {label}
      </button>
    );
  }
);

const SkeletonCard = memo(
  function SkeletonCard() {
    return (
      <div className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
    );
  }
);