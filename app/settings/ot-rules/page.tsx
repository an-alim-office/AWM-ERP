"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Flame,
  GaugeCircle,
  Hourglass,
  Loader2,
  MoonStar,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sunrise,
  TimerReset,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type OTRule = {
  id: string;
  department: string;
  regularRate: string;
  holidayRate: string;
  limit: string;
  status: "ACTIVE" | "PENDING";
};

const otPolicies: OTRule[] = [
  {
    id: "OT-001",
    department: "Corporate Operations",
    regularRate: "1.5x",
    holidayRate: "2.0x",
    limit: "4h",
    status: "ACTIVE",
  },
  {
    id: "OT-002",
    department: "Construction Division",
    regularRate: "2.0x",
    holidayRate: "2.5x",
    limit: "6h",
    status: "ACTIVE",
  },
  {
    id: "OT-003",
    department: "Remote Workforce",
    regularRate: "1.2x",
    holidayRate: "1.8x",
    limit: "3h",
    status: "PENDING",
  },
];

function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="h-5 w-40 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-4 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-4 h-28 rounded-3xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function OvertimeRulesPage() {
  const [otMultiplier, setOtMultiplier] =
    useState("1.5");

  const [
    holidayMultiplier,
    setHolidayMultiplier,
  ] = useState("2.0");

  const [maxOtHours, setMaxOtHours] =
    useState("4");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [syncing, setSyncing] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setSuccess(false);

    setTimeout(() => {
      setLoading(false);

      setSuccess(true);
    }, 1200);
  };

  const handleSync = () => {
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const filteredPolicies = useMemo(() => {
    return otPolicies.filter((policy) =>
      policy.department
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#040816] dark:via-[#09111f] dark:to-[#040610] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Workforce Automation
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Overtime Rules
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Configure intelligent overtime
                multipliers, automated workforce
                compensation logic, holiday payment
                structures, realtime OT analytics, and
                enterprise attendance compliance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSync}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}

                Sync Rules
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <ShieldCheck className="h-4 w-4" />
                Compliance Active
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Overtime"
            value="14.8K"
            description="Monthly approved OT hours"
            icon={<Clock3 className="h-5 w-5" />}
          />

          <StatCard
            title="Holiday Compensation"
            value="SAR 1.2M"
            description="Holiday workforce payout"
            icon={<Coins className="h-5 w-5" />}
          />

          <StatCard
            title="Efficiency Score"
            value="98.9%"
            description="Realtime OT optimization"
            icon={<GaugeCircle className="h-5 w-5" />}
          />

          <StatCard
            title="Smart Detection"
            value="AI Active"
            description="Automated overtime analysis"
            icon={<BrainCircuit className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.82fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Global Overtime Policy Engine
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure enterprise-wide overtime
                  compensation logic, AI-driven
                  multiplier automation, workforce load
                  balancing, and payroll-integrated OT
                  compliance rules.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Realtime synchronization active
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
                  {success && (
                    <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 transition-all duration-300 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <div>
                        <h4 className="font-bold">
                          Overtime Rules Updated
                        </h4>

                        <p className="mt-1 text-xs opacity-90">
                          Enterprise OT policy engine
                          has been successfully updated
                          and synchronized across HR,
                          payroll, and attendance
                          systems.
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSave}
                    className="mt-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Regular OT Rate
                        </label>

                        <div className="relative">
                          <Sunrise className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            step="0.1"
                            value={otMultiplier}
                            onChange={(e) =>
                              setOtMultiplier(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            placeholder="1.5"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Holiday OT Rate
                        </label>

                        <div className="relative">
                          <MoonStar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            step="0.1"
                            value={holidayMultiplier}
                            onChange={(e) =>
                              setHolidayMultiplier(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            placeholder="2.0"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Max OT Hours / Day
                        </label>

                        <div className="relative">
                          <Hourglass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            value={maxOtHours}
                            onChange={(e) =>
                              setMaxOtHours(
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            placeholder="4"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-dashed border-cyan-500/20 bg-cyan-500/5 p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-500">
                            <Zap className="h-3.5 w-3.5" />
                            AI Compensation Logic
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            Smart OT automation
                            dynamically calculates
                            overtime compensation using
                            realtime attendance data,
                            employee shift patterns,
                            payroll integration, and
                            holiday workforce rules.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Regular
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {otMultiplier}x
                            </h4>
                          </div>

                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Holiday
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {holidayMultiplier}x
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-amber-500/20 bg-amber-500/10 p-5">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-500">
                          <AlertTriangle className="h-5 w-5" />
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            Intelligent Overtime Guide
                          </h4>

                          <p className="mt-2 text-sm leading-relaxed text-amber-700/90 dark:text-amber-300">
                            If the regular OT rate is
                            set to 1.5x and an
                            employee’s base hourly wage
                            is SAR 10, the system will
                            automatically calculate SAR
                            15 per overtime hour.
                            Holiday OT rules apply
                            advanced multiplier logic
                            with realtime payroll
                            synchronization.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Generate Analytics
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
                            Save Overtime Rules
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                  <Activity className="h-3.5 w-3.5" />
                  Workforce Intelligence
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Overtime Analytics
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  AI-driven workforce optimization,
                  realtime overtime forecasting,
                  compensation monitoring, and anomaly
                  detection across departments.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Productivity Score
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        97.6%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Department Policies
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enterprise overtime structure
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
                    placeholder="Search OT policies..."
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
                          Daily limit {policy.limit}
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
                          Regular
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.regularRate}
                        </h5>
                      </div>

                      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Holiday
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.holidayRate}
                        </h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  AI engine monitoring workforce...
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <TimerReset className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live OT Activities
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enterprise workforce events
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Holiday overtime policy synchronized",
                    time: "14 seconds ago",
                  },
                  {
                    title:
                      "Construction workforce OT approved",
                    time: "3 minutes ago",
                  },
                  {
                    title:
                      "Realtime attendance anomaly detected",
                    time: "11 minutes ago",
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

                    <ChevronRight className="ml-auto h-4 w-4 text-zinc-400" />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />

                  <div>
                    <h4 className="text-sm font-bold">
                      Smart Workforce Automation
                    </h4>

                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Overtime policies are directly
                      integrated with attendance,
                      payroll, workforce scheduling,
                      biometric verification, and
                      realtime enterprise reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Workforce Overview
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    2,482 Employees
                  </h3>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Flame className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Peak OT
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-black">
                    620h
                  </h4>
                </div>

                <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ArrowUpRight className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Growth
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-black">
                    +18%
                  </h4>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                      Optimization Score
                    </p>

                    <h4 className="mt-2 text-xl font-black">
                      96.8%
                    </h4>
                  </div>

                  <Zap className="h-5 w-5 text-cyan-500" />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}