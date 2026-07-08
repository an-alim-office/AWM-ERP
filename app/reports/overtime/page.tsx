"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

type Department =
  | "Construction"
  | "Engineering"
  | "Logistics";

interface OvertimeRecord {
  id: string;
  name: string;
  dept: Department;
  hours: number;
  rate: number;
  total: number;
  performance: number;
  shift: "Day" | "Night";
}

const overtimeSeed: OvertimeRecord[] =
  [
    {
      id: "W101",
      name: "আব্দুল্লাহ আল-মামুন",
      dept: "Construction",
      hours: 24,
      rate: 25,
      total: 600,
      performance: 91,
      shift: "Day",
    },
    {
      id: "W102",
      name: "মোঃ তারেক রহমান",
      dept: "Engineering",
      hours: 15,
      rate: 30,
      total: 450,
      performance: 82,
      shift: "Night",
    },
    {
      id: "W105",
      name: "হাসান মাহমুদ",
      dept: "Logistics",
      hours: 40,
      rate: 20,
      total: 800,
      performance: 95,
      shift: "Night",
    },
    {
      id: "W108",
      name: "বলাল হোসেন",
      dept: "Construction",
      hours: 10,
      rate: 25,
      total: 250,
      performance: 74,
      shift: "Day",
    },
  ];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

