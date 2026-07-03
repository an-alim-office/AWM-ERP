"use client";

import React, {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Trend = "up" | "down" | "stable";

type Region = "North America" | "Europe" | "Asia" | "Middle East";

type SalesStatus = "Growing" | "Warning" | "Critical";

type SalesRecord = {
  id: string;
  region: Region;
  channel: string;
  revenue: number;
  growth: number;
  conversion: number;
  aiForecast: number;
  trend: Trend;
  status: SalesStatus;
};


const salesSeed: SalesRecord[] = [
  {
    id: "SA-2041",
    region: "North America",
    channel: "Enterprise",
    revenue: 182400,
    growth: 18,
    conversion: 71,
    aiForecast: 92,
    trend: "up",
    status: "Growing",
  },
  {
    id: "SA-2042",
    region: "Europe",
    channel: "Retail",
    revenue: 86400,
    growth: 9,
    conversion: 54,
    aiForecast: 80,
    trend: "stable",
    status: "Growing",
  },
  {
    id: "SA-2043",
    region: "Asia",
    channel: "Wholesale",
    revenue: 62400,
    growth: -7,
    conversion: 43,
    aiForecast: 66,
    trend: "down",
    status: "Warning",
  },
  {
    id: "SA-2044",
    region: "Middle East",
    channel: "Direct Sales",
    revenue: 141800,
    growth: 22,
    conversion: 76,
    aiForecast: 95,
    trend: "up",
    status: "Growing",
  },
  {
    id: "SA-2045",
    region: "Europe",
    channel: "Partner Network",
    revenue: 31800,
    growth: -14,
    conversion: 29,
    aiForecast: 52,
    trend: "down",
    status: "Critical",
  },
];

const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const trendStyles: Record<Trend, string> = {
  up: "text-emerald-300",
  down: "text-rose-300",
  stable: "text-amber-300",
};

const trendIcons: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  stable: "→",
};

const statusStyles: Record<SalesStatus, string> = {
  Growing:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Critical:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
};

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
        "shadow-[0_18px_80px_-30px_rgba(0,0,0,0.85)]"
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

const InsightCard = memo(function InsightCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_40%)]" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
          ✦
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>

          <p className="mt-2 text-sm leading-7 text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
});

const TableRow = memo(function TableRow({
  item,
}: {
  item: SalesRecord;
}) {
  return (
    <tr className="group border-t border-white/[0.05] transition-all duration-300 hover:bg-white/[0.03]">
      <td className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-sm font-bold text-cyan-300">
            SA
          </div>

          <div>
            <div className="text-sm font-bold text-white">
              {item.region}
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              {item.id}
            </div>
          </div>
        </div>
      </td>

      <td className="hidden px-5 py-5 text-sm text-zinc-300 lg:table-cell">
        {item.channel}
      </td>

      <td className="px-5 py-5">
        <div className="text-sm font-bold text-emerald-300">
          ${item.revenue.toLocaleString()}
        </div>
      </td>

      <td className="hidden px-5 py-5 md:table-cell">
        <div
          className={cn(
            "inline-flex items-center gap-2 text-sm font-bold",
            trendStyles[item.trend]
          )}
        >
          <span>{trendIcons[item.trend]}</span>
          <span>{item.growth}%</span>
        </div>
      </td>

      <td className="hidden px-5 py-5 xl:table-cell">
        <div className="flex items-center gap-3">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
              style={{
                width: `${item.aiForecast}%`,
              }}
            />
          </div>

          <span className="text-sm font-semibold text-zinc-200">
            {item.aiForecast}%
          </span>
        </div>
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
    </tr>
  );
});

