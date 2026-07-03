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
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Command,
  Globe2,
  Languages,
  Loader2,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2,
  Wifi,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type StatusType =
  | "Live"
  | "Beta"
  | "Processing"
  | "Offline";

interface LanguageModel {
  id: number;
  language: string;
  code: string;
  aiModel: string;
  latency: string;
  accuracy: string;
  region: string;
  status: StatusType;
}

/* =========================================================
   CONSTANTS
========================================================= */

const LANGUAGE_MODELS: LanguageModel[] = [
  {
    id: 1,
    language: "বাংলা",
    code: "BN",
    aiModel: "Neural AI v6",
    latency: "32ms",
    accuracy: "99.1%",
    region: "Bangladesh",
    status: "Live",
  },
  {
    id: 2,
    language: "English",
    code: "EN",
    aiModel: "GPT Translation Core",
    latency: "28ms",
    accuracy: "99.7%",
    region: "Global",
    status: "Live",
  },
  {
    id: 3,
    language: "Arabic",
    code: "AR",
    aiModel: "Semantic AI",
    latency: "41ms",
    accuracy: "98.8%",
    region: "Middle East",
    status: "Beta",
  },
  {
    id: 4,
    language: "Hindi",
    code: "HI",
    aiModel: "Voice Neural Engine",
    latency: "36ms",
    accuracy: "98.2%",
    region: "India",
    status: "Processing",
  },
  {
    id: 5,
    language: "Japanese",
    code: "JP",
    aiModel: "Context AI Pro",
    latency: "47ms",
    accuracy: "97.9%",
    region: "Japan",
    status: "Live",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getStatusStyle = (
  status: StatusType
): string => {
  switch (status) {
    case "Live":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
    case "Beta":
      return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    case "Processing":
      return "bg-blue-500/15 text-blue-300 border-blue-500/20";
    default:
      return "bg-red-500/15 text-red-300 border-red-500/20";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function MultiLanguageAIPage() {
  const [search, setSearch] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(true);

  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("বাংলা");

  const deferredSearch =
    useDeferredValue(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () =>
      clearTimeout(timer);
  }, []);

  const filteredLanguages =
    useMemo(() => {
      return LANGUAGE_MODELS.filter(
        (item) =>
          item.language
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.code
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            ) ||
          item.region
            .toLowerCase()
            .includes(
              deferredSearch.toLowerCase()
            )
      );
    }, [deferredSearch]);

  const totalLanguages =
    LANGUAGE_MODELS.length;

  const activeLanguages =
    LANGUAGE_MODELS.filter(
      (item) => item.status === "Live"
    ).length;

  const avgAccuracy = "98.7%";

  const realtimeLatency = "31ms";

  const handleSelectLanguage =
    useCallback((language: string) => {
      setSelectedLanguage(language);
    }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%),#020617] text-slate-100">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />

          <div className="relative grid gap-10 p-6 md:p-8 xl:grid-cols-[1fr_480px] xl:p-10">
            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-indigo-300">
                <ShieldCheck size={14} />
                Enterprise AI Translation Hub
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                Multi-language AI
                Intelligence
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-400 md:text-base">
                Real-time multilingual AI
                translation, enterprise
                localization pipeline, neural
                voice processing, contextual
                semantic analysis and global
                communication infrastructure
                optimized for modern SaaS
                ecosystems.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Real-time Translation",
                  "Voice AI",
                  "Localization Engine",
                  "Neural Context",
                  "Enterprise API",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* LIVE INPUT */}

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search language, region or code..."
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400"
                    />
                  </div>

                  <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-6 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01]">
                    <Wand2 size={18} />
                    AI Translate
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Languages"
                value={String(
                  totalLanguages
                )}
                subtitle="Connected"
                icon={
                  <Languages size={20} />
                }
                accent="indigo"
              />

              <MetricCard
                title="AI Accuracy"
                value={avgAccuracy}
                subtitle="Semantic Match"
                icon={
                  <Sparkles size={20} />
                }
                accent="emerald"
              />

              <MetricCard
                title="Latency"
                value={realtimeLatency}
                subtitle="Realtime Engine"
                icon={<Zap size={20} />}
                accent="cyan"
              />

              <MetricCard
                title="Active"
                value={String(
                  activeLanguages
                )}
                subtitle="Live Nodes"
                icon={
                  <Activity size={20} />
                }
                accent="violet"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            BODY
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">
            {/* TABLE */}

            <GlassCard>
              <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Global Language Network
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI-driven multilingual
                    infrastructure overview
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  <Wifi size={14} />
                  Realtime Connected
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-white/[0.04]">
                      <tr>
                        {[
                          "Language",
                          "Code",
                          "AI Model",
                          "Latency",
                          "Accuracy",
                          "Region",
                          "Status",
                        ].map((item) => (
                          <th
                            key={item}
                            className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        Array.from({
                          length: 5,
                        }).map((_, i) => (
                          <tr
                            key={i}
                            className="border-t border-white/5"
                          >
                            {Array.from({
                              length: 7,
                            }).map(
                              (
                                __,
                                idx
                              ) => (
                                <td
                                  key={
                                    idx
                                  }
                                  className="px-5 py-5"
                                >
                                  <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                                </td>
                              )
                            )}
                          </tr>
                        ))
                      ) : filteredLanguages.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <Search className="mb-4 text-slate-500" />

                              <p className="text-sm text-slate-400">
                                No language
                                found
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredLanguages.map(
                          (item) => (
                            <tr
                              key={item.id}
                              onClick={() =>
                                handleSelectLanguage(
                                  item.language
                                )
                              }
                              className="cursor-pointer border-t border-white/5 transition-all duration-300 hover:bg-white/[0.04]"
                            >
                              <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                                    <Globe2
                                      size={
                                        18
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-white">
                                      {
                                        item.language
                                      }
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      Neural
                                      Translation
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5 text-sm font-bold text-slate-300">
                                {item.code}
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.aiModel
                                }
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.latency
                                }
                              </td>

                              <td className="px-5 py-5 text-sm font-semibold text-emerald-300">
                                {
                                  item.accuracy
                                }
                              </td>

                              <td className="px-5 py-5 text-sm text-slate-300">
                                {
                                  item.region
                                }
                              </td>

                              <td className="px-5 py-5">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                                    item.status
                                  )}`}
                                >
                                  {
                                    item.status
                                  }
                                </span>
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

            {/* FEATURES */}

            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title:
                    "Realtime AI Translation",
                  desc: "Ultra low latency neural translation engine with semantic context awareness.",
                  icon: (
                    <BrainCircuit
                      size={20}
                    />
                  ),
                },
                {
                  title:
                    "Voice Recognition",
                  desc: "Speech-to-text and multilingual voice understanding pipeline.",
                  icon: (
                    <Mic size={20} />
                  ),
                },
                {
                  title:
                    "Localization API",
                  desc: "Enterprise-ready localization orchestration and SaaS deployment.",
                  icon: (
                    <Command
                      size={20}
                    />
                  ),
                },
                {
                  title:
                    "Context Intelligence",
                  desc: "AI contextual understanding with business-grade language processing.",
                  icon: (
                    <Sparkles
                      size={20}
                    />
                  ),
                },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  title={item.title}
                  description={
                    item.desc
                  }
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="space-y-8">
            {/* STATUS */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Runtime
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    System orchestration &
                    intelligent routing
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <RuntimeItem
                  title="Neural Processing"
                  value="Operational"
                  progress="96%"
                />

                <RuntimeItem
                  title="Voice Pipeline"
                  value="Connected"
                  progress="88%"
                />

                <RuntimeItem
                  title="Global Edge Nodes"
                  value="Synchronized"
                  progress="92%"
                />

                <RuntimeItem
                  title="Security Layer"
                  value="Protected"
                  progress="99%"
                />
              </div>
            </GlassCard>

            {/* CURRENT */}

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Active Language
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Current runtime selection
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Languages size={24} />
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-2xl shadow-indigo-500/20">
                    <Globe2 size={28} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {selectedLanguage}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Enterprise AI Language
                      Runtime
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  {[
                    "Realtime Semantic Analysis",
                    "Voice Intelligence Enabled",
                    "Neural Translation Active",
                    "Localization Pipeline Ready",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-emerald-300"
                      />

                      <p className="text-sm text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* STATUS GRID */}

            <div className="grid gap-4 sm:grid-cols-2">
              <MiniStatusCard
                title="Global Nodes"
                value="24"
                icon={
                  <Globe2 size={18} />
                }
              />

              <MiniStatusCard
                title="AI Requests"
                value="1.2M"
                icon={<Zap size={18} />}
              />

              <MiniStatusCard
                title="Uptime"
                value="99.99%"
                icon={
                  <Clock3 size={18} />
                }
              />

              <MiniStatusCard
                title="Security"
                value="Active"
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
              />
            </div>
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
  ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-7">
        {children}
      </div>
    );
  }
);

GlassCard.displayName =
  "GlassCard";

const MetricCard = memo(
  ({
    title,
    value,
    subtitle,
    icon,
    accent,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    accent:
      | "indigo"
      | "emerald"
      | "cyan"
      | "violet";
  }) => {
    const accents = {
      indigo:
        "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
      emerald:
        "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      cyan:
        "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
      violet:
        "bg-violet-500/10 border-violet-500/20 text-violet-300",
    };

    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${accents[accent]}`}
        >
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-black text-white">
          {value}
        </h3>

        <p className="mt-2 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    );
  }
);

MetricCard.displayName =
  "MetricCard";

const FeatureCard = memo(
  ({
    title,
    description,
    icon,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300 transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>

        <h3 className="text-lg font-black text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {description}
        </p>
      </div>
    );
  }
);

FeatureCard.displayName =
  "FeatureCard";

const RuntimeItem = memo(
  ({
    title,
    value,
    progress,
  }: {
    title: string;
    value: string;
    progress: string;
  }) => {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">
              {title}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {value}
            </p>
          </div>

          <span className="text-xs font-bold text-cyan-300">
            {progress}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            style={{
              width: progress,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400"
          />
        </div>
      </div>
    );
  }
);

RuntimeItem.displayName =
  "RuntimeItem";

const MiniStatusCard = memo(
  ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>

        <h4 className="mt-3 text-2xl font-black text-white">
          {value}
        </h4>
      </div>
    );
  }
);

MiniStatusCard.displayName =
  "MiniStatusCard";