export default function OvertimeReportPage() {
  const [mounted, setMounted] =
    useState(false);

  const [reportMonth, setReportMonth] =
    useState("2026-05");

  const [search, setSearch] =
    useState("");

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [sortKey, setSortKey] =
    useState<
      "hours" | "total"
    >("total");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [
    overtimeData,
    setOvertimeData,
  ] = useState<
    OvertimeRecord[] | null
  >(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerateReport = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsGenerating(true);
    setOvertimeData(null);

    setTimeout(() => {
      setOvertimeData(
        overtimeSeed
      );

      setIsGenerating(false);
    }, 1200);
  };

  const filteredData =
    useMemo(() => {
      if (!overtimeData)
        return [];

      const filtered =
        overtimeData.filter(
          (item) => {
            const matchesSearch =
              item.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                ) ||
              item.id
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            const matchesDept =
              departmentFilter ===
              "All"
                ? true
                : item.dept ===
                  departmentFilter;

            return (
              matchesSearch &&
              matchesDept
            );
          }
        );

      return filtered.sort(
        (a, b) =>
          b[sortKey] -
          a[sortKey]
      );
    }, [
      overtimeData,
      search,
      departmentFilter,
      sortKey,
    ]);

  const totalOTCost =
    filteredData.reduce(
      (acc, row) =>
        acc + row.total,
      0
    );

  const totalHours =
    filteredData.reduce(
      (acc, row) =>
        acc + row.hours,
      0
    );

  const avgPerformance =
    filteredData.length
      ? Math.round(
          filteredData.reduce(
            (acc, row) =>
              acc +
              row.performance,
            0
          ) /
            filteredData.length
        )
      : 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  Workforce Intelligence
                </div>

                <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                  Overtime Analytics
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
                  Advanced
                  enterprise-grade
                  overtime monitoring,
                  payroll impact
                  forecasting, labor
                  optimization and
                  workforce efficiency
                  analytics dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {[
                  {
                    title:
                      "Total Cost",
                    value: `${totalOTCost} SAR`,
                    color:
                      "text-emerald-300",
                  },
                  {
                    title:
                      "OT Hours",
                    value: `${totalHours}h`,
                    color:
                      "text-cyan-300",
                  },
                  {
                    title:
                      "Efficiency",
                    value: `${avgPerformance}%`,
                    color:
                      "text-violet-300",
                  },
                ].map((card) => (
                  <div
                    key={
                      card.title
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                      {card.title}
                    </p>

                    <h2
                      className={`mt-3 text-2xl font-black ${card.color}`}
                    >
                      {card.value}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <form
            onSubmit={
              handleGenerateReport
            }
            className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl"
          >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Report Month
                </label>

                <input
                  type="month"
                  value={
                    reportMonth
                  }
                  onChange={(e) =>
                    setReportMonth(
                      e.target
                        .value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Department
                </label>

                <select
                  value={
                    departmentFilter
                  }
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target
                        .value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option>
                    All
                  </option>
                  <option>
                    Construction
                  </option>
                  <option>
                    Engineering
                  </option>
                  <option>
                    Logistics
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Sort By
                </label>

                <select
                  value={sortKey}
                  onChange={(e) =>
                    setSortKey(
                      e.target
                        .value as
                        | "hours"
                        | "total"
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="total">
                    Total Cost
                  </option>
                  <option value="hours">
                    OT Hours
                  </option>
                </select>
              </div>

              <div className="xl:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Search Employee
                </label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    placeholder="Search by name or ID..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
                  />

                  <button
                    type="submit"
                    disabled={
                      isGenerating
                    }
                    className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>
                          Processing
                        </span>
                      </div>
                    ) : (
                      "Generate"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Loading */}
          {isGenerating && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, i) => (
                <div
                  key={i}
                  className={`h-40 rounded-[28px] border border-white/10 bg-white/[0.03] ${shimmer}`}
                />
              ))}
            </div>
          )}

          {/* Dashboard Stats */}
          {!isGenerating &&
            overtimeData && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title:
                      "Highest OT",
                    value: "40 Hrs",
                    subtitle:
                      "Logistics",
                    color:
                      "text-amber-300",
                  },
                  {
                    title:
                      "Payroll Impact",
                    value: `${Math.round(
                      totalOTCost /
                        4
                    )}%`,
                    subtitle:
                      "Budget Allocation",
                    color:
                      "text-cyan-300",
                  },
                  {
                    title:
                      "Night Shift OT",
                    value: `${filteredData.filter(
                      (
                        item
                      ) =>
                        item.shift ===
                        "Night"
                    ).length}`,
                    subtitle:
                      "Employees",
                    color:
                      "text-violet-300",
                  },
                  {
                    title:
                      "Optimization",
                    value: "AI Active",
                    subtitle:
                      "Realtime Analysis",
                    color:
                      "text-emerald-300",
                  },
                ].map((card) => (
                  <div
                    key={
                      card.title
                    }
                    className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      {card.title}
                    </p>

                    <h3
                      className={`mt-4 text-4xl font-black ${card.color}`}
                    >
                      {
                        card.value
                      }
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      {
                        card.subtitle
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}

          {/* Data Table */}
          {!isGenerating &&
            overtimeData && (
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Overtime
                      Report
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Monthly
                      workforce
                      overtime
                      analytics &
                      payroll impact
                      overview.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-300">
                      Total Cost:
                      {" "}
                      {
                        totalOTCost
                      }{" "}
                      SAR
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-cyan-300">
                      Records:
                      {" "}
                      {
                        filteredData.length
                      }
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20 text-left">
                        {[
                          "Employee",
                          "Department",
                          "Shift",
                          "OT Hours",
                          "Hourly Rate",
                          "Total",
                          "Performance",
                          "Status",
                        ].map(
                          (
                            head
                          ) => (
                            <th
                              key={
                                head
                              }
                              className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-gray-500"
                            >
                              {
                                head
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredData.map(
                        (
                          row,
                          index
                        ) => (
                          <tr
                            key={
                              row.id
                            }
                            className={`border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03] ${
                              index %
                                2 ===
                              0
                                ? "bg-white/[0.01]"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-5">
                              <div>
                                <p className="font-bold text-white">
                                  {
                                    row.name
                                  }
                                </p>

                                <p className="mt-1 text-xs font-mono text-gray-500">
                                  {
                                    row.id
                                  }
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-sm text-gray-300">
                              {
                                row.dept
                              }
                            </td>

                            <td className="px-6 py-5">
                              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-300">
                                {
                                  row.shift
                                }
                              </span>
                            </td>

                            <td className="px-6 py-5 font-mono text-cyan-300">
                              {
                                row.hours
                              }{" "}
                              Hrs
                            </td>

                            <td className="px-6 py-5 font-mono text-gray-300">
                              {
                                row.rate
                              }{" "}
                              SAR
                            </td>

                            <td className="px-6 py-5 font-mono text-lg font-black text-emerald-300">
                              {
                                row.total
                              }{" "}
                              SAR
                            </td>

                            <td className="px-6 py-5">
                              <div className="w-[120px]">
                                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                  <span>
                                    KPI
                                  </span>

                                  <span className="text-white">
                                    {
                                      row.performance
                                    }

                                    %
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    style={{
                                      width: `${row.performance}%`,
                                    }}
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                  row.performance >=
                                  90
                                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                    : row.performance >=
                                      80
                                    ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                                    : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                                }`}
                              >
                                {row.performance >=
                                90
                                  ? "Excellent"
                                  : row.performance >=
                                    80
                                  ? "Good"
                                  : "Average"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Empty State */}
          {!isGenerating &&
            !overtimeData && (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-2xl">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
                  <div className="h-8 w-8 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)]" />
                </div>

                <h2 className="text-2xl font-black">
                  Overtime
                  Intelligence
                  Ready
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
                  Generate advanced
                  workforce overtime
                  reports with
                  realtime payroll
                  analytics, labor
                  efficiency insights,
                  AI-based monitoring
                  and enterprise-grade
                  performance
                  tracking.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}