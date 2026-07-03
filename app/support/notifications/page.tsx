"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Filter,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wifi,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

type NotificationType = "warning" | "success" | "info" | "error";

type Notification = {
  id: number;
  title: string;
  desc: string;
  date: string;
  unread: boolean;
  type: NotificationType;
};

const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const typeConfig: Record<
  NotificationType,
  {
    icon: React.ReactNode;
    color: string;
  }
> = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    color:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color:
      "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "সার্ভার মেইনটেন্যান্স অ্যালার্ট",
    desc: "আগামীকাল রাত ১২:০০ টা থেকে ১:০০ টা পর্যন্ত সিস্টেম আপডেট জনিত মেইনটেন্যান্স চলবে।",
    date: "2026-05-29",
    unread: true,
    type: "warning",
  },
  {
    id: 2,
    title: "মে মাসের স্যালারি প্রসেসিং সম্পন্ন",
    desc: "সকল ডিপার্টমেন্টের মে মাসের পে-রোল শীট জেনারেট করা হয়েছে, অনুমোদনের জন্য অপেক্ষা করছে।",
    date: "2026-05-28",
    unread: false,
    type: "success",
  },
];

export default function NotificationsSupportPage() {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "unread" | "read"
  >("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(q) ||
        n.desc.toLowerCase().includes(q) ||
        n.date.includes(q);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "unread"
          ? n.unread
          : !n.unread;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, query, filter]);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, unread: !n.unread } : n
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.10),transparent_25%)] px-4 py-6 sm:px-6 lg:px-8 dark:bg-[#020617]">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b1220cc]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.04] to-cyan-500/[0.03]" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                System Alerts
              </div>

              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                নোটিফিকেশন সেন্টার
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                কোম্পানির অভ্যন্তরীণ ঘোষণা এবং ERP সিস্টেম জেনারেটেড
                তাৎক্ষণিক এলার্টসমূহ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-[#020817] dark:text-slate-200">
                <Bell className="h-4 w-4 text-blue-500" />
                Unread: {unreadCount}
              </div>

              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#020817] dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-bold transition",
                  filter === f
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                    : "bg-white text-slate-600 border-black/10 dark:bg-[#020817] dark:text-slate-300 dark:border-white/10"
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-black/5 bg-white/80 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#0f172acc] dark:text-slate-400">
              কোনো নোটিফিকেশন পাওয়া যায়নি
            </div>
          )}

          {filtered.map((n) => {
            const cfg = typeConfig[n.type];

            return (
              <div
                key={n.id}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border bg-white/80 p-5 shadow-md backdrop-blur-xl transition hover:-translate-y-0.5 dark:bg-[#0f172acc]",
                  n.unread
                    ? "border-blue-500/20"
                    : "border-black/5 dark:border-white/10"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* unread dot */}
                  <div className="mt-2">
                    <span
                      className={cn(
                        "block h-2.5 w-2.5 rounded-full",
                        n.unread
                          ? "bg-blue-500 animate-pulse"
                          : "bg-slate-300"
                      )}
                    />
                  </div>

                  {/* icon */}
                  <div
                    className={cn(
                      "rounded-2xl border p-2",
                      cfg.color
                    )}
                  >
                    {cfg.icon}
                  </div>

                  {/* content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3
                        className={cn(
                          "text-sm font-black",
                          n.unread
                            ? "text-blue-900 dark:text-white"
                            : "text-slate-800 dark:text-white"
                        )}
                      >
                        {n.title}
                      </h3>

                      <span className="text-xs font-mono text-slate-400">
                        {n.date}
                      </span>
                    </div>

                    <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
                      {n.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className="rounded-xl border border-black/10 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#020817] dark:text-slate-300"
                      >
                        Toggle Read
                      </button>

                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}