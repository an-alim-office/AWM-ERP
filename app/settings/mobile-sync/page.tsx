"use client";

import type { ElementType } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Smartphone,
  Laptop,
  TabletSmartphone,
  Wifi,
  WifiOff,
  ShieldCheck,
  Cloud,
  RefreshCcw,
  CheckCircle2,
  Loader2,
  Fingerprint,
  BellRing,
  BatteryCharging,
  Signal,
  Lock,
  QrCode,
  Sparkles,
  Plus,
  Download,
  RotateCcw,
  Power,
  Trash2,
  Copy,
  DatabaseBackup,
  Activity,
  KeyRound,
  Radio,
  Settings2,
  X,
  CirclePause,
  CirclePlay,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type SyncMode = "realtime" | "balanced" | "battery";
type DeviceType = "mobile" | "desktop" | "tablet";
type DeviceStatus = "online" | "offline";

interface Device {
  id: number;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  battery: number;
  lastSync: string;
  trusted: boolean;
}

interface SyncSettings {
  enabled: boolean;
  biometric: boolean;
  notifications: boolean;
  autoBackup: boolean;
  lowDataMode: boolean;
  trustedNetworkOnly: boolean;
  mode: SyncMode;
}

type BooleanSettingKey =
  | "enabled"
  | "biometric"
  | "notifications"
  | "autoBackup"
  | "lowDataMode"
  | "trustedNetworkOnly";

interface SyncPreset {
  id: SyncMode;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}

interface ActivityItem {
  id: number;
  title: string;
  time: string;
}

interface StoredPayload {
  settings: SyncSettings;
  devices: Device[];
  lastSyncedAt: string;
  logs: ActivityItem[];
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "mobile-sync-v2026-advanced";

const DEFAULT_SETTINGS: SyncSettings = {
  enabled: true,
  biometric: true,
  notifications: true,
  autoBackup: true,
  lowDataMode: false,
  trustedNetworkOnly: true,
  mode: "balanced",
};

const SYNC_PRESETS: SyncPreset[] = [
  {
    id: "realtime",
    title: "Realtime Sync",
    description: "Instant synchronization across all active devices.",
    icon: Wifi,
    accent: "#22c55e",
  },
  {
    id: "balanced",
    title: "Balanced Mode",
    description: "Optimized performance, battery and cloud usage.",
    icon: RefreshCcw,
    accent: "#3b82f6",
  },
  {
    id: "battery",
    title: "Battery Saver",
    description: "Reduced background syncing for battery efficiency.",
    icon: BatteryCharging,
    accent: "#f59e0b",
  },
];

const DEFAULT_DEVICES: Device[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    type: "mobile",
    status: "online",
    battery: 91,
    lastSync: "2 sec ago",
    trusted: true,
  },
  {
    id: 2,
    name: "Galaxy Tab S9",
    type: "tablet",
    status: "online",
    battery: 74,
    lastSync: "10 sec ago",
    trusted: true,
  },
  {
    id: 3,
    name: "MacBook Pro M3",
    type: "desktop",
    status: "offline",
    battery: 100,
    lastSync: "12 mins ago",
    trusted: false,
  },
];

const DEVICE_POOL: Array<Pick<Device, "name" | "type">> = [
  { name: "Pixel 9 Pro", type: "mobile" },
  { name: "iPad Pro M4", type: "tablet" },
  { name: "Windows Workstation", type: "desktop" },
  { name: "Samsung Galaxy S24", type: "mobile" },
];

/* -------------------------------------------------------------------------- */
/*                               HELPER METHODS                               */
/* -------------------------------------------------------------------------- */

