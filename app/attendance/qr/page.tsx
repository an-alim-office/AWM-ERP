"use client";

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ScanStatus =
  | "Idle"
  | "Scanning"
  | "Success"
  | "Failed";

type ScanRecord = {
  id: string;
  name: string;
  time: string;
  status: "Success" | "Failed";
  location: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const SCAN_HISTORY: ScanRecord[] = [
  {
    id: "QR-1001",
    name: "Rahim Ahmed",
    time: "09:01 AM",
    status: "Success",
    location: "Main Gate",
  },
  {
    id: "QR-1002",
    name: "Karim Hasan",
    time: "09:10 AM",
    status: "Success",
    location: "Main Gate",
  },
  {
    id: "QR-1003",
    name: "Nusrat Jahan",
    time: "09:18 AM",
    status: "Failed",
    location: "Side Gate",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function QRAttendancePage() {
  const [status, setStatus] =
    useState<ScanStatus>("Idle");

  const [scanning, setScanning] =
    useState(false);

  const [result, setResult] =
    useState<string | null>(null);

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const analytics = useMemo(() => {
    const success =
      SCAN_HISTORY.filter(
        (r) => r.status === "Success"
      ).length;

    const failed =
      SCAN_HISTORY.filter(
        (r) => r.status === "Failed"
      ).length;

    return {
      total: SCAN_HISTORY.length,
      success,
      failed,
      rate: `${Math.round(
        (success / SCAN_HISTORY.length) *
          100
      )}%`,
    };
  }, []);

  /* =========================================================
     SCAN ACTION
  ========================================================= */

  const handleScan = useCallback(() => {
    setScanning(true);
    setStatus("Scanning");
    setResult(null);

    setTimeout(() => {
      const ok = Math.random() > 0.3;

      if (ok) {
        setStatus("Success");
        setResult(
          "QR Verified Successfully"
        );
      } else {
        setStatus("Failed");
        setResult("Invalid QR Code");
      }

      setScanning(false);
    }, 1800);
  }, []);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_24%),#f8fafc] text-slate-900 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_24%),#020617] dark:text-white">

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">

        {/* GRID BG */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[38px] border border-slate-200/70 bg-white/80 backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

          <div className="p-6 md:p-8 xl:p-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                <Sparkles size={14} />
                QR Attendance System
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                  QR Attendance
                </span>
              </h1>

              <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-400">
                Enterprise QR-based attendance verification system with
                real-time scanning, secure validation and automated entry tracking.
              </p>
            </div>

            {/* ANALYTICS */}
            <div className="grid grid-cols-2 gap-4 xl:w-[620px]">

              <StatCard
                title="Total Scans"
                value={String(analytics.total)}
                icon={<QrCode size={18} />}
                color="cyan"
              />

              <StatCard
                title="Success Rate"
                value={analytics.rate}
                icon={<CheckCircle2 size={18} />}
                color="emerald"
              />

              <StatCard
                title="Failed"
                value={String(analytics.failed)}
                icon={<XCircle size={18} />}
                color="rose"
              />

              <StatCard
                title="Realtime"
                value="Active"
                icon={<Zap size={18} />}
                color="violet"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="mt-8 grid xl:grid-cols-[1.1fr_0.9fr] gap-8">

          {/* LEFT */}
          <div className="space-y-8">

            {/* SCANNER */}
            <div className="rounded-[38px] border border-slate-200/70 bg-white/80 dark:bg-white/[0.04] dark:border-white/10 backdrop-blur-3xl shadow-[0_25px_90px_rgba(15,23,42,0.06)] p-6 md:p-8 text-center">

              <div className="flex flex-col items-center">

                <div className={`relative w-56 h-56 rounded-3xl border flex items-center justify-center transition-all duration-500 ${
                  scanning
                    ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_80px_rgba(34,211,238,0.25)]"
                    : "border-slate-200 dark:border-white/10"
                }`}>

                  {scanning && (
                    <div className="absolute inset-0 animate-pulse bg-cyan-500/10 rounded-3xl" />
                  )}

                  <ScanLine size={60} className="text-cyan-600 dark:text-cyan-300" />
                </div>

                <h2 className="mt-6 text-2xl font-black">
                  QR Scanner
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Scan employee QR code for instant attendance verification
                </p>

                <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-[0.2em] ${
                  status === "Success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : status === "Failed"
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                }`}>
                  <Activity size={14} />
                  {status}
                </div>

                {result && (
                  <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {result}
                  </p>
                )}

                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-black shadow-[0_20px_60px_rgba(59,130,246,0.25)] hover:-translate-y-[2px] active:scale-95 transition-all disabled:opacity-50"
                >
                  <QrCode size={18} />
                  {scanning ? "Scanning..." : "Start Scan"}
                </button>
              </div>
            </div>

            {/* SECURITY */}
            <div className="rounded-[38px] border border-slate-200/70 bg-white/80 dark:bg-white/[0.04] dark:border-white/10 p-6 md:p-8 backdrop-blur-3xl">

              <div className="flex items-start gap-4">

                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="text-xl font-black">
                    Secure QR Validation
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-7">
                    Encrypted QR authentication layer ensures tamper-proof attendance logging with enterprise-grade validation.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <div className="rounded-[38px] border border-slate-200/70 bg-white/80 dark:bg-white/[0.04] dark:border-white/10 backdrop-blur-3xl p-6 md:p-8">

              <h2 className="text-xl font-black flex items-center gap-2">
                <Users size={18} />
                Recent Scans
              </h2>

              <div className="mt-6 space-y-4">

                {SCAN_HISTORY.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-black text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.id} • {item.time} • {item.location}
                      </p>
                    </div>

                    <div className={`inline-flex items-center gap-2 text-xs font-black px-3 py-1 rounded-full border ${
                      item.status === "Success"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    }`}>
                      {item.status === "Success" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {item.status}
                    </div>
                  </div>
                ))}

              </div>

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

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "cyan" | "emerald" | "rose" | "violet";
}) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 dark:bg-white/[0.04] dark:border-white/10 p-5">
      <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${colors[color]}`}>
        {icon}
      </div>

      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>
    </div>
  );
});