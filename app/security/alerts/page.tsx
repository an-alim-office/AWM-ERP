"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type AlertSeverity =
  | "Critical"
  | "Warning"
  | "Info";

type AlertStatus =
  | "Active"
  | "Investigating"
  | "Resolved";

interface SecurityAlert {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  severity: AlertSeverity;
  status: AlertStatus;
  risk: number;
  description: string;
}

const alertsSeed: SecurityAlert[] = [
  {
    id: "SEC-9001",
    title:
      "Unauthorized Login Attempt",
    source: "Identity Gateway",
    timestamp: "2026-06-29 16:15",
    severity: "Critical",
    status: "Active",
    risk: 96,
    description:
      "Multiple failed privileged access attempts detected from external endpoint.",
  },
  {
    id: "SEC-9002",
    title:
      "Unusual Traffic Pattern",
    source: "Gateway_Alpha",
    timestamp: "2026-06-29 14:20",
    severity: "Warning",
    status: "Investigating",
    risk: 72,
    description:
      "Outbound request spike exceeded adaptive threshold policies.",
  },
  {
    id: "SEC-9003",
    title:
      "API Rate Limit Breach",
    source: "Core API Cluster",
    timestamp: "2026-06-29 13:02",
    severity: "Critical",
    status: "Investigating",
    risk: 88,
    description:
      "AI firewall detected excessive token generation requests.",
  },
  {
    id: "SEC-9004",
    title:
      "Security Patch Applied",
    source: "Infrastructure Node",
    timestamp: "2026-06-28 22:40",
    severity: "Info",
    status: "Resolved",
    risk: 12,
    description:
      "Autonomous infrastructure patch orchestration completed successfully.",
  },
  {
    id: "SEC-9005",
    title:
      "Device Authentication Drift",
    source: "Zero Trust Layer",
    timestamp: "2026-06-28 18:12",
    severity: "Warning",
    status: "Active",
    risk: 64,
    description:
      "Endpoint behavior deviated from approved security baseline.",
  },
];

