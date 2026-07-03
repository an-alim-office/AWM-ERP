"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type AssistantStatus = "Online" | "Learning" | "Escalated";

type LeadPriority = "High" | "Medium" | "Low";

type Conversation = {
  id: string;
  customer: string;
  company: string;
  intent: string;
  sentiment: "Positive" | "Neutral" | "Risk";
  status: AssistantStatus;
  responseTime: string;
  revenue: number;
  aiScore: number;
  priority: LeadPriority;
};

const conversationsSeed: Conversation[] = [
  {
    id: "AI-2041",
    customer: "Sarah Khan",
    company: "Vertex Logistics",
    intent: "Pricing Negotiation",
    sentiment: "Positive",
    status: "Online",
    responseTime: "12s",
    revenue: 18200,
    aiScore: 96,
    priority: "High",
  },
  {
    id: "AI-2042",
    customer: "Daniel Lee",
    company: "Nova Commerce",
    intent: "Enterprise Demo",
    sentiment: "Neutral",
    status: "Learning",
    responseTime: "26s",
    revenue: 9600,
    aiScore: 88,
    priority: "Medium",
  },
  {
    id: "AI-2043",
    customer: "Maria Silva",
    company: "Pulse Retail",
    intent: "Renewal Recovery",
    sentiment: "Risk",
    status: "Escalated",
    responseTime: "41s",
    revenue: 4200,
    aiScore: 72,
    priority: "High",
  },
  {
    id: "AI-2044",
    customer: "Ahmed Rahman",
    company: "FinEdge",
    intent: "Upsell Opportunity",
    sentiment: "Positive",
    status: "Online",
    responseTime: "08s",
    revenue: 24100,
    aiScore: 98,
    priority: "High",
  },
  {
    id: "AI-2045",
    customer: "Emily Carter",
    company: "CloudNexus",
    intent: "Support Follow-up",
    sentiment: "Neutral",
    status: "Learning",
    responseTime: "19s",
    revenue: 6700,
    aiScore: 84,
    priority: "Low",
  },
];

const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.4s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<AssistantStatus, string> = {
  Online:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Learning:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Escalated:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

const priorityStyles: Record<LeadPriority, string> = {
  High: "text-rose-300",
  Medium: "text-amber-300",
  Low: "text-emerald-300",
};

const sentimentStyles: Record<
  Conversation["sentiment"],
  string
> = {
  Positive: "text-emerald-300",
  Neutral: "text-yellow-300",
  Risk: "text-rose-300",
};

const recommendations = [
  "AI identified high-conversion enterprise leads from realtime behavioral analysis.",
  "Upsell probability increased by 18.4% after automated workflow engagement.",
  "Sales assistant detected churn-risk customers requiring immediate intervention.",
  "Conversation sentiment engine predicts stronger retention within APAC region.",
];

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={cn(
        "h-36 rounded-[28px] border border-white/10 bg-white/[0.03]",
        shimmer
      )}
    />
  );
});

const MetricCard = memo(function MetricCard({
  title,
  value,
  sub,
  glow,
}: {
  title: string;
  value: string;
  sub: string;
  glow?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[30px]",
        "border border-white/10 bg-white/[0.04]",
        "backdrop-blur-2xl transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-cyan-400/20",
        "shadow-[0_15px_60px_-18px_rgba(0,0,0,0.8)]"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          glow ??
            "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_38%)]"
        )}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-400">{title}</p>

            <div className="mt-4 text-3xl font-black tracking-tight text-white">
              {value}
            </div>

            <p className="mt-2 text-xs text-zinc-500">{sub}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            ✦
          </div>
        </div>
      </div>
    </div>
  );
});

const LiveActivity = memo(function LiveActivity({
  title,
  time,
}: {
  title: string;
  time: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_40%)]" />

      <div className="relative flex items-start gap-4">
        <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.85)]" />

        <div className="flex-1">
          <p className="text-sm leading-7 text-zinc-200">{title}</p>

          <div className="mt-2 text-xs text-zinc-500">{time}</div>
        </div>
      </div>
    </div>
  );
});

