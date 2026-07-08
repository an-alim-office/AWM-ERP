"use client";

import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  PauseCircle,
  PlayCircle,
  RefreshCcw,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  TimerReset,
  Webhook,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

type ServiceStatus = "online" | "degraded" | "offline";

type ServiceItem = {
  id: number;
  name: string;
  description: string;
  icon: ElementType;
  status: ServiceStatus;
  uptime: string;
  latency: string;
  region: string;
};

type FeatureItem = {
  title: string;
  description: string;
  icon: ElementType;
  color: string;
  action: string;
};

const initialServices: ServiceItem[] = [
  {
    id: 1,
    name: "Global CDN",
    description: "Static assets, routing and edge cache",
    icon: Globe,
    status: "online",
    uptime: "99.99%",
    latency: "42ms",
    region: "Global",
  },
  {
    id: 2,
    name: "Auth & Security",
    description: "JWT, session, role and permission guard",
    icon: ShieldCheck,
    status: "online",
    uptime: "99.98%",
    latency: "58ms",
    region: "Asia",
  },
  {
    id: 3,
    name: "API Gateway",
    description: "Rate limit, API routing and request validation",
    icon: Server,
    status: "online",
    uptime: "99.95%",
    latency: "71ms",
    region: "Singapore",
  },
  {
    id: 4,
    name: "Database Cluster",
    description: "Primary database, replicas and backups",
    icon: Database,
    status: "degraded",
    uptime: "99.82%",
    latency: "126ms",
    region: "Mumbai",
  },
  {
    id: 5,
    name: "Webhook Engine",
    description: "Realtime event delivery and retries",
    icon: Webhook,
    status: "online",
    uptime: "99.91%",
    latency: "88ms",
    region: "Global",
  },
  {
    id: 6,
    name: "Cloud Storage",
    description: "Files, media, backup and secure objects",
    icon: Cloud,
    status: "online",
    uptime: "99.97%",
    latency: "63ms",
    region: "Dubai",
  },
];

const features: FeatureItem[] = [
  {
    title: "Advanced Security",
    description: "2FA, role based access, encrypted token and firewall ready.",
    icon: Lock,
    color: "from-emerald-500 to-teal-500",
    action: "Open Security",
  },
  {
    title: "API Key Manager",
    description: "Create, rotate, copy and revoke API keys securely.",
    icon: KeyRound,
    color: "from-violet-500 to-fuchsia-500",
    action: "Manage Keys",
  },
  {
    title: "Webhook Tester",
    description: "Send test events, inspect response and monitor retries.",
    icon: Webhook,
    color: "from-sky-500 to-cyan-500",
    action: "Test Webhook",
  },
  {
    title: "Smart Automation",
    description: "Auto health-check, auto retry, alert and workflow trigger.",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    action: "Run Automation",
  },
];

const statusConfig: Record<
  ServiceStatus,
  {
    label: string;
    dot: string;
    badge: string;
    icon: ElementType;
  }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400 shadow-emerald-400/40",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: Wifi,
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400 shadow-amber-400/40",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    icon: AlertTriangle,
  },
  offline: {
    label: "Offline",
    dot: "bg-rose-400 shadow-rose-400/40",
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    icon: WifiOff,
  },
};

function getHealthValue(status: ServiceStatus) {
  if (status === "online") return 100;
  if (status === "degraded") return 62;
  return 20;
}

function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StatusPill({ status }: { status: ServiceStatus }) {
  const Icon = statusConfig[status].icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig[status].badge}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {statusConfig[status].label}
    </span>
  );
}

