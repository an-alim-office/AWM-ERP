'use client';

import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

type CostCategory =
  | 'Infrastructure'
  | 'Payroll'
  | 'Operations'
  | 'Marketing'
  | 'Compliance'
  | 'Software'
  | 'Logistics';

type CostStatus = 'On Track' | 'Warning' | 'Over Budget';
type CostTrend = 'up' | 'down' | 'stable';
type ViewFilter = 'all' | CostCategory;
type SortKey = 'highest' | 'lowest' | 'variance' | 'utilization';

type CostRecord = {
  id: string;
  category: CostCategory;
  owner: string;
  budget: number;
  actual: number;
  forecast: number;
  status: CostStatus;
  trend: CostTrend;
  lastUpdated: string;
  utilization: number;
  variance: number;
};

type MetricCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

const monthlyMetrics: MetricCard[] = [
  { id: 'budget', label: 'Monthly Budget', value: 'SAR 2.48M', delta: '+4.8%', positive: true },
  { id: 'actual', label: 'Actual Spend', value: 'SAR 2.16M', delta: '-3.2%', positive: true },
  { id: 'forecast', label: 'Forecast EOM', value: 'SAR 2.39M', delta: '+1.1%', positive: true },
  { id: 'efficiency', label: 'Cost Efficiency', value: '91.4%', delta: '+5.6%', positive: true },
];

const initialCosts: CostRecord[] = [
  {
    id: 'cost-001',
    category: 'Infrastructure',
    owner: 'Platform Team',
    budget: 420000,
    actual: 398500,
    forecast: 412000,
    status: 'On Track',
    trend: 'down',
    lastUpdated: '2 hours ago',
    utilization: 95,
    variance: -21500,
  },
  {
    id: 'cost-002',
    category: 'Payroll',
    owner: 'HR & Finance',
    budget: 780000,
    actual: 774000,
    forecast: 781500,
    status: 'Warning',
    trend: 'up',
    lastUpdated: '45 minutes ago',
    utilization: 99,
    variance: -6000,
  },
  {
    id: 'cost-003',
    category: 'Operations',
    owner: 'Operations Control',
    budget: 315000,
    actual: 287400,
    forecast: 301800,
    status: 'On Track',
    trend: 'stable',
    lastUpdated: '1 hour ago',
    utilization: 91,
    variance: -27600,
  },
  {
    id: 'cost-004',
    category: 'Marketing',
    owner: 'Growth Team',
    budget: 220000,
    actual: 246500,
    forecast: 258000,
    status: 'Over Budget',
    trend: 'up',
    lastUpdated: '18 minutes ago',
    utilization: 112,
    variance: 26500,
  },
  {
    id: 'cost-005',
    category: 'Compliance',
    owner: 'Legal & Risk',
    budget: 145000,
    actual: 128600,
    forecast: 139200,
    status: 'On Track',
    trend: 'down',
    lastUpdated: '3 hours ago',
    utilization: 89,
    variance: -16400,
  },
  {
    id: 'cost-006',
    category: 'Software',
    owner: 'IT Procurement',
    budget: 340000,
    actual: 332800,
    forecast: 346500,
    status: 'Warning',
    trend: 'up',
    lastUpdated: '28 minutes ago',
    utilization: 98,
    variance: -7200,
  },
  {
    id: 'cost-007',
    category: 'Logistics',
    owner: 'Supply Chain',
    budget: 260000,
    actual: 241900,
    forecast: 249400,
    status: 'On Track',
    trend: 'stable',
    lastUpdated: '1 hour ago',
    utilization: 93,
    variance: -18100,
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

const pageShellClassName =
  'min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_left_top,rgba(16,185,129,0.10),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_left_top,rgba(16,185,129,0.14),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))] dark:text-slate-50';

const cardClassName =
  'rounded-[28px] border border-white/60 bg-white/80 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-900/75';

const statusStyles: Record<CostStatus, string> = {
  'On Track':
    'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  Warning:
    'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  'Over Budget':
    'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
};

const trendStyles: Record<CostTrend, string> = {
  up: 'text-rose-600 dark:text-rose-300',
  down: 'text-emerald-600 dark:text-emerald-300',
  stable: 'text-slate-500 dark:text-slate-400',
};

const ThemeToggle = memo(function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const saved = window.localStorage.getItem('awm-cost-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextDark = saved ? saved === 'dark' : prefersDark;
    root.classList.toggle('dark', nextDark);
    setDarkMode(nextDark);
  }, []);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = !darkMode;
    root.classList.toggle('dark', next);
    window.localStorage.setItem('awm-cost-theme', next ? 'dark' : 'light');
    setDarkMode(next);
  }, [darkMode]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
    >
      <span
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
          mounted && darkMode ? 'bg-slate-800 text-cyan-300' : 'bg-amber-100 text-amber-600'
        )}
      >
        {mounted && darkMode ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M21 12.79A9 9 0 0 1 11.21 3c0 .07-.01.14-.01.21A9 9 0 1 0 20.79 13c.07 0 .14-.01.21-.01Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0-16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm11.95 5.536 1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 1.414-1.414ZM7.05 7.05 8.464 8.464A1 1 0 0 1 7.05 9.878L5.636 8.464A1 1 0 0 1 7.05 7.05Zm9.9-1.414A1 1 0 0 1 18.364 7.05L16.95 8.464a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM7.05 14.122a1 1 0 0 1 1.414 1.414L7.05 16.95a1 1 0 1 1-1.414-1.414l1.414-1.414ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
          </svg>
        )}
      </span>
      <span>{mounted && darkMode ? 'Dark' : 'Light'}</span>
    </button>
  );
});