const ConversationRow = memo(function ConversationRow({
  item,
}: {
  item: Conversation;
}) {
  return (
    <tr className="group border-t border-white/[0.05] transition-all duration-300 hover:bg-white/[0.03]">
      <td className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-sm font-bold text-cyan-300">
            AI
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">
              {item.customer}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>{item.company}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>{item.id}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="hidden px-5 py-5 text-sm text-zinc-300 xl:table-cell">
        {item.intent}
      </td>

      <td className="px-5 py-5">
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
            statusStyles[item.status]
          )}
        >
          {item.status}
        </span>
      </td>

      <td className="hidden px-5 py-5 md:table-cell">
        <span
          className={cn(
            "text-sm font-semibold",
            sentimentStyles[item.sentiment]
          )}
        >
          {item.sentiment}
        </span>
      </td>

      <td className="hidden px-5 py-5 lg:table-cell">
        <div className="flex items-center gap-3">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
              style={{
                width: `${item.aiScore}%`,
              }}
            />
          </div>

          <span className="text-sm font-semibold text-zinc-200">
            {item.aiScore}%
          </span>
        </div>
      </td>

      <td className="hidden px-5 py-5 xl:table-cell">
        <div className="text-sm font-semibold text-emerald-300">
          ${item.revenue.toLocaleString()}
        </div>
      </td>

      <td className="px-5 py-5">
        <div
          className={cn(
            "text-sm font-bold",
            priorityStyles[item.priority]
          )}
        >
          {item.priority}
        </div>
      </td>
    </tr>
  );
});

