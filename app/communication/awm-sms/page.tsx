'use client';

import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

type SmsStatus = 'Delivered' | 'Pending' | 'Failed' | 'Scheduled';
type SmsPriority = 'Low' | 'Normal' | 'High' | 'Critical';
type SmsChannel = 'Transactional' | 'Promotional' | 'OTP' | 'Alert';
type SmsFilter = 'All' | SmsStatus;
type SortKey = 'latest' | 'status' | 'priority' | 'delivery';

type RecipientGroup = {
  id: string;
  name: string;
  count: number;
};

type SmsMessage = {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  status: SmsStatus;
  priority: SmsPriority;
  channel: SmsChannel;
  sentAt: string;
  segments: number;
  cost: number;
  deliveryRate: number;
  tags: string[];
};

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
};

type ComposerPayload = {
  recipient: string;
  phone: string;
  message: string;
  priority: SmsPriority;
  channel: SmsChannel;
  groups: string[];
  scheduled: boolean;
};

type ComposerDraft = ComposerPayload;

type MetricCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

const storageKey = 'awm-sms-advanced-v1';
const themeKey = 'awm-sms-theme';

const initialMessages: SmsMessage[] = [
  {
    id: 'sms-1009',
    recipient: 'Rahim Uddin',
    phone: '+966 55 812 4421',
    message: 'আপনার attendance discrepancy review সম্পন্ন হয়েছে। Updated record dashboard-এ available.',
    status: 'Delivered',
    priority: 'High',
    channel: 'Alert',
    sentAt: '2 মিনিট আগে',
    segments: 1,
    cost: 0.08,
    deliveryRate: 99,
    tags: ['Attendance', 'HR'],
  },
  {
    id: 'sms-1008',
    recipient: 'Nusrat Jahan',
    phone: '+966 50 367 1188',
    message: 'Payroll release window আজ 4:30 PM এ শুরু হবে। Approval status verify করুন.',
    status: 'Delivered',
    priority: 'Critical',
    channel: 'Transactional',
    sentAt: '11 মিনিট আগে',
    segments: 1,
    cost: 0.09,
    deliveryRate: 100,
    tags: ['Payroll', 'Finance'],
  },
  {
    id: 'sms-1007',
    recipient: 'Arafat Hossain',
    phone: '+966 54 771 5522',
    message: 'Enterprise social recognition digest এখন ready। Team milestone update review করুন.',
    status: 'Pending',
    priority: 'Normal',
    channel: 'Promotional',
    sentAt: '23 মিনিট আগে',
    segments: 2,
    cost: 0.14,
    deliveryRate: 72,
    tags: ['Recognition', 'Social'],
  },
  {
    id: 'sms-1006',
    recipient: 'Samia Akter',
    phone: '+966 58 912 1190',
    message: 'Security verification code: 482913. This OTP will expire in 5 minutes.',
    status: 'Delivered',
    priority: 'Critical',
    channel: 'OTP',
    sentAt: '34 মিনিট আগে',
    segments: 1,
    cost: 0.07,
    deliveryRate: 100,
    tags: ['OTP', 'Security'],
  },
  {
    id: 'sms-1005',
    recipient: 'Mahin Islam',
    phone: '+966 53 606 0911',
    message: 'Vendor payment reconciliation alert: mismatched ledger entry detected. Review required.',
    status: 'Failed',
    priority: 'High',
    channel: 'Alert',
    sentAt: '51 মিনিট আগে',
    segments: 2,
    cost: 0.11,
    deliveryRate: 16,
    tags: ['Alert', 'Finance'],
  },
  {
    id: 'sms-1004',
    recipient: 'Tania Sultana',
    phone: '+966 56 440 8833',
    message: 'Tomorrow leadership sync meeting reminder has been scheduled successfully.',
    status: 'Scheduled',
    priority: 'Low',
    channel: 'Transactional',
    sentAt: '1 ঘন্টা আগে',
    segments: 1,
    cost: 0.05,
    deliveryRate: 0,
    tags: ['Reminder', 'Leadership'],
  },
];

