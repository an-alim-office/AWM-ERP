"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type LeadStatus =
  | "Qualified"
  | "Negotiation"
  | "New"
  | "Lost";

type Priority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

type Source =
  | "Website"
  | "LinkedIn"
  | "Referral"
  | "Campaign"
  | "Email";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: Source;
  value: number;
  probability: number;
  status: LeadStatus;
  priority: Priority;
  owner: string;
  createdAt: string;
}

const leadsSeed: Lead[] = [
  {
    id: "LD-2026-001",
    name: "Ahmed Al-Farsi",
    company: "NovaCore Logistics",
    email: "ahmed@novacore.ai",
    source: "Referral",
    value: 24000,
    probability: 91,
    status: "Qualified",
    priority: "Critical",
    owner: "Sarah Khan",
    createdAt: "2026-06-29",
  },
  {
    id: "LD-2026-002",
    name: "Layla Noor",
    company: "Orion Health",
    email: "layla@orionhealth.com",
    source: "Website",
    value: 11800,
    probability: 82,
    status: "Negotiation",
    priority: "High",
    owner: "David Clark",
    createdAt: "2026-06-27",
  },
  {
    id: "LD-2026-003",
    name: "Khalid Bin Walid",
    company: "Apex Retail",
    email: "khalid@apexretail.co",
    source: "Campaign",
    value: 6800,
    probability: 58,
    status: "New",
    priority: "Medium",
    owner: "Maya Ahmed",
    createdAt: "2026-06-25",
  },
  {
    id: "LD-2026-004",
    name: "Daniel Carter",
    company: "Skyline Ventures",
    email: "daniel@skyline.io",
    source: "LinkedIn",
    value: 34000,
    probability: 37,
    status: "Lost",
    priority: "Low",
    owner: "James Cole",
    createdAt: "2026-06-21",
  },
  {
    id: "LD-2026-005",
    name: "Sara Mansour",
    company: "Vertex Dynamics",
    email: "sara@vertexdynamics.ai",
    source: "Email",
    value: 19400,
    probability: 88,
    status: "Qualified",
    priority: "High",
    owner: "Nina Yusuf",
    createdAt: "2026-06-28",
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<
  LeadStatus,
  string
> = {
  Qualified:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Negotiation:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  New:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
  Lost:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

const priorityStyles: Record<
  Priority,
  string
> = {
  Critical:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  High:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Medium:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  Low:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
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

export default function LeadManagementPage() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | LeadStatus>("All");

  const [sortBy, setSortBy] = useState<
    "value" | "probability" | "createdAt"
  >("probability");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredLeads = useMemo(() => {
    const normalized = query.toLowerCase();

    return [...leadsSeed]
      .filter((lead) => {
        const matchQuery =
          lead.name
            .toLowerCase()
            .includes(normalized) ||
          lead.company
            .toLowerCase()
            .includes(normalized) ||
          lead.id
            .toLowerCase()
            .includes(normalized);

        const matchStatus =
          statusFilter === "All" ||
          lead.status === statusFilter;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "createdAt") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        return b[sortBy] - a[sortBy];
      });
  }, [query, sortBy, statusFilter]);

  const metrics = useMemo(() => {
    const totalValue = leadsSeed.reduce(
      (acc, item) => acc + item.value,
      0
    );

    const qualified = leadsSeed.filter(
      (item) => item.status === "Qualified"
    ).length;

    return {
      totalValue: `$${totalValue.toLocaleString()}`,
      qualified,
      pipeline: leadsSeed.length,
      conversion: "78.4%",
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1900px]">
          <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_36%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI Lead Intelligence Engine
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Lead Management
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise-grade lead pipeline
                  infrastructure with realtime AI
                  scoring, autonomous opportunity
                  analysis, predictive conversion
                  tracking, and intelligent revenue
                  forecasting.
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
                      title="Pipeline Value"
                      value={metrics.totalValue}
                      sub="Realtime opportunity insights"
                    />

                    <StatCard
                      title="Qualified Leads"
                      value={metrics.qualified.toString()}
                      sub="AI optimized lead scoring"
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
                  title="Active Pipeline"
                  value={metrics.pipeline.toString()}
                  sub="Enterprise lead orchestration"
                />

                <StatCard
                  title="Conversion Rate"
                  value={metrics.conversion}
                  sub="Predictive AI optimization"
                />

                <StatCard
                  title="Sales Velocity"
                  value="2.8x"
                  sub="Accelerated opportunity flow"
                />

                <StatCard
                  title="Automation Rules"
                  value="126"
                  sub="Smart workflow execution"
                />
              </>
            ) : (
              Array.from({ length: 4 }).map(
                (_, idx) => (
                  <SkeletonCard key={idx} />
                )
              )
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
                    Autonomous sales opportunity
                    optimization
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Create Lead
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Export Pipeline
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Lead Quality",
                    value: "94%",
                    progress: "94%",
                  },
                  {
                    label: "AI Match",
                    value: "88%",
                    progress: "88%",
                  },
                  {
                    label: "Engagement",
                    value: "81%",
                    progress: "81%",
                  },
                  {
                    label: "Forecast",
                    value: "92%",
                    progress: "92%",
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
                      Enterprise optimization
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Recommendations
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Intelligent pipeline insights
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "High-value enterprise opportunities detected in logistics sector.",
                  "AI predicts 21% increase in conversion probability this week.",
                  "Lead engagement optimization improved response rates.",
                  "Sales pipeline latency reduced after automation rollout.",
                  "Realtime behavioral scoring identified premium prospects.",
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
                      Autonomous Routing
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      AI lead assignment active
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
                  Lead Intelligence Matrix
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Advanced searchable sales
                  pipeline infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <input
                    aria-label="Search leads"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search leads..."
                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                  />
                </div>

                <select
                  aria-label="Filter status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | LeadStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Qualified">
                    Qualified
                  </option>

                  <option value="Negotiation">
                    Negotiation
                  </option>

                  <option value="New">
                    New
                  </option>

                  <option value="Lost">
                    Lost
                  </option>
                </select>

                <select
                  aria-label="Sort leads"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "value"
                        | "probability"
                        | "createdAt"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="probability">
                    Probability
                  </option>

                  <option value="value">
                    Pipeline Value
                  </option>

                  <option value="createdAt">
                    Latest
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
                        "Lead",
                        "Company",
                        "Source",
                        "Pipeline Value",
                        "Probability",
                        "Priority",
                        "Status",
                        "Owner",
                        "Created",
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
                    {filteredLeads.map(
                      (lead) => (
                        <tr
                          key={lead.id}
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {lead.name}
                              </span>

                              <span className="mt-1 text-xs text-cyan-300">
                                {lead.id}
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-zinc-200">
                                {lead.company}
                              </span>

                              <span className="mt-1 text-xs text-zinc-500">
                                {lead.email}
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                            {lead.source}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-emerald-300">
                            $
                            {lead.value.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                                  style={{
                                    width: `${lead.probability}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-cyan-300">
                                {lead.probability}%
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                priorityStyles[
                                  lead.priority
                                ]
                              )}
                            >
                              {lead.priority}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                statusStyles[
                                  lead.status
                                ]
                              )}
                            >
                              {lead.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {lead.owner}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
                            {lead.createdAt}
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredLeads.length && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No lead intelligence records
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
          scrollbar-color: rgba(
              255,
              255,
              255,
              0.12
            )
            transparent;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(
            255,
            255,
            255,
            0.12
          );
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