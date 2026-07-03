"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type AIStatus =
  | "Online"
  | "Processing"
  | "Optimized";

type Activity = {
  id: string;
  title: string;
  time: string;
  status: AIStatus;
};

const activities: Activity[] = [
  {
    id: "AI-1001",
    title: "বাংলা attendance রিপোর্ট জেনারেট হয়েছে",
    time: "2s ago",
    status: "Online",
  },
  {
    id: "AI-1002",
    title: "Employee insight analysis completed",
    time: "8m ago",
    status: "Processing",
  },
  {
    id: "AI-1003",
    title: "AI workflow optimized successfully",
    time: "16m ago",
    status: "Optimized",
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<AIStatus, string> = {
  Online:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Processing:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Optimized:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
};

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={cn(
        "h-36 rounded-[30px] border border-white/10 bg-white/[0.03]",
        shimmer
      )}
    />
  );
});

const StatCard = memo(function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[30px]",
        "border border-white/10 bg-white/[0.04]",
        "backdrop-blur-2xl transition-all duration-500",
        "hover:-translate-y-1 hover:border-cyan-400/20"
      )}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_42%)]" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">
              {title}
            </div>

            <div className="mt-3 text-3xl font-black tracking-tight text-white">
              {value}
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              {sub}
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            ✦
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Home() {
  const [mounted, setMounted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [reply, setReply] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  const metrics = useMemo(
    () => [
      {
        title: "AI Requests",
        value: "48.2K",
        sub: "Realtime intelligent operations",
      },
      {
        title: "AI Response Rate",
        value: "99.8%",
        sub: "Ultra-low latency processing",
      },
      {
        title: "Automation Pipelines",
        value: "126",
        sub: "Enterprise workflow orchestration",
      },
      {
        title: "বাংলা AI Accuracy",
        value: "96.4%",
        sub: "Multilingual AI optimization",
      },
    ],
    []
  );

  const testAI = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setReply("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          message:
            "বাংলায় attendance রিপোর্ট লিখো",
        }),
      });

      if (!res.ok) {
        const text = await res.text();

        throw new Error(
          `Request failed: ${res.status} - ${text}`
        );
      }

      const data =
        (await res.json()) as {
          reply: string;
        };

      setReply(data.reply);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ??
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1900px]">
          <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_38%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI ERP Intelligence Core Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Welcome to AWM ERP
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Advanced AI-powered enterprise
                  management platform with realtime
                  multilingual intelligence,
                  autonomous workflow orchestration,
                  predictive analytics, and scalable
                  business automation infrastructure.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={testAI}
                    disabled={loading}
                    className={cn(
                      "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-6 py-3 text-sm font-bold text-cyan-300 transition-all duration-300",
                      "hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/20",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
                      loading &&
                        "cursor-not-allowed opacity-70"
                    )}
                  >
                    <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_42%)]" />

                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                          Processing AI Request...
                        </>
                      ) : (
                        <>
                          ✦ Test AI Assistant
                        </>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Open Dashboard
                  </button>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:max-w-xl">
                {!mounted ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <StatCard
                      title="AI Uptime"
                      value="99.99%"
                      sub="Enterprise-grade availability"
                    />

                    <StatCard
                      title="Realtime Requests"
                      value="12.8K"
                      sub="Secure AI orchestration"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {mounted ? (
              metrics.map((item) => (
                <StatCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  sub={item.sub}
                />
              ))
            ) : (
              Array.from({ length: 4 }).map(
                (_, idx) => (
                  <SkeletonCard key={idx} />
                )
              )
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Command Center
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Multilingual enterprise AI
                    execution layer
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE AI
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#0b1220]/70 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      AI Request Endpoint
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      /api/chat
                    </div>
                  </div>

                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    SECURE
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    Request Payload
                  </div>

                  <div className="mt-3 rounded-xl border border-cyan-400/10 bg-black/20 p-4 font-mono text-sm text-cyan-300">
                    {`{ "message": "বাংলায় attendance রিপোর্ট লিখো" }`}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      AI Response
                    </div>

                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-cyan-300">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                        Processing
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "min-h-[140px] rounded-xl border border-white/10 bg-[#050816]/70 p-4 text-sm leading-7 text-zinc-300 transition-all duration-300",
                      !reply &&
                        !loading &&
                        "flex items-center justify-center text-zinc-500"
                    )}
                  >
                    {loading ? (
                      <div
                        className={cn(
                          "h-full w-full rounded-xl bg-white/[0.03]",
                          shimmer
                        )}
                      />
                    ) : error ? (
                      <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300">
                        {error}
                      </div>
                    ) : reply ? (
                      <div className="whitespace-pre-wrap">
                        {reply}
                      </div>
                    ) : (
                      "বাংলা AI response এখানে দেখাবে।"
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Activities
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Realtime intelligence monitoring
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  SYNCED
                </div>
              </div>

              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group rounded-[26px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />

                        <div>
                          <div className="text-sm font-medium text-zinc-200">
                            {activity.title}
                          </div>

                          <div className="mt-2 text-xs text-zinc-500">
                            {activity.id} •{" "}
                            {activity.time}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                          statusStyles[
                            activity.status
                          ]
                        )}
                      >
                        {activity.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-dashed border-cyan-400/20 bg-cyan-500/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      AI Workflow Engine
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      Autonomous orchestration active
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </section>
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
              255,
              255,
              255,
              0.12
            )
            transparent;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(
            255,
            255,
            255,
            0.12
          );
          border-radius: 999px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}