export default function SalesAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | SalesStatus
  >("All");

  const [sortBy, setSortBy] = useState<
    "revenue" | "growth" | "aiForecast"
  >("revenue");

  const [viewMode, setViewMode] = useState<"table" | "grid">(
    "table"
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    const timer = window.setTimeout(() => {
      setRefreshing(false);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => {
    const revenue = salesSeed.reduce(
      (acc, item) => acc + item.revenue,
      0
    );

    const avgForecast = Math.round(
      salesSeed.reduce(
        (acc, item) => acc + item.aiForecast,
        0
      ) / salesSeed.length
    );

    const avgConversion = Math.round(
      salesSeed.reduce(
        (acc, item) => acc + item.conversion,
        0
      ) / salesSeed.length
    );

    return {
      revenue,
      avgForecast,
      avgConversion,
    };
  }, []);

  const filteredData = useMemo(() => {
    const normalized = query.toLowerCase();

    return salesSeed
      .filter((item) => {
        const searchable = [
          item.region,
          item.channel,
          item.id,
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery =
          searchable.includes(normalized);

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
                  AI Revenue Intelligence Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Sales Analytics
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise-grade sales intelligence platform with
                  realtime forecasting, predictive revenue analysis,
                  behavioral insights, and autonomous business
                  optimization.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Forecast
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
                      title="Revenue Pipeline"
                      value={`$${metrics.revenue.toLocaleString()}`}
                      sub="AI-optimized enterprise revenue"
                    />

                    <MetricCard
                      title="Forecast Accuracy"
                      value={`${metrics.avgForecast}%`}
                      sub="Predictive sales intelligence"
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
                  title="Conversion Rate"
                  value={`${metrics.avgConversion}%`}
                  sub="Realtime AI conversion optimization"
                />

                <MetricCard
                  title="Global Markets"
                  value="24"
                  sub="Active enterprise sales regions"
                />

                <MetricCard
                  title="AI Revenue Signals"
                  value="1,248"
                  sub="Autonomous sales insights generated"
                />

                <MetricCard
                  title="Sales Velocity"
                  value="2.7x"
                  sub="Operational performance acceleration"
                />
              </>
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Predictive Revenue Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Autonomous forecasting and enterprise analytics
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  LIVE ANALYTICS
                </div>
              </div>

              <div className="relative h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]/80 p-4">
                <Suspense
                  fallback={
                    <div
                      className={cn(
                        "h-full w-full rounded-[24px] border border-white/10 bg-white/[0.03]",
                        shimmer
                      )}
                    />
                  }
                >
                 
                </Suspense>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Sales Insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Smart business intelligence recommendations
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  AI CORE
                </div>
              </div>

              <div className="space-y-4">
                <InsightCard
                  title="High-growth market detected"
                  description="Middle East enterprise channel exceeded projected revenue benchmarks."
                />

                <InsightCard
                  title="Revenue anomaly identified"
                  description="Wholesale performance declined across APAC operational pipeline."
                />

                <InsightCard
                  title="Forecast optimization triggered"
                  description="AI recalibrated predictive demand model for enterprise accounts."
                />

                <InsightCard
                  title="Conversion acceleration"
                  description="AI engagement strategy increased conversion efficiency by 18.2%."
                />
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl md:p-6">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Enterprise Sales Matrix
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Realtime analytics, forecasting, and AI-driven
                  revenue infrastructure
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
                  aria-label="Search analytics"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search region, channel, analytics..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40 focus:bg-[#0f172a]"
                />
              </div>

              <select
                aria-label="Filter analytics status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "All"
                      | SalesStatus
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="All">All Status</option>
                <option value="Growing">Growing</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>

              <select
                aria-label="Sort analytics"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "revenue"
                      | "growth"
                      | "aiForecast"
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="revenue">Revenue</option>
                <option value="growth">Growth</option>
                <option value="aiForecast">
                  AI Forecast
                </option>
              </select>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Region
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 lg:table-cell">
                          Channel
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Revenue
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 md:table-cell">
                          Growth
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 xl:table-cell">
                          AI Forecast
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id} item={item} />
                      ))}

                      {!filteredData.length && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-16 text-center"
                          >
                            <div className="mx-auto max-w-sm">
                              <div className="mb-3 text-4xl">
                                📊
                              </div>

                              <h3 className="text-lg font-black text-white">
                                No analytics data found
                              </h3>

                              <p className="mt-2 text-sm text-zinc-500">
                                No matching analytics available for
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
                {filteredData.map((item) => (
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
                            {item.region}
                          </h3>

                          <div className="mt-1 text-sm text-zinc-500">
                            {item.channel}
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
                            Revenue
                          </div>

                          <div className="mt-1 text-xl font-black text-emerald-300">
                            ${item.revenue.toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500">
                            Growth
                          </div>

                          <div
                            className={cn(
                              "mt-1 text-lg font-black",
                              trendStyles[item.trend]
                            )}
                          >
                            {item.growth}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                          <span>AI Forecast</span>
                          <span>{item.aiForecast}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
                            style={{
                              width: `${item.aiForecast}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-zinc-500">
                            Conversion
                          </div>

                          <div className="mt-1 text-sm font-semibold text-zinc-200">
                            {item.conversion}%
                          </div>
                        </div>

                        <div
                          className={cn(
                            "text-sm font-bold uppercase",
                            trendStyles[item.trend]
                          )}
                        >
                          {trendIcons[item.trend]} {item.trend}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredData.length && (
                  <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                    <div className="text-5xl">📡</div>

                    <h3 className="mt-4 text-lg font-black text-white">
                      No analytics available
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