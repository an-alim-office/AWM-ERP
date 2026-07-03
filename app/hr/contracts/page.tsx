"use client";

import React, {
  Fragment,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";

type ContractStatus = "Active" | "Expiring Soon" | "Terminated";
type ContractType = "Full-Time" | "Contractual" | "Probation";
type Density = "comfortable" | "compact";
type SortKey = "name" | "type" | "status" | "salary" | "expiry";
type SortDirection = "asc" | "desc";

type Contract = {
  id: string;
  name: string;
  type: ContractType;
  duration: string;
  status: ContractStatus;
  salary: string;
  expiry: string;
};

type ContractStats = {
  totalContracts: number;
  active: number;
  expiring: number;
  terminated: number;
};

const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "CON-8801",
    name: "Ahmed Mansoor",
    type: "Full-Time",
    duration: "2 Years",
    status: "Active",
    salary: "12,500 SAR",
    expiry: "15 Jan 2028",
  },
  {
    id: "CON-8802",
    name: "Youssef Al-Harbi",
    type: "Contractual",
    duration: "1 Year",
    status: "Active",
    salary: "9,000 SAR",
    expiry: "10 Dec 2026",
  },
  {
    id: "CON-8803",
    name: "Fahad Mustafa",
    type: "Full-Time",
    duration: "3 Years",
    status: "Expiring Soon",
    salary: "15,000 SAR",
    expiry: "30 Aug 2026",
  },
  {
    id: "CON-8804",
    name: "Tariq Abdulaziz",
    type: "Probation",
    duration: "3 Months",
    status: "Terminated",
    salary: "5,500 SAR",
    expiry: "Expired",
  },
];

const STATIC_STATS: ContractStats = {
  totalContracts: 142,
  active: 128,
  expiring: 9,
  terminated: 5,
};

const CONTRACT_TYPE_OPTIONS: Array<ContractType | "All"> = [
  "All",
  "Full-Time",
  "Contractual",
  "Probation",
];

const CONTRACT_STATUS_OPTIONS: Array<ContractStatus | "All"> = [
  "All",
  "Active",
  "Expiring Soon",
  "Terminated",
];

const statusStyles: Record<
  ContractStatus,
  {
    badge: string;
    dot: string;
    accent: string;
  }
> = {
  Active: {
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    accent: "from-emerald-500/15 via-green-500/10 to-teal-500/10",
  },
  "Expiring Soon": {
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    accent: "from-amber-500/15 via-orange-500/10 to-yellow-500/10",
  },
  Terminated: {
    badge:
      "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
    accent: "from-rose-500/15 via-red-500/10 to-pink-500/10",
  },
};

const typeStyles: Record<ContractType, string> = {
  "Full-Time":
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  Contractual:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Probation:
    "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const parseSalary = (salary: string) => {
  const numeric = salary.replace(/[^\d.]/g, "");
  return Number(numeric || 0);
};

const parseExpiry = (expiry: string) => {
  if (expiry.toLowerCase() === "expired") return 0;
  const parsed = Date.parse(expiry);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const LazyContractsBars = lazy(async () => ({
  default: function ContractsBars({
    data,
  }: {
    data: Array<{ label: string; value: number; tone: string }>;
  }) {
    const max = Math.max(...data.map((item) => item.value), 1);

    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatNumber(item.value)}
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

function useThemeMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("contracts-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setIsDark(nextDark);
    root.classList.toggle("dark", nextDark);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      const persisted = window.localStorage.getItem("contracts-theme");
      if (persisted) return;
      setIsDark(event.matches);
      root.classList.toggle("dark", event.matches);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("contracts-theme", next ? "dark" : "light");
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

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Shimmer className="h-28 w-full rounded-[28px]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.85fr]">
          <Shimmer className="h-[640px] w-full rounded-[28px]" />
          <div className="space-y-6">
            <Shimmer className="h-[300px] w-full rounded-[28px]" />
            <Shimmer className="h-[300px] w-full rounded-[28px]" />
          </div>
        </div>
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
      <span className="sr-only">Search contracts</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M10.5 3a7.5 7.5 0 015.965 12.05l4.242 4.243-1.414 1.414-4.243-4.242A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search employee, contract id, salary, duration..."
        className="h-11 w-full rounded-2xl border border-slate-200/70 bg-white/80 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/10"
      />
    </label>
  );
}

function SegmentedFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="inline-flex rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5"
      role="tablist"
      aria-label={label}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cx(
              "rounded-xl px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200",
              active
                ? "bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {option}
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
      <label htmlFor="contract-sort" className="sr-only">
        Sort contracts
      </label>
      <select
        id="contract-sort"
        value={sortKey}
        onChange={(event) => onSortKeyChange(event.target.value as SortKey)}
        className="h-11 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/10"
      >
        <option value="name">Sort: Name</option>
        <option value="type">Sort: Type</option>
        <option value="status">Sort: Status</option>
        <option value="salary">Sort: Salary</option>
        <option value="expiry">Sort: Expiry</option>
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

function StatusPill({ status }: { status: ContractStatus }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusStyles[status].badge
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", statusStyles[status].dot)} />
      {status}
    </span>
  );
}

function TypePill({ type }: { type: ContractType }) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
        typeStyles[type]
      )}
    >
      {type}
    </span>
  );
}

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

