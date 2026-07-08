"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type ForecastStatus =
  | "Stable"
  | "Growing"
  | "Critical";

interface ForecastModel {
  id: string;
  category: string;
  prediction: string;
  confidence: number;
  growth: number;
  status: ForecastStatus;
  updatedAt: string;
}

const FORECAST_DATA: ForecastModel[] =
  [
    {
      id: "FC-1001",
      category:
        "Revenue Forecast",
      prediction: "$1.82M",
      confidence: 94,
      growth: 18,
      status: "Growing",
      updatedAt:
        "2026-06-29 09:45 AM",
    },
    {
      id: "FC-1002",
      category:
        "Production Demand",
      prediction: "14,200 Units",
      confidence: 88,
      growth: 11,
      status: "Stable",
      updatedAt:
        "2026-06-29 08:20 AM",
    },
    {
      id: "FC-1003",
      category:
        "Supply Chain Risk",
      prediction: "Medium Risk",
      confidence: 79,
      growth: -6,
      status: "Critical",
      updatedAt:
        "2026-06-29 07:10 AM",
    },
    {
      id: "FC-1004",
      category:
        "Employee Utilization",
      prediction: "92%",
      confidence: 96,
      growth: 8,
      status: "Growing",
      updatedAt:
        "2026-06-29 06:35 AM",
    },
  ];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const SkeletonCard = memo(
  () => (
    <div
      className={`h-40 rounded-3xl border border-white/10 bg-white/[0.03] ${shimmer}`}
    />
  )
);

SkeletonCard.displayName =
  "SkeletonCard";

