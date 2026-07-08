"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface PerformancePoint {
  month: string;
  production: number;
  efficiency: number;
}

interface DistributionItem {
  label: string;
  value: number;
  color: string;
}

const performanceData: PerformancePoint[] = [
  {
    month: "Jan",
    production: 65,
    efficiency: 78,
  },
  {
    month: "Feb",
    production: 78,
    efficiency: 82,
  },
  {
    month: "Mar",
    production: 92,
    efficiency: 89,
  },
  {
    month: "Apr",
    production: 85,
    efficiency: 91,
  },
  {
    month: "May",
    production: 110,
    efficiency: 95,
  },
  {
    month: "Jun",
    production: 122,
    efficiency: 97,
  },
];

const distributionData: DistributionItem[] = [
  {
    label: "Production",
    value: 42,
    color: "bg-cyan-400",
  },
  {
    label: "Maintenance",
    value: 21,
    color: "bg-violet-400",
  },
  {
    label: "Operations",
    value: 19,
    color: "bg-emerald-400",
  },
  {
    label: "Logistics",
    value: 18,
    color: "bg-amber-400",
  },
];

const SkeletonCard = memo(() => (
  <div className="h-[320px] animate-pulse rounded-3xl border border-white/5 bg-[#161b22]" />
));

SkeletonCard.displayName = "SkeletonCard";

function BarChart({
  data,
}: {
  data: PerformancePoint[];
}) {
  const maxValue = Math.max(
    ...data.map((d) => d.production)
  );

  return (
    <div className="flex h-[260px] items-end justify-between gap-3">
      {data.map((item) => (
        <div
          key={item.month}
          className="flex flex-1 flex-col items-center gap-3"
        >
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="relative w-full rounded-t-2xl bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition-all duration-1000 hover:scale-[1.03]"
              style={{
                height: `${
                  (item.production /
                    maxValue) *
                  100
                }%`,
              }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-300">
                {item.production}
              </div>
            </div>
          </div>

          <span className="text-xs font-semibold text-gray-400">
            {item.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: DistributionItem[];
}) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  let cumulative = 0;

  const segments = data.map((item) => {
    const start =
      (cumulative / total) * 360;

    cumulative += item.value;

    const end =
      (cumulative / total) * 360;

    return {
      ...item,
      start,
      end,
    };
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex h-[240px] w-[240px] items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              #22d3ee 0deg ${segments[0].end}deg,
              #a855f7 ${segments[0].end}deg ${segments[1].end}deg,
              #34d399 ${segments[1].end}deg ${segments[2].end}deg,
              #fbbf24 ${segments[2].end}deg 360deg
            )`,
          }}
        />

        <div className="absolute flex h-[145px] w-[145px] flex-col items-center justify-center rounded-full border border-white/5 bg-[#0d1117] shadow-2xl">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Total
          </span>

          <span className="mt-1 text-4xl font-black text-white">
            {total}%
          </span>
        </div>
      </div>

      <div className="mt-8 grid w-full grid-cols-2 gap-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-3"
          >
            <div
              className={`h-3 w-3 rounded-full ${item.color}`}
            />

            <div className="flex flex-1 items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">
                {item.label}
              </span>

              <span className="text-xs font-black text-white">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const analytics = useMemo(() => {
    return {
      growth: "+24.8%",
      uptime: "99.97%",
      aiAccuracy: "96.4%",
      reports: "1.2K",
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#0d1117] text-gray-100"
          : "bg-[#f5f7fb] text-gray-900"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Enterprise Analytics Engine
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Charts
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-gray-400">
                Advanced enterprise data
                visualization, AI-powered
                analytics, operational insights &
                futuristic reporting dashboard.
              </p>
            </div>

            <button
              onClick={() =>
                setDarkMode((prev) => !prev)
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30"
            >
              {darkMode
                ? "Light Mode"
                : "Dark Mode"}
            </button>
          </div>

          {/* Analytics Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {!mounted ? (
              Array.from({
                length: 4,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))
            ) : (
              <>
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Growth Rate
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-cyan-400">
                    {analytics.growth}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    System Uptime
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-emerald-400">
                    {analytics.uptime}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    AI Accuracy
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-violet-400">
                    {analytics.aiAccuracy}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Reports Generated
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-amber-400">
                    {analytics.reports}
                  </h2>
                </div>
              </>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Bar Chart */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Production Performance
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Monthly production analytics
                    overview
                  </p>
                </div>

                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                  Live Analytics
                </div>
              </div>

              {mounted ? (
                <BarChart
                  data={performanceData}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>

            {/* Pie Chart */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Resource Distribution
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Department utilization
                    analytics
                  </p>
                </div>

                <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-300">
                  AI Optimized
                </div>
              </div>

              {mounted ? (
                <DonutChart
                  data={distributionData}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>
          </div>

          {/* Bottom Insights */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {[
              {
                title:
                  "AI Predictive Analytics",
                value: "94%",
                desc: "Future production forecasting accuracy",
                color: "text-cyan-400",
              },
              {
                title:
                  "Operational Efficiency",
                value: "89%",
                desc: "System-wide optimization performance",
                color: "text-emerald-400",
              },
              {
                title:
                  "Energy Optimization",
                value: "-18%",
                desc: "Predicted power consumption reduction",
                color: "text-violet-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/20"
              >
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  {item.title}
                </p>

                <h2
                  className={`mt-3 text-4xl font-black ${item.color}`}
                >
                  {item.value}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* AI Recommendation */}
          <div className="mt-8 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-black text-cyan-300">
                  AI Executive Recommendation
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-400">
                  Machine learning analytics
                  predicts a 14.7% operational
                  efficiency increase through
                  adaptive scheduling, autonomous
                  resource balancing & predictive
                  maintenance integration.
                </p>
              </div>

              <button className="rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
                Generate AI Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}