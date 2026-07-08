"use client";

import type { ElementType } from "react";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  CheckCircle2,
  Clock3,
  Crown,
  Laptop,
  Loader2,
  Monitor,
  MoonStar,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Wand2,
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

type ThemeVariant =
  | "oled"
  | "midnight"
  | "classic"
  | "light"
  | "system"
  | "vip-aurora"
  | "vip-royal"
  | "vip-emerald";

type ScheduleMode = "disabled" | "sunset" | "custom";

interface ThemePreset {
  id: ThemeVariant;
  title: string;
  description: string;
  icon: ElementType;
  colors: {
    background: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
  };
}

interface ScheduleConfig {
  mode: ScheduleMode;
  start: string;
  end: string;
}

interface ThemePreferences {
  variant: ThemeVariant;
  schedule: ScheduleConfig;
}

interface BroadcastPayload {
  type: "theme-update";
  payload: ThemePreferences;
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "advanced-dark-mode-v2026";
const CHANNEL_NAME = "theme-sync-channel";

const createDefaultPreferences = (): ThemePreferences => ({
  variant: "midnight",
  schedule: {
    mode: "disabled",
    start: "18:00",
    end: "06:00",
  },
});

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "oled",
    title: "OLED Black",
    description: "Pure black optimized for AMOLED displays.",
    icon: MoonStar,
    colors: {
      background: "#000000",
      surface: "#050505",
      card: "#0A0A0A",
      border: "rgba(255,255,255,0.08)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.55)",
      accent: "#22d3ee",
    },
  },
  {
    id: "midnight",
    title: "Midnight Blue",
    description: "Comfortable low-contrast night interface.",
    icon: Laptop,
    colors: {
      background: "#020817",
      surface: "#07152f",
      card: "#0f172a",
      border: "rgba(148,163,184,0.12)",
      text: "#f8fafc",
      muted: "rgba(255,255,255,0.60)",
      accent: "#38bdf8",
    },
  },
  {
    id: "classic",
    title: "Classic Dark",
    description: "Professional slate/zinc appearance.",
    icon: MoonStar,
    colors: {
      background: "#09090b",
      surface: "#18181b",
      card: "#27272a",
      border: "rgba(255,255,255,0.08)",
      text: "#fafafa",
      muted: "rgba(255,255,255,0.55)",
      accent: "#8b5cf6",
    },
  },
  {
    id: "light",
    title: "Light Mode",
    description: "Modern bright workspace.",
    icon: Sun,
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      card: "#f1f5f9",
      border: "rgba(15,23,42,0.08)",
      text: "#020617",
      muted: "rgba(2,6,23,0.55)",
      accent: "#2563eb",
    },
  },
  {
    id: "system",
    title: "System Preference",
    description: "Automatically follows OS appearance.",
    icon: Monitor,
    colors: {
      background: "#020617",
      surface: "#07152f",
      card: "#0f172a",
      border: "rgba(255,255,255,0.08)",
      text: "#ffffff",
      muted: "rgba(255,255,255,0.55)",
      accent: "#22d3ee",
    },
  },
  {
    id: "vip-aurora",
    title: "VIP Aurora",
    description: "Luxury neon aurora experience for premium UI.",
    icon: Crown,
    colors: {
      background: "#050014",
      surface: "#0f0528",
      card: "#160a3a",
      border: "rgba(168,85,247,0.20)",
      text: "#faf5ff",
      muted: "rgba(250,245,255,0.62)",
      accent: "#d946ef",
    },
  },
  {
    id: "vip-royal",
    title: "VIP Royal Gold",
    description: "Elegant premium dark theme with gold highlights.",
    icon: Crown,
    colors: {
      background: "#090604",
      surface: "#151008",
      card: "#211707",
      border: "rgba(250,204,21,0.18)",
      text: "#fff7ed",
      muted: "rgba(255,247,237,0.62)",
      accent: "#facc15",
    },
  },
  {
    id: "vip-emerald",
    title: "VIP Emerald Glass",
    description: "Fresh cinematic glass theme with emerald glow.",
    icon: Crown,
    colors: {
      background: "#01110d",
      surface: "#041d17",
      card: "#092b22",
      border: "rgba(52,211,153,0.18)",
      text: "#ecfdf5",
      muted: "rgba(236,253,245,0.62)",
      accent: "#34d399",
    },
  },
];

