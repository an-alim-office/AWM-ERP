"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Lightbulb,
  MessageCircleQuestion,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

type FAQ = {
  q: string;
  a: string;
  tag?: string;
};

const faqs: FAQ[] = [
  {
    q: "নতুন কর্মীর ফিঙ্গারপ্রিন্ট বা ফেস আইডি কীভাবে রেজিস্টার করব?",
    a: "প্রথমে Employees মডিউলে গিয়ে নতুন কর্মী যুক্ত করুন, তারপর ডিভাইস ম্যানেজার ওপেন করে কর্মীর আইডি ট্যাগ করে বায়োমেট্রিক ডাটা সিঙ্ক করে নিন।",
    tag: "HR",
  },
  {
    q: "ওভারটাইম রুলস পরিবর্তন করলে কি পুরাতন বেতনে প্রভাব পড়বে?",
    a: "না, রুলস পরিবর্তন করার পর থেকে নতুন যে হাজিরা এবং ওভারটাইম কাউন্ট হবে শুধুমাত্র সেগুলোর উপর নতুন রেট প্রযোজ্য হবে।",
    tag: "Payroll",
  },
  {
    q: "এক্সেল বা পিডিএফ রিপোর্ট ডাউনলোড না হলে কী করণীয়?",
    a: "আপনার ব্রাউজারের পপ-আপ ব্লকার অপশনটি চেক করুন এবং 'Allow Popups from AWM-ERP' এনাবল করে দিন।",
    tag: "Reports",
  },
];

const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export default function HelpCenterPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;

    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tag?.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
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
                Knowledge Base
              </div>

              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                সহায়তা কেন্দ্র (Help Center & FAQ)
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                AWM-ERP সিস্টেম ব্যবহারের সাধারণ প্রশ্ন এবং তাৎক্ষণিক সমাধান
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#020817]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="FAQ search..."
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_15px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all dark:border-white/10 dark:bg-[#0f172acc]"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-blue-500/[0.03]"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                      <MessageCircleQuestion className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {faq.q}
                      </p>

                      {faq.tag && (
                        <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
                          {faq.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-400 transition-transform",
                      isOpen && "rotate-180 text-blue-500"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-black/5 bg-white px-5 py-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="rounded-3xl border border-black/5 bg-white/80 p-10 text-center text-sm text-slate-500 shadow-lg dark:border-white/10 dark:bg-[#0f172acc] dark:text-slate-400">
              কোনো FAQ পাওয়া যায়নি
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          আরও প্রশ্ন থাকলে Support টিকেট ওপেন করুন
          <Zap className="h-4 w-4 text-blue-500" />
        </div>
      </div>
    </div>
  );
}