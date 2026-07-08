"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type ExportFormat =
  | "PDF"
  | "EXCEL"
  | "CSV";

interface ExportHistory {
  id: string;
  name: string;
  type: ExportFormat;
  size: string;
  generatedAt: string;
  status:
    | "Completed"
    | "Processing"
    | "Failed";
}

const exportModules = [
  "Financial Statement",
  "Payroll Summary",
  "Attendance Report",
  "Production KPI",
  "Inventory Analytics",
  "Sales Overview",
];

const initialHistory: ExportHistory[] =
  [
    {
      id: "EXP-1001",
      name: "Financial_Report_Q2_2026.pdf",
      type: "PDF",
      size: "2.8 MB",
      generatedAt:
        "2026-06-28 10:42 AM",
      status: "Completed",
    },
    {
      id: "EXP-1002",
      name:
        "Payroll_Summary_May_2026.xlsx",
      type: "EXCEL",
      size: "1.1 MB",
      generatedAt:
        "2026-06-28 09:10 AM",
      status: "Completed",
    },
    {
      id: "EXP-1003",
      name:
        "Attendance_Log_Week_4.csv",
      type: "CSV",
      size: "650 KB",
      generatedAt:
        "2026-06-27 06:22 PM",
      status: "Processing",
    },
  ];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const LoadingCard = memo(() => {
  return (
    <div
      className={`h-44 rounded-3xl border border-white/10 bg-white/[0.03] ${shimmer}`}
    />
  );
});

LoadingCard.displayName =
  "LoadingCard";

