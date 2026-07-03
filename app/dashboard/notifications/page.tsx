"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type NotificationType =
  | "system"
  | "biometric"
  | "security"
  | "billing";

type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  priority: "high" | "medium" | "low";
};

const notificationConfig: Record<
  NotificationType,
  {
    label: string;
    icon: string;
    badge: string;
    glow: string;
  }
> = {
  system: {
    label: "AI Core",
    icon: "✦",
    badge:
      "bg-violet-500/10 text-violet-400 border-violet-500/20",
    glow: "from-violet-500/20 to-fuchsia-500/5",
  },
  biometric: {
    label: "Biometric",
    icon: "◉",
    badge:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "from-emerald-500/20 to-cyan-500/5",
  },
  security: {
    label: "Security",
    icon: "⬢",
    badge:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
    glow: "from-amber-500/20 to-orange-500/5",
  },
  billing: {
    label: "Finance",
    icon: "◈",
    badge:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    glow: "from-blue-500/20 to-cyan-500/5",
  },
};

const priorityStyles = {
  high: "text-rose-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="h-11 w-11 rounded-2xl bg-white/[0.05]" />

          <div className="flex-1">
            <div className="h-4 w-44 rounded bg-white/[0.06]" />

            <div className="mt-3 h-3 w-full rounded bg-white/[0.04]" />

            <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.04]" />
          </div>
        </div>

        <div className="h-3 w-16 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
});

