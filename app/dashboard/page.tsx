"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
} from "react";
import Link from "next/link";
import {
  Search,
  Settings,
  Printer,
  MessageCircle,
  Bell,
  ShieldCheck,
  Activity,
  TrendingUp,
  Users,
  Sparkles,
  ArrowUpRight,
  Database,
  Filter,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";

type Worker = {
  id?: string | number;
  name?: string;
  idNumber?: string | number;
  pic?: string;
  department?: string;
  status?: string;
};

const statsData = [
  {
    label: "Active Workforce",
    value: "1,248",
    change: "+12.4%",
    icon: Users,
  },
  {
    label: "Live Attendance",
    value: "94.8%",
    change: "+4.1%",
    icon: Activity,
  },
  {
    label: "Payroll Volume",
    value: "$248K",
    change: "+9.8%",
    icon: TrendingUp,
  },
  {
    label: "Security Health",
    value: "99.99%",
    change: "Stable",
    icon: ShieldCheck,
  },
];

const quickModules = [
  {
    title: "Employee Registry",
    desc: "Manage workforce identity & compliance.",
    href: "/employees",
  },
  {
    title: "Live Monitoring",
    desc: "Real-time infrastructure telemetry.",
    href: "/monitoring",
  },
  {
    title: "Smart Reports",
    desc: "AI-generated operational insights.",
    href: "/reports",
  },
  {
    title: "Notification Center",
    desc: "Critical alerts & system updates.",
    href: "/notifications",
  },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="mt-4 h-10 w-32 rounded bg-white/10" />
      <div className="mt-6 h-2 w-full rounded bg-white/10" />
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    setMounted(true);

    const loadWorkers = async () => {
      try {
        const saved = localStorage.getItem("enterprise_db");

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setWorkers(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to parse workers data", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
  }, []);

  const filteredWorkers = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();

    if (!term) return [];

    return workers.filter(
      (worker) =>
        worker.name?.toLowerCase().includes(term) ||
        worker.idNumber?.toString().includes(term)
    );
  }, [workers, deferredSearch]);

  const totalWorkers = workers.length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div className="h-5 w-52 rounded bg-white/10" />
            <div className="mt-4 h-12 w-full rounded-2xl bg-white/10" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_25%)]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* HERO */}
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.12),transparent,rgba(59,130,246,0.08))]" />

            <div className="relative flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Enterprise AI Dashboard
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl xl:text-5xl">
                  All-In-One Business Operations Command Center
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Real-time workforce analytics, smart automation, AI-driven
                  operations monitoring, biometric ecosystem control, and
                  enterprise-grade performance intelligence.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                  >
                    <Printer className="h-4 w-4" />
                    Export Dashboard
                  </button>

                  <button
                    onClick={() => window.open("https://wa.me/", "_blank")}
                    className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Operations Support
                  </button>
                </div>
              </div>

              <div className="grid w-full max-w-xl grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Workforce
                    </span>
                    <Users className="h-5 w-5 text-emerald-400" />
                  </div>

                  <h3 className="mt-5 text-4xl font-black text-white">
                    {totalWorkers || 0}
                  </h3>

                  <p className="mt-2 text-xs text-emerald-400">
                    Active employee profiles synced
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      AI Health
                    </span>
                    <Database className="h-5 w-5 text-blue-400" />
                  </div>

                  <h3 className="mt-5 text-4xl font-black text-white">
                    99.9%
                  </h3>

                  <p className="mt-2 text-xs text-blue-400">
                    Synapse infrastructure uptime
                  </p>
                </div>

                <div className="col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Live Operations Stream
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                        </span>

                        <span className="text-sm font-bold text-white">
                          Real-Time Synchronization Active
                        </span>
                      </div>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-white/20">
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH + ACTION BAR */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Smart Workforce Search
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Search by employee name, ID, or operational identity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-300 transition-all hover:bg-white/10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </button>

                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-300 transition-all hover:bg-white/10">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </button>
              </div>
            </div>

            <div className="relative mt-5">
              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
                <Search className="h-5 w-5 text-emerald-400" />
              </div>

              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee name or ID..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/30 pl-14 pr-5 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-black/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <Bell className="h-5 w-5 text-amber-400" />

                <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Alerts
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-black text-white">18</h3>

              <p className="mt-1 text-xs text-slate-400">
                Active operational notifications
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-blue-400" />

                <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Secure
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-black text-white">256-bit</h3>

              <p className="mt-1 text-xs text-slate-400">
                Enterprise encryption enabled
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/5 blur-3xl transition-all duration-300 group-hover:bg-emerald-500/10" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>

                    <span className="text-xs font-bold text-emerald-400">
                      {stat.change}
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>

                  <h3 className="mt-2 text-4xl font-black tracking-tight text-white">
                    {stat.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </section>

        {/* QUICK MODULES */}
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Enterprise Modules
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                High-performance operational shortcuts.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Powered Routing
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {quickModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-[28px] border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white">
                      {module.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {module.desc}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2 transition-all group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                    <ChevronRight className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Open Module
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEARCH RESULTS */}
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Search Results
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Real-time employee directory intelligence.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {filteredWorkers.length} Result
              {filteredWorkers.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : searchTerm === "" ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 text-center">
                <Search className="h-10 w-10 text-slate-700" />

                <h3 className="mt-5 text-lg font-black text-white">
                  Intelligent Search Ready
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  Start typing employee name or ID number to access workforce
                  records instantly.
                </p>
              </div>
            ) : filteredWorkers.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredWorkers.map((worker, index) => (
                  <div
                    key={`${worker.idNumber}-${index}`}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30"
                  >
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />

                    <div className="relative">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            worker.pic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              worker.name || "User"
                            )}&background=0f172a&color=10b981`
                          }
                          alt={worker.name || "Worker"}
                          loading="lazy"
                          className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-base font-black text-white">
                            {worker.name || "Unknown Worker"}
                          </h4>

                          <div className="mt-2 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            ID: {worker.idNumber || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-bold text-emerald-400">
                            {worker.status || "Active"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Department
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-blue-400">
                            {worker.department || "Operations"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/employees"
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition-all duration-300 hover:bg-emerald-400"
                      >
                        ACCESS PROFILE
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-500/20 bg-rose-500/[0.03] text-center">
                <Search className="h-10 w-10 text-rose-400/50" />

                <h3 className="mt-5 text-lg font-black text-white">
                  No Workforce Match Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  No employee records matched your current query.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}