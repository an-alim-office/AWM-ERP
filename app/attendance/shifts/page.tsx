"use client";

import React, { memo, useMemo, useState } from "react";
import {
  CalendarClock,
  Clock3,
  Users,
  CalendarDays,
  ArrowRight,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Zap,
  Coffee,
  Moon,
  Sun,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ShiftStatus = "Active" | "Upcoming" | "Completed";

type Shift = {
  id: string;
  title: string;
  department: string;
  start: string;
  end: string;
  status: ShiftStatus;
  employees: number;
  location: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const SHIFTS: Shift[] = [
  {
    id: "SH-1001",
    title: "Morning Shift",
    department: "Operations",
    start: "08:00 AM",
    end: "04:00 PM",
    status: "Active",
    employees: 24,
    location: "Main Office",
  },
  {
    id: "SH-1002",
    title: "Evening Shift",
    department: "Support",
    start: "04:00 PM",
    end: "12:00 AM",
    status: "Upcoming",
    employees: 18,
    location: "Branch A",
  },
  {
    id: "SH-1003",
    title: "Night Shift",
    department: "Security",
    start: "12:00 AM",
    end: "08:00 AM",
    status: "Completed",
    employees: 12,
    location: "HQ",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ShiftsPage() {
  const [filter, setFilter] = useState<ShiftStatus | "All">("All");

  const filtered = useMemo(() => {
    if (filter === "All") return SHIFTS;
    return SHIFTS.filter((s) => s.status === filter);
  }, [filter]);

  const stats = useMemo(() => {
    return {
      total: SHIFTS.length,
      active: SHIFTS.filter((s) => s.status === "Active").length,
      upcoming: SHIFTS.filter((s) => s.status === "Upcoming").length,
      completed: SHIFTS.filter((s) => s.status === "Completed").length,
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_25%),#f8fafc] dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_25%),#020617] text-slate-900 dark:text-white">

      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8 space-y-8">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[38px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl shadow-[0_30px_120px_rgba(15,23,42,0.08)]">

          <div className="p-6 md:p-8 xl:p-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-indigo-700 dark:text-indigo-300">
                <Sparkles size={14} />
                Workforce Management
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                  Shift Scheduler
                </span>
              </h1>

              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Enterprise shift planning system for workforce scheduling, real-time tracking, and optimized employee allocation.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {["Auto Scheduling", "Workforce AI", "Real-time Tracking", "Shift Optimization"].map((t) => (
                  <span
                    key={t}
                    className="px-4 py-2 rounded-full text-xs font-black border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 xl:w-[520px]">
              <StatCard title="Total Shifts" value={stats.total} icon={<CalendarDays size={18} />} color="indigo" />
              <StatCard title="Active" value={stats.active} icon={<Zap size={18} />} color="emerald" />
              <StatCard title="Upcoming" value={stats.upcoming} icon={<Clock3 size={18} />} color="amber" />
              <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 size={18} />} color="cyan" />
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-8">

          {/* LEFT */}
          <div className="space-y-6">

            {/* FILTER */}
            <div className="rounded-[32px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl p-5 flex flex-wrap gap-3">
              {["All", "Active", "Upcoming", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-full text-xs font-black border transition ${
                    filter === f
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white/60 dark:bg-white/[0.04] border-slate-200 dark:border-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* SHIFT LIST */}
            <div className="space-y-4">
              {filtered.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            <div className="rounded-[32px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl p-6">

              <h2 className="text-xl font-black flex items-center gap-2">
                <Users size={18} />
                Shift Insights
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-7">
                <p>AI-driven shift optimization improves workforce efficiency and reduces scheduling conflicts.</p>
                <p>Dynamic allocation ensures balanced employee workload distribution across departments.</p>
                <p>Real-time monitoring helps supervisors adjust shifts instantly based on demand.</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Tag icon={<Sun size={14} />} label="Day Ops" />
                <Tag icon={<Moon size={14} />} label="Night Ops" />
                <Tag icon={<Coffee size={14} />} label="Break Optimized" />
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
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "amber" | "cyan";
}) {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  };

  return (
    <div className="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] p-5">
      <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-black">{value}</h3>
    </div>
  );
});

const ShiftCard = memo(function ShiftCard({ shift }: { shift: Shift }) {
  const statusStyle =
    shift.status === "Active"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : shift.status === "Upcoming"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "bg-slate-500/10 text-slate-600 dark:text-slate-300";

  return (
    <div className="rounded-[28px] border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div>
        <h3 className="text-lg font-black">{shift.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {shift.department} • {shift.location}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock3 size={14} /> {shift.start} - {shift.end}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {shift.employees}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusStyle}`}>
          {shift.status}
        </span>
        <ArrowRight size={18} />
      </div>

    </div>
  );
});

const Tag = memo(function Tag({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] text-xs font-black">
      {icon}
      {label}
    </div>
  );
});