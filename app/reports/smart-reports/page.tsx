"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Trend = "up" | "down" | "neutral";

type ReportStatus = "Completed" | "Processing" | "Scheduled";

type Report = {
  id: string;
  title: string;
  category: string;
  generatedAt: string;
  status: ReportStatus;
  confidence: number;
  trend: Trend;
  aiScore: number;
};

const reportsSeed: Report[] = [
  {
    id: "SR-1001",
    title: "Revenue Growth Forecast",
    category: "Finance",
    generatedAt: "2026-06-29 08:12",
    status: "Completed",
    confidence: 96,
    trend: "up",
    aiScore: 92,
  },
  {
    id: "SR-1002",
    title: "Inventory Optimization",
    category: "Operations",
    generatedAt: "2026-06-29 09:30",
    status: "Processing",
    confidence: 83,
    trend: "neutral",
    aiScore: 79,
  },
  {
    id: "SR-1003",
    title: "Customer Churn Analysis",
    category: "CRM",
    generatedAt: "2026-06-28 17:18",
    status: "Completed",
    confidence: 94,
    trend: "down",
    aiScore: 88,
  },
  {
    id: "SR-1004",
    title: "Marketing Attribution Insights",
    category: "Marketing",
    generatedAt: "2026-06-27 11:42",
    status: "Scheduled",
    confidence: 78,
    trend: "up",
    aiScore: 74,
  },
  {
    id: "SR-1005",
    title: "Supply Chain Intelligence",
    category: "Logistics",
    generatedAt: "2026-06-27 14:09",
    status: "Completed",
    confidence: 91,
    trend: "up",
    aiScore: 90,
  },
];

const recommendations = [
  "AI predicts inventory shortage within next 72 hours across 3 supply regions.",
  "Revenue anomaly detected in procurement workflow requiring escalation.",
  "Logistics optimization can reduce operational overhead by 14.2%.",
  "Customer retention probability increased after segmentation refinement.",
] as const;

const cn = (...classes: Array<string | false | undefined | null>) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.4s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<ReportStatus, string> = {
  Completed:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Processing:
    "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  Scheduled: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
};

const trendStyles: Record<Trend, string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
  neutral: "text-yellow-300",
};

const trendIcons: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  neutral: "→",
};

const chartSeries = [42, 48, 46, 58, 64, 62, 75, 82, 79, 88, 94, 98];

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={cn(
        "h-36 rounded-[28px] border border-border/60 bg-muted/30",
        shimmer
      )}
    />
  );
});

const SectionHeading = memo(function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {action}
    </div>
  );
});

const StatCard = memo(function StatCard({
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
        "group relative overflow-hidden rounded-[30px] border border-border/60",
        "bg-background/70 backdrop-blur-2xl transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-cyan-400/30",
        "shadow-[0_10px_60px_-12px_rgba(0,0,0,0.55)]"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          glow ??
            "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_42%)]"
        )}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <div className="mt-4 text-3xl font-black tracking-tight text-foreground">
              {value}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-300">
            ✦
          </div>
        </div>
      </div>
    </div>
  );
});

const TableRow = memo(function TableRow({
  report,
}: {
  report: Report;
}) {
  return (
    <tr className="group border-t border-white/[0.05] transition-all duration-300 hover:bg-white/[0.03]">
      <td className="px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-sm font-bold text-cyan-300">
            AI
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-foreground">
              {report.title}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{report.id}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span>{report.category}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="hidden whitespace-nowrap px-5 py-5 text-sm text-zinc-300 lg:table-cell">
        {report.generatedAt}
      </td>

      <td className="px-5 py-5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            statusStyles[report.status]
          )}
        >
          {report.status}
        </span>
      </td>

      <td className="hidden px-5 py-5 xl:table-cell">
        <div className="flex items-center gap-3">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
              style={{
                width: `${report.confidence}%`,
              }}
            />
          </div>

          <span className="text-sm font-semibold text-zinc-200">
            {report.confidence}%
          </span>
        </div>
      </td>

      <td className="hidden px-5 py-5 md:table-cell">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-3 py-1.5 text-sm font-bold text-cyan-300">
          {report.aiScore}
        </div>
      </td>

      <td className="px-5 py-5">
        <div
          className={cn(
            "inline-flex items-center gap-2 text-sm font-bold uppercase",
            trendStyles[report.trend]
          )}
        >
          <span>{trendIcons[report.trend]}</span>
          <span>{report.trend}</span>
        </div>
      </td>
    </tr>
  );
});