function StatusDot({ status }: { status: ServiceStatus }) {
  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${statusConfig[status].dot}`}
      />
      <span
        className={`relative inline-flex h-3 w-3 rounded-full shadow-lg ${statusConfig[status].dot}`}
      />
    </span>
  );
}

function ActionButton({
  children,
  icon: Icon,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: ReactNode;
  icon: ElementType;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "border-cyan-400/30 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25",
    secondary:
      "border-white/10 bg-white/10 text-white hover:bg-white/15",
    danger:
      "border-rose-400/30 bg-rose-400/15 text-rose-100 hover:bg-rose-400/25",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export default function AdvancedSystemPage() {
    
  const reduceMotion = useReducedMotion();

  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [activity, setActivity] = useState<string[]>([
    "Security scan completed successfully.",
    "Database backup verified.",
    "Webhook delivery queue is healthy.",
    "API gateway rate-limit policy synced.",
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("--:--:--");

  const apiKey = "sk_live_9X7A-ADVANCED-DEMO-KEY-2026";

  const healthScore = useMemo(() => {
    const total = services.reduce(
      (sum, service) => sum + getHealthValue(service.status),
      0
    );

    return Math.round(total / services.length);
  }, [services]);

  const onlineCount = useMemo(
    () => services.filter((service) => service.status === "online").length,
    [services]
  );

  const averageLatency = useMemo(() => {
    const total = services.reduce(
      (sum, service) => sum + Number.parseInt(service.latency, 10),
      0
    );

    return Math.round(total / services.length);
  }, [services]);

  function pushActivity(message: string) {
    setActivity((previous) => [
      `${new Date().toLocaleTimeString()} — ${message}`,
      ...previous.slice(0, 6),
    ]);
  }

  function showMessage(message: string) {
    setToast(message);
  }

  function refreshHealth() {
    setIsRefreshing(true);
    pushActivity("Manual health refresh started.");

    window.setTimeout(() => {
      const statusPool: ServiceStatus[] = [
        "online",
        "online",
        "online",
        "online",
        "degraded",
      ];

      setServices((previous) =>
        previous.map((service, index) => {
          const nextStatus = statusPool[(Date.now() + index) % statusPool.length];
          const nextLatency = 45 + ((Date.now() + index * 31) % 115);

          return {
            ...service,
            status: nextStatus,
            latency: `${nextLatency}ms`,
          };
        })
      );

      setIsRefreshing(false);
      pushActivity("All services refreshed successfully.");
      showMessage("Health check updated successfully.");
    }, 1000);
  }

  function rotateApiKey() {
    pushActivity("API key rotation request completed.");
    showMessage("API key rotated successfully.");
  }

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(apiKey);
      pushActivity("API key copied to clipboard.");
      showMessage("API key copied.");
    } catch {
      showMessage("Clipboard permission denied.");
    }
  }

  function testWebhook() {
    pushActivity("Webhook test event sent and accepted.");
    showMessage("Webhook test event sent.");
  }

  function runBackup() {
    pushActivity("Database backup started and queued.");
    showMessage("Backup process started.");
  }

  function exportReport() {
    const report = {
      healthScore,
      onlineServices: onlineCount,
      averageLatency: `${averageLatency}ms`,
      maintenanceMode: isMaintenance,
      services,
      activity,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "system-health-report.json";
    link.click();

    URL.revokeObjectURL(url);
    pushActivity("System report exported.");
    showMessage("Report downloaded.");
  }

  function toggleMaintenance() {
    setIsMaintenance((previous) => !previous);
    pushActivity(
      isMaintenance
        ? "Maintenance mode disabled."
        : "Maintenance mode enabled."
    );
    showMessage(
      isMaintenance ? "Maintenance mode disabled." : "Maintenance mode enabled."
    );
  }

  function runOptimization() {
    pushActivity("Performance optimization task executed.");
    showMessage("Optimization completed.");
  }

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!liveMode) return;

    const timer = window.setInterval(() => {
      pushActivity("Live monitor pulse received.");
    }, 7000);

    return () => window.clearInterval(timer);
  }, [liveMode]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute left-[45%] top-[25%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
            className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="h-5 w-5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Advanced Control Center
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              System Health & Security Dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              API, database, webhook, cloud, security, backup, automation এবং
              live monitoring—সবকিছু এক জায়গা থেকে manage করার জন্য advanced
              production-ready interface.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              icon={isRefreshing ? Loader2 : RefreshCcw}
              onClick={refreshHealth}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </ActionButton>

            <ActionButton icon={Download} variant="secondary" onClick={exportReport}>
              Export Report
            </ActionButton>

            <ActionButton icon={Settings} variant="secondary">
              Settings
            </ActionButton>
          </div>
        </header>

        {isMaintenance && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100"
          >
            <div className="flex items-center gap-3 font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Maintenance Mode Active — user-facing sensitive operations are
              temporarily limited.
            </div>
          </motion.div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Health Score</p>
                <h2 className="mt-2 text-4xl font-black">{healthScore}%</h2>
              </div>
              <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Online Services</p>
                <h2 className="mt-2 text-4xl font-black">
                  {onlineCount}/{services.length}
                </h2>
              </div>
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                <Wifi className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Live service availability tracking.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Average Latency</p>
                <h2 className="mt-2 text-4xl font-black">{averageLatency}ms</h2>
              </div>
              <div className="rounded-2xl bg-violet-400/15 p-3 text-violet-300">
                <Cpu className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Optimized for high-performance responses.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Server Time</p>
                <h2 className="mt-2 text-4xl font-black">{currentTime}</h2>
              </div>
              <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                <TimerReset className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Realtime dashboard clock.
            </p>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <GlassCard className="min-h-[420px]">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Command Center</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Important production actions and quick controls.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLiveMode((previous) => !previous)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                  liveMode
                    ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
                    : "border-white/10 bg-white/10 text-slate-200"
                }`}
              >
                {liveMode ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <PauseCircle className="h-4 w-4" />
                )}
                {liveMode ? "Live Mode On" : "Live Mode Off"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    layout
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5"
                  >
                    <div
                      className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-3`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-black">{feature.title}</h3>
                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        pushActivity(`${feature.title} opened.`);
                        showMessage(`${feature.title} ready.`);
                      }}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100"
                    >
                      {feature.action}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <ActionButton icon={Webhook} onClick={testWebhook}>
                Test Webhook
              </ActionButton>

              <ActionButton icon={HardDrive} variant="secondary" onClick={runBackup}>
                Backup DB
              </ActionButton>

              <ActionButton icon={Rocket} variant="secondary" onClick={runOptimization}>
                Optimize
              </ActionButton>

              <ActionButton
                icon={isMaintenance ? PlayCircle : PauseCircle}
                variant={isMaintenance ? "primary" : "danger"}
                onClick={toggleMaintenance}
              >
                {isMaintenance ? "Disable Maintenance" : "Maintenance"}
              </ActionButton>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Security Panel</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Token, API key and alert center.
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">
                  Production API Key
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKey((previous) => !previous)}
                  className="rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/15"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-[#050812] px-4 py-3 font-mono text-sm text-cyan-200">
                {showApiKey ? apiKey : "sk_live_••••-••••••••-••••-2026"}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <ActionButton icon={Copy} variant="secondary" onClick={copyApiKey}>
                  Copy
                </ActionButton>

                <ActionButton icon={KeyRound} onClick={rotateApiKey}>
                  Rotate Key
                </ActionButton>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-semibold">Smart Alerts</span>
                </div>
                <StatusPill status="online" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-cyan-300" />
                  <span className="text-sm font-semibold">Integrations</span>
                </div>
                <StatusPill status="online" />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-violet-300" />
                  <span className="text-sm font-semibold">Audit Logs</span>
                </div>
                <StatusPill status="online" />
              </div>
            </div>
          </GlassCard>
        </div>

        <LayoutGroup>
          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Service Health Monitor</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Realtime infrastructure status and performance overview.
                </p>
              </div>

              <ActionButton
                icon={isRefreshing ? Loader2 : RefreshCcw}
                onClick={refreshHealth}
                disabled={isRefreshing}
                variant="secondary"
              >
                Run Full Check
              </ActionButton>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <GlassCard key={service.id}>
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-white/10 p-3">
                          <Icon className="h-6 w-6 text-cyan-200" />
                        </div>
                        <div>
                          <h3 className="font-black">{service.name}</h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {service.region}
                          </p>
                        </div>
                      </div>

                      <StatusDot status={service.status} />
                    </div>

                    <p className="min-h-[44px] text-sm leading-6 text-slate-400">
                      {service.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <StatusPill status={service.status} />
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                        {service.latency}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                        Uptime {service.uptime}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </section>
        </LayoutGroup>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <GlassCard>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Most-used advanced operations.
                </p>
              </div>
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>

            <div className="grid gap-3">
              <ActionButton icon={ShieldCheck} onClick={() => showMessage("Security scan completed.")}>
                Run Security Scan
              </ActionButton>

              <ActionButton icon={Database} variant="secondary" onClick={runBackup}>
                Create Database Snapshot
              </ActionButton>

              <ActionButton icon={Cloud} variant="secondary" onClick={() => showMessage("Cloud sync started.")}>
                Sync Cloud Storage
              </ActionButton>

              <ActionButton icon={Server} variant="secondary" onClick={() => showMessage("Server cache cleared.")}>
                Clear Server Cache
              </ActionButton>

              <ActionButton icon={Download} variant="secondary" onClick={exportReport}>
                Download Full JSON Report
              </ActionButton>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Activity Timeline</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest system events, actions and logs.
                </p>
              </div>
              <Activity className="h-7 w-7 text-emerald-300" />
            </div>

            <div className="space-y-3">
              {activity.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="mt-1 rounded-full bg-emerald-400/15 p-1 text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}