"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  BadgeCheck,
  BellRing,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  Loader2,
  MoonStar,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  TrendingUp,
  Workflow,
} from "lucide-react";

type Holiday = {
  id: number;
  name: string;
  date: string;
  type: "PUBLIC" | "RELIGIOUS" | "NATIONAL";
};

function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
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
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
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

      <div className="h-5 w-36 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-10 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-4 h-28 rounded-3xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function HolidaysSettingsPage() {
  const [weekend, setWeekend] =
    useState("friday");

  const [holidayName, setHolidayName] =
    useState("");

  const [holidayDate, setHolidayDate] =
    useState("");

  const [holidayType, setHolidayType] =
    useState<Holiday["type"]>("PUBLIC");

  const [loading, setLoading] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [search, setSearch] = useState("");

  const [saved, setSaved] = useState(false);

  const [customHolidays, setCustomHolidays] =
    useState<Holiday[]>([
      {
        id: 1,
        name: "Eid-ul-Fitr",
        date: "2026-03-20",
        type: "RELIGIOUS",
      },
      {
        id: 2,
        name: "Saudi National Day",
        date: "2026-09-23",
        type: "NATIONAL",
      },
    ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleAddHoliday = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!holidayName || !holidayDate)
      return;

    setLoading(true);

    setTimeout(() => {
      setCustomHolidays((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: holidayName,
          date: holidayDate,
          type: holidayType,
        },
      ]);

      setHolidayName("");
      setHolidayDate("");
      setHolidayType("PUBLIC");

      setSaved(true);
      setLoading(false);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    }, 900);
  };

  const filteredHolidays = useMemo(() => {
    return customHolidays.filter((holiday) =>
      holiday.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customHolidays, search]);

  const removeHoliday = (id: number) => {
    setCustomHolidays((prev) =>
      prev.filter((holiday) => holiday.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#040816] dark:via-[#09111f] dark:to-[#040610] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_22%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Calendar Automation
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Holidays Setup
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Configure enterprise-wide public
                holidays, smart workforce calendars,
                weekend policies, automated payroll
                exclusions, attendance synchronization,
                and AI-driven holiday compliance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100">
                <Workflow className="h-4 w-4" />
                Smart Sync Active
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30">
                <ShieldCheck className="h-4 w-4" />
                Calendar Protected
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Registered Holidays"
            value={`${customHolidays.length}`}
            subtitle="Enterprise holiday events"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            title="Weekend Policy"
            value="Active"
            subtitle="Attendance synchronization"
            icon={<Clock3 className="h-5 w-5" />}
          />

          <StatCard
            title="Payroll Integration"
            value="99.8%"
            subtitle="Realtime compliance sync"
            icon={<TrendingUp className="h-5 w-5" />}
          />

          <StatCard
            title="Global Coverage"
            value="24/7"
            subtitle="Multi-region holiday engine"
            icon={<Globe2 className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.82fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Workforce Holiday Configuration
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure intelligent workforce
                  calendars, public holidays, dynamic
                  attendance exclusions, automated OT
                  restrictions, and smart scheduling
                  rules.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Enterprise calendar synchronized
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
                  {saved && (
                    <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 transition-all duration-300 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <div>
                        <h4 className="font-bold">
                          Holiday Calendar Updated
                        </h4>

                        <p className="mt-1 text-xs opacity-90">
                          Enterprise holiday calendar
                          has been successfully updated
                          and synchronized with payroll,
                          attendance, and workforce
                          scheduling systems.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 rounded-[1.8rem] border border-zinc-200/70 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                          <MoonStar className="h-3.5 w-3.5" />
                          Weekend Automation
                        </div>

                        <h3 className="mt-4 text-lg font-black">
                          Weekly Weekend Policy
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                          Configure enterprise-wide
                          weekend schedules for
                          attendance, payroll,
                          workforce planning, and OT
                          restriction automation.
                        </p>
                      </div>

                      <div className="w-full max-w-sm">
                        <select
                          value={weekend}
                          onChange={(e) =>
                            setWeekend(
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          <option value="friday">
                            শুক্রবার (Friday)
                          </option>

                          <option value="friday-saturday">
                            শুক্রবার ও শনিবার
                            (Fri-Sat)
                          </option>

                          <option value="sunday">
                            রবিবার (Sunday)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddHoliday}
                    className="mt-6 rounded-[1.8rem] border border-zinc-200/70 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-black">
                          Add Public Holiday
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Smart enterprise holiday
                          registration system
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
                        <BellRing className="h-3.5 w-3.5" />
                        Auto payroll sync enabled
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Holiday Name
                        </label>

                        <input
                          type="text"
                          value={holidayName}
                          onChange={(e) =>
                            setHolidayName(
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          placeholder="উদা: Eid-ul-Adha"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Holiday Date
                        </label>

                        <input
                          type="date"
                          value={holidayDate}
                          onChange={(e) =>
                            setHolidayDate(
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Holiday Type
                        </label>

                        <select
                          value={holidayType}
                          onChange={(e) =>
                            setHolidayType(
                              e.target
                                .value as Holiday["type"]
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          <option value="PUBLIC">
                            Public
                          </option>

                          <option value="RELIGIOUS">
                            Religious
                          </option>

                          <option value="NATIONAL">
                            National
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <CalendarRange className="h-4 w-4" />
                        Import Calendar
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Holiday
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 rounded-[1.8rem] border border-blue-500/20 bg-blue-500/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-500">
                        <Star className="h-5 w-5" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          Intelligent Holiday Logic
                        </h4>

                        <p className="mt-2 text-sm leading-relaxed text-blue-700/90 dark:text-blue-300">
                          All configured holidays are
                          automatically synchronized
                          with attendance systems,
                          payroll deductions, overtime
                          restrictions, employee shift
                          planning, and enterprise
                          reporting modules.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
                  <Activity className="h-3.5 w-3.5" />
                  Calendar Intelligence
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Workforce Insights
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  AI-powered holiday analytics,
                  scheduling intelligence, payroll
                  compliance monitoring, and attendance
                  forecasting.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                        Automation Score
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        98.6%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-blue-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Search className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Holiday Directory
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Search enterprise holidays
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
                    placeholder="Search holidays..."
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="rounded-[1.5rem] border border-zinc-200/70 bg-zinc-50/70 p-4 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          {holiday.name}
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {holiday.date}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                          holiday.type ===
                            "RELIGIOUS"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : holiday.type ===
                              "NATIONAL"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            : "border-blue-500/20 bg-blue-500/10 text-blue-500"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {holiday.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        Synced with payroll
                      </div>

                      <button
                        onClick={() =>
                          removeHoliday(
                            holiday.id
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 transition-all duration-300 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-blue-500/20 bg-blue-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                  AI calendar engine processing...
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-blue-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Sun className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Calendar Events
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enterprise activity monitoring
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Payroll holiday sync completed",
                    time: "18 seconds ago",
                  },
                  {
                    title:
                      "Attendance weekend policy updated",
                    time: "5 minutes ago",
                  },
                  {
                    title:
                      "AI workforce schedule optimized",
                    time: "14 minutes ago",
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

              <div className="mt-6 flex flex-col gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
                  <CalendarRange className="h-4 w-4" />
                  Export Calendar
                </button>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30">
                  <Save className="h-4 w-4" />
                  Save Enterprise Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}