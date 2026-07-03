"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Loader2,
  PauseCircle,
  PlayCircle,
  RefreshCcw,
  Router,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Webhook,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ConnectorStatus =
  | "connected"
  | "warning"
  | "offline";

type ConnectorCategory =
  | "accounting"
  | "storage"
  | "communication"
  | "database"
  | "automation";

interface Connector {
  id: number;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  uptime: string;
  requests: string;
  latency: string;
  icon: ElementType;
  description: string;
  version: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
  action: string;
}

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTS                                  */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY =
  "erp-connectors-v2026";

const CONNECTORS: Connector[] = [
  {
    id: 1,
    name: "SAP Enterprise",
    category: "accounting",
    status: "connected",
    uptime: "99.99%",
    requests: "1.4M",
    latency: "48ms",
    icon: Database,
    description:
      "Enterprise accounting and finance synchronization.",
    version: "v4.8.2",
  },

  {
    id: 2,
    name: "Slack Workspace",
    category: "communication",
    status: "connected",
    uptime: "99.97%",
    requests: "892K",
    latency: "31ms",
    icon: BellRing,
    description:
      "Realtime internal communication integration.",
    version: "v2.1.0",
  },

  {
    id: 3,
    name: "AWS S3 Storage",
    category: "storage",
    status: "warning",
    uptime: "99.82%",
    requests: "3.1M",
    latency: "92ms",
    icon: Cloud,
    description:
      "Secure cloud file storage and backup connector.",
    version: "v5.3.1",
  },

  {
    id: 4,
    name: "MongoDB Atlas",
    category: "database",
    status: "connected",
    uptime: "99.95%",
    requests: "2.3M",
    latency: "56ms",
    icon: HardDrive,
    description:
      "Distributed database cluster integration.",
    version: "v6.0.0",
  },

  {
    id: 5,
    name: "Zapier Automation",
    category: "automation",
    status: "offline",
    uptime: "97.12%",
    requests: "312K",
    latency: "180ms",
    icon: Zap,
    description:
      "Workflow automation and webhook orchestration.",
    version: "v3.9.4",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Generate API Key",
    description:
      "Create secure connector access token.",
    icon: KeyRound,
    accent: "#8b5cf6",
    action: "Generate",
  },

  {
    title: "Run Diagnostics",
    description:
      "Realtime connector validation and monitoring.",
    icon: Activity,
    accent: "#06b6d4",
    action: "Scan",
  },

  {
    title: "Security Audit",
    description:
      "Analyze threats and validate encryption.",
    icon: ShieldCheck,
    accent: "#22c55e",
    action: "Audit",
  },

  {
    title: "Webhook Sync",
    description:
      "Force sync all external services instantly.",
    icon: Webhook,
    accent: "#f59e0b",
    action: "Sync",
  },
];

