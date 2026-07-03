"use client";

import React, {
  Fragment,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
} from "react";

type AttendanceStatus = "On Time" | "Late";

type AttendanceLog = {
  id: string;
  name: string;
  time: string;
  status: AttendanceStatus;
  node: string;
  device: string;
};

type AttendanceStats = {
  present: number;
  absent: number;
  late: number;
  totalActive: number;
};

type SortKey = "time" | "name" | "status" | "node";
type SortDirection = "asc" | "desc";
type Density = "comfortable" | "compact";

const INITIAL_STATS: AttendanceStats = {
  present: 182,
  absent: 8,
  late: 14,
  totalActive: 204,
};

const INITIAL_LOGS: AttendanceLog[] = [
  {
    id: "LOG-9921",
    name: "Ahmed Mansoor",
    time: "08:14 AM",
    status: "On Time",
    node: "Riyadh Gate 04",
    device: "Fingerprint v4",
  },
  {
    id: "LOG-9920",
    name: "Youssef Al-Harbi",
    time: "08:29 AM",
    status: "Late",
    node: "Jeddah Exit 02",
    device: "Biometric v3",
  },
  {
    id: "LOG-9919",
    name: "Fahad Mustafa",
    time: "07:55 AM",
    status: "On Time",
    node: "Riyadh Main Gate",
    device: "ID Card Terminal",
  },
  {
    id: "LOG-9918",
    name: "Tariq Abdulaziz",
    time: "07:42 AM",
    status: "On Time",
    node: "Dammam Node 01",
    device: "Fingerprint v4",
  },
];

const DEMO_NAMES = [
  "Sultan Al-Otaibi",
  "Khalid Idris",
  "Faisal Karim",
  "Mohammed Nazmi",
  "Nawaf Al-Qahtani",
  "Rakan Siddiqui",
  "Saad Al-Dossari",
  "Hassan Rahman",
];

const DEMO_NODES = [
  "Riyadh Gate 02",
  "Jeddah Hub 01",
  "Dammam Node 02",
  "Madinah Access 03",
  "Khobar Entry 01",
];

const DEMO_DEVICES = [
  "Fingerprint Matrix v4",
  "Biometric v3",
  "Face ID Gateway",
  "ID Card Terminal",
  "Palm Secure Pro",
];

const statusPalette: Record<
  AttendanceStatus,
  {
    chip: string;
    dot: string;
    text: string;
  }
