"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Employee {
  id: string;
  name: string;
  dept: string;
  role: string;
  joinDate: string;
  status: "Active" | "Inactive";
  performance: number;
  attendance: number;
  shift: string;
}

const EMPLOYEE_DATA: Employee[] = [
  {
    id: "W101",
    name: "আব্দুল্লাহ আল-মামুন",
    dept: "Construction",
    role: "Mason",
    joinDate: "2024-02-15",
    status: "Active",
    performance: 96,
    attendance: 98,
    shift: "Morning",
  },
  {
    id: "W102",
    name: "মোঃ তারেক রহমান",
    dept: "Engineering",
    role: "Site Engineer",
    joinDate: "2023-11-01",
    status: "Active",
    performance: 92,
    attendance: 95,
    shift: "Day",
  },
  {
    id: "W105",
    name: "হাসান মাহমুদ",
    dept: "Logistics",
    role: "Driver",
    joinDate: "2025-01-10",
    status: "Active",
    performance: 88,
    attendance: 93,
    shift: "Night",
  },
  {
    id: "W109",
    name: "জসিম উদ্দিন",
    dept: "Construction",
    role: "Labor",
    joinDate: "2024-06-20",
    status: "Inactive",
    performance: 52,
    attendance: 61,
    shift: "Morning",
  },
  {
    id: "W120",
    name: "রফিকুল ইসলাম",
    dept: "Engineering",
    role: "Supervisor",
    joinDate: "2022-09-18",
    status: "Active",
    performance: 99,
    attendance: 97,
    shift: "Day",
  },
];

const SkeletonCard = memo(() => (
  <div className="h-[120px] animate-pulse rounded-3xl border border-white/5 bg-[#161b22]" />
));

SkeletonCard.displayName = "SkeletonCard";

const SkeletonRow = memo(() => (
  <div className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
));

SkeletonRow.displayName = "SkeletonRow";

export default function EmployeesReportPage() {
  const [department, setDepartment] =
    useState("all");

  const [status, setStatus] =
    useState("active");

  const [search, setSearch] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(true);

  const [mounted, setMounted] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [employeeData, setEmployeeData] =
    useState<Employee[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsGenerating(true);
    setEmployeeData(null);

    setTimeout(() => {
      let filtered = [...EMPLOYEE_DATA];

      if (department !== "all") {
        filtered = filtered.filter(
          (item) =>
            item.dept === department
        );
      }

      if (status !== "all") {
        filtered = filtered.filter(
          (item) =>
            item.status.toLowerCase() ===
            status
        );
      }

      setEmployeeData(filtered);
      setIsGenerating(false);
    }, 1200);
  };

  const filteredSearchData = useMemo(() => {
    if (!employeeData) return [];

    return employeeData.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.role
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.dept
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [employeeData, search]);

  const analytics = useMemo(() => {
    return {
      total:
        filteredSearchData.length,
      active:
        filteredSearchData.filter(
          (e) =>
            e.status === "Active"
        ).length,
      inactive:
        filteredSearchData.filter(
          (e) =>
            e.status === "Inactive"
        ).length,
      avgPerformance:
        filteredSearchData.length > 0
          ? Math.round(
              filteredSearchData.reduce(
                (acc, item) =>
                  acc +
                  item.performance,
                0
              ) /
                filteredSearchData.length
            )
          : 0,
    };
  }, [filteredSearchData]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#0d1117] text-gray-100"
          : "bg-[#f5f7fb] text-gray-900"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Workforce Intelligence
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                কর্মচারী রিপোর্ট
              </h1>

              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-400">
                Enterprise-grade employee
                analytics dashboard with smart
                filtering, realtime workforce
                monitoring, AI-driven insights &
                advanced HR intelligence system.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
              >
                {darkMode
                  ? "Light Mode"
                  : "Dark Mode"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {!mounted ? (
              Array.from({
                length: 4,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))
            ) : (
              <>
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Total Employees
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-cyan-400">
                    {analytics.total}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Active Employees
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-emerald-400">
                    {analytics.active}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Inactive Employees
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-red-400">
                    {analytics.inactive}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Avg Performance
                  </p>

                  <h2 className="mt-3 text-4xl font-black text-violet-400">
                    {analytics.avgPerformance}%
                  </h2>
                </div>
              </>
            )}
          </div>

          {/* Filter Section */}
          <form
            onSubmit={handleGenerateReport}
            className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl xl:grid-cols-4"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Department
              </label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="all">
                  All Departments
                </option>

                <option value="Construction">
                  Construction
                </option>

                <option value="Engineering">
                  Engineering
                </option>

                <option value="Logistics">
                  Logistics
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Employee Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="all">
                  All Employees
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Smart Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search employee..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 text-sm font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating
                  ? "Generating..."
                  : "Generate Report"}
              </button>
            </div>
          </form>

          {/* Loading */}
          {isGenerating && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-2xl">
              <div className="space-y-4">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <SkeletonRow
                    key={index}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

                <span>
                  AI workforce analytics
                  engine processing...
                </span>
              </div>
            </div>
          )}

          {/* Table */}
          {!isGenerating &&
            employeeData && (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
                {/* Table Header */}
                <div className="border-b border-white/5 px-6 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">
                        Employee Intelligence
                        Table
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        Smart workforce
                        analytics & employee
                        records
                      </p>
                    </div>

                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-300">
                      Total Records:{" "}
                      {
                        filteredSearchData.length
                      }
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1450px]">
                    <thead className="border-b border-white/5 bg-black/10">
                      <tr>
                        {[
                          "Employee ID",
                          "Name",
                          "Department",
                          "Role",
                          "Join Date",
                          "Shift",
                          "Attendance",
                          "Performance",
                          "Status",
                        ].map((head) => (
                          <th
                            key={head}
                            className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSearchData.map(
                        (row) => (
                          <tr
                            key={row.id}
                            className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                          >
                            <td className="px-6 py-5">
                              <span className="font-black text-cyan-400">
                                {row.id}
                              </span>
                            </td>

                            <td className="px-6 py-5 font-semibold">
                              {row.name}
                            </td>

                            <td className="px-6 py-5 text-sm text-cyan-300">
                              {row.dept}
                            </td>

                            <td className="px-6 py-5 text-sm">
                              {row.role}
                            </td>

                            <td className="px-6 py-5 font-mono text-sm">
                              {
                                row.joinDate
                              }
                            </td>

                            <td className="px-6 py-5 text-sm">
                              {row.shift}
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                    style={{
                                      width: `${row.attendance}%`,
                                    }}
                                  />
                                </div>

                                <span className="text-xs font-bold text-cyan-300">
                                  {
                                    row.attendance
                                  }
                                  %
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                    style={{
                                      width: `${row.performance}%`,
                                    }}
                                  />
                                </div>

                                <span className="text-xs font-bold text-violet-300">
                                  {
                                    row.performance
                                  }
                                  %
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                                  row.status ===
                                  "Active"
                                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                    : "border border-red-500/20 bg-red-500/10 text-red-300"
                                }`}
                              >
                                {row.status}
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
            employeeData &&
            filteredSearchData.length ===
              0 && (
              <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-2xl">
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-4xl">
                  👥
                </div>

                <h2 className="text-3xl font-black tracking-tight">
                  No Employee Data Found
                </h2>

                <p className="mt-3 text-sm text-gray-400">
                  Try changing filters or
                  search keywords to find
                  employee records.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}