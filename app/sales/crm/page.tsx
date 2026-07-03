"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type PipelineStage =
  | "Lead"
  | "Qualified"
  | "Negotiation"
  | "Proposal"
  | "Won";

type CustomerStatus =
  | "Active"
  | "Pending"
  | "At Risk";

type Priority = "High" | "Medium" | "Low";

type Customer = {
  id: string;
  name: string;
  company: string;
  revenue: string;
  stage: PipelineStage;
  status: CustomerStatus;
  priority: Priority;
  aiScore: number;
  country: string;
  lastContact: string;
};

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const customersSeed: Customer[] = [
  {
    id: "CRM-1001",
    name: "Ahmed Al-Farsi",
    company: "NovaCore Technologies",
    revenue: "$184,000",
    stage: "Negotiation",
    status: "Active",
    priority: "High",
    aiScore: 94,
    country: "Saudi Arabia",
    lastContact: "2h ago",
  },
  {
    id: "CRM-1002",
    name: "Sara Mansour",
    company: "Vertex Logistics",
    revenue: "$92,400",
    stage: "Proposal",
    status: "Pending",
    priority: "Medium",
    aiScore: 82,
    country: "UAE",
    lastContact: "5h ago",
  },
  {
    id: "CRM-1003",
    name: "Khalid Hassan",
    company: "Apex Retail",
    revenue: "$210,300",
    stage: "Won",
    status: "Active",
    priority: "High",
    aiScore: 97,
    country: "Qatar",
    lastContact: "1d ago",
  },
  {
    id: "CRM-1004",
    name: "Layla Noor",
    company: "Orion Health",
    revenue: "$64,800",
    stage: "Qualified",
    status: "At Risk",
    priority: "Low",
    aiScore: 74,
    country: "Kuwait",
    lastContact: "3d ago",
  },
  {
    id: "CRM-1005",
    name: "Daniel Carter",
    company: "Skyline Dynamics",
    revenue: "$142,000",
    stage: "Lead",
    status: "Pending",
    priority: "Medium",
    aiScore: 79,
    country: "Bahrain",
    lastContact: "6h ago",
  },
];

const stageStyles: Record<PipelineStage, string> = {
  Lead:
    "border-sky-500/20 bg-sky-500/10 text-sky-300",
  Qualified:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
  Negotiation:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Proposal:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  Won:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

const statusStyles: Record<CustomerStatus, string> = {
  Active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  "At Risk":
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

const priorityStyles: Record<Priority, string> = {
  High:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  Medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={cn(
        "h-36 rounded-[30px] border border-white/10 bg-white/[0.03]",
        shimmer
      )}
    />
  );
});

const StatCard = memo(function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[30px]",
        "border border-white/10 bg-white/[0.04]",
        "backdrop-blur-2xl transition-all duration-500",
        "hover:-translate-y-1 hover:border-cyan-400/20"
      )}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_40%)]" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">
              {title}
            </div>

            <div className="mt-3 text-3xl font-black tracking-tight text-white">
              {value}
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              {sub}
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            ✦
          </div>
        </div>
      </div>
    </div>
  );
});