function MetricCard({
  title,
  value,
  delta,
  hint,
  icon,
  sparkline,
  gradientId,
  colors,
  toneClass,
}: {
  title: string;
  value: number;
  delta: string;
  hint: string;
  icon: React.ReactNode;
  sparkline: number[];
  gradientId: string;
  colors: [string, string];
  toneClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-30px_rgba(59,130,246,0.25)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_64px_-32px_rgba(0,0,0,0.55)]">
      <div className={cx("pointer-events-none absolute inset-0 bg-gradient-to-br", toneClass)} />
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

        <MiniSparkline values={sparkline} gradientId={gradientId} colors={colors} />
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
  const [contracts] = useState<Contract[]>(INITIAL_CONTRACTS);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<ContractType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("expiry");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [density, setDensity] = useState<Density>("comfortable");

  const { isDark, toggleTheme } = useThemeMode();

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => setHydrated(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = contracts.filter((contract) => {
      const matchesSearch =
        query.length === 0
          ? true
          : [
              contract.id,
              contract.name,
              contract.type,
              contract.status,
              contract.salary,
              contract.duration,
              contract.expiry,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query);

      const matchesType = selectedType === "All" ? true : contract.type === selectedType;
      const matchesStatus =
        selectedStatus === "All" ? true : contract.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const getValue = (item: Contract) => {
        switch (sortKey) {
          case "name":
            return item.name.toLowerCase();
          case "type":
            return item.type.toLowerCase();
          case "status":
            return item.status.toLowerCase();
          case "salary":
            return parseSalary(item.salary);
          case "expiry":
          default:
            return parseExpiry(item.expiry);
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
  }, [contracts, search, selectedType, selectedStatus, sortKey, sortDirection]);

  const analytics = useMemo(() => {
    const visibleCount = filteredContracts.length;
    const activeVisible = filteredContracts.filter((item) => item.status === "Active").length;
    const expiringVisible = filteredContracts.filter(
      (item) => item.status === "Expiring Soon"
    ).length;
    const terminatedVisible = filteredContracts.filter(
      (item) => item.status === "Terminated"
    ).length;

    const totalSalary = contracts.reduce((acc, item) => acc + parseSalary(item.salary), 0);
    const averageSalary = contracts.length > 0 ? Math.round(totalSalary / contracts.length) : 0;

    const highestSalary =
      contracts.reduce((max, item) => Math.max(max, parseSalary(item.salary)), 0) || 0;

    const typeCounter = new Map<string, number>();
    contracts.forEach((item) => {
      typeCounter.set(item.type, (typeCounter.get(item.type) ?? 0) + 1);
    });

    const dominantType =
      Array.from(typeCounter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

    return {
      visibleCount,
      activeVisible,
      expiringVisible,
      terminatedVisible,
      averageSalary,
      highestSalary,
      dominantType,
      statusBars: [
        {
          label: "Active",
          value: STATIC_STATS.active,
          tone: "from-emerald-500 to-teal-500",
        },
        {
          label: "Expiring Soon",
          value: STATIC_STATS.expiring,
          tone: "from-amber-500 to-orange-500",
        },
        {
          label: "Terminated",
          value: STATIC_STATS.terminated,
          tone: "from-rose-500 to-pink-500",
        },
      ],
    };
  }, [contracts, filteredContracts]);

  const cards = useMemo(
    () => [
      {
        title: "Total Contracts",
        value: STATIC_STATS.totalContracts,
        delta: "+6.4% annual workforce growth",
        hint: "Cross-business employment registry",
        gradientId: "contracts-total",
        colors: ["#06b6d4", "#8b5cf6"] as [string, string],
        toneClass:
          "from-cyan-500/15 via-blue-500/10 to-violet-500/10 dark:from-cyan-500/15 dark:via-blue-500/10 dark:to-violet-500/10",
        sparkline: [118, 121, 126, 130, 134, 138, STATIC_STATS.totalContracts],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1.5V8h4.5zM8 12h8v-1.5H8zm0 4h8v-1.5H8zm0 4h5v-1.5H8z" />
          </svg>
        ),
      },
      {
        title: "Active Agreements",
        value: STATIC_STATS.active,
        delta: "+2.9% retention confidence",
        hint: "Healthy employment continuity",
        gradientId: "contracts-active",
        colors: ["#10b981", "#14b8a6"] as [string, string],
        toneClass:
          "from-emerald-500/15 via-green-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:via-green-500/10 dark:to-teal-500/10",
        sparkline: [112, 115, 118, 120, 123, 125, STATIC_STATS.active],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M9.55 17.8L4.4 12.65l1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4L9.55 17.8z" />
          </svg>
        ),
      },
      {
        title: "Expiring (30 Days)",
        value: STATIC_STATS.expiring,
        delta: "Renewal queue requires action",
        hint: "Priority compliance watchlist",
        gradientId: "contracts-expiring",
        colors: ["#f59e0b", "#f97316"] as [string, string],
        toneClass:
          "from-amber-500/15 via-orange-500/10 to-yellow-500/10 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-yellow-500/10",
        sparkline: [4, 5, 6, 6, 7, 8, STATIC_STATS.expiring],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        ),
      },
      {
        title: "Terminated / Void",
        value: STATIC_STATS.terminated,
        delta: "-1.1% inactive load",
        hint: "Archived but still auditable",
        gradientId: "contracts-terminated",
        colors: ["#f43f5e", "#ef4444"] as [string, string],
        toneClass:
          "from-rose-500/15 via-red-500/10 to-pink-500/10 dark:from-rose-500/15 dark:via-red-500/10 dark:to-pink-500/10",
        sparkline: [9, 8, 8, 7, 6, 5, STATIC_STATS.terminated],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm4.59 13.17L15.17 16.6 12 13.41 8.83 16.6 7.4 15.17 10.59 12 7.4 8.83 8.83 7.4 12 10.59 15.17 7.4l1.42 1.43L13.41 12z" />
          </svg>
        ),
      },
    ],
    []
  );

  const activePercent = Math.round(
    (STATIC_STATS.active / STATIC_STATS.totalContracts) * 100
  );
  const expiringPercent = Math.round(
    (STATIC_STATS.expiring / STATIC_STATS.totalContracts) * 100
  );
  const terminatedPercent = Math.round(
    (STATIC_STATS.terminated / STATIC_STATS.totalContracts) * 100
  );

  const handleHeaderSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "salary" || key === "expiry" ? "desc" : "asc");
  };

  if (!mounted) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.08),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_25%)]" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  </span>
                  Contracts Compliance Matrix
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                      Workforce Contracts
                    </h1>
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
                      Enterprise Registry
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Manage corporate employment agreements, salary matrix, tenure
                    visibility, and lifecycle compliance across workforce operations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Policy governed
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Renewal watch enabled
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:min-w-[340px] xl:max-w-[380px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Avg. Salary
                    </p>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {formatNumber(analytics.averageSalary)} SAR
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Across visible payroll structure
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Highest Package
                    </p>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {formatNumber(analytics.highestSalary)} SAR
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Premium contract band
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
                      onClick={() =>
                        setDensity((prev) =>
                          prev === "comfortable" ? "compact" : "comfortable"
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                      </svg>
                      {density === "comfortable" ? "Comfortable" : "Compact"}
                    </button>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Audit Ready
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {hydrated
              ? cards.map((card) => (
                  <MetricCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    delta={card.delta}
                    hint={card.hint}
                    icon={card.icon}
                    sparkline={card.sparkline}
                    gradientId={card.gradientId}
                    colors={card.colors}
                    toneClass={card.toneClass}
                  />
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <Shimmer key={i} className="h-36 w-full rounded-3xl" />
                ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.85fr]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/10 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                      Active Employment Registry
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Advanced registry view with contract search, status filters, and
                      sortable compensation visibility.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SegmentedFilter
                      label="Contract status filter"
                      options={CONTRACT_STATUS_OPTIONS}
                      value={selectedStatus}
                      onChange={(value) =>
                        setSelectedStatus(value as ContractStatus | "All")
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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

                    <div className="flex flex-wrap gap-2">
                      <SegmentedFilter
                        label="Contract type filter"
                        options={CONTRACT_TYPE_OPTIONS}
                        value={selectedType}
                        onChange={(value) =>
                          setSelectedType(value as ContractType | "All")
                        }
                      />
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    {analytics.visibleCount} visible contract
                    {analytics.visibleCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="relative" aria-live="polite" aria-busy={!hydrated}>
                {hydrated ? (
                  <Fragment>
                    <div className="hidden md:block">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0">
                          <thead>
                            <tr>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-left backdrop-blur dark:bg-slate-950/70">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Contract ID
                                </span>
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
                                  label="Type"
                                  active={sortKey === "type"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("type")}
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
                                  label="Salary"
                                  active={sortKey === "salary"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("salary")}
                                  align="right"
                                />
                              </th>
                              <th className="sticky top-0 z-10 bg-white/90 px-6 py-4 text-right backdrop-blur dark:bg-slate-950/70">
                                <TableHeaderButton
                                  label="Expiry"
                                  active={sortKey === "expiry"}
                                  direction={sortDirection}
                                  onClick={() => handleHeaderSort("expiry")}
                                  align="right"
                                />
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredContracts.length > 0 ? (
                              filteredContracts.map((contract) => (
                                <tr
                                  key={contract.id}
                                  className="group transition-colors duration-200 hover:bg-cyan-500/[0.04] dark:hover:bg-white/[0.03]"
                                >
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <span className="inline-flex rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-1 font-mono text-xs font-bold tracking-wide text-cyan-700 dark:text-cyan-300">
                                      {contract.id}
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
                                        {contract.name}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Duration: {contract.duration}
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <TypePill type={contract.type} />
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <StatusPill status={contract.status} />
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6 text-right",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <div className="font-semibold text-slate-950 dark:text-white">
                                      {contract.salary}
                                    </div>
                                  </td>
                                  <td
                                    className={cx(
                                      "px-6 text-right",
                                      density === "compact" ? "py-3" : "py-4"
                                    )}
                                  >
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                      {contract.expiry}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-14 text-center">
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
                                      No matching contracts found
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                      Adjust search, type, or status filters to reveal
                                      records.
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
                      {filteredContracts.length > 0 ? (
                        filteredContracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="p-4 transition-colors duration-200 hover:bg-cyan-500/[0.04] dark:hover:bg-white/[0.03]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <span className="inline-flex rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-cyan-700 dark:text-cyan-300">
                                  {contract.id}
                                </span>
                                <div>
                                  <h3 className="font-semibold text-slate-950 dark:text-white">
                                    {contract.name}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {contract.duration} • {contract.expiry}
                                  </p>
                                </div>
                              </div>
                              <StatusPill status={contract.status} />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Type
                                </p>
                                <div className="mt-1">
                                  <TypePill type={contract.type} />
                                </div>
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Salary
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                                  {contract.salary}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-12 text-center">
                          <div className="text-base font-semibold text-slate-900 dark:text-white">
                            No matching contracts found
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
                      Contract Health
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Lifecycle distribution and portfolio quality indicators.
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
                    label="Active Coverage"
                    value={`${activePercent}%`}
                    progress={activePercent}
                    tone="emerald"
                  />
                  <KPIWidget
                    label="Expiry Risk"
                    value={`${expiringPercent}%`}
                    progress={expiringPercent}
                    tone="amber"
                  />
                  <KPIWidget
                    label="Terminated Archive"
                    value={`${terminatedPercent}%`}
                    progress={terminatedPercent}
                    tone="cyan"
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Portfolio Distribution
                      </p>
                      <h4 className="mt-1 font-semibold text-slate-950 dark:text-white">
                        Status Load by Registry
                      </h4>
                    </div>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                      Live Overview
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
                    <LazyContractsBars data={analytics.statusBars} />
                  </Suspense>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.6)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                      Strategic Insights
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Executive-grade signals for contract planning and renewal flow.
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
                    title="Dominant Contract Type"
                    value={analytics.dominantType}
                    description="Most represented employment class in the current contract registry."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M7 2h10a2 2 0 012 2v16l-7-3-7 3V4a2 2 0 012-2z" />
                      </svg>
                    }
                  />
                  <InsightCard
                    title="Visible Active Window"
                    value={`${analytics.activeVisible}/${analytics.visibleCount || 0}`}
                    description="Active agreement ratio based on the current filtered contract scope."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm4.29 8.29l-5 5a1 1 0 01-1.41 0l-2-2 1.41-1.41L10.59 13l4.29-4.29z" />
                      </svg>
                    }
                  />
                  <InsightCard
                    title="Review Pressure"
                    value={`${analytics.expiringVisible} Expiring`}
                    description="Contracts currently surfaced in a renewal-sensitive or action-required state."
                    icon={
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 8v5l3 3 1.4-1.4-2.4-2.6V8zM12 2a10 10 0 1010 10A10 10 0 0012 2z" />
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