/* -------------------------------------------------------------------------- */
/*                              STATUS CONFIG                                 */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  connected: {
    label: "Connected",
    color:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    icon: Wifi,
  },

  warning: {
    label: "Warning",
    color:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
    icon: AlertTriangle,
  },

  offline: {
    label: "Offline",
    color:
      "border-rose-500/20 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
    icon: WifiOff,
  },
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion =
    useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 20,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
            }
      }
      transition={{
        duration: 0.35,
      }}
      className={`rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ActionButton({
  children,
  icon: Icon,
  onClick,
}: {
  children: ReactNode;
  icon: ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:scale-[1.02] hover:bg-white/[0.08]"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function ERPConnectorsPage() {
  const shouldReduceMotion =
    useReducedMotion();

  const [mounted, setMounted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [autoSync, setAutoSync] =
    useState(true);

  const [maintenance, setMaintenance] =
    useState(false);

  const [showApiKey, setShowApiKey] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [requestCount, setRequestCount] =
    useState(1842931);

  const [latency, setLatency] =
    useState(48);

  const [securityScore, setSecurityScore] =
    useState(96);

  const [connectors] =
    useState(CONNECTORS);

  const saveTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /* ---------------------------------------------------------------------- */
  /*                                  MOUNT                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);

    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (stored) {
      try {
        const parsed =
          JSON.parse(stored);

        setAutoSync(
          parsed.autoSync ?? true
        );

        setMaintenance(
          parsed.maintenance ?? false
        );
      } catch {
        localStorage.removeItem(
          STORAGE_KEY
        );
      }
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                              AUTO SAVE                                 */
  /* ---------------------------------------------------------------------- */

  const persistSettings =
    useCallback(() => {
      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current
        );
      }

      saveTimeout.current =
        setTimeout(() => {
          setSaving(true);

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              autoSync,
              maintenance,
            })
          );

          setTimeout(() => {
            setSaving(false);
          }, 1000);
        }, 500);
    }, [autoSync, maintenance]);

  useEffect(() => {
    if (!mounted) return;

    persistSettings();
  }, [
    autoSync,
    maintenance,
    mounted,
    persistSettings,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current
        );
      }
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                           LIVE METRICS                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setRequestCount(
          (prev) =>
            prev +
            Math.floor(
              Math.random() * 300
            )
        );

        setLatency(
          40 +
            Math.floor(
              Math.random() * 40
            )
        );

        setSecurityScore(
          94 +
            Math.floor(
              Math.random() * 6
            )
        );
      }, 2500);

    return () =>
      clearInterval(interval);
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                             FILTERED DATA                              */
  /* ---------------------------------------------------------------------- */

  const filteredConnectors =
    useMemo(() => {
      return connectors.filter(
        (connector) =>
          connector.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          connector.category
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [search, connectors]);

  /* ---------------------------------------------------------------------- */
  /*                              COPY API KEY                              */
  /* ---------------------------------------------------------------------- */

  const copyApiKey =
    async () => {
      try {
        await navigator.clipboard.writeText(
          "erp_live_sk_29XkLmA_2026"
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error(
          "Failed to copy API key:",
          error
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /*                                LOADING                                 */
  /* ---------------------------------------------------------------------- */

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617]" />
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                   UI                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute bottom-[-160px] right-[-160px] h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-400" />

              ERP Connector Engine
            </div>

            <h1 className="mt-5 text-5xl font-black tracking-tight">
              ERP Connectors
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-white/60">
              Advanced enterprise-grade
              connector orchestration with
              realtime monitoring,
              automation, API management,
              encrypted synchronization and
              intelligent failover systems.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={
                saving
                  ? "saving"
                  : "saved"
              }
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 10,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-4 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Saving settings...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                    All connectors synced
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* TOP STATS */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label:
                "API Requests",
              value:
                requestCount.toLocaleString(),
              icon: Activity,
              accent:
                "from-cyan-500 to-blue-500",
            },

            {
              label:
                "Latency",
              value: `${latency}ms`,
              icon: Router,
              accent:
                "from-violet-500 to-fuchsia-500",
            },

            {
              label:
                "Security Score",
              value: `${securityScore}%`,
              icon: ShieldCheck,
              accent:
                "from-emerald-500 to-teal-500",
            },

            {
              label:
                "Live Services",
              value:
                filteredConnectors.length,
              icon: Cpu,
              accent:
                "from-orange-500 to-amber-500",
            },
          ].map((item) => {
            const Icon =
              item.icon;

            return (
              <GlassCard
                key={item.label}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/60">
                      {item.label}
                    </p>

                    <h3 className="mt-4 text-4xl font-black">
                      {item.value}
                    </h3>
                  </div>

                  <div
                    className={`rounded-2xl bg-gradient-to-br p-4 ${item.accent}`}
                  >
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* MAIN */}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
          {/* LEFT */}

          <div className="space-y-8">
            {/* SEARCH */}

            <GlassCard>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search connectors..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-12 pr-4 outline-none transition focus:border-cyan-400/50"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    icon={
                      RefreshCcw
                    }
                  >
                    Refresh
                  </ActionButton>

                  <ActionButton
                    icon={
                      Download
                    }
                  >
                    Export Logs
                  </ActionButton>

                  <ActionButton
                    icon={
                      Settings2
                    }
                  >
                    Configure
                  </ActionButton>
                </div>
              </div>
            </GlassCard>

            {/* CONNECTORS */}

            <LayoutGroup>
              <div className="grid gap-6 lg:grid-cols-2">
                {filteredConnectors.map(
                  (connector) => {
                    const Icon =
                      connector.icon;

                    const status =
                      STATUS_CONFIG[
                        connector.status
                      ];

                    const StatusIcon =
                      status.icon;

                    return (
                      <motion.div
                        layout
                        key={
                          connector.id
                        }
                      >
                        <GlassCard className="h-full">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="rounded-2xl bg-white/5 p-4">
                                <Icon className="h-7 w-7" />
                              </div>

                              <div>
                                <h3 className="text-xl font-bold">
                                  {
                                    connector.name
                                  }
                                </h3>

                                <p className="mt-1 text-sm text-white/60">
                                  {
                                    connector.description
                                  }
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />

                              {
                                status.label
                              }
                            </span>
                          </div>

                          {/* STATS */}

                          <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                              {
                                label:
                                  "Uptime",
                                value:
                                  connector.uptime,
                              },

                              {
                                label:
                                  "Latency",
                                value:
                                  connector.latency,
                              },

                              {
                                label:
                                  "Requests",
                                value:
                                  connector.requests,
                              },
                            ].map(
                              (
                                stat
                              ) => (
                                <div
                                  key={
                                    stat.label
                                  }
                                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                >
                                  <p className="text-xs text-white/50">
                                    {
                                      stat.label
                                    }
                                  </p>

                                  <h4 className="mt-2 text-lg font-bold">
                                    {
                                      stat.value
                                    }
                                  </h4>
                                </div>
                              )
                            )}
                          </div>

                          {/* FOOTER */}

                          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                            <div className="flex items-center gap-2 text-sm text-white/50">
                              <BadgeCheck className="h-4 w-4 text-cyan-400" />

                              {
                                connector.version
                              }
                            </div>

                            <div className="flex items-center gap-2">
                              <button className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]">
                                <PlayCircle className="h-4 w-4" />
                              </button>

                              <button className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]">
                                <PauseCircle className="h-4 w-4" />
                              </button>

                              <button className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-rose-500/20">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </LayoutGroup>
          </div>

          {/* RIGHT PANEL */}

          <div className="space-y-8">
            {/* QUICK ACTIONS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    Quick Actions
                  </h2>

                  <p className="mt-2 text-sm text-white/60">
                    Advanced enterprise tools
                  </p>
                </div>

                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="mt-6 space-y-4">
                {QUICK_ACTIONS.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <motion.button
                        key={
                          item.title
                        }
                        whileTap={{
                          scale: 0.98,
                        }}
                        className="group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-2xl p-3"
                              style={{
                                background: `${item.accent}20`,
                              }}
                            >
                              <Icon
                                className="h-5 w-5"
                                style={{
                                  color:
                                    item.accent,
                                }}
                              />
                            </div>

                            <div>
                              <h3 className="font-bold">
                                {
                                  item.title
                                }
                              </h3>

                              <p className="mt-1 text-sm text-white/50">
                                {
                                  item.description
                                }
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-1" />
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </GlassCard>

            {/* API KEY */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    API Credentials
                  </h2>

                  <p className="mt-2 text-sm text-white/60">
                    Secure connector token
                  </p>
                </div>

                <KeyRound className="h-6 w-6 text-violet-400" />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between gap-3">
                  <code className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-cyan-300">
                    {showApiKey
                      ? "erp_live_sk_29XkLmA_2026"
                      : "••••••••••••••••••••••"}
                  </code>

                  <button
                    onClick={() =>
                      setShowApiKey(
                        (
                          prev
                        ) => !prev
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={
                      copyApiKey
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-black transition hover:scale-[1.02]"
                  >
                    <Copy className="h-4 w-4" />

                    {copied
                      ? "Copied!"
                      : "Copy API Key"}
                  </button>

                  <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold">
                    Rotate Key
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* SETTINGS */}

            <GlassCard>
              <div className="flex items-center gap-3">
                <Settings2 className="h-6 w-6 text-cyan-400" />

                <h2 className="text-2xl font-black">
                  System Controls
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    label:
                      "Auto Synchronization",
                    value: autoSync,
                    set:
                      setAutoSync,
                  },

                  {
                    label:
                      "Maintenance Mode",
                    value:
                      maintenance,
                    set:
                      setMaintenance,
                  },

                  {
                    label:
                      "Realtime Monitoring",
                    value: true,
                    set: () => {},
                  },
                ].map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.label
                      }
                      onClick={() =>
                        item.set(
                          !item.value
                        )
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                    >
                      <span className="font-medium">
                        {
                          item.label
                        }
                      </span>

                      <div
                        className={`h-6 w-11 rounded-full transition ${
                          item.value
                            ? "bg-emerald-500"
                            : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`mt-1 h-4 w-4 rounded-full bg-white transition ${
                            item.value
                              ? "ml-6"
                              : "ml-1"
                          }`}
                        />
                      </div>
                    </button>
                  )
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}