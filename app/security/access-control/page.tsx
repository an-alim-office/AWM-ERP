"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

type AccessStatus =
  | "ACTIVE"
  | "ENABLED"
  | "RESTRICTED"
  | "MONITORED";

type UserRole =
  | "Super Admin"
  | "Finance Manager"
  | "HR Manager"
  | "Operations Lead"
  | "Support Agent";

interface Permission {
  id: string;
  module: string;
  role: UserRole;
  access: string;
  lastUpdated: string;
  status: AccessStatus;
  risk: number;
}

const permissionsSeed: Permission[] = [
  {
    id: "ACL-1001",
    module: "Financial Intelligence",
    role: "Finance Manager",
    access: "Full Access",
    lastUpdated: "2026-06-29 08:15",
    status: "ACTIVE",
    risk: 12,
  },
  {
    id: "ACL-1002",
    module: "Employee Payroll",
    role: "HR Manager",
    access: "Restricted Access",
    lastUpdated: "2026-06-29 09:42",
    status: "RESTRICTED",
    risk: 42,
  },
  {
    id: "ACL-1003",
    module: "Operations Dashboard",
    role: "Operations Lead",
    access: "Realtime Monitoring",
    lastUpdated: "2026-06-28 18:04",
    status: "MONITORED",
    risk: 18,
  },
  {
    id: "ACL-1004",
    module: "Client Support Center",
    role: "Support Agent",
    access: "Limited Access",
    lastUpdated: "2026-06-28 12:10",
    status: "ENABLED",
    risk: 8,
  },
  {
    id: "ACL-1005",
    module: "Core System Administration",
    role: "Super Admin",
    access: "Global Authorization",
    lastUpdated: "2026-06-29 07:22",
    status: "ACTIVE",
    risk: 5,
  },
];

const cn = (
  ...classes: (string | false | null | undefined)[]
) => classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const statusStyles: Record<
  AccessStatus,
  string
> = {
  ACTIVE:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  ENABLED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  RESTRICTED:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  MONITORED:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
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

export default function AccessControlPage() {
  const [mounted, setMounted] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | AccessStatus
    >("All");

  const [sortBy, setSortBy] =
    useState<
      "risk" | "lastUpdated"
    >("lastUpdated");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 500);

    return () =>
      window.clearTimeout(timer);
  }, []);

  const filteredPermissions =
    useMemo(() => {
      const normalized =
        search.toLowerCase();

      return permissionsSeed
        .filter((item) => {
          const queryMatch =
            item.module
              .toLowerCase()
              .includes(normalized) ||
            item.role
              .toLowerCase()
              .includes(normalized) ||
            item.id
              .toLowerCase()
              .includes(normalized);

          const statusMatch =
            statusFilter ===
              "All" ||
            item.status ===
              statusFilter;

          return (
            queryMatch &&
            statusMatch
          );
        })
        .sort((a, b) => {
          if (
            sortBy ===
            "lastUpdated"
          ) {
            return (
              new Date(
                b.lastUpdated
              ).getTime() -
              new Date(
                a.lastUpdated
              ).getTime()
            );
          }

          return b.risk - a.risk;
        });
    }, [
      search,
      statusFilter,
      sortBy,
    ]);

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
                  Enterprise Security Mesh Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Access Control
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Advanced enterprise-grade
                  authorization management with
                  intelligent role segmentation,
                  realtime monitoring, AI-powered
                  threat analysis, and secure access
                  orchestration infrastructure.
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
                      title="Protected Endpoints"
                      value="12.4K"
                      sub="Secure enterprise routing"
                    />

                    <StatCard
                      title="Security Score"
                      value="98.8%"
                      sub="Zero-trust architecture active"
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
                  title="Active Roles"
                  value="148"
                  sub="Granular enterprise permissions"
                />

                <StatCard
                  title="2FA Protection"
                  value="100%"
                  sub="Realtime identity verification"
                />

                <StatCard
                  title="Threat Detection"
                  value="24/7"
                  sub="AI-driven anomaly monitoring"
                />

                <StatCard
                  title="Secure Sessions"
                  value="8,924"
                  sub="Encrypted access infrastructure"
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
                    Security Overview
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Enterprise-grade protection
                    infrastructure
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  SECURED
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title:
                      "Admin Privileges",
                    status:
                      "ACTIVE",
                    desc: "Realtime authorization enabled",
                    style:
                      "text-cyan-300 border-cyan-500/20 bg-cyan-500/10",
                  },
                  {
                    title:
                      "Two-Factor Authentication",
                    status:
                      "ENABLED",
                    desc: "Identity validation active",
                    style:
                      "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
                  },
                  {
                    title:
                      "Zero Trust Firewall",
                    status:
                      "MONITORED",
                    desc: "Continuous AI inspection",
                    style:
                      "text-amber-300 border-amber-500/20 bg-amber-500/10",
                  },
                  {
                    title:
                      "Suspicious Login Detection",
                    status:
                      "RESTRICTED",
                    desc: "Risk mitigation policies applied",
                    style:
                      "text-rose-300 border-rose-500/20 bg-rose-500/10",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-xs text-zinc-500">
                          {item.desc}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "rounded-full border px-3 py-1 text-[10px] font-black tracking-widest",
                          item.style
                        )}
                      >
                        {item.status}
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
                    AI Security Insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Autonomous access intelligence
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  LIVE AI
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Multiple login attempts blocked by adaptive security layer.",
                  "Finance access privileges automatically revalidated.",
                  "AI detected abnormal API access frequency in CRM module.",
                  "Zero-trust network segmentation optimized successfully.",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
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
                      Quantum Security Layer
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      Advanced encryption orchestration
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
                <h2 className="text-2xl font-black text-white">
                  Permission Matrix
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Advanced enterprise authorization
                  management system
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  aria-label="Search permissions"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search modules, roles, IDs..."
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40 focus:bg-[#0f172a]"
                />

                <select
                  aria-label="Filter status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target
                        .value as
                        | "All"
                        | AccessStatus
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="ENABLED">
                    ENABLED
                  </option>

                  <option value="MONITORED">
                    MONITORED
                  </option>

                  <option value="RESTRICTED">
                    RESTRICTED
                  </option>
                </select>

                <select
                  aria-label="Sort permissions"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target
                        .value as
                        | "risk"
                        | "lastUpdated"
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1220]/80 px-4 text-sm text-zinc-300 outline-none transition-all duration-300 focus:border-cyan-400/40"
                >
                  <option value="lastUpdated">
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
                        "Access ID",
                        "Module",
                        "Role",
                        "Permission",
                        "Risk",
                        "Last Updated",
                        "Status",
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
                    {filteredPermissions.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-t border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-sm font-bold text-cyan-300">
                            {item.id}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {item.module}
                              </span>

                              <span className="mt-1 text-xs text-zinc-500">
                                Enterprise Access Layer
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {item.role}
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            {item.access}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    item.risk >
                                      30
                                      ? "bg-gradient-to-r from-rose-500 to-orange-500"
                                      : "bg-gradient-to-r from-cyan-400 to-sky-500"
                                  )}
                                  style={{
                                    width: `${item.risk}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-zinc-300">
                                {
                                  item.risk
                                }
                                %
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                            {
                              item.lastUpdated
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                                statusStyles[
                                  item.status
                                ]
                              )}
                            >
                              {
                                item.status
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}

                    {!filteredPermissions.length && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-zinc-500"
                        >
                          No access permissions found.
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