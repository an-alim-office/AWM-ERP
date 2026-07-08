"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Cpu,
  Fingerprint,
  Loader2,
  MoonStar,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TrendingUp,
  UserCheck,
  Users,
  Wifi,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Remote"
  | "Absent";

type EmployeeRecord = {
  id: number;
  employee: string;
  department: string;
  checkIn: string;
  workHours: number;
  status: AttendanceStatus;
  aiScore: number;
};

type ThemeMode = "dark" | "light";

/* =========================================================
   MOCK DATA
========================================================= */

const ATTENDANCE_DATA: EmployeeRecord[] = [
  {
    id: 1,
    employee: "Sarah Johnson",
    department: "Operations",
    checkIn: "08:01 AM",
    workHours: 8.6,
    status: "Present",
    aiScore: 98,
  },
  {
    id: 2,
    employee: "Ahmed Rahman",
    department: "Engineering",
    checkIn: "08:17 AM",
    workHours: 7.9,
    status: "Late",
    aiScore: 84,
  },
  {
    id: 3,
    employee: "Mina Chowdhury",
    department: "Finance",
    checkIn: "07:58 AM",
    workHours: 9.1,
    status: "Present",
    aiScore: 99,
  },
  {
    id: 4,
    employee: "David Lee",
    department: "AI Research",
    checkIn: "Remote",
    workHours: 8.2,
    status: "Remote",
    aiScore: 91,
  },
  {
    id: 5,
    employee: "Nadia Khan",
    department: "Support",
    checkIn: "--",
    workHours: 0,
    status: "Absent",
    aiScore: 42,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const statusStyles: Record<
  AttendanceStatus,
  string
> = {
  Present:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Late: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Remote:
    "bg-sky-500/15 text-sky-400 border-sky-500/20",
  Absent:
    "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

/* =========================================================
   PAGE
========================================================= */

export default function AttendanceAIPage() {
  const [theme, setTheme] =
    useState<ThemeMode>("dark");

  const [search, setSearch] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(true);

  const [selectedFilter, setSelectedFilter] =
    useState<
      "All" | AttendanceStatus
    >("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const filteredRecords = useMemo(() => {
    return ATTENDANCE_DATA.filter(
      (employee) => {
        const matchesSearch =
          employee.employee
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          employee.department
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          selectedFilter === "All"
            ? true
            : employee.status ===
              selectedFilter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [search, selectedFilter]);

  const totalEmployees =
    ATTENDANCE_DATA.length;

  const activeEmployees =
    ATTENDANCE_DATA.filter(
      (employee) =>
        employee.status !== "Absent"
    ).length;

  const attendanceRate = Math.round(
    (activeEmployees /
      totalEmployees) *
      100
  );

  const aiAccuracy = 98.4;

  const averageWorkHours =
    ATTENDANCE_DATA.reduce(
      (acc, employee) =>
        acc + employee.workHours,
      0
    ) / ATTENDANCE_DATA.length;

  const isDark =
    theme === "dark";

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        isDark
          ? "bg-[#020617] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <section
            className={`rounded-[32px] border backdrop-blur-2xl p-6 md:p-8 ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white/80 border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase">
                    AI Workforce Intelligence
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Attendance AI
                  </h1>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 size={14} />
                    SYSTEM ACTIVE
                  </div>
                </div>

                <p
                  className={`mt-4 max-w-2xl text-sm md:text-base leading-relaxed ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Enterprise-grade AI-powered
                  attendance intelligence with
                  biometric tracking, predictive
                  anomaly detection, workforce
                  analytics, behavioral insights,
                  and real-time operational
                  monitoring.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className={`group inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-white/10 hover:bg-white/15 border border-white/10"
                      : "bg-white border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Cpu
                    size={18}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  AI Sync
                </button>

                <button
                  onClick={() =>
                    setTheme(
                      isDark
                        ? "light"
                        : "dark"
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "bg-cyan-500 text-black hover:bg-cyan-400"
                      : "bg-slate-900 text-white hover:bg-black"
                  }`}
                >
                  {isDark ? (
                    <SunMedium size={18} />
                  ) : (
                    <MoonStar size={18} />
                  )}

                  {isDark
                    ? "Light Mode"
                    : "Dark Mode"}
                </button>
              </div>
            </div>
          </section>

          {/* =====================================================
              KPI GRID
          ===================================================== */}

          <section className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-5">
            <AnalyticsCard
              isDark={isDark}
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              description="Real-time active workforce"
              icon={
                <UserCheck size={24} />
              }
              accent="from-emerald-500/20 to-transparent"
            />

            <AnalyticsCard
              isDark={isDark}
              title="AI Accuracy"
              value={`${aiAccuracy}%`}
              description="Predictive recognition engine"
              icon={<Brain size={24} />}
              accent="from-cyan-500/20 to-transparent"
            />

            <AnalyticsCard
              isDark={isDark}
              title="Avg Work Hours"
              value={`${averageWorkHours.toFixed(
                1
              )}h`}
              description="Today's operational average"
              icon={
                <Clock3 size={24} />
              }
              accent="from-violet-500/20 to-transparent"
            />

            <AnalyticsCard
              isDark={isDark}
              title="Connected Devices"
              value="24"
              description="Biometric + IoT active"
              icon={<Wifi size={24} />}
              accent="from-amber-500/20 to-transparent"
            />
          </section>

          {/* =====================================================
              GRID CONTENT
          ===================================================== */}

          <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
            {/* =====================================================
                LEFT CONTENT
            ===================================================== */}

            <div className="2xl:col-span-8 space-y-6">
              {/* SEARCH + FILTER */}

              <div
                className={`rounded-[28px] border p-5 md:p-6 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Smart Attendance Grid
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      AI-enhanced workforce
                      monitoring & behavioral
                      analysis
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative min-w-[280px]">
                      <Search
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        placeholder="Search employee or department..."
                        className={`w-full rounded-2xl border pl-11 pr-4 py-3 text-sm outline-none transition-all ${
                          isDark
                            ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-cyan-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                        }`}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "All",
                        "Present",
                        "Late",
                        "Remote",
                        "Absent",
                      ].map((filter) => (
                        <button
                          key={filter}
                          onClick={() =>
                            setSelectedFilter(
                              filter as
                                | "All"
                                | AttendanceStatus
                            )
                          }
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            selectedFilter ===
                            filter
                              ? "bg-cyan-500 text-black"
                              : isDark
                              ? "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]"
                              : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TABLE */}

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[820px]">
                    <thead>
                      <tr
                        className={`border-b ${
                          isDark
                            ? "border-white/10"
                            : "border-slate-200"
                        }`}
                      >
                        {[
                          "Employee",
                          "Department",
                          "Check In",
                          "Hours",
                          "Status",
                          "AI Score",
                          "Insights",
                        ].map((header) => (
                          <th
                            key={header}
                            className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {loading
                        ? Array.from({
                            length: 5,
                          }).map(
                            (_, index) => (
                              <tr
                                key={index}
                                className={`border-b ${
                                  isDark
                                    ? "border-white/5"
                                    : "border-slate-100"
                                }`}
                              >
                                <td
                                  colSpan={7}
                                  className="px-4 py-5"
                                >
                                  <div
                                    className={`h-14 rounded-2xl ${
                                      isDark
                                        ? "bg-white/[0.04]"
                                        : "bg-slate-100"
                                    } ${shimmer}`}
                                  />
                                </td>
                              </tr>
                            )
                          )
                        : filteredRecords.map(
                            (
                              employee
                            ) => (
                              <tr
                                key={
                                  employee.id
                                }
                                className={`group border-b transition-all duration-300 ${
                                  isDark
                                    ? "border-white/5 hover:bg-white/[0.03]"
                                    : "border-slate-100 hover:bg-slate-50"
                                }`}
                              >
                                <td className="px-4 py-5">
                                  <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-black text-black">
                                      {employee.employee
                                        .split(
                                          " "
                                        )
                                        .map(
                                          (
                                            part
                                          ) =>
                                            part[0]
                                        )
                                        .join(
                                          ""
                                        )}
                                    </div>

                                    <div>
                                      <h3 className="font-bold">
                                        {
                                          employee.employee
                                        }
                                      </h3>

                                      <p
                                        className={`text-xs ${
                                          isDark
                                            ? "text-slate-500"
                                            : "text-slate-500"
                                        }`}
                                      >
                                        AI
                                        workforce
                                        identity
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-5 text-sm font-medium">
                                  {
                                    employee.department
                                  }
                                </td>

                                <td className="px-4 py-5 text-sm">
                                  {
                                    employee.checkIn
                                  }
                                </td>

                                <td className="px-4 py-5 text-sm">
                                  {
                                    employee.workHours
                                  }
                                  h
                                </td>

                                <td className="px-4 py-5">
                                  <div
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[employee.status]}`}
                                  >
                                    <span className="h-2 w-2 rounded-full bg-current" />

                                    {
                                      employee.status
                                    }
                                  </div>
                                </td>

                                <td className="px-4 py-5">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-2 w-24 overflow-hidden rounded-full ${
                                        isDark
                                          ? "bg-white/10"
                                          : "bg-slate-200"
                                      }`}
                                    >
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                                        style={{
                                          width: `${employee.aiScore}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="text-sm font-bold">
                                      {
                                        employee.aiScore
                                      }
                                      %
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-5">
                                  <button
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                      isDark
                                        ? "bg-white/[0.05] hover:bg-white/[0.1]"
                                        : "bg-slate-100 hover:bg-slate-200"
                                    }`}
                                  >
                                    Analyze
                                    <ArrowUpRight
                                      size={
                                        14
                                      }
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI INSIGHTS */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <InsightCard
                  isDark={isDark}
                  title="Behavior Prediction"
                  value="Stable"
                  icon={
                    <TrendingUp size={20} />
                  }
                  description="AI detected healthy attendance patterns across departments."
                />

                <InsightCard
                  isDark={isDark}
                  title="Biometric Sync"
                  value="98.8%"
                  icon={
                    <Fingerprint
                      size={20}
                    />
                  }
                  description="Facial recognition & fingerprint systems synchronized."
                />

                <InsightCard
                  isDark={isDark}
                  title="Security Integrity"
                  value="Protected"
                  icon={
                    <ShieldCheck
                      size={20}
                    />
                  }
                  description="Zero suspicious attendance anomalies detected today."
                />
              </div>
            </div>

            {/* =====================================================
                RIGHT SIDEBAR
            ===================================================== */}

            <div className="2xl:col-span-4 space-y-6">
              <div
                className={`rounded-[28px] border p-6 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      Live System Pulse
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Real-time AI infrastructure
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    <Activity size={22} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <SystemMetric
                    isDark={isDark}
                    title="Recognition Engine"
                    value="Operational"
                    percentage={98}
                  />

                  <SystemMetric
                    isDark={isDark}
                    title="Cloud Sync"
                    value="Realtime"
                    percentage={94}
                  />

                  <SystemMetric
                    isDark={isDark}
                    title="IoT Device Health"
                    value="Stable"
                    percentage={91}
                  />

                  <SystemMetric
                    isDark={isDark}
                    title="AI Monitoring"
                    value="Adaptive"
                    percentage={99}
                  />
                </div>
              </div>

              <div
                className={`rounded-[28px] border p-6 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      AI Notifications
                    </h2>

                    <p
                      className={`mt-1 text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Smart workforce alerts
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400">
                    <AlertTriangle
                      size={20}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <NotificationCard
                    isDark={isDark}
                    icon={
                      <Users size={18} />
                    }
                    title="3 employees working remotely"
                    time="2 min ago"
                  />

                  <NotificationCard
                    isDark={isDark}
                    icon={
                      <CalendarClock
                        size={18}
                      />
                    }
                    title="Shift optimization updated"
                    time="12 min ago"
                  />

                  <NotificationCard
                    isDark={isDark}
                    icon={
                      <Loader2
                        size={18}
                      />
                    }
                    title="AI recalibrating attendance patterns"
                    time="Live"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

type AnalyticsCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  isDark: boolean;
};

function AnalyticsCard({
  title,
  value,
  description,
  icon,
  accent,
  isDark,
}: AnalyticsCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "bg-white/[0.03] border-white/10"
          : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-semibold ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h3 className="mt-3 text-4xl font-black tracking-tight">
            {value}
          </h3>

          <p
            className={`mt-3 text-sm ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

type InsightCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isDark: boolean;
};

function InsightCard({
  title,
  value,
  description,
  icon,
  isDark,
}: InsightCardProps) {
  return (
    <div
      className={`rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "bg-white/[0.03] border-white/10"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
          {icon}
        </div>

        <span className="text-sm font-bold text-emerald-400">
          {value}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-black">
        {title}
      </h3>

      <p
        className={`mt-2 text-sm leading-relaxed ${
          isDark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

type SystemMetricProps = {
  title: string;
  value: string;
  percentage: number;
  isDark: boolean;
};

function SystemMetric({
  title,
  value,
  percentage,
  isDark,
}: SystemMetricProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {title}
        </span>

        <span
          className={`text-xs ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {value}
        </span>
      </div>

      <div
        className={`h-2 overflow-hidden rounded-full ${
          isDark
            ? "bg-white/10"
            : "bg-slate-200"
        }`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

type NotificationCardProps = {
  title: string;
  time: string;
  icon: React.ReactNode;
  isDark: boolean;
};

function NotificationCard({
  title,
  time,
  icon,
  isDark,
}: NotificationCardProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
        {icon}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold leading-relaxed">
          {title}
        </h4>

        <p
          className={`mt-1 text-xs ${
            isDark
              ? "text-slate-500"
              : "text-slate-500"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}