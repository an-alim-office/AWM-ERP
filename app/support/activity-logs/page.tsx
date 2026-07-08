"use client";

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  Download,
  Filter,
  Globe,
  MonitorSmartphone,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCircle2,
} from "lucide-react";

type ActivityLog = {
  id: string;
  user: string;
  action: string;
  time: string;
  ip: string;
};

type SortKey = keyof Pick<ActivityLog, "user" | "action" | "time">;

const initialLogs: ActivityLog[] = [
  {
    id: "L901",
    user: "H.M. Alim Uddin",
    action: "Updated Payroll Rules",
    time: "2026-05-29 07:15 PM",
    ip: "192.168.1.50",
  },
  {
    id: "L902",
    user: "Admin Mustafa",
    action: "Generated Attendance Report",
    time: "2026-05-29 05:30 PM",
    ip: "192.168.1.12",
  },
  {
    id: "L903",
    user: "HR Manager",
    action: "Added New Employee (W105)",
    time: "2026-05-29 02:10 PM",
    ip: "192.168.1.14",
  },
  {
    id: "L904",
    user: "System System",
    action: "Automated Backup Completed",
    time: "2026-05-29 12:00 AM",
    ip: "localhost",
  },
];

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="p-4">
          <div
            className={cn(
              "h-4 rounded-md bg-white/5",
              shimmer,
              i === 2 ? "w-44" : "w-24"
            )}
          />
        </td>
      ))}
    </tr>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[#0f172acc]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-transparent to-cyan-500/[0.05]" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          {trend && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-700 p-3 text-white shadow-xl dark:from-slate-800 dark:to-slate-900">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogsPage() {
  const [logs] = useState<ActivityLog[]>(initialLogs);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortAsc, setSortAsc] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "system" | "admin" | "hr"
  >("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  const getCategory = useCallback((log: ActivityLog) => {
    const value = `${log.user} ${log.action}`.toLowerCase();

    if (value.includes("system") || value.includes("backup")) {
      return "system";
    }

    if (value.includes("admin")) {
      return "admin";
    }

    if (value.includes("hr")) {
      return "hr";
    }

    return "all";
  }, []);

  const filteredLogs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    let result = [...logs];

    if (query) {
      result = result.filter(
        (log) =>
          log.user.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query) ||
          log.ip.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== "all") {
      result = result.filter(
        (log) => getCategory(log) === selectedFilter
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortKey].toLowerCase();
      const bValue = b[sortKey].toLowerCase();

      return sortAsc
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return result;
  }, [deferredSearch, logs, selectedFilter, sortAsc, sortKey, getCategory]);

  const suspiciousActivities = useMemo(
    () =>
      logs.filter(
        (log) =>
          log.ip === "localhost" ||
          log.action.toLowerCase().includes("backup")
      ).length,
    [logs]
  );

  const exportLogs = () => {
    const headers = ["Log ID", "User", "Action", "Time", "IP"];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.user,
      log.action,
      log.time,
      log.ip,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "activity-logs.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
      return;
    }

    setSortKey(key);
    setSortAsc(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_25%)] px-4 py-6 sm:px-6 lg:px-8 dark:bg-[#020617]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b1220cc]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04),transparent)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02),transparent)]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Monitoring
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  অ্যাক্টিভিটি লগ
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  রিয়েল-টাইম সিস্টেম অপারেশন, ইউজার অ্যাক্টিভিটি,
                  অডিট ট্রেইল এবং সিকিউরিটি ইভেন্ট মনিটরিং।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setLoading(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={exportLogs}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40"
              >
                <Download className="h-4 w-4" />
                Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Logs"
            value={logs.length}
            trend="+12.8%"
            icon={<Activity className="h-6 w-6" />}
          />

          <StatCard
            title="Security Events"
            value={suspiciousActivities}
            trend="+4.2%"
            icon={<ShieldCheck className="h-6 w-6" />}
          />

          <StatCard
            title="Active Users"
            value={
              new Set(logs.map((log) => log.user)).size
            }
            trend="+2.1%"
            icon={<UserCircle2 className="h-6 w-6" />}
          />

          <StatCard
            title="Connected Devices"
            value="14"
            trend="+8.4%"
            icon={<MonitorSmartphone className="h-6 w-6" />}
          />
        </div>

        {/* Controls */}
        <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-lg">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="ইউজার, অ্যাকশন, আইপি অথবা লগ আইডি দিয়ে সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-2xl border border-black/10 bg-white pl-12 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#020817] dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={selectedFilter}
                  onChange={(e) =>
                    setSelectedFilter(
                      e.target.value as
                        | "all"
                        | "system"
                        | "admin"
                        | "hr"
                    )
                  }
                  className="h-14 appearance-none rounded-2xl border border-black/10 bg-white pl-11 pr-10 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#020817] dark:text-slate-200"
                >
                  <option value="all">All Activities</option>
                  <option value="system">System</option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="inline-flex h-14 items-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-[#020817] dark:text-slate-300">
                <Globe className="mr-2 h-4 w-4 text-cyan-500" />
                Live Audit Stream
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_25px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220cc]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-slate-100/70 text-left text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-400">
                  <th className="p-5">Log ID</th>

                  <th className="p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("user")}
                      className="inline-flex items-center gap-1 transition hover:text-blue-500"
                    >
                      User
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          sortKey === "user" &&
                            sortAsc &&
                            "rotate-180"
                        )}
                      />
                    </button>
                  </th>

                  <th className="p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("action")}
                      className="inline-flex items-center gap-1 transition hover:text-blue-500"
                    >
                      Action
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          sortKey === "action" &&
                            sortAsc &&
                            "rotate-180"
                        )}
                      />
                    </button>
                  </th>

                  <th className="p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("time")}
                      className="inline-flex items-center gap-1 transition hover:text-blue-500"
                    >
                      Timestamp
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          sortKey === "time" &&
                            sortAsc &&
                            "rotate-180"
                        )}
                      />
                    </button>
                  </th>

                  <th className="p-5">IP Address</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 text-sm dark:divide-white/5">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => {
                    const isSystem =
                      log.user.toLowerCase().includes("system");

                    return (
                      <tr
                        key={log.id}
                        className="group transition-all duration-200 hover:bg-blue-500/[0.03] dark:hover:bg-white/[0.02]"
                        style={{
                          animation: `fadeInUp 0.35s ease ${
                            index * 0.04
                          }s both`,
                        }}
                      >
                        <td className="p-5">
                          <div className="inline-flex rounded-xl border border-black/10 bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                            {log.id}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg",
                                isSystem
                                  ? "bg-gradient-to-br from-orange-500 to-red-500"
                                  : "bg-gradient-to-br from-blue-600 to-cyan-500"
                              )}
                            >
                              <UserCircle2 className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {log.user}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Activity Actor
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-5">
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold",
                              isSystem
                                ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {isSystem ? (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                            {log.action}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {log.time}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="inline-flex rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                            {log.ip}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.04]">
                          <Search className="h-8 w-8 text-slate-400" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          কোনো লগ পাওয়া যায়নি
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                          সার্চ অথবা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}