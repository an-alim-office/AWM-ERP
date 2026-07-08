"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Eye,
  FileWarning,
  Filter,
  Globe,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  ShieldX,
  Smartphone,
  Sparkles,
  User2,
  Workflow,
  XCircle,
} from "lucide-react";

type LogStatus = "SUCCESS" | "WARNING" | "FAILED";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: LogStatus;
  severity: Severity;
  ip: string;
  device: string;
  region: string;
  module: string;
};

const auditLogsData: AuditLog[] = [
  {
    id: "AUD-001",
    timestamp: "2026-06-28 16:10:02",
    user: "Admin_01",
    action: "System Configuration Change",
    status: "SUCCESS",
    severity: "LOW",
    ip: "192.168.1.12",
    device: "MacOS Desktop",
    region: "Singapore",
    module: "Security Core",
  },
  {
    id: "AUD-002",
    timestamp: "2026-06-28 15:45:12",
    user: "User_Manager",
    action: "Role Permission Update",
    status: "SUCCESS",
    severity: "MEDIUM",
    ip: "10.10.1.5",
    device: "Windows Workstation",
    region: "Dubai",
    module: "RBAC Engine",
  },
  {
    id: "AUD-003",
    timestamp: "2026-06-28 14:52:43",
    user: "Ops_Executor",
    action: "Unauthorized API Attempt",
    status: "FAILED",
    severity: "CRITICAL",
    ip: "77.20.12.93",
    device: "Android Device",
    region: "Frankfurt",
    module: "API Gateway",
  },
  {
    id: "AUD-004",
    timestamp: "2026-06-28 12:14:03",
    user: "Finance_Admin",
    action: "Payroll Export Generated",
    status: "WARNING",
    severity: "HIGH",
    ip: "172.16.5.1",
    device: "Linux Terminal",
    region: "Riyadh",
    module: "Finance Suite",
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value: number) {
  return Intl.NumberFormat().format(value);
}

function StatusBadge({ status }: { status: LogStatus }) {
  const styles: Record<LogStatus, string> = {
    SUCCESS:
      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    WARNING:
      "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-500 border border-red-500/20",
  };

  const icons: Record<LogStatus, React.ReactNode> = {
    SUCCESS: <CheckCircle2 className="h-3.5 w-3.5" />,
    WARNING: <AlertTriangle className="h-3.5 w-3.5" />,
    FAILED: <XCircle className="h-3.5 w-3.5" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        styles[status]
      )}
    >
      {icons[status]}
      {status}
    </span>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: Severity;
}) {
  const styles: Record<Severity, string> = {
    LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    MEDIUM:
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
    HIGH:
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
    CRITICAL:
      "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
        styles[severity]
      )}
    >
      {severity}
    </span>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-4 rounded-2xl border border-zinc-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
        shimmer
      )}
    >
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
      <div className="col-span-3 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
      <div className="col-span-1 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] =
    useState<AuditLog[]>(auditLogsData);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    LogStatus | "ALL"
  >("ALL");

  const [severityFilter, setSeverityFilter] = useState<
    Severity | "ALL"
  >("ALL");

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.action
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        log.module
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : log.status === statusFilter;

      const matchesSeverity =
        severityFilter === "ALL"
          ? true
          : log.severity === severityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [logs, search, statusFilter, severityFilter]);

  const successCount = useMemo(
    () =>
      logs.filter((log) => log.status === "SUCCESS")
        .length,
    [logs]
  );

  const warningCount = useMemo(
    () =>
      logs.filter((log) => log.status === "WARNING")
        .length,
    [logs]
  );

  const criticalCount = useMemo(
    () =>
      logs.filter((log) => log.severity === "CRITICAL")
        .length,
    [logs]
  );

  const refreshLogs = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      setLogs((prev) => [...prev]);
    }, 1200);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0b1120] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Activity Intelligence
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Audit Logs
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Real-time forensic event monitoring,
                compliance tracking, privileged access
                visibility, and enterprise-grade system
                activity intelligence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshLogs}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Refresh Logs
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <Download className="h-4 w-4" />
                Export Audit
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Audit Events"
            value={formatNumber(128942)}
            hint="Tracked enterprise activities"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Successful Events"
            value={formatNumber(successCount)}
            hint="Verified compliant executions"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <MetricCard
            title="Warnings"
            value={formatNumber(warningCount)}
            hint="Behavior anomaly detections"
            icon={<FileWarning className="h-5 w-5" />}
          />

          <MetricCard
            title="Critical Threats"
            value={formatNumber(criticalCount)}
            hint="High-risk security incidents"
            icon={<ShieldX className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search users, modules, actions..."
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div className="relative min-w-[220px]">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as LogStatus | "ALL"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="FAILED">Failed</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>

              <div className="relative min-w-[220px]">
                <Database className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={severityFilter}
                  onChange={(e) =>
                    setSeverityFilter(
                      e.target.value as Severity | "ALL"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="ALL">
                    All Severity
                  </option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">
                    Critical
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
              <ShieldEllipsis className="h-4 w-4" />
              SIEM integrity verified
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-zinc-200/70 dark:border-white/10">
            <div className="hidden grid-cols-12 gap-4 border-b border-zinc-200/70 bg-zinc-50/70 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 lg:grid">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-2">User</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Severity</div>
              <div className="col-span-2 text-right">
                Status
              </div>
            </div>

            <div className="space-y-3 p-3">
              <Suspense fallback={null}>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 p-16 text-center dark:border-white/10">
                    <Eye className="h-10 w-10 text-zinc-400" />

                    <h3 className="mt-4 text-lg font-bold">
                      No audit events found
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      Adjust search filters or refresh event
                      streams.
                    </p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="group rounded-3xl border border-zinc-200/70 bg-white/70 p-5 transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-2">
                          <div className="flex items-start gap-3">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                              <Clock3 className="h-4 w-4 text-cyan-500" />
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                {log.timestamp}
                              </p>

                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                Event ID: {log.id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                              <User2 className="h-4 w-4 text-violet-500" />
                            </div>

                            <div>
                              <h3 className="text-sm font-bold">
                                {log.user}
                              </h3>

                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {log.module}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-3">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">
                              {log.action}
                            </h4>

                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Workflow className="h-3 w-3" />
                                {log.device}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Database className="h-3 w-3" />
                                {log.ip}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                              <Globe className="h-4 w-4 text-blue-500" />
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold">
                                {log.region}
                              </h4>

                              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                Secure geo tracing
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <SeverityBadge
                            severity={log.severity}
                          />
                        </div>

                        <div className="flex items-center justify-end lg:col-span-2">
                          <StatusBadge status={log.status} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Suspense>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-zinc-200/70 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03] xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-500">
                <Smartphone className="h-4 w-4" />
                Adaptive Device Monitoring
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-500">
                <ShieldCheck className="h-4 w-4" />
                Immutable Log Integrity
              </div>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time forensic indexing • End-to-end
              encrypted audit pipeline • Enterprise retention
              policy active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}