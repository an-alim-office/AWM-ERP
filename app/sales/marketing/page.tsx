"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type CampaignStatus =
  | "Running"
  | "Scheduled"
  | "Paused"
  | "Completed";

type CampaignChannel =
  | "Email"
  | "Social"
  | "Search"
  | "Influencer"
  | "SMS";

interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget: number;
  revenue: number;
  conversion: number;
  engagement: number;
  roi: number;
  createdAt: string;
}

const campaignsSeed: Campaign[] = [
  {
    id: "CMP-2026-001",
    name: "Summer Hyper Growth",
    channel: "Social",
    status: "Running",
    budget: 18000,
    revenue: 62800,
    conversion: 14.8,
    engagement: 89,
    roi: 248,
    createdAt: "2026-06-29",
  },
  {
    id: "CMP-2026-002",
    name: "Enterprise Lead Funnel",
    channel: "Email",
    status: "Scheduled",
    budget: 9200,
    revenue: 21100,
    conversion: 11.2,
    engagement: 74,
    roi: 129,
    createdAt: "2026-06-28",
  },
  {
    id: "CMP-2026-003",
    name: "AI Product Launch",
    channel: "Search",
    status: "Running",
    budget: 26400,
    revenue: 80200,
    conversion: 17.1,
    engagement: 93,
    roi: 304,
    createdAt: "2026-06-27",
  },
  {
    id: "CMP-2026-004",
    name: "Brand Awareness Pulse",
    channel: "Influencer",
    status: "Paused",
    budget: 12000,
    revenue: 18900,
    conversion: 6.3,
    engagement: 58,
    roi: 52,
    createdAt: "2026-06-22",
  },
  {
    id: "CMP-2026-005",
    name: "Retention Reactivation",
    channel: "SMS",
    status: "Completed",
    budget: 7400,
    revenue: 24900,
    conversion: 13.4,
    engagement: 81,
    roi: 236,
    createdAt: "2026-06-20",
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<
  CampaignStatus,
  string
> = {
  Running:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Scheduled:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  Paused:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Completed:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
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

const MetricCard = memo(function MetricCard({
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

export default function MarketingPage() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | CampaignStatus>("All");

  const [sortBy, setSortBy] = useState<
    "roi" | "conversion" | "revenue"
  >("roi");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 650);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredCampaigns = useMemo(() => {
    const normalized = query.toLowerCase();

    return [...campaignsSeed]
      .filter((campaign) => {
        const matchesQuery =
          campaign.name
            .toLowerCase()
            .includes(normalized) ||
          campaign.channel
            .toLowerCase()
            .includes(normalized) ||
          campaign.id
            .toLowerCase()
            .includes(normalized);

        const matchesStatus =
          statusFilter === "All" ||
          campaign.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [query, statusFilter, sortBy]);

  const metrics = useMemo(() => {
    const totalRevenue = campaignsSeed.reduce(
      (acc, item) => acc + item.revenue,
      0
    );

    const avgConversion =
      campaignsSeed.reduce(
        (acc, item) => acc + item.conversion,
        0
      ) / campaignsSeed.length;

    return {
      revenue: `$${totalRevenue.toLocaleString()}`,
      conversion: `${avgConversion.toFixed(1)}%`,
      active: campaignsSeed.filter(
        (item) => item.status === "Running"
      ).length,
    };
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#050816] p-4 md:p-6 xl:p-8">
        <div className="mx-auto grid max-w-[1900px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map(
            (_, idx) => (
              <SkeletonCard key={idx} />
            )
          )}
        </div>
      </main>
    );
  }

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
                  Autonomous Marketing AI Engine
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Marketing Campaigns
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise-grade campaign
                  orchestration platform with
                  predictive engagement analytics,
                  realtime conversion intelligence,
                  AI-powered targeting, and autonomous
                  optimization pipelines.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:max-w-xl">
                <MetricCard
                  title="Campaign Revenue"
                  value={metrics.revenue}
                  sub="Realtime marketing attribution"
                />

                <MetricCard
                  title="Conversion Rate"
                  value={metrics.conversion}
                  sub="AI-enhanced funnel performance"
                />
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Active Campaigns"
              value={metrics.active.toString()}
              sub="Live omnichannel execution"
            />

            <MetricCard
              title="AI Engagement"
              value="92%"
              sub="Behavioral targeting precision"
            />

            <MetricCard
              title="Lead Velocity"
              value="+38%"
              sub="Predictive acquisition scaling"
            />

            <MetricCard
              title="Automation Rules"
              value="148"
              sub="Realtime orchestration engine"
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Campaign Performance Matrix
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Intelligent omnichannel growth
                    optimization
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Launch Campaign
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Export Analytics
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  {
                    label: "Audience Reach",
                    value: "4.8M",
                    progress: "91%",
                  },
                  {
                    label: "Engagement AI",
                    value: "93%",
                    progress: "93%",
                  },
                  {
                    label: "Funnel Efficiency",
                    value: "86%",
                    progress: "86%",
                  },
                  {
                    label: "Ad Intelligence",
                    value: "97%",
                    progress: "97%",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      {item.label}
                    </div>

                    <div className="mt-3 text-3xl font-black text-white">
                      {item.value}
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                        style={{
                          width: item.progress,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      AI marketing optimization
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Growth Signals
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Realtime predictive recommendations
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "AI detected higher engagement probability on social campaigns.",
                  "Search campaign ROI increased after behavioral retargeting.",
                  "Audience segmentation improved conversion velocity by 24%.",
                  "Realtime attribution identified premium acquisition channels.",
                  "Automation workflows reduced campaign response latency.",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group rounded-[26px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />

                      <p className="text-sm leading-7 text-zinc-300">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-dashed border-cyan-400/20 bg-cyan-500/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Smart Ad Automation
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      Autonomous optimization active
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

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">
                  Campaign Intelligence Table
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Advanced AI-powered marketing
                  analytics infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  aria-label="Search campaigns"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search campaigns..."
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                />

                <select
                  aria-label="Filter campaigns"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | CampaignStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Running">
                    Running
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Paused">
                    Paused
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>

                <select
                  aria-label="Sort campaigns"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "roi"
                        | "conversion"
                        | "revenue"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="roi">
                    ROI
                  </option>

                  <option value="conversion">
                    Conversion
                  </option>

                  <option value="revenue">
                    Revenue
                  </option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      {[
                        "Campaign",
                        "Channel",
                        "Budget",
                        "Revenue",
                        "Conversion",
                        "Engagement",
                        "ROI",
                        "Status",
                      ].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCampaigns.map(
                      (campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {campaign.name}
                              </span>

                              <span className="mt-1 text-xs text-cyan-300">
                                {campaign.id}
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                            {campaign.channel}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            $
                            {campaign.budget.toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-emerald-300">
                            $
                            {campaign.revenue.toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500"
                                  style={{
                                    width: `${campaign.conversion * 5}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-cyan-300">
                                {campaign.conversion}%
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-300">
                            {campaign.engagement}%
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-white">
                            {campaign.roi}%
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                statusStyles[
                                  campaign.status
                                ]
                              )}
                            >
                              {campaign.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredCampaigns.length && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No campaign analytics found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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