export default function NotificationsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState<
      | "all"
      | NotificationType
      | "unread"
    >("all");

  const [search, setSearch] =
    useState("");

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([
      {
        id: 1,
        type: "system",
        title:
          "AI Optimization Complete",
        message:
          "AWM Synapse AI has successfully optimized worker shifts for maximum efficiency.",
        time: "5 mins ago",
        unread: true,
        priority: "high",
      },
      {
        id: 2,
        type: "biometric",
        title:
          "Biometric Device Synced",
        message:
          "Main gate fingerprint scanner node #4 logs successfully synced (485 workers active).",
        time: "20 mins ago",
        unread: true,
        priority: "medium",
      },
      {
        id: 3,
        type: "security",
        title:
          "New IP Access Allowed",
        message:
          "A secure access token was generated for a Riyadh-based operational terminal.",
        time: "1 hour ago",
        unread: false,
        priority: "high",
      },
      {
        id: 4,
        type: "billing",
        title:
          "Cloud Subscription Renewed",
        message:
          "Successful crypto-card payment processing via RedotPay for cluster maintenance.",
        time: "Yesterday",
        unread: false,
        priority: "low",
      },
      {
        id: 5,
        type: "system",
        title:
          "Autonomous ERP Sync Triggered",
        message:
          "Regional AI nodes synchronized workforce analytics across all operational branches.",
        time: "Yesterday",
        unread: true,
        priority: "medium",
      },
    ]);

  useEffect(() => {
    const storedTheme =
      localStorage.getItem(
        "awm-notification-theme"
      );

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }

    const timer = setTimeout(() => {
      setMounted(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "awm-notification-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (n) => n.unread
      ).length,
    [notifications]
  );

  const filteredNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) => {
          const query =
            search.toLowerCase();

          const matchesSearch =
            notification.title
              .toLowerCase()
              .includes(query) ||
            notification.message
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            activeFilter === "all"
              ? true
              : activeFilter ===
                "unread"
              ? notification.unread
              : notification.type ===
                activeFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      notifications,
      search,
      activeFilter,
    ]);

  const markAllAsRead =
    useCallback(() => {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          unread: false,
        }))
      );
    }, []);

  const toggleReadStatus =
    useCallback((id: number) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                unread: !n.unread,
              }
            : n
        )
      );
    }, []);

  const theme = darkMode
    ? {
        bg: "bg-[#050816]",
        card:
          "bg-white/[0.04] backdrop-blur-2xl",
        border: "border-white/10",
        text: "text-white",
        muted: "text-slate-400",
        soft: "bg-white/[0.03]",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
      }
    : {
        bg: "bg-[#f3f7fc]",
        card:
          "bg-white/80 backdrop-blur-2xl",
        border: "border-slate-200",
        text: "text-slate-900",
        muted: "text-slate-500",
        soft: "bg-slate-100",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
      };

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-300 ${theme.bg} ${theme.text}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-[40%] top-[20%] h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 xl:p-8">
        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[38px] border p-6 sm:p-8 xl:p-10 ${theme.card} ${theme.border}`}
        >
          <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-400">
                Synapse Notification Matrix
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Notification Center
              </h1>

              <p
                className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${theme.muted}`}
              >
                AI-powered enterprise
                notification hub for
                biometric sync alerts,
                security routing,
                infrastructure monitoring,
                finance events and global
                operational insights.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() =>
                  setDarkMode(
                    (prev) => !prev
                  )
                }
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.border} ${theme.soft}`}
              >
                <span>
                  {darkMode ? "🌙" : "☀️"}
                </span>

                {darkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </button>

              <button
                onClick={markAllAsRead}
                disabled={!unreadCount}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-400 transition-all duration-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* TOP STATS */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Unread Alerts",
                value: unreadCount,
                color:
                  "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
              },
              {
                title: "Security Events",
                value:
                  notifications.filter(
                    (n) =>
                      n.type ===
                      "security"
                  ).length,
                color:
                  "border-amber-500/20 bg-amber-500/10 text-amber-400",
              },
              {
                title: "AI Sync Events",
                value:
                  notifications.filter(
                    (n) =>
                      n.type ===
                      "system"
                  ).length,
                color:
                  "border-violet-500/20 bg-violet-500/10 text-violet-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-[28px] border p-5 ${theme.soft} ${theme.border}`}
              >
                <div
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${item.color}`}
                >
                  {item.title}
                </div>

                <h2 className="mt-4 text-4xl font-black tracking-tight">
                  {item.value}
                </h2>
              </div>
            ))}
          </div>
        </section>

        {/* FILTER BAR */}
        <section
          className={`mt-8 rounded-[34px] border p-5 ${theme.card} ${theme.border}`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {[
                {
                  key: "all",
                  label: "All",
                },
                {
                  key: "unread",
                  label: "Unread",
                },
                {
                  key: "system",
                  label: "AI",
                },
                {
                  key: "biometric",
                  label: "Biometric",
                },
                {
                  key: "security",
                  label: "Security",
                },
                {
                  key: "billing",
                  label: "Finance",
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() =>
                    setActiveFilter(
                      filter.key as
                        | "all"
                        | "unread"
                        | NotificationType
                    )
                  }
                  className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                    activeFilter ===
                    filter.key
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : `${theme.border} ${theme.muted} hover:border-white/20`
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="w-full xl:w-[320px]">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search notifications..."
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none transition-all focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 ${theme.input}`}
              />
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-8">
          {!mounted ? (
            <div className="space-y-5">
              {[...Array(5)].map(
                (_, index) => (
                  <SkeletonCard
                    key={index}
                  />
                )
              )}
            </div>
          ) : filteredNotifications.length ===
            0 ? (
            <div
              className={`rounded-[34px] border p-10 text-center ${theme.card} ${theme.border}`}
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-3xl">
                🔔
              </div>

              <h3 className="mt-6 text-2xl font-black">
                No Notifications Found
              </h3>

              <p
                className={`mt-3 text-sm ${theme.muted}`}
              >
                Try changing filters or
                search terms.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredNotifications.map(
                (notification) => {
                  const config =
                    notificationConfig[
                      notification.type
                    ];

                  return (
                    <article
                      key={
                        notification.id
                      }
                      className={`group relative overflow-hidden rounded-[34px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-6 ${
                        notification.unread
                          ? "border-cyan-500/20 bg-cyan-500/[0.05]"
                          : `${theme.card} ${theme.border}`
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${config.glow}`}
                      />

                      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-1 gap-4">
                          {/* ICON */}
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-black ${config.badge}`}
                          >
                            {
                              config.icon
                            }
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${config.badge}`}
                              >
                                {
                                  config.label
                                }
                              </span>

                              <span
                                className={`text-[11px] font-black uppercase tracking-[0.18em] ${
                                  priorityStyles[
                                    notification
                                      .priority
                                  ]
                                }`}
                              >
                                {
                                  notification.priority
                                }{" "}
                                priority
                              </span>

                              {notification.unread && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                                  <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                                  </span>

                                  New
                                </span>
                              )}
                            </div>

                            <h2 className="mt-4 text-xl font-black tracking-tight">
                              {
                                notification.title
                              }
                            </h2>

                            <p
                              className={`mt-3 max-w-4xl text-sm leading-7 ${theme.muted}`}
                            >
                              {
                                notification.message
                              }
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                              <button
                                onClick={() =>
                                  toggleReadStatus(
                                    notification.id
                                  )
                                }
                                className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] ${
                                  notification.unread
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                                }`}
                              >
                                {notification.unread
                                  ? "Mark Read"
                                  : "Mark Unread"}
                              </button>

                              <button
                                className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all duration-300 hover:border-cyan-500/30 hover:text-cyan-400 ${theme.border} ${theme.muted}`}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* TIME */}
                        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                          <div
                            className={`rounded-2xl border px-4 py-2 text-xs font-black ${theme.border} ${theme.soft}`}
                          >
                            {
                              notification.time
                            }
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                              notification.unread
                                ? "bg-cyan-500/10 text-cyan-400"
                                : `${theme.soft} ${theme.muted}`
                            }`}
                          >
                            {notification.unread
                              ? "Unread"
                              : "Archived"}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(
              120,
              120,
              120,
              0.3
            )
            transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(
            120,
            120,
            120,
            0.3
          );
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}