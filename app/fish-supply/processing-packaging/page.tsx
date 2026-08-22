import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Processing Packaging",
  description:
    "Manage processing lines, packaging status, batch readiness, and quality checkpoints for fish products.",
};

type PackagingMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type ProcessBatch = {
  batchId: string;
  product: string;
  line: string;
  output: string;
  packed: string;
  seal: string;
  status: "Running" | "Hold" | "Completed";
};

type PackagingEvent = {
  time: string;
  title: string;
  detail: string;
};

const packagingMetrics: PackagingMetric[] = [
  { label: "Active lines", value: "6", note: "currently processing", tone: "cyan" },
  { label: "Pack completion", value: "89%", note: "today’s output", tone: "emerald" },
  { label: "QC holds", value: "4", note: "awaiting clearance", tone: "amber" },
  { label: "Rework rate", value: "1.3%", note: "of total batches", tone: "rose" },
];

const processBatches: ProcessBatch[] = [
  {
    batchId: "PK-301",
    product: "Hilsa Fillet",
    line: "Line 1",
    output: "120 kg",
    packed: "108 kg",
    seal: "Pass",
    status: "Running",
  },
  {
    batchId: "PK-302",
    product: "Rohu Cut",
    line: "Line 2",
    output: "210 kg",
    packed: "210 kg",
    seal: "Pass",
    status: "Completed",
  },
  {
    batchId: "PK-303",
    product: "Pangas Whole",
    line: "Line 3",
    output: "180 kg",
    packed: "156 kg",
    seal: "Hold",
    status: "Hold",
  },
  {
    batchId: "PK-304",
    product: "Tilapia Tray Pack",
    line: "Line 4",
    output: "90 kg",
    packed: "90 kg",
    seal: "Pass",
    status: "Completed",
  },
];

const packagingEvents: PackagingEvent[] = [
  { time: "06:50", title: "Line startup", detail: "Processing equipment warmed up and QA checks completed." },
  { time: "08:05", title: "Batch transfer", detail: "Raw intake moved into the first packaging line." },
  { time: "09:25", title: "QC hold triggered", detail: "One lot was held for label and seal verification." },
  { time: "11:00", title: "Dispatch-ready batches", detail: "Completed batches were staged for cold storage." },
];

function toneClass(tone: PackagingMetric["tone"]) {
  switch (tone) {
    case "cyan":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-100";
    case "emerald":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
    case "amber":
      return "border-amber-400/20 bg-amber-500/10 text-amber-100";
    default:
      return "border-rose-400/20 bg-rose-500/10 text-rose-100";
  }
}

function statusClass(status: ProcessBatch["status"]) {
  switch (status) {
    case "Running":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Processing Packaging
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Coordinate production lines, monitor sealing and packing status, and manage the flow from processing to
                dispatch.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {packagingMetrics.map((item) => (
                <article key={item.label} className={`rounded-2xl border p-4 backdrop-blur-sm ${toneClass(item.tone)}`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:px-8 xl:grid-cols-[1.75fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Processing batches</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review line status, packing completion, and seal verification for each batch.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Start batch
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Batch", "Product", "Line", "Output", "Packed", "Seal", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {processBatches.map((row) => (
                      <tr key={row.batchId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.batchId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.product}</td>
                        <td className="px-4 py-4 text-slate-600">{row.line}</td>
                        <td className="px-4 py-4 text-slate-600">{row.output}</td>
                        <td className="px-4 py-4 text-slate-600">{row.packed}</td>
                        <td className="px-4 py-4 text-slate-600">{row.seal}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Completion balance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Track packing progress and bottlenecks across the production workflow.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Line 1 readiness", width: "86%", tone: "bg-cyan-500" },
                  { label: "Line 2 readiness", width: "93%", tone: "bg-emerald-500" },
                  { label: "Line 3 readiness", width: "59%", tone: "bg-amber-500" },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{bar.label}</span>
                      <span className="text-slate-500">{bar.width}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${bar.tone}`} style={{ width: bar.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Control actions</h2>
              <div className="mt-4 grid gap-3">
                {[
                  "Move batch to cold store",
                  "Recheck packaging seal",
                  "Release completed lot",
                  "Send hold batch to QA",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </article>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Production timeline</h3>
            <div className="mt-5 space-y-4">
              {packagingEvents.map((item) => (
                <article key={item.time} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="min-w-14 text-sm font-semibold text-cyan-700">{item.time}</div>
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Risk watch</h3>
            <div className="mt-4 space-y-3">
              {[
                "One batch is on hold for seal verification.",
                "Line 3 is below target completion rate.",
                "Packed output should move quickly to cold storage.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}