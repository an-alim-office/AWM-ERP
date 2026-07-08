"use client";

import React, {
  memo,
  Suspense,
  lazy,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileArchive,
  FileSearch,
  FileText,
  Filter,
  Languages,
  LayoutGrid,
  Loader2,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  confidence: number;
  status: "Processed" | "Analyzing" | "Flagged";
  language: string;
  updatedAt: string;
};

const documents: DocumentItem[] = [
  {
    id: "DOC-9821",
    name: "Vendor Invoice - Q2.pdf",
    type: "Invoice",
    confidence: 98,
    status: "Processed",
    language: "English",
    updatedAt: "2m ago",
  },
  {
    id: "DOC-9211",
    name: "Global Partnership Contract.docx",
    type: "Contract",
    confidence: 94,
    status: "Analyzing",
    language: "English",
    updatedAt: "12m ago",
  },
  {
    id: "DOC-7341",
    name: "Financial Compliance Report.pdf",
    type: "Compliance",
    confidence: 89,
    status: "Flagged",
    language: "German",
    updatedAt: "25m ago",
  },
  {
    id: "DOC-6129",
    name: "Employee Legal Agreement.pdf",
    type: "Legal",
    confidence: 97,
    status: "Processed",
    language: "French",
    updatedAt: "1h ago",
  },
];

const insights = [
  {
    title: "Documents Processed",
    value: "48.2K",
    growth: "+18.2%",
    icon: FileSearch,
  },
  {
    title: "AI Accuracy",
    value: "99.1%",
    growth: "+4.8%",
    icon: BrainCircuit,
  },
  {
    title: "Languages",
    value: "34",
    growth: "+12.6%",
    icon: Languages,
  },
  {
    title: "Risk Detection",
    value: "142",
    growth: "+8.3%",
    icon: ShieldCheck,
  },
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

const AIAnalyticsChart = lazy(() =>
  Promise.resolve({
    default: memo(function AIAnalyticsChart() {
      const chartData = [35, 65, 42, 78, 92, 72, 96];

      return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950 to-violet-500/10 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_30%)]" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                AI Extraction Accuracy
              </p>

              <h3 className="mt-3 text-3xl font-black text-white">
                99.1%
              </h3>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-10 flex h-[220px] items-end justify-between gap-3">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full rounded-t-[24px] bg-gradient-to-t from-cyan-500 via-sky-400 to-violet-400 shadow-[0_20px_40px_rgba(6,182,212,0.25)] transition-all duration-500 group-hover:scale-y-105"
                  style={{
                    height: `${item}%`,
                  }}
                />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                      index
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }),
  })
);

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-6 ${shimmer}`}
    >
      <div className="h-4 w-24 rounded-full bg-white/10" />
      <div className="mt-5 h-8 w-32 rounded-full bg-white/10" />
      <div className="mt-8 h-24 rounded-3xl bg-white/10" />
    </div>
  );
});

export default function AIDocumentUnderstandingPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Processed" | "Analyzing" | "Flagged"
  >("All");

  const deferredQuery = useDeferredValue(query);

  const filteredDocuments = useMemo(() => {
    const normalized = deferredQuery.toLowerCase().trim();

    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(normalized) ||
        doc.type.toLowerCase().includes(normalized) ||
        doc.id.toLowerCase().includes(normalized);

      const matchesFilter =
        activeFilter === "All" || doc.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [deferredQuery, activeFilter]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_25%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              AI DOCUMENT INTELLIGENCE
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              AI Document Understanding
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Enterprise-grade document extraction, OCR analysis, semantic
              classification, multilingual processing, and compliance-ready AI
              automation engine.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:w-[420px]">
            {insights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {item.title}
                      </p>

                      <h3 className="mt-3 text-2xl font-black text-white">
                        {item.value}
                      </h3>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {item.growth}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left */}
          <section className="space-y-6">
            {/* Search & Upload */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_30%)]" />

              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Document Analysis Engine
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      AI-powered parsing for invoices, contracts, legal files,
                      reports and enterprise documentation.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 text-sm font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-500/20"
                  >
                    <Workflow className="h-4 w-4" />
                    Smart Automation
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="group relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-300" />

                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search documents, IDs, classifications..."
                      autoComplete="off"
                      spellCheck={false}
                      className="h-14 w-full rounded-[24px] border border-white/10 bg-[#050b17]/80 pl-14 pr-5 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-[#09111d]"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[24px] border border-dashed border-cyan-400/30 bg-cyan-500/10 px-6 text-sm font-black text-cyan-300 transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-500/20"
                  >
                    <FileArchive className="h-4 w-4" />
                    Upload Document
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {["All", "Processed", "Analyzing", "Flagged"].map(
                    (filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() =>
                          setActiveFilter(
                            filter as
                              | "All"
                              | "Processed"
                              | "Analyzing"
                              | "Flagged"
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                          activeFilter === filter
                            ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {filter}
                      </button>
                    )
                  )}
                </div>

                {/* AI Status */}
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        OCR Engine
                      </p>

                      <ScanSearch className="h-4 w-4 text-cyan-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Active
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Real-time extraction enabled.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#050b17]/70 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        NLP Parsing
                      </p>

                      <BrainCircuit className="h-4 w-4 text-violet-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Synced
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      AI semantic indexing ready.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Threat Detection
                      </p>

                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      Secure
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Compliance & fraud monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    AI Document Queue
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Intelligent processing and extraction monitoring.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {filteredDocuments.length} Documents
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      {[
                        "Document",
                        "Type",
                        "AI Confidence",
                        "Status",
                        "Updated",
                      ].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="group border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-300">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="font-bold text-white">
                                  {doc.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {doc.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {doc.type}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                                  style={{
                                    width: `${doc.confidence}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm font-bold text-cyan-300">
                                {doc.confidence}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] ${
                                doc.status === "Processed"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : doc.status === "Analyzing"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              {doc.status === "Analyzing" && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}

                              {doc.status === "Flagged" && (
                                <AlertCircle className="h-3 w-3" />
                              )}

                              {doc.status === "Processed" && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}

                              {doc.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-400">
                            {doc.updatedAt}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          No documents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="space-y-6">
            <Suspense
              fallback={
                <div className="space-y-6">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              }
            >
              <AIAnalyticsChart />
            </Suspense>

            {/* AI Pipeline */}
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Processing Pipeline
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-white">
                    AI Workflow
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-3 text-violet-300">
                  <Workflow className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    label: "OCR & Text Detection",
                    status: "Completed",
                  },
                  {
                    label: "Semantic Classification",
                    status: "Processing",
                  },
                  {
                    label: "Entity Recognition",
                    status: "Queued",
                  },
                  {
                    label: "Compliance Validation",
                    status: "Ready",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#050b17]/70 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                      <span className="text-sm font-semibold text-slate-300">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring */}
            <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950 to-cyan-500/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Live Monitoring
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Real-Time AI
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-cyan-300">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                Continuous AI-driven analysis pipeline with multilingual OCR,
                fraud detection, semantic extraction, and enterprise-grade
                validation monitoring.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Processing Load
                  </span>

                  <span className="text-sm font-black text-cyan-300">
                    82%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}