"use client";

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Filter,
  LayoutGrid,
  ListFilter,
  Search,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  User2,
  Users,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late";

type AttendanceRecord = {
  id: number;
  name: string;
  date: string;
  status: AttendanceStatus;
};

type SortField =
  | "id"
  | "name"
  | "date"
  | "status";

type SortOrder =
  | "asc"
  | "desc";

/* =========================================================
   MOCK DATA
========================================================= */

const RECORDS: AttendanceRecord[] =
  [
    {
      id: 1,
      name: "Rahim Ahmed",
      date: "2026-06-29",
      status: "Present",
    },
    {
      id: 2,
      name: "Karim Hasan",
      date: "2026-06-29",
      status: "Late",
    },
    {
      id: 3,
      name: "Nusrat Jahan",
      date: "2026-06-28",
      status: "Absent",
    },
    {
      id: 4,
      name: "Sabbir Khan",
      date: "2026-06-28",
      status: "Present",
    },
    {
      id: 5,
      name: "Farzana Islam",
      date: "2026-06-27",
      status: "Present",
    },
    {
      id: 6,
      name: "Tanvir Alam",
      date: "2026-06-27",
      status: "Late",
    },
    {
      id: 7,
      name: "Jannat Mim",
      date: "2026-06-26",
      status: "Absent",
    },
    {
      id: 8,
      name: "Sakib Hossain",
      date: "2026-06-26",
      status: "Present",
    },
  ];

/* =========================================================
   PAGE
========================================================= */

