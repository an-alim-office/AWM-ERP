"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type InsightPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type InsightStatus =
  | "Monitoring"
  | "Detected"
  | "Resolved";

interface AIInsight {
  id: string;
  title: string;
  department: string;
  confidence: number;
  impact: string;
  recommendation: string;
  status: InsightStatus;
  priority: InsightPriority;
}

const insightsData: AIInsight[] = [
  {
    id: "AI-001",
    title: "Production Bottleneck Detected",
    department: "Manufacturing",
    confidence: 94,
    impact: "$48K potential weekly loss",
    recommendation:
      "Increase Assembly Line A throughput by 12%",
    status: "Detected",
    priority: "Critical",
  },
  {
    id: "AI-002",
    title: "Inventory Overstock Prediction",
    department: "Supply Chain",
    confidence: 88,
    impact: "$21K storage optimization",
    recommendation:
      "Reduce procurement cycle for aluminium coils",
    status: "Monitoring",
    priority: "High",
  },
  {
    id: "AI-003",
    title: "Energy Consumption Optimization",
    department: "Utilities",
    confidence: 91,
    impact: "17% energy savings forecast",
    recommendation:
      "Enable smart machine idle shutdown scheduling",
    status: "Monitoring",
    priority: "Medium",
  },
  {
    id: "AI-004",
    title: "Predictive Maintenance Completed",
    department: "Operations",
    confidence: 97,
    impact: "Avoided 14h downtime",
    recommendation:
      "Continue autonomous monitoring workflow",
    status: "Resolved",
    priority: "Low",
  },
];

const priorityStyles: Record<InsightPriority, string> = {
  Low: "text-emerald-400",
  Medium: "text-cyan-400",
  High: "text-amber-400",
  Critical: "text-red-400",
};

const statusStyles: Record<InsightStatus, string> = {
  Monitoring:
    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  Detected:
    "bg-red-500/10 text-red-400 border border-red-500/20",
  Resolved:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[130px] rounded-3xl border border-white/5 bg-[#161b22] animate-pulse" />
));

SkeletonCard.displayName = "SkeletonCard";

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          value >= 90
            ? "bg-emerald-400"
            : value >= 75
            ? "bg-cyan-400"
            : value >= 50
            ? "bg-amber-400"
            : "bg-red-400"
        }`}
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

export default function AIInsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    InsightStatus | "ALL"
  >("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const filteredInsights = useMemo(() => {
    let data = [...insightsData];

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.department
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter(
        (item) => item.status === statusFilter
      );
    }

    return data;
  }, [search, statusFilter]);

  const metrics = useMemo(() => {
    return {
      activeModels: 24,
      aiAccuracy: 96.4,
      predictions: 1482,
      automationRate: 82,
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0d1117] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

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
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Enterprise Intelligence Engine
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              AI Insights
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              Autonomous predictive intelligence, anomaly
              detection, business forecasting, and enterprise AI
              optimization platform.
            </p>
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/30"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Active Models
            </p>

            <h2 className="mt-2 text-3xl font-black text-cyan-400">
              {metrics.activeModels}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              AI Accuracy
            </p>

            <h2 className="mt-2 text-3xl font-black text-emerald-400">
              {metrics.aiAccuracy}%
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Predictions
            </p>

            <h2 className="mt-2 text-3xl font-black text-violet-400">
              {metrics.predictions}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Automation Rate
            </p>

            <h2 className="mt-2 text-3xl font-black text-amber-400">
              {metrics.automationRate}%
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <input
            aria-label="Search AI insights"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insight or department..."
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          />

          <select
            aria-label="Filter AI status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as InsightStatus | "ALL"
              )
            }
            className="h-14 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm outline-none backdrop-blur-xl transition-all duration-300 focus:border-cyan-400/40"
          >
            <option value="ALL">All Status</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Detected">Detected</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* AI Insights Table */}
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="border-b border-white/5 bg-black/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Insight
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Department
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    AI Confidence
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Business Impact
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Recommendation
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Priority
                  </th>

                  <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredInsights.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold tracking-tight">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-cyan-400">
                          {item.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold">
                      {item.department}
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Prediction Score</span>

                          <span className="font-bold text-white">
                            {item.confidence}%
                          </span>
                        </div>

                        <ConfidenceBar
                          value={item.confidence}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-emerald-300">
                      {item.impact}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300 max-w-[280px]">
                      {item.recommendation}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`text-sm font-black tracking-wide ${priorityStyles[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intelligence Panels */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* AI Prediction Matrix */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Prediction Matrix
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Real-time enterprise anomaly detection
                </p>
              </div>

              <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                Neural Sync
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[92, 77, 58, 41, 88, 64, 95, 72].map(
                (score, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div
                      className={`h-16 rounded-xl transition-all duration-1000 ${
                        score >= 85
                          ? "bg-emerald-500/30"
                          : score >= 60
                          ? "bg-cyan-500/30"
                          : "bg-red-500/30"
                      }`}
                    />

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        AI-{index + 1}
                      </span>

                      <span className="text-xs font-bold text-white">
                        {score}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Autonomous AI Engine */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-black tracking-tight">
                Autonomous Intelligence
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                AI-driven enterprise automation performance
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  label: "Operational Optimization",
                  progress: 92,
                  color: "bg-emerald-400",
                },
                {
                  label: "Risk Prediction",
                  progress: 81,
                  color: "bg-cyan-400",
                },
                {
                  label: "Decision Automation",
                  progress: 67,
                  color: "bg-violet-400",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                    <span className="text-xs text-gray-400">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-black/20">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                      style={{
                        width: `${item.progress}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-violet-500/10 bg-violet-500/5 p-4">
              <p className="text-sm font-bold text-violet-300">
                AI Executive Recommendation
              </p>

              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Machine learning analysis predicts a 14.2%
                operational efficiency increase through adaptive
                scheduling and autonomous supply chain balancing.
              </p>
            </div>
          </div>
        </div>

        {/* Empty */}
        {filteredInsights.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <h3 className="text-xl font-bold">
              No AI insights found
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Try adjusting search keywords or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}