const SCHEDULE_OPTIONS: {
  id: ScheduleMode;
  title: string;
  description: string;
}[] = [
  {
    id: "disabled",
    title: "Disabled",
    description: "Manual theme selection only.",
  },
  {
    id: "sunset",
    title: "Sunset Mode",
    description: "Dark after 6 PM and light after 6 AM.",
  },
  {
    id: "custom",
    title: "Custom Time",
    description: "Use your own dark mode start and end time.",
  },
];

/* -------------------------------------------------------------------------- */
/*                              MOCK DATABASE SAVE                            */
/* -------------------------------------------------------------------------- */

async function saveThemePreferences(
  preferences: ThemePreferences
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log("Saved preferences:", preferences);
}

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function isVipTheme(id: ThemeVariant) {
  return id.startsWith("vip-");
}

function isValidTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

function parseTimeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  return hour * 60 + minute;
}

function isThemeVariant(value: unknown): value is ThemeVariant {
  return (
    typeof value === "string" &&
    THEME_PRESETS.some((theme) => theme.id === value)
  );
}

function isScheduleMode(value: unknown): value is ScheduleMode {
  return value === "disabled" || value === "sunset" || value === "custom";
}

function normalizePreferences(value: unknown): ThemePreferences {
  const fallback = createDefaultPreferences();

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const parsed = value as Partial<ThemePreferences>;
  const parsedSchedule =
    parsed.schedule && typeof parsed.schedule === "object"
      ? (parsed.schedule as Partial<ScheduleConfig>)
      : undefined;

  return {
    variant: isThemeVariant(parsed.variant) ? parsed.variant : fallback.variant,
    schedule: {
      mode: isScheduleMode(parsedSchedule?.mode)
        ? parsedSchedule.mode
        : fallback.schedule.mode,
      start: isValidTime(parsedSchedule?.start)
        ? parsedSchedule.start
        : fallback.schedule.start,
      end: isValidTime(parsedSchedule?.end)
        ? parsedSchedule.end
        : fallback.schedule.end,
    },
  };
}

function getThemeById(id: ThemeVariant): ThemePreset {
  return THEME_PRESETS.find((theme) => theme.id === id) ?? THEME_PRESETS[0];
}

function temporarilyDisableTransitions() {
  const styleId = "disable-theme-transitions-style";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");

    style.id = styleId;
    style.textContent = `
      .disable-transitions,
      .disable-transitions * {
        transition: none !important;
        animation-duration: 0.001ms !important;
      }
    `;

    document.head.appendChild(style);
  }

  document.documentElement.classList.add("disable-transitions");

  if (document.body) {
    void window.getComputedStyle(document.body).opacity;
  }

  requestAnimationFrame(() => {
    document.documentElement.classList.remove("disable-transitions");
  });
}

function applyTheme(theme: ThemePreset, selectedVariant?: ThemeVariant) {
  const root = document.documentElement;

  temporarilyDisableTransitions();

  requestAnimationFrame(() => {
    const styles = {
      "--background": theme.colors.background,
      "--surface": theme.colors.surface,
      "--card": theme.colors.card,
      "--border": theme.colors.border,
      "--text": theme.colors.text,
      "--muted": theme.colors.muted,
      "--accent": theme.colors.accent,
    };

    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.colorScheme = theme.id === "light" ? "light" : "dark";
    root.dataset.theme = selectedVariant ?? theme.id;
    root.dataset.resolvedTheme = theme.id;

    let metaTheme = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );

    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.name = "theme-color";
      document.head.appendChild(metaTheme);
    }

    metaTheme.setAttribute("content", theme.colors.background);
  });
}

