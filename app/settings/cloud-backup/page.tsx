"use client";

import type { ChangeEvent, ElementType } from "react";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Activity,
  AlertTriangle,
  ArchiveRestore,
  BellRing,
  CheckCircle2,
  Clock3,
  Cloud,
  CloudDownload,
  CloudUpload,
  Cpu,
  Database,
  Download,
  Files,
  Fingerprint,
  FolderSync,
  Gauge,
  HardDrive,
  KeyRound,
  Loader2,
  Lock,
  PauseCircle,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Trash2,
  Upload,
  Wifi,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type BackupMode = "realtime" | "scheduled" | "manual";
type StorageProvider = "aws" | "google" | "azure";
type Region = "asia" | "eu" | "us";
type Redundancy = "single" | "multi" | "geo";
type BackupStatus = "idle" | "running" | "paused" | "verifying" | "restoring" | "completed";

type ToggleSettingKey =
  | "encryption"
  | "notifications"
  | "biometric"
  | "compression"
  | "autoCleanup"
  | "enabled";

interface BackupSettings {
  enabled: boolean;
  encryption: boolean;
  notifications: boolean;
  biometric: boolean;
  compression: boolean;
  autoCleanup: boolean;
  backupMode: BackupMode;
  provider: StorageProvider;
  region: Region;
  redundancy: Redundancy;
  retentionDays: number;
  bandwidthLimit: number;
  scheduleTime: string;
}

interface BackupPreset {
  id: BackupMode;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}

interface BackupFile {
  id: number;
  name: string;
  size: string;
  date: string;
  status: "completed" | "processing" | "verified" | "restored";
  checksum: string;
}

interface Toast {
  id: number;
  title: string;
  description: string;
  type: "success" | "info" | "warning";
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "cloud-backup-settings-v2026-advanced";

const DEFAULT_SETTINGS: BackupSettings = {
  enabled: true,
  encryption: true,
  notifications: true,
  biometric: true,
  compression: true,
  autoCleanup: true,
  backupMode: "scheduled",
  provider: "aws",
  region: "asia",
  redundancy: "geo",
  retentionDays: 30,
  bandwidthLimit: 80,
  scheduleTime: "02:00",
};

const BACKUP_PRESETS: BackupPreset[] = [
  {
    id: "realtime",
    title: "Realtime Backup",
    description: "Instant synchronization for mission-critical data.",
    icon: RefreshCcw,
    accent: "#22c55e",
  },
  {
    id: "scheduled",
    title: "Scheduled Backup",
    description: "Automatic backup based on your preferred schedule.",
    icon: Clock3,
    accent: "#3b82f6",
  },
  {
    id: "manual",
    title: "Manual Backup",
    description: "Run backup only when you trigger it manually.",
    icon: HardDrive,
    accent: "#f59e0b",
  },
];

const INITIAL_BACKUP_FILES: BackupFile[] = [
  {
    id: 1,
    name: "ERP-Full-Backup.zip",
    size: "2.4 GB",
    date: "2 mins ago",
    status: "completed",
    checksum: "SHA256: 87BA-F2D9-990A",
  },
  {
    id: 2,
    name: "Employee-Records.enc",
    size: "860 MB",
    date: "10 mins ago",
    status: "verified",
    checksum: "SHA256: A11C-72DD-78EF",
  },
  {
    id: 3,
    name: "Finance-Archive.sql",
    size: "1.1 GB",
    date: "25 mins ago",
    status: "completed",
    checksum: "SHA256: 33FE-98AB-C901",
  },
];

const PROVIDERS: {
  id: StorageProvider;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "aws",
    title: "AWS S3",
    subtitle: "High durability object storage",
  },
  {
    id: "google",
    title: "Google Cloud",
    subtitle: "Fast global cloud backup",
  },
  {
    id: "azure",
    title: "Azure Blob",
    subtitle: "Enterprise Microsoft cloud",
  },
];