export default function ForecastingPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      | "All"
      | ForecastStatus
    >("All");

  const [selectedRange, setSelectedRange] =
    useState("Q3 2026");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const filteredData =
    useMemo(() => {
      return FORECAST_DATA.filter(
        (item) => {
          const matchesSearch =
            item.category
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "All"
              ? true
              : item.status ===
                filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [search, filter]);

  const metrics = useMemo(() => {
    return {
      accuracy: "94.6%",
      aiModels: 12,
      activePredictions:
        FORECAST_DATA.length,
      realtimeSync:
        "Connected",
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#050816] text-white"
          : "bg-[#f4f7fb] text-[#111827]"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1800px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.3em] text-violet-300 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                AI Predictive Intelligence
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Forecasting Engine
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">
                Enterprise-grade
                forecasting platform with
                predictive analytics,
                realtime AI insights,
                operational trend modeling,
                risk detection and business
                intelligence forecasting.
              </p>
            </div>

            <button
              onClick={() =>
                setDarkMode(
                  (prev) => !prev
                )
              }
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold backdrop-blur-xl transition-all duration-300 hover:scale-[1.03]"
            >
              {darkMode
                ? "Light Mode"
                : "Dark Mode"}
            </button>
          </div>

          {/* KPI */}
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                title:
                  "Forecast Accuracy",
                value:
                  metrics.accuracy,
                color:
                  "text-cyan-400",
              },
              {
                title:
                  "AI Models",
                value:
                  metrics.aiModels,
                color:
                  "text-violet-400",
              },
              {
                title:
                  "Active Predictions",
                value:
                  metrics.activePredictions,
                color:
                  "text-emerald-400",
              },
              {
                title:
                  "Realtime Sync",
                value:
                  metrics.realtimeSync,
                color:
                  "text-amber-400",
              },
            ].map((metric) => (
              <div
                key={metric.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {metric.title}
                </p>

                <h2
                  className={`mt-4 text-4xl font-black ${metric.color}`}
                >
                  {mounted
                    ? metric.value
                    : "--"}
                </h2>
              </div>
            ))}
          </div>

          {/* Forecast Hero */}
          <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_40%)]" />

            <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_0.6fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
                  Neural Forecast Layer
                </div>

                <h2 className="max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                  Predict business growth,
                  operational risks &
                  future performance using
                  AI-driven forecasting.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-400">
                  Integrated machine
                  learning forecasting
                  engine analyzing
                  operational KPIs,
                  workforce activity,
                  production capacity and
                  revenue projections in
                  realtime.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_0_40px_rgba(139,92,246,0.35)] transition-all duration-300 hover:scale-[1.02]">
                    Generate Forecast
                  </button>

                  <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-black uppercase tracking-wide transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300">
                    AI Trend Analysis
                  </button>
                </div>
              </div>

              {/* Chart Simulation */}
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                    Predictive Trend
                  </h3>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">
                    +18.4%
                  </span>
                </div>

                <div className="flex h-[240px] items-end justify-between gap-3">
                  {[38, 62, 44, 80, 92, 74, 110].map(
                    (
                      height,
                      index
                    ) => (
                      <div
                        key={index}
                        className="group flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          style={{
                            height: `${height}%`,
                          }}
                          className="rounded-t-3xl bg-gradient-to-t from-violet-600 via-cyan-500 to-cyan-300 transition-all duration-500 group-hover:scale-y-105"
                        />

                        <span className="mt-3 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Q{index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Predictive Models
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                AI-powered forecasting
                insights & predictive
                business intelligence.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={selectedRange}
                onChange={(e) =>
                  setSelectedRange(
                    e.target.value
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur-xl"
              >
                <option>
                  Q3 2026
                </option>
                <option>
                  Q4 2026
                </option>
                <option>
                  2027 Projection
                </option>
              </select>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target
                      .value as
                      | "All"
                      | ForecastStatus
                  )
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur-xl"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Growing">
                  Growing
                </option>

                <option value="Stable">
                  Stable
                </option>

                <option value="Critical">
                  Critical
                </option>
              </select>

              <input
                type="text"
                placeholder="Search prediction..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none backdrop-blur-xl md:w-80"
              />
            </div>
          </div>

          {/* Forecast Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, idx) => (
                <SkeletonCard
                  key={idx}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredData.map(
                (forecast) => (
                  <div
                    key={
                      forecast.id
                    }
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            {
                              forecast.id
                            }
                          </p>

                          <h3 className="mt-2 text-lg font-black">
                            {
                              forecast.category
                            }
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                            forecast.status ===
                            "Growing"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : forecast.status ===
                                "Stable"
                              ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                              : "border border-red-500/20 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {
                            forecast.status
                          }
                        </span>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Prediction
                        </p>

                        <h2 className="mt-3 text-4xl font-black text-cyan-300">
                          {
                            forecast.prediction
                          }
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-500">
                            <span>
                              Confidence
                            </span>

                            <span className="text-white">
                              {
                                forecast.confidence
                              }
                              %
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              style={{
                                width: `${forecast.confidence}%`,
                              }}
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                              Growth
                            </p>

                            <p
                              className={`mt-1 text-lg font-black ${
                                forecast.growth >=
                                0
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}
                            >
                              {forecast.growth >=
                              0
                                ? "+"
                                : ""}
                              {
                                forecast.growth
                              }
                              %
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                              Updated
                            </p>

                            <p className="mt-1 text-xs font-mono text-gray-400">
                              {
                                forecast.updatedAt
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Bottom Intelligence */}
          <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
            {[
              {
                title:
                  "Demand Prediction",
                desc:
                  "AI demand planning based on realtime operational datasets and production trends.",
                accent:
                  "from-cyan-500/20 to-transparent",
              },
              {
                title:
                  "Risk Forecasting",
                desc:
                  "Automated risk analysis with proactive anomaly detection and supply chain forecasting.",
                accent:
                  "from-violet-500/20 to-transparent",
              },
              {
                title:
                  "Growth Intelligence",
                desc:
                  "Predictive growth modeling for enterprise scalability and financial optimization.",
                accent:
                  "from-emerald-500/20 to-transparent",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.accent} p-6 backdrop-blur-2xl`}
              >
                <h3 className="text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}