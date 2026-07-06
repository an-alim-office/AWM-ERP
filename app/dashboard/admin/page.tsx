"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CalendarCheck,
  Clock,
  Contact,
  FileBarChart,
  LayoutDashboard,
  Package,
  ScanFace,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Search,
  RefreshCw,
} from "lucide-react";

import Layout from "@/app/layout";

type ModuleStatus = "Active" | "Monitoring" | "Secure";

type KPIState = {
  employees: number;
  presentToday: number;
  payrollTotal: number;
  lowStock: number;
  loading: boolean;
};

type ModuleItem = {
  id: number;
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  status: ModuleStatus;
  desc: string;
};

const modules: ModuleItem[] = [
  {
    id: 1,
    name: "Main Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    category: "Dashboard",
    status: "Active",
    desc: "Central command center for ERP operations",
  },
  {
    id: 2,
    name: "AI Analytics",
    path: "/dashboard/ai-analytics",
    icon: BarChart3,
    category: "Dashboard",
    status: "Active",
    desc: "AI-driven workforce intelligence & insights",
  },
  {
    id: 3,
    name: "Live Attendance",
    path: "/dashboard/live-attendance",
    icon: Clock,
    category: "Attendance",
    status: "Monitoring",
    desc: "Real-time attendance monitoring dashboard",
  },
  {
    id: 4,
    name: "Employees",
    path: "/hr/employees",
    icon: Users,
    category: "HR",
    status: "Active",
    desc: "Manage employee database & records",
  },
  {
    id: 5,
    name: "Attendance",
    path: "/attendance",
    icon: CalendarCheck,
    category: "Attendance",
    status: "Active",
    desc: "Historical attendance log & reports",
  },
  {
    id: 6,
    name: "Face Attendance",
    path: "/attendance/face",
    icon: ScanFace,
    category: "Attendance",
    status: "Secure",
    desc: "Biometric face-recognition clock-in",
  },
  {
    id: 7,
    name: "Payroll",
    path: "/payroll",
    icon: Wallet,
    category: "Payroll",
    status: "Active",
    desc: "Automated payroll & salary processing",
  },
  {
    id: 8,
    name: "Reports",
    path: "/reports",
    icon: FileBarChart,
    category: "Reports",
    status: "Active",
    desc: "Exportable business analytics reports",
  },
  {
    id: 9,
    name: "Inventory",
    path: "/inventory",
    icon: Package,
    category: "Inventory",
    status: "Monitoring",
    desc: "Stock control & inventory transactions",
  },
  {
    id: 10,
    name: "Sales CRM",
    path: "/sales/crm",
    icon: Contact,
    category: "Sales",
    status: "Active",
    desc: "Lead pipeline & customer relationship",
  },
  {
    id: 11,
    name: "Security",
    path: "/security/user-roles",
    icon: Shield,
    category: "Security",
    status: "Secure",
    desc: "User roles, permissions & audit logs",
  },
  {
    id: 12,
    name: "Settings",
    path: "/settings",
    icon: Settings,
    category: "Settings",
    status: "Secure",
    desc: "Company configuration & policies",
  },
  {
    id: 13,
    name: "AI Assistant",
    path: "/ai/assistant",
    icon: Bot,
    category: "AI",
    status: "Active",
    desc: "Natural-language ERP data assistant",
  },
  {
    id: 14,
    name: "Predictive Analytics",
    path: "/next-gen/predictive-analytics",
    icon: TrendingUp,
    category: "NextGen",
    status: "Monitoring",
    desc: "ML-powered forecasts & predictions",
  },
];

const getStatusStyle = (
  status: ModuleStatus
): {
  dot: string;
  badge: string;
} => {
  switch (status) {
    case "Active":
      return {
        dot: "bg-green-500",
        badge: "bg-green-100 text-green-700",
      };

    case "Monitoring":
      return {
        dot: "bg-yellow-500",
        badge: "bg-yellow-100 text-yellow-700",
      };

    case "Secure":
      return {
        dot: "bg-red-500",
        badge: "bg-red-100 text-red-700",
      };

    default:
      return {
        dot: "bg-gray-500",
        badge: "bg-gray-100 text-gray-700",
      };
  }
};