const cn = (
  ...classes: (
    | string
    | false
    | undefined
    | null
  )[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const severityStyles: Record<
  AlertSeverity,
  string
> = {
  Critical:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  Warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Info: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
};

const statusStyles: Record<
  AlertStatus,
  string
> = {
  Active:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  Investigating:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Resolved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

const SkeletonCard = memo(
  function SkeletonCard() {
    return (
      <div
        className={cn(
          "h-36 rounded-[28px] border border-white/10 bg-white/[0.03]",
          shimmer
        )}
      />
    );
  }
);

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
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_42%)]" />

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

export default function SecurityAlertsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState<
    "All" | AlertSeverity
  >("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | AlertStatus
  >("All");

  const [sortBy, setSortBy] =
    useState<
      "timestamp" | "risk"
    >("timestamp");

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setMounted(true);
      }, 500);

    return () =>
      window.clearTimeout(timer);
  }, []);

  const filteredAlerts =
    useMemo(() => {
      const normalized =
        query.toLowerCase();

      return alertsSeed
        .filter((item) => {
          const matchesSearch =
            item.title
              .toLowerCase()
              .includes(normalized) ||
            item.source
              .toLowerCase()
              .includes(normalized) ||
            item.id
              .toLowerCase()
              .includes(normalized);

          const matchesSeverity =
            severityFilter ===
              "All" ||
            item.severity ===
              severityFilter;

          const matchesStatus =
            statusFilter ===
              "All" ||
            item.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesSeverity &&
            matchesStatus
          );
        })
        .sort((a, b) => {
          if (
            sortBy ===
            "timestamp"
          ) {
            return (
              new Date(
                b.timestamp
              ).getTime() -
              new Date(
                a.timestamp
              ).getTime()
            );
          }

          return b.risk - a.risk;
        });
    }, [
      query,
      severityFilter,
      statusFilter,
      sortBy,
    ]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.10),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1900px]">
          <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_38%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                  Threat Intelligence Network Live
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Security Alerts
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Realtime enterprise incident
                  monitoring with autonomous
                  AI-powered threat detection,
                  anomaly analysis, behavioral
                  security intelligence, and
                  zero-trust infrastructure
                  protection.
                </p>
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
                      title="Threats Blocked"
                      value="18,492"
                      sub="Adaptive firewall automation"
                    />

                    <StatCard
                      title="System Integrity"
                      value="99.98%"
                      sub="Realtime infrastructure health"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {mounted ? (
              <>
                <StatCard
                  title="Critical Alerts"
                  value="12"
                  sub="High-priority threat incidents"
                />

                <StatCard
                  title="Investigations"
                  value="34"
                  sub="Autonomous AI inspection active"
                />

                <StatCard
                  title="Resolved Threats"
                  value="1,284"
                  sub="Secure mitigation completed"
                />

                <StatCard
                  title="Response Latency"
                  value="0.4s"
                  sub="Average realtime detection speed"
                />
              </>
            ) : (
              Array.from({
                length: 4,
              }).map((_, idx) => (
                <SkeletonCard
                  key={idx}
                />
              ))
            )}
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Threat Intelligence Feed
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Autonomous anomaly detection
                    infrastructure
                  </p>
                </div>

                <div className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">
                  LIVE
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title:
                      "Unauthorized privileged access attempt blocked automatically.",
                    style:
                      "border-rose-500/20 bg-rose-500/10 text-rose-300",
                  },
                  {
                    title:
                      "AI identified unusual outbound traffic from regional gateway.",
                    style:
                      "border-amber-500/20 bg-amber-500/10 text-amber-300",
                  },
                  {
                    title:
                      "Zero-trust policy synchronized successfully across infrastructure.",
                    style:
                      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
                  },
                  {
                    title:
                      "Malicious API signature isolated before escalation.",
                    style:
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-[26px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "mt-1 h-3 w-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                          item.style
                        )}
                      />

                      <div>
                        <p className="text-sm leading-7 text-zinc-300">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Security Engine
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Predictive cyber defense layer
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  ACTIVE
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title:
                      "Realtime Intrusion Detection",
                    value: "98%",
                  },
                  {
                    title:
                      "AI Firewall Confidence",
                    value: "96%",
                  },
                  {
                    title:
                      "Threat Prediction Accuracy",
                    value: "94%",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-zinc-300">
                        {item.title}
                      </span>

                      <span className="font-black text-cyan-300">
                        {item.value}
                      </span>
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

                <div className="rounded-[26px] border border-dashed border-cyan-400/20 bg-cyan-500/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Autonomous Threat Response
                      </h3>

                      <p className="mt-1 text-xs text-zinc-400">
                        AI-driven mitigation orchestration
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Incident Monitoring Grid
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Realtime enterprise security
                  monitoring infrastructure
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  aria-label="Search alerts"
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search alerts, sources, IDs..."
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40 focus:bg-[#0f172a]"
                />

                <select
                  aria-label="Filter severity"
                  value={
                    severityFilter
                  }
                  onChange={(e) =>
                    setSeverityFilter(
                      e.target
                        .value as
                        | "All"
                        | AlertSeverity
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Severity
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                  <option value="Warning">
                    Warning
                  </option>

                  <option value="Info">
                    Info
                  </option>
                </select>

                <select
                  aria-label="Filter status"
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target
                        .value as
                        | "All"
                        | AlertStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Investigating">
                    Investigating
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>
                </select>

                <select
                  aria-label="Sort alerts"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target
                        .value as
                        | "timestamp"
                        | "risk"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="timestamp">
                    Latest
                  </option>

                  <option value="risk">
                    Risk Score
                  </option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-white/[0.04]">
                    <tr>
                      {[
                        "Alert ID",
                        "Threat",
                        "Source",
                        "Severity",
                        "Status",
                        "Risk",
                        "Timestamp",
                      ].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAlerts.map(
                      (alert) => (
                        <tr
                          key={
                            alert.id
                          }
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-sm font-bold text-cyan-300">
                            {
                              alert.id
                            }
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {
                                  alert.title
                                }
                              </span>

                              <span className="mt-1 text-xs text-zinc-500">
                                {
                                  alert.description
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {
                              alert.source
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                                severityStyles[
                                  alert
                                    .severity
                                ]
                              )}
                            >
                              {
                                alert.severity
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                                statusStyles[
                                  alert
                                    .status
                                ]
                              )}
                            >
                              {
                                alert.status
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    alert.risk >
                                      80
                                      ? "bg-gradient-to-r from-rose-500 to-orange-500"
                                      : alert.risk >
                                        50
                                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                      : "bg-gradient-to-r from-cyan-400 to-sky-500"
                                  )}
                                  style={{
                                    width: `${alert.risk}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-zinc-300">
                                {
                                  alert.risk
                                }
                                %
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {
                              alert.timestamp
                            }
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredAlerts.length && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No security alerts found.
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