function getSystemTheme(): ThemePreset {
  if (typeof window === "undefined") {
    return getThemeById("midnight");
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? getThemeById("midnight") : getThemeById("light");
}

function isTimeInRange(current: string, start: string, end: string) {
  const currentMinutes = parseTimeToMinutes(current);
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function resolveScheduledVariant(schedule: ScheduleConfig): ThemeVariant | null {
  if (schedule.mode === "disabled") {
    return null;
  }

  if (schedule.mode === "sunset") {
    const hour = new Date().getHours();

    return hour >= 18 || hour <= 6 ? "midnight" : "light";
  }

  const now = new Date().toTimeString().slice(0, 5);
  const dark = isTimeInRange(now, schedule.start, schedule.end);

  return dark ? "midnight" : "light";
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function DarkModePage() {
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [systemVersion, setSystemVersion] = useState(0);

  const [preferences, setPreferences] = useState<ThemePreferences>(() =>
    createDefaultPreferences()
  );

  const channelRef = useRef<BroadcastChannel | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);
  const suppressNextPersist = useRef(false);

  /* ---------------------------------------------------------------------- */
  /*                                MOUNTED                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setPreferences(normalizePreferences(JSON.parse(stored)));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                          BROADCAST CHANNEL                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);

      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<BroadcastPayload>) => {
        if (event.data?.type === "theme-update") {
          suppressNextPersist.current = true;
          setPreferences(normalizePreferences(event.data.payload));
        }
      };

      return () => {
        channel.close();
        channelRef.current = null;
      };
    }

    return undefined;
  }, [mounted]);

  /* ---------------------------------------------------------------------- */
  /*                           STORAGE EVENT SYNC                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      try {
        suppressNextPersist.current = true;
        setPreferences(normalizePreferences(JSON.parse(event.newValue)));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [mounted]);

  /* ---------------------------------------------------------------------- */
  /*                             SYSTEM WATCH                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;
    if (preferences.variant !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      setSystemVersion((version) => version + 1);
    };

    listener();

    if ("addEventListener" in media) {
      media.addEventListener("change", listener);

      return () => {
        media.removeEventListener("change", listener);
      };
    }


  }, [preferences.variant, mounted]);

  /* ---------------------------------------------------------------------- */
  /*                              SCHEDULER                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;
    if (preferences.schedule.mode === "disabled") return;

    const runScheduler = () => {
      const nextVariant = resolveScheduledVariant(preferences.schedule);

      if (!nextVariant) return;

      setPreferences((prev) => {
        if (prev.variant === nextVariant) return prev;

        return {
          ...prev,
          variant: nextVariant,
        };
      });
    };

    runScheduler();

    const interval = setInterval(runScheduler, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [mounted, preferences.schedule]);

  /* ---------------------------------------------------------------------- */
  /*                             ACTIVE THEME                               */
  /* ---------------------------------------------------------------------- */

  const activeTheme = useMemo(() => {
    if (preferences.variant === "system") {
      return getSystemTheme();
    }

    return getThemeById(preferences.variant);
  }, [preferences.variant, systemVersion]);

  /* ---------------------------------------------------------------------- */
  /*                             APPLY THEME                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;

    applyTheme(activeTheme, preferences.variant);
  }, [activeTheme, preferences.variant, mounted]);

  /* ---------------------------------------------------------------------- */
  /*                               PERSISTENCE                              */
  /* ---------------------------------------------------------------------- */

  const persistPreferences = useCallback(
    (nextPreferences: ThemePreferences, immediate = false) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }

      const run = async () => {
        setSaving(true);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));

          channelRef.current?.postMessage({
            type: "theme-update",
            payload: nextPreferences,
          } satisfies BroadcastPayload);

          await saveThemePreferences(nextPreferences);
        } finally {
          setSaving(false);
        }
      };

      if (immediate) {
        void run();
        return;
      }

      saveTimeout.current = setTimeout(() => {
        void run();
      }, 500);
    },
    []
  );

  useEffect(() => {
    if (!mounted) return;

    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    if (suppressNextPersist.current) {
      suppressNextPersist.current = false;
      return;
    }

    persistPreferences(preferences);
  }, [preferences, mounted, persistPreferences]);

  /* ---------------------------------------------------------------------- */
  /*                               CLEANUP                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                               FOUC SAFE                                */
  /* ---------------------------------------------------------------------- */

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  /* ---------------------------------------------------------------------- */
  /*                                   UI                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1 text-sm backdrop-blur-xl">
              <Crown size={14} className="text-yellow-400" />
              VIP Advanced Dark Engine
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Dark Mode Settings
            </h1>

            <p
              className="mt-4 max-w-2xl text-lg"
              style={{
                color: "var(--muted)",
              }}
            >
              Enterprise-grade adaptive appearance system with VIP themes,
              real-time synchronization and smart scheduling.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => persistPreferences(preferences, true)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "var(--border)",
                background: `${activeTheme.colors.accent}18`,
              }}
            >
              <Save size={18} />
              Save Now
            </button>

            <button
              type="button"
              onClick={() => setPreferences(createDefaultPreferences())}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-semibold transition hover:scale-[1.02]"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <RotateCcw size={18} />
              Reset
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={saving ? "saving" : "saved"}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                aria-live="polite"
                className="rounded-2xl border px-5 py-3 backdrop-blur-xl"
                style={{
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving preferences...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>Preferences Synced</span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
          {/* LEFT PANEL */}

          <div className="space-y-8">
            {/* THEMES */}

            <section
              className="rounded-[32px] border p-6 backdrop-blur-2xl"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Theme Variants</h2>
                <Palette size={20} className="opacity-70" />
              </div>

              <LayoutGroup>
                <div className="mt-6 space-y-4">
                  {THEME_PRESETS.map((theme) => {
                    const active = preferences.variant === theme.id;
                    const Icon = theme.icon;

                    return (
                      <motion.button
                        type="button"
                        whileTap={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: 0.98,
                              }
                        }
                        key={theme.id}
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            variant: theme.id,
                          }))
                        }
                        aria-pressed={active}
                        className="relative w-full overflow-hidden rounded-2xl border p-5 text-left transition hover:scale-[1.01]"
                        style={{
                          borderColor: active
                            ? theme.colors.accent
                            : "var(--border)",
                        }}
                      >
                        {active && (
                          <motion.div
                            layoutId="active-theme"
                            className="absolute inset-0"
                            style={{
                              background: `${theme.colors.accent}12`,
                            }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="rounded-xl p-3"
                              style={{
                                background: `${theme.colors.accent}20`,
                              }}
                            >
                              <Icon size={20} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{theme.title}</h3>

                                {isVipTheme(theme.id) && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                                    style={{
                                      background: `${theme.colors.accent}22`,
                                      color: theme.colors.accent,
                                    }}
                                  >
                                    VIP
                                  </span>
                                )}
                              </div>

                              <p
                                className="mt-1 text-sm"
                                style={{
                                  color: "var(--muted)",
                                }}
                              >
                                {theme.description}
                              </p>
                            </div>
                          </div>

                          {active && (
                            <CheckCircle2
                              size={18}
                              style={{
                                color: theme.colors.accent,
                              }}
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </section>

            {/* SCHEDULER */}

            <section
              className="rounded-[32px] border p-6 backdrop-blur-2xl"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <Clock3 size={20} />
                <h2 className="text-2xl font-bold">Smart Scheduling</h2>
              </div>

              <div className="mt-6 space-y-4">
                {SCHEDULE_OPTIONS.map((option) => {
                  const active = preferences.schedule.mode === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            mode: option.id,
                          },
                        }))
                      }
                      className="w-full rounded-2xl border p-4 text-left transition hover:scale-[1.01]"
                      style={{
                        borderColor: active
                          ? activeTheme.colors.accent
                          : "var(--border)",
                        background: active
                          ? `${activeTheme.colors.accent}12`
                          : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">{option.title}</h3>
                          <p
                            className="mt-1 text-sm"
                            style={{
                              color: "var(--muted)",
                            }}
                          >
                            {option.description}
                          </p>
                        </div>

                        {active && (
                          <CheckCircle2
                            size={18}
                            style={{
                              color: activeTheme.colors.accent,
                            }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}

                {preferences.schedule.mode === "custom" && (
                  <div
                    className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <label className="space-y-2">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        Dark Start
                      </span>

                      <input
                        type="time"
                        value={preferences.schedule.start}
                        onChange={(event) =>
                          setPreferences((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              start: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </label>

                    <label className="space-y-2">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        Dark End
                      </span>

                      <input
                        type="time"
                        value={preferences.schedule.end}
                        onChange={(event) =>
                          setPreferences((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              end: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* SMART FEATURES */}

            <section
              className="rounded-[32px] border p-6 backdrop-blur-2xl"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <Sparkles size={20} />
                <h2 className="text-2xl font-bold">Smart Features</h2>
              </div>

              <div className="mt-6 space-y-4">
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-400" size={18} />
                    <span className="font-semibold">Cross Tab Sync</span>
                  </div>

                  <p
                    className="mt-2 text-sm"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Instantly syncs theme changes across all open tabs.
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Wand2 className="text-cyan-400" size={18} />
                    <span className="font-semibold">VIP Theme Engine</span>
                  </div>

                  <p
                    className="mt-2 text-sm"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Premium Aurora, Royal Gold and Emerald Glass themes are
                    included.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL */}

          <motion.div
            layout
            className="overflow-hidden rounded-[40px] border backdrop-blur-3xl"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="border-b px-8 py-5"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Live Preview</h2>

                <div
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: `${activeTheme.colors.accent}18`,
                    color: activeTheme.colors.accent,
                  }}
                >
                  {preferences.variant === "system"
                    ? "SYSTEM"
                    : isVipTheme(preferences.variant)
                      ? "VIP ACTIVE"
                      : "ACTIVE"}
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-8 xl:grid-cols-2">
              {/* DASHBOARD */}

              <div
                className="rounded-[28px] border p-6"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Analytics</h3>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      Adaptive UI
                    </p>
                  </div>

                  <div
                    className="rounded-xl px-4 py-2 text-sm font-semibold"
                    style={{
                      background: `${activeTheme.colors.accent}20`,
                      color: activeTheme.colors.accent,
                    }}
                  >
                    PRO
                  </div>
                </div>

                <div className="mt-10 flex h-44 items-end gap-3">
                  {[25, 70, 45, 110, 80, 120].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              height: 0,
                            }
                      }
                      animate={{
                        height,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      className="flex-1 rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to top, ${activeTheme.colors.accent}, ${activeTheme.colors.accent}60)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* COMPONENTS */}

              <div
                className="rounded-[28px] border p-6"
                style={{
                  background: `linear-gradient(to bottom right, ${activeTheme.colors.accent}12, transparent)`,
                  borderColor: "var(--border)",
                }}
              >
                <div className="space-y-5">
                  <button
                    type="button"
                    className="w-full rounded-2xl px-5 py-4 font-semibold transition hover:scale-[1.02]"
                    style={{
                      background: activeTheme.colors.accent,
                      color: activeTheme.id === "vip-royal" ? "#111827" : "#000",
                    }}
                  >
                    Primary Action
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl border px-5 py-4 font-semibold transition hover:scale-[1.02]"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    Secondary Action
                  </button>

                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--muted)",
                      }}
                    >
                      Current Theme
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{
                          background: activeTheme.colors.accent,
                        }}
                      />

                      <span className="font-semibold">{activeTheme.title}</span>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          color: "var(--muted)",
                        }}
                      >
                        Rendering
                      </span>

                      <Save size={18} />
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? false
                            : {
                                width: 0,
                              }
                        }
                        animate={{
                          width: "92%",
                        }}
                        className="h-full"
                        style={{
                          background: activeTheme.colors.accent,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">Schedule Status</p>
                        <p
                          className="mt-1 text-sm"
                          style={{
                            color: "var(--muted)",
                          }}
                        >
                          {preferences.schedule.mode === "disabled"
                            ? "Manual control is enabled."
                            : preferences.schedule.mode === "sunset"
                              ? "Sunset automation is running."
                              : `Custom: ${preferences.schedule.start} - ${preferences.schedule.end}`}
                        </p>
                      </div>

                      <Clock3
                        size={20}
                        style={{
                          color: activeTheme.colors.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}