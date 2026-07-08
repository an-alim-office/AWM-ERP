"use client";

import React, { useEffect, useMemo, useState } from "react";

type ReportFormat = "PDF" | "Excel" | "CSV";

type Report = {
  id: string;
  name: string;
  date: string;
  format: ReportFormat;
  size?: string;
};

const INITIAL_REPORTS: Report[] = [
  { id: "REP-001", name: "Monthly Balance Sheet", date: "June 2026", format: "PDF", size: "2.4MB" },
  { id: "REP-002", name: "Quarterly Tax Summary", date: "Q2 2026", format: "Excel", size: "1.1MB" },
  { id: "REP-003", name: "Annual Revenue Audit", date: "2025", format: "PDF", size: "4.8MB" },
];

const FORMAT_STYLE: Record<ReportFormat, string> = {
  PDF: "bg-red-500/10 text-red-400 border-red-500/20",
  Excel: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CSV: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function FinancialReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<"all" | ReportFormat>("all");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pdf: reports.filter((r) => r.format === "PDF").length,
      excel: reports.filter((r) => r.format === "Excel").length,
    };
  }, [reports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());

      const matchFormat =
        formatFilter === "all" ? true : r.format === formatFilter;

      return matchSearch && matchFormat;
    });
  }, [reports, search, formatFilter]);

  const handleDownload = (id: string) => {
    setLoadingId(id);

    setTimeout(() => {
      setLoadingId(null);
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Financial Intelligence Reports
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate, analyze & export enterprise financial data
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Total</div>
          <div className="text-lg font-bold">{stats.total}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">PDF</div>
          <div className="text-lg font-bold text-red-400">{stats.pdf}</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="text-xs text-slate-400">Excel</div>
          <div className="text-lg font-bold text-emerald-400">
            {stats.excel}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="flex-1 p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
        />

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value as any)}
          className="p-3 rounded-lg bg-slate-950 border border-slate-800"
        >
          <option value="all">All Formats</option>
          <option value="PDF">PDF</option>
          <option value="Excel">Excel</option>
          <option value="CSV">CSV</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-600 transition"
          >
            {/* TOP */}
            <div className="flex justify-between items-start mb-4">
              <span
                className={`text-xs px-2 py-1 rounded border ${
                  FORMAT_STYLE[report.format]
                }`}
              >
                {report.format}
              </span>

              <span className="text-xs text-slate-500">{report.id}</span>
            </div>

            {/* BODY */}
            <h2 className="text-lg font-bold mb-1">{report.name}</h2>
            <p className="text-xs text-slate-400 mb-2">{report.date}</p>

            {report.size && (
              <p className="text-xs text-slate-500 mb-4">
                Size: {report.size}
              </p>
            )}

            {/* ACTION */}
            <button
              onClick={() => handleDownload(report.id)}
              disabled={loadingId === report.id}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 text-sm font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loadingId === report.id ? "Preparing..." : "Download Report"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}