export default function ExportPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedModule, setSelectedModule] =
    useState("Financial Statement");

  const [
    exportHistory,
    setExportHistory,
  ] = useState<
    ExportHistory[]
  >(initialHistory);

  const [isExporting, setIsExporting] =
    useState<ExportFormat | null>(
      null
    );

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = async (
    format: ExportFormat
  ) => {
    setIsExporting(format);

    setTimeout(() => {
      const extension =
        format === "PDF"
          ? "pdf"
          : format === "EXCEL"
          ? "xlsx"
          : "csv";

      const newFile: ExportHistory =
        {
          id: `EXP-${Math.floor(
            Math.random() * 9000
          )}`,
          name: `${selectedModule.replaceAll(
            " ",
            "_"
          )}_${new Date()
            .toISOString()
            .split("T")[0]}.${extension}`,
          type: format,
          size: `${
            Math.floor(
              Math.random() * 5
            ) + 1
          }.${Math.floor(
            Math.random() * 9
          )} MB`,
          generatedAt:
            new Date().toLocaleString(),
          status: "Completed",
        };

      setExportHistory((prev) => [
        newFile,
        ...prev,
      ]);

      setIsExporting(null);
    }, 1800);
  };

  const filteredHistory =
    useMemo(() => {
      return exportHistory.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          item.id
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [
      exportHistory,
      search,
    ]);

  const stats = useMemo(() => {
    return {
      total:
        exportHistory.length,
      completed:
        exportHistory.filter(
          (x) =>
            x.status ===
            "Completed"
        ).length,
      processing:
        exportHistory.filter(
          (x) =>
            x.status ===
            "Processing"
        ).length,
      secure: "AES-256",
    };
  }, [exportHistory]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#050816] text-white"
          : "bg-[#f3f7fb] text-[#111827]"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Enterprise Export Engine
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Export Center
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">
                AI-powered export
                management for enterprise
                reporting, financial
                statements, workforce
                analytics and secure
                document distribution.
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

          {/* KPI Stats */}
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
                  "Completed",
                value:
                  stats.completed,
                color:
                  "text-emerald-400",
              },
              {
                title:
                  "Processing",
                value:
                  stats.processing,
                color:
                  "text-amber-400",
              },
              {
                title:
                  "Encryption",
                value: stats.secure,
                color:
                  "text-violet-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {item.title}
                </p>

                <h2
                  className={`mt-4 text-4xl font-black ${item.color}`}
                >
                  {mounted
                    ? item.value
                    : "--"}
                </h2>
              </div>
            ))}
          </div>

          {/* Export Actions */}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {mounted ? (
              <>
                {/* PDF */}
                <div className="group relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_45%)]" />

                  <div className="relative z-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-3xl">
                      📄
                    </div>

                    <h3 className="text-2xl font-black text-blue-300">
                      Export PDF
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      Secure enterprise PDF
                      reports with digital
                      watermark, signature &
                      print-ready formatting.
                    </p>

                    <div className="mt-6">
                      <button
                        onClick={() =>
                          handleExport(
                            "PDF"
                          )
                        }
                        disabled={
                          isExporting ===
                          "PDF"
                        }
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-sm font-black uppercase tracking-wide text-white transition-all duration-300 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60"
                      >
                        {isExporting ===
                        "PDF" ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Exporting...
                          </>
                        ) : (
                          "Download PDF"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Excel */}
                <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_45%)]" />

                  <div className="relative z-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-3xl">
                      📊
                    </div>

                    <h3 className="text-2xl font-black text-emerald-300">
                      Export Excel
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      Advanced spreadsheet
                      exports with formulas,
                      filters, charts &
                      enterprise analytics.
                    </p>

                    <div className="mt-6">
                      <button
                        onClick={() =>
                          handleExport(
                            "EXCEL"
                          )
                        }
                        disabled={
                          isExporting ===
                          "EXCEL"
                        }
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 text-sm font-black uppercase tracking-wide text-white transition-all duration-300 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-60"
                      >
                        {isExporting ===
                        "EXCEL" ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Exporting...
                          </>
                        ) : (
                          "Download Excel"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CSV */}
                <div className="group relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-violet-400/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_45%)]" />

                  <div className="relative z-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-3xl">
                      🗂️
                    </div>

                    <h3 className="text-2xl font-black text-violet-300">
                      Export CSV
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      Lightweight raw data
                      export optimized for
                      BI tools, APIs &
                      external systems.
                    </p>

                    <div className="mt-6">
                      <button
                        onClick={() =>
                          handleExport(
                            "CSV"
                          )
                        }
                        disabled={
                          isExporting ===
                          "CSV"
                        }
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 text-sm font-black uppercase tracking-wide text-white transition-all duration-300 hover:bg-violet-500 active:scale-[0.98] disabled:opacity-60"
                      >
                        {isExporting ===
                        "CSV" ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Exporting...
                          </>
                        ) : (
                          "Download CSV"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </>
            )}
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Export Activity
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Realtime export logs &
                document generation
                history.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={selectedModule}
                onChange={(e) =>
                  setSelectedModule(
                    e.target.value
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur-xl"
              >
                {exportModules.map(
                  (module) => (
                    <option
                      key={module}
                      value={module}
                    >
                      {module}
                    </option>
                  )
                )}
              </select>

              <input
                type="text"
                placeholder="Search export history..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur-xl md:w-80"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-white/10 bg-black/10">
                  <tr>
                    {[
                      "Export ID",
                      "File Name",
                      "Type",
                      "Size",
                      "Generated At",
                      "Status",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-cyan-300">
                          {item.id}
                        </td>

                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Enterprise
                              export file
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                              item.type ===
                              "PDF"
                                ? "border border-blue-500/20 bg-blue-500/10 text-blue-300"
                                : item.type ===
                                  "EXCEL"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border border-violet-500/20 bg-violet-500/10 text-violet-300"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-400">
                          {item.size}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm text-gray-400">
                          {
                            item.generatedAt
                          }
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                              item.status ===
                              "Completed"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : item.status ===
                                  "Processing"
                                ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                                : "border border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {item.status}
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
                  No Export Records
                </h3>

                <p className="mt-3 max-w-md text-sm text-gray-400">
                  No matching export
                  activity found for your
                  current search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}