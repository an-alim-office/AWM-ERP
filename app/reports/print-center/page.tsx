"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type QueueStatus =
  | "Ready"
  | "Printing"
  | "Completed"
  | "Failed";

interface PrintJob {
  id: string;
  document: string;
  department: string;
  pages: number;
  printer: string;
  status: QueueStatus;
  requestedBy: string;
  createdAt: string;
  progress: number;
}

const PRINT_QUEUE: PrintJob[] = [
  {
    id: "PRT-1001",
    document:
      "Factory Financial Report Q2.pdf",
    department: "Finance",
    pages: 84,
    printer:
      "HP Enterprise X900",
    status: "Printing",
    requestedBy:
      "Abdullah Mamun",
    createdAt:
      "2026-06-29 09:45 AM",
    progress: 72,
  },
  {
    id: "PRT-1002",
    document:
      "Production KPI Sheet.xlsx",
    department:
      "Manufacturing",
    pages: 18,
    printer:
      "Canon BizHub 420",
    status: "Ready",
    requestedBy:
      "Tarek Rahman",
    createdAt:
      "2026-06-29 09:12 AM",
    progress: 0,
  },
  {
    id: "PRT-1003",
    document:
      "Employee Payroll.pdf",
    department: "HR",
    pages: 42,
    printer:
      "Xerox OfficeJet Pro",
    status: "Completed",
    requestedBy:
      "Hasan Mahmud",
    createdAt:
      "2026-06-29 08:58 AM",
    progress: 100,
  },
  {
    id: "PRT-1004",
    document:
      "Warehouse Audit Logs.pdf",
    department: "Logistics",
    pages: 26,
    printer:
      "HP Enterprise X900",
    status: "Failed",
    requestedBy:
      "Bilal Hossain",
    createdAt:
      "2026-06-29 08:10 AM",
    progress: 38,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const LoadingCard = memo(
  () => (
    <div
      className={`h-36 rounded-[28px] border border-white/10 bg-white/[0.03] ${shimmer}`}
    />
  )
);

LoadingCard.displayName =
  "LoadingCard";

export default function PrintCenterPage() {
  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      QueueStatus | "All"
    >("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setLoading(false);
    }, 900);

    return () =>
      clearTimeout(timer);
  }, []);

  const filteredJobs =
    useMemo(() => {
      return PRINT_QUEUE.filter(
        (job) => {
          const matchesSearch =
            job.document
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            job.id
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            job.department
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter ===
            "All"
              ? true
              : job.status ===
                statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [search, statusFilter]);

  const stats = useMemo(
    () => ({
      active:
        PRINT_QUEUE.filter(
          (p) =>
            p.status ===
            "Printing"
        ).length,
      queued:
        PRINT_QUEUE.filter(
          (p) =>
            p.status ===
            "Ready"
        ).length,
      completed:
        PRINT_QUEUE.filter(
          (p) =>
            p.status ===
            "Completed"
        ).length,
      failed:
        PRINT_QUEUE.filter(
          (p) =>
            p.status ===
            "Failed"
        ).length,
    }),
    []
  );

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#030712] text-white"
          : "bg-[#f5f7fb] text-slate-900"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px] space-y-6">
          {/* Header */}
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
            <div className="relative p-6 md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]" />

              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                    Smart Print Network
                  </div>

                  <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                    Print Center
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">
                    Enterprise-grade
                    centralized print
                    management system with
                    realtime queue
                    tracking, smart routing,
                    printer health
                    monitoring, secure
                    document delivery and
                    AI-powered workflow
                    optimization.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setDarkMode(
                      (prev) => !prev
                    )
                  }
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
                >
                  {darkMode
                    ? "Light Mode"
                    : "Dark Mode"}
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                title:
                  "Active Printing",
                value:
                  stats.active,
                color:
                  "text-cyan-300",
              },
              {
                title:
                  "Queued Jobs",
                value:
                  stats.queued,
                color:
                  "text-amber-300",
              },
              {
                title:
                  "Completed",
                value:
                  stats.completed,
                color:
                  "text-emerald-300",
              },
              {
                title:
                  "Failed Tasks",
                value:
                  stats.failed,
                color:
                  "text-red-300",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {item.title}
                </p>

                <h2
                  className={`mt-4 text-4xl font-black ${item.color}`}
                >
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Queue Table */}
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
              <div className="border-b border-white/10 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Print Queue
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Realtime print
                      workflow monitoring
                      & document routing.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <select
                      value={
                        statusFilter
                      }
                      onChange={(e) =>
                        setStatusFilter(
                          e.target
                            .value as
                            | QueueStatus
                            | "All"
                        )
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none"
                    >
                      <option value="All">
                        All Status
                      </option>
                      <option value="Ready">
                        Ready
                      </option>
                      <option value="Printing">
                        Printing
                      </option>
                      <option value="Completed">
                        Completed
                      </option>
                      <option value="Failed">
                        Failed
                      </option>
                    </select>

                    <input
                      type="text"
                      placeholder="Search queue..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none md:w-72"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-5 p-5">
                  {Array.from({
                    length: 4,
                  }).map(
                    (_, idx) => (
                      <LoadingCard
                        key={idx}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20">
                        {[
                          "Document",
                          "Department",
                          "Printer",
                          "Pages",
                          "Progress",
                          "Status",
                          "Created",
                        ].map(
                          (
                            heading
                          ) => (
                            <th
                              key={
                                heading
                              }
                              className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-gray-500"
                            >
                              {
                                heading
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredJobs.map(
                        (
                          job,
                          index
                        ) => (
                          <tr
                            key={
                              job.id
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
                                <p className="font-bold">
                                  {
                                    job.document
                                  }
                                </p>

                                <p className="mt-1 text-xs font-mono text-gray-500">
                                  {
                                    job.id
                                  }
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-sm text-gray-300">
                              {
                                job.department
                              }
                            </td>

                            <td className="px-6 py-5 text-sm text-gray-300">
                              {
                                job.printer
                              }
                            </td>

                            <td className="px-6 py-5 font-mono text-cyan-300">
                              {
                                job.pages
                              }
                            </td>

                            <td className="px-6 py-5">
                              <div className="w-[160px]">
                                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                  <span>
                                    Progress
                                  </span>

                                  <span className="text-white">
                                    {
                                      job.progress
                                    }

                                    %
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    style={{
                                      width: `${job.progress}%`,
                                    }}
                                    className={`h-full rounded-full ${
                                      job.status ===
                                      "Failed"
                                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                                        : "bg-gradient-to-r from-cyan-500 to-violet-500"
                                    }`}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                  job.status ===
                                  "Completed"
                                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                    : job.status ===
                                      "Printing"
                                    ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                                    : job.status ===
                                      "Ready"
                                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                                    : "border border-red-500/20 bg-red-500/10 text-red-300"
                                }`}
                              >
                                {
                                  job.status
                                }
                              </span>
                            </td>

                            <td className="px-6 py-5 text-xs font-mono text-gray-400">
                              {
                                job.createdAt
                              }
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Monitoring */}
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Printer Network
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      Smart Routing
                    </h3>
                  </div>

                  <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">
                    Online
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      title:
                        "Queue Optimization",
                      value: "96%",
                    },
                    {
                      title:
                        "Printer Health",
                      value: "98%",
                    },
                    {
                      title:
                        "Document Security",
                      value: "Active",
                    },
                  ].map((item) => (
                    <div
                      key={
                        item.title
                      }
                    >
                      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-500">
                        <span>
                          {
                            item.title
                          }
                        </span>

                        <span className="text-white">
                          {
                            item.value
                          }
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all duration-300 hover:scale-[1.02]">
                  Open Print Queue
                </button>
              </div>

              {/* Live Activity */}
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-xl font-black">
                    Live Activity
                  </h3>

                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Realtime
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    "Finance report started printing.",
                    "Warehouse audit failed validation.",
                    "Payroll document securely delivered.",
                    "AI queue optimization updated.",
                  ].map(
                    (
                      activity,
                      idx
                    ) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"
                      >
                        {
                          activity
                        }
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Storage */}
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6 backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Secure Archive
                </p>

                <h3 className="mt-3 text-4xl font-black">
                  12.8TB
                </h3>

                <p className="mt-3 text-sm text-gray-400">
                  Encrypted print
                  history & enterprise
                  document retention
                  storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}