"use client";

import React, {
  Fragment,
  Suspense,
  lazy,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type BiometricStatus = "Verified" | "Pending" | "Rejected";
type ViewMode = "overview" | "activity";
type ActivityFilter = "all" | "active" | "archived";
type SortDirection = "newest" | "oldest";

interface EmployeeStats {
  attendanceRate: number;
  tasksCompleted: number;
  efficiencyScore: number;
  responseTime: string;
}

interface ActivityLog {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  active?: boolean;
}

interface EmployeeProfile {
  empId: string;
  name: string;
  role: string;
  department: string;
  joinedDate: string;
  location: string;
  biometricStatus: BiometricStatus;
  lastSync: string;
  email: string;
  phone: string;
  shift: string;
  manager: string;
  employeeLevel: string;
  stats: EmployeeStats;
  logs: ActivityLog[];
}

/* =========================================================
   ENTERPRISE DATA
========================================================= */

const EMPLOYEE_PROFILE: EmployeeProfile = {
  empId: "EMP-001",
  name: "Ahmed Mansoor",
  role: "Senior Site Supervisor",
  department: "Operations & Logistics",
  joinedDate: "12 Jan 2024",
  location: "Riyadh Head Office",
  biometricStatus: "Verified",
  lastSync: "Today, 11:30 PM",
  email: "ahmed@enterprise.com",
  phone: "+966-500000000",
  shift: "Night Shift",
  manager: "Khalid Al Rashid",
  employeeLevel: "Enterprise Level - A1",
  stats: {
    attendanceRate: 98.2,
    tasksCompleted: 142,
    efficiencyScore: 95,
    responseTime: "1.2s",
  },
  logs: [
    {
      id: 1,
      title: "Biometric Authentication Success",
      description:
        "Secure identity verification completed via Riyadh Gate Node #4.",
      timestamp: "Today, 11:30 PM",
      active: true,
    },
    {
      id: 2,
      title: "AI Scheduling Engine Updated",
      description:
        "Automated workforce scheduling synchronization completed successfully.",
      timestamp: "Today, 08:10 AM",
    },
    {
      id: 3,
      title: "Security Compliance Updated",
      description:
        "Enterprise security audit verification successfully completed.",
      timestamp: "Yesterday, 09:45 PM",
    },
    {
      id: 4,
      title: "Cloud Backup Completed",
      description:
        "Encrypted backup replication stored in enterprise cloud cluster.",
      timestamp: "Yesterday, 01:20 AM",
    },
  ],
};

/* =========================================================
   HELPERS
========================================================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatPercent = (value: number) => `${value}%`;

const formatTasksTrend = (value: number) => `+${Math.max(8, Math.round(value / 12))} this month`;

const parseTimestampRank = (timestamp: string): number => {
  const normalized = timestamp.toLowerCase();

  if (normalized.includes("today")) {
    if (normalized.includes("11:30")) return 400;
    if (normalized.includes("08:10")) return 300;
    return 250;
  }

  if (normalized.includes("yesterday")) {
    if (normalized.includes("09:45")) return 200;
    if (normalized.includes("01:20")) return 100;
    return 50;
  }

  return 0;
};

const getStatusTone = (status: BiometricStatus) => {
  switch (status) {
    case "Verified":
      return {
        badge:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
      };
    case "Pending":
      return {
        badge:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "Rejected":
    default:
      return {
        badge:
          "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        dot: "bg-rose-500",
      };
  }
};

const metricCardPalette = {
  emerald: {
    tone: "from-emerald-500/15 via-green-500/10 to-teal-500/10",
    colors: ["#10b981", "#14b8a6"] as [string, string],
  },
  white: {
    tone: "from-slate-500/10 via-slate-400/5 to-white/5",
    colors: ["#94a3b8", "#e2e8f0"] as [string, string],
  },
  cyan: {
    tone: "from-cyan-500/15 via-sky-500/10 to-blue-500/10",
    colors: ["#06b6d4", "#3b82f6"] as [string, string],
  },
  purple: {
    tone: "from-violet-500/15 via-purple-500/10 to-fuchsia-500/10",
    colors: ["#8b5cf6", "#d946ef"] as [string, string],
  },
} as const;

/* =========================================================
   LAZY VISUALS
========================================================= */

const LazyActivityBars = lazy(async () => ({
  default: function ActivityBars({
    items,
  }: {
    items: Array<{ label: string; value: number; tone: string }>;
  }) {
    const max = Math.max(...items.map((item) => item.value), 1);

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
              <div
                className={cx(
                  "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                  item.tone
                )}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
}));

/* =========================================================
   THEME
========================================================= */

function useThemeMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const stored = window.localStorage.getItem("employee-profile-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = stored ? stored === "dark" : prefersDark;

    setIsDark(nextDark);
    root.classList.toggle("dark", nextDark);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      const persisted = window.localStorage.getItem("employee-profile-theme");
      if (persisted) return;
      setIsDark(event.matches);
      root.classList.toggle("dark", event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("employee-profile-theme", next ? "dark" : "light");
  };

  return { isDark, toggleTheme };
}

/* =========================================================
   SKELETONS
========================================================= */

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/70",
        className
      )}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Shimmer className="h-28 w-full rounded-[28px]" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Shimmer className="h-[620px] w-full rounded-[28px]" />
          <div className="space-y-6 xl:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} className="h-36 w-full rounded-3xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Shimmer className="h-[250px] w-full rounded-[28px]" />
              <Shimmer className="h-[250px] w-full rounded-[28px]" />
            </div>
            <Shimmer className="h-[360px] w-full rounded-[28px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE UI
