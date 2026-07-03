"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TrendPoint {
  label: string;
  value: number;
}

interface HeatMapCell {
  id: number;
  intensity: number;
}

const trendData: TrendPoint[] = [
  { label: "Jan", value: 34 },
  { label: "Feb", value: 48 },
  { label: "Mar", value: 57 },
  { label: "Apr", value: 73 },
  { label: "May", value: 88 },
  { label: "Jun", value: 96 },
  { label: "Jul", value: 120 },
];

const performanceData: TrendPoint[] = [
  { label: "A", value: 92 },
  { label: "B", value: 75 },
  { label: "C", value: 61 },
  { label: "D", value: 88 },
  { label: "E", value: 98 },
];

const heatMapData: HeatMapCell[] =
  Array.from({ length: 35 }).map(
    (_, index) => ({
      id: index,
      intensity:
        Math.floor(Math.random() * 100) + 1,
    })
  );

const SkeletonCard = memo(() => (
  <div className="h-[320px] animate-pulse rounded-3xl border border-white/5 bg-[#161b22]" />
));

SkeletonCard.displayName = "SkeletonCard";

function AreaChart({
  data,
}: {
  data: TrendPoint[];
}) {
  const maxValue = Math.max(
    ...data.map((d) => d.value)
  );

  const points = data
    .map((item, index) => {
      const x =
        (index /
          (data.length - 1)) *
        100;

      const y =
        100 -
        (item.value / maxValue) * 100;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-[260px] w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient
            id="areaFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#22d3ee"
              stopOpacity="0.6"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <polygon
          fill="url(#areaFill)"
          points={`0,100 ${points} 100,100`}
        />

        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          points={points}
          className="drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
        />

        {data.map((item, index) => {
          const x =
            (index /
              (data.length - 1)) *
            100;

          const y =
            100 -
            (item.value / maxValue) * 100;

          return (
            <circle
              key={item.label}
              cx={x}
              cy={y}
              r="2.2"
              fill="#22d3ee"
            />
          );
        })}
      </svg>

      <div className="mt-4 flex items-center justify-between px-1">
        {data.map((item) => (
          <span
            key={item.label}
            className="text-xs font-semibold text-gray-500"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarAnalytics({
  data,
}: {
  data: TrendPoint[];
}) {
  const maxValue = Math.max(
    ...data.map((d) => d.value)
  );

  return (
    <div className="flex h-[250px] items-end justify-between gap-4">
      {data.map((item) => (
        <div
          key={item.label}
          className="flex flex-1 flex-col items-center gap-3"
        >
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="relative w-full rounded-t-2xl bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 transition-all duration-1000 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              style={{
                height: `${
                  (item.value /
                    maxValue) *
                  100
                }%`,
              }}
            >
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-black text-cyan-300">
                {item.value}%
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-gray-400">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function HeatMap({
  data,
}: {
  data: HeatMapCell[];
}) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {data.map((cell) => (
        <div
          key={cell.id}
          className="aspect-square rounded-xl transition-all duration-300 hover:scale-110"
          style={{
            background: `rgba(34, 211, 238, ${
              cell.intensity / 100
            })`,
            boxShadow: `0 0 20px rgba(34,211,238,${
              cell.intensity / 200
            })`,
          }}
        />
      ))}
    </div>
  );
}

export default function DataVisualizationPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [liveMode, setLiveMode] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const metrics = useMemo(
    () => [
      {
        title: "AI Forecast Accuracy",
        value: "97.4%",
        color: "text-cyan-400",
      },
      {
        title: "Realtime Data Streams",
        value: "12.8K",
        color: "text-emerald-400",
      },
      {
        title: "System Throughput",
        value: "4.2TB",
        color: "text-violet-400",
      },
      {
        title: "Visualization Latency",
        value: "14ms",
        color: "text-amber-400",
      },
    ],
    []
  );

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
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Neural Visualization Engine
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Data Visualization
              </h1>

              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-400">
                Futuristic enterprise-grade
                visualization system with
                realtime analytics, AI-driven
                insights, operational heatmaps &
                advanced performance monitoring.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setLiveMode((prev) => !prev)
                }
                className={`rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                  liveMode
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    : "bg-white/[0.03] border border-white/10"
                }`}
              >
                {liveMode
                  ? "Live Analytics ON"
                  : "Live Analytics OFF"}
              </button>

              <button
                onClick={() =>
                  setDarkMode((prev) => !prev)
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {darkMode
                  ? "Light Mode"
                  : "Dark Mode"}
              </button>
            </div>
          </div>

          {/* Metrics */}
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
                {metrics.map((metric) => (
                  <div
                    key={metric.title}
                    className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl"
                  >
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      {metric.title}
                    </p>

                    <h2
                      className={`mt-3 text-4xl font-black ${metric.color}`}
                    >
                      {metric.value}
                    </h2>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Area Chart */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl xl:col-span-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Predictive Trend Analytics
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    AI-powered operational trend
                    forecasting
                  </p>
                </div>

                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                  Realtime Stream
                </div>
              </div>

              {mounted ? (
                <AreaChart
                  data={trendData}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>

            {/* Heatmap */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl xl:col-span-5">
              <div className="mb-6">
                <h2 className="text-xl font-black tracking-tight">
                  Operational Heatmap
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Smart resource activity matrix
                </p>
              </div>

              {mounted ? (
                <HeatMap
                  data={heatMapData}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>

            {/* Bar Analytics */}
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl xl:col-span-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Department Efficiency
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Intelligent performance
                    comparison
                  </p>
                </div>

                <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-300">
                  AI Optimized
                </div>
              </div>

              {mounted ? (
                <BarAnalytics
                  data={performanceData}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>

            {/* AI Insights */}
            <div className="overflow-hidden rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-6 backdrop-blur-2xl xl:col-span-4">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                    AI Insight
                  </div>

                  <h2 className="text-2xl font-black leading-tight text-cyan-200">
                    Autonomous Business
                    Intelligence
                  </h2>

                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    Machine learning algorithms
                    detected a projected 18.6%
                    operational improvement by
                    optimizing resource balancing,
                    predictive maintenance &
                    adaptive scheduling systems.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    "Production anomaly detected",
                    "AI forecasting accuracy improved",
                    "Realtime stream synchronized",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/10 p-3"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

                      <span className="text-sm text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 rounded-3xl border border-white/5 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Enterprise Visualization Hub
                </h2>

                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-400">
                  Unified data intelligence
                  system designed for modern SaaS
                  manufacturing, enterprise
                  monitoring & AI-powered
                  operational analytics.
                </p>
              </div>

              <button className="rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
                Export Intelligence Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}