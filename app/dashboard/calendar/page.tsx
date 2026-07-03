"use client";

import React, {
  memo,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";

type EventType =
  | "shift"
  | "ai"
  | "security"
  | "billing";

type CalendarEvent = {
  id: number;
  date: number;
  type: EventType;
  title: string;
  desc: string;
};

const MiniAnalytics = lazy(() =>
  Promise.resolve({
    default: memo(function MiniAnalytics({
      events,
    }: {
      events: CalendarEvent[];
    }) {
      const total = events.length;

      const ai = events.filter(
        (e) => e.type === "ai"
      ).length;

      const security = events.filter(
        (e) => e.type === "security"
      ).length;

      const automation = Math.round(
        (ai / total) * 100
      );

      return (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Total Events
            </p>
            <h3 className="mt-3 text-3xl font-black text-white">
              {total}
            </h3>
          </div>

          <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              AI Ops
            </p>
            <h3 className="mt-3 text-3xl font-black text-emerald-300">
              {automation}%
            </h3>
          </div>

          <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-4 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              Security
            </p>
            <h3 className="mt-3 text-3xl font-black text-amber-300">
              {security}
            </h3>
          </div>
        </div>
      );
    }),
  })
);

export default function SmartCalendarPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [selectedDate, setSelectedDate] =
    useState<number | null>(27);

  const [currentDate] = useState(
    new Date(2026, 5)
  );

  const [events] = useState<
    CalendarEvent[]
  >([
    {
      id: 1,
      date: 5,
      type: "shift",
      title: "Bulk Worker Data Sync",
      desc: "500 worker profiles update",
    },
    {
      id: 2,
      date: 12,
      type: "ai",
      title: "AI Automation Audit",
      desc: "Synapse core performance check",
    },
    {
      id: 3,
      date: 19,
      type: "security",
      title: "Biometric Nodes Patch",
      desc: "Gate scanner firmware update",
    },
    {
      id: 4,
      date: 26,
      type: "billing",
      title: "Cloud Infrastructure Renewal",
      desc: "Subscription processing",
    },
  ]);

  useEffect(() => {
    const storedTheme =
      localStorage.getItem(
        "awm-calendar-theme"
      );

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "awm-calendar-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const daysInMonth = 30;
  const startBlankDays = 1;

  const daysArray = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const blankDaysArray = Array.from(
    { length: startBlankDays },
    (_, i) => i
  );

  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const selectedEvents = useMemo(() => {
    return events.filter(
      (event) => event.date === selectedDate
    );
  }, [events, selectedDate]);

  const monthName =
    currentDate.toLocaleString("en-US", {
      month: "long",
    });

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.04]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        soft: "bg-white/[0.03]",
        hover: "hover:bg-white/[0.05]",
        grid: "bg-[#0b1220]",
      }
    : {
        bg: "bg-[#f4f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        soft: "bg-slate-100",
        hover: "hover:bg-slate-100",
        grid: "bg-white",
      };

  const getEventColor = (
    type: EventType
  ) => {
    switch (type) {
      case "shift":
        return "bg-violet-500";
      case "ai":
        return "bg-emerald-500";
      case "security":
        return "bg-amber-500";
      case "billing":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  const getEventBadge = (
    type: EventType
  ) => {
    switch (type) {
      case "shift":
        return "border-violet-500/20 bg-violet-500/10 text-violet-400";
      case "ai":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
      case "security":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
      case "billing":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";
      default:
        return "";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-44 animate-pulse rounded-[38px] border border-white/10 bg-white/[0.04]" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-[720px] animate-pulse rounded-[34px] border border-white/10 bg-white/[0.04] lg:col-span-2" />

            <div className="h-[720px] animate-pulse rounded-[34px] border border-white/10 bg-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-[40%] top-[20%] h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[38px] border p-6 sm:p-8 xl:p-10 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-400">
                AI Workforce Scheduler
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Smart Calendar
              </h1>

              <p
                className={`mt-4 text-sm leading-7 sm:text-base ${theme.muted}`}
              >
                AI-powered operational calendar
                system for workforce scheduling,
                biometric maintenance, ERP sync
                automation and cloud infrastructure
                management.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.soft}`}
              >
                <span>
                  {darkMode ? "🌙" : "☀️"}
                </span>

                {darkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>

              <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-400">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>

                Synapse AI Active
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Suspense
              fallback={
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
                    />
                  ))}
                </div>
              }
            >
              <MiniAnalytics
                events={events}
              />
            </Suspense>
          </div>
        </section>

        {/* MAIN */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* CALENDAR */}
          <div
            className={`overflow-hidden rounded-[34px] border p-5 sm:p-6 ${theme.card} ${theme.border} backdrop-blur-2xl lg:col-span-2`}
          >
            {/* TOP */}
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {monthName} 2026
                </h2>

                <p
                  className={`mt-1 text-sm ${theme.muted}`}
                >
                  Enterprise workforce scheduling
                  matrix
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-[1.02] ${theme.border} ${theme.soft}`}
                >
                  Monthly
                </button>

                <button
                  className={`rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 transition-all duration-300 hover:scale-[1.02]`}
                >
                  AI Sync
                </button>
              </div>
            </div>

            {/* WEEK HEADERS */}
            <div className="mb-4 grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="flex h-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {blankDaysArray.map((index) => (
                <div
                  key={`blank-${index}`}
                  className="aspect-square rounded-3xl"
                />
              ))}

              {daysArray.map((day) => {
                const dayEvents =
                  events.filter(
                    (event) =>
                      event.date === day
                  );

                const isToday =
                  day === 27;

                const isSelected =
                  selectedDate === day;

                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDate(day)
                    }
                    className={`group relative aspect-square overflow-hidden rounded-[26px] border p-2 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-3 ${
                      isSelected
                        ? "border-cyan-500/40 bg-cyan-500/10"
                        : isToday
                        ? "border-blue-500/30 bg-blue-500/10"
                        : `${theme.border} ${theme.grid} ${theme.hover}`
                    }`}
                  >
                    <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-white/5 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative z-10 flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black sm:text-sm ${
                            isSelected
                              ? "text-cyan-400"
                              : isToday
                              ? "text-blue-400"
                              : theme.text
                          }`}
                        >
                          {day}
                        </span>

                        {dayEvents.length >
                          0 && (
                          <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-slate-400">
                            {
                              dayEvents.length
                            }
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {dayEvents.map(
                            (event) => (
                              <span
                                key={
                                  event.id
                                }
                                className={`h-2 w-2 rounded-full ${getEventColor(
                                  event.type
                                )}`}
                              />
                            )
                          )}
                        </div>

                        {dayEvents[0] && (
                          <p className="line-clamp-2 hidden text-[10px] font-medium text-slate-400 sm:block">
                            {
                              dayEvents[0]
                                .title
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* AGENDA */}
            <div
              className={`rounded-[34px] border p-5 ${theme.card} ${theme.border} backdrop-blur-2xl`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    Event Agenda
                  </h3>

                  <p
                    className={`mt-1 text-sm ${theme.muted}`}
                  >
                    Smart operational schedules
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-400">
                  {events.length} Active
                </div>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`group rounded-[28px] border p-4 transition-all duration-300 hover:-translate-y-1 ${theme.border} ${theme.soft}`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                          June {event.date},
                          2026
                        </p>

                        <h4 className="mt-2 text-sm font-black text-white">
                          {event.title}
                        </h4>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getEventBadge(
                          event.type
                        )}`}
                      >
                        {event.type}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-6 ${theme.muted}`}
                    >
                      {event.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SELECTED DATE */}
            <div
              className={`rounded-[34px] border p-5 ${theme.card} ${theme.border} backdrop-blur-2xl`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    Selected Day
                  </h3>

                  <p
                    className={`mt-1 text-sm ${theme.muted}`}
                  >
                    June {selectedDate}, 2026
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-400">
                  AI Timeline
                </div>
              </div>

              {selectedEvents.length >
              0 ? (
                <div className="space-y-4">
                  {selectedEvents.map(
                    (event) => (
                      <div
                        key={event.id}
                        className={`rounded-[28px] border p-4 ${theme.soft} ${theme.border}`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-sm font-black">
                            {event.title}
                          </h4>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${getEventBadge(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-6 ${theme.muted}`}
                        >
                          {event.desc}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  className={`rounded-[28px] border p-8 text-center ${theme.soft} ${theme.border}`}
                >
                  <div className="mb-4 text-5xl">
                    📅
                  </div>

                  <h4 className="text-lg font-black">
                    No Events
                  </h4>

                  <p
                    className={`mt-2 text-sm ${theme.muted}`}
                  >
                    No operational schedule for
                    this date.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3)
            transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}