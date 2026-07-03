"use client";

import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AudioLines,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Command,
  Cpu,
  Globe2,
  Languages,
  Loader2,
  Mic,
  MicOff,
  Orbit,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type VoiceStatus =
  | "Ready"
  | "Listening"
  | "Disabled"
  | "Processing";

interface VoiceCommand {
  id: string;
  command: string;
  language: string;
  accuracy: number;
  action: string;
  status: VoiceStatus;
  time: string;
}

/* =========================================================
   MOCK DATA
========================================================= */

const COMMANDS: VoiceCommand[] = [
  {
    id: "VC-1001",
    command: "Generate sales report",
    language: "EN",
    accuracy: 98,
    action: "Analytics",
    status: "Ready",
    time: "2 sec ago",
  },
  {
    id: "VC-1002",
    command: "ইনভেন্টরি রিপোর্ট দেখাও",
    language: "BN",
    accuracy: 96,
    action: "Warehouse",
    status: "Listening",
    time: "6 sec ago",
  },
  {
    id: "VC-1003",
    command: "Open HR dashboard",
    language: "EN",
    accuracy: 94,
    action: "HR",
    status: "Processing",
    time: "12 sec ago",
  },
  {
    id: "VC-1004",
    command: "Create finance summary",
    language: "EN",
    accuracy: 99,
    action: "Finance",
    status: "Ready",
    time: "20 sec ago",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function VoiceCommandAIPage() {
  const [search, setSearch] =
    useState("");

  const deferredSearch =
    useDeferredValue(search);

  const [mounted, setMounted] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCommands =
    useMemo(() => {
      return COMMANDS.filter(
        (item) =>
          item.command
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.language
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.action
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            )
      );
    }, [deferredSearch]);

  const analytics =
    useMemo(() => {
      return {
        recognition: "98.7%",
        latency: "0.4s",
        supported: "24+",
        active: "1.2K",
      };
    }, []);

  const handleVoice =
    useCallback(async () => {
      try {
        setListening(true);
        setProcessing(true);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              2200
            )
        );
      } finally {
        setListening(false);
        setProcessing(false);
      }
    }, []);

  const handleSync =
    useCallback(async () => {
      try {
        setLoading(true);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1600
            )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_24%)]" />

      <div className="relative mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[38px] border border-white/20 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex flex-col gap-10 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
                <Sparkles size={14} />
                AI Voice Infrastructure
              </div>

              <h1 className="bg-gradient-to-r from-slate-900 via-rose-600 to-fuchsia-600 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-rose-200 dark:to-fuchsia-300 md:text-5xl xl:text-6xl">
                Voice Command AI
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-base">
                Enterprise-grade AI voice recognition, realtime speech
                orchestration, multilingual command processing and
                futuristic automation workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Speech-to-Text",
                  "Realtime Commands",
                  "AI Actions",
                  "BN / EN Support",
                  "Voice Automation",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:w-[620px]">
              <StatsCard
                title="Recognition"
                value={
                  analytics.recognition
                }
                subtitle="Accuracy"
                icon={
                  <BrainCircuit
                    size={20}
                  />
                }
                color="rose"
              />

              <StatsCard
                title="Latency"
                value={
                  analytics.latency
                }
                subtitle="Realtime Engine"
                icon={
                  <Zap size={20} />
                }
                color="blue"
              />

              <StatsCard
                title="Languages"
                value={
                  analytics.supported
                }
                subtitle="Supported"
                icon={
                  <Languages
                    size={20}
                  />
                }
                color="emerald"
              />

              <StatsCard
                title="Voice Sessions"
                value={
                  analytics.active
                }
                subtitle="Active Usage"
                icon={
                  <Activity
                    size={20}
                  />
                }
                color="amber"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT */}

          <div className="space-y-8">
            {/* VOICE HUB */}

            <GlassCard>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300">
                    <Orbit size={14} />
                    Voice Intelligence
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Smart Voice Control Center
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    AI-powered voice recognition, autonomous command
                    execution, multilingual understanding and realtime
                    speech processing engine.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSync}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-rose-400 hover:bg-rose-50 hover:shadow-lg hover:shadow-rose-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:bg-rose-500/10"
                  >
                    {loading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Radar size={18} />
                    )}
                    Sync Engine
                  </button>

                  <button
                    onClick={handleVoice}
                    disabled={
                      processing
                    }
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processing ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Processing Voice...
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        Start Voice AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                <VoiceFeatureCard
                  title="Microphone"
                  value={
                    listening
                      ? "Listening"
                      : "Disabled"
                  }
                  icon={
                    listening ? (
                      <Mic
                        size={20}
                      />
                    ) : (
                      <MicOff
                        size={20}
                      />
                    )
                  }
                  active={listening}
                />

                <VoiceFeatureCard
                  title="Language"
                  value="EN / BN"
                  icon={
                    <Globe2
                      size={20}
                    />
                  }
                  active
                />

                <VoiceFeatureCard
                  title="Engine Status"
                  value={
                    processing
                      ? "Processing"
                      : "Realtime"
                  }
                  icon={
                    <Cpu size={20} />
                  }
                  active
                />
              </div>

              {(processing ||
                loading) && (
                <div className="mt-8 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600" />
                </div>
              )}
            </GlassCard>

            {/* COMMAND TABLE */}

            <GlassCard>
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Voice Command History
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Realtime AI speech activity & smart command analysis
                  </p>
                </div>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search voice commands..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-100/80 dark:bg-white/[0.04]">
                      <tr>
                        {[
                          "Command",
                          "Language",
                          "Accuracy",
                          "Action",
                          "Status",
                          "Time",
                        ].map((item) => (
                          <th
                            key={item}
                            className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {!mounted ? (
                        Array.from({
                          length: 4,
                        }).map(
                          (
                            _,
                            index
                          ) => (
                            <SkeletonRow
                              key={
                                index
                              }
                            />
                          )
                        )
                      ) : filteredCommands.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-20 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                                <Search
                                  size={
                                    28
                                  }
                                />
                              </div>

                              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                No Voice Data Found
                              </h3>

                              <p className="mt-2 text-sm text-slate-500">
                                Try another search keyword.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCommands.map(
                          (
                            item
                          ) => (
                            <tr
                              key={item.id}
                              className="border-t border-slate-200/70 transition-all duration-300 hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-start gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                                    <Volume2
                                      size={
                                        20
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white">
                                      {
                                        item.command
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        item.id
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {
                                  item.language
                                }
                              </td>

                              <td className="px-5 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-700 dark:text-rose-300">
                                  <Zap
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    item.accuracy
                                  }
                                  %
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                                {
                                  item.action
                                }
                              </td>

                              <td className="px-5 py-5">
                                <StatusBadge
                                  status={
                                    item.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-500 dark:text-slate-400">
                                {
                                  item.time
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT */}

          <div className="space-y-8">
            {/* INSIGHTS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Voice AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enterprise speech analytics
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
                  <AudioLines
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <InsightCard
                  title="Voice Accuracy"
                  value="98.7%"
                  subtitle="Realtime AI confidence"
                  icon={
                    <BrainCircuit
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Realtime Sessions"
                  value="1,204"
                  subtitle="Connected voice streams"
                  icon={
                    <Activity
                      size={18}
                    />
                  }
                />

                <InsightCard
                  title="Command Queue"
                  value="18 Pending"
                  subtitle="Background execution"
                  icon={
                    <Clock3
                      size={18}
                    />
                  }
                />
              </div>
            </GlassCard>

            {/* PIPELINE */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Voice Workflow
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    AI orchestration pipeline
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">
                  <Command
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title:
                      "Speech Recognition",
                    progress:
                      "100%",
                  },
                  {
                    title:
                      "Language Mapping",
                    progress:
                      "94%",
                  },
                  {
                    title:
                      "AI Intent Detection",
                    progress:
                      "88%",
                  },
                  {
                    title:
                      "Command Execution",
                    progress:
                      "76%",
                  },
                ].map((item) => (
                  <PipelineCard
                    key={
                      item.title
                    }
                    title={
                      item.title
                    }
                    progress={
                      item.progress
                    }
                  />
                ))}
              </div>
            </GlassCard>

            {/* FOOTER */}

            <GlassCard>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Enterprise Voice Ready
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Optimized for enterprise AI voice automation,
                    multilingual command orchestration, realtime speech
                    recognition and secure cloud-native workflows.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <FeatureTag
                      icon={
                        <Waves
                          size={14}
                        />
                      }
                      label="Realtime Audio"
                    />

                    <FeatureTag
                      icon={
                        <ShieldCheck
                          size={14}
                        />
                      }
                      label="Secure Voice"
                    />

                    <FeatureTag
                      icon={
                        <Sparkles
                          size={14}
                        />
                      }
                      label="AI Powered"
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
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-[32px] border border-slate-200/70 bg-white/70 p-5 shadow-[0_15px_60px_rgba(15,23,42,0.06)] backdrop-blur-3xl transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04] md:p-7">
        {children}
      </div>
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
      | "blue"
      | "emerald"
      | "amber";
  }) {
    const colors = {
      rose:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      blue:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      emerald:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      amber:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };

    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl hover:shadow-slate-200/40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-rose-500/10">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    );
  }
);

const VoiceFeatureCard = memo(
  function VoiceFeatureCard({
    title,
    value,
    icon,
    active,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    active?: boolean;
  }) {
    return (
      <div
        className={`rounded-3xl border p-5 transition-all duration-300 ${
          active
            ? "border-rose-500/20 bg-rose-500/10"
            : "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h4 className="mt-3 text-xl font-black text-slate-900 dark:text-white">
              {value}
            </h4>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-rose-700 dark:bg-white/10 dark:text-rose-300">
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

const InsightCard = memo(
  function InsightCard({
    title,
    value,
    subtitle,
    icon,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {title}
            </p>

            <h4 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
            {icon}
          </div>
        </div>
      </div>
    );
  }
);

const PipelineCard = memo(
  function PipelineCard({
    title,
    progress,
  }: {
    title: string;
    progress: string;
  }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {title}
          </p>

          <span className="text-xs font-black text-rose-700 dark:text-rose-300">
            {progress}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600"
            style={{
              width: progress,
            }}
          />
        </div>
      </div>
    );
  }
);

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: VoiceStatus;
  }) {
    const styles = {
      Ready:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      Listening:
        "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      Disabled:
        "border-slate-300/40 bg-slate-200/60 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300",
      Processing:
        "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${styles[status]}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {status}
      </span>
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
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {icon}
        {label}
      </div>
    );
  }
);

const SkeletonRow = memo(
  function SkeletonRow() {
    return (
      <tr className="border-t border-slate-200/70 dark:border-white/5">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <td
            key={index}
            className="px-5 py-5"
          >
            <div className="h-10 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          </td>
        ))}
      </tr>
    );
  }
);