export default function AttendanceHistoryPage() {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      AttendanceStatus | "All"
    >("All");

  const [sortField, setSortField] =
    useState<SortField>("id");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("asc");

  const [page, setPage] =
    useState(1);

  const ITEMS_PER_PAGE = 5;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRecords =
    useMemo(() => {
      const filtered =
        RECORDS.filter(
          (record) => {
            const matchesSearch =
              record.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                );

            const matchesStatus =
              statusFilter ===
                "All" ||
              record.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );

      filtered.sort(
        (a, b) => {
          const aValue =
            a[
              sortField
            ].toString();

          const bValue =
            b[
              sortField
            ].toString();

          if (
            sortOrder ===
            "asc"
          ) {
            return aValue.localeCompare(
              bValue
            );
          }

          return bValue.localeCompare(
            aValue
          );
        }
      );

      return filtered;
    }, [
      search,
      statusFilter,
      sortField,
      sortOrder,
    ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.ceil(
      filteredRecords.length /
        ITEMS_PER_PAGE
    );

  const paginatedRecords =
    useMemo(() => {
      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return filteredRecords.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );
    }, [
      filteredRecords,
      page,
    ]);

  /* =========================================================
     METRICS
  ========================================================= */

  const analytics =
    useMemo(() => {
      const present =
        RECORDS.filter(
          (r) =>
            r.status ===
            "Present"
        ).length;

      const absent =
        RECORDS.filter(
          (r) =>
            r.status ===
            "Absent"
        ).length;

      const late =
        RECORDS.filter(
          (r) =>
            r.status ===
            "Late"
        ).length;

      return {
        total:
          RECORDS.length,
        present,
        absent,
        late,
        rate: `${Math.round(
          (present /
            RECORDS.length) *
            100
        )}%`,
      };
    }, []);

  /* =========================================================
     SORT
  ========================================================= */

  const handleSort =
    useCallback(
      (
        field: SortField
      ) => {
        if (
          sortField === field
        ) {
          setSortOrder(
            (prev) =>
              prev ===
              "asc"
                ? "desc"
                : "asc"
          );
        } else {
          setSortField(field);
          setSortOrder(
            "asc"
          );
        }
      },
      [sortField]
    );

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%),#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_24%),#020617] dark:text-white">

      {/* GRID */}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="overflow-hidden rounded-[38px] border border-slate-200/70 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">

          <div className="relative p-5 md:p-7 xl:p-8">

            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              {/* LEFT */}

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                  <Sparkles size={14} />
                  Smart Attendance Analytics
                </div>

                <h1 className="mt-5 bg-gradient-to-r from-slate-900 via-cyan-700 to-violet-700 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-violet-300 md:text-5xl">
                  Attendance History
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400">
                  Enterprise-grade attendance intelligence dashboard with
                  realtime filtering, analytics, performance tracking and
                  workforce attendance monitoring.
                </p>
              </div>

              {/* RIGHT */}

              <div className="grid grid-cols-2 gap-4 xl:w-[620px]">

                <AnalyticsCard
                  title="Total Records"
                  value={String(
                    analytics.total
                  )}
                  icon={
                    <Users
                      size={20}
                    />
                  }
                  color="cyan"
                />

                <AnalyticsCard
                  title="Attendance Rate"
                  value={
                    analytics.rate
                  }
                  icon={
                    <TrendingUp
                      size={20}
                    />
                  }
                  color="emerald"
                />

                <AnalyticsCard
                  title="Late Entries"
                  value={String(
                    analytics.late
                  )}
                  icon={
                    <Clock3
                      size={20}
                    />
                  }
                  color="amber"
                />

                <AnalyticsCard
                  title="Absentees"
                  value={String(
                    analytics.absent
                  )}
                  icon={
                    <XCircle
                      size={20}
                    />
                  }
                  color="rose"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TABLE SECTION
        ===================================================== */}

        <section className="mt-8 rounded-[38px] border border-slate-200/70 bg-white/80 shadow-[0_20px_100px_rgba(15,23,42,0.06)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">

          {/* HEADER */}

          <div className="flex flex-col gap-5 border-b border-slate-200/70 p-5 dark:border-white/10 md:p-7 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Attendance Records
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Smart searchable employee attendance management table
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search employee..."
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) => {
                    setSearch(
                      e.target
                        .value
                    );

                    setPage(1);
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white md:w-[280px]"
                />
              </div>

              {/* FILTER */}

              <div className="relative">

                <Filter
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    e
                  ) => {
                    setStatusFilter(
                      e.target
                        .value as AttendanceStatus
                    );

                    setPage(1);
                  }}
                  className="h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Present">
                    Present
                  </option>

                  <option value="Late">
                    Late
                  </option>

                  <option value="Absent">
                    Absent
                  </option>
                </select>
              </div>

              {/* EXPORT */}

              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-5 text-sm font-black text-white shadow-[0_20px_60px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-[2px] active:scale-[0.98]">
                <Download
                  size={16}
                />
                Export
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200/70 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03]">

                <tr>

                  <TableHead
                    label="ID"
                    onClick={() =>
                      handleSort(
                        "id"
                      )
                    }
                  />

                  <TableHead
                    label="Employee"
                    onClick={() =>
                      handleSort(
                        "name"
                      )
                    }
                  />

                  <TableHead
                    label="Date"
                    onClick={() =>
                      handleSort(
                        "date"
                      )
                    }
                  />

                  <TableHead
                    label="Status"
                    onClick={() =>
                      handleSort(
                        "status"
                      )
                    }
                  />

                  <th className="px-6 py-5 text-right text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {paginatedRecords.length >
                0 ? (
                  paginatedRecords.map(
                    (
                      record
                    ) => (
                      <tr
                        key={
                          record.id
                        }
                        className="border-b border-slate-200/60 transition-all duration-300 hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                      >

                        <td className="px-6 py-5">

                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-sm font-black text-cyan-700 dark:text-cyan-300">
                            {
                              record.id
                            }
                          </div>
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                              <User2
                                size={
                                  20
                                }
                              />
                            </div>

                            <div>

                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                {
                                  record.name
                                }
                              </h3>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Employee ID #
                                {
                                  record.id
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">

                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                            <CalendarDays
                              size={
                                14
                              }
                            />

                            {
                              record.date
                            }
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">

                          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                            <Eye
                              size={
                                16
                              }
                            />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300">
                          <TriangleAlert
                            size={
                              34
                            }
                          />
                        </div>

                        <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                          No Records Found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-5 border-t border-slate-200/70 p-5 dark:border-white/10 md:flex-row md:items-center md:justify-between md:p-7">

            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-400">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Activity
                  size={18}
                />
              </div>

              Showing{" "}
              <span className="font-black text-slate-900 dark:text-white">
                {
                  paginatedRecords.length
                }
              </span>{" "}
              of{" "}
              <span className="font-black text-slate-900 dark:text-white">
                {
                  filteredRecords.length
                }
              </span>{" "}
              records
            </div>

            {/* PAGINATION */}

            <div className="flex items-center gap-3">

              <button
                disabled={
                  page === 1
                }
                onClick={() =>
                  setPage(
                    (
                      prev
                    ) =>
                      Math.max(
                        prev -
                          1,
                        1
                      )
                  )
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                <LayoutGrid
                  size={16}
                />
                Page {page} /
                {totalPages}
              </div>

              <button
                disabled={
                  page ===
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      prev
                    ) =>
                      Math.min(
                        prev +
                          1,
                        totalPages
                      )
                  )
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <ChevronRight
                  size={18}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

const AnalyticsCard = memo(
  function AnalyticsCard({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color:
      | "cyan"
      | "emerald"
      | "amber"
      | "rose";
  }) {
    const colors = {
      cyan:
        "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      emerald:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      amber:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      rose:
        "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    };

    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
    );
  }
);

const TableHead = memo(
  function TableHead({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) {
    return (
      <th
        onClick={
          onClick
        }
        className="cursor-pointer px-6 py-5 text-left text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 transition-all duration-300 hover:text-cyan-600 dark:hover:text-cyan-300"
      >

        <div className="inline-flex items-center gap-2">

          {label}

          <ArrowDownUp
            size={14}
          />
        </div>
      </th>
    );
  }
);

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: AttendanceStatus;
  }) {
    const styles = {
      Present:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      Late:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      Absent:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    };

    const icons = {
      Present: (
        <CheckCircle2
          size={14}
        />
      ),
      Late: (
        <Clock3
          size={14}
        />
      ),
      Absent: (
        <XCircle
          size={14}
        />
      ),
    };

    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${styles[status]}`}
      >
        {icons[status]}
        {status}
      </div>
    );
  }
);