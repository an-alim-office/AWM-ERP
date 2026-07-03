"use client";

import React, { useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 700;
    const step = Math.max(1, Math.floor(value / 30));

    const interval = setInterval(() => {
      start += step;
      if (start >= value) {
        start = value;
        clearInterval(interval);
      }
      setDisplay(start);
    }, duration / 30);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{display}</span>;
}

function MiniTrend({ color }: { color: string }) {
  const points = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => Math.floor(20 + Math.random() * 60)),
    []
  );

  const path = points
    .map((p, i) => `${i * 6},${80 - p}`)
    .join(" ");

  return (
    <svg width="120" height="40" viewBox="0 0 120 40" className="opacity-70">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={path}
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-[#161b22] border border-gray-800 p-6 rounded-xl h-[120px]" />
  );
}

export default function ProductionKPIPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setMounted(true);
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: "OEE (Overall Equipment Effectiveness)",
        value: 85,
        suffix: "%",
        color: "text-blue-400",
        trend: "#60a5fa",
      },
      {
        label: "Cycle Time",
        value: 42,
        suffix: "s",
        color: "text-emerald-400",
        trend: "#34d399",
      },
      {
        label: "Defect Rate",
        value: 12,
        suffix: "%",
        color: "text-red-400",
        trend: "#f87171",
      },
      {
        label: "Throughput",
        value: 1280,
        suffix: "/day",
        color: "text-purple-400",
        trend: "#a78bfa",
      },
      {
        label: "Downtime",
        value: 3,
        suffix: "%",
        color: "text-yellow-400",
        trend: "#facc15",
      },
      {
        label: "Efficiency Gain",
        value: 18,
        suffix: "%",
        color: "text-cyan-400",
        trend: "#22d3ee",
      },
    ],
    []
  );

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen transition-all duration-500 p-6 font-mono ${
        theme === "dark"
          ? "bg-[#0d1117] text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Production KPI</h1>
          <p className="text-sm text-gray-400">
            Real-time industrial performance intelligence system
          </p>
        </div>

        <button
          onClick={() =>
            setTheme((p) => (p === "dark" ? "light" : "dark"))
          }
          className="px-4 py-2 rounded-lg border border-gray-700 hover:scale-105 transition"
        >
          Toggle Theme
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!mounted
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : kpis.map((kpi, i) => (
              <div
                key={i}
                className="relative bg-[#161b22] border border-gray-800 p-6 rounded-xl overflow-hidden hover:scale-[1.02] transition"
              >
                <p className="text-xs text-gray-400 uppercase">
                  {kpi.label}
                </p>

                <h2
                  className={`text-3xl font-bold mt-2 ${kpi.color}`}
                >
                  <AnimatedNumber value={kpi.value} />
                  {kpi.suffix}
                </h2>

                <div className="absolute bottom-2 right-2">
                  <MiniTrend color={kpi.trend} />
                </div>
              </div>
            ))}
      </div>

      {/* Insight Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-sm text-gray-400 mb-2">
            AI Production Insight
          </h3>
          <p className="text-sm leading-relaxed text-gray-300">
            System predicts stable production flow with minor defect
            risk in Line B. Recommended preventive calibration within
            next 48 hours.
          </p>
        </div>

        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-xl">
          <h3 className="text-sm text-gray-400 mb-2">
            Optimization Status
          </h3>
          <p className="text-sm leading-relaxed text-gray-300">
            Efficiency improved by adaptive load balancing and
            predictive maintenance scheduling across production units.
          </p>
        </div>
      </div>
    </div>
  );
}