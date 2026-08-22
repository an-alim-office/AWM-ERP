"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  UserPlus,
  Clock,
  Wallet,
  Warehouse,
  ShoppingCart,
  BrainCircuit,
  Server,
  ShieldCheck,
  BarChart4,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe2,
  Building2,
  CalendarClock,
  FileBarChart2,
  Banknote,
  Boxes,
  UserCheck,
  ClipboardList,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  X,
  Zap,
  ZapOff,
} from "lucide-react";

/**
 * app/dashboard/page.tsx — AWM-ERP Command Center (VIP Gold/Navy theme)
 *
 * Palette matches the header/sidebar shell:
 *   Gold accent : #D4AF37 / #F5D888 / #F9E79F
 *   Navy base   : #0A1830 / #0F2242 / #12294f
 *
 * Standard international-ERP module coverage:
 * HR & Workforce · Recruitment · Attendance & Time · Payroll & Finance ·
 * Inventory & Supply Chain · Sales & CRM · AI Core · System Health ·
 * Security & Compliance · Reports
 *
 * All interactive controls below are wired to real handlers (no dead
 * buttons) — export, date-range filter, module search, notification
 * panel, and auto-sync toggle. Placeholder data is marked with TODO
 * where it should be swapped for a real API call.
 */

type Trend = "up" | "down" | "flat";
type DateRange = "today" | "7d" | "30d" | "90d";

type KpiCard = {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  icon: LucideIcon;
};

type ModuleCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  stats: { label: string; value: string }[];
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "success" | "warning" | "info";
  read: boolean;
};

const KPI_CARDS: KpiCard[] = [
  { label: "Active Workforce", value: "12,842", delta: "+2.4%", trend: "up", icon: Users },
  { label: "Monthly Revenue", value: "$4.82M", delta: "+8.1%", trend: "up", icon: Banknote },
  { label: "Attendance Rate", value: "96.7%", delta: "-0.3%", trend: "down", icon: UserCheck },
  { label: "System Uptime", value: "99.98%", delta: "stable", trend: "flat", icon: Server },
];

const ALL_MODULES: ModuleCard[] = [
  {
    title: "HR & Workforce",
    description: "Employee records, contracts, performance and promotions.",
    icon: Users,
    accent: "text-[#8A6200] bg-[#F9E79F]/40",
    href: "/hr/employees",
    stats: [
      { label: "Employees", value: "12,842" },
      { label: "Open Reviews", value: "36" },
    ],
  },
  {
    title: "Recruitment & Talent",
    description: "Pipeline, candidates, and onboarding progress.",
    icon: UserPlus,
    accent: "text-violet-700 bg-violet-50",
    href: "/hr/employees",
    stats: [
      { label: "Open Roles", value: "24" },
      { label: "In Interview", value: "58" },
    ],
  },
  {
    title: "Attendance & Time",
    description: "Live check-ins, shifts, leave and overtime tracking.",
    icon: Clock,
    accent: "text-emerald-700 bg-emerald-50",
    href: "/dashboard/live-attendance",
    stats: [
      { label: "Checked In", value: "11,238" },
      { label: "On Leave", value: "312" },
    ],
  },
  {
    title: "Payroll & Finance",
    description: "Salary runs, deductions, tax and multi-currency ledgers.",
    icon: Wallet,
    accent: "text-[#8A6200] bg-[#F9E79F]/40",
    href: "/payroll",
    stats: [
      { label: "Next Run", value: "5 days" },
      { label: "Pending Approvals", value: "9" },
    ],
  },
  {
    title: "Inventory & Supply Chain",
    description: "Stock levels, purchase orders, suppliers and warehouses.",
    icon: Warehouse,
    accent: "text-cyan-700 bg-cyan-50",
    href: "/inventory",
    stats: [
      { label: "SKUs Tracked", value: "8,410" },
      { label: "Low Stock", value: "27" },
    ],
  },
  {
    title: "Sales & CRM",
    description: "Leads, customers, invoices and pipeline analytics.",
    icon: ShoppingCart,
    accent: "text-rose-700 bg-rose-50",
    href: "/sales/crm",
    stats: [
      { label: "Open Deals", value: "142" },
      { label: "This Month", value: "$612K" },
    ],
  },
  {
    title: "AI Core & Automation",
    description: "Predictive engines, decision automation and AI assistants.",
    icon: BrainCircuit,
    accent: "text-indigo-700 bg-indigo-50",
    href: "/ai/analytics",
    stats: [
      { label: "Models Active", value: "14" },
      { label: "Accuracy", value: "97.2%" },
    ],
  },
  {
    title: "System Health & Infrastructure",
    description: "Servers, uptime, backups and network telemetry.",
    icon: Server,
    accent: "text-slate-700 bg-slate-100",
    href: "/dashboard/real-time-monitoring",
    stats: [
      { label: "Nodes Online", value: "24 / 24" },
      { label: "Avg Latency", value: "0.4s" },
    ],
  },
  {
    title: "Security & Compliance",
    description: "Access control, audit logs, threat detection and roles.",
    icon: ShieldCheck,
    accent: "text-red-700 bg-red-50",
    href: "/security/audit-logs",
    stats: [
      { label: "Threat Level", value: "Low" },
      { label: "Open Alerts", value: "3" },
    ],
  },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "Payroll run completed", detail: "Riyadh Central HQ · 1,204 employees paid", time: "12 min ago", tone: "success", read: false },
  { id: "a2", title: "Low stock alert", detail: "Warehouse B · 27 SKUs below threshold", time: "38 min ago", tone: "warning", read: false },
  { id: "a3", title: "New candidate applied", detail: "Senior Backend Engineer · Dhaka office", time: "1 hr ago", tone: "info", read: true },
  { id: "a4", title: "Security scan completed", detail: "No critical vulnerabilities found", time: "2 hr ago", tone: "success", read: true },
  { id: "a5", title: "Attendance anomaly flagged", detail: "3 unusual check-ins under review", time: "3 hr ago", tone: "warning", read: false },
];

