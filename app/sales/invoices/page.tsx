"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type InvoiceStatus =
  | "Paid"
  | "Pending"
  | "Overdue";

type PaymentMethod =
  | "Bank Transfer"
  | "Credit Card"
  | "Crypto"
  | "Wire";

type Risk =
  | "Low"
  | "Medium"
  | "High";

interface Invoice {
  id: string;
  client: string;
  company: string;
  amount: number;
  issuedAt: string;
  dueDate: string;
  status: InvoiceStatus;
  aiScore: number;
  paymentMethod: PaymentMethod;
  risk: Risk;
}

const invoicesSeed: Invoice[] = [
  {
    id: "INV-2026-001",
    client: "Ahmed Al-Farsi",
    company: "NovaCore Logistics",
    amount: 1250,
    issuedAt: "2026-06-20",
    dueDate: "2026-07-02",
    status: "Paid",
    aiScore: 98,
    paymentMethod: "Bank Transfer",
    risk: "Low",
  },
  {
    id: "INV-2026-002",
    client: "Sara Mansour",
    company: "Vertex Dynamics",
    amount: 890,
    issuedAt: "2026-06-22",
    dueDate: "2026-07-05",
    status: "Pending",
    aiScore: 84,
    paymentMethod: "Credit Card",
    risk: "Medium",
  },
  {
    id: "INV-2026-003",
    client: "Khalid Bin Walid",
    company: "Apex Retail",
    amount: 2100,
    issuedAt: "2026-06-12",
    dueDate: "2026-06-26",
    status: "Overdue",
    aiScore: 62,
    paymentMethod: "Wire",
    risk: "High",
  },
  {
    id: "INV-2026-004",
    client: "Layla Noor",
    company: "Orion Health",
    amount: 5800,
    issuedAt: "2026-06-24",
    dueDate: "2026-07-09",
    status: "Paid",
    aiScore: 97,
    paymentMethod: "Crypto",
    risk: "Low",
  },
  {
    id: "INV-2026-005",
    client: "Daniel Carter",
    company: "Skyline Ventures",
    amount: 3400,
    issuedAt: "2026-06-18",
    dueDate: "2026-07-01",
    status: "Pending",
    aiScore: 80,
    paymentMethod: "Bank Transfer",
    risk: "Medium",
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<
  InvoiceStatus,
  string
> = {
  Paid:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Pending:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Overdue:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

const riskStyles: Record<Risk, string> = {
  Low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  High:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
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

export default function InvoicesPage() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | InvoiceStatus>("All");

  const [sortBy, setSortBy] = useState<
    "amount" | "aiScore" | "dueDate"
  >("amount");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredInvoices = useMemo(() => {
    const normalized = query.toLowerCase();

    return [...invoicesSeed]
      .filter((invoice) => {
        const matchesQuery =
          invoice.client
            .toLowerCase()
            .includes(normalized) ||
          invoice.company
            .toLowerCase()
            .includes(normalized) ||
          invoice.id
            .toLowerCase()
            .includes(normalized);

        const matchesStatus =
          statusFilter === "All" ||
          invoice.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "dueDate") {
          return (
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
          );
        }

        return b[sortBy] - a[sortBy];
      });
  }, [query, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    const totalRevenue = invoicesSeed.reduce(
      (acc, invoice) =>
        acc + invoice.amount,
      0
    );

    const paidInvoices =
      invoicesSeed.filter(
        (item) => item.status === "Paid"
      ).length;

    return {
      revenue: `$${totalRevenue.toLocaleString()}`,
      paidInvoices,
      pending: invoicesSeed.filter(
        (item) => item.status === "Pending"
      ).length,
      overdue: invoicesSeed.filter(
        (item) => item.status === "Overdue"
      ).length,
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
                  Autonomous Billing Intelligence
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Invoices
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Advanced enterprise invoicing
                  infrastructure with AI payment
                  forecasting, realtime revenue
                  intelligence, automated risk
                  detection, and smart financial
                  operations management.
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
                      title="Invoice Revenue"
                      value={metrics.revenue}
                      sub="Realtime financial analytics"
                    />

                    <StatCard
                      title="Paid Invoices"
                      value={metrics.paidInvoices.toString()}
                      sub="Automated payment tracking"
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
                  title="Pending Invoices"
                  value={metrics.pending.toString()}
                  sub="Awaiting payment confirmation"
                />

                <StatCard
                  title="Overdue Alerts"
                  value={metrics.overdue.toString()}
                  sub="AI detected financial risks"
                />

                <StatCard
                  title="Collection Rate"
                  value="94.8%"
                  sub="Optimized payment efficiency"
                />

                <StatCard
                  title="Automation Rules"
                  value="124"
                  sub="Smart workflow orchestration"
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
                    Financial Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    AI-powered invoice performance
                    monitoring
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Invoice
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Export Reports
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Payments",
                    value: "92%",
                    progress: "92%",
                  },
                  {
                    label: "Automation",
                    value: "88%",
                    progress: "88%",
                  },
                  {
                    label: "Collection",
                    value: "96%",
                    progress: "96%",
                  },
                  {
                    label: "Forecast",
                    value: "81%",
                    progress: "81%",
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
                    AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Realtime finance recommendations
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Payment collection efficiency improved after AI automation rollout.",
                  "High-value enterprise invoices show increased early settlement probability.",
                  "Overdue invoice risk detected for multi-region retail accounts.",
                  "Revenue forecasting predicts 18% growth for next billing cycle.",
                  "AI identified optimized invoice scheduling opportunities.",
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
                      Smart Collections
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      Autonomous recovery engine active
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
                  Invoice Intelligence Matrix
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Searchable enterprise billing
                  infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <input
                    aria-label="Search invoices"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    placeholder="Search invoices..."
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
                        | InvoiceStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>
                </select>

                <select
                  aria-label="Sort invoices"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "amount"
                        | "aiScore"
                        | "dueDate"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="amount">
                    Amount
                  </option>

                  <option value="aiScore">
                    AI Score
                  </option>

                  <option value="dueDate">
                    Due Date
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
                        "Invoice",
                        "Client",
                        "Company",
                        "Amount",
                        "Status",
                        "Method",
                        "AI Score",
                        "Risk",
                        "Issued",
                        "Due Date",
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
                    {filteredInvoices.map(
                      (invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-cyan-300">
                                {invoice.id}
                              </span>

                              <span className="mt-1 text-xs text-zinc-500">
                                Enterprise Billing
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-white">
                            {invoice.client}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                            {invoice.company}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-emerald-300">
                            $
                            {invoice.amount.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                statusStyles[
                                  invoice.status
                                ]
                              )}
                            >
                              {invoice.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {invoice.paymentMethod}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                                  style={{
                                    width: `${invoice.aiScore}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-cyan-300">
                                {invoice.aiScore}%
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                riskStyles[
                                  invoice.risk
                                ]
                              )}
                            >
                              {invoice.risk}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
                            {invoice.issuedAt}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {invoice.dueDate}
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredInvoices.length && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No invoice intelligence
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