"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  lazy,
  Suspense,
} from "react";

type PerformanceRecord = {
  id: string;
  name: string;
  role?: string;
  type?: string;
  score: string;
  tasks: string;
  rating: string;
  status: "Optimal" | "Warning" | "Critical";
};

const StatusPulse = lazy(() =>
  Promise.resolve({
    default: ({
      status,
    }: {
      status: PerformanceRecord["status"];
    }) => {
      const config = {
        Optimal:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        Warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        Critical: "bg-rose-500/15 text-rose-400 border-rose-500/20",
      };

      return (
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] backdrop-blur-xl ${config[status]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {status}
        </span>
      );
    },
  })
);

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"score" | "name">("score");

  const deferredSearch = useDeferredValue(search);

  const [performanceRecords] = useState<PerformanceRecord[]>([
    {
      id: "PRF-101",
      name: "Ahmed Mansoor",
      role: "Site Supervisor",
      score: "95/100",
      tasks: "42/45",
      rating: "Excellent",
      status: "Optimal",
    },
    {
      id: "PRF-102",
      name: "Youssef Al-Harbi",
      role: "Biometric Operator",
      score: "88/100",
      tasks: "38/45",
      rating: "Good",
      status: "Optimal",
    },
    {
      id: "PRF-103",
      name: "Fahad Mustafa",
      role: "Logistics Manager",
      score: "74/100",
      tasks: "30/45",
      rating: "Average",
      status: "Warning",
    },
    {
      id: "PRF-104",
      name: "Tariq Abdulaziz",
      type: "Probation",
      score: "58/100",
      tasks: "20/45",
      rating: "Needs Improvement",
      status: "Critical",
    },
  ]);

  const stats = {
    avgEfficiency: "86.4%",
    topPerformers: 12,
    underReview: 4,
    totalEvaluated: 142,
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("erp-performance-theme");

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "erp-performance-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const filteredRecords = useMemo(() => {
    const parsed = [...performanceRecords]
      .filter((item) => {
        const query = deferredSearch.toLowerCase();

        const matchedSearch =
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          (item.role || "").toLowerCase().includes(query);

        const matchedStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchedSearch && matchedStatus;
      })
      .sort((a, b) => {
        if (sortKey === "name") {
          return a.name.localeCompare(b.name);
        }

        return (
          Number(b.score.split("/")[0]) - Number(a.score.split("/")[0])
        );
      });

    return parsed;
  }, [performanceRecords, deferredSearch, statusFilter, sortKey]);

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.03]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        sub: "text-slate-300",
        surface: "bg-white/[0.02]",
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
          <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div className="h-8 w-72 rounded-lg bg-white/10" />
            <div className="mt-4 h-4 w-96 rounded-lg bg-white/5" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-5 h-8 w-20 rounded bg-white/5" />
              </div>
            ))}
          </div>

          <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 h-6 w-56 rounded bg-white/10" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-white/[0.04]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* Header */}
        <section
          className={`relative overflow-hidden rounded-[32px] border p-6 sm:p-8 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
                Synapse AI Workforce Analytics
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Performance Tracking
              </h1>

              <p
                className={`mt-3 max-w-3xl text-sm leading-7 ${theme.muted}`}
              >
                Enterprise-grade workforce KPI monitoring, intelligent
                evaluation metrics, predictive performance analytics and
                operational efficiency visibility layer.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`group inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.surface}`}
              >
                <span className="text-base">
                  {darkMode ? "🌙" : "☀️"}
                </span>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Generate AI Insight
              </button>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
          {[
            {
              label: "Total Evaluated",
              value: stats.totalEvaluated,
              growth: "+12.4%",
              accent:
                "from-blue-500/20 to-cyan-500/5 border-blue-500/10",
            },
            {
              label: "Avg Efficiency",
              value: stats.avgEfficiency,
              growth: "+4.2%",
              accent:
                "from-emerald-500/20 to-teal-500/5 border-emerald-500/10",
            },
            {
              label: "Top Performers",
              value: stats.topPerformers,
              growth: "+8.1%",
              accent:
                "from-violet-500/20 to-fuchsia-500/5 border-violet-500/10",
            },
            {
              label: "Under Review",
              value: stats.underReview,
              growth: "-2.8%",
              accent:
                "from-amber-500/20 to-orange-500/5 border-amber-500/10",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br ${item.accent} ${theme.card} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
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
                        item.label === "Under Review"
                          ? "34%"
                          : item.label === "Top Performers"
                          ? "81%"
                          : item.label === "Avg Efficiency"
                          ? "86%"
                          : "92%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TABLE */}
        <section
          className={`mt-8 overflow-hidden rounded-[32px] border ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div
            className={`flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between ${theme.border}`}
          >
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Workforce KPI Registry
              </h2>

              <p className={`mt-1 text-sm ${theme.muted}`}>
                Real-time employee efficiency tracking & AI evaluation
                matrix
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <input
                  aria-label="Search employees"
                  type="text"
                  placeholder="Search employee, role, id..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 sm:w-[260px] ${theme.input}`}
                />
              </div>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                <option value="All">All Status</option>
                <option value="Optimal">Optimal</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>

              <select
                aria-label="Sort records"
                value={sortKey}
                onChange={(e) =>
                  setSortKey(e.target.value as "score" | "name")
                }
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                <option value="score">Sort by KPI Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr
                  className={`border-b text-left text-xs uppercase tracking-[0.2em] ${theme.border} ${theme.muted}`}
                >
                  <th className="px-6 py-5 font-bold">Employee</th>
                  <th className="px-6 py-5 font-bold">Role</th>
                  <th className="px-6 py-5 font-bold">Tasks</th>
                  <th className="px-6 py-5 font-bold">KPI Score</th>
                  <th className="px-6 py-5 font-bold">AI Evaluation</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`group border-b transition-all duration-300 ${theme.border} ${theme.hover} animate-[fadeIn_.4s_ease]`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-sm font-black text-blue-400">
                          {record.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <div className="font-bold tracking-tight">
                            {record.name}
                          </div>

                          <div
                            className={`mt-1 text-xs ${theme.muted}`}
                          >
                            {record.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-medium">
                        {record.role || record.type}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            style={{
                              width: `${
                                (Number(record.tasks.split("/")[0]) /
                                  Number(record.tasks.split("/")[1])) *
                                100
                              }%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-semibold">
                          {record.tasks}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-black">
                        {record.score}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          record.rating === "Excellent"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : record.rating === "Good"
                            ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                            : record.rating === "Average"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {record.rating}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <Suspense
                        fallback={
                          <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
                        }
                      >
                        <StatusPulse status={record.status} />
                      </Suspense>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 p-4 xl:hidden">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className={`rounded-3xl border p-5 transition-all duration-300 ${theme.surface} ${theme.border} ${theme.hover} animate-[fadeIn_.4s_ease]`}
                style={{
                  animationDelay: `${index * 40}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 font-black text-blue-400">
                        {record.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <h3 className="font-bold tracking-tight">
                          {record.name}
                        </h3>

                        <p className={`text-xs ${theme.muted}`}>
                          {record.id}
                        </p>
                      </div>
                    </div>

                    <p className={`mt-4 text-sm ${theme.sub}`}>
                      {record.role || record.type}
                    </p>
                  </div>

                  <Suspense
                    fallback={
                      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
                    }
                  >
                    <StatusPulse status={record.status} />
                  </Suspense>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div
                    className={`rounded-2xl border p-4 ${theme.border} ${theme.surface}`}
                  >
                    <p className={`text-[11px] ${theme.muted}`}>
                      KPI SCORE
                    </p>

                    <h4 className="mt-2 text-xl font-black">
                      {record.score}
                    </h4>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${theme.border} ${theme.surface}`}
                  >
                    <p className={`text-[11px] ${theme.muted}`}>
                      TASKS
                    </p>

                    <h4 className="mt-2 text-xl font-black">
                      {record.tasks}
                    </h4>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs ${theme.muted}`}>
                      Completion
                    </span>

                    <span className="text-xs font-semibold">
                      {Math.round(
                        (Number(record.tasks.split("/")[0]) /
                          Number(record.tasks.split("/")[1])) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{
                        width: `${
                          (Number(record.tasks.split("/")[0]) /
                            Number(record.tasks.split("/")[1])) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 text-5xl">📊</div>

              <h3 className="text-xl font-bold">
                No matching records found
              </h3>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                Try adjusting filters or searching with another keyword.
              </p>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3) transparent;
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