export default function CRMPage() {
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");

  const [stageFilter, setStageFilter] = useState<
    "All" | PipelineStage
  >("All");

  const [statusFilter, setStatusFilter] = useState<
    "All" | CustomerStatus
  >("All");

  const [sortBy, setSortBy] = useState<
    "aiScore" | "lastContact"
  >("aiScore");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalized = search.toLowerCase();

    return customersSeed
      .filter((item) => {
        const queryMatch =
          item.name.toLowerCase().includes(normalized) ||
          item.company.toLowerCase().includes(normalized) ||
          item.id.toLowerCase().includes(normalized);

        const stageMatch =
          stageFilter === "All" ||
          item.stage === stageFilter;

        const statusMatch =
          statusFilter === "All" ||
          item.status === statusFilter;

        return (
          queryMatch && stageMatch && statusMatch
        );
      })
      .sort((a, b) => {
        if (sortBy === "aiScore") {
          return b.aiScore - a.aiScore;
        }

        return a.lastContact.localeCompare(
          b.lastContact
        );
      });
  }, [search, stageFilter, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    return {
      revenue: "$4.8M",
      customers: "12,482",
      retention: "94.2%",
      ai: "97%",
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1900px]">
          <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_36%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI CRM Intelligence Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  CRM Dashboard
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Unified enterprise customer management
                  infrastructure with AI-driven pipelines,
                  predictive engagement intelligence,
                  automated workflow orchestration, and
                  realtime operational visibility.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:max-w-xl">
                {!mounted ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <StatCard
                      title="Total Revenue"
                      value={metrics.revenue}
                      sub="AI optimized customer lifecycle"
                    />

                    <StatCard
                      title="Retention Rate"
                      value={metrics.retention}
                      sub="Realtime engagement analytics"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {mounted ? (
              <>
                <StatCard
                  title="Customers"
                  value={metrics.customers}
                  sub="Global CRM ecosystem"
                />

                <StatCard
                  title="AI Forecast Accuracy"
                  value={metrics.ai}
                  sub="Predictive pipeline intelligence"
                />

                <StatCard
                  title="Open Opportunities"
                  value="248"
                  sub="Enterprise pipeline growth"
                />

                <StatCard
                  title="Automation Flows"
                  value="1,482"
                  sub="Smart workflow orchestration"
                />
              </>
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Pipeline Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    AI-driven customer conversion analysis
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Forecast
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Export CRM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                {[
                  {
                    label: "Lead",
                    value: "1,482",
                    progress: "36%",
                  },
                  {
                    label: "Qualified",
                    value: "942",
                    progress: "54%",
                  },
                  {
                    label: "Negotiation",
                    value: "684",
                    progress: "75%",
                  },
                  {
                    label: "Proposal",
                    value: "328",
                    progress: "82%",
                  },
                  {
                    label: "Won",
                    value: "189",
                    progress: "97%",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      {item.label}
                    </div>

                    <div className="mt-3 text-3xl font-black text-white">
                      {item.value}
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                        style={{
                          width: item.progress,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      {item.progress} optimization score
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Autonomous CRM recommendations
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "High-conversion opportunity detected in enterprise logistics sector.",
                  "AI predicts 18% revenue growth from negotiation-stage clients.",
                  "Customer churn risk detected for inactive healthcare segment.",
                  "Autonomous follow-up workflow improved response rates by 32%.",
                  "Realtime engagement score increased across retail accounts.",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group rounded-[26px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />

                      <p className="text-sm leading-7 text-zinc-300">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-dashed border-cyan-400/20 bg-cyan-500/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Smart Automation
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      AI workflow engine is currently active
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">
                  Customer Intelligence Matrix
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Searchable enterprise CRM infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <input
                    aria-label="Search customers"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search customers..."
                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                  />
                </div>

                <select
                  aria-label="Stage filter"
                  value={stageFilter}
                  onChange={(e) =>
                    setStageFilter(
                      e.target.value as
                        | "All"
                        | PipelineStage
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Stages
                  </option>

                  <option value="Lead">
                    Lead
                  </option>

                  <option value="Qualified">
                    Qualified
                  </option>

                  <option value="Negotiation">
                    Negotiation
                  </option>

                  <option value="Proposal">
                    Proposal
                  </option>

                  <option value="Won">
                    Won
                  </option>
                </select>

                <select
                  aria-label="Status filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | CustomerStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="At Risk">
                    At Risk
                  </option>
                </select>

                <select
                  aria-label="Sort by"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "aiScore"
                        | "lastContact"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="aiScore">
                    AI Score
                  </option>

                  <option value="lastContact">
                    Last Contact
                  </option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      {[
                        "Customer",
                        "Company",
                        "Revenue",
                        "Stage",
                        "Status",
                        "Priority",
                        "AI Score",
                        "Region",
                        "Last Contact",
                      ].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>

                            <span className="mt-1 text-xs text-zinc-500">
                              {item.id}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-300">
                          {item.company}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-emerald-300">
                          {item.revenue}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                              stageStyles[item.stage]
                            )}
                          >
                            {item.stage}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                              statusStyles[item.status]
                            )}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                              priorityStyles[item.priority]
                            )}
                          >
                            {item.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                                style={{
                                  width: `${item.aiScore}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm text-cyan-300">
                              {item.aiScore}%
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                          {item.country}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
                          {item.lastContact}
                        </td>
                      </tr>
                    ))}

                    {!filteredCustomers.length && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No customer intelligence records
                          found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12)
            transparent;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}