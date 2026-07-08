"use client";

import React, {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  BadgeDollarSign,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
  WalletCards,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PayrollStatus =
  | "Paid"
  | "Pending"
  | "Processing";

interface EmployeePayroll {
  id: number;
  employee: string;
  department: string;
  salary: string;
  bonus: string;
  paymentDate: string;
  status: PayrollStatus;
}

/* =========================================================
   MOCK DATA
========================================================= */

const PAYROLL_DATA: EmployeePayroll[] =
  [
    {
      id: 1,
      employee: "Ahmed Rahman",
      department: "Engineering",
      salary: "$4,200",
      bonus: "$450",
      paymentDate: "28 Jun 2026",
      status: "Paid",
    },
    {
      id: 2,
      employee: "Sarah Khan",
      department: "Finance",
      salary: "$3,850",
      bonus: "$320",
      paymentDate: "28 Jun 2026",
      status: "Paid",
    },
    {
      id: 3,
      employee: "Nusrat Jahan",
      department: "HR",
      salary: "$2,900",
      bonus: "$180",
      paymentDate: "29 Jun 2026",
      status: "Pending",
    },
    {
      id: 4,
      employee: "Tanvir Hasan",
      department: "Operations",
      salary: "$5,100",
      bonus: "$700",
      paymentDate: "29 Jun 2026",
      status: "Processing",
    },
    {
      id: 5,
      employee: "Rafsan Karim",
      department: "Marketing",
      salary: "$3,300",
      bonus: "$260",
      paymentDate: "30 Jun 2026",
      status: "Paid",
    },
  ];

/* =========================================================
   HELPERS
========================================================= */

const statusStyles = (
  status: PayrollStatus
): string => {
  switch (status) {
    case "Paid":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

    case "Pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";

    default:
      return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function PayrollAIPage() {
  const [search, setSearch] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(true);

  const deferredSearch =
    useDeferredValue(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () =>
      clearTimeout(timer);
  }, []);

  const filteredEmployees =
    useMemo(() => {
      return PAYROLL_DATA.filter(
        (item) =>
          item.employee
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.department
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.status
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            )
      );
    }, [deferredSearch]);

  const totalEmployees =
    PAYROLL_DATA.length;

  const totalPayroll =
    "$19,350";

  const aiAccuracy = "99.4%";

  const pendingPayrolls =
    PAYROLL_DATA.filter(
      (item) => item.status !== "Paid"
    ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_28%),#020617] text-slate-100">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="relative grid gap-10 p-6 md:p-8 xl:grid-cols-[1fr_480px] xl:p-10">
            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                <ShieldCheck size={14} />
                Enterprise Payroll Intelligence
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                Payroll AI
                Automation Suite
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-400 md:text-base">
                AI-powered payroll
                orchestration platform with
                automated salary processing,
                intelligent compensation
                analytics, workforce payment
                management, compliance
                tracking and enterprise-grade
                payroll intelligence system.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "AI Salary Engine",
                  "Auto Bonus System",
                  "Compliance Monitoring",
                  "Realtime Analytics",
                  "Smart Payroll Routing",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* SEARCH */}

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search employee, department or status..."
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-cyan-400"
                    />
                  </div>

                  <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-6 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01]">
                    <Sparkles size={18} />
                    AI Payroll Run
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Employees"
                value={String(
                  totalEmployees
                )}
                subtitle="Registered"
                icon={
                  <Users2 size={20} />
                }
                accent="cyan"
              />

              <MetricCard
                title="Payroll"
                value={totalPayroll}
                subtitle="Monthly Budget"
                icon={
                  <WalletCards size={20} />
                }
                accent="emerald"
              />

              <MetricCard
                title="AI Accuracy"
                value={aiAccuracy}
                subtitle="Automation Engine"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                accent="violet"
              />

              <MetricCard
                title="Pending"
                value={String(
                  pendingPayrolls
                )}
                subtitle="Awaiting Process"
                icon={
                  <Clock3 size={20} />
                }
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">
            {/* TABLE */}

            <GlassCard>
              <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Payroll Processing Table
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI-powered workforce salary
                    orchestration
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  <Activity size={14} />
                  Live Processing
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead className="bg-white/[0.04]">
                      <tr>
                        {[
                          "Employee",
                          "Department",
                          "Salary",
                          "Bonus",
                          "Payment Date",
                          "Status",
                        ].map((item) => (
                          <th
                            key={item}
                            className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        Array.from({
                          length: 5,
                        }).map((_, i) => (
                          <tr
                            key={i}
                            className="border-t border-white/5"
                          >
                            {Array.from({
                              length: 6,
                            }).map(
                              (
                                __,
                                idx
                              ) => (
                                <td
                                  key={
                                    idx
                                  }
                                  className="px-5 py-5"
                                >
                                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                                </td>
                              )
                            )}
                          </tr>
                        ))
                      ) : filteredEmployees.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-16 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Search className="mb-4 text-slate-500" />

                              <p className="text-sm text-slate-400">
                                No payroll data
                                found
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.04]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                                    <Users2
                                      size={
                                        18
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-white">
                                      {
                                        item.employee
                                      }
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      AI
                                      Verified
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.department
                                }
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-emerald-300">
                                {
                                  item.salary
                                }
                              </td>

                              <td className="px-5 py-5 text-sm text-cyan-300">
                                {item.bonus}
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.paymentDate
                                }
                              </td>

                              <td className="px-5 py-5">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles(
                                    item.status
                                  )}`}
                                >
                                  {
                                    item.status
                                  }
                                </span>
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>

            {/* FEATURES */}

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title:
                    "Automated Salary Engine",
                  desc: "AI-driven payroll automation with realtime calculation and optimization.",
                  icon: (
                    <Coins size={20} />
                  ),
                },
                {
                  title:
                    "Bonus Intelligence",
                  desc: "Dynamic performance bonus allocation and incentive orchestration.",
                  icon: (
                    <TrendingUp
                      size={20}
                    />
                  ),
                },
                {
                  title:
                    "Smart Payment Routing",
                  desc: "Enterprise-grade secure salary disbursement infrastructure.",
                  icon: (
                    <CreditCard
                      size={20}
                    />
                  ),
                },
                {
                  title:
                    "Compliance Monitoring",
                  desc: "Realtime payroll audit and workforce compliance intelligence.",
                  icon: (
                    <ShieldCheck
                      size={20}
                    />
                  ),
                },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  title={item.title}
                  description={
                    item.desc
                  }
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="space-y-8">
            {/* AI RUNTIME */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Payroll Runtime
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI orchestration &
                    financial automation
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <RuntimeItem
                  title="Salary Processing"
                  value="Operational"
                  progress="97%"
                />

                <RuntimeItem
                  title="Payment Gateway"
                  value="Connected"
                  progress="92%"
                />

                <RuntimeItem
                  title="Compliance Audit"
                  value="Verified"
                  progress="95%"
                />

                <RuntimeItem
                  title="AI Optimization"
                  value="Realtime"
                  progress="99%"
                />
              </div>
            </GlassCard>

            {/* PAYOUT */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Monthly Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Enterprise payroll summary
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <BadgeDollarSign
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-2xl shadow-cyan-500/20">
                    <BriefcaseBusiness
                      size={28}
                    />
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-white">
                      {totalPayroll}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Total Payroll Budget
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {[
                    "AI Salary Validation Completed",
                    "Realtime Tax Calculation Active",
                    "Secure Payment Gateway Enabled",
                    "Enterprise Compliance Protected",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-emerald-300"
                      />

                      <p className="text-sm text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* MINI GRID */}

            <div className="grid gap-4 sm:grid-cols-2">
              <MiniStatusCard
                title="AI Requests"
                value="2.4M"
                icon={
                  <Sparkles size={18} />
                }
              />

              <MiniStatusCard
                title="Transactions"
                value="18K"
                icon={
                  <ArrowUpRight
                    size={18}
                  />
                }
              />

              <MiniStatusCard
                title="Payout Time"
                value="31ms"
                icon={
                  <CalendarClock
                    size={18}
                  />
                }
              />

              <MiniStatusCard
                title="Security"
                value="Active"
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
              />
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

const GlassCard = memo(
  ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-7">
        {children}
      </div>
    );
  }
);

GlassCard.displayName =
  "GlassCard";

const MetricCard = memo(
  ({
    title,
    value,
    subtitle,
    icon,
    accent,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    accent:
      | "cyan"
      | "emerald"
      | "violet"
      | "amber";
  }) => {
    const accents = {
      cyan:
        "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",

      emerald:
        "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",

      violet:
        "bg-violet-500/10 border-violet-500/20 text-violet-300",

      amber:
        "bg-amber-500/10 border-amber-500/20 text-amber-300",
    };

    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${accents[accent]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-black text-white">
          {value}
        </h3>

        <p className="mt-2 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    );
  }
);

MetricCard.displayName =
  "MetricCard";

const FeatureCard = memo(
  ({
    title,
    description,
    icon,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>

        <h3 className="text-lg font-black text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {description}
        </p>
      </div>
    );
  }
);

FeatureCard.displayName =
  "FeatureCard";

const RuntimeItem = memo(
  ({
    title,
    value,
    progress,
  }: {
    title: string;
    value: string;
    progress: string;
  }) => {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">
              {title}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {value}
            </p>
          </div>

          <span className="text-xs font-bold text-cyan-300">
            {progress}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            style={{
              width: progress,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400"
          />
        </div>
      </div>
    );
  }
);

RuntimeItem.displayName =
  "RuntimeItem";

const MiniStatusCard = memo(
  ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h4 className="mt-3 text-2xl font-black text-white">
          {value}
        </h4>
      </div>
    );
  }
);

MiniStatusCard.displayName =
  "MiniStatusCard";