const InlineMiniChart = memo(function InlineMiniChart() {
  const width = 860;
  const height = 320;
  const padding = 20;
  const max = Math.max(...chartSeries);
  const min = Math.min(...chartSeries);
  const range = Math.max(max - min, 1);

  const points = chartSeries
    .map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(chartSeries.length - 1, 1);
      const y =
        height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${
    width - padding
  },${height - padding}`;

  return (
    <div className="h-full w-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
            Predictive Signal
          </div>
          <div className="mt-2 text-lg font-black text-white">
            AI Growth Trajectory
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
          +18.4%
        </div>
      </div>

      <div className="relative h-[calc(100%-68px)] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label="Predictive analytics chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.40)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
            </linearGradient>
            <linearGradient id="chartStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + (i * (height - padding * 2)) / 4;
            return (
              <line
                key={i}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 8"
              />
            );
          })}

          <polygon points={areaPoints} fill="url(#chartFill)" />

          <polyline
            points={points}
            fill="none"
            stroke="url(#chartStroke)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {chartSeries.map((value, index) => {
            const x =
              padding +
              (index * (width - padding * 2)) /
                Math.max(chartSeries.length - 1, 1);
            const y =
              height -
              padding -
              ((value - min) / range) * (height - padding * 2);

            return (
              <g key={`${value}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#0f172a"
                  stroke="#67e8f9"
                  strokeWidth="3"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
});

