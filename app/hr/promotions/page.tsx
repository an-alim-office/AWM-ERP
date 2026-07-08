"use client";

import React, {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

type PromotionStatus = "Approved" | "Under Review";

type PromotionRecord = {
  id: string;
  name: string;
  currentRole: string;
  proposedRole: string;
  status: PromotionStatus;
  date: string;
  branch: string;
};

const StatusBadge = lazy(() =>
  Promise.resolve({
    default: ({ status }: { status: PromotionStatus }) => {
      return (
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-xl ${
            status === "Approved"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          {status}
        </span>
      );
    },
  })
);

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");

  const deferredSearch = useDeferredValue(search);

  const [promotions, setPromotions] = useState<PromotionRecord[]>([
    {
      id: "PRM-501",
      name: "Ahmed Mansoor",
      currentRole: "Site Supervisor",
      proposedRole: "Senior Operations Lead",
      status: "Under Review",
      date: "01 July 2026",
      branch: "Riyadh HQ",
    },
    {
      id: "PRM-502",
      name: "Youssef Al-Harbi",
      currentRole: "Biometric Operator",
      proposedRole: "Technical Node Supervisor",
      status: "Approved",
      date: "15 June 2026",
      branch: "Jeddah Hub",
    },
    {
      id: "PRM-503",
      name: "Fahad Mustafa",
      currentRole: "Logistics Junior",
      proposedRole: "Logistics Manager",
      status: "Approved",
      date: "10 June 2026",
      branch: "Dammam Node",
    },
  ]);

  const stats = {
    totalPromoted: 28,
    underReview: 4,
    eligiblePool: 18,
    aiAccuracy: "96.2%",
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("promotion-theme");

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "promotion-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const handleApprove = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Approved" } : p
      )
    );
  };

  const filteredPromotions = useMemo(() => {
    const filtered = promotions.filter((item) => {
      const q = deferredSearch.toLowerCase();

      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.currentRole.toLowerCase().includes(q) ||
        item.proposedRole.toLowerCase().includes(q) ||
        item.branch.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });

    if (sortBy === "name") {
      return filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  }, [promotions, deferredSearch, statusFilter, sortBy]);

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card: "bg-white/[0.03]",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        sub: "text-slate-300",
        surface: "bg-white/[0.02]",
        hover: "hover:bg-white/[0.04]",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
      }
    : {
        bg: "bg-[#f3f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        sub: "text-slate-700",
        surface: "bg-slate-50",
        hover: "hover:bg-slate-100/70",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
      };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
            <div className="h-8 w-72 rounded-xl bg-white/10" />
            <div className="mt-4 h-4 w-96 rounded-xl bg-white/5" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-5 h-8 w-20 rounded bg-white/5" />
              </div>
            ))}
          </div>

          <div className="animate-pulse rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 h-6 w-60 rounded bg-white/10" />

            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-3xl bg-white/[0.04]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[36px] border p-6 sm:p-8 ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400">
                Synapse AI Career Pipeline
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Workforce Promotions
              </h1>

              <p
                className={`mt-3 max-w-3xl text-sm leading-7 ${theme.muted}`}
              >
                Manage enterprise career progression, promotion
                approvals, AI eligibility scoring and workforce growth
                strategy operations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.surface}`}
              >
                <span>{darkMode ? "🌙" : "☀️"}</span>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Launch AI Promotion Scan
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {[
            {
              label: "Total Upgraded",
              value: stats.totalPromoted,
              growth: "+14.8%",
              accent:
                "from-blue-500/20 to-cyan-500/5 border-blue-500/10",
            },
            {
              label: "Pending Review",
              value: stats.underReview,
              growth: "+2.4%",
              accent:
                "from-amber-500/20 to-orange-500/5 border-amber-500/10",
            },
            {
              label: "AI Eligible Pool",
              value: stats.eligiblePool,
              growth: "+9.1%",
              accent:
                "from-violet-500/20 to-fuchsia-500/5 border-violet-500/10",
            },
            {
              label: "AI Accuracy",
              value: stats.aiAccuracy,
              growth: "+1.2%",
              accent:
                "from-emerald-500/20 to-teal-500/5 border-emerald-500/10",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`group relative overflow-hidden rounded-[30px] border bg-gradient-to-br ${item.accent} ${theme.card} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              </div>

              <div className="relative z-10">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.22em] ${theme.muted}`}
                >
                  {item.label}
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
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                    style={{
                      width:
                        item.label === "Pending Review"
                          ? "38%"
                          : item.label === "AI Eligible Pool"
                          ? "78%"
                          : item.label === "AI Accuracy"
                          ? "96%"
                          : "88%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TABLE */}
        <section
          className={`mt-8 overflow-hidden rounded-[36px] border ${theme.card} ${theme.border} backdrop-blur-2xl`}
        >
          {/* TOOLBAR */}
          <div
            className={`flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between ${theme.border}`}
          >
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Career Advancement Ledger
              </h2>

              <p className={`mt-1 text-sm ${theme.muted}`}>
                Enterprise workforce promotion intelligence & approval
                system
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Search employee, branch, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 sm:w-[260px] ${theme.input}`}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Under Review">
                  Under Review
                </option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "date")
                }
                className={`h-11 rounded-2xl border px-4 text-sm outline-none transition-all focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 ${theme.input}`}
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr
                  className={`border-b text-left text-xs uppercase tracking-[0.22em] ${theme.border} ${theme.muted}`}
                >
                  <th className="px-6 py-5 font-bold">Employee</th>
                  <th className="px-6 py-5 font-bold">
                    Career Transition
                  </th>
                  <th className="px-6 py-5 font-bold">Branch</th>
                  <th className="px-6 py-5 font-bold">
                    Effective Date
                  </th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPromotions.map((prm, index) => (
                  <tr
                    key={prm.id}
                    className={`group border-b transition-all duration-300 ${theme.border} ${theme.hover} animate-[fadeIn_.4s_ease]`}
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-sm font-black text-blue-400">
                          {prm.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <div className="font-bold tracking-tight">
                            {prm.name}
                          </div>

                          <div
                            className={`mt-1 text-xs ${theme.muted}`}
                          >
                            {prm.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-xl border px-3 py-2 text-xs font-medium ${theme.border} ${theme.surface}`}
                        >
                          {prm.currentRole}
                        </div>

                        <div className="text-blue-400">➜</div>

                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">
                          {prm.proposedRole}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-medium">
                        {prm.branch}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-medium">{prm.date}</div>
                    </td>

                    <td className="px-6 py-5">
                      <Suspense
                        fallback={
                          <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
                        }
                      >
                        <StatusBadge status={prm.status} />
                      </Suspense>
                    </td>

                    <td className="px-6 py-5 text-right">
                      {prm.status === "Under Review" ? (
                        <button
                          onClick={() =>
                            handleApprove(prm.id)
                          }
                          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                        >
                          Approve Upgrade
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
                          Synced
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="grid gap-4 p-4 xl:hidden">
            {filteredPromotions.map((prm, index) => (
              <div
                key={prm.id}
                className={`rounded-[28px] border p-5 transition-all duration-300 ${theme.surface} ${theme.border} ${theme.hover} animate-[fadeIn_.4s_ease]`}
                style={{
                  animationDelay: `${index * 40}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 font-black text-blue-400">
                        {prm.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <h3 className="font-bold tracking-tight">
                          {prm.name}
                        </h3>

                        <p className={`text-xs ${theme.muted}`}>
                          {prm.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <div
                        className={`rounded-xl border px-3 py-2 text-[11px] font-medium ${theme.border} ${theme.surface}`}
                      >
                        {prm.currentRole}
                      </div>

                      <span className="text-blue-400">➜</span>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-400">
                        {prm.proposedRole}
                      </div>
                    </div>
                  </div>

                  <Suspense
                    fallback={
                      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
                    }
                  >
                    <StatusBadge status={prm.status} />
                  </Suspense>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div
                    className={`rounded-2xl border p-4 ${theme.border} ${theme.surface}`}
                  >
                    <p className={`text-[11px] ${theme.muted}`}>
                      BRANCH
                    </p>

                    <h4 className="mt-2 text-sm font-bold">
                      {prm.branch}
                    </h4>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${theme.border} ${theme.surface}`}
                  >
                    <p className={`text-[11px] ${theme.muted}`}>
                      EFFECTIVE DATE
                    </p>

                    <h4 className="mt-2 text-sm font-bold">
                      {prm.date}
                    </h4>
                  </div>
                </div>

                {prm.status === "Under Review" && (
                  <button
                    onClick={() => handleApprove(prm.id)}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
                  >
                    Approve Upgrade
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredPromotions.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 text-5xl">🚀</div>

              <h3 className="text-xl font-black">
                No promotion records found
              </h3>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                Try changing filters or search keywords.
              </p>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3) transparent;
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