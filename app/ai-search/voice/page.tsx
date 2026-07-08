"use client";

import React, {
  memo,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AudioWaveform,
  BrainCircuit,
  CheckCircle2,
  Command,
  Globe2,
  Languages,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
  Search,
  ArrowUpDown,
  Filter,
  Cpu,
  Radio,
  Clock3,
  BarChart3,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type MicStatus =
  | "Listening"
  | "Standby"
  | "Muted";

type SortKey =
  | "confidence"
  | "timestamp"
  | "language";

interface VoiceCommand {
  id: string;
  command: string;
  language: string;
  confidence: number;
  timestamp: string;
  status: "Processed" | "Queued";
}

interface Analytics {
  commands: number;
  accuracy: string;
  languages: string;
  latency: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const VOICE_HISTORY: VoiceCommand[] =
  [
    {
      id: "VC-1001",
      command:
        "Generate sales report",
      language: "EN",
      confidence: 98,
      timestamp: "2 min ago",
      status: "Processed",
    },
    {
      id: "VC-1002",
      command:
        "স্টাফ উপস্থিতি দেখাও",
      language: "BN",
      confidence: 96,
      timestamp: "10 min ago",
      status: "Processed",
    },
    {
      id: "VC-1003",
      command:
        "Open finance analytics",
      language: "EN",
      confidence: 91,
      timestamp: "18 min ago",
      status: "Queued",
    },
    {
      id: "VC-1004",
      command:
        "Launch inventory insights",
      language: "EN",
      confidence: 95,
      timestamp: "22 min ago",
      status: "Processed",
    },
    {
      id: "VC-1005",
      command:
        "ক্যাশ ফ্লো রিপোর্ট চালু করো",
      language: "BN",
      confidence: 93,
      timestamp: "32 min ago",
      status: "Processed",
    },
  ];

/* =========================================================
   LAZY
========================================================= */

const EnterpriseInsights =
  lazy(async () => ({
    default:
      function EnterpriseInsights() {
        return (
          <GlassCard className="overflow-hidden">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                  <Cpu size={14} />
                  Predictive AI Layer
                </div>

                <h3 className="mt-5 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
                  Autonomous Voice Workflow Intelligence
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Context-aware AI orchestration engine with enterprise-grade voice routing,
                  predictive intent recognition and low-latency neural processing.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label:
                        "Realtime Stream",
                      value:
                        "99.2%",
                    },
                    {
                      label:
                        "AI Intent Match",
                      value:
                        "97.8%",
                    },
                    {
                      label:
                        "Command Sync",
                      value:
                        "0.3s",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>

                      <h4 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                        {item.value}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
          
                    title:
                      "Neural Voice",
                    value:
                      "Enabled",
                  },
                  {
                    icon:
                      <Radio size={20} />,
                    title:
                      "Live Stream",
                    value:
                      "Online",
                  },
                  {
                    icon:
                      <ShieldCheck size={20} />,
                    title:
                      "Security",
                    value:
                      "Protected",
                  },
                  {
                    icon:
                      <BarChart3 size={20} />,
                    title:
                      "Analytics",
                    value:
                      "Realtime",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-5 transition-all duration-300 hover:-translate-y-[3px] dark:from-white/[0.06] dark:to-white/[0.02]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                      {item.icon}
                    </div>

                    <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      {item.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <h4 className="text-lg font-black text-white">
                        {item.value}
                      </h4>

                      <ChevronRight
                        size={16}
                        className="text-slate-500 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        );
      },
  }));

/* =========================================================
   PAGE
========================================================= */

export default function VoiceSearchPage() {
  const [mounted, setMounted] =
    useState(false);

  const [micStatus, setMicStatus] =
    useState<MicStatus>(
      "Standby"
    );

  const [listening, setListening] =
    useState(false);

  const [pulse, setPulse] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | "Processed" | "Queued"
    >("All");

  const [sortBy, setSortBy] =
    useState<SortKey>(
      "confidence"
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer:
      | NodeJS.Timeout
      | undefined;

    if (listening) {
      timer = setInterval(() => {
        setPulse((prev) => !prev);
      }, 900);
    }

    return () => {
      if (timer)
        clearInterval(timer);
    };
  }, [listening]);

  const analytics: Analytics =
    useMemo(() => {
      return {
        commands:
          VOICE_HISTORY.length,
        accuracy: "97.8%",
        languages: "12+",
        latency: "0.3s",
      };
    }, []);

  const toggleListening =
    useCallback(() => {
      setListening((prev) => {
        const next = !prev;

        setMicStatus(
          next
            ? "Listening"
            : "Standby"
        );

        return next;
      });
    }, []);

  const filteredHistory =
    useMemo(() => {
      const normalized =
        search.toLowerCase();

      const filtered =
        VOICE_HISTORY.filter(
          (item) => {
            const matchesSearch =
              item.command
                .toLowerCase()
                .includes(
                  normalized
                ) ||
              item.id
                .toLowerCase()
                .includes(
                  normalized
                );

            const matchesStatus =
              statusFilter ===
                "All" ||
              item.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );

      return filtered.sort(
        (a, b) => {
          switch (sortBy) {
            case "confidence":
              return (
                b.confidence -
                a.confidence
              );

            case "language":
              return a.language.localeCompare(
                b.language
              );

            default:
              return a.timestamp.localeCompare(
                b.timestamp
              );
          }
        }
      );
    }, [
      search,
      statusFilter,
      sortBy,
    ]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_20%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.16),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_20%),#020617] dark:text-white">

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[40px] border border-white/20 bg-white/70 shadow-[0_30px_120px_rgba(15,23,42,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_26%)]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between xl:p-10">

            {/* LEFT */}

            <div className="max-w-4xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-rose-700 shadow-sm dark:text-rose-300">
                <Sparkles size={14} />
                Enterprise Voice AI
              </div>

              <h1 className="mt-6 bg-gradient-to-r from-slate-900 via-rose-700 to-fuchsia-700 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-rose-200 dark:to-fuchsia-300 md:text-6xl">
                Voice Search Control Center
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-400 md:text-base">
                AI-powered multilingual voice recognition platform with realtime
                enterprise command orchestration, predictive workflow automation,
                neural speech processing and intelligent business interaction engine.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Speech AI",
                  "Realtime STT",
                  "Voice Automation",
                  "Predictive Routing",
                  "Enterprise Security",
                ].map((item) => (
                  <button
                    key={item}
                    className="group rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-rose-400 hover:bg-rose-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/10"
                  >
                    <span className="transition-opacity duration-300 group-hover:opacity-90">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid w-full gap-4 sm:grid-cols-2 xl:max-w-[620px]">

              <StatsCard
                title="Commands"
                value={String(
                  analytics.commands
                )}
                subtitle="Processed"
                icon={
                  <Command
                    size={20}
                  />
                }
                color="rose"
              />

              <StatsCard
                title="Accuracy"
                value={
                  analytics.accuracy
                }
                subtitle="Recognition"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="cyan"
              />

              <StatsCard
                title="Languages"
                value={
                  analytics.languages
                }
                subtitle="Supported"
                icon={
                  <Languages
                    size={20}
                  />
                }
                color="violet"
              />

              <StatsCard
                title="Latency"
                value={
                  analytics.latency
                }
                subtitle="Realtime"
                icon={
                  <Zap size={20} />
                }
                color="emerald"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 2xl:grid-cols-[1.2fr_0.8fr]">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">

            {/* VOICE ENGINE */}

            <GlassCard>

              <div className="flex flex-col items-center justify-center text-center">

                <div
                  className={`relative flex h-56 w-56 items-center justify-center rounded-full border transition-all duration-500 ${
                    listening
                      ? "border-rose-400 bg-rose-500/10 shadow-[0_0_120px_rgba(244,63,94,0.35)]"
                      : "border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]"
                  }`}
                >

                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-700 ${
                      pulse &&
                      listening
                        ? "scale-110 border border-rose-400/30"
                        : "scale-100"
                    }`}
                  />

                  <div
                    className={`absolute inset-4 rounded-full ${
                      listening
                        ? "animate-ping bg-rose-500/10"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle voice listening"
                    onClick={
                      toggleListening
                    }
                    className={`relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${
                      listening
                        ? "bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-[0_20px_60px_rgba(244,63,94,0.40)]"
                        : "bg-white text-slate-700 shadow-lg dark:bg-white/[0.06] dark:text-slate-200"
                    }`}
                  >
                    {listening ? (
                      <Mic
                        size={44}
                      />
                    ) : (
                      <MicOff
                        size={44}
                      />
                    )}
                  </button>
                </div>

                <div className="mt-8">

                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] ${
                      micStatus ===
                      "Listening"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-300 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    }`}
                  >
                    <Activity
                      size={14}
                    />
                    {micStatus}
                  </div>

                  <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
                    AI Voice Interaction Engine
                  </h2>

                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Context-aware enterprise speech recognition powered by neural
                    AI orchestration and scalable realtime automation workflow.
                  </p>
                </div>

                {/* WAVE */}

                <div className="mt-10 flex items-end gap-2">
                  {Array.from({
                    length: 28,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 rounded-full bg-gradient-to-t from-rose-500 via-pink-500 to-fuchsia-400 transition-all duration-500 ${
                        listening
                          ? "animate-pulse opacity-100"
                          : "opacity-30"
                      }`}
                      style={{
                        height: `${
                          listening
                            ? 20 +
                              ((index % 7) +
                                1) *
                                10
                            : 16
                        }px`,
                        animationDelay: `${index * 60}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
                  {[
                    {
                      title:
                        "Realtime Audio",
                      value:
                        "Streaming",
                      icon:
                        <AudioWaveform size={18} />,
                    },
                    {
                      title:
                        "AI Pipeline",
                      value:
                        "Synced",
                      icon:
                        <Cpu size={18} />,
                    },
                    {
                      title:
                        "Neural Latency",
                      value:
                        "0.3s",
                      icon:
                        <Clock3 size={18} />,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 text-left transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                        {item.icon}
                      </div>

                      <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        {item.title}
                      </p>

                      <h4 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                        {item.value}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* HISTORY */}

            <GlassCard>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Voice Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Realtime voice command analytics & processing history
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search command..."
                      className="h-12 rounded-2xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm font-medium outline-none transition-all duration-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-1 dark:border-white/10 dark:bg-white/[0.04]">

                    {[
                      "All",
                      "Processed",
                      "Queued",
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          setStatusFilter(
                            item as
                              | "All"
                              | "Processed"
                              | "Queued"
                          )
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          statusFilter ===
                          item
                            ? "bg-rose-500 text-white shadow-lg"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setSortBy(
                        (
                          prev
                        ) => {
                          if (
                            prev ===
                            "confidence"
                          )
                            return "language";

                          if (
                            prev ===
                            "language"
                          )
                            return "timestamp";

                          return "confidence";
                        }
                      )
                    }
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-rose-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    <ArrowUpDown
                      size={16}
                    />
                    Sort
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">

                {!mounted
                  ? Array.from({
                      length: 5,
                    }).map(
                      (
                        _,
                        index
                      ) => (
                        <SkeletonCard
                          key={index}
                        />
                      )
                    )
                  : filteredHistory.map(
                      (item) => (
                        <VoiceHistoryCard
                          key={item.id}
                          item={item}
                        />
                      )
                    )}
              </div>
            </GlassCard>

            <Suspense
              fallback={
                <GlassCard>
                  <div className="space-y-4">
                    <div className="h-8 w-1/3 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
                    <div className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
                  </div>
                </GlassCard>
              }
            >
              <EnterpriseInsights />
            </Suspense>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="space-y-8">

            <FeatureCard
              title="Realtime Speech AI"
              value="Active"
              icon={
                <AudioWaveform
                  size={22}
                />
              }
              description="Enterprise-grade realtime speech recognition with predictive context awareness."
              color="rose"
            />

            <FeatureCard
              title="Global Language Engine"
              value="12+ Languages"
              icon={
                <Globe2
                  size={22}
                />
              }
              description="Advanced multilingual support with optimized Bangla and English voice understanding."
              color="cyan"
            />

            <FeatureCard
              title="Secure Voice Processing"
              value="Protected"
              icon={
                <ShieldCheck
                  size={22}
                />
              }
              description="Encrypted enterprise voice processing pipeline with AI validation layer."
              color="emerald"
            />

            <GlassCard>

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <Volume2
                    size={24}
                  />
                </div>

                <div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Audio Pipeline
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Optimized enterprise voice workflow architecture with realtime
                    orchestration, AI speech analysis and scalable automation pipeline.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <FeatureTag
                      icon={
                        <Sparkles
                          size={14}
                        />
                      }
                      label="Realtime AI"
                    />

                    <FeatureTag
                      icon={
                        <CheckCircle2
                          size={14}
                        />
                      }
                      label="Secure Voice"
                    />

                    <FeatureTag
                      icon={
                        <Zap
                          size={14}
                        />
                      }
                      label="Low Latency"
                    />

                    <FeatureTag
                      icon={
                        <Filter
                          size={14}
                        />
                      }
                      label="AI Routing"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

const GlassCard = memo(
  function GlassCard({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <section
        className={`rounded-[32px] border border-white/20 bg-white/70 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] md:p-7 ${className}`}
      >
        {children}
      </section>
    );
  }
);

const StatsCard = memo(
  function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color:
      | "rose"
      | "cyan"
      | "violet"
      | "emerald";
  }) {
    const colors = {
      rose:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      cyan:
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      violet:
        "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
      emerald:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };

    return (
      <div className="group relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl" />

        <div
          className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>

        <p className="mt-2 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    );
  }
);

const VoiceHistoryCard = memo(
  function VoiceHistoryCard({
    item,
  }: {
    item: VoiceCommand;
  }) {
    return (
      <div className="group rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 text-rose-700 dark:text-rose-300">
              <Mic size={22} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {item.command}
                </h3>

                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                  {item.language}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {item.id} •{" "}
                {item.timestamp}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-700 dark:text-violet-300">
              <Zap size={12} />
              {item.confidence}%
            </div>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                item.status ===
                "Processed"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {item.status}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

const FeatureCard = memo(
  function FeatureCard({
    title,
    value,
    icon,
    description,
    color,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
    color:
      | "rose"
      | "cyan"
      | "emerald";
  }) {
    const colors = {
      rose:
        "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      cyan:
        "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      emerald:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };

    return (
      <div className="group rounded-[30px] border border-white/20 bg-white/70 p-6 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_25px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              {title}
            </p>

            <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-3xl ${colors[color]}`}
          >
            {icon}
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    );
  }
);

const FeatureTag = memo(
  function FeatureTag({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition-all duration-300 hover:-translate-y-[1px] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {icon}
        {label}
      </div>
    );
  }
);

const SkeletonCard = memo(
  function SkeletonCard() {
    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04]">

        <div className="h-6 w-1/2 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-4 h-4 w-1/3 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />

        <div className="mt-6 flex gap-3">
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />

          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }
);