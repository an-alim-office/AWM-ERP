"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Globe,
  KeyRound,
  LaptopMinimal,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  Smartphone,
  Trash2,
  Workflow,
} from "lucide-react";

type APIKeyStatus = "ACTIVE" | "REVOKED" | "EXPIRING";

type APIKeyItem = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: APIKeyStatus;
  scope: string[];
  environment: "Production" | "Staging" | "Development";
  requests: number;
  device: "Desktop" | "Mobile" | "Server";
};

const initialKeys: APIKeyItem[] = [
  {
    id: "k_1",
    name: "Production_Gateway_Alpha",
    key: "sk_live_x8d2fj29sj2k92x",
    createdAt: "2026-05-12",
    lastUsed: "2 mins ago",
    status: "ACTIVE",
    scope: ["Payments", "Analytics", "Customers"],
    environment: "Production",
    requests: 1248932,
    device: "Server",
  },
  {
    id: "k_2",
    name: "Mobile_App_Consumer",
    key: "sk_live_92ksm29smx0s22",
    createdAt: "2026-04-22",
    lastUsed: "18 mins ago",
    status: "EXPIRING",
    scope: ["Mobile SDK", "Orders"],
    environment: "Staging",
    requests: 328942,
    device: "Mobile",
  },
  {
    id: "k_3",
    name: "Internal_Reporting_Service",
    key: "sk_live_jd92k20slx9q11",
    createdAt: "2026-03-02",
    lastUsed: "3 days ago",
    status: "REVOKED",
    scope: ["Reports"],
    environment: "Development",
    requests: 98212,
    device: "Desktop",
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: APIKeyStatus }) {
  const styles: Record<APIKeyStatus, string> = {
    ACTIVE:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    REVOKED: "bg-red-500/10 text-red-400 border border-red-500/20",
    EXPIRING:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        styles[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function DeviceIcon({
  device,
}: {
  device: APIKeyItem["device"];
}) {
  if (device === "Mobile")
    return <Smartphone className="h-4 w-4" />;
  if (device === "Desktop")
    return <LaptopMinimal className="h-4 w-4" />;
  return <Workflow className="h-4 w-4" />;
}

function MetricCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.03]" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200">
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
        "grid grid-cols-12 items-center gap-4 rounded-2xl border border-zinc-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
        shimmer
      )}
    >
      <div className="col-span-4 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/10" />
      <div className="col-span-2 h-10 rounded-xl bg-zinc-200/70 dark:bg-white/10" />
    </div>
  );
}

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    APIKeyStatus | "ALL"
  >("ALL");
  const [visibleKeys, setVisibleKeys] = useState<
    Record<string, boolean>
  >({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeys(initialKeys);
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const filteredKeys = useMemo(() => {
    return keys
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.environment
            .toLowerCase()
            .includes(query.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL"
            ? true
            : item.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.requests - a.requests);
  }, [keys, query, statusFilter]);

  const totalRequests = useMemo(
    () =>
      keys.reduce((acc, item) => acc + item.requests, 0),
    [keys]
  );

  const activeKeys = useMemo(
    () =>
      keys.filter((item) => item.status === "ACTIVE").length,
    [keys]
  );

  const copyKey = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      //
    }
  }, []);

  const regenerateKey = useCallback((id: string) => {
    setKeys((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              lastUsed: "Just now",
            }
          : item
      )
    );
  }, []);

  const revokeKey = useCallback((id: string) => {
    setKeys((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "REVOKED",
            }
          : item
      )
    );
  }, []);

  const refreshData = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#060816] dark:via-[#0a0f1f] dark:to-[#050816] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Enterprise Security Console
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                API Keys
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Manage secure integration credentials, monitor
                usage, rotate keys instantly, and maintain
                enterprise-grade access governance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshData}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Refresh
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <Plus className="h-4 w-4" />
                Generate New Key
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Active Keys"
            value={String(activeKeys)}
            hint="Operational production integrations"
            icon={<KeyRound className="h-5 w-5" />}
          />

          <MetricCard
            title="API Requests"
            value={Intl.NumberFormat().format(totalRequests)}
            hint="Last 30 days traffic volume"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Threat Shield"
            value="99.98%"
            hint="Anomaly protection accuracy"
            icon={<ShieldEllipsis className="h-5 w-5" />}
          />

          <MetricCard
            title="Latency"
            value="48ms"
            hint="Global gateway response"
            icon={<Globe className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search API keys, environments..."
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div className="relative min-w-[220px]">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as APIKeyStatus | "ALL"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRING">Expiring</option>
                  <option value="REVOKED">Revoked</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              All systems secured & operational
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-white/10">
            <div className="hidden grid-cols-12 gap-4 border-b border-zinc-200/70 bg-zinc-50/70 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 md:grid">
              <div className="col-span-4">Key & Access</div>
              <div className="col-span-2">Environment</div>
              <div className="col-span-2">Usage</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">
                Actions
              </div>
            </div>

            <div className="space-y-3 p-3">
              <Suspense fallback={null}>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filteredKeys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 p-16 text-center dark:border-white/10">
                    <AlertTriangle className="h-10 w-10 text-zinc-400" />
                    <h3 className="mt-4 text-lg font-bold">
                      No API keys found
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      Try changing filters or generating a new
                      secure key.
                    </p>
                  </div>
                ) : (
                  filteredKeys.map((item) => {
                    const isVisible =
                      visibleKeys[item.id] || false;

                    return (
                      <div
                        key={item.id}
                        className="group rounded-3xl border border-zinc-200/70 bg-white/70 p-5 transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-12 xl:items-center">
                          <div className="xl:col-span-4">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                                <KeyRound className="h-5 w-5 text-blue-500" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-bold tracking-wide">
                                    {item.name}
                                  </h3>

                                  <StatusBadge
                                    status={item.status}
                                  />
                                </div>

                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.02]">
                                  <code className="max-w-[220px] truncate text-xs text-zinc-600 dark:text-zinc-300">
                                    {isVisible
                                      ? item.key
                                      : "••••••••••••••••••••"}
                                  </code>

                                  <button
                                    onClick={() =>
                                      setVisibleKeys((prev) => ({
                                        ...prev,
                                        [item.id]:
                                          !prev[item.id],
                                      }))
                                    }
                                    className="ml-auto rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                                  >
                                    {isVisible ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      copyKey(item.key)
                                    }
                                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" />
                                    Created {item.createdAt}
                                  </span>

                                  <span>•</span>

                                  <span>
                                    Last used {item.lastUsed}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="xl:col-span-2">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Environment
                              </p>

                              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                                <DeviceIcon
                                  device={item.device}
                                />
                                {item.environment}
                              </div>
                            </div>
                          </div>

                          <div className="xl:col-span-2">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Usage
                              </p>

                              <h4 className="text-lg font-bold">
                                {Intl.NumberFormat().format(
                                  item.requests
                                )}
                              </h4>

                              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                                  style={{
                                    width: `${Math.min(
                                      item.requests / 15000,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="xl:col-span-2">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Permissions
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.scope.map((scope) => (
                                  <span
                                    key={scope}
                                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold dark:border-white/10 dark:bg-white/[0.03]"
                                  >
                                    {scope}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 xl:col-span-2">
                            <button
                              onClick={() =>
                                regenerateKey(item.id)
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                            >
                              <RefreshCcw className="h-3.5 w-3.5" />
                              Rotate
                            </button>

                            <button
                              onClick={() =>
                                revokeKey(item.id)
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Revoke
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}