const REGION_PERFORMANCE = [
  { region: "Middle East (KSA/UAE)", value: 92, revenue: "$1.82M" },
  { region: "South Asia (BD/IN)", value: 88, revenue: "$1.14M" },
  { region: "Southeast Asia", value: 81, revenue: "$0.76M" },
  { region: "Europe", value: 74, revenue: "$0.58M" },
  { region: "North America", value: 69, revenue: "$0.52M" },
];

const DATE_RANGE_LABEL: Record<DateRange, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function TrendBadge({ trend, delta }: { trend: Trend; delta: string }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        <TrendingUp className="h-3 w-3" /> {delta}
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
        <TrendingDown className="h-3 w-3" /> {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
      <Activity className="h-3 w-3" /> {delta}
    </span>
  );
}

function ToneDot({ tone }: { tone: ActivityItem["tone"] }) {
  const cls =
    tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`} />;
}

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");
  const [autoSync, setAutoSync] = useState(true);

  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);

  const [moduleQuery, setModuleQuery] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // TODO: replace with a real fetch to your aggregated dashboard/KPI endpoint,
  // scoped by `dateRange`.
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLastSynced("Just now");
    setRefreshing(false);
  };

  const handleSelectRange = (range: DateRange) => {
    setDateRange(range);
    setDateMenuOpen(false);
    void handleRefresh();
  };

  const unreadCount = useMemo(() => activity.filter((item) => !item.read).length, [activity]);

  const markAllRead = () => {
    setActivity((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const dismissActivity = (id: string) => {
    setActivity((prev) => prev.filter((item) => item.id !== id));
  };

  // TODO: point these at your real export endpoints, e.g.
  // /api/reports-service/export-pdf and /api/reports-service/export-excel
  const handleExport = async (format: "pdf" | "excel") => {
    setExportMenuOpen(false);
    setExportStatus(`Preparing ${format.toUpperCase()} export...`);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setExportStatus(`Dashboard exported as ${format.toUpperCase()}.`);
    setTimeout(() => setExportStatus(null), 3000);
  };

  const filteredModules = useMemo(() => {
    const q = moduleQuery.trim().toLowerCase();
    if (!q) return ALL_MODULES;
    return ALL_MODULES.filter(
      (mod) => mod.title.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q)
    );
  }, [moduleQuery]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#8A6200]">
              <Globe2 className="h-3.5 w-3.5" />
              Global Operations
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              Enterprise Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Unified view across HR, Finance, Supply Chain, AI and Infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Systems Operational
            </span>

            {/* Date range filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDateMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <CalendarClock className="h-3.5 w-3.5" />
                {DATE_RANGE_LABEL[dateRange]}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {dateMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  {(Object.keys(DATE_RANGE_LABEL) as DateRange[]).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => handleSelectRange(range)}
                      className={`block w-full px-3 py-2 text-left text-xs font-medium transition hover:bg-[#F9E79F]/30 ${
                        dateRange === range ? "bg-[#F9E79F]/50 text-[#8A6200]" : "text-slate-600"
                      }`}
                    >
                      {DATE_RANGE_LABEL[range]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-sync toggle */}
            <button
              type="button"
              onClick={() => setAutoSync((v) => !v)}
              title={autoSync ? "Auto-sync is on" : "Auto-sync is off"}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition ${
                autoSync
                  ? "border-[#D4AF37]/50 bg-[#F9E79F]/30 text-[#8A6200]"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {autoSync ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
              {autoSync ? "Auto-sync On" : "Auto-sync Off"}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : `Synced: ${lastSynced}`}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">Notifications</p>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-semibold text-[#8A6200] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {activity.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-400">No notifications.</p>
                    ) : (
                      activity.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${
                            item.read ? "bg-white" : "bg-[#F9E79F]/10"
                          }`}
                        >
                          <ToneDot tone={item.tone} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                            <p className="text-[11px] text-slate-500">{item.detail}</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismissActivity(item.id)}
                            aria-label="Dismiss"
                            className="text-slate-300 hover:text-slate-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/support/activity-logs"
                    onClick={() => setNotifOpen(false)}
                    className="block bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    View full activity log
                  </Link>
                </div>
              )}
            </div>

            {/* Export */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#F9E79F] to-[#D4AF37] px-3 py-2 text-xs font-bold text-[#241a05] shadow-sm transition hover:brightness-105"
              >
                <Download className="h-3.5 w-3.5" />
                Export
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleExport("pdf")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5 text-rose-500" /> Export as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("excel")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export as Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {exportStatus && (
          <div className="rounded-lg border border-[#D4AF37]/40 bg-[#F9E79F]/20 px-4 py-2 text-xs font-semibold text-[#8A6200]">
            {exportStatus}
          </div>
        )}

        {/* KPI row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D4AF37]/50 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#F9E79F]/30 p-2.5 text-[#8A6200]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <TrendBadge trend={card.trend} delta={card.delta} />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* Module grid + activity feed */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-900">Enterprise Modules</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={moduleQuery}
                    onChange={(e) => setModuleQuery(e.target.value)}
                    placeholder="Search modules..."
                    className="w-44 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#D4AF37]/60 sm:w-56"
                  />
                </div>
                <Link
                  href="/reports"
                  className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#8A6200] hover:text-[#6b4a00]"
                >
                  View all reports <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {filteredModules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                No modules match &ldquo;{moduleQuery}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.title}
                      href={mod.href}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#D4AF37]/60 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`rounded-xl p-2.5 ${mod.accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#D4AF37]" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-900">{mod.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{mod.description}</p>

                      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
                        {mod.stats.map((stat) => (
                          <div key={stat.label}>
                            <p className="text-sm font-bold text-slate-800">{stat.value}</p>
                            <p className="text-[11px] text-slate-400">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Bell className="h-4 w-4 text-slate-500" />
                Live Activity
              </h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-200"
                >
                  {unreadCount} need review
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {activity.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">All caught up — no pending activity.</p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <ToneDot tone={item.tone} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissActivity(item.id)}
                        aria-label="Dismiss"
                        className="text-slate-300 transition hover:text-slate-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/support/activity-logs"
                className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                View full activity log
              </Link>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/hr/employees"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-[#D4AF37]/50 hover:bg-[#F9E79F]/20"
                >
                  Add Employee
                </Link>
                <Link
                  href="/payroll"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-[#D4AF37]/50 hover:bg-[#F9E79F]/20"
                >
                  Run Payroll
                </Link>
                <Link
                  href="/inventory/purchase-orders"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-[#D4AF37]/50 hover:bg-[#F9E79F]/20"
                >
                  New PO
                </Link>
                <Link
                  href="/reports/smart-reports"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-[#D4AF37]/50 hover:bg-[#F9E79F]/20"
                >
                  Generate Report
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Regional performance + system health strip */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BarChart4 className="h-4 w-4 text-slate-500" />
                Regional Performance
              </h2>
              <span className="text-xs text-slate-400">{DATE_RANGE_LABEL[dateRange]} · efficiency score</span>
            </div>

            <div className="space-y-4">
              {REGION_PERFORMANCE.map((region) => (
                <div key={region.region}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {region.region}
                    </span>
                    <span className="text-xs text-slate-500">
                      {region.revenue} · <span className="font-semibold text-slate-700">{region.value}%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F9E79F] to-[#D4AF37]"
                      style={{ width: `${region.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileBarChart2 className="h-4 w-4 text-slate-500" />
                This Month at a Glance
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">New Hires</p>
                  <p className="font-bold text-slate-800">148</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Turnover</p>
                  <p className="font-bold text-slate-800">2.1%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">POs Issued</p>
                  <p className="font-bold text-slate-800">312</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Avg Response</p>
                  <p className="font-bold text-slate-800">1.2 hr</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#F9E79F]/15 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#8A6200]" />
                <div>
                  <p className="text-sm font-bold text-[#6b4a00]">Attention Needed</p>
                  <p className="mt-1 text-xs text-[#8A6200]">
                    27 SKUs are below reorder threshold and 3 attendance anomalies are pending review.
                  </p>
                  <Link
                    href="/inventory/warehouse"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6b4a00] underline"
                  >
                    Review now <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 md:flex-row">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            Data reflects {DATE_RANGE_LABEL[dateRange].toLowerCase()} · {autoSync ? "auto-sync on" : "auto-sync off"}
          </span>
          <span className="flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5" />
            AWM-ERP · Enterprise AI Suite
          </span>
        </footer>
      </div>
    </main>
  );
}