const Header = memo(function Header() {
  return (
    <section className={cn(cardClassName, 'relative overflow-hidden p-5 sm:p-6 lg:p-8')}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Enterprise Financial Control
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Cost Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Real-time monthly cost visibility, budget control, forecast intelligence, and department-level spend optimization in one modern enterprise workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Budget Snapshot
          </button>
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
});

const MetricGrid = memo(function MetricGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {monthlyMetrics.map((metric, index) => (
        <div
          key={metric.id}
          className={cn(
            cardClassName,
            'group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-24px_rgba(59,130,246,0.35)]'
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 opacity-90" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {metric.value}
              </p>
            </div>
            <div
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                metric.positive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
              )}
            >
              {metric.delta}
            </div>
          </div>

          <div className="mt-5 flex items-end gap-1">
            {[44, 53, 61, 57, 70, 82, 94].map((value, idx) => (
              <div
                key={`${metric.id}-${idx}`}
                className="h-16 flex-1 rounded-full bg-gradient-to-t from-blue-600/75 to-emerald-300/60 transition-transform duration-300 group-hover:scale-y-105 dark:from-cyan-500/60 dark:to-emerald-400/60"
                style={{ height: `${Math.max(22, value)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
});

const SpendDistribution = memo(function SpendDistribution() {
  const bars = [
    { label: 'Payroll', value: 78, color: 'from-blue-600 via-cyan-500 to-sky-400' },
    { label: 'Infrastructure', value: 62, color: 'from-emerald-600 via-green-500 to-lime-400' },
    { label: 'Software', value: 49, color: 'from-violet-600 via-fuchsia-500 to-pink-400' },
    { label: 'Operations', value: 43, color: 'from-amber-500 via-orange-500 to-rose-400' },
    { label: 'Marketing', value: 35, color: 'from-rose-600 via-pink-500 to-fuchsia-400' },
  ];

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Monthly Summary</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            মাসিক খরচের সারসংক্ষেপ, utilization trend এবং category distribution।
          </p>
        </div>
        <span className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Controlled spend
        </span>
      </div>

      <div className="space-y-4">
        {bars.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={cn('h-3 rounded-full bg-gradient-to-r', item.color)}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Budget Used', value: '87%' },
          { label: 'Savings', value: 'SAR 124K' },
          { label: 'Risk Items', value: '3' },
          { label: 'Forecast Drift', value: '1.8%' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-base font-black text-slate-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

const ForecastChart = memo(function ForecastChart() {
  const values = [64, 61, 58, 67, 72, 70, 76, 81, 79, 86, 91, 88];
  const max = Math.max(...values);

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Forecast Momentum</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Budget vs actual cost trend across the month
          </p>
        </div>
        <span className="rounded-2xl bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300">
          +6.4%
        </span>
      </div>

      <div className="flex h-56 items-end gap-2">
        {values.map((value, index) => (
          <div key={index} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              <div
                className="w-full rounded-t-[18px] bg-gradient-to-t from-blue-600 via-cyan-500 to-emerald-400 shadow-[0_12px_26px_-16px_rgba(59,130,246,0.55)] transition-all duration-300 group-hover:opacity-90"
                style={{ height: `${(value / max) * 100}%` }}
              />
              <div className="absolute -top-8 rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                {value}%
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const InsightsPanel = memo(function InsightsPanel() {
  const insights = [
    {
      title: 'Biggest savings pocket',
      value: 'Infrastructure optimization',
      detail: 'Compute and routing efficiency reduced monthly burn without service degradation',
    },
    {
      title: 'Highest budget pressure',
      value: 'Marketing campaign overrun',
      detail: 'Campaign acceleration is pushing spend beyond planned threshold',
    },
    {
      title: 'Recommended focus',
      value: 'Software license rationalization',
      detail: 'Unused seats and overlapping tools can improve cost efficiency',
    },
  ];

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Insights</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Smart signals from cost behavior and forecast movement
          </p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          Live
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((item) => (
          <div
            key={item.title}
            className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {item.title}
            </p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

const SearchField = memo(function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <div className="relative min-w-[240px] flex-1">
      <label htmlFor={inputId} className="sr-only">
        Search cost items
      </label>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        <circle cx="11" cy="11" r="6.5" />
      </svg>
      <input
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="category, owner, status বা budget search করুন..."
        className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
      />
    </div>
  );
});

const FilterToolbar = memo(function FilterToolbar({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  search,
  setSearch,
}: {
  filter: ViewFilter;
  setFilter: (value: ViewFilter) => void;
  sortBy: SortKey;
  setSortBy: (value: SortKey) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const filterId = useId();
  const sortId = useId();

  const filterOptions: ViewFilter[] = [
    'all',
    'Infrastructure',
    'Payroll',
    'Operations',
    'Marketing',
    'Compliance',
    'Software',
    'Logistics',
  ];

  return (
    <div className={cn(cardClassName, 'p-4')}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-[180px]">
              <label
                htmlFor={filterId}
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                Category Filter
              </label>
              <select
                id={filterId}
                value={filter}
                onChange={(e) => setFilter(e.target.value as ViewFilter)}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                {filterOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All Categories' : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[180px]">
              <label
                htmlFor={sortId}
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                Sort By
              </label>
              <select
                id={sortId}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                <option value="highest">Highest Spend</option>
                <option value="lowest">Lowest Spend</option>
                <option value="variance">Variance</option>
                <option value="utilization">Utilization</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filterOptions.slice(0, 5).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                filter === item
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

const SkeletonList = memo(function SkeletonList() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn(cardClassName, 'overflow-hidden p-5')}>
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const CostCard = memo(function CostCard({ item }: { item: CostRecord }) {
  const trendIcon =
    item.trend === 'up' ? (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m5 15 6-6 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7h2v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : item.trend === 'down' ? (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m5 9 6 6 4-4 4 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 17h2v-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14" strokeLinecap="round" />
      </svg>
    );

  return (
    <article className={cn(cardClassName, 'group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(59,130,246,0.35)] sm:p-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-sm font-black text-white shadow-lg shadow-blue-500/20">
            {item.category.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                {item.category}
              </h3>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', statusStyles[item.status])}>
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {item.owner} • {item.lastUpdated}
            </p>
          </div>
        </div>

        <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold', trendStyles[item.trend])}>
          {trendIcon}
          <span className="capitalize">{item.trend}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Budget
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.budget)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Actual
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.actual)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Forecast
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.forecast)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Variance
          </p>
          <p
            className={cn(
              'mt-2 text-sm font-black',
              item.variance > 0
                ? 'text-rose-600 dark:text-rose-300'
                : 'text-emerald-600 dark:text-emerald-300'
            )}
          >
            {item.variance > 0 ? '+' : ''}
            {formatCurrency(item.variance)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span>Budget Utilization</span>
          <span>{item.utilization}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={cn(
              'h-3 rounded-full bg-gradient-to-r',
              item.utilization >= 110
                ? 'from-rose-600 via-red-500 to-orange-400'
                : item.utilization >= 98
                  ? 'from-amber-500 via-orange-500 to-yellow-400'
                  : 'from-blue-600 via-cyan-500 to-emerald-500'
            )}
            style={{ width: `${Math.min(item.utilization, 100)}%` }}
          />
        </div>
      </div>
    </article>
  );
});

const CostTable = memo(function CostTable({ rows }: { rows: CostRecord[] }) {
  return (
    <div className={cn(cardClassName, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Cost Control Table</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Advanced searchable view of monthly spend and variance
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {rows.length} rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/60">
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Category
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Owner
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Actual
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Forecast
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Variance
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Utilization
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-200/80 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40"
              >
                <td className="px-5 py-4 align-top">
                  <div className="min-w-[180px]">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{row.category}</p>
                    <p className="mt-1">
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', statusStyles[row.status])}>
                        {row.status}
                      </span>
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {row.owner}
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(row.actual)}
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(row.forecast)}
                </td>
                <td
                  className={cn(
                    'px-5 py-4 align-top text-sm font-semibold',
                    row.variance > 0
                      ? 'text-rose-600 dark:text-rose-300'
                      : 'text-emerald-600 dark:text-emerald-300'
                  )}
                >
                  {row.variance > 0 ? '+' : ''}
                  {formatCurrency(row.variance)}
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {row.utilization}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const GovernancePanel = memo(function GovernancePanel() {
  const items = [
    { label: 'Budget policy compliance', value: '97.9%' },
    { label: 'Forecast accuracy', value: '94.2%' },
    { label: 'Variance review coverage', value: '92.6%' },
    { label: 'Cost optimization score', value: '89.8%' },
  ];

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Governance Pulse</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Financial control quality and spending discipline indicators
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Healthy
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500"
                style={{ width: item.value }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function CostManagementPage() {
  const [costs] = useState<CostRecord[]>(initialCosts);
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('highest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 850);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredCosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    let next = costs.filter((item) => {
      const categoryMatch = filter === 'all' ? true : item.category === filter;
      if (!categoryMatch) return false;

      if (!query) return true;

      const haystack = [
        item.category,
        item.owner,
        item.status,
        item.lastUpdated,
        item.budget.toString(),
        item.actual.toString(),
        item.forecast.toString(),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    next = [...next].sort((a, b) => {
      if (sortBy === 'lowest') return a.actual - b.actual;
      if (sortBy === 'variance') return Math.abs(b.variance) - Math.abs(a.variance);
      if (sortBy === 'utilization') return b.utilization - a.utilization;
      return b.actual - a.actual;
    });

    return next;
  }, [costs, deferredSearch, filter, sortBy]);

  const summary = useMemo(() => {
    const totalBudget = filteredCosts.reduce((sum, item) => sum + item.budget, 0);
    const totalActual = filteredCosts.reduce((sum, item) => sum + item.actual, 0);
    const totalForecast = filteredCosts.reduce((sum, item) => sum + item.forecast, 0);
    const totalVariance = filteredCosts.reduce((sum, item) => sum + item.variance, 0);

    return {
      totalBudget,
      totalActual,
      totalForecast,
      totalVariance,
    };
  }, [filteredCosts]);

  return (
    <div className={pageShellClassName}>
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <Header />
          <MetricGrid />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <SpendDistribution />
            <div className="space-y-6">
              <ForecastChart />
              <InsightsPanel />
            </div>
          </div>

          <FilterToolbar
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            search={search}
            setSearch={setSearch}
          />

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.2fr)_420px]">
            <div className="space-y-4">
              <div className={cn(cardClassName, 'p-5')}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Filtered Budget
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(summary.totalBudget)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Filtered Actual
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(summary.totalActual)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Filtered Forecast
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      {formatCurrency(summary.totalForecast)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Net Variance
                    </p>
                    <p
                      className={cn(
                        'mt-2 text-lg font-black',
                        summary.totalVariance > 0
                          ? 'text-rose-600 dark:text-rose-300'
                          : 'text-emerald-600 dark:text-emerald-300'
                      )}
                    >
                      {summary.totalVariance > 0 ? '+' : ''}
                      {formatCurrency(summary.totalVariance)}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <SkeletonList />
              ) : filteredCosts.length > 0 ? (
                filteredCosts.map((item) => <CostCard key={item.id} item={item} />)
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/65">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="11" cy="11" r="6.5" />
                      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                    কোন matching cost record পাওয়া যায়নি
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Search, filter অথবা sort change করে আবার দেখুন।
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <CostTable rows={filteredCosts} />
              <GovernancePanel />
              <div className={cn(cardClassName, 'p-5')}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Quick Signals</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      High-level enterprise cost markers
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatCompact(filteredCosts.length)} areas
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: 'Highest actual spend',
                      value:
                        filteredCosts.length > 0
                          ? filteredCosts.reduce((max, item) => (item.actual > max.actual ? item : max), filteredCosts[0]).category
                          : '-',
                    },
                    {
                      label: 'Highest variance risk',
                      value:
                        filteredCosts.length > 0
                          ? filteredCosts.reduce((max, item) =>
                              Math.abs(item.variance) > Math.abs(max.variance) ? item : max,
                            filteredCosts[0]).category
                          : '-',
                    },
                    {
                      label: 'Best controlled category',
                      value:
                        filteredCosts.length > 0
                          ? [...filteredCosts]
                              .sort((a, b) => a.utilization - b.utilization)[0]?.category ?? '-'
                          : '-',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