export default function AISalesAssistantPage() {
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | AssistantStatus
  >("All");

  const [sortBy, setSortBy] = useState<
    "aiScore" | "revenue"
  >("aiScore");

  const [viewMode, setViewMode] = useState<"table" | "grid">(
    "table"
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    const timer = window.setTimeout(() => {
      setRefreshing(false);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = conversationsSeed.reduce(
      (acc, item) => acc + item.revenue,
      0
    );

    const avgAI =
      conversationsSeed.reduce(
        (acc, item) => acc + item.aiScore,
        0
      ) / conversationsSeed.length;

    const active = conversationsSeed.filter(
      (item) => item.status === "Online"
    ).length;

    return {
      totalRevenue,
      avgAI: Math.round(avgAI),
      active,
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const normalized = query.toLowerCase();

    return conversationsSeed
      .filter((item) => {
        const searchable = [
          item.customer,
          item.company,
          item.intent,
          item.id,
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = searchable.includes(normalized);

        const matchesStatus =
          statusFilter === "All" ||
          item.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [query, statusFilter, sortBy]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_34%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  Autonomous Sales Intelligence Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  AI Sales Assistant
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise-grade conversational AI for sales automation,
                  realtime customer intelligence, autonomous engagement,
                  predictive lead scoring, and smart revenue optimization.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Launch AI Session
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    {refreshing ? "Syncing..." : "Realtime Sync"}
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
                    <MetricCard
                      title="AI Conversations"
                      value="24,892"
                      sub="+18.2% conversion optimization"
                    />

                    <MetricCard
                      title="Response Accuracy"
                      value="97.8%"
                      sub="Realtime conversational intelligence"
                      glow="bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_42%)]"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {mounted ? (
              <>
                <MetricCard
                  title="Active Assistants"
                  value={String(metrics.active)}
                  sub="Realtime autonomous agents"
                />

                <MetricCard
                  title="Revenue Pipeline"
                  value={`$${metrics.totalRevenue.toLocaleString()}`}
                  sub="AI-driven sales engagement"
                />

                <MetricCard
                  title="Average AI Score"
                  value={`${metrics.avgAI}%`}
                  sub="Predictive response intelligence"
                />

                <MetricCard
                  title="Lead Qualification"
                  value="93.4%"
                  sub="Autonomous intent recognition"
                />
              </>
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Conversation Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Realtime sales engagement and behavioral prediction
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  LIVE STREAM
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendations.map((item, idx) => (
                  <LiveActivity
                    key={idx}
                    title={item}
                    time={`${idx + 1}m ago`}
                  />
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]/80 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Autonomous Assistant Core
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      AI orchestration and customer engagement engine
                    </p>
                  </div>

                  <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    ACTIVE
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Intent Recognition",
                      value: "96%",
                    },
                    {
                      label: "Customer Satisfaction",
                      value: "94%",
                    },
                    {
                      label: "Sales Conversion",
                      value: "81%",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
                          style={{
                            width: item.value,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Smart AI Insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Autonomous recommendations and sales optimization
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  AI CORE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "High-value lead detected",
                    description:
                      "Enterprise prospect predicted to convert within 24h.",
                  },
                  {
                    title: "Sales escalation required",
                    description:
                      "Customer churn-risk probability increased by 12%.",
                  },
                  {
                    title: "Automated follow-up triggered",
                    description:
                      "AI launched personalized engagement workflow.",
                  },
                  {
                    title: "Revenue opportunity identified",
                    description:
                      "Cross-sell intelligence activated for premium accounts.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]" />

                    <div className="relative flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                        ✦
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-zinc-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl md:p-6">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  AI Sales Pipeline
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Advanced AI-powered customer engagement infrastructure
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode((prev) =>
                      prev === "table" ? "grid" : "table"
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                >
                  {viewMode === "table"
                    ? "Grid View"
                    : "Table View"}
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  ⌕
                </div>

                <input
                  aria-label="Search AI conversations"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search customers, company, intent..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40 focus:bg-[#0f172a]"
                />
              </div>

              <select
                aria-label="Filter assistant status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "All"
                      | AssistantStatus
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Learning">Learning</option>
                <option value="Escalated">Escalated</option>
              </select>

              <select
                aria-label="Sort conversations"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "aiScore"
                      | "revenue"
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="aiScore">AI Score</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Customer
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 xl:table-cell">
                          Intent
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Status
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 md:table-cell">
                          Sentiment
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 lg:table-cell">
                          AI Score
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 xl:table-cell">
                          Revenue
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Priority
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredConversations.map((item) => (
                        <ConversationRow
                          key={item.id}
                          item={item}
                        />
                      ))}

                      {!filteredConversations.length && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center"
                          >
                            <div className="mx-auto max-w-sm">
                              <div className="mb-3 text-4xl">🤖</div>

                              <h3 className="text-lg font-black text-white">
                                No AI conversations found
                              </h3>

                              <p className="mt-2 text-sm text-zinc-500">
                                No matching conversations available for
                                current search parameters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredConversations.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_40%)]" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {item.id}
                          </div>

                          <h3 className="mt-2 text-lg font-black text-white">
                            {item.customer}
                          </h3>

                          <div className="mt-1 text-sm text-zinc-500">
                            {item.company}
                          </div>
                        </div>

                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                            statusStyles[item.status]
                          )}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-zinc-500">
                            AI Score
                          </div>

                          <div className="mt-1 text-2xl font-black text-cyan-300">
                            {item.aiScore}%
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500">
                            Revenue
                          </div>

                          <div className="mt-1 text-lg font-bold text-emerald-300">
                            ${item.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                          <span>Conversation Quality</span>
                          <span>{item.aiScore}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
                            style={{
                              width: `${item.aiScore}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-zinc-500">
                            Intent
                          </div>

                          <div className="mt-1 text-sm font-semibold text-zinc-200">
                            {item.intent}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "text-sm font-bold",
                            priorityStyles[item.priority]
                          )}
                        >
                          {item.priority}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredConversations.length && (
                  <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                    <div className="text-5xl">📡</div>

                    <h3 className="mt-4 text-lg font-black text-white">
                      No AI Pipeline Data
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Try changing filters or search query.
                    </p>
                  </div>
                )}
              </div>
            )}
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
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
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