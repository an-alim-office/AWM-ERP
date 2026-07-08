'use client';
 
import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
type RevenueStatus = 'collected' | 'pending' | 'failed' | 'refunded';
type RevenueChannel = 'Web' | 'POS' | 'Subscription' | 'Invoice' | 'Marketplace';
type RevenuePriority = 'Stable' | 'Growing' | 'Watchlist';
 
type RevenueRecord = {
  id: string;
  customer: string;
  channel: RevenueChannel;
  status: RevenueStatus;
  amount: number;
  recognized: number;
  pending: number;
  date: string;
  region: string;
};
 
type KPI = {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
};
 
type InsightCard = {
  title: string;
  value: string;
  description: string;
  priority: RevenuePriority;
};
 
const revenueRecords: RevenueRecord[] = [
  {
    id: 'REV-2026-1001',
    customer: 'Al Noor Trading',
    channel: 'Subscription',
    status: 'collected',
    amount: 24850,
    recognized: 24850,
    pending: 0,
    date: '2026-07-02 09:12',
    region: 'Riyadh',
  },
  {
    id: 'REV-2026-1002',
    customer: 'Future Edge Logistics',
    channel: 'Invoice',
    status: 'pending',
    amount: 18320,
    recognized: 9200,
    pending: 9120,
    date: '2026-07-02 10:05',
    region: 'Jeddah',
  },
  {
    id: 'REV-2026-1003',
    customer: 'Orbit Retail Group',
    channel: 'Web',
    status: 'collected',
    amount: 12840,
    recognized: 12840,
    pending: 0,
    date: '2026-07-02 10:48',
    region: 'Dammam',
  },
  {
    id: 'REV-2026-1004',
    customer: 'Prime Build Co.',
    channel: 'Marketplace',
    status: 'pending',
    amount: 31400,
    recognized: 14000,
    pending: 17400,
    date: '2026-07-02 11:15',
    region: 'Riyadh',
  },
  {
    id: 'REV-2026-1005',
    customer: 'Nexa Foods',
    channel: 'POS',
    status: 'collected',
    amount: 9650,
    recognized: 9650,
    pending: 0,
    date: '2026-07-02 12:02',
    region: 'Makkah',
  },
  {
    id: 'REV-2026-1006',
    customer: 'BluePeak Services',
    channel: 'Invoice',
    status: 'failed',
    amount: 15400,
    recognized: 0,
    pending: 15400,
    date: '2026-07-02 12:45',
    region: 'Khobar',
  },
  {
    id: 'REV-2026-1007',
    customer: 'Vertex Care',
    channel: 'Subscription',
    status: 'collected',
    amount: 22600,
    recognized: 22600,
    pending: 0,
    date: '2026-07-02 13:18',
    region: 'Riyadh',
  },
  {
    id: 'REV-2026-1008',
    customer: 'Apex Industrial',
    channel: 'Invoice',
    status: 'refunded',
    amount: 8400,
    recognized: 0,
    pending: 0,
    date: '2026-07-02 13:40',
    region: 'Jubail',
  },
];
 
const pipelineDistribution = [
  { label: 'Subscription', value: 88, tone: 'from-violet-500 via-fuchsia-500 to-pink-500' },
  { label: 'Invoice', value: 76, tone: 'from-blue-500 via-cyan-500 to-sky-500' },
  { label: 'Web', value: 54, tone: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { label: 'POS', value: 43, tone: 'from-amber-500 via-orange-500 to-red-500' },
  { label: 'Marketplace', value: 61, tone: 'from-indigo-500 via-violet-500 to-purple-500' },
];
 
const weeklyTrend = [52, 58, 61, 64, 70, 74, 79, 82, 86, 83, 91, 96];
 
const insights: InsightCard[] = [
  {
    title: 'Strongest revenue momentum',
    value: 'Subscription renewals',
    description: 'High retention contracts are driving the most stable recognized revenue growth.',
    priority: 'Growing',
  },
  {
    title: 'Largest collection risk',
    value: 'Invoice settlement lag',
    description: 'Unpaid invoice concentration is increasing collection exposure across large accounts.',
    priority: 'Watchlist',
  },
  {
    title: 'Best optimization signal',
    value: 'Regional pricing uplift',
    description: 'High-conversion enterprise accounts show room for controlled upsell expansion.',
    priority: 'Stable',
  },
];
 
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
 
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}
 