> = {
  "On Time": {
    chip:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  Late: {
    chip:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const parseTimeValue = (time: string): number => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 0;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

const getGreetingByShift = (hour: number) => {
  if (hour < 12) return "Morning shift";
  if (hour < 17) return "Day shift";
  return "Evening shift";
};

const LazyRealtimeBars = lazy(async () => ({
  default: function RealtimeBars({
    logs,
  }: {
    logs: AttendanceLog[];
  }) {
    const bars = useMemo(() => {
      const nodeMap = new Map<string, number>();
      logs.forEach((log) => {
        nodeMap.set(log.node, (nodeMap.get(log.node) ?? 0) + 1);
      });

      const items = Array.from(nodeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const max = Math.max(...items.map(([, value]) => value), 1);

      return items.map(([label, value]) => ({
        label,
        value,
        width: `${(value / max) * 100}%`,
      }));
    }, [logs]);

    return (
      <div className="space-y-3">
        {bars.length > 0 ? (
          bars.map((bar) => (
            <div key={bar.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-slate-600 dark:text-slate-300">
                  {bar.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {bar.value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 transition-all duration-700"
                  style={{ width: bar.width }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            No node activity available.
          </div>
        )}
      </div>
    );
  },
}));

function useThemeMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const stored = window.localStorage.getItem("attendance-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = stored ? stored === "dark" : systemPrefersDark;

    setIsDark(nextDark);
    root.classList.toggle("dark", nextDark);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      const persisted = window.localStorage.getItem("attendance-theme");
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
    window.localStorage.setItem("attendance-theme", next ? "dark" : "light");
  };

  return { isDark, toggleTheme };
}

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

function PageShellSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-4 text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Shimmer className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Shimmer key={index} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <Shimmer className="h-[560px] w-full rounded-3xl" />
          <div className="space-y-6">
            <Shimmer className="h-64 w-full rounded-3xl" />
            <Shimmer className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusPalette[status].chip
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", statusPalette[status].dot)} />
      {status}
    </span>
  );
}

function MiniSparkline({
  values,
  positive = true,
}: {
  values: number[];
  positive?: boolean;
}) {
  const width = 120;
  const height = 40;
  const padding = 4;

  const normalized = values.length
    ? values
    : [0, 0, 0, 0, 0, 0, 0];

  const max = Math.max(...normalized, 1);
  const min = Math.min(...normalized, 0);

  const points = normalized.map((value, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(normalized.length - 1, 1);
    const y =
      height -
      padding -
      ((value - min) / Math.max(max - min, 1)) * (height - padding * 2);
    return `${x},${y}`;
  });

  const gradientId = positive ? "spark-positive" : "spark-warning";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-10 w-[120px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={positive ? "#06b6d4" : "#f59e0b"} />
          <stop offset="100%" stopColor={positive ? "#8b5cf6" : "#ef4444"} />
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

function MetricCard({
  title,
  value,
  delta,
  hint,
  tone,
  icon,
  sparkline,
}: {
  title: string;
  value: number;
  delta: string;
  hint: string;
  tone: "neutral" | "success" | "warning" | "danger";
  icon: React.ReactNode;
  sparkline: number[];
}) {
  const toneClasses = {
    neutral:
      "from-cyan-500/15 via-blue-500/10 to-violet-500/10 dark:from-cyan-500/15 dark:via-blue-500/10 dark:to-violet-500/10",
    success:
      "from-emerald-500/15 via-green-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:via-green-500/10 dark:to-teal-500/10",
    warning:
      "from-amber-500/15 via-orange-500/10 to-yellow-500/10 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-yellow-500/10",
    danger:
      "from-rose-500/15 via-red-500/10 to-pink-500/10 dark:from-rose-500/15 dark:via-red-500/10 dark:to-pink-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-30px_rgba(59,130,246,0.25)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_64px_-32px_rgba(0,0,0,0.55)]">
      <div
        className={cx(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
          toneClasses[tone]
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatNumber(value)}
            </h3>
          </div>
        </div>
        <MiniSparkline values={sparkline} positive={tone !== "warning" && tone !== "danger"} />
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-4">
        <span className="inline-flex rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
          {delta}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

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

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">Search attendance logs</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M10.5 3a7.5 7.5 0 015.965 12.05l4.242 4.243-1.414 1.414-4.243-4.242A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search employee, terminal, device or log id..."
        className="h-11 w-full rounded-2xl border border-slate-200/70 bg-white/80 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/10"
      />
    </label>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: "all" | AttendanceStatus;
  onChange: (value: "all" | AttendanceStatus) => void;
}) {
  const options: Array<{ label: string; value: "all" | AttendanceStatus }> = [
    { label: "All", value: "all" },
    { label: "On Time", value: "On Time" },
    { label: "Late", value: "Late" },
  ];

  return (
    <div
      className="inline-flex rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5"
      role="tablist"
      aria-label="Attendance status filter"
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

function SortMenu({
  sortKey,
  direction,
  onSortKeyChange,
  onDirectionToggle,
}: {
  sortKey: SortKey;
  direction: SortDirection;
  onSortKeyChange: (value: SortKey) => void;
  onDirectionToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="sortKey">
        Sort logs by
      </label>
      <select
        id="sortKey"
        value={sortKey}
        onChange={(event) => onSortKeyChange(event.target.value as SortKey)}
        className="h-11 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/10"
      >
        <option value="time">Sort: Time</option>
        <option value="name">Sort: Name</option>
        <option value="status">Sort: Status</option>
        <option value="node">Sort: Terminal</option>
      </select>

      <button
        type="button"
        onClick={onDirectionToggle}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        aria-label={`Toggle sort direction, current ${direction}`}
      >
        {direction === "asc" ? "Ascending" : "Descending"}
        <svg
          viewBox="0 0 24 24"
          className={cx(
            "h-4 w-4 transition-transform duration-200",
            direction === "desc" && "rotate-180"
          )}
          fill="currentColor"
        >
          <path d="M12 6l6 7h-4v5h-4v-5H6l6-7z" />
        </svg>
      </button>
    </div>
  );
}

function TableHeaderButton({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
        align === "right" && "ml-auto"
      )}
    >
      {label}
      <svg
        viewBox="0 0 24 24"
        className={cx(
          "h-3.5 w-3.5 transition-all duration-200",
          active ? "opacity-100" : "opacity-35 group-hover:opacity-70",
          active && direction === "desc" && "rotate-180"
        )}
        fill="currentColor"
      >
        <path d="M12 6l5 6h-3v6h-4v-6H7l5-6z" />
      </svg>
    </button>
  );
}

function KPIWidget({
  label,
  value,
  progress,
  tone,
}: {
  label: string;
  value: string;
  progress: number;
  tone: "cyan" | "emerald" | "amber";
}) {
  const gradient =
    tone === "cyan"
      ? "from-cyan-500 to-blue-500"
      : tone === "emerald"
      ? "from-emerald-500 to-teal-500"
      : "from-amber-500 to-orange-500";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-950 dark:text-white">{value}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={cx("h-full rounded-full bg-gradient-to-r transition-all duration-700", gradient)}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition-all duration-300 hover:border-cyan-500/20 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </div>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>(INITIAL_STATS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AttendanceStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [density, setDensity] = useState<Density>("comfortable");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { isDark, toggleTheme } = useThemeMode();
  const logRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => {
      setHydrated(true);
      setLastUpdated(new Date());
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || !autoRefresh) return;

    const interval = window.setInterval(() => {
      const randomName = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
      const randomNode = DEMO_NODES[Math.floor(Math.random() * DEMO_NODES.length)];
      const randomDevice = DEMO_DEVICES[Math.floor(Math.random() * DEMO_DEVICES.length)];

      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const randomId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;
      const onTime = Math.random() > 0.2;

      const newLog: AttendanceLog = {
        id: randomId,
        name: randomName,
        time: timeString,
        status: onTime ? "On Time" : "Late",
        node: randomNode,
        device: randomDevice,
      };

      setAttendanceLogs((prev) => [newLog, ...prev.slice(0, 11)]);
      setStats((prev) => ({
        ...prev,
        present: prev.present + (onTime ? 1 : 0),
        late: prev.late + (onTime ? 0 : 1),
        totalActive: prev.totalActive + 1,
      }));
      setLastUpdated(now);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [mounted, autoRefresh]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = attendanceLogs.filter((log) => {
      const matchesStatus = statusFilter === "all" ? true : log.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [log.id, log.name, log.node, log.device, log.status, log.time]
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const getValue = (log: AttendanceLog) => {
        switch (sortKey) {
          case "name":
            return log.name.toLowerCase();
          case "status":
            return log.status.toLowerCase();
          case "node":
            return log.node.toLowerCase();
          case "time":
          default:
            return parseTimeValue(log.time);
        }
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [attendanceLogs, search, sortDirection, sortKey, statusFilter]);

  const analytics = useMemo(() => {
    const totalLogs = attendanceLogs.length;
    const onTimeCount = attendanceLogs.filter((item) => item.status === "On Time").length;
    const lateCount = attendanceLogs.filter((item) => item.status === "Late").length;
    const punctualityRate =
      totalLogs > 0 ? Math.round((onTimeCount / totalLogs) * 100) : 0;
    const alertRate = totalLogs > 0 ? Math.round((lateCount / totalLogs) * 100) : 0;

    const nodeCounter = new Map<string, number>();
    const deviceCounter = new Map<string, number>();

    attendanceLogs.forEach((log) => {
      nodeCounter.set(log.node, (nodeCounter.get(log.node) ?? 0) + 1);
      deviceCounter.set(log.device, (deviceCounter.get(log.device) ?? 0) + 1);
    });

    const busiestNode =
      Array.from(nodeCounter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
    const dominantDevice =
      Array.from(deviceCounter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

    const throughputSeries = attendanceLogs
      .slice(0, 7)
      .reverse()
      .map((_, index) => index + 2);

    const lateSeries = attendanceLogs
      .slice(0, 7)
      .reverse()
      .map((log, index) => (log.status === "Late" ? index + 2 : Math.max(1, index - 1)));

    const currentHour = new Date().getHours();

    return {
      totalLogs,
      onTimeCount,
      lateCount,
      punctualityRate,
      alertRate,
      busiestNode,
      dominantDevice,
      throughputSeries,
      lateSeries,
      greeting: getGreetingByShift(currentHour),
    };
  }, [attendanceLogs]);

  const statsCards = useMemo(
    () => [
      {
        title: "Total Workforce Active",
        value: stats.totalActive,
        delta: "+4.8% live throughput",
        hint: "Updated from biometric events",
        tone: "neutral" as const,
        sparkline: [182, 186, 190, 194, 198, 201, stats.totalActive],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M16 11a4 4 0 10-4-4 4 4 0 004 4zm-8 1a3 3 0 10-3-3 3 3 0 003 3zm8 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM8 14c-.29 0-.62.02-.97.05C4.64 14.32 2 15.5 2 18v2h4v-2c0-1.52.79-2.85 2.06-3.92A8.8 8.8 0 008 14z" />
          </svg>
        ),
      },
      {
        title: "Present Today",
        value: stats.present,
        delta: "+2.1% healthy trend",
        hint: "Clock-ins within standard window",
        tone: "success" as const,
        sparkline: [160, 164, 168, 171, 174, 178, stats.present],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M9.55 17.8L4.4 12.65l1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4L9.55 17.8z" />
          </svg>
        ),
      },
      {
        title: "Late Arrivals",
        value: stats.late,
        delta: `${analytics.alertRate}% live alert ratio`,
        hint: "Requires monitoring and escalation",
        tone: "warning" as const,
        sparkline: [7, 8, 9, 10, 11, 12, stats.late],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        ),
      },
      {
        title: "Unexcused Absences",
        value: stats.absent,
        delta: "-0.3% from last cycle",
        hint: "Static pending HR reconciliation",
        tone: "danger" as const,
        sparkline: [10, 10, 9, 9, 9, 8, stats.absent],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm4.59 13.17L15.17 16.6 12 13.41 8.83 16.6 7.4 15.17 10.59 12 7.4 8.83 8.83 7.4 12 10.59 15.17 7.4l1.42 1.43L13.41 12z" />
          </svg>
        ),
      },
    ],
    [analytics.alertRate, stats]
  );

  const handleHeaderSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "time" ? "desc" : "asc");
  };

  const onTimePercentage =
    stats.totalActive > 0 ? Math.round((stats.present / stats.totalActive) * 100) : 0;
  const latePercentage =
    stats.totalActive > 0 ? Math.round((stats.late / stats.totalActive) * 100) : 0;
  const absentPercentage =
    stats.totalActive > 0 ? Math.round((stats.absent / stats.totalActive) * 100) : 0;

  if (!mounted) {
    return <PageShellSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.12),_transparent_25%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  Live Sync Gateway Active
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                      Biometric Attendance
                    </h1>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                      Enterprise Monitor
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Real-time terminal punch tracking, workforce presence intelligence,
                    and gateway verification logs across multi-site business operations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    {analytics.greeting}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    {lastUpdated
                      ? `Last event ${lastUpdated.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}`
                      : "Waiting for live activity"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:min-w-[340px] xl:max-w-[380px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Punctuality
                    </p>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {analytics.punctualityRate}%
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Based on live stream sample
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Alert Ratio
                    </p>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {analytics.alertRate}%
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Late punches in current feed
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2">
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

                    <button
                      type="button"
                      onClick={() => setAutoRefresh((prev) => !prev)}
                      className={cx(
                        "inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                        autoRefresh
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-200/70 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      )}
                    >
                      <span
                        className={cx(
                          "h-2.5 w-2.5 rounded-full",
                          autoRefresh ? "bg-emerald-500" : "bg-slate-400"
                        )}
                      />
                      {autoRefresh ? "Auto Sync On" : "Auto Sync Off"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceLogs(INITIAL_LOGS);
                      setStats(INITIAL_STATS);
                      setLastUpdated(new Date());
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M17.65 6.35A7.95 7.95 0 0012 4V1L7 6l5 5V7a5 5 0 11-5 5H5a7 7 0 107.75-6.95 1 1 0 00.9-.7z" />
                    </svg>
                    Reset Feed
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {hydrated
              ? statsCards.map((card) => (
                  <MetricCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    delta={card.delta}
                    hint={card.hint}
                    tone={card.tone}
                    icon={card.icon}
                    sparkline={card.sparkline}
                  />
                ))
              : Array.from({ length: 4 }).map((_, index) => (
                  <Shimmer key={index} className="h-36 w-full rounded-3xl" />
                ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/10 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                      Live Stream Terminal Logs
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Searchable, sortable, responsive biometric activity feed.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SegmentedControl
                      value={statusFilter}
                      onChange={setStatusFilter}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setDensity((prev) =>
                          prev === "comfortable" ? "compact" : "comfortable"
                        )
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                      </svg>
                      {density === "comfortable" ? "Comfortable" : "Compact"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                    <SearchInput value={search} onChange={setSearch} />
                    <SortMenu
                      sortKey={sortKey}
                      direction={sortDirection}
                      onSortKeyChange={setSortKey}
                      onDirectionToggle={() =>
                        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                      }
                    />
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    {filteredLogs.length} visible log{filteredLogs.length === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div
                ref={logRegionRef}
                className="relative"
                aria-live="polite"
                aria-busy={!hydrated}
              >
                {hydrated ? (
                  <Fragment>
                    <div className="hidden md:block">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0">
                          <thead>
                            <tr className="border-b border-slate-200/70 dark:border-white/10">
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-left backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Log ID"
                                  active={sortKey === "name" && false}
                                  direction={sortDirection}
                                  onClick={() => {}}
                                />
                              </th>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-left backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Employee"
                                  active={sortKey === "name"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("name")}
                                />
                              </th>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-left backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Terminal"
                                  active={sortKey === "node"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("node")}
                                />
                              </th>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-left backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Status"
                                  active={sortKey === "status"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("status")}
                                />
                              </th>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-right backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Time"
                                  active={sortKey === "time"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("time")}
                                  align="right"
                                />
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredLogs.length > 0 ? (
                              filteredLogs.map((log) => (
                                <tr
                                  key={log.id}
                                  className="group transition-colors duration-200 hover:bg-cyan-500/[0.04] dark:hover:bg-white/[0.03]"
                                >
                                  <td
                                    className={cx(
                                      "px-6 text-sm",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <span className="inline-flex rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-1 font-mono text-xs font-bold tracking-wide text-cyan-700 dark:text-cyan-300">
                                      {log.id}
                                    </span>
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <div>
                                      <div className="font-semibold text-slate-950 dark:text-white">
                                        {log.name}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Device: {log.device}
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                      {log.node}
                                    </div>
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <StatusPill status={log.status} />
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6 text-right",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                      {log.time}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-14 text-center">
                                  <div className="mx-auto max-w-sm space-y-3">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-6 w-6 fill-current text-slate-400"
                                      >
                                        <path d="M10.5 3a7.5 7.5 0 015.965 12.05l4.242 4.243-1.414 1.414-4.243-4.242A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
                                      </svg>
                                    </div>
                                    <div className="text-base font-semibold text-slate-900 dark:text-white">
                                      No matching attendance logs
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                      Adjust filters or search terms to reveal live records.
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-200/70 md:hidden dark:divide-white/10">
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-4 transition-colors duration-200 hover:bg-cyan-500/[0.04] dark:hover:bg-white/[0.03]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <span className="inline-flex rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-cyan-700 dark:text-cyan-300">
                                  {log.id}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-slate-950 dark:text-white">
                                    {log.name}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {log.node}
                                  </p>
                                </div>
                              </div>
                              <StatusPill status={log.status} />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Time
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                                  {log.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Device
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                                  {log.device}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-12 text-center">
                          <div className="text-base font-semibold text-slate-900 dark:text-white">
                            No matching attendance logs
                          </div>
                        </div>
                      )}
                    </div>
                  </Fragment>
                ) : (
                  <div className="space-y-3 p-5 sm:p-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200/70 p-4 dark:border-white/10"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-2">
                            <Shimmer className="h-5 w-28 rounded-lg" />
                            <Shimmer className="h-4 w-44 rounded-lg" />
                          </div>
                          <Shimmer className="h-8 w-24 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                      Workforce Snapshot
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Operational attendance quality indicators.
                    </p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M3 13h8V3H3zm10 8h8v-8h-8zM3 21h8v-6H3zm10-10h8V3h-8z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <KPIWidget
                    label="Presence Coverage"
                    value={`${onTimePercentage}%`}
                    progress={onTimePercentage}
                    tone="emerald"
                  />
                  <KPIWidget
                    label="Late Arrival Exposure"
                    value={`${latePercentage}%`}
                    progress={latePercentage}
                    tone="amber"
                  />
                  <KPIWidget
                    label="Absence Exception"
                    value={`${absentPercentage}%`}
                    progress={absentPercentage}
                    tone="cyan"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Busiest Terminal Cluster
                      </p>
                      <h4 className="mt-1 font-semibold text-slate-950 dark:text-white">
                        {analytics.busiestNode}
                      </h4>
                    </div>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                      Live Density
                    </span>
                  </div>

                  <Suspense
                    fallback={
                      <div className="space-y-3">
                        <Shimmer className="h-10 w-full rounded-xl" />
                        <Shimmer className="h-10 w-full rounded-xl" />
                        <Shimmer className="h-10 w-full rounded-xl" />
                      </div>
                    }
                  >
                    <LazyRealtimeBars logs={attendanceLogs} />
                  </Suspense>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                      Operational Insights
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      High-value attendance intelligence for supervisors.
                    </p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8 14H7v-2h4zm6-4H7v-2h10zm0-4H7V7h10z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4">
                  <InsightCard
                    title="Primary Device"
                    value={analytics.dominantDevice}
                    description="Most frequently used authentication endpoint in the active stream."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M17 1H7a2 2 0 00-2 2v18a2 2 0 002 2h10a2 2 0 002-2V3a2 2 0 00-2-2zm0 16H7V5h10zm-5 4a1.5 1.5 0 111.5-1.5A1.5 1.5 0 0112 21z" />
                      </svg>
                    }
                  />
                  <InsightCard
                    title="Feed Quality"
                    value={`${analytics.onTimeCount}/${analytics.totalLogs}`}
                    description="On-time punch ratio captured from current visible activity records."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm4.29 8.29l-5 5a1 1 0 01-1.41 0l-2-2 1.41-1.41L10.59 13l4.29-4.29z" />
                      </svg>
                    }
                  />
                  <InsightCard
                    title="Stream Health"
                    value={autoRefresh ? "Stable" : "Paused"}
                    description="Live ingestion state for biometric synchronization and terminal event refresh."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 6v6l4 2-.75 1.23L10.5 13V6zM12 2a10 10 0 11-10 10A10 10 0 0112 2z" />
                      </svg>
                    }
                  />
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
