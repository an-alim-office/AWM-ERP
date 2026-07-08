"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type CustomerStatus =
  | "Active"
  | "Lead"
  | "Inactive";

type Tier =
  | "Enterprise"
  | "Business"
  | "Starter";

type Risk =
  | "Low"
  | "Medium"
  | "High";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
  lastContact: string;
  revenue: number;
  aiScore: number;
  country: string;
  tier: Tier;
  risk: Risk;
}

const customersSeed: Customer[] = [
  {
    id: "C-001",
    name: "Ahmed Al-Farsi",
    email: "ahmed@example.com",
    company: "NovaCore Logistics",
    status: "Active",
    lastContact: "2026-06-25",
    revenue: 184000,
    aiScore: 96,
    country: "Saudi Arabia",
    tier: "Enterprise",
    risk: "Low",
  },
  {
    id: "C-002",
    name: "Sara Mansour",
    email: "sara@example.com",
    company: "Vertex Dynamics",
    status: "Lead",
    lastContact: "2026-06-27",
    revenue: 92000,
    aiScore: 81,
    country: "UAE",
    tier: "Business",
    risk: "Medium",
  },
  {
    id: "C-003",
    name: "Khalid Bin Walid",
    email: "khalid@example.com",
    company: "Apex Retail",
    status: "Inactive",
    lastContact: "2026-05-10",
    revenue: 41000,
    aiScore: 62,
    country: "Qatar",
    tier: "Starter",
    risk: "High",
  },
  {
    id: "C-004",
    name: "Layla Noor",
    email: "layla@example.com",
    company: "Orion Health",
    status: "Active",
    lastContact: "2026-06-28",
    revenue: 268000,
    aiScore: 98,
    country: "Kuwait",
    tier: "Enterprise",
    risk: "Low",
  },
  {
    id: "C-005",
    name: "Daniel Carter",
    email: "daniel@example.com",
    company: "Skyline Ventures",
    status: "Lead",
    lastContact: "2026-06-21",
    revenue: 124000,
    aiScore: 76,
    country: "Bahrain",
    tier: "Business",
    risk: "Medium",
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<
  CustomerStatus,
  string
> = {
  Active:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Lead:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Inactive:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
};

const riskStyles: Record<Risk, string> = {
  Low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  High:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

const tierStyles: Record<Tier, string> = {
  Enterprise:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  Business:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
  Starter:
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
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_42%)]" />

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

export default function CustomersPage() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | CustomerStatus>("All");

  const [sortBy, setSortBy] = useState<
    "aiScore" | "revenue" | "lastContact"
  >("aiScore");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalized = query.toLowerCase();

    return [...customersSeed]
      .filter((customer) => {
        const matchesQuery =
          customer.name
            .toLowerCase()
            .includes(normalized) ||
          customer.company
            .toLowerCase()
            .includes(normalized) ||
          customer.email
            .toLowerCase()
            .includes(normalized) ||
          customer.id
            .toLowerCase()
            .includes(normalized);

        const matchesStatus =
          statusFilter === "All" ||
          customer.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "revenue") {
          return b.revenue - a.revenue;
        }

        if (sortBy === "lastContact") {
          return (
            new Date(b.lastContact).getTime() -
            new Date(a.lastContact).getTime()
          );
        }

        return b.aiScore - a.aiScore;
      });
  }, [query, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    const totalRevenue =
      customersSeed.reduce(
        (acc, item) => acc + item.revenue,
        0
      ) / 1000000;

    return {
      revenue: `$${totalRevenue.toFixed(1)}M`,
      customers: customersSeed.length,
      aiAccuracy: "97.4%",
      retention: "94.8%",
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
                  AI Customer Intelligence Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Customers
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise-grade customer relationship
                  infrastructure with predictive engagement
                  analytics, AI-powered segmentation,
                  realtime operational visibility, and
                  autonomous lifecycle intelligence.
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
                      title="Customer Revenue"
                      value={metrics.revenue}
                      sub="AI optimized revenue intelligence"
                    />

                    <StatCard
                      title="Retention Rate"
                      value={metrics.retention}
                      sub="Realtime lifecycle optimization"
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
                  title="Total Customers"
                  value={metrics.customers.toString()}
                  sub="Global enterprise clients"
                />

                <StatCard
                  title="AI Accuracy"
                  value={metrics.aiAccuracy}
                  sub="Predictive customer analytics"
                />

                <StatCard
                  title="Enterprise Accounts"
                  value="248"
                  sub="Premium customer ecosystem"
                />

                <StatCard
                  title="Smart Automations"
                  value="1,428"
                  sub="Realtime workflow orchestration"
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
                    Customer Lifecycle Analytics
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    AI-driven engagement intelligence
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Insights
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Export Database
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Engagement",
                    value: "94%",
                    progress: "94%",
                  },
                  {
                    label: "Conversion",
                    value: "78%",
                    progress: "78%",
                  },
                  {
                    label: "Retention",
                    value: "96%",
                    progress: "96%",
                  },
                  {
                    label: "Growth",
                    value: "84%",
                    progress: "84%",
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
                      AI optimized performance
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
                    Autonomous customer insights
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Enterprise clients show 28% higher retention probability this quarter.",
                  "AI predicts revenue growth in logistics and healthcare segments.",
                  "Lead conversion efficiency increased after automated follow-up workflows.",
                  "Realtime churn detection identified 3 at-risk customer accounts.",
                  "Customer satisfaction trend improved after AI engagement automation.",
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
                      Smart Segmentation
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      AI customer clustering engine active
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
                  Searchable enterprise customer
                  infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <input
                    aria-label="Search customers"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search customers..."
                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                  />
                </div>

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

                  <option value="Lead">
                    Lead
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <select
                  aria-label="Sort customers"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "aiScore"
                        | "revenue"
                        | "lastContact"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="aiScore">
                    AI Score
                  </option>

                  <option value="revenue">
                    Revenue
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
                        "Email",
                        "Status",
                        "Tier",
                        "Revenue",
                        "AI Score",
                        "Risk",
                        "Country",
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
                    {filteredCustomers.map(
                      (customer) => (
                        <tr
                          key={customer.id}
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1220] text-sm font-black text-cyan-300">
                                {customer.name
                                  .split(" ")
                                  .map(
                                    (part) =>
                                      part[0]
                                  )
                                  .join("")
                                  .slice(0, 2)}
                              </div>

                              <div className="flex flex-col">
                                <span className="font-semibold text-white">
                                  {customer.name}
                                </span>

                                <span className="mt-1 text-xs text-zinc-500">
                                  {customer.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                            {customer.company}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {customer.email}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                statusStyles[
                                  customer.status
                                ]
                              )}
                            >
                              {customer.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                tierStyles[
                                  customer.tier
                                ]
                              )}
                            >
                              {customer.tier}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-300">
                            $
                            {customer.revenue.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                                  style={{
                                    width: `${customer.aiScore}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-cyan-300">
                                {customer.aiScore}%
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                riskStyles[
                                  customer.risk
                                ]
                              )}
                            >
                              {customer.risk}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {customer.country}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
                            {customer.lastContact}
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredCustomers.length && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No customer intelligence
                          records found.
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