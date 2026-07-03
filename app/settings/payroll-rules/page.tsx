"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coins,
  CreditCard,
  FileSpreadsheet,
  Globe2,
  Loader2,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet2,
} from "lucide-react";

type PayrollPolicy = {
  id: string;
  department: string;
  tax: string;
  insurance: string;
  payday: string;
  status: "ACTIVE" | "SYNCING";
};

const payrollPolicies: PayrollPolicy[] = [
  {
    id: "PAY-001",
    department: "Corporate Operations",
    tax: "5.0%",
    insurance: "SAR 50",
    payday: "1st",
    status: "ACTIVE",
  },
  {
    id: "PAY-002",
    department: "Remote Workforce",
    tax: "3.5%",
    insurance: "SAR 30",
    payday: "5th",
    status: "ACTIVE",
  },
  {
    id: "PAY-003",
    department: "Construction Division",
    tax: "7.0%",
    insurance: "SAR 70",
    payday: "10th",
    status: "SYNCING",
  },
];

function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_30%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="h-5 w-44 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-4 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-4 h-32 rounded-3xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function PayrollRulesPage() {
  const [taxRate, setTaxRate] = useState("0.0");

  const [insuranceFee, setInsuranceFee] =
    useState("0");

  const [payDay, setPayDay] = useState("1");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [syncing, setSyncing] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setSuccess(false);

    setTimeout(() => {
      setLoading(false);

      setSuccess(true);
    }, 1200);
  };

  const handleSync = () => {
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const filteredPolicies = useMemo(() => {
    return payrollPolicies.filter((item) => {
      return (
        item.department
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.payday
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#040816] dark:via-[#09111f] dark:to-[#040610] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Payroll Automation
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Payroll Rules
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Enterprise payroll governance with
                intelligent tax automation, salary
                disbursement orchestration, insurance
                deductions, and realtime financial
                compliance controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSync}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}

                Sync Policies
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <ShieldCheck className="h-4 w-4" />
                Payroll Security Active
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Monthly Payroll"
            value="SAR 4.8M"
            description="Enterprise payroll processing"
            icon={<Wallet2 className="h-5 w-5" />}
          />

          <MetricCard
            title="Tax Automation"
            value="99.8%"
            description="Realtime compliance engine"
            icon={<ReceiptText className="h-5 w-5" />}
          />

          <MetricCard
            title="Salary Transfers"
            value="2,482"
            description="Automated employee payouts"
            icon={<CreditCard className="h-5 w-5" />}
          />

          <MetricCard
            title="Insurance Coverage"
            value="100%"
            description="Benefits policy synchronized"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.82fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Global Payroll Master Policy
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Configure enterprise-wide payroll
                  deduction logic, insurance policies,
                  salary release schedules, and automated
                  workforce payment rules.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Financial policy synchronized
              </div>
            </div>

            <Suspense fallback={null}>
              {pageLoading ? (
                <div className="mt-6 space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <>
                  {success && (
                    <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 transition-all duration-300 dark:text-emerald-400">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <div>
                        <h4 className="font-bold">
                          Payroll Rules Updated
                        </h4>

                        <p className="mt-1 text-xs opacity-90">
                          Enterprise payroll master
                          policy has been successfully
                          synchronized across all
                          workforce financial systems.
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSave}
                    className="mt-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Tax Deduction %
                        </label>

                        <div className="relative">
                          <CircleDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            step="0.1"
                            value={taxRate}
                            onChange={(e) =>
                              setTaxRate(
                                e.target.value
                              )
                            }
                            placeholder="5.0"
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Insurance / Benefits Fee
                        </label>

                        <div className="relative">
                          <Coins className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            type="number"
                            value={insuranceFee}
                            onChange={(e) =>
                              setInsuranceFee(
                                e.target.value
                              )
                            }
                            placeholder="50"
                            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                          Salary Release Day
                        </label>

                        <div className="relative">
                          <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <select
                            value={payDay}
                            onChange={(e) =>
                              setPayDay(
                                e.target.value
                              )
                            }
                            className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          >
                            <option value="1">
                              1st of Month
                            </option>

                            <option value="5">
                              5th of Month
                            </option>

                            <option value="10">
                              10th of Month
                            </option>

                            <option value="25">
                              25th of Month
                            </option>
                          </select>

                          <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-zinc-400" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-dashed border-cyan-500/20 bg-cyan-500/5 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-500">
                            <Globe2 className="h-3.5 w-3.5" />
                            Payroll Intelligence
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                            The payroll engine
                            automatically applies tax
                            deduction, insurance fees,
                            salary scheduling, and
                            enterprise-wide payroll
                            compliance logic. Any policy
                            changes instantly synchronize
                            across HR, accounting, and
                            employee payment systems.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Tax
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {taxRate}%
                            </h4>
                          </div>

                          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              Insurance
                            </p>

                            <h4 className="mt-2 text-2xl font-black">
                              {insuranceFee}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Payroll
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating Policies...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Payroll Rules
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-500">
                  <Activity className="h-3.5 w-3.5" />
                  Financial Insights
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Payroll Intelligence
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  AI-driven salary forecasting,
                  payroll optimization analytics,
                  realtime taxation monitoring, and
                  automated financial risk prevention.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Compliance Score
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        99.2%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Department Policies
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Payroll structure by department
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search payroll policy..."
                    className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="rounded-[1.5rem] border border-zinc-200/70 bg-zinc-50/70 p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          {policy.department}
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Salary release on{" "}
                          {policy.payday}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
                          policy.status === "ACTIVE"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {policy.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Tax
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.tax}
                        </h5>
                      </div>

                      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Insurance
                        </p>

                        <h5 className="mt-2 text-lg font-black">
                          {policy.insurance}
                        </h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  Payroll engine syncing...
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Realtime Payroll Events
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enterprise payroll activity feed
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Payroll policy synchronized",
                    time: "12 seconds ago",
                  },
                  {
                    title:
                      "Salary transfer batch generated",
                    time: "3 minutes ago",
                  },
                  {
                    title:
                      "Tax compliance verification completed",
                    time: "9 minutes ago",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {event.time}
                      </p>
                    </div>

                    <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />

                  <div>
                    <h4 className="text-sm font-bold">
                      AI Salary Automation
                    </h4>

                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Payroll rules are directly
                      connected with banking APIs,
                      employee benefits systems, and
                      realtime accounting automation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Smart Finance Overview
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    SAR 12.9M
                  </h3>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <Banknote className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <BriefcaseBusiness className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Employees
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-black">
                    2,482
                  </h4>
                </div>

                <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <BellRing className="h-4 w-4" />

                    <span className="text-xs font-medium">
                      Pending
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-black">
                    08
                  </h4>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                      Payroll Efficiency
                    </p>

                    <h4 className="mt-2 text-xl font-black">
                      97.9%
                    </h4>
                  </div>

                  <Activity className="h-5 w-5 text-cyan-500" />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}