========================================================= */

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = memo(({ children, className = "" }: CardProps) => {
  return (
    <div
      className={cx(
        "rounded-[28px] border border-slate-200/70 bg-white/80 backdrop-blur-2xl shadow-[0_20px_70px_-30px_rgba(15,23,42,0.28)] transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_70px_-32px_rgba(0,0,0,0.55)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = memo(({ label, value }: InfoRowProps) => {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
});

InfoRow.displayName = "InfoRow";

function MiniSparkline({
  values,
  gradientId,
  colors,
}: {
  values: number[];
  gradientId: string;
  colors: [string, string];
}) {
  const width = 120;
  const height = 40;
  const padding = 4;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const points = values.map((value, index) => {
    const x =
      padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y =
      height -
      padding -
      ((value - min) / Math.max(max - min, 1)) * (height - padding * 2);

    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-[120px]" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  color?: string;
  delta: string;
  hint: string;
  sparkline: number[];
  sparklineId: string;
  palette: keyof typeof metricCardPalette;
  icon: React.ReactNode;
}

const MetricCard = memo(
  ({
    title,
    value,
    color,
    delta,
    hint,
    sparkline,
    sparklineId,
    palette,
    icon,
  }: MetricCardProps) => {
    const paletteConfig = metricCardPalette[palette];

    return (
      <Card className="group relative overflow-hidden p-5 hover:-translate-y-1">
        <div
          className={cx(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
            paletteConfig.tone
          )}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
              {icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <h3
                className={cx(
                  "mt-2 text-3xl font-black tracking-tight",
                  color || "text-slate-950 dark:text-white"
                )}
              >
                {value}
              </h3>
            </div>
          </div>

          <MiniSparkline
            values={sparkline}
            gradientId={sparklineId}
            colors={paletteConfig.colors}
          />
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-4">
          <span className="inline-flex rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            {delta}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
        </div>
      </Card>
    );
  }
);

MetricCard.displayName = "MetricCard";

const StatusBadge = memo(({ status }: { status: BiometricStatus }) => {
  const tone = getStatusTone(status);

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]",
        tone.badge
      )}
    >
      <span className={cx("h-2 w-2 rounded-full", tone.dot)} />
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

const SectionTitle = memo(
  ({
    title,
    subtitle,
    badge,
  }: {
    title: string;
    subtitle: string;
    badge?: string;
  }) => {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-500/90 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
        {badge ? (
          <div className="inline-flex w-fit rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
            {badge}
          </div>
        ) : null}
      </div>
    );
  }
);

SectionTitle.displayName = "SectionTitle";

function IconButton({
  onClick,
  label,
  children,
  active = false,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
        active
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
          : "border-slate-200/70 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  label: string;
}) {
  return (
    <div
      className="inline-flex rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cx(
              "rounded-xl px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200",
              active
                ? "bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Page(): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [sortDirection, setSortDirection] = useState<SortDirection>("newest");

  const { isDark, toggleTheme } = useThemeMode();

  const profile = useMemo(() => EMPLOYEE_PROFILE, []);
  const initials = useMemo(() => getInitials(profile.name), [profile.name]);

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => setHydrated(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const derived = useMemo(() => {
    const activeLogs = profile.logs.filter((log) => Boolean(log.active));
    const archivedLogs = profile.logs.filter((log) => !log.active);
    const productivityScore = 94;
    const taskAccuracy = 97;
    const complianceScore = 99;

    return {
      activeLogCount: activeLogs.length,
      archivedLogCount: archivedLogs.length,
      productivityScore,
      taskAccuracy,
      complianceScore,
      systemStatusItems: [
        "Cloud Backup System",
        "AI Security Monitoring",
        "Database Cluster",
        "API Gateway Protection",
      ],
      timelineBars: [
        {
          label: "Active Logs",
          value: activeLogs.length,
          tone: "from-emerald-500 to-teal-500",
        },
        {
          label: "Archived Logs",
          value: archivedLogs.length,
          tone: "from-slate-500 to-slate-400",
        },
        {
          label: "Tasks Completed",
          value: Math.max(1, Math.round(profile.stats.tasksCompleted / 20)),
          tone: "from-cyan-500 to-blue-500",
        },
      ],
      insights: {
        syncHealth: "Stable",
        currentShiftLoad: "Optimized",
        managerResponse: "Priority lane enabled",
      },
    };
  }, [profile.logs, profile.stats.tasksCompleted]);

  const filteredLogs = useMemo(() => {
    const byFilter = profile.logs.filter((log) => {
      if (activityFilter === "active") return Boolean(log.active);
      if (activityFilter === "archived") return !log.active;
      return true;
    });

    return [...byFilter].sort((a, b) => {
      const aRank = parseTimestampRank(a.timestamp);
      const bRank = parseTimestampRank(b.timestamp);

      return sortDirection === "newest" ? bRank - aRank : aRank - bRank;
    });
  }, [activityFilter, profile.logs, sortDirection]);

  if (!mounted) {
    return <PageSkeleton />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_25%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                    Enterprise Workforce Module
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                    Employee Profile
                  </h1>
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
                    Premium Identity View
                  </span>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Advanced enterprise identity registry, workforce analytics,
                  biometric verification, operational monitoring, and AI-driven
                  performance management dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:min-w-[320px] lg:max-w-[360px]">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                        System Operational
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400">
                        Last Sync: {profile.lastSync}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={profile.biometricStatus} />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <IconButton
                      onClick={toggleTheme}
                      label="Toggle color mode"
                      active={isDark}
                    >
                      {isDark ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M21.64 13a1 1 0 00-1.05-.14 8 8 0 01-10.45-10.45 1 1 0 00-1.19-1.31A10 10 0 1013 22a10.29 10.29 0 002.11-.22 1 1 0 00.14-1.92A8 8 0 0121.64 13z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M6.76 4.84l-1.8-1.79L3.55 4.46l1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.45 1.46l-1.41-1.41-1.8 1.79 1.42 1.42 1.79-1.8zM17.24 19.16l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM20 11v2h3v-2h-3zM11 20h2v3h-2v-3zm-6.04-2.21l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM12 6a6 6 0 106 6 6 6 0 00-6-6z" />
                        </svg>
                      )}
                    </IconButton>

                    <SegmentedControl<ViewMode>
                      label="Profile view mode"
                      value={viewMode}
                      onChange={setViewMode}
                      options={[
                        { label: "Overview", value: "overview" },
                        { label: "Activity", value: "activity" },
                      ]}
                    />
                  </div>

                  <div className="hidden rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300 sm:inline-flex">
                    Live profile
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />

              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="
                      flex h-32 w-32 items-center justify-center rounded-full
                      bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600
                      text-4xl font-black text-white shadow-[0_0_60px_rgba(59,130,246,0.35)]
                    "
                  >
                    {initials}
                  </div>

                  <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 bg-emerald-400" />
                </div>

                <div className="mt-6">
                  <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    {profile.empId}
                  </span>

                  <h2 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">
                    {profile.name}
                  </h2>

                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {profile.role}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    {profile.department}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-slate-200/70 pt-6 dark:border-white/10">
                <InfoRow label="Regional Branch" value={profile.location} />
                <InfoRow label="Joined Date" value={profile.joinedDate} />
                <InfoRow label="Corporate Email" value={profile.email} />
                <InfoRow label="Phone Number" value={profile.phone} />
                <InfoRow label="Shift Type" value={profile.shift} />
                <InfoRow label="Reporting Manager" value={profile.manager} />
                <InfoRow label="Employee Level" value={profile.employeeLevel} />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      Biometric Security
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                      Identity Verification Active
                    </p>
                  </div>
                  <StatusBadge status={profile.biometricStatus} />
                </div>
              </div>
            </Card>

            <div className="space-y-6 xl:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {hydrated ? (
                  <Fragment>
                    <MetricCard
                      title="Attendance Rate"
                      value={formatPercent(profile.stats.attendanceRate)}
                      color="text-emerald-600 dark:text-emerald-400"
                      delta="+1.4% from baseline"
                      hint="Strong attendance reliability"
                      sparkline={[91, 93, 94, 95, 96, 97, 98.2]}
                      sparklineId="employee-attendance"
                      palette="emerald"
                      icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M9.55 17.8L4.4 12.65l1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4L9.55 17.8z" />
                        </svg>
                      }
                    />
                    <MetricCard
                      title="Assigned Tasks"
                      value={profile.stats.tasksCompleted}
                      color="text-slate-950 dark:text-white"
                      delta={formatTasksTrend(profile.stats.tasksCompleted)}
                      hint="Execution throughput"
                      sparkline={[94, 101, 108, 116, 124, 133, 142]}
                      sparklineId="employee-tasks"
                      palette="white"
                      icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8 14H7v-2h4zm6-4H7v-2h10zm0-4H7V7h10z" />
                        </svg>
                      }
                    />
                    <MetricCard
                      title="Efficiency Score"
                      value={`${profile.stats.efficiencyScore}/100`}
                      color="text-cyan-600 dark:text-cyan-400"
                      delta="+3 score uplift"
                      hint="AI-rated workforce efficiency"
                      sparkline={[78, 82, 85, 88, 91, 93, 95]}
                      sparklineId="employee-efficiency"
                      palette="cyan"
                      icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M12 2l2.39 7.26H22l-6.19 4.5 2.37 7.24L12 16.55 5.82 21l2.37-7.24L2 9.26h7.61z" />
                        </svg>
                      }
                    />
                    <MetricCard
                      title="API Response"
                      value={profile.stats.responseTime}
                      color="text-violet-600 dark:text-violet-400"
                      delta="Low-latency sync"
                      hint="Gateway responsiveness"
                      sparkline={[2.6, 2.3, 2.1, 1.8, 1.6, 1.4, 1.2]}
                      sparklineId="employee-response"
                      palette="purple"
                      icon={
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                          <path d="M12 8v5l3 3 1.4-1.4-2.4-2.6V8zM12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                        </svg>
                      }
                    />
                  </Fragment>
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Shimmer key={i} className="h-36 w-full rounded-3xl" />
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <SectionTitle
                    title="Workforce Analytics"
                    subtitle="AI-generated performance overview"
                    badge="LIVE"
                  />

                  <div className="mt-5 space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Productivity
                        </span>
                        <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                          {derived.productivityScore}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full w-[94%] rounded-full bg-cyan-500 transition-all duration-700" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Task Accuracy
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {derived.taskAccuracy}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full w-[97%] rounded-full bg-emerald-500 transition-all duration-700" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Security Compliance
                        </span>
                        <span className="font-semibold text-violet-700 dark:text-violet-300">
                          {derived.complianceScore}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div className="h-full w-[99%] rounded-full bg-violet-500 transition-all duration-700" />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle
                    title="Infrastructure Status"
                    subtitle="Enterprise monitoring & protection system"
                  />

                  <div className="mt-5 space-y-4">
                    {derived.systemStatusItems.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 transition-all duration-200 hover:border-cyan-500/20 dark:border-white/10 dark:bg-white/5"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {item}
                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                <Card className="p-6">
                  <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                        Recent Gateway Activity
                      </h3>
                      <p className="mt-1 text-xs text-slate-500/90 dark:text-slate-500">
                        Real-time enterprise operational monitoring logs
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <SegmentedControl<ActivityFilter>
                        label="Activity filter"
                        value={activityFilter}
                        onChange={setActivityFilter}
                        options={[
                          { label: "All", value: "all" },
                          { label: "Active", value: "active" },
                          { label: "Archived", value: "archived" },
                        ]}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setSortDirection((prev) =>
                            prev === "newest" ? "oldest" : "newest"
                          )
                        }
                        className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-xs font-semibold transition-all hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        {sortDirection === "newest" ? "Newest First" : "Oldest First"}
                      </button>

                      <button
                        type="button"
                        className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-2.5 text-xs font-semibold transition-all hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        View Full Logs
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {hydrated ? (
                      filteredLogs.map((log) => (
                        <div
                          key={log.id}
                          className={cx(
                            "rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5",
                            log.active
                              ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                              : "border-slate-200/70 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p
                                className={cx(
                                  "text-sm font-bold",
                                  log.active
                                    ? "text-slate-950 dark:text-white"
                                    : "text-slate-800 dark:text-slate-300"
                                )}
                              >
                                {log.title}
                              </p>

                              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
                                {log.description}
                              </p>
                            </div>

                            <div
                              className={cx(
                                "mt-1 h-2.5 w-2.5 rounded-full",
                                log.active ? "bg-emerald-400" : "bg-slate-400"
                              )}
                            />
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
                            <span className="text-[11px] text-slate-500 dark:text-slate-500">
                              {log.timestamp}
                            </span>

                            <span
                              className={cx(
                                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                log.active
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-slate-200/70 text-slate-600 dark:bg-white/5 dark:text-slate-400"
                              )}
                            >
                              {log.active ? "Active" : "Archived"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-slate-200/70 p-5 dark:border-white/10"
                        >
                          <div className="space-y-3">
                            <Shimmer className="h-5 w-56 rounded-lg" />
                            <Shimmer className="h-4 w-full rounded-lg" />
                            <Shimmer className="h-4 w-3/4 rounded-lg" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-6">
                    <SectionTitle
                      title="Profile Insights"
                      subtitle="Operational identity intelligence"
                    />

                    <div className="mt-5 grid grid-cols-1 gap-4">
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Sync Health
                        </p>
                        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                          {derived.insights.syncHealth}
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Last update channel remains stable across workforce gateway infrastructure.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Shift Capacity
                        </p>
                        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                          {derived.insights.currentShiftLoad}
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Current assignment profile is aligned with high-efficiency night-shift coverage.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Manager Routing
                        </p>
                        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                          {derived.insights.managerResponse}
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Supervisor chain is configured for fast exception handling and escalation.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <SectionTitle
                      title="Activity Density"
                      subtitle="Visible event distribution"
                      badge={viewMode === "activity" ? "Focused" : "Balanced"}
                    />

                    <div className="mt-5">
                      <Suspense
                        fallback={
                          <div className="space-y-3">
                            <Shimmer className="h-10 w-full rounded-xl" />
                            <Shimmer className="h-10 w-full rounded-xl" />
                            <Shimmer className="h-10 w-full rounded-xl" />
                          </div>
                        }
                      >
                        <LazyActivityBars items={derived.timelineBars} />
                      </Suspense>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Active Logs
                        </p>
                        <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {derived.activeLogCount}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Archived Logs
                        </p>
                        <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {derived.archivedLogCount}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
