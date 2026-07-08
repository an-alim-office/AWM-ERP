"use client";

import React, {
  Suspense,
  lazy,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

type ActivityStatus =
  | "success"
  | "ai"
  | "warning"
  | "info";

type Activity = {
  id: number;
  time: string;
  date: string;
  title: string;
  desc: string;
  status: ActivityStatus;
  category: string;
};

const StatusPulse = lazy(() =>
  Promise.resolve({
    default: ({
      status,
    }: {
      status: ActivityStatus;
    }) => {
      const config = {
        success:
          "bg-emerald-500 text-emerald-400 border-emerald-500/20",
        ai: "bg-violet-500 text-violet-400 border-violet-500/20",
        warning:
          "bg-amber-500 text-amber-400 border-amber-500/20",
        info: "bg-blue-500 text-blue-400 border-blue-500/20",
      };

      return (
        <div className="relative flex items-center justify-center">
          <span
            className={`absolute inline-flex h-5 w-5 animate-ping rounded-full opacity-20 ${config[status].split(" ")[0]}`}
          />
          <span
            className={`relative h-4 w-4 rounded-full border-4 border-[#050816] ${config[status].split(" ")[0]}`}
          />
        </div>
      );
    },
  })
);

export default function ActivityTimelinePage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const deferredSearch = useDeferredValue(search);

  const [activities] = useState<Activity[]>([
    {
      id: 1,
      time: "11:30 PM",
      date: "Today",
      title: "Biometric Attendance Sync Completed",
      desc: "Node #4 successfully uploaded logs for 485 active shift workers.",
      status: "success",
      category: "Biometric",
    },
    {
      id: 2,
      time: "09:15 PM",
      date: "Today",
      title: "AI Core System Optimization",
      desc: "Synapse AI analyzed performance metrics and auto-allocated database cluster nodes.",
      status: "ai",
      category: "AI Core",
    },
    {
      id: 3,
      time: "04:00 PM",
      date: "Today",
      title: "Bulk Worker Registry Import",
      desc: "500 worker master records parsed from Excel clipboard and saved successfully.",
      status: "success",
      category: "ERP System",
    },
    {
      id: 4,
      time: "10:20 AM",
      date: "Yesterday",
      title: "Riyadh Compliance Update",
      desc: "Global System Settings modified to enforce regional VAT and tax regulations.",
      status: "info",
      category: "Settings",
    },
    {
      id: 5,
      time: "02:45 PM",
      date: "24 June",
      title: "Gateway Security Audit",
      desc: "Validated secure token access routing via crypto-currency subscription portal.",
      status: "warning",
      category: "Security",
    },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "activity-timeline-theme"
    );

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "activity-timeline-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const q = deferredSearch.toLowerCase();

      const matchedSearch =
        activity.title.toLowerCase().includes(q) ||
        activity.desc.toLowerCase().includes(q) ||
        activity.category.toLowerCase().includes(q);

      const matchedFilter =
        filter === "All" ||
        activity.category === filter;

      return matchedSearch && matchedFilter;
    });
  }, [activities, deferredSearch, filter]);

  const stats = {
    totalEvents: activities.length,
    aiActions: activities.filter(
      (a) => a.status === "ai"
    ).length,
    securityAlerts: activities.filter(
      (a) => a.status === "warning"
    ).length,
    successfulTasks: activities.filter(
      (a) => a.status === "success"
    ).length,
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(activities.map((a) => a.category))
    ),
  ];

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.04]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        sub: "text-slate-300",
        surface: "bg-white/[0.03]",
        hover: "hover:bg-white/[0.04]",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
      }
    : {
        bg: "bg-[#f4f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        sub: "text-slate-700",
        surface: "bg-slate-50",
        hover: "hover:bg-slate-100/70",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
      };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
            <div className="h-8 w-64 rounded-xl bg-white/10" />
            <div className="mt-4 h-4 w-96 rounded-xl bg-white/5" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>

          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
              />
            ))}
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute left-[30%] top-[20%] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[36px] border p-6 sm:p-8 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                Synapse AI Event Stream
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Activity Timeline
              </h1>

              <p
                className={`mt-3 max-w-3xl text-sm leading-7 ${theme.muted}`}
              >
                Real-time operational intelligence, audit
                events, AI activity streams and enterprise
                security tracking infrastructure.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.surface}`}
              >
                <span>{darkMode ? "🌙" : "☀️"}</span>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </button>

              <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                Live Streaming
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {[
            {
              label: "Total Events",
              value: stats.totalEvents,
              growth: "+18.4%",
              accent:
                "from-blue-500/20 to-cyan-500/5 border-blue-500/10",
            },
            {
              label: "AI Activities",
              value: stats.aiActions,
              growth: "+7.2%",
              accent:
                "from-violet-500/20 to-fuchsia-500/5 border-violet-500/10",
            },
            {
              label: "Security Alerts",
              value: stats.securityAlerts,
              growth: "-2.1%",
              accent:
                "from-amber-500/20 to-orange-500/5 border-amber-500/10",
            },
            {
              label: "Successful Tasks",
              value: stats.successfulTasks,
              growth: "+14.9%",
              accent:
                "from-emerald-500/20 to-teal-500/5 border-emerald-500/10",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`group relative overflow-hidden rounded-[30px] border bg-gradient-to-br ${item.accent} ${theme.card} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              </div>

              <div className="relative z-10">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.22em] ${theme.muted}`}
                >
                  {item.label}
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <h3 className="text-4xl font-black tracking-tight">
                    {item.value}
                  </h3>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    {item.growth}
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                    style={{
                      width:
                        item.label === "Security Alerts"
                          ? "35%"
                          : item.label === "AI Activities"
                          ? "72%"
                          : item.label === "Successful Tasks"
                          ? "89%"
                          : "94%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section
          className={`mt-8 rounded-[32px] border p-5 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Real-Time Event Timeline
              </h2>

              <p className={`mt-1 text-sm ${theme.muted}`}>
                Operational history feed & intelligent audit
                stream
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search timeline events..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 sm:w-[260px] ${theme.input}`}
              />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="relative mt-10">
          <div className="absolute left-[19px] top-0 hidden h-full w-px bg-gradient-to-b from-blue-500/40 via-cyan-500/20 to-transparent sm:left-[180px]" />

          <div className="space-y-8">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="group relative animate-[fadeIn_.5s_ease]"
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
              >
                {/* DESKTOP TIMESTAMP */}
                <div className="hidden sm:absolute sm:left-0 sm:top-2 sm:block sm:w-[140px] sm:text-right">
                  <p
                    className={`text-sm font-bold tracking-wide ${theme.sub}`}
                  >
                    {activity.time}
                  </p>

                  <p
                    className={`mt-1 text-xs ${theme.muted}`}
                  >
                    {activity.date}
                  </p>
                </div>

                {/* NODE */}
                <div className="absolute left-[11px] top-6 z-10 sm:left-[172px]">
                  <Suspense
                    fallback={
                      <div className="h-5 w-5 rounded-full bg-white/10" />
                    }
                  >
                    <StatusPulse
                      status={activity.status}
                    />
                  </Suspense>
                </div>

                {/* CARD */}
                <div className="sm:ml-[220px]">
                  <div
                    className={`relative overflow-hidden rounded-[30px] border p-5 sm:p-6 transition-all duration-300 ${theme.card} ${theme.border} ${theme.hover} backdrop-blur-2xl hover:-translate-y-1 hover:shadow-2xl`}
                  >
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/[0.04] blur-3xl" />

                    <div className="relative z-10">
                      {/* TOP */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                              activity.status ===
                              "success"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : activity.status === "ai"
                                ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                                : activity.status ===
                                  "warning"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {activity.category}
                          </span>

                          <span
                            className={`sm:hidden text-xs ${theme.muted}`}
                          >
                            {activity.date} •{" "}
                            {activity.time}
                          </span>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                            activity.status ===
                            "success"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : activity.status === "ai"
                              ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                              : activity.status ===
                                "warning"
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {activity.status}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="mt-5">
                        <h3 className="text-lg font-black tracking-tight transition-colors duration-300 group-hover:text-blue-400">
                          {activity.title}
                        </h3>

                        <p
                          className={`mt-3 max-w-4xl text-sm leading-7 ${theme.muted}`}
                        >
                          {activity.desc}
                        </p>
                      </div>

                      {/* FOOTER */}
                      <div
                        className={`mt-6 flex flex-wrap items-center gap-3 border-t pt-5 ${theme.border}`}
                      >
                        <div
                          className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${theme.surface} ${theme.border}`}
                        >
                          Event ID #{activity.id}
                        </div>

                        <div
                          className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${theme.surface} ${theme.border}`}
                        >
                          Synced to Audit Core
                        </div>

                        <div
                          className={`rounded-2xl border px-4 py-2 text-xs font-semibold ${theme.surface} ${theme.border}`}
                        >
                          Live Indexed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div
                className={`rounded-[32px] border p-12 text-center ${theme.card} ${theme.border}`}
              >
                <div className="mb-4 text-5xl">
                  📡
                </div>

                <h3 className="text-2xl font-black">
                  No activity records found
                </h3>

                <p
                  className={`mt-3 text-sm ${theme.muted}`}
                >
                  Try adjusting filters or searching with
                  different keywords.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

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