export default function SmartReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "generatedAt" | "confidence" | "aiScore"
  >("generatedAt");
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", keyHandler);

    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
    }

    setRefreshing(true);

    refreshTimeoutRef.current = window.setTimeout(() => {
      setRefreshing(false);
      refreshTimeoutRef.current = null;
    }, 1200);
  }, []);

  const analytics = useMemo(() => {
    const completed = reportsSeed.filter(
      (item) => item.status === "Completed"
    ).length;

    const processing = reportsSeed.filter(
      (item) => item.status === "Processing"
    ).length;

    const avgScore = Math.round(
      reportsSeed.reduce((acc, item) => acc + item.aiScore, 0) /
        reportsSeed.length
    );

    return {
      completed,
      processing,
      avgScore,
    };
  }, []);

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return reportsSeed
      .filter((item) => {
        const searchable = [
          item.title,
          item.category,
          item.id,
          item.status,
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery =
          normalized.length === 0 ? true : searchable.includes(normalized);

        const matchesStatus =
          statusFilter === "All" || item.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "generatedAt") {
          return (
            new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
          );
        }

        return b[sortBy] - a[sortBy];
      });
  }, [query, sortBy, statusFilter]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_25%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          <section
            className={cn(
              "relative overflow-hidden rounded-[34px] border border-border/60",
              "bg-background/70 p-6 backdrop-blur-2xl md:p-8",
              "shadow-[0_20px_100px_-30px_rgba(0,0,0,0.8)]"
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  Quantum AI Intelligence Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
                  Smart Reports
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  Advanced enterprise reporting intelligence with autonomous
                  analytics, predictive forecasting, anomaly detection,
                  operational visibility, and AI-driven business optimization.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Insight
                  </button>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/60 bg-white/[0.03] px-5 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
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
                    <StatCard
                      title="Reports Generated"
                      value="18,492"
                      sub="+12.8% monthly intelligence growth"
                    />

                    <StatCard
                      title="AI Accuracy"
                      value="96.4%"
                      sub="Autonomous confidence calibration"
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
                <StatCard
                  title="Automated Insights"
                  value="1,284"
                  sub="Continuous intelligence orchestration"
                />

                <StatCard
                  title="Completed Reports"
                  value={String(analytics.completed)}
                  sub="Realtime operational execution"
                />

                <StatCard
                  title="Processing Jobs"
                  value={String(analytics.processing)}
                  sub="Secure distributed AI pipelines"
                />

                <StatCard
                  title="Average AI Score"
                  value={String(analytics.avgScore)}
                  sub="Predictive engine efficiency"
                />
              </>
            ) : (
              Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[32px] border border-border/60 bg-background/70 p-6 backdrop-blur-2xl">
              <SectionHeading
                title="Predictive Analytics"
                subtitle="Enterprise AI forecasting and realtime operational modeling"
                action={
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    Generate Report
                  </button>
                }
              />

              <div className="relative h-[360px] overflow-hidden rounded-[28px] border border-border/60 bg-[#07111f] p-4">
                <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  LIVE
                </div>

                <InlineMiniChart />
              </div>
            </div>

            <div className="rounded-[32px] border border-border/60 bg-background/70 p-6 backdrop-blur-2xl">
              <SectionHeading
                title="AI Recommendations"
                subtitle="Autonomous business optimization suggestions"
              />

              <div className="space-y-4">
                {recommendations.map((item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="group relative overflow-hidden rounded-[26px] border border-border/60 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_38%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex items-start gap-4">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                        ✦
                      </div>

                      <div>
                        <p className="text-sm leading-7 text-zinc-200">{item}</p>
                        <div className="mt-4 text-xs text-muted-foreground">
                          Autonomous Engine
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[32px] border border-border/60 bg-background/70 p-5 backdrop-blur-2xl md:p-6">
            <SectionHeading
              title="Smart Reporting Engine"
              subtitle="Advanced searchable reporting infrastructure with AI intelligence"
              action={
                <div className="flex flex-wrap items-center gap-3">
                  <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-400 lg:flex">
                    ⌘K Quick Search
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === "table" ? "grid" : "table"
                      )
                    }
                    className="rounded-2xl border border-border/60 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    {viewMode === "table" ? "Grid View" : "Table View"}
                  </button>
                </div>
              }
            />

            <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  ⌕
                </div>

                <input
                  ref={searchInputRef}
                  aria-label="Search reports"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reports, IDs, categories..."
                  className="h-12 w-full rounded-2xl border border-border/60 bg-[#081120] pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                />
              </div>

              <select
                aria-label="Filter reports"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "All" | ReportStatus)
                }
                className="h-12 rounded-2xl border border-border/60 bg-[#081120] px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Scheduled">Scheduled</option>
              </select>

              <select
                aria-label="Sort reports"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "generatedAt" | "confidence" | "aiScore"
                  )
                }
                className="h-12 rounded-2xl border border-border/60 bg-[#081120] px-4 text-sm text-zinc-200 outline-none transition-all duration-300 focus:border-cyan-400/40"
              >
                <option value="generatedAt">Latest</option>
                <option value="confidence">Confidence</option>
                <option value="aiScore">AI Score</option>
              </select>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-hidden rounded-[28px] border border-border/60">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Report
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 lg:table-cell">
                          Generated
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Status
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 xl:table-cell">
                          Confidence
                        </th>

                        <th className="hidden px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500 md:table-cell">
                          AI Score
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Trend
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id} report={report} />
                      ))}

                      {!filteredReports.length && (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <div className="mx-auto max-w-sm">
                              <div className="mb-3 text-4xl">📊</div>

                              <h3 className="text-lg font-bold text-foreground">
                                No reports found
                              </h3>

                              <p className="mt-2 text-sm text-muted-foreground">
                                No matching reports available for current
                                search and filtering parameters.
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
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-white/[0.03] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {report.id}
                          </div>

                          <h3 className="mt-2 text-lg font-black text-foreground">
                            {report.title}
                          </h3>
                        </div>

                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                            statusStyles[report.status]
                          )}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Category
                          </div>

                          <div className="mt-1 font-semibold text-zinc-200">
                            {report.category}
                          </div>
                        </div>

                        <div
                          className={cn(
                            "text-sm font-black uppercase",
                            trendStyles[report.trend]
                          )}
                        >
                          {trendIcons[report.trend]} {report.trend}
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Confidence</span>
                          <span>{report.confidence}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                            style={{ width: `${report.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            AI Score
                          </div>

                          <div className="mt-1 text-xl font-black text-cyan-300">
                            {report.aiScore}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Generated
                          </div>

                          <div className="mt-1 text-sm font-medium text-zinc-300">
                            {report.generatedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!filteredReports.length && (
                  <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                    <div className="text-5xl">📁</div>
                    <h3 className="mt-4 text-lg font-black text-foreground">
                      No Smart Reports Found
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try changing search query or filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --background: #050816;
          --foreground: #f4f4f5;
          --muted-foreground: #a1a1aa;
          --border: rgba(255, 255, 255, 0.08);
        }

        body {
          background: var(--background);
          color: var(--foreground);
        }

        .bg-background {
          background-color: var(--background);
        }

        .text-foreground {
          color: var(--foreground);
        }

        .text-muted-foreground {
          color: var(--muted-foreground);
        }

        .border-border\/60 {
          border-color: var(--border);
        }

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