const recipientGroups: RecipientGroup[] = [
  { id: 'ops', name: 'Operations Team', count: 142 },
  { id: 'sales', name: 'Sales Team', count: 88 },
  { id: 'hr', name: 'HR & Admin', count: 36 },
  { id: 'finance', name: 'Finance Team', count: 24 },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatMoney(value: number) {
  return `SAR ${value.toFixed(2)}`;
}

function getCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function makeId() {
  return `sms-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

const pageShellClassName =
  'min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_24%),radial-gradient(circle_at_left_top,rgba(59,130,246,0.10),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_left_top,rgba(56,189,248,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))] dark:text-slate-50';

const cardClassName =
  'rounded-[28px] border border-white/60 bg-white/80 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-900/75';

const statusStyles: Record<SmsStatus, string> = {
  Delivered:
    'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  Pending:
    'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  Failed:
    'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  Scheduled:
    'bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
};

const priorityStyles: Record<SmsPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Normal: 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
  High: 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  Critical: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const channelStyles: Record<SmsChannel, string> = {
  Transactional: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  Promotional: 'bg-fuchsia-500/10 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
  OTP: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  Alert: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};

const QuickStats = memo(function QuickStats({ messages }: { messages: SmsMessage[] }) {
  const total = messages.length || 1;
  const delivered = messages.filter((m) => m.status === 'Delivered').length;
  const pending = messages.filter((m) => m.status === 'Pending').length;
  const failed = messages.filter((m) => m.status === 'Failed').length;
  const scheduled = messages.filter((m) => m.status === 'Scheduled').length;
  const totalCost = messages.reduce((sum, m) => sum + m.cost, 0);
  const avgCost = totalCost / total;
  const deliveryRate = Math.round((delivered / total) * 100);
  const otpCount = messages.filter((m) => m.channel === 'OTP').length;

  const metrics: MetricCard[] = [
    {
      id: 'sent',
      label: 'Messages Today',
      value: getCompactNumber(messages.length),
      delta: `+${Math.max(1, messages.length % 14)}.8%`,
      positive: true,
    },
    {
      id: 'delivery',
      label: 'Delivery Success',
      value: `${deliveryRate}%`,
      delta: deliveryRate >= 95 ? '+1.3%' : '-0.8%',
      positive: true,
    },
    {
      id: 'latency',
      label: 'Queued / Scheduled',
      value: getCompactNumber(pending + scheduled),
      delta: `Failed ${failed}`,
      positive: failed < 3,
    },
    {
      id: 'cost',
      label: 'Avg. Message Cost',
      value: formatMoney(avgCost || 0),
      delta: otpCount > 0 ? `${otpCount} OTP` : 'Balanced',
      positive: true,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.id}
          className={cn(
            cardClassName,
            'group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-24px_rgba(16,185,129,0.35)]'
          )}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 opacity-90" />
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
            {[40, 58, 64, 50, 71, 79, 92].map((value, idx) => (
              <div
                key={`${metric.id}-${idx}`}
                className="h-16 flex-1 rounded-full bg-gradient-to-t from-emerald-500/75 to-cyan-300/60 transition-transform duration-300 group-hover:scale-y-105 dark:from-emerald-500/60 dark:to-blue-400/60"
                style={{ height: `${Math.max(22, value)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
});

const ThemeToggle = memo(function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const saved = window.localStorage.getItem(themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextDark = saved ? saved === 'dark' : prefersDark;
    root.classList.toggle('dark', nextDark);
    setDarkMode(nextDark);
  }, []);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = !darkMode;
    root.classList.toggle('dark', next);
    window.localStorage.setItem(themeKey, next ? 'dark' : 'light');
    setDarkMode(next);
  }, [darkMode]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_24%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Enterprise Messaging Console
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            AWM SMS Advanced
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            Secure high-volume operational messaging, critical alerts, OTP delivery, message routing,
            and team communication from one modern enterprise-grade SMS workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Quick Campaign
          </button>
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
});

