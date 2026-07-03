"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ExportFile {
  fileName: string;
  size: string;
  date: string;
  status: "Success" | "Failed";
  type: string;
}

const INITIAL_EXPORTS: ExportFile[] = [
  {
    fileName:
      "Salary_Report_April_2026.xlsx",
    size: "142 KB",
    date: "2026-05-01",
    status: "Success",
    type: "Salary",
  },
  {
    fileName:
      "Attendance_Log_May_Week2.xlsx",
    size: "95 KB",
    date: "2026-05-15",
    status: "Success",
    type: "Attendance",
  },
  {
    fileName:
      "Employees_Master_Data.xlsx",
    size: "201 KB",
    date: "2026-05-20",
    status: "Success",
    type: "Employees",
  },
];

const SkeletonRow = memo(() => {
  return (
    <div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
  );
});

SkeletonRow.displayName =
  "SkeletonRow";

const reportOptions = [
  {
    value: "salary",
    label:
      "মাসিক স্যালারি রিপোর্ট",
  },
  {
    value: "attendance",
    label:
      "হাজিরা লগ রিপোর্ট",
  },
  {
    value: "overtime",
    label:
      "ওভারটাইম স্টেটমেন্ট",
  },
  {
    value: "employees",
    label:
      "মাস্টার কর্মী তালিকা",
  },
];

export default function ExcelExportReportPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [reportType, setReportType] =
    useState("salary");

  const [dateRange, setDateRange] =
    useState("2026-05");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState<
      "latest" | "name" | "size"
    >("latest");

  const [isExporting, setIsExporting] =
    useState(false);

  const [
    exportHistory,
    setExportHistory,
  ] = useState<ExportFile[]>(
    INITIAL_EXPORTS
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleExcelExport = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsExporting(true);

    setTimeout(() => {
      const selectedType =
        reportOptions.find(
          (r) =>
            r.value === reportType
        )?.label || "Report";

      const newFile: ExportFile = {
        fileName: `${selectedType.replaceAll(
          " ",
          "_"
        )}_${dateRange}.xlsx`,
        size: `${
          Math.floor(
            Math.random() * 180
          ) + 60
        } KB`,
        date: new Date()
          .toISOString()
          .split("T")[0],
        status: "Success",
        type:
          selectedType.split(
            " "
          )[0],
      };

      setExportHistory((prev) => [
        newFile,
        ...prev,
      ]);

      setIsExporting(false);
    }, 1800);
  };

  const filteredHistory = useMemo(() => {
    let data = [...exportHistory];

    if (search.trim()) {
      data = data.filter((item) =>
        item.fileName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }

    if (sortBy === "name") {
      data.sort((a, b) =>
        a.fileName.localeCompare(
          b.fileName
        )
      );
    }

    if (sortBy === "size") {
      data.sort(
        (a, b) =>
          parseInt(b.size) -
          parseInt(a.size)
      );
    }

    if (sortBy === "latest") {
      data.sort(
        (a, b) =>
          new Date(
            b.date
          ).getTime() -
          new Date(
            a.date
          ).getTime()
      );
    }

    return data;
  }, [
    exportHistory,
    search,
    sortBy,
  ]);

  const stats = useMemo(() => {
    return {
      total:
        exportHistory.length,
      success:
        exportHistory.filter(
          (x) =>
            x.status ===
            "Success"
        ).length,
      generatedToday:
        exportHistory.filter(
          (x) =>
            x.date ===
            new Date()
              .toISOString()
              .split("T")[0]
        ).length,
      storage:
        exportHistory.reduce(
          (acc, curr) =>
            acc +
            parseInt(curr.size),
          0
        ),
    };
  }, [exportHistory]);

  return (
    <div
      className={`min-h-screen overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-[#0b1120] text-gray-100"
          : "bg-[#f4f7fb] text-gray-900"
      }`}
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Enterprise Excel Export Hub
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Excel Reports Center
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
                AI-powered enterprise
                export system for payroll,
                attendance, workforce &
                operational reporting with
                realtime tracking,
                automation and secure
                spreadsheet delivery.
              </p>
            </div>

            <button
              onClick={() =>
                setDarkMode(
                  (prev) => !prev
                )
              }
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-bold backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
            >
              {darkMode
                ? "Light Mode"
                : "Dark Mode"}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                title:
                  "Total Exports",
                value: stats.total,
                color:
                  "text-cyan-400",
              },
              {
                title:
                  "Successful",
                value:
                  stats.success,
                color:
                  "text-emerald-400",
              },
              {
                title:
                  "Generated Today",
                value:
                  stats.generatedToday,
                color:
                  "text-violet-400",
              },
              {
                title:
                  "Storage Usage",
                value: `${stats.storage} KB`,
                color:
                  "text-amber-400",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {card.title}
                </p>

                <h2
                  className={`mt-4 text-4xl font-black ${card.color}`}
                >
                  {mounted
                    ? card.value
                    : "--"}
                </h2>
              </div>
            ))}
          </div>

          {/* Export Form */}
          <form
            onSubmit={
              handleExcelExport
            }
            className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl xl:grid-cols-4"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-emerald-400/40"
              >
                {reportOptions.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Export Month
              </label>

              <input
                type="month"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-emerald-400/40"
                required
              />
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
                placeholder="Search exported file..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-emerald-400/40"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={
                  isExporting
                }
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 text-sm font-black text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    <span>
                      Exporting...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Generate Excel
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Export Queue */}
          {isExporting && (
            <div className="mb-8 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-5 backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />

                <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                  AI Export Engine
                  Running
                </h3>
              </div>

              <div className="space-y-3">
                {Array.from({
                  length: 4,
                }).map((_, idx) => (
                  <SkeletonRow
                    key={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Table Controls */}
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Recent Export History
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Advanced export logs &
                generated spreadsheet
                tracking
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target
                      .value as
                      | "latest"
                      | "name"
                      | "size"
                  )
                }
                className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none backdrop-blur-xl"
              >
                <option value="latest">
                  Latest
                </option>

                <option value="name">
                  File Name
                </option>

                <option value="size">
                  File Size
                </option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="border-b border-white/5 bg-black/10">
                  <tr>
                    {[
                      "File Name",
                      "Type",
                      "Size",
                      "Created Date",
                      "Status",
                      "Security",
                      "Action",
                    ].map((item) => (
                      <th
                        key={item}
                        className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map(
                    (
                      file,
                      index
                    ) => (
                      <tr
                        key={`${file.fileName}-${index}`}
                        className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/10 text-xl">
                              📊
                            </div>

                            <div>
                              <p className="font-semibold text-cyan-300">
                                {
                                  file.fileName
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Enterprise
                                Excel
                                Document
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                            {file.type}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-gray-300">
                          {file.size}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm text-gray-400">
                          {file.date}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                              file.status ===
                              "Success"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {file.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-violet-300">
                            Encrypted
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300">
                            Download
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {filteredHistory.length ===
              0 && (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-4xl">
                  📁
                </div>

                <h3 className="text-3xl font-black">
                  No Export Files Found
                </h3>

                <p className="mt-3 max-w-md text-sm text-gray-400">
                  No exported spreadsheets
                  match your current search
                  or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}