function formatCompact(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
 
function getStatusStyle(status: RevenueStatus) {
  switch (status) {
    case 'collected':
      return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20';
    case 'failed':
      return 'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20';
    case 'refunded':
      return 'bg-slate-500/10 text-slate-700 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20';
    default:
      return 'bg-slate-500/10 text-slate-700 ring-1 ring-inset ring-slate-500/20';
  }
}
 
function getPriorityStyle(priority: RevenuePriority) {
  switch (priority) {
    case 'Growing':
      return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'Watchlist':
      return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
    case 'Stable':
      return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300';
    default:
      return 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300';
  }
}
 
function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem('awm-revenue-theme');
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var dark = stored ? stored === 'dark' : systemDark;
        if (dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } catch (e) {}
    })();
  `;
 
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
 
function ThemeToggle() {
  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={() => {
        const root = document.documentElement;
        const nextDark = !root.classList.contains('dark');
        root.classList.toggle('dark', nextDark);
        try {
          window.localStorage.setItem('awm-revenue-theme', nextDark ? 'dark' : 'light');
        } catch (e) {}
      }}
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-slate-800 dark:text-cyan-300">
        <svg viewBox="0 0 24 24" className="h-4 w-4 dark:hidden" fill="currentColor">
          <path d="M12 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0-16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm11.95 5.536 1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 1.414-1.414ZM7.05 7.05 8.464 8.464A1 1 0 0 1 7.05 9.878L5.636 8.464A1 1 0 0 1 7.05 7.05Zm9.9-1.414A1 1 0 0 1 18.364 7.05L16.95 8.464a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM7.05 14.122a1 1 0 0 1 1.414 1.414L7.05 16.95a1 1 0 1 1-1.414-1.414l1.414-1.414ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="hidden h-4 w-4 dark:block" fill="currentColor">
          <path d="M21 12.79A9 9 0 0 1 11.21 3c0 .07-.01.14-.01.21A9 9 0 1 0 20.79 13c.07 0 .14-.01.21-.01Z" />
        </svg>
      </span>
      <span className="dark:hidden">Light</span>
      <span className="hidden dark:inline">Dark</span>
    </button>
  );
}
 
function ExportButton() {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v12" strokeLinecap="round" />
        <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 21h14" strokeLinecap="round" />
      </svg>
      রিপোর্ট এক্সপোর্ট করুন
    </button>
  );
}
 
function KPISection({ records }: { records: RevenueRecord[] }) {
  const totalRevenue = records.reduce((sum, item) => sum + item.amount, 0);
  const totalRecognized = records.reduce((sum, item) => sum + item.recognized, 0);
  const totalPending = records.reduce((sum, item) => sum + item.pending, 0);
  const todaysRevenue = records
    .filter((item) => item.date.startsWith('2026-07-02'))
    .reduce((sum, item) => sum + item.recognized, 0);
 
  const cards: KPI[] = [
    {
      label: 'মোট আয়',
      value: formatCurrency(totalRevenue),
      delta: '+18.4%',
      trend: 'up',
    },
    {
      label: 'আজকের আয়',
      value: formatCurrency(todaysRevenue),
      delta: '+9.7%',
      trend: 'up',
    },
    {
      label: 'পেন্ডিং রেভিনিউ',
      value: formatCurrency(totalPending),
      delta: '+4.1%',
      trend: 'neutral',
    },
    {
      label: 'Recognized Revenue',
      value: formatCurrency(totalRecognized),
      delta: '+13.2%',
      trend: 'up',
    },
  ];
 
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(59,130,246,0.35)] dark:border-slate-800/70 dark:bg-slate-900/75"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-90" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {card.label}
              </h3>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                card.trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : card.trend === 'down'
                    ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300'
              )}
            >
              {card.delta}
            </span>
          </div>
 
          <div className="mt-5 flex items-end gap-1">
            {[44, 58, 52, 68, 63, 80, 92].map((value, idx) => (
              <div
                key={`${card.label}-${idx}`}
                className="h-16 flex-1 rounded-full bg-gradient-to-t from-blue-600/75 to-cyan-300/60 transition-transform duration-300 group-hover:scale-y-105 dark:from-cyan-500/60 dark:to-violet-400/60"
                style={{ height: `${Math.max(24, value)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
 
function RevenueMixCard() {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Revenue Mix</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Channel-wise performance and pipeline orchestration strength.
          </p>
        </div>
        <span className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Healthy flow
        </span>
      </div>
 
      <div className="space-y-4">
        {pipelineDistribution.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={cn('h-3 rounded-full bg-gradient-to-r', item.tone)}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
 
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Collection Rate', value: '91.6%' },
          { label: 'Forecast Accuracy', value: '94.1%' },
          { label: 'Active Accounts', value: '248' },
          { label: 'Expansion Upside', value: '$184K' },
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
}
 
function ForecastCard() {
  const max = Math.max(...weeklyTrend);
 
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Revenue Forecast Momentum</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            AI-assisted progression of recognized revenue across the current cycle.
          </p>
        </div>
        <span className="rounded-2xl bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300">
          +21.3%
        </span>
      </div>
 
      <div className="flex h-56 items-end gap-2">
        {weeklyTrend.map((value, index) => (
          <div key={index} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              <div
                className="w-full rounded-t-[18px] bg-gradient-to-t from-blue-600 via-cyan-500 to-violet-400 shadow-[0_12px_26px_-16px_rgba(59,130,246,0.55)] transition-all duration-300 group-hover:opacity-90"
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
}
 
function InsightsCard() {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Signals</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revenue intelligence highlights from current financial activity.
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {item.title}
              </p>
              <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', getPriorityStyle(item.priority))}>
                {item.priority}
              </span>
            </div>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
 
function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/75"
        >
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
}
 
function TransactionRow({ item }: { item: RevenueRecord }) {
  return (
    <tr className="border-t border-slate-200/80 transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/40">
      <td className="px-5 py-4 align-top">
        <div className="min-w-[180px]">
          <p className="text-sm font-black text-slate-900 dark:text-white">{item.customer}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.id}</p>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
          {item.channel}
        </span>
      </td>
      <td className="px-5 py-4 align-top">
        <span className={cn('rounded-full px-3 py-1 text-xs font-bold capitalize', getStatusStyle(item.status))}>
          {item.status}
        </span>
      </td>
      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
        {formatCurrency(item.amount)}
      </td>
      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
        {formatCurrency(item.recognized)}
      </td>
      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
        {formatCurrency(item.pending)}
      </td>
      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
        {item.region}
      </td>
      <td className="px-5 py-4 align-top text-sm font-semibold text-slate-700 dark:text-slate-300">
        {item.date}
      </td>
    </tr>
  );
}
 
function TransactionsTable({ records }: { records: RevenueRecord[] }) {
  const totalRevenue = records.reduce((sum, item) => sum + item.amount, 0);
  const totalRecognized = records.reduce((sum, item) => sum + item.recognized, 0);
  const totalPending = records.reduce((sum, item) => sum + item.pending, 0);
 
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">বিস্তারিত ট্রানজেকশন হিস্ট্রি</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revenue recognition, pending pipeline, and channel-level transaction visibility.
          </p>
        </div>
 
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-950/50">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
              {formatCompact(totalRevenue)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-950/50">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Recognized
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
              {formatCompact(totalRecognized)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-950/50">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Pending
            </p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
              {formatCompact(totalPending)}
            </p>
          </div>
        </div>
      </div>
 
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-950/60">
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Customer
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Channel
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Amount
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Recognized
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Pending
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Region
              </th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <TransactionRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
function GovernancePanel({ records }: { records: RevenueRecord[] }) {
  const collectedCount = records.filter((item) => item.status === 'collected').length;
  const pendingCount = records.filter((item) => item.status === 'pending').length;
  const failedCount = records.filter((item) => item.status === 'failed').length;
  const refundedCount = records.filter((item) => item.status === 'refunded').length;
  const total = Math.max(records.length, 1);
 
  const metrics = [
    { label: 'Collection confidence', value: `${Math.round((collectedCount / total) * 100)}%` },
    { label: 'Pending exposure', value: `${Math.round((pendingCount / total) * 100)}%` },
    { label: 'Failure ratio', value: `${Math.round((failedCount / total) * 100)}%` },
    { label: 'Refund pressure', value: `${Math.round((refundedCount / total) * 100)}%` },
  ];
 
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Governance Pulse</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revenue assurance indicators and financial control quality.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Stable
        </span>
      </div>
 
      <div className="space-y-4">
        {metrics.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500"
                style={{ width: item.value }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
function RevenueDashboard() {
  const records = revenueRecords;
 
  return (
    <div className="space-y-6">
      <KPISection records={records} />
 
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <RevenueMixCard />
 
        <div className="space-y-6">
          <ForecastCard />
          <InsightsCard />
        </div>
      </div>
 
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <TransactionsTable records={records} />
        <GovernancePanel records={records} />
      </div>
    </div>
  );
}
 
export default function RevenueOrchestratorPage() {
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  return (
    <>
      <ThemeScript />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_left_top,rgba(168,85,247,0.10),transparent_26%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(248,250,252,1))] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_left_top,rgba(168,85,247,0.14),transparent_26%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))] dark:text-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-[0_12px_34px_-18px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/75 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)]" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    Enterprise Revenue Intelligence
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    AI Revenue Orchestrator
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    ২০২৬ সালের রিয়েল-টাইম আয়, collection intelligence, revenue pipeline visibility, এবং AI-assisted financial forecasting।
                  </p>
                </div>
 
                <div className="flex flex-wrap items-center gap-3">
                  <ExportButton />
                  {mounted ? <ThemeToggle /> : (
                    <div className="h-11 w-[104px] rounded-2xl border border-slate-200/80 bg-white/85 dark:border-slate-700 dark:bg-slate-950/70" />
                  )}
                </div>
              </div>
            </section>
 
            <Suspense fallback={<FeedSkeleton />}>
              <RevenueDashboard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