const InsightsPanel = memo(function InsightsPanel({ messages }: { messages: SmsMessage[] }) {
  const topChannel = useMemo(() => {
    const map = messages.reduce<Record<SmsChannel, number>>(
      (acc, item) => {
        acc[item.channel] += 1;
        return acc;
      },
      {
        Transactional: 0,
        Promotional: 0,
        OTP: 0,
        Alert: 0,
      }
    );

    return (Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Transactional') as SmsChannel;
  }, [messages]);

  const deliveredRate = useMemo(() => {
    const total = messages.length || 1;
    const delivered = messages.filter((m) => m.status === 'Delivered').length;
    return Math.round((delivered / total) * 100);
  }, [messages]);

  const insights = [
    {
      title: 'Best performing stream',
      value: `${topChannel} traffic`,
      detail: 'Highest reliability and near-instant delivery in current traffic window',
    },
    {
      title: 'Routing insight',
      value: `${deliveredRate}% delivered`,
      detail: 'Delivery path is healthy for operational and OTP workflows',
    },
    {
      title: 'Next optimization',
      value: 'Segment length control',
      detail: 'Shorter templates can reduce cost and improve send speed',
    },
  ];

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Insights</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time operational signals from SMS activity
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

const GovernancePanel = memo(function GovernancePanel({ messages }: { messages: SmsMessage[] }) {
  const total = messages.length || 1;
  const delivered = messages.filter((m) => m.status === 'Delivered').length;
  const failed = messages.filter((m) => m.status === 'Failed').length;
  const scheduled = messages.filter((m) => m.status === 'Scheduled').length;

  const items = [
    { label: 'Policy-safe templates', value: `${Math.max(90, 100 - failed * 3)}%` },
    { label: 'Critical alert delivery', value: `${Math.max(85, Math.min(100, Math.round((delivered / total) * 100)))}%` },
    { label: 'Scheduled queue health', value: `${Math.max(0, 100 - scheduled * 10)}%` },
    { label: 'Cost control compliance', value: `${Math.max(88, 100 - Math.round((messages.reduce((a, b) => a + b.cost, 0) / total) * 100))}%` },
  ];

  return (
    <div className={cn(cardClassName, 'p-5')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Governance Pulse</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enterprise-grade control and routing quality indicators
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Healthy
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const percentage = Number(item.value.replace('%', ''));
          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-500"
                  style={{ width: `${Math.max(8, Math.min(100, percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
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
        Search messages
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
        placeholder="প্রাপক, নম্বর, tag, channel বা message search করুন..."
        className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
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
  rowsPerPage,
  setRowsPerPage,
  onExport,
  onReset,
  resultsCount,
  totalCount,
}: {
  filter: SmsFilter;
  setFilter: (value: SmsFilter) => void;
  sortBy: SortKey;
  setSortBy: (value: SortKey) => void;
  search: string;
  setSearch: (value: string) => void;
  rowsPerPage: number;
  setRowsPerPage: (value: number) => void;
  onExport: () => void;
  onReset: () => void;
  resultsCount: number;
  totalCount: number;
}) {
  const filterId = useId();
  const sortId = useId();
  const pageSizeId = useId();
  const filters: SmsFilter[] = ['All', 'Delivered', 'Pending', 'Failed', 'Scheduled'];

  return (
    <div className={cn(cardClassName, 'p-4')}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-[160px]">
              <label
                htmlFor={filterId}
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                Status Filter
              </label>
              <select
                id={filterId}
                value={filter}
                onChange={(e) => setFilter(e.target.value as SmsFilter)}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                {filters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[160px]">
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
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                <option value="latest">Latest</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="delivery">Delivery Rate</option>
              </select>
            </div>

            <div className="min-w-[160px]">
              <label
                htmlFor={pageSizeId}
                className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                Rows per page
              </label>
              <select
                id={pageSizeId}
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              >
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-900"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reset Data
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilter('All');
              setSortBy('latest');
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all duration-200 hover:bg-emerald-500/15 dark:text-emerald-300"
          >
            Clear Filters
          </button>
          <div className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
            {resultsCount}/{totalCount} shown
          </div>
        </div>
      </div>
    </div>
  );
});

const MessageComposer = memo(function MessageComposer({
  onSubmit,
  editingMessage,
  onCancelEdit,
}: {
  onSubmit: (payload: ComposerPayload, editingId?: string) => void;
  editingMessage: SmsMessage | null;
  onCancelEdit: () => void;
}) {
  const recipientId = useId();
  const phoneId = useId();
  const messageId = useId();
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SmsPriority>('Normal');
  const [channel, setChannel] = useState<SmsChannel>('Transactional');
  const [isSending, setIsSending] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [message]);

  useEffect(() => {
    if (editingMessage) {
      setRecipient(editingMessage.recipient);
      setPhone(editingMessage.phone);
      setMessage(editingMessage.message);
      setPriority(editingMessage.priority);
      setChannel(editingMessage.channel);
      setScheduled(editingMessage.status === 'Scheduled');
      setSelectedGroups(editingMessage.tags.map((tag) => tag.toLowerCase()));
    } else {
      setRecipient('');
      setPhone('');
      setMessage('');
      setPriority('Normal');
      setChannel('Transactional');
      setScheduled(false);
      setSelectedGroups([]);
    }
  }, [editingMessage]);

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const sanitizePhone = useCallback((value: string) => {
    return value.replace(/[^\d+\s-]/g, '').slice(0, 20);
  }, []);

  const charCount = message.length;
  const segments = Math.max(1, Math.ceil(Math.max(1, charCount) / 160));
  const canSend = Boolean(recipient.trim() && phone.trim() && message.trim());

  const presets = [
    {
      title: 'OTP',
      data: {
        recipient: 'Security Team',
        phone: '+966 50 111 2233',
        message: 'Security verification code: 482913. This OTP will expire in 5 minutes.',
        priority: 'Critical' as SmsPriority,
        channel: 'OTP' as SmsChannel,
      },
    },
    {
      title: 'Alert',
      data: {
        recipient: 'Finance Team',
        phone: '+966 50 222 3344',
        message: 'Vendor payment reconciliation alert: mismatched ledger entry detected. Review required.',
        priority: 'High' as SmsPriority,
        channel: 'Alert' as SmsChannel,
      },
    },
    {
      title: 'Reminder',
      data: {
        recipient: 'Leadership Team',
        phone: '+966 50 333 4455',
        message: 'Tomorrow leadership sync meeting reminder has been scheduled successfully.',
        priority: 'Low' as SmsPriority,
        channel: 'Transactional' as SmsChannel,
      },
    },
    {
      title: 'Payroll',
      data: {
        recipient: 'Payroll Desk',
        phone: '+966 50 444 5566',
        message: 'Payroll release window আজ 4:30 PM এ শুরু হবে। Approval status verify করুন.',
        priority: 'Critical' as SmsPriority,
        channel: 'Transactional' as SmsChannel,
      },
    },
  ];

  const submit = useCallback(() => {
    if (!canSend) return;
    setIsSending(true);

    window.setTimeout(() => {
      onSubmit(
        {
          recipient: recipient.trim(),
          phone: phone.trim(),
          message: message.trim(),
          priority,
          channel,
          groups: selectedGroups,
          scheduled,
        },
        editingMessage?.id
      );
      setIsSending(false);
      if (!editingMessage) {
        setRecipient('');
        setPhone('');
        setMessage('');
        setPriority('Normal');
        setChannel('Transactional');
        setSelectedGroups([]);
        setScheduled(false);
      }
    }, 800);
  }, [canSend, channel, editingMessage?.id, message, onSubmit, phone, priority, recipient, scheduled, selectedGroups]);

  return (
    <div className={cn(cardClassName, 'p-5 sm:p-6')}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
              {editingMessage ? 'বার্তা সম্পাদনা করুন' : 'বার্তা পাঠান'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Transactional SMS, alert, OTP, reminder বা internal broadcast পাঠান।
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            Secure delivery mode
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => {
                setRecipient(preset.data.recipient);
                setPhone(preset.data.phone);
                setMessage(preset.data.message);
                setPriority(preset.data.priority);
                setChannel(preset.data.channel);
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
            >
              {preset.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={recipientId}
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                >
                  Recipient Name
                </label>
                <input
                  id={recipientId}
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value.slice(0, 80))}
                  placeholder="প্রাপকের নাম"
                  className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor={phoneId}
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                >
                  Mobile Number
                </label>
                <input
                  id={phoneId}
                  type="text"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  placeholder="প্রাপকের মোবাইল নম্বর"
                  className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <textarea
                ref={textareaRef}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 640))}
                placeholder="আপনার বার্তা এখানে লিখুন..."
                className="min-h-[180px] w-full resize-none border-0 bg-transparent p-3 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
              />
              <div className="flex flex-col gap-3 border-t border-slate-200/80 px-2 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {charCount}/640 chars
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    {segments} segment{segments > 1 ? 's' : ''}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Est. {formatMoney(segments * 0.08)}
                  </span>
                </div>

                <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={scheduled}
                    onChange={(e) => setScheduled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Schedule mode
                </label>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Quick recipient groups</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enterprise broadcast targets
                  </p>
                </div>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {selectedGroups.length} selected
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {recipientGroups.map((group) => {
                  const active = selectedGroups.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'rounded-[20px] border p-4 text-left transition-all duration-200',
                        active
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-sm dark:border-emerald-400 dark:bg-emerald-400/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{group.name}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {group.count} contacts
                          </p>
                        </div>
                        <span
                          className={cn(
                            'inline-flex h-5 w-5 rounded-full ring-2 ring-inset',
                            active
                              ? 'bg-emerald-500 ring-emerald-500'
                              : 'bg-transparent ring-slate-300 dark:ring-slate-600'
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Dispatch Controls
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Low', 'Normal', 'High', 'Critical'] as SmsPriority[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPriority(item)}
                        className={cn(
                          'rounded-2xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                          priority === item
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SmsChannel)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Transactional">Transactional</option>
                    <option value="Promotional">Promotional</option>
                    <option value="OTP">OTP</option>
                    <option value="Alert">Alert</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Delivery intelligence</p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    <li>- Shorter transactional messages improve delivery speed</li>
                    <li>- Critical alerts should stay under 160 characters when possible</li>
                    <li>- OTP traffic benefits from concise and consistent templates</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || isSending}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {editingMessage ? 'Updating...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
                        <path d="m15 14 5-2-5-2v4Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {editingMessage ? 'Update SMS' : 'এসএমএস পাঠান'}
                    </>
                  )}
                </button>

                {editingMessage ? (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const MessageCard = memo(function MessageCard({
  item,
  onEdit,
  onDuplicate,
  onDelete,
  onCopy,
}: {
  item: SmsMessage;
  onEdit: (item: SmsMessage) => void;
  onDuplicate: (item: SmsMessage) => void;
  onDelete: (item: SmsMessage) => void;
  onCopy: (text: string) => void;
}) {
  return (
    <article className={cn(cardClassName, 'group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(16,185,129,0.35)] sm:p-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-cyan-500 to-blue-600 text-sm font-black text-white shadow-lg shadow-emerald-500/20">
            {item.recipient
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0] ?? '')
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                {item.recipient}
              </h3>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', statusStyles[item.status])}>
                {item.status}
              </span>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', priorityStyles[item.priority])}>
                {item.priority}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              {item.phone} • {item.sentAt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-3 py-1 text-xs font-bold', channelStyles[item.channel])}>
            {item.channel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {item.segments} segment{item.segments > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{item.message}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800 sm:grid-cols-4">
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Delivery
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.deliveryRate}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Cost
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{formatMoney(item.cost)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Message ID
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.id}</p>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-950/50">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Health
          </p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">
            {item.status === 'Delivered'
              ? 'Stable'
              : item.status === 'Pending'
                ? 'Processing'
                : item.status === 'Failed'
                  ? 'Needs retry'
                  : 'Queued'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(item)}
          className="rounded-2xl bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-700 transition-all hover:bg-cyan-500/15 dark:text-cyan-300"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => onCopy(item.message)}
          className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-500/15 dark:text-emerald-300"
        >
          Copy Text
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="rounded-2xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-500/15 dark:text-rose-300"
        >
          Delete
        </button>
      </div>
    </article>
  );
});

const PaginationBar = memo(function PaginationBar({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className={cn(cardClassName, 'flex items-center justify-between gap-3 p-4')}>
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        Previous
      </button>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Page {page} of {totalPages}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        Next
      </button>
    </div>
  );
});

const ToastStack = memo(function ToastStack({
  toasts,
}: {
  toasts: ToastItem[];
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-2xl border p-4 shadow-xl backdrop-blur-xl',
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
              : toast.type === 'error'
                ? 'border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100'
                : 'border-cyan-200 bg-cyan-50/95 text-cyan-900 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-100'
          )}
        >
          <div className="text-sm font-black">{toast.title}</div>
          <div className="mt-1 text-xs leading-5 opacity-90">{toast.message}</div>
        </div>
      ))}
    </div>
  );
});

const ConfirmDialog = memo(function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className={cn(cardClassName, 'w-full max-w-md p-5')}>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function AWM_SMS_Advanced() {
  const [messages, setMessages] = useState<SmsMessage[]>(initialMessages);
  const [filter, setFilter] = useState<SmsFilter>('All');
  const [sortBy, setSortBy] = useState<SortKey>('latest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<SmsMessage | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SmsMessage | null>(null);

  const deferredSearch = useDeferredValue(search);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = makeId();
    const toast: ToastItem = { id, type, title, message };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as SmsMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore storage failures
    }
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    let next = messages.filter((item) => {
      const statusMatch = filter === 'All' ? true : item.status === filter;
      if (!statusMatch) return false;

      if (!query) return true;

      const haystack = [
        item.recipient,
        item.phone,
        item.message,
        item.status,
        item.priority,
        item.channel,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    next = [...next].sort((a, b) => {
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'priority') return a.priority.localeCompare(b.priority);
      if (sortBy === 'delivery') return b.deliveryRate - a.deliveryRate;
      return b.id.localeCompare(a.id);
    });

    return next;
  }, [deferredSearch, filter, messages, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, filter, rowsPerPage, sortBy, messages.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMessages.slice(start, start + rowsPerPage);
  }, [currentPage, filteredMessages, rowsPerPage]);

  const exportCsv = useCallback(() => {
    const rows = [
      ['ID', 'Recipient', 'Phone', 'Status', 'Priority', 'Channel', 'Sent At', 'Segments', 'Cost', 'Delivery Rate', 'Tags'],
      ...filteredMessages.map((item) => [
        item.id,
        item.recipient,
        item.phone,
        item.status,
        item.priority,
        item.channel,
        item.sentAt,
        String(item.segments),
        item.cost.toFixed(2),
        String(item.deliveryRate),
        item.tags.join(' | '),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => escapeCsv(String(cell))).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awm-sms-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('success', 'Export complete', 'Filtered messages exported as CSV.');
  }, [addToast, filteredMessages]);

  const resetData = useCallback(() => {
    setMessages(initialMessages);
    setEditingMessage(null);
    setFilter('All');
    setSortBy('latest');
    setSearch('');
    setRowsPerPage(6);
    setCurrentPage(1);
    addToast('info', 'Data reset', 'Sample messages restored to default state.');
  }, [addToast]);

  const handleSend = useCallback(
    (payload: ComposerPayload, editingId?: string) => {
      const segments = Math.max(1, Math.ceil(Math.max(1, payload.message.length) / 160));
      const nextMessage: SmsMessage = {
        id: editingId ?? makeId(),
        recipient: payload.recipient,
        phone: payload.phone,
        message: payload.message,
        status: payload.scheduled ? 'Scheduled' : editingId ? 'Pending' : 'Pending',
        priority: payload.priority,
        channel: payload.channel,
        sentAt: editingId ? 'এখনই updated' : 'এখনই',
        segments,
        cost: segments * 0.08,
        deliveryRate: payload.scheduled ? 0 : 68,
        tags: payload.groups.length > 0 ? payload.groups.map((group) => group.toUpperCase()) : ['Manual'],
      };

      setMessages((prev) => {
        if (editingId) {
          return prev.map((item) => (item.id === editingId ? nextMessage : item));
        }
        return [nextMessage, ...prev];
      });

      setEditingMessage(null);
      addToast(
        'success',
        editingId ? 'Message updated' : 'Message sent',
        editingId ? 'Selected SMS was updated successfully.' : 'New SMS has been added to the log.'
      );
    },
    [addToast]
  );

  const handleEdit = useCallback((item: SmsMessage) => {
    setEditingMessage(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('info', 'Edit mode', `Editing ${item.recipient}'s message.`);
  }, [addToast]);

  const handleDuplicate = useCallback((item: SmsMessage) => {
    const copy: SmsMessage = {
      ...item,
      id: makeId(),
      sentAt: 'এখনই',
      status: 'Pending',
      deliveryRate: 68,
      recipient: `${item.recipient} Copy`,
    };
    setMessages((prev) => [copy, ...prev]);
    addToast('success', 'Duplicated', 'A copy of the message was created.');
  }, [addToast]);

  const handleDelete = useCallback((item: SmsMessage) => {
    setDeleteTarget(item);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setMessages((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    addToast('success', 'Deleted', 'Message removed from the log.');
  }, [addToast, deleteTarget]);

  const copyText = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast('success', 'Copied', 'Message text copied to clipboard.');
      } catch {
        addToast('error', 'Copy failed', 'Clipboard permission denied or unavailable.');
      }
    },
    [addToast]
  );

  const clearEdit = useCallback(() => {
    setEditingMessage(null);
    addToast('info', 'Edit cancelled', 'Composer returned to create mode.');
  }, [addToast]);

  return (
    <div className={pageShellClassName}>
      <ToastStack toasts={toasts} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message?"
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.recipient}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <Header />
          <QuickStats messages={messages} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <MessageComposer
              onSubmit={handleSend}
              editingMessage={editingMessage}
              onCancelEdit={clearEdit}
            />
            <div className="space-y-6">
              <InsightsPanel messages={messages} />
              <GovernancePanel messages={messages} />
            </div>
          </div>

          <FilterToolbar
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            search={search}
            setSearch={setSearch}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            onExport={exportCsv}
            onReset={resetData}
            resultsCount={filteredMessages.length}
            totalCount={messages.length}
          />

          <div className="space-y-4">
            {loading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={cn(cardClassName, 'overflow-hidden p-5')}>
                    <div className="animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="h-3 w-56 rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-8/12 rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedMessages.length > 0 ? (
              <div className="grid gap-4">
                {paginatedMessages.map((item) => (
                  <MessageCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onCopy={copyText}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/65">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                  কোন matching message পাওয়া যায়নি
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Search, filter অথবা sort change করে আবার দেখুন।
                </p>
              </div>
            )}

            {filteredMessages.length > 0 ? (
              <PaginationBar
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}