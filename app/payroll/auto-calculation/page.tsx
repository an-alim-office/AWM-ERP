"use client";

import React, { useMemo, useState } from "react";

type CalcResult = {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  totalPayoutSAR: number;
  status: string;
};

type LogItem = {
  month: string;
  timestamp: number;
  result: CalcResult;
};

function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  );
}

export default function AutoCalculationPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [isProcessing, setIsProcessing] = useState(false);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const stats = useMemo(() => {
    if (!calcResult) return null;
    return {
      successRate: Math.round(
        (calcResult.successCount / calcResult.totalProcessed) * 100
      ),
      failRate: Math.round(
        (calcResult.failedCount / calcResult.totalProcessed) * 100
      ),
    };
  }, [calcResult]);

  const handleAutoCalculate = () => {
    setIsProcessing(true);
    setCalcResult(null);

    setTimeout(() => {
      const result: CalcResult = {
        totalProcessed: 145,
        successCount: 142,
        failedCount: 3,
        totalPayoutSAR: 435000,
        status: "Completed",
      };

      setCalcResult(result);

      setLogs((prev) => [
        { month: selectedMonth, timestamp: Date.now(), result },
        ...prev.slice(0, 9),
      ]);

      setIsProcessing(false);
    }, 1600);
  };

  return (
    <div
      className={`min-h-screen w-full p-6 md:p-10 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#070b14] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Auto Payroll Calculation Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise-grade automated salary processing system
          </p>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2 rounded-xl border border-slate-700 text-xs hover:border-emerald-400 transition"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* CONTROL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex flex-col md:flex-row gap-4 md:items-end justify-between">
            <div>
              <label className="text-xs text-slate-400">
                Processing Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
              />
            </div>

            <button
              onClick={handleAutoCalculate}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {isProcessing ? "Processing Payroll..." : "Run Auto Calculation"}
            </button>
          </div>
        </div>

        {/* QUICK INFO */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
            System Status
          </h2>

          <div className="text-sm text-slate-300">
            Mode: <span className="text-emerald-400">AI-Automated</span>
          </div>
          <div className="text-sm text-slate-300">
            Security: <span className="text-blue-400">Enterprise Grade</span>
          </div>
          <div className="text-sm text-slate-300">
            Region: <span className="text-cyan-400">Cloud Sync</span>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Spinner />
          <p className="text-sm text-slate-400 mt-4 max-w-md">
            Processing attendance, overtime, deductions, bonuses and tax rules...
          </p>
        </div>
      )}

      {/* RESULT */}
      {calcResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-3 p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
              Calculation Summary ({selectedMonth})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-xl font-bold">
                  {calcResult.totalProcessed}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-xs text-emerald-400">Success</div>
                <div className="text-xl font-bold text-emerald-300">
                  {calcResult.successCount}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <div className="text-xs text-red-400">Failed</div>
                <div className="text-xl font-bold text-red-300">
                  {calcResult.failedCount}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-xs text-blue-400">SAR Budget</div>
                <div className="text-xl font-bold text-blue-300">
                  {calcResult.totalPayoutSAR.toLocaleString()}
                </div>
              </div>
            </div>

            {stats && (
              <div className="mt-4 text-xs text-slate-400 flex gap-4">
                <span>Success Rate: {stats.successRate}%</span>
                <span>Failure Rate: {stats.failRate}%</span>
                <span>Status: {calcResult.status}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGS */}
      {logs.length > 0 && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
            Execution History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {logs.map((l, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/40"
              >
                <div className="text-xs text-slate-400">{l.month}</div>
                <div className="text-sm font-semibold">
                  {l.result.totalProcessed} processed
                </div>
                <div className="text-xs text-slate-500">
                  SAR {l.result.totalPayoutSAR.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}