export default function AdminDashboardPage() {
  const [search, setSearch] = useState<string>("");
  const [now, setNow] = useState<Date>(new Date());

  const [kpis, setKpis] = useState<KPIState>({
    employees: 245,
    presentToday: 218,
    payrollTotal: 125000,
    lowStock: 7,
    loading: false,
  });

  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      setKpis((prev) => ({
        ...prev,
        employees: prev.employees,
        presentToday: prev.presentToday,
        payrollTotal: prev.payrollTotal,
        lowStock: prev.lowStock,
        loading: false,
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredModules = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return modules;
    }

    return modules.filter((module) => {
      return (
        module.name.toLowerCase().includes(value) ||
        module.category.toLowerCase().includes(value) ||
        module.desc.toLowerCase().includes(value)
      );
    });
  }, [search]);

  const moduleStats = useMemo(() => {
    return {
      total: modules.length,
      active: modules.filter(
        (module) => module.status === "Active"
      ).length,
      monitoring: modules.filter(
        (module) => module.status === "Monitoring"
      ).length,
      secure: modules.filter(
        (module) => module.status === "Secure"
      ).length,
    };
  }, []);

  const kpiCards = useMemo(
    () => [
      {
        label: "Active Employees",
        value: kpis.loading ? "—" : kpis.employees.toLocaleString(),
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
        ring: "ring-blue-100",
        trend: "+12%",
        up: true,
      },
      {
        label: "Present Today",
        value: kpis.loading
          ? "—"
          : kpis.presentToday.toLocaleString(),
        icon: Clock,
        color: "text-green-600",
        bg: "bg-green-50",
        ring: "ring-green-100",
        trend: "+8%",
        up: true,
      },
      {
        label: "Monthly Payroll",
        value: kpis.loading
          ? "—"
          : `$${kpis.payrollTotal.toLocaleString()}`,
        icon: Wallet,
        color: "text-purple-600",
        bg: "bg-purple-50",
        ring: "ring-purple-100",
        trend: "+3%",
        up: true,
      },
      {
        label: "Low Stock Alerts",
        value: kpis.loading ? "—" : kpis.lowStock.toString(),
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        ring: "ring-red-100",
        trend: "-2",
        up: false,
      },
    ],
    [kpis]
  );

  const formattedDate = useMemo(() => {
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [now]);

  const formattedTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [now]);

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          {/* Header */}
          <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur">
                  <Activity className="h-4 w-4" />
                  <span>
                    System Operational · Enterprise Modules Active
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                  AWM ERP Admin Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                  Centralized enterprise administration panel
                  with real-time monitoring, analytics,
                  automation, and secure module management.
                </p>
              </div>

              <div className="flex w-full flex-col gap-4 xl:w-96">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-blue-200">
                    {formattedDate}
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {formattedTime}
                  </p>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    placeholder="Search ERP modules..."
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />

                  {refreshing
                    ? "Refreshing Dashboard..."
                    : "Refresh Dashboard"}
                </button>
              </div>
            </div>
          </section>

          {/* KPI Cards */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${card.ring}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.label}
                      </p>

                      <h2 className="mt-3 text-3xl font-bold text-slate-900">
                        {card.value}
                      </h2>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${card.color}`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    {card.up ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}

                    <span
                      className={
                        card.up
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {card.trend}
                    </span>

                    <span className="text-slate-400">
                      vs last month
                    </span>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Module Statistics */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Modules
              </p>

              <h3 className="mt-3 text-4xl font-bold text-slate-900">
                {moduleStats.total}
              </h3>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <h3 className="mt-3 text-4xl font-bold text-green-600">
                {moduleStats.active}
              </h3>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Monitoring
              </p>

              <h3 className="mt-3 text-4xl font-bold text-yellow-600">
                {moduleStats.monitoring}
              </h3>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Secure
              </p>

              <h3 className="mt-3 text-4xl font-bold text-red-600">
                {moduleStats.secure}
              </h3>
            </div>
          </section>

          {/* Module Header */}
          <section className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                ERP Modules
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enterprise-wide module administration &
                monitoring
              </p>
            </div>

            {search && (
              <div className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                {filteredModules.length} modules found
              </div>
            )}
          </section>

          {/* Module Grid */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredModules.map((module) => {
              const Icon = module.icon;

              const statusStyle = getStatusStyle(
                module.status
              );

              return (
                <Link
                  key={module.id}
                  href={module.path}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:bg-blue-50">
                      <Icon className="h-6 w-6 text-slate-700 transition group-hover:text-blue-600" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                      />

                      {module.status}
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-blue-600">
                      {module.name}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {module.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {module.category}
                    </span>

                    <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-blue-600">
                      Open Module
                    </span>
                  </div>
                </Link>
              );
            })}
          </section>

          {/* Empty State */}
          {filteredModules.length === 0 && (
            <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900">
                No Modules Found
              </h3>

              <p className="mt-3 text-slate-500">
                Try another keyword or category to locate
                your ERP module.
              </p>
            </section>
          )}
        </div>
      </main>
    </Layout>
  );
}
