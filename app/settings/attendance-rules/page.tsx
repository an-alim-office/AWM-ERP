"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CloudCog,
  Fingerprint,
  Loader2,
  MoonStar,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TimerReset,
  TrendingUp,
  Users2,
  Workflow,
} from "lucide-react";

type ShiftPolicy = {
  id: string;
  department: string;
  shift: string;
  grace: number;
  lateLimit: number;
  status: "ACTIVE" | "SYNCING";
};

const shiftPolicies: ShiftPolicy[] = [
  {
    id: "ATT-001",
    department: "Corporate HQ",
    shift: "08:00 AM - 05:00 PM",
    grace: 15,
    lateLimit: 3,
    status: "ACTIVE",
  },
  {
    id: "ATT-002",
    department: "Operations",
    shift: "09:00 AM - 06:00 PM",
    grace: 10,
    lateLimit: 2,
    status: "ACTIVE",
  },
  {
    id: "ATT-003",
    department: "Remote Workforce",
    shift: "Flexible",
    grace: 20,
    lateLimit: 5,
    status: "SYNCING",
  },
];

function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

function MetricCard({
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
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="h-6 w-48 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-24 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function AttendanceRulesPage() {
  const [shiftStart, setShiftStart] =
    useState("08:00");

  const [shiftEnd, setShiftEnd] =
    useState("17:00");

  const [gracePeriod, setGracePeriod] =
    useState<number>(15);

  const [allowLateCount, setAllowLateCount] =
    useState<number>(3);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState({
    text: "",
    isError: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleRulesSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    setMessage({
      text: "",
      isError: false,
    });

    setTimeout(() => {
      setLoading(false);

      setMessage({
        text: "Attendance policy configuration successfully synchronized across enterprise workforce systems.",
        isError: false,
      });
    }, 1200);
  };

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  const filteredPolicies = useMemo(() => {
    return shiftPolicies.filter((policy) => {
      return (
        policy.department
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        policy.shift
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0a1020] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Workforce Automation
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Attendance Rules
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Intelligent attendance governance,
                AI-powered punctuality management,
                biometric-ready workforce scheduling, and
                enterprise-grade attendance automation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Sync Policies
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <ShieldCheck className="h-4 w-4" />
                AI Attendance Active
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Active Employees"
            value="2,482"
            subtitle="Realtime workforce tracking"
            icon={<Users2 className="h-5 w-5" />}
          />

          <MetricCard
            title="Attendance Accuracy"
            value="99.97%"
            subtitle="AI attendance verification"
            icon={<Fingerprint className="h-5 w-5" />}
          />

          <MetricCard
            title="Late Detection"
            value="Realtime"
            subtitle="Automated violation monitoring"
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          <MetricCard
            title="Cloud Sync"
            value="24/7"
            subtitle="Global attendance replication"
            icon={<CloudCog className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.82fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Smart Attendance Policy Engine
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure enterprise shift timing,
                  intelligent grace logic, and automated
                  attendance compliance controls.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Workforce sync operational
              </div>
            </div>

            <Suspense fallback={null}>
              {pageLoading ? (
                <div className="mt-6 space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <>
                  {message.text && (
                    <div
                      className={cn(
                        "mt-6 flex items-start gap-3 rounded-[1.5rem] border p-4 text-sm transition-all duration-300",
                        message.isError
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <div>
                        <h4 className="font-bold">
                          Policy Updated
                        </h4>

                        <p className="mt-1 text-xs opacity-90">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleRulesSubmit}
                    className="mt-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Shift Start Time
                        </label>

                        <div className="relative">
                          <SunMedium className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="time"
                            value={shiftStart}
                            onChange={(e) =>
                              setShiftStart(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Shift End Time
                        </label>

                        <div className="relative">
                          <MoonStar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="time"
                            value={shiftEnd}
                            onChange={(e) =>
                              setShiftEnd(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Grace Period (Minutes)
                        </label>

                        <div className="relative">
                          <TimerReset className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            value={gracePeriod || ""}
                            onChange={(e) =>
                              setGracePeriod(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            min="0"
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Max Allowed Late Days
                        </label>

                        <div className="relative">
                          <BellRing className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            value={allowLateCount || ""}
                            onChange={(e) =>
                              setAllowLateCount(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            min="0"
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-dashed border-cyan-500/20 bg-cyan-500/5 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-500">
                            <Workflow className="h-3.5 w-3.5" />
                            Smart Policy Overview
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            Employees checking in after the
                            configured grace period will be
                            automatically marked as{" "}
                            <strong>Late</strong>. Once the
                            maximum monthly late threshold
                            is exceeded, automated payroll
                            deduction and compliance
                            escalation workflows will be
                            activated.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Grace
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {gracePeriod}m
                            </h4>
                          </div>

                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Max Late
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {allowLateCount}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <CalendarClock className="h-4 w-4" />
                        View Logs
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating Rules...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Update Rules
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                  <Activity className="h-3.5 w-3.5" />
                  AI Workforce Insights
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Attendance Intelligence
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Predictive attendance analytics,
                  behavioral punctuality scoring, and
                  automated workforce optimization powered
                  by enterprise AI infrastructure.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Compliance Score
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        98.8%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <AlarmClock className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Department Policies
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Multi-department attendance matrix
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search department..."
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="rounded-[1.5rem] border border-zinc-200/70 bg-zinc-50/70 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          {policy.department}
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {policy.shift}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                          policy.status === "ACTIVE"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {policy.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Grace
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.grace}m
                        </h5>
                      </div>

                      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Late Limit
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.lateLimit}
                        </h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  Workforce synchronization active
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Attendance Events
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Realtime workforce activity feed
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "AI late detection threshold updated",
                    time: "10 seconds ago",
                  },
                  {
                    title:
                      "Biometric attendance sync completed",
                    time: "2 minutes ago",
                  },
                  {
                    title:
                      "Payroll deduction workflow activated",
                    time: "7 minutes ago",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {event.time}
                      </p>
                    </div>

                    <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />

                  <div>
                    <h4 className="text-sm font-bold">
                      Smart Payroll Integration
                    </h4>

                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Attendance rules are directly linked
                      with payroll deduction and HR
                      compliance automation engines.
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