function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return TabletSmartphone;
    default:
      return Laptop;
  }
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createLog(title: string): ActivityItem {
  return {
    id: Date.now() + Math.floor(Math.random() * 999),
    title,
    time: getCurrentTime(),
  };
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function MobileSyncPage() {
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(72);
  const [lastSyncedAt, setLastSyncedAt] = useState("Just now");

  const [settings, setSettings] = useState<SyncSettings>(DEFAULT_SETTINGS);
  const [devices, setDevices] = useState<Device[]>(DEFAULT_DEVICES);
  const [logs, setLogs] = useState<ActivityItem[]>([
    createLog("Sync engine initialized"),
    createLog("Cloud backup verified"),
    createLog("Trusted network policy enabled"),
  ]);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------------------------------------------------------------------- */
  /*                                  LOAD                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StoredPayload>;

        if (parsed.settings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
          });
        }

        if (Array.isArray(parsed.devices)) {
          setDevices(parsed.devices);
        }

        if (typeof parsed.lastSyncedAt === "string") {
          setLastSyncedAt(parsed.lastSyncedAt);
        }

        if (Array.isArray(parsed.logs)) {
          setLogs(parsed.logs.slice(0, 6));
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setMounted(true);
    }

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                                AUTO SAVE                               */
  /* ---------------------------------------------------------------------- */

  const persistData = useCallback((payload: StoredPayload) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      setSaving(true);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      setTimeout(() => {
        setSaving(false);
      }, 700);
    }, 450);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    persistData({
      settings,
      devices,
      lastSyncedAt,
      logs,
    });
  }, [settings, devices, lastSyncedAt, logs, mounted, persistData]);

  /* ---------------------------------------------------------------------- */
  /*                              FAKE LIVE SYNC                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted || !settings.enabled || isSyncing) return;

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) return 8;
        return Math.min(100, prev + 6);
      });
    }, settings.mode === "realtime" ? 1000 : settings.mode === "balanced" ? 1500 : 2300);

    return () => clearInterval(interval);
  }, [mounted, settings.enabled, settings.mode, isSyncing]);

  /* ---------------------------------------------------------------------- */
  /*                              DERIVED DATA                              */
  /* ---------------------------------------------------------------------- */

  const activePreset = useMemo(() => {
    return SYNC_PRESETS.find((preset) => preset.id === settings.mode) ?? SYNC_PRESETS[0];
  }, [settings.mode]);

  const onlineDevices = useMemo(() => {
    return devices.filter((device) => device.status === "online").length;
  }, [devices]);

  const trustedDevices = useMemo(() => {
    return devices.filter((device) => device.trusted).length;
  }, [devices]);

  const pairingCode = useMemo(() => {
    return `SYNC-${String(devices.length + 17).padStart(2, "0")}-2026`;
  }, [devices.length]);

  /* ---------------------------------------------------------------------- */
  /*                                 ACTIONS                                */
  /* ---------------------------------------------------------------------- */

  const addLog = useCallback((title: string) => {
    setLogs((prev) => [createLog(title), ...prev].slice(0, 6));
  }, []);

  const updateSetting = useCallback(
    (key: BooleanSettingKey) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          [key]: !prev[key],
        };

        return next;
      });

      addLog(`Setting updated: ${key}`);
    },
    [addLog]
  );

  const handleModeChange = useCallback(
    (mode: SyncMode) => {
      setSettings((prev) => ({
        ...prev,
        mode,
      }));

      const preset = SYNC_PRESETS.find((item) => item.id === mode);
      addLog(`Mode changed to ${preset?.title ?? mode}`);
      toast.success("Sync mode updated");
    },
    [addLog]
  );

  const handleSyncNow = useCallback(() => {
    if (!settings.enabled) {
      toast.error("Sync is paused. Please enable sync first.");
      return;
    }

    if (isSyncing) return;

    if (syncInterval.current) {
      clearInterval(syncInterval.current);
    }

    let current = 0;
    setIsSyncing(true);
    setSyncProgress(0);
    addLog("Manual sync started");

    syncInterval.current = setInterval(() => {
      current = Math.min(100, current + Math.floor(Math.random() * 12) + 8);
      setSyncProgress(current);

      if (current >= 100) {
        if (syncInterval.current) clearInterval(syncInterval.current);

        setDevices((prev) =>
          prev.map((device) =>
            device.status === "online"
              ? {
                  ...device,
                  lastSync: "Just now",
                  battery: Math.max(1, device.battery - 1),
                }
              : device
          )
        );

        setLastSyncedAt(getCurrentTime());
        setIsSyncing(false);
        addLog("All online devices synced successfully");
        toast.success("Sync completed successfully");
      }
    }, 180);
  }, [addLog, isSyncing, settings.enabled]);

  const handleBackupNow = useCallback(() => {
    if (!settings.autoBackup) {
      toast.error("Automatic Cloud Backup is disabled.");
      return;
    }

    addLog("Cloud backup completed");
    toast.success("Cloud backup completed");
  }, [addLog, settings.autoBackup]);

  const handleAddDevice = useCallback(() => {
    const picked = DEVICE_POOL[Math.floor(Math.random() * DEVICE_POOL.length)];

    const newDevice: Device = {
      id: Date.now(),
      name: picked.name,
      type: picked.type,
      status: "online",
      battery: Math.floor(Math.random() * 35) + 60,
      lastSync: "Just now",
      trusted: false,
    };

    setDevices((prev) => [newDevice, ...prev]);
    addLog(`${newDevice.name} paired`);
    toast.success("New device added");
  }, [addLog]);

  const handleRemoveDevice = useCallback(
    (id: number) => {
      setDevices((prev) => {
        const selected = prev.find((device) => device.id === id);
        if (selected) addLog(`${selected.name} removed`);
        return prev.filter((device) => device.id !== id);
      });

      toast.success("Device removed");
    },
    [addLog]
  );

  const handleToggleDeviceStatus = useCallback(
    (id: number) => {
      setDevices((prev) =>
        prev.map((device) => {
          if (device.id !== id) return device;

          const nextStatus: DeviceStatus = device.status === "online" ? "offline" : "online";

          addLog(`${device.name} is now ${nextStatus}`);

          return {
            ...device,
            status: nextStatus,
            lastSync: nextStatus === "online" ? "Just now" : device.lastSync,
          };
        })
      );
    },
    [addLog]
  );

  const handleToggleTrust = useCallback(
    (id: number) => {
      setDevices((prev) =>
        prev.map((device) => {
          if (device.id !== id) return device;

          addLog(`${device.name} trust ${device.trusted ? "revoked" : "enabled"}`);

          return {
            ...device,
            trusted: !device.trusted,
          };
        })
      );
    },
    [addLog]
  );

  const handleDisconnectOffline = useCallback(() => {
    const offlineCount = devices.filter((device) => device.status === "offline").length;

    if (offlineCount === 0) {
      toast.info("No offline devices found");
      return;
    }

    setDevices((prev) => prev.filter((device) => device.status !== "offline"));
    addLog(`${offlineCount} offline device disconnected`);
    toast.success("Offline devices disconnected");
  }, [addLog, devices]);

  const handleExportConfig = useCallback(() => {
    const payload: StoredPayload = {
      settings,
      devices,
      lastSyncedAt,
      logs,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mobile-sync-config.json";
    link.click();

    URL.revokeObjectURL(url);

    addLog("Configuration exported");
    toast.success("Configuration exported");
  }, [addLog, devices, lastSyncedAt, logs, settings]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setDevices(DEFAULT_DEVICES);
    setSyncProgress(72);
    setLastSyncedAt("Just now");
    setLogs([createLog("System reset completed")]);
    window.localStorage.removeItem(STORAGE_KEY);
    toast.success("Sync system reset");
  }, []);

  const handleCopyPairCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      toast.success("Pairing code copied");
      addLog("Pairing code copied");
    } catch {
      toast.error("Unable to copy pairing code");
    }
  }, [addLog, pairingCode]);

  /* ---------------------------------------------------------------------- */
  /*                                LOADING                                 */
  /* ---------------------------------------------------------------------- */

  if (!mounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  /* ---------------------------------------------------------------------- */
  /*                                    UI                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm backdrop-blur-xl">
              <Sparkles size={14} className="text-cyan-400" />
              Advanced Mobile Sync Engine
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
              Mobile Synchronization
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
              Enterprise-grade multi-device synchronization with realtime cloud backup,
              biometric protection, trusted network policy, QR pairing and adaptive sync
              optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={saving ? "saving" : "saved"}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Auto Saved</span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => updateSetting("enabled")}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold transition hover:scale-[1.02] ${
                settings.enabled
                  ? "bg-emerald-500 text-black"
                  : "bg-red-500/20 text-red-200 ring-1 ring-red-400/30"
              }`}
            >
              {settings.enabled ? <CirclePause size={18} /> : <CirclePlay size={18} />}
              {settings.enabled ? "Pause Sync" : "Resume Sync"}
            </button>
          </div>
        </div>

        {/* QUICK STATS */}

        <div className="mb-10 grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Online Devices",
              value: `${onlineDevices}/${devices.length}`,
              icon: Wifi,
            },
            {
              label: "Trusted Devices",
              value: `${trustedDevices}`,
              icon: KeyRound,
            },
            {
              label: "Last Sync",
              value: lastSyncedAt,
              icon: RefreshCcw,
            },
            {
              label: "Engine Status",
              value: settings.enabled ? "Running" : "Paused",
              icon: Power,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-sm">{item.label}</span>
                  <Icon size={18} />
                </div>

                <h3 className="mt-3 text-2xl font-black">{item.value}</h3>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}

        <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
          {/* LEFT PANEL */}

          <div className="space-y-8">
            {/* SYNC MODES */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Cloud size={22} />
                <h2 className="text-2xl font-bold">Sync Modes</h2>
              </div>

              <LayoutGroup>
                <div className="mt-6 space-y-4">
                  {SYNC_PRESETS.map((preset) => {
                    const active = settings.mode === preset.id;
                    const Icon = preset.icon;

                    return (
                      <motion.button
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        key={preset.id}
                        onClick={() => handleModeChange(preset.id)}
                        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:bg-white/[0.05]"
                      >
                        {active && (
                          <motion.div
                            layoutId="active-sync-mode"
                            className="absolute inset-0"
                            style={{
                              background: `${preset.accent}14`,
                            }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-xl p-3"
                              style={{
                                background: `${preset.accent}22`,
                                color: preset.accent,
                              }}
                            >
                              <Icon size={20} />
                            </div>

                            <div>
                              <h3 className="font-semibold">{preset.title}</h3>
                              <p className="mt-1 text-sm text-white/60">
                                {preset.description}
                              </p>
                            </div>
                          </div>

                          {active && (
                            <CheckCircle2 size={18} style={{ color: preset.accent }} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </section>

            {/* SECURITY */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} />
                <h2 className="text-2xl font-bold">Security & Policies</h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    key: "biometric" as const,
                    label: "Biometric Authentication",
                    icon: Fingerprint,
                  },
                  {
                    key: "notifications" as const,
                    label: "Push Notifications",
                    icon: BellRing,
                  },
                  {
                    key: "autoBackup" as const,
                    label: "Automatic Cloud Backup",
                    icon: Cloud,
                  },
                  {
                    key: "lowDataMode" as const,
                    label: "Low Data Mode",
                    icon: Radio,
                  },
                  {
                    key: "trustedNetworkOnly" as const,
                    label: "Trusted Network Only",
                    icon: Lock,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const checked = settings[item.key];

                  return (
                    <button
                      key={item.key}
                      onClick={() => updateSetting(item.key)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/5 p-3">
                          <Icon size={18} />
                        </div>

                        <span className="font-medium">{item.label}</span>
                      </div>

                      <div
                        className={`h-6 w-11 rounded-full transition ${
                          checked ? "bg-emerald-500" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`mt-1 h-4 w-4 rounded-full bg-white transition ${
                            checked ? "ml-6" : "ml-1"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ACTIVITY LOG */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Activity size={22} />
                <h2 className="text-2xl font-bold">Activity Log</h2>
              </div>

              <div className="mt-6 space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-sm text-white/75">{log.title}</span>
                    <span className="text-xs text-white/40">{log.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT PANEL */}

          <motion.div
            layout
            className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl"
          >
            <div className="flex flex-col gap-4 border-b border-white/10 px-8 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Live Sync Dashboard</h2>
                <p className="mt-1 text-sm text-white/50">
                  Current profile: {activePreset.title}
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                style={{
                  background: `${activePreset.accent}20`,
                  color: activePreset.accent,
                }}
              >
                {settings.enabled ? <Wifi size={16} /> : <WifiOff size={16} />}
                {settings.enabled ? "ACTIVE" : "PAUSED"}
              </div>
            </div>

            <div className="grid gap-8 p-8 xl:grid-cols-2">
              {/* DEVICES */}

              <div className="rounded-[28px] border border-white/10 bg-[#0f172a] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Connected Devices</h3>
                    <p className="mt-1 text-sm text-white/60">Secure realtime access</p>
                  </div>

                  <button
                    onClick={handleAddDevice}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-black transition hover:scale-[1.02]"
                  >
                    <Plus size={18} />
                    Add Device
                  </button>
                </div>

                <div className="mt-8 space-y-4">
                  {devices.map((device) => {
                    const Icon = getDeviceIcon(device.type);

                    return (
                      <motion.div
                        key={device.id}
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/5 p-3">
                              <Icon size={20} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold">{device.name}</h4>

                                {device.trusted && (
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                                    Trusted
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-white/50">
                                Last Sync: {device.lastSync}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-white/60">
                              <BatteryCharging size={15} />
                              {device.battery}%
                            </div>

                            <div
                              className={`h-3 w-3 rounded-full ${
                                device.status === "online"
                                  ? "bg-emerald-400"
                                  : "bg-red-400"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <button
                            onClick={() => handleToggleDeviceStatus(device.id)}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition hover:bg-white/[0.06]"
                          >
                            {device.status === "online" ? "Set Offline" : "Set Online"}
                          </button>

                          <button
                            onClick={() => handleToggleTrust(device.id)}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition hover:bg-white/[0.06]"
                          >
                            {device.trusted ? "Revoke Trust" : "Trust Device"}
                          </button>

                          <button
                            onClick={() => handleRemoveDevice(device.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* STATUS */}

              <div className="rounded-[28px] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Sync Status</h3>
                    <p className="mt-1 text-sm text-white/60">Live cloud processing</p>
                  </div>

                  <Signal size={24} className="text-cyan-400" />
                </div>

                {/* PROGRESS */}

                <div className="mt-10">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {isSyncing ? "Manual synchronization" : "Background synchronization"}
                    </span>

                    <span className="font-semibold">{syncProgress}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{
                        width: `${syncProgress}%`,
                      }}
                      transition={{ duration: 0.35 }}
                      className="h-full rounded-full"
                      style={{
                        background: activePreset.accent,
                      }}
                    />
                  </div>
                </div>

                {/* CARDS */}

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Encryption",
                      value: "AES-256",
                      icon: Lock,
                    },
                    {
                      label: "Connected",
                      value: `${onlineDevices} Devices`,
                      icon: Wifi,
                    },
                    {
                      label: "Cloud Backup",
                      value: settings.autoBackup ? "Enabled" : "Disabled",
                      icon: Cloud,
                    },
                    {
                      label: "Pair Device",
                      value: "QR Ready",
                      icon: QrCode,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">{item.label}</span>
                          <Icon size={16} />
                        </div>

                        <h4 className="mt-3 text-xl font-bold">{item.value}</h4>
                      </div>
                    );
                  })}
                </div>

                {/* MAIN BUTTONS */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={handleSyncNow}
                    disabled={!settings.enabled || isSyncing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: activePreset.accent,
                      color: "#000",
                    }}
                  >
                    {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>

                  <button
                    onClick={() => setPairModalOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-semibold transition hover:bg-white/[0.06]"
                  >
                    <QrCode size={18} />
                    Pair QR
                  </button>

                  <button
                    onClick={handleBackupNow}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-semibold transition hover:bg-white/[0.06]"
                  >
                    <DatabaseBackup size={18} />
                    Backup Now
                  </button>

                  <button
                    onClick={handleDisconnectOffline}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-semibold transition hover:bg-white/[0.06]"
                  >
                    <WifiOff size={18} />
                    Disconnect Offline
                  </button>

                  <button
                    onClick={handleExportConfig}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 font-semibold transition hover:bg-white/[0.06]"
                  >
                    <Download size={18} />
                    Export Config
                  </button>

                  <button
                    onClick={handleReset}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 font-semibold text-red-200 transition hover:bg-red-500/20"
                  >
                    <RotateCcw size={18} />
                    Reset System
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* PAIR MODAL */}

      <AnimatePresence>
        {pairModalOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-xl"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0f172a] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">Pair New Device</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Scan QR or use pairing code.
                  </p>
                </div>

                <button
                  onClick={() => setPairModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2 transition hover:bg-white/[0.08]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 rounded-[24px] bg-white p-5">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-sm ${
                        index % 2 === 0 || index % 5 === 0 || index % 11 === 0
                          ? "bg-black"
                          : "bg-black/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Pairing Code
                    </p>
                    <p className="mt-1 font-mono text-xl font-black">{pairingCode}</p>
                  </div>

                  <button
                    onClick={handleCopyPairCode}
                    className="rounded-xl bg-white px-4 py-3 font-semibold text-black"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddDevice();
                  setPairModalOpen(false);
                }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:scale-[1.01]"
              >
                <Settings2 size={18} />
                Complete Pairing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}