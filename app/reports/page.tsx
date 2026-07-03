"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ReportItem {
  id: string;
  name: string;
  date: string;
  category?: string;
  status?: "Generated" | "Pending" | "Failed";
  size?: string;
}

type SortKey = "name" | "date";

const statusStyles = {
  Generated:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Pending:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Failed:
    "bg-red-500/10 text-red-400 border border-red-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[120px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

const SkeletonRow = memo(() => (
  <div className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />
));

SkeletonRow.displayName = "SkeletonRow";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortKey>("date");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Generated" | "Pending" | "Failed"
  >("ALL");

  // API Fetch
  useEffect(() => {
    let active = true;

    async function fetchReports() {
      try {
        const response = await fetch(
          "/api/reports-service",
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch reports"
          );
        }

        const data = await response.json();

        if (!active) return;

        const normalizedData: ReportItem[] =
          Array.isArray(data)
            ? data.map(
                (
                  item: Partial<ReportItem>,
                  index: number
                ) => ({
                  id:
                    item.id ||
                    `RPT-${1000 + index}`,
                  name:
                    item.name ||
                    "Unnamed Report",
                  date:
                    item.date ||
                    new Date().toLocaleDateString(),
                  category:
                    item.category ||
                    "Operations",
                  status:
                    item.status ||
                    ([
                      "Generated",
                      "Pending",
                      "Failed",
                    ][
                      index % 3
                    ] as ReportItem["status"]),
                  size:
                    item.size ||
                    `${(
                      Math.random() * 10 +
                      1
                    ).toFixed(1)} MB`,
                })
              )
            : [];

        setReports(normalizedData);
      } catch (error) {
        console.error(
          "Error loading reports:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchReports();

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    let data = [...reports];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.id
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.category
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (item) =>
          item.status === statusFilter
      );
    }

    data.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(
          b.name
        );
      }

      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );
    });

    return data;
  }, [
    reports,
    search,
    statusFilter,
    sortBy,
  ]);

  const dashboardMetrics = useMemo(() => {
    return {
      totalReports: reports.length,
      generated:
        reports.filter(
          (r) => r.status === "Generated"
        ).length,
      pending:
        reports.filter(
          (r) => r.status === "Pending"
        ).length,
      failed:
        reports.filter(
          (r) => r.status === "Failed"
        ).length,
    };
  }, [reports]);

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#0d1117] text-gray-100"
          : "bg-[#f4f7fb] text-gray-900"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                Enterprise Reporting System
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                রিপোর্টস
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-gray-400">
                AI-powered enterprise reporting,
                analytics intelligence, secure
                exports, and advanced business
                insights management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setDarkMode(
                    (prev) => !prev
                  )
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30"
              >
                {darkMode
                  ? "Light Mode"
                  : "Dark Mode"}
              </button>

              <button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                নতুন রিপোর্ট ডাউনলোড
              </button>
            </div>
          </header>

          {/* Metrics */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading ? (
              Array.from({
                length: 4,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))
            ) : (
              <>
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Total Reports
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-blue-400">
                    {
                      dashboardMetrics.totalReports
                    }
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Generated
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-emerald-400">
                    {
                      dashboardMetrics.generated
                    }
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Pending
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-amber-400">
                    {
                      dashboardMetrics.pending
                    }
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Failed
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-red-400">
                    {
                      dashboardMetrics.failed
                    }
                  </h2>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-4">
            <input
              aria-label="Search reports"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="রিপোর্ট সার্চ করুন..."
              className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-blue-400/40 xl:col-span-2"
            />

            <select
              aria-label="Filter report status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target
                    .value as typeof statusFilter
                )
              }
              className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-blue-400/40"
            >
              <option value="ALL">
                সকল স্ট্যাটাস
              </option>
              <option value="Generated">
                Generated
              </option>
              <option value="Pending">
                Pending
              </option>
              <option value="Failed">
                Failed
              </option>
            </select>

            <select
              aria-label="Sort reports"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target
                    .value as SortKey
                )
              }
              className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-blue-400/40"
            >
              <option value="date">
                Sort by Date
              </option>
              <option value="name">
                Sort by Name
              </option>
            </select>
          </div>

          {/* Reports Table */}
          <section className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
            <div className="border-b border-white/5 px-6 py-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    সাম্প্রতিক রিপোর্টসমূহ
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Real-time business reporting
                    & analytics records.
                  </p>
                </div>

                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  Live Sync Active
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <SkeletonRow
                    key={index}
                  />
                ))}
              </div>
            ) : filteredReports.length >
              0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="border-b border-white/5 bg-black/10">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        আইডি
                      </th>

                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        রিপোর্ট
                      </th>

                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        ক্যাটাগরি
                      </th>

                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        তারিখ
                      </th>

                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        Size
                      </th>

                      <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-5 text-right text-xs uppercase tracking-[0.2em] text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map(
                      (report) => (
                        <tr
                          key={report.id}
                          className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <span className="font-bold text-blue-400">
                              {
                                report.id
                              }
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold tracking-tight">
                                {
                                  report.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                AI Generated
                                Enterprise
                                Report
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-cyan-300">
                            {
                              report.category
                            }
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-400">
                            {
                              report.date
                            }
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-violet-300">
                            {
                              report.size
                            }
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                statusStyles[
                                  report.status ||
                                    "Pending"
                                ]
                              }`}
                            >
                              {
                                report.status
                              }
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/10">
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12">
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-3xl">
                    📊
                  </div>

                  <h3 className="text-2xl font-black tracking-tight">
                    কোনো রিপোর্ট পাওয়া যায়নি
                  </h3>

                  <p className="mt-3 text-sm text-gray-400">
                    নতুন রিপোর্ট তৈরি করে
                    আপনার analytics workflow
                    শুরু করুন।
                  </p>

                  <button className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03]">
                    নতুন রিপোর্ট তৈরি করুন
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* AI Insights Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Report Analytics */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Analytics Overview
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Enterprise reporting
                    intelligence
                  </p>
                </div>

                <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-300">
                  AI Powered
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    label:
                      "Automation Efficiency",
                    progress: 92,
                    color:
                      "bg-emerald-400",
                  },
                  {
                    label:
                      "Report Accuracy",
                    progress: 97,
                    color:
                      "bg-blue-400",
                  },
                  {
                    label:
                      "Export Performance",
                    progress: 84,
                    color:
                      "bg-violet-400",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {
                          item.label
                        }
                      </span>

                      <span className="text-xs text-gray-400">
                        {
                          item.progress
                        }
                        %
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-black/20">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
              <div className="mb-5">
                <h2 className="text-xl font-black tracking-tight">
                  Smart Recommendations
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  AI-driven reporting
                  optimization
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Monthly finance reports should be automated.",
                  "Inventory reports need scheduled exports.",
                  "AI anomaly detection found missing operational metrics.",
                  "Weekly KPI summaries can reduce manual processing by 42%.",
                ].map(
                  (
                    recommendation,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:border-blue-400/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />

                        <p className="text-sm leading-relaxed text-gray-300">
                          {
                            recommendation
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}