const REGIONS: {
  id: Region;
  title: string;
}[] = [
  { id: "asia", title: "Asia Pacific" },
  { id: "eu", title: "Europe" },
  { id: "us", title: "United States" },
];

const REDUNDANCY_OPTIONS: {
  id: Redundancy;
  title: string;
  description: string;
}[] = [
  {
    id: "single",
    title: "Single Zone",
    description: "Basic protection",
  },
  {
    id: "multi",
    title: "Multi Zone",
    description: "High availability",
  },
  {
    id: "geo",
    title: "Geo Redundant",
    description: "Disaster recovery ready",
  },
];

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function CloudBackupPage() {
  const reduceMotion = useReducedMotion() ?? false;

  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backupProgress, setBackupProgress] = useState(68);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>("idle");
  const [settings, setSettings] = useState<BackupSettings>(DEFAULT_SETTINGS);
  const [files, setFiles] = useState<BackupFile[]>(INITIAL_BACKUP_FILES);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------------------------------------------------------------- */
  /*                                  TOAST                                 */
  /* ---------------------------------------------------------------------- */

  const showToast = useCallback(
    (title: string, description: string, type: Toast["type"] = "info") => {
      const id = Date.now();

      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          description,
          type,
        },
      ]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3500);
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /*                                  MOUNT                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Partial<BackupSettings>;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                               AUTO SAVE                                */
  /* ---------------------------------------------------------------------- */

  const persistSettings = useCallback((next: BackupSettings) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      setSaving(true);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      window.setTimeout(() => {
        setSaving(false);
      }, 700);
    }, 400);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    persistSettings(settings);
  }, [settings, mounted, persistSettings]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      if (operationTimeout.current) clearTimeout(operationTimeout.current);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                             LIVE PROGRESS                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (backupStatus !== "running") return;

    const interval = window.setInterval(() => {
      setBackupProgress((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 9) + 4, 100);

        if (next >= 100) {
          window.setTimeout(() => {
            setBackupStatus("completed");

            setFiles((prevFiles) =>
              prevFiles.map((file, index) =>
                index === 0 && file.status === "processing"
                  ? {
                      ...file,
                      status: "completed",
                      size: "2.9 GB",
                      date: "Just now",
                      checksum: "SHA256: " + Math.random().toString(16).slice(2, 14).toUpperCase(),
                    }
                  : file
              )
            );

            showToast(
              "Backup completed",
              "Your latest cloud backup has been successfully completed.",
              "success"
            );
          }, 250);
        }

        return next;
      });
    }, 900);

    return () => {
      clearInterval(interval);
    };
  }, [backupStatus, showToast]);

  /* ---------------------------------------------------------------------- */
  /*                              MEMO DATA                                 */
  /* ---------------------------------------------------------------------- */

  const activePreset = useMemo(() => {
    return BACKUP_PRESETS.find((preset) => preset.id === settings.backupMode) ?? BACKUP_PRESETS[0];
  }, [settings.backupMode]);

  const storageUsed = useMemo(() => {
    const base = files.length * 14 + backupProgress / 2;
    return Math.min(Math.round(base), 96);
  }, [files.length, backupProgress]);

  const healthScore = useMemo(() => {
    let score = 70;

    if (settings.enabled) score += 5;
    if (settings.encryption) score += 7;
    if (settings.biometric) score += 4;
    if (settings.redundancy === "geo") score += 8;
    if (settings.autoCleanup) score += 3;

    return Math.min(score, 99);
  }, [settings]);

  const statusText = useMemo(() => {
    const map: Record<BackupStatus, string> = {
      idle: "System Ready",
      running: "Backup Running",
      paused: "Backup Paused",
      verifying: "Verifying Integrity",
      restoring: "Restoring Backup",
      completed: "Backup Completed",
    };

    return map[backupStatus];
  }, [backupStatus]);

  const securityItems: {
    key: ToggleSettingKey;
    label: string;
    description: string;
    icon: ElementType;
  }[] = [
    {
      key: "enabled",
      label: "Backup Engine",
      description: "Turn complete backup protection on or off.",
      icon: Cloud,
    },
    {
      key: "encryption",
      label: "AES-256 Encryption",
      description: "Encrypt every archive before cloud upload.",
      icon: Lock,
    },
    {
      key: "notifications",
      label: "Backup Notifications",
      description: "Receive alerts for backup events.",
      icon: BellRing,
    },
    {
      key: "biometric",
      label: "Biometric Verification",
      description: "Require biometric approval for sensitive restore.",
      icon: Fingerprint,
    },
    {
      key: "compression",
      label: "Smart Compression",
      description: "Reduce storage usage automatically.",
      icon: ArchiveRestore,
    },
    {
      key: "autoCleanup",
      label: "Auto Cleanup",
      description: "Delete expired archives based on retention policy.",
      icon: Trash2,
    },
  ];

  /* ---------------------------------------------------------------------- */
  /*                                ACTIONS                                 */
  /* ---------------------------------------------------------------------- */

  const startBackup = useCallback(() => {
    if (!settings.enabled) {
      showToast("Backup disabled", "Please enable Backup Engine first.", "warning");
      return;
    }

    setBackupStatus("running");
    setBackupProgress(0);

    setFiles((prev) => [
      {
        id: Date.now(),
        name: "System-Full-Backup.enc.zip",
        size: "Calculating...",
        date: "Running now",
        status: "processing",
        checksum: "Pending",
      },
      ...prev,
    ]);

    showToast("Backup started", "Cloud backup job is now running.", "info");
  }, [settings.enabled, showToast]);

  const pauseBackup = useCallback(() => {
    setBackupStatus("paused");
    showToast("Backup paused", "The running backup job has been paused.", "warning");
  }, [showToast]);

  const resumeBackup = useCallback(() => {
    setBackupStatus("running");
    showToast("Backup resumed", "The backup job has been resumed.", "info");
  }, [showToast]);

  const verifyIntegrity = useCallback(() => {
    setBackupStatus("verifying");
    setBackupProgress(0);

    showToast("Verification started", "Checking archive checksum and encryption metadata.", "info");

    operationTimeout.current = setTimeout(() => {
      setBackupProgress(100);
      setBackupStatus("completed");

      setFiles((prev) =>
        prev.map((file, index) =>
          index === 0
            ? {
                ...file,
                status: "verified",
              }
            : file
        )
      );

      showToast("Integrity verified", "All selected archives passed verification.", "success");
    }, 1800);
  }, [showToast]);

  const restoreLatestBackup = useCallback(() => {
    if (files.length === 0) {
      showToast("No archive found", "There is no backup archive to restore.", "warning");
      return;
    }

    setBackupStatus("restoring");
    setBackupProgress(0);

    showToast("Restore started", "Latest archive restore process has started.", "info");

    operationTimeout.current = setTimeout(() => {
      setBackupProgress(100);
      setBackupStatus("completed");

      setFiles((prev) =>
        prev.map((file, index) =>
          index === 0
            ? {
                ...file,
                status: "restored",
                date: "Restored now",
              }
            : file
        )
      );

      showToast("Restore completed", "Latest backup has been restored successfully.", "success");
    }, 2200);
  }, [files.length, showToast]);

  const cleanupArchives = useCallback(() => {
    setFiles((prev) => prev.slice(0, 3));
    showToast("Cleanup completed", "Old archive records have been cleaned.", "success");
  }, [showToast]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setBackupStatus("idle");
    setBackupProgress(68);
    showToast("Settings reset", "Backup configuration restored to default.", "success");
  }, [showToast]);

  const exportSettings = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "cloud-backup-settings.json";
    anchor.click();

    URL.revokeObjectURL(url);

    showToast("Settings exported", "Configuration file has been downloaded.", "success");
  }, [settings, showToast]);

  const exportReport = useCallback(() => {
    const report = {
      generatedAt: new Date().toISOString(),
      status: backupStatus,
      progress: backupProgress,
      healthScore,
      storageUsed,
      settings,
      files,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "cloud-backup-report.json";
    anchor.click();

    URL.revokeObjectURL(url);

    showToast("Report downloaded", "Backup analytics report has been exported.", "success");
  }, [backupProgress, backupStatus, files, healthScore, settings, showToast, storageUsed]);

  const importSettings = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Partial<BackupSettings>;

        setSettings({
          ...DEFAULT_SETTINGS,
          ...imported,
        });

        showToast("Settings imported", "Backup settings imported successfully.", "success");
      } catch {
        showToast("Import failed", "Invalid settings JSON file.", "warning");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }, [showToast]);

  /* ---------------------------------------------------------------------- */
  /*                                LOADING                                 */
  /* ---------------------------------------------------------------------- */

  if (!mounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  /* ---------------------------------------------------------------------- */
  /*                                   UI                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen overflow-hidden bg-[#020617] text-white"
    >
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <AnimatePresence>
        {toasts.length > 0 && (
          <div className="fixed right-5 top-5 z-50 space-y-3">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={reduceMotion ? false : { opacity: 0, x: 30, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.96 }}
                className={`w-[330px] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                  toast.type === "success"
                    ? "border-emerald-400/20 bg-emerald-500/10"
                    : toast.type === "warning"
                    ? "border-amber-400/20 bg-amber-500/10"
                    : "border-cyan-400/20 bg-cyan-500/10"
                }`}
              >
                <h4 className="font-bold">{toast.title}</h4>
                <p className="mt-1 text-sm text-white/70">{toast.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm backdrop-blur-xl">
              <Sparkles size={15} className="text-cyan-400" />
              Advanced Cloud Backup Engine
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Cloud Backup Center
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
              Enterprise-grade backup, disaster recovery, encryption, automated scheduling,
              cloud redundancy, archive verification and instant restore system.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <AnimatePresence mode="wait">
              <motion.div
                key={saving ? "saving" : "saved"}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving configuration...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Configuration Saved</span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-300" />
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP KPI */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Health Score",
              value: `${healthScore}%`,
              icon: Activity,
              color: "text-emerald-300",
            },
            {
              label: "Storage Used",
              value: `${storageUsed}%`,
              icon: Database,
              color: "text-cyan-300",
            },
            {
              label: "Network",
              value: "1.2 Gbps",
              icon: Wifi,
              color: "text-blue-300",
            },
            {
              label: "Retention",
              value: `${settings.retentionDays} Days`,
              icon: TimerReset,
              color: "text-amber-300",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/55">{item.label}</span>
                  <Icon size={18} className={item.color} />
                </div>

                <h3 className="mt-3 text-3xl font-black">{item.value}</h3>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* LEFT PANEL */}

          <div className="space-y-8">
            {/* BACKUP MODES */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Database size={22} />
                <h2 className="text-2xl font-bold">Backup Modes</h2>
              </div>

              <LayoutGroup>
                <div className="mt-6 space-y-4">
                  {BACKUP_PRESETS.map((preset) => {
                    const active = settings.backupMode === preset.id;
                    const Icon = preset.icon;

                    return (
                      <motion.button
                        type="button"
                        key={preset.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            backupMode: preset.id,
                          }))
                        }
                        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:bg-white/[0.04]"
                      >
                        {active && (
                          <motion.div
                            layoutId="active-backup-mode"
                            className="absolute inset-0"
                            style={{
                              background: `${preset.accent}15`,
                            }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-xl p-3"
                              style={{
                                background: `${preset.accent}20`,
                              }}
                            >
                              <Icon size={20} />
                            </div>

                            <div>
                              <h3 className="font-semibold">{preset.title}</h3>
                              <p className="mt-1 text-sm text-white/60">{preset.description}</p>
                            </div>
                          </div>

                          {active && <CheckCircle2 size={18} style={{ color: preset.accent }} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </section>

            {/* SECURITY */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} />
                <h2 className="text-2xl font-bold">Security & Protection</h2>
              </div>

              <div className="mt-6 space-y-4">
                {securityItems.map((item) => {
                  const Icon = item.icon;
                  const active = settings[item.key];

                  return (
                    <motion.button
                      type="button"
                      key={item.key}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left transition hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/5 p-3">
                          <Icon size={18} />
                        </div>

                        <div>
                          <span className="font-medium">{item.label}</span>
                          <p className="mt-1 text-xs text-white/45">{item.description}</p>
                        </div>
                      </div>

                      <motion.div
                        animate={{
                          backgroundColor: active ? "#10b981" : "rgba(255,255,255,0.08)",
                        }}
                        className="relative h-6 w-11 shrink-0 rounded-full"
                      >
                        <motion.div
                          animate={{ x: active ? 20 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"
                        />
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* PROVIDER */}

            <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Server size={22} />
                <h2 className="text-2xl font-bold">Storage Provider</h2>
              </div>

              <div className="mt-6 grid gap-4">
                {PROVIDERS.map((provider) => (
                  <button
                    type="button"
                    key={provider.id}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        provider: provider.id,
                      }))
                    }
                    className={`rounded-2xl border px-5 py-4 text-left transition ${
                      settings.provider === provider.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold">{provider.title}</span>
                        <p className="mt-1 text-sm text-white/50">{provider.subtitle}</p>
                      </div>

                      {settings.provider === provider.id && <CheckCircle2 size={18} />}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT PANEL */}

          <motion.div
            layout
            className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.035] backdrop-blur-3xl"
          >
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <h2 className="text-2xl font-bold">Backup Analytics Dashboard</h2>
                <p className="mt-1 text-sm text-white/50">Live monitoring and recovery controls</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportSettings}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]"
                >
                  <Save size={16} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]"
                >
                  <Upload size={16} />
                  Import
                </button>

                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  onChange={importSettings}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={resetSettings}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/15"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid gap-8 p-6 lg:p-8 xl:grid-cols-2">
              {/* LIVE STATUS */}

              <div className="rounded-[28px] border border-white/10 bg-[#0f172a] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Backup Status</h3>
                    <p className="mt-1 text-sm text-white/60">{statusText}</p>
                  </div>

                  <Activity size={24} className="text-cyan-400" />
                </div>

                <div className="mt-10">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-white/60">Backup Progress</span>
                    <span className="font-semibold">{backupProgress}%</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{
                        width: `${backupProgress}%`,
                      }}
                      transition={{ duration: 0.45 }}
                      className="h-full rounded-full"
                      style={{
                        background: activePreset.accent,
                      }}
                    />
                  </div>
                </div>

                {/* STATS */}

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Encrypted",
                      value: settings.encryption ? "AES-256" : "Off",
                      icon: Lock,
                    },
                    {
                      label: "Servers",
                      value: settings.redundancy === "geo" ? "12 Active" : "4 Active",
                      icon: Server,
                    },
                    {
                      label: "Files",
                      value: `${files.length} Archives`,
                      icon: Files,
                    },
                    {
                      label: "CPU Usage",
                      value: backupStatus === "running" ? "42%" : "18%",
                      icon: Cpu,
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

                {/* ACTIONS */}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={startBackup}
                    disabled={backupStatus === "running"}
                    className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: activePreset.accent,
                    }}
                  >
                    <CloudUpload size={18} />
                    Start Backup
                  </button>

                  {backupStatus === "paused" ? (
                    <button
                      type="button"
                      onClick={resumeBackup}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 font-semibold text-emerald-200"
                    >
                      <PlayCircle size={18} />
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseBackup}
                      disabled={backupStatus !== "running"}
                      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PauseCircle size={18} />
                      Pause
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={restoreLatestBackup}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 font-semibold hover:bg-white/[0.05]"
                  >
                    <CloudDownload size={18} />
                    Restore Latest
                  </button>

                  <button
                    type="button"
                    onClick={verifyIntegrity}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 font-semibold hover:bg-white/[0.05]"
                  >
                    <KeyRound size={18} />
                    Verify
                  </button>

                  <button
                    type="button"
                    onClick={exportReport}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 font-semibold text-cyan-200 hover:bg-cyan-500/15"
                  >
                    <Download size={18} />
                    Report
                  </button>

                  <button
                    type="button"
                    onClick={cleanupArchives}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 font-semibold text-red-300 hover:bg-red-500/15"
                  >
                    <Trash2 size={18} />
                    Cleanup
                  </button>
                </div>
              </div>

              {/* ADVANCED CONFIG */}

              <div className="rounded-[28px] border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Advanced Policy</h3>
                    <p className="mt-1 text-sm text-white/60">Region, redundancy and limits</p>
                  </div>

                  <Gauge size={24} className="text-cyan-400" />
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-white/70">Backup Schedule</label>
                    <input
                      type="time"
                      value={settings.scheduleTime}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          scheduleTime: event.target.value,
                        }))
                      }
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/70">Retention Days</label>
                      <span className="text-sm text-cyan-200">{settings.retentionDays} days</span>
                    </div>

                    <input
                      type="range"
                      min={7}
                      max={180}
                      value={settings.retentionDays}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          retentionDays: Number(event.target.value),
                        }))
                      }
                      className="mt-4 w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-white/70">Bandwidth Limit</label>
                      <span className="text-sm text-cyan-200">{settings.bandwidthLimit}%</span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={settings.bandwidthLimit}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          bandwidthLimit: Number(event.target.value),
                        }))
                      }
                      className="mt-4 w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/70">Cloud Region</label>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {REGIONS.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              region: region.id,
                            }))
                          }
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            settings.region === region.id
                              ? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
                              : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
                          }`}
                        >
                          {region.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/70">Redundancy Level</label>

                    <div className="mt-3 space-y-3">
                      {REDUNDANCY_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              redundancy: option.id,
                            }))
                          }
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            settings.redundancy === option.id
                              ? "border-emerald-400 bg-emerald-500/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{option.title}</h4>
                              <p className="mt-1 text-sm text-white/50">{option.description}</p>
                            </div>

                            {settings.redundancy === option.id && (
                              <CheckCircle2 size={18} className="text-emerald-300" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* HISTORY */}

              <div className="rounded-[28px] border border-white/10 p-6 xl:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Backup History</h3>
                    <p className="mt-1 text-sm text-white/60">Recent cloud archives</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                    <FolderSync size={18} />
                    Auto Sync Active
                  </div>
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-3">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{file.name}</h4>
                          <p className="mt-1 text-sm text-white/50">
                            {file.size} • {file.date}
                          </p>
                          <p className="mt-2 break-all text-xs text-white/35">{file.checksum}</p>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                            file.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : file.status === "verified"
                              ? "bg-cyan-500/15 text-cyan-300"
                              : file.status === "restored"
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {file.status}
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={exportReport}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]"
                        >
                          <Download size={16} />
                          Download
                        </button>

                        <button
                          type="button"
                          onClick={restoreLatestBackup}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold hover:bg-white/[0.06]"
                        >
                          <Upload size={16} />
                          Restore
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                  <div className="flex items-start gap-4">
                    <AlertTriangle size={22} className="mt-1 shrink-0 text-amber-300" />

                    <div>
                      <h4 className="font-semibold text-amber-200">Disaster Recovery Ready</h4>

                      <p className="mt-2 text-sm leading-6 text-amber-100/70">
                        Your infrastructure is protected with automated retention policy,
                        encryption, integrity verification, multi-region redundancy and instant
                        restore capability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}