"use client";

import React, {
  memo,
  Suspense,
  lazy,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

type BranchStatus = "Optimal" | "Warning";
type SyncStatus = "Connected" | "Syncing";

type Branch = {
  id: string;
  name: string;
  location: string;
  activeWorkers: number;
  efficiency: number;
  status: BranchStatus;
  syncStatus: SyncStatus;
};

const BranchAnalyticsChart = lazy(() =>
  Promise.resolve({
    default: memo(
      ({
        efficiency,
      }: {
        efficiency: number;
      }) => (
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              efficiency >= 95
                ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                : efficiency >= 90
                ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                : "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500"
            }`}
            style={{
              width: `${efficiency}%`,
            }}
          />
        </div>
      )
    ),
  })
);

export default function Page() {
  const [mounted, setMounted] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const deferredSearch = useDeferredValue(search);

  const [branches] = useState<Branch[]>([
    {
      id: "BR-RIYADH",
      name: "Riyadh Head Office",
      location: "Olaya District, Riyadh",
      activeWorkers: 245,
      efficiency: 96.4,
      status: "Optimal",
      syncStatus: "Connected",
    },
    {
      id: "BR-JEDDAH",
      name: "Jeddah Logistics Hub",
      location: "Al-Andalus, Jeddah",
      activeWorkers: 140,
      efficiency: 91.2,
      status: "Optimal",
      syncStatus: "Connected",
    },
    {
      id: "BR-DAMMAM",
      name: "Dammam Operational Node",
      location: "King Fahd Road, Dammam",
      activeWorkers: 100,
      efficiency: 88.5,
      status: "Warning",
      syncStatus: "Syncing",
    },
  ]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(
      "awm-branch-theme"
    );

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "awm-branch-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const keyword =
        deferredSearch.toLowerCase();

      const matchesSearch =
        branch.name
          .toLowerCase()
          .includes(keyword) ||
        branch.location
          .toLowerCase()
          .includes(keyword) ||
        branch.id.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        branch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    branches,
    deferredSearch,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const totalWorkers = branches.reduce(
      (sum, branch) =>
        sum + branch.activeWorkers,
      0
    );

    const avgEfficiency =
      branches.reduce(
        (sum, branch) =>
          sum + branch.efficiency,
        0
      ) / branches.length;

    const connectedNodes = branches.filter(
      (branch) =>
        branch.syncStatus === "Connected"
    ).length;

    return {
      totalWorkers,
      avgEfficiency:
        avgEfficiency.toFixed(1),
      connectedNodes,
    };
  }, [branches]);

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.04]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        sub: "text-slate-300",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
        surface: "bg-white/[0.03]",
        hover: "hover:bg-white/[0.04]",
      }
    : {
        bg: "bg-[#f4f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        sub: "text-slate-700",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
        surface: "bg-slate-50",
        hover: "hover:bg-slate-100/70",
      };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-44 animate-pulse rounded-[36px] border border-white/10 bg-white/[0.04]" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[360px] animate-pulse rounded-[32px] border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute left-[30%] top-[25%] h-[320px] w-[320px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[38px] border p-6 sm:p-8 xl:p-10 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-400">
                Enterprise Multi-Branch Matrix
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Branch Overview
              </h1>

              <p
                className={`mt-4 text-sm leading-7 sm:text-base ${theme.muted}`}
              >
                Real-time regional performance
                intelligence, operational branch
                synchronization, workforce capacity
                tracking and AI-powered node analytics.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.surface}`}
              >
                <span>
                  {darkMode ? "🌙" : "☀️"}
                </span>

                {darkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>

              <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>

                Node Network Active
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Branches",
              value: branches.length,
              growth: "+12.5%",
              accent:
                "from-blue-500/20 to-cyan-500/5 border-blue-500/10",
            },
            {
              title: "Active Workforce",
              value:
                stats.totalWorkers.toLocaleString(),
              growth: "+7.9%",
              accent:
                "from-emerald-500/20 to-teal-500/5 border-emerald-500/10",
            },
            {
              title: "Avg Efficiency",
              value: `${stats.avgEfficiency}%`,
              growth: "+4.2%",
              accent:
                "from-violet-500/20 to-fuchsia-500/5 border-violet-500/10",
            },
            {
              title: "Connected Nodes",
              value: stats.connectedNodes,
              growth: "Stable",
              accent:
                "from-cyan-500/20 to-blue-500/5 border-cyan-500/10",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-[32px] border bg-gradient-to-br ${item.accent} ${theme.card} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <p
                  className={`text-xs font-black uppercase tracking-[0.22em] ${theme.muted}`}
                >
                  {item.title}
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <h3 className="text-4xl font-black tracking-tight">
                    {item.value}
                  </h3>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    {item.growth}
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                    style={{
                      width:
                        item.title ===
                        "Connected Nodes"
                          ? "84%"
                          : item.title ===
                            "Avg Efficiency"
                          ? "92%"
                          : item.title ===
                            "Active Workforce"
                          ? "78%"
                          : "96%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section
          className={`mt-8 rounded-[32px] border p-5 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Regional Branch Control
              </h2>

              <p
                className={`mt-1 text-sm ${theme.muted}`}
              >
                Search, monitor and filter branch
                operations in real-time.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search branch..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 sm:w-[260px] ${theme.input}`}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                <option value="All">
                  All Status
                </option>

                <option value="Optimal">
                  Optimal
                </option>

                <option value="Warning">
                  Warning
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* BRANCH GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {filteredBranches.map((branch, index) => (
            <div
              key={branch.id}
              className={`group relative overflow-hidden rounded-[34px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.card} ${theme.border} backdrop-blur-2xl`}
              style={{
                animation: `fadeUp .5s ease forwards`,
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                {/* TOP */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-400">
                        {branch.id}
                      </span>

                      <h2 className="mt-4 text-2xl font-black tracking-tight">
                        {branch.name}
                      </h2>

                      <p
                        className={`mt-2 text-sm ${theme.muted}`}
                      >
                        {branch.location}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                        branch.status ===
                        "Optimal"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* METRICS */}
                  <div
                    className={`my-6 grid grid-cols-2 gap-4 rounded-[28px] border p-5 ${theme.surface} ${theme.border}`}
                  >
                    <div>
                      <p
                        className={`text-[11px] font-black uppercase tracking-[0.18em] ${theme.muted}`}
                      >
                        Active Workers
                      </p>

                      <h3 className="mt-3 text-3xl font-black tracking-tight">
                        {branch.activeWorkers}
                      </h3>
                    </div>

                    <div>
                      <p
                        className={`text-[11px] font-black uppercase tracking-[0.18em] ${theme.muted}`}
                      >
                        Efficiency
                      </p>

                      <h3
                        className={`mt-3 text-3xl font-black tracking-tight ${
                          branch.efficiency >= 90
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {branch.efficiency}%
                      </h3>
                    </div>

                    <div className="col-span-2">
                      <Suspense
                        fallback={
                          <div className="mt-5 h-2 rounded-full bg-white/5" />
                        }
                      >
                        <BranchAnalyticsChart
                          efficiency={
                            branch.efficiency
                          }
                        />
                      </Suspense>
                    </div>
                  </div>

                  {/* MICRO STATS */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Latency",
                        value:
                          branch.syncStatus ===
                          "Connected"
                            ? "12ms"
                            : "88ms",
                      },
                      {
                        label: "AI Sync",
                        value:
                          branch.status ===
                          "Optimal"
                            ? "99%"
                            : "82%",
                      },
                      {
                        label: "Security",
                        value: "Stable",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border p-3 text-center ${theme.surface} ${theme.border}`}
                      >
                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.18em] ${theme.muted}`}
                        >
                          {item.label}
                        </p>

                        <h4 className="mt-2 text-sm font-black">
                          {item.value}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOOTER */}
                <div
                  className={`mt-6 flex items-center justify-between rounded-[24px] border p-4 ${theme.surface} ${theme.border}`}
                >
                  <div>
                    <p
                      className={`text-[11px] font-black uppercase tracking-[0.18em] ${theme.muted}`}
                    >
                      Gateway Node
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`relative flex h-3 w-3 ${
                          branch.syncStatus ===
                          "Connected"
                            ? ""
                            : "animate-pulse"
                        }`}
                      >
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                            branch.syncStatus ===
                            "Connected"
                              ? "bg-emerald-400 animate-ping"
                              : "bg-amber-400 animate-pulse"
                          }`}
                        />

                        <span
                          className={`relative inline-flex h-3 w-3 rounded-full ${
                            branch.syncStatus ===
                            "Connected"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />
                      </span>

                      <span
                        className={`text-sm font-bold ${theme.sub}`}
                      >
                        {branch.syncStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    aria-label={`Open ${branch.name}`}
                  >
                    Open Matrix
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* EMPTY STATE */}
        {filteredBranches.length === 0 && (
          <section
            className={`mt-8 rounded-[34px] border p-14 text-center ${theme.card} ${theme.border}`}
          >
            <div className="mb-5 text-6xl">
              🛰️
            </div>

            <h3 className="text-3xl font-black tracking-tight">
              No branch found
            </h3>

            <p
              className={`mt-3 text-sm ${theme.muted}`}
            >
              Try changing filters or search
              keyword.
            </p>
          </section>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3)
            transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}