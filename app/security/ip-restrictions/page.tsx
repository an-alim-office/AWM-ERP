"use client";

import React, {
  Suspense,
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
  Globe,
  Loader2,
  LockKeyhole,
  Network,
  Plus,
  Radar,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldEllipsis,
  ShieldHalf,
  Sparkles,
  Trash2,
  Wifi,
  Workflow,
} from "lucide-react";

type AccessStatus = "ACTIVE" | "MONITORING" | "BLOCKED";

type IPRange = {
  id: string;
  label: string;
  range: string;
  type: "WHITELIST" | "BLACKLIST";
  location: string;
  status: AccessStatus;
  traffic: number;
  updated: string;
};

const initialRanges: IPRange[] = [
  {
    id: "ip-01",
    label: "Corporate VPN",
    range: "10.0.0.0/24",
    type: "WHITELIST",
    location: "Riyadh HQ",
    status: "ACTIVE",
    traffic: 184923,
    updated: "2 mins ago",
  },
  {
    id: "ip-02",
    label: "Admin Office",
    range: "192.168.1.0/28",
    type: "WHITELIST",
    location: "Dubai Branch",
    status: "ACTIVE",
    traffic: 82421,
    updated: "12 mins ago",
  },
  {
    id: "ip-03",
    label: "Threat Actor Cluster",
    range: "77.21.90.0/24",
    type: "BLACKLIST",
    location: "Unknown Origin",
    status: "BLOCKED",
    traffic: 12342,
    updated: "5 mins ago",
  },
  {
    id: "ip-04",
    label: "Temporary Vendor Access",
    range: "172.16.0.0/20",
    type: "WHITELIST",
    location: "Remote Gateway",
    status: "MONITORING",
    traffic: 42382,
    updated: "Just now",
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({
  status,
}: {
  status: AccessStatus;
}) {
  const styles: Record<AccessStatus, string> = {
    ACTIVE:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    MONITORING:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",
    BLOCKED:
      "border-red-500/20 bg-red-500/10 text-red-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
        styles[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function TypeBadge({
  type,
}: {
  type: IPRange["type"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide",
        type === "WHITELIST"
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-500"
          : "border-rose-500/20 bg-rose-500/10 text-rose-500"
      )}
    >
      {type}
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
    <div className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.04]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_30%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className={cn(
        "rounded-[1.8rem] border border-zinc-200/60 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]",
        shimmer
      )}
    >
      <div className="h-6 w-48 rounded-xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-20 rounded-2xl bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-10 rounded-2xl bg-zinc-200 dark:bg-white/10" />
    </div>
  );
}

export default function IPRestrictionsPage() {
  const [loading, setLoading] = useState(true);

  const [ranges, setRanges] =
    useState<IPRange[]>(initialRanges);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    AccessStatus | "ALL"
  >("ALL");

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  const filteredRanges = useMemo(() => {
    return ranges.filter((item) => {
      const matchesSearch =
        item.label
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.range
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.location
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ? true : item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [ranges, search, filter]);

  const activeRanges = useMemo(
    () =>
      ranges.filter((item) => item.status === "ACTIVE")
        .length,
    [ranges]
  );

  const blockedRanges = useMemo(
    () =>
      ranges.filter((item) => item.status === "BLOCKED")
        .length,
    [ranges]
  );

  const totalTraffic = useMemo(
    () =>
      ranges.reduce(
        (acc, item) => acc + item.traffic,
        0
      ),
    [ranges]
  );

  const refreshData = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100 text-zinc-900 transition-colors duration-300 dark:from-[#050816] dark:via-[#0b1020] dark:to-[#040711] dark:text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 xl:p-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_24%)]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Intelligent Network Security
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                IP Restrictions
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Advanced network access control, intelligent
                geo-based filtering, enterprise-grade IP
                whitelisting, and real-time traffic
                enforcement.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={refreshData}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Sync Rules
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">
                <Plus className="h-4 w-4" />
                Add New Range
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Authorized Networks"
            value={String(activeRanges)}
            hint="Protected production ranges"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <MetricCard
            title="Blocked Threats"
            value={String(blockedRanges)}
            hint="Hostile traffic neutralized"
            icon={<ShieldAlert className="h-5 w-5" />}
          />

          <MetricCard
            title="Traffic Processed"
            value={Intl.NumberFormat().format(
              totalTraffic
            )}
            hint="Real-time packet intelligence"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Network Integrity"
            value="99.99%"
            hint="Zero-trust perimeter health"
            icon={<LockKeyhole className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Authorized IP Ranges
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  AI-assisted access enforcement and
                  enterprise network governance.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                Secure gateway operational
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search ranges, locations, labels..."
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div className="relative min-w-[240px]">
                <Workflow className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(
                      e.target.value as
                        | AccessStatus
                        | "ALL"
                    )
                  }
                  className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="MONITORING">
                    Monitoring
                  </option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Suspense fallback={null}>
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  filteredRanges.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-[1.8rem] border border-zinc-200/70 bg-white/70 p-5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                            <Network className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-black tracking-tight">
                                {item.label}
                              </h3>

                              <TypeBadge type={item.type} />

                              <StatusBadge
                                status={item.status}
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Wifi className="h-3 w-3" />
                                {item.range}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Globe className="h-3 w-3" />
                                {item.location}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold dark:border-white/10 dark:bg-white/[0.03]">
                                <Clock3 className="h-3 w-3" />
                                Updated {item.updated}
                              </span>
                            </div>

                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                <span>Traffic Activity</span>
                                <span>
                                  {Intl.NumberFormat().format(
                                    item.traffic
                                  )}
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    item.type === "WHITELIST"
                                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                      : "bg-gradient-to-r from-rose-500 to-red-500"
                                  )}
                                  style={{
                                    width: `${Math.min(
                                      item.traffic / 2500,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
                            <Radar className="h-3.5 w-3.5" />
                            Analyze
                          </button>

                          <button className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500/20">
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Suspense>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-500">
                  <ShieldEllipsis className="h-3.5 w-3.5" />
                  Adaptive Threat Intelligence
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  Smart Access Grid
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  AI-powered perimeter intelligence
                  continuously analyzing suspicious access
                  patterns and enforcing zero-trust network
                  policy.
                </p>

                <div className="mt-6 rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
                        Firewall Efficiency
                      </p>

                      <h3 className="mt-2 text-3xl font-black">
                        99.97%
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-500">
                      <ShieldHalf className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-cyan-500 dark:border-white/10 dark:bg-white/[0.04]">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-black">
                    Live Network Feed
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Intelligent perimeter monitoring
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Unauthorized traffic blocked automatically",
                    time: "12 seconds ago",
                  },
                  {
                    title:
                      "New secure VPN session established",
                    time: "1 minute ago",
                  },
                  {
                    title:
                      "Threat anomaly score recalibrated",
                    time: "4 minutes ago",
                  },
                ].map((feed, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {feed.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {feed.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-500" />

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  Continuous traffic synchronization active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}