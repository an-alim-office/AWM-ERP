"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  MailCheck,
  MessageSquareText,
  MonitorSmartphone,
  RefreshCw,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

type Priority = "Low" | "Medium" | "High" | "Critical";

const priorities: {
  label: Priority;
  color: string;
}[] = [
  {
    label: "Low",
    color:
      "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
  },
  {
    label: "Medium",
    color:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  {
    label: "High",
    color:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  },
  {
    label: "Critical",
    color:
      "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
];

const cn = (...classes: (string | false | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_12px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-[#0f172acc]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.03]" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-3 text-white shadow-lg shadow-blue-500/20">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-12 rounded-2xl bg-slate-200 dark:bg-white/5" />
      <div className="h-40 rounded-3xl bg-slate-200 dark:bg-white/5" />
      <div className="h-12 w-40 rounded-2xl bg-slate-200 dark:bg-white/5" />
    </div>
  );
}

export default function ContactSupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [sent, setSent] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [message]);

  const messageLength = useMemo(() => message.length, [message]);

  const isDisabled =
    !subject.trim() || !message.trim() || loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isDisabled) return;

    setLoading(true);
    setSent(false);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setLoading(false);
    setSent(true);

    setSubject("");
    setMessage("");
    setPriority("Medium");

    setTimeout(() => {
      setSent(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.10),transparent_22%)] px-4 py-6 sm:px-6 lg:px-8 dark:bg-[#020617]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b1220cc]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05),transparent)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02),transparent)]" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                Enterprise Support Center
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                টেকনিক্যাল সাপোর্ট কন্টাক্ট
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                ERP সিস্টেমে কোনো বাগ, অপারেশন সমস্যা, ডাটা ইস্যু,
                পারফরম্যান্স ড্রপ অথবা সিকিউরিটি এলার্ট হলে
                রিয়েল-টাইমে সাপোর্ট টিমকে রিপোর্ট করুন।
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Ticket Routing
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <Wifi className="h-4 w-4" />
                  Live Response System
                </div>
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              <StatCard
                title="Avg Response"
                value="4m"
                icon={<Clock3 className="h-5 w-5" />}
                description="Priority based SLA"
              />

              <StatCard
                title="Resolved"
                value="98.7%"
                icon={<CheckCircle2 className="h-5 w-5" />}
                description="Monthly ticket success"
              />

              <StatCard
                title="Support"
                value="24/7"
                icon={<Headphones className="h-5 w-5" />}
                description="Dedicated IT engineers"
              />

              <StatCard
                title="Monitoring"
                value="Live"
                icon={<MonitorSmartphone className="h-5 w-5" />}
                description="Real-time diagnostics"
              />
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          {/* Form */}
          <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0f172acc]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-cyan-500/[0.04]" />

            <div className="relative">
              {pageLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  {sent && (
                    <div className="mb-6 flex items-start gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-700 shadow-lg shadow-emerald-500/5 dark:text-emerald-400">
                      <div className="rounded-2xl bg-emerald-500/15 p-2">
                        <MailCheck className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-bold">
                          মেসেজ সফলভাবে সাবমিট হয়েছে
                        </h3>

                        <p className="mt-1 text-sm opacity-90">
                          আপনার টিকিটটি IT সাপোর্ট সেন্টারে পাঠানো
                          হয়েছে। খুব দ্রুত টিম আপনার সাথে যোগাযোগ
                          করবে।
                        </p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Subject */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <Bug className="h-4 w-4 text-blue-500" />
                        বিষয় (Subject)
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) =>
                            setSubject(e.target.value)
                          }
                          placeholder="উদা: হাজিরা সিস্টেমে ফিঙ্গারপ্রিন্ট ডাটা মিসিং ইস্যু"
                          required
                          maxLength={120}
                          className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#020817] dark:text-white dark:placeholder:text-slate-500"
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          {subject.length}/120
                        </div>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Issue Priority
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {priorities.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              setPriority(item.label)
                            }
                            className={cn(
                              "rounded-2xl border px-4 py-2 text-sm font-bold transition-all duration-200",
                              item.color,
                              priority === item.label
                                ? "scale-105 ring-2 ring-offset-2 ring-offset-transparent"
                                : "opacity-80 hover:opacity-100"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <MessageSquareText className="h-4 w-4 text-cyan-500" />
                        বিস্তারিত বিবরণ
                      </label>

                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) =>
                            setMessage(e.target.value)
                          }
                          placeholder="আপনার সমস্যার বিস্তারিত লিখুন..."
                          required
                          maxLength={1500}
                          className="min-h-[180px] w-full resize-none overflow-hidden rounded-3xl border border-black/10 bg-white px-5 py-4 text-sm leading-7 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#020817] dark:text-white dark:placeholder:text-slate-500"
                        />

                        <div className="absolute bottom-4 right-4 rounded-xl border border-black/5 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                          {messageLength}/1500
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-4 border-t border-black/5 pt-5 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        All support requests are encrypted &
                        securely processed.
                      </div>

                      <button
                        type="submit"
                        disabled={isDisabled}
                        className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(59,130,246,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            মেসেজ পাঠানো হচ্ছে...
                          </>
                        ) : (
                          <>
                            <SendHorizonal className="h-4 w-4" />
                            মেসেজ সাবমিট করুন
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Status */}
            <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Support Status
                  </p>

                  <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                    All Systems Operational
                  </h3>
                </div>

                <div className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    label: "Server Infrastructure",
                    value: "99.99%",
                  },
                  {
                    label: "ERP Core Services",
                    value: "Healthy",
                  },
                  {
                    label: "Database Replication",
                    value: "Synced",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50 px-4 py-3 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {item.label}
                    </span>

                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172acc]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Smart Support Tips
                </h3>

                <RefreshCw className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-5 space-y-4">
                {[
                  "সমস্যার সময় ও স্ক্রিনশট উল্লেখ করুন",
                  "ইউজার আইডি বা ডিপার্টমেন্ট তথ্য দিন",
                  "কোন মডিউলে সমস্যা হচ্ছে লিখুন",
                  "ডাটা লস বা সিকিউরিটি ইস্যু হলে Critical সিলেক্ট করুন",
                ].map((tip) => (
                  <div
                    key={tip}
                    className="flex items-start gap-3 rounded-2xl border border-black/5 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <div className="mt-0.5 rounded-full bg-blue-500/10 p-1 text-blue-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>

                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}