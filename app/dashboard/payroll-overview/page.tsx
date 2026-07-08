"use client";

import {
  Suspense,
  lazy,
  memo,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarRange,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

const PayrollTrendChart = lazy(() =>
  Promise.resolve({
    default: memo(function PayrollTrendChart() {
      return (
        <div className="relative h-[240px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-cyan-500/10 p-6 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_30%)]" />

          <div className="relative flex h-full items-end justify-between gap-3">
            {[45, 70, 58, 82, 76, 92, 86].map((height, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-3xl bg-gradient-to-t from-emerald-500 via-emerald-400 to-cyan-300 shadow-[0_10px_40px_rgba(16,185,129,0.35)] transition-all duration-500 group-hover:scale-y-105"
                  style={{
                    height: `${height}%`,
                  }}
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }),
  })
);

type EmployeeRecord = {
  id: number;
  name: string;
  department: string;
  salary: string;
  status: "Paid" | "Pending";
  paymentDate: string;
};

const EMPLOYEE_DATA: EmployeeRecord[] = [
  {
    id: 1,
    name: "John Carter",
    department: "Finance",
    salary: "$8,400",
    status: "Paid",
    paymentDate: "2026-06-28",
  },
  {
    id: 2,
    name: "Sarah Williams",
    department: "Operations",
    salary: "$6,900",
    status: "Pending",
    paymentDate: "2026-06-29",
  },
  {
    id: 3,
    name: "Michael Adams",
    department: "HR",
    salary: "$7,250",
    status: "Paid",
    paymentDate: "2026-06-25",
  },
  {
    id: 4,
    name: "Emma Thompson",
    department: "Engineering",
    salary: "$11,300",
    status: "Paid",
    paymentDate: "2026-06-27",
  },
  {
    id: 5,
    name: "Daniel Foster",
    department: "Sales",
    salary: "$5,900",
    status: "Pending",
    paymentDate: "2026-06-30",
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent";

const stats = [
  {
    title: "Total Payroll",
    value: "$1.28M",
    growth: "+12.4%",
    icon: Wallet,
  },
  {
    title: "Employees",
    value: "1,248",
    growth: "+4.2%",
    icon: BriefcaseBusiness,
  },
  {
    title: "Processed",
    value: "96.8%",
    growth: "+2.1%",
    icon: ShieldCheck,
  },
  {
    title: "Upcoming",
    value: "24",
    growth: "+8.7%",
    icon: CalendarRange,
  },
];

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6 ${shimmer}`}
    >
      <div className="h-4 w-24 rounded-full bg-white/10" />
      <div className="mt-5 h-8 w-32 rounded-full bg-white/10" />
      <div className="mt-6 h-3 w-20 rounded-full bg-white/10" />
    </div>
  );
});

export default function PayrollOverviewPage() {
  const [employeeName, setEmployeeName] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "salary">("name");

  const deferredSearch = useDeferredValue(employeeName);

  const filteredEmployees = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    const filtered = EMPLOYEE_DATA.filter((employee) =>
      employee.name.toLowerCase().includes(query)
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return (
        Number(b.salary.replace(/[^0-9]/g, "")) -
        Number(a.salary.replace(/[^0-9]/g, ""))
      );
    });
  }, [deferredSearch, sortBy]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100 transition-colors duration-300 dark:bg-[#020617]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-emerald-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              PAYROLL INTELLIGENCE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Payroll Overview
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Advanced enterprise payroll analytics, employee salary tracking,
              payment intelligence, and operational monitoring dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-[360px]">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.title}
                      </p>

                      <h3 className="mt-3 text-2xl font-black text-white">
                        {item.value}
                      </h3>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {item.growth}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <section className="space-y-6">
            {/* Search Panel */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">
                      Employee Payroll Search
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Search, filter and monitor payroll records in real-time.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSortBy("name")}
                      className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        sortBy === "name"
                          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      Sort: Name
                    </button>

                    <button
                      type="button"
                      onClick={() => setSortBy("salary")}
                      className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        sortBy === "salary"
                          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      Sort: Salary
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                    Employee Name
                  </label>

                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-emerald-400" />

                    <input
                      type="text"
                      placeholder="Search employee payroll..."
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Search employee payroll"
                      className="h-14 w-full rounded-[22px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-medium text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-emerald-400/50 focus:bg-[#08111f]"
                    />
                  </div>
                </div>

                {/* Selected */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[26px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Active Employee
                      </p>

                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    </div>

                    <h2 className="mt-4 truncate text-2xl font-black text-emerald-400">
                      {employeeName || "No employee selected"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Enterprise payroll profile synced.
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        Payroll Status
                      </p>

                      <CreditCard className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-white">
                      Operational
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Secure payroll processing active.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Payroll Records
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Live employee salary intelligence table.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {filteredEmployees.length} Records
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Employee",
                        "Department",
                        "Salary",
                        "Status",
                        "Payment Date",
                      ].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-bold text-white">
                                {employee.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                ID #{employee.id}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {employee.department}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-emerald-400">
                            {employee.salary}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.15em] ${
                                employee.status === "Paid"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-400">
                            {employee.paymentDate}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No payroll records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              }
            >
              <PayrollTrendChart />
            </Suspense>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Security Layer
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    Enterprise Protected
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-3 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Encrypted payroll transactions",
                  "Advanced employee access control",
                  "Audit-ready salary monitoring",
                  "Real-time payment integrity checks",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />

                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-emerald-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    AI Forecast
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    +18.2%
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Predictive payroll engine forecasts increased operational
                efficiency and optimized salary distribution next quarter.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}