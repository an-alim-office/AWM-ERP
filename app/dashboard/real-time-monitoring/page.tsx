"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type NodeStatus = "Active" | "Syncing" | "Offline";

type InfrastructureNode = {
  id: string;
  location: string;
  status: NodeStatus;
  latency: number;
  devices: string;
  uptime: string;
  load: number;
};

type ServerMetrics = {
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  diskIO: number;
  aiProcesses: number;
};

const nodesSeed: InfrastructureNode[] = [
  {
    id: "NODE-01",
    location: "Main Gate (Inbound)",
    status: "Active",
    latency: 14,
    devices: "Fingerprint Scanner v4",
    uptime: "99.98%",
    load: 64,
  },
  {
    id: "NODE-02",
    location: "West Gate (Exit)",
    status: "Active",
    latency: 18,
    devices: "Biometric Scanner v3",
    uptime: "99.74%",
    load: 52,
  },
  {
    id: "NODE-03",
    location: "HQ Administrative",
    status: "Active",
    latency: 8,
    devices: "ID Card Terminal",
    uptime: "99.99%",
    load: 42,
  },
  {
    id: "NODE-04",
    location: "Riyadh Server Center",
    status: "Syncing",
    latency: 124,
    devices: "Cloud Sync Gateway",
    uptime: "98.61%",
    load: 82,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const ProgressBar = memo(function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {label}
        </p>

        <span className="text-sm font-black tabular-nums text-zinc-900 dark:text-white">
          {value}%
        </span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-white/5">
        <div
          className={`relative h-full rounded-full transition-all duration-700 ${color} ${shimmer}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
});

const StatCard = memo(function StatCard({
  title,
  value,
  suffix,
  accent,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:hover:border-white/15">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <div className="mt-4 flex items-end gap-1">
            <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              {value}
            </h3>

            {suffix && (
              <span className="pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {suffix}
              </span>
            )}
          </div>
        </div>

        <div
          className={`h-12 w-12 rounded-2xl ${accent} opacity-15 blur-xl`}
        />
      </div>
    </div>
  );
});

const NodeCard = memo(function NodeCard({
  node,
}: {
  node: InfrastructureNode;
}) {
  const statusClasses =
    node.status === "Active"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : node.status === "Syncing"
      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
      : "bg-rose-500/10 text-rose-500 border-rose-500/20";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/15">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gradient-to-br dark:from-cyan-500/[0.04] dark:to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-500">
              {node.id}
            </span>

            <h3 className="mt-3 text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
              {node.location}
            </h3>

            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {node.devices}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusClasses}`}
            >
              {node.status}
            </span>

            <p className="mt-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {node.latency}ms
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-zinc-100/80 p-3 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              Uptime
            </p>

            <p className="mt-1 text-sm font-black text-zinc-950 dark:text-white">
              {node.uptime}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-100/80 p-3 dark:bg-white/[0.03]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              Load
            </p>

            <p className="mt-1 text-sm font-black text-zinc-950 dark:text-white">
              {node.load}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

const Skeleton = memo(function Skeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-zinc-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-white/10" />

      <div className="mt-5 h-10 w-24 rounded bg-zinc-200 dark:bg-white/10" />

      <div className="mt-6 h-3 w-full rounded bg-zinc-200 dark:bg-white/10" />
    </div>
  );
});

export default function Page() {
  const [mounted, setMounted] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [theme, setTheme] = useState<
    "dark" | "light"
  >("dark");

  const [serverMetrics, setServerMetrics] =
    useState<ServerMetrics>({
      cpuUsage: 45,
      memoryUsage: 72,
      networkIn: 14.2,
      networkOut: 9.5,
      activeConnections: 1485,
      diskIO: 68,
      aiProcesses: 184,
    });

  const [nodes, setNodes] =
    useState<InfrastructureNode[]>(
      nodesSeed
    );

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      window.localStorage.getItem(
        "infra-theme"
      ) as "dark" | "light" | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }

    const interval = setInterval(() => {
      setServerMetrics((prev) => ({
        cpuUsage: Math.min(
          100,
          Math.max(
            15,
            prev.cpuUsage +
              Math.floor(
                Math.random() * 8 - 4
              )
          )
        ),

        memoryUsage: Math.min(
          100,
          Math.max(
            40,
            prev.memoryUsage +
              Math.floor(
                Math.random() * 6 - 3
              )
          )
        ),

        networkIn: Number(
          (
            prev.networkIn +
            (Math.random() * 1.2 - 0.4)
          ).toFixed(1)
        ),

        networkOut: Number(
          (
            prev.networkOut +
            (Math.random() * 1 - 0.3)
          ).toFixed(1)
        ),

        activeConnections:
          prev.activeConnections +
          Math.floor(
            Math.random() * 12 - 5
          ),

        diskIO: Math.min(
          100,
          Math.max(
            20,
            prev.diskIO +
              Math.floor(
                Math.random() * 10 - 5
              )
          )
        ),

        aiProcesses: Math.min(
          260,
          Math.max(
            120,
            prev.aiProcesses +
              Math.floor(
                Math.random() * 10 - 5
              )
          )
        ),
      }));

      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          latency: Math.max(
            4,
            node.latency +
              Math.floor(
                Math.random() * 10 - 5
              )
          ),
          load: Math.min(
            100,
            Math.max(
              20,
              node.load +
                Math.floor(
                  Math.random() * 10 - 5
                )
            )
          ),
        }))
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    window.localStorage.setItem(
      "infra-theme",
      theme
    );
  }, [theme]);

  const filteredNodes = useMemo(() => {
    const keyword =
      search.toLowerCase();

    return nodes.filter((node) =>
      [
        node.id,
        node.location,
        node.devices,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [nodes, search]);

  const healthyNodes = useMemo(
    () =>
      nodes.filter(
        (n) => n.status === "Active"
      ).length,
    [nodes]
  );

  const syncingNodes = useMemo(
    () =>
      nodes.filter(
        (n) => n.status === "Syncing"
      ).length,
    [nodes]
  );

  const averageLatency = useMemo(() => {
    const total = nodes.reduce(
      (acc, item) =>
        acc + item.latency,
      0
    );

    return Math.round(
      total / nodes.length
    );
  }, [nodes]);

  const toggleTheme =
    useCallback(() => {
      setTheme((prev) =>
        prev === "dark"
          ? "light"
          : "dark"
      );
    }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-zinc-950 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[340px] w-[340px] rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15" />

        <div className="absolute bottom-[-15%] right-[-5%] h-[320px] w-[320px] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-zinc-200/80 bg-white/80 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.05)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_28%)]" />

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                Infrastructure Online
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Real-Time Monitoring
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
                Enterprise-grade live telemetry
                dashboard for AI core
                infrastructure, biometric
                gateways, cloud sync nodes,
                socket sessions and global
                operational network routing.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-black text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >
                {theme === "dark"
                  ? "🌙 Dark"
                  : "☀️ Light"}
              </button>

              <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-500">
                2500ms Sync Interval
              </div>
            </div>
          </div>

          {/* QUICK METRICS */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Healthy Nodes"
              value={healthyNodes}
              accent="bg-emerald-500"
            />

            <StatCard
              title="Syncing Nodes"
              value={syncingNodes}
              accent="bg-amber-500"
            />

            <StatCard
              title="Average Latency"
              value={averageLatency}
              suffix="ms"
              accent="bg-cyan-500"
            />

            <StatCard
              title="AI Processes"
              value={
                serverMetrics.aiProcesses
              }
              accent="bg-violet-500"
            />
          </div>
        </section>

        {/* BODY */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* LEFT */}
          <section className="xl:col-span-8">
            <div className="rounded-[36px] border border-zinc-200/80 bg-white/80 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.04)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight">
                    Core Infrastructure Load
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Autonomous telemetry
                    stream with live AI
                    resource balancing.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Live Sync
                </div>
              </div>

              {!mounted ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[...Array(4)].map(
                    (_, index) => (
                      <Skeleton
                        key={index}
                      />
                    )
                  )}
                </div>
              ) : (
                <>
                  {/* PROGRESS */}
                  <div className="mt-8 space-y-7">
                    <ProgressBar
                      label="Synapse AI CPU Allocation"
                      value={
                        serverMetrics.cpuUsage
                      }
                      color="bg-gradient-to-r from-cyan-500 to-blue-500"
                    />

                    <ProgressBar
                      label="Memory Buffer Utilization"
                      value={
                        serverMetrics.memoryUsage
                      }
                      color="bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    />

                    <ProgressBar
                      label="Disk I/O Throughput"
                      value={
                        serverMetrics.diskIO
                      }
                      color="bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                  </div>

                  {/* NETWORK */}
                  <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard
                      title="Inbound"
                      value={
                        serverMetrics.networkIn.toFixed(
                          1
                        )
                      }
                      suffix="MB/s"
                      accent="bg-cyan-500"
                    />

                    <StatCard
                      title="Outbound"
                      value={
                        serverMetrics.networkOut.toFixed(
                          1
                        )
                      }
                      suffix="MB/s"
                      accent="bg-blue-500"
                    />

                    <StatCard
                      title="Socket Sessions"
                      value={
                        serverMetrics.activeConnections
                      }
                      accent="bg-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* RIGHT */}
          <aside className="xl:col-span-4">
            <div className="rounded-[36px] border border-zinc-200/80 bg-white/80 p-6 shadow-[0_10px_50px_rgba(0,0,0,0.04)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">
                      Active Gate Nodes
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Biometric & cloud
                      infrastructure routing.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
                    ⚡
                  </div>
                </div>

                {/* SEARCH */}
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search nodes..."
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-100/80 px-4 text-sm font-medium outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* NODE LIST */}
              <div className="mt-6 space-y-4">
                {filteredNodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    node={node}
                  />
                ))}

                {!filteredNodes.length && (
                  <div className="rounded-3xl border border-dashed border-zinc-300 p-8 text-center dark:border-white/10">
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      No matching nodes
                      found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(
              120,
              120,
              120,
              0.3
            )
            transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(
            120,
            120,
            120,
            0.3
          );
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}