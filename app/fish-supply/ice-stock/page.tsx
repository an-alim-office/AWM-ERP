import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ice Factory",
  description:
    "Manage ice production, dispatch, capacity, and consumption to support fish collection and cold-chain operations.",
};

type IceMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type IceBatch = {
  batchId: string;
  shift: string;
  output: string;
  stock: string;
  demand: string;
  status: "Running" | "Queued" | "Maintenance";
};

type IceEvent = {
  time: string;
  title: string;
  detail: string;
};

const iceMetrics: IceMetric[] = [
  { label: "Daily output", value: "48 MT", note: "production today", tone: "cyan" },
  { label: "Stock on hand", value: "14 MT", note: "available for dispatch", tone: "emerald" },
  { label: "Peak demand", value: "61 MT", note: "forecast requirement", tone: "amber" },
  { label: "Downtime", value: "1.8%", note: "machine idle time", tone: "rose" },
];

const iceBatches: IceBatch[] = [
  {
    batchId: "IC-701",
    shift: "Morning",
    output: "16 MT",
    stock: "6 MT",
    demand: "18 MT",
    status: "Running",
  },
  {
    batchId: "IC-702",
    shift: "Afternoon",
    output: "14 MT",
    stock: "4 MT",
    demand: "20 MT",
    status: "Queued",
  },
  {
    batchId: "IC-703",
    shift: "Night",
    output: "18 MT",
    stock: "8 MT",
    demand: "23 MT",
    status: "Running",
  },
  {
    batchId: "IC-704",
    shift: "Emergency",
    output: "0 MT",
    stock: "0 MT",
    demand: "N/A",
    status: "Maintenance",
  },
];

const iceEvents: IceEvent[] = [
  { time: "05:45", title: "Plant started", detail: "Compressors initialized and safety checks passed." },
  { time: "07:20", title: "First batch released", detail: "Morning production batch moved to dispatch storage." },
  { time: "09:05", title: "Demand surge", detail: "Additional ice request received from collection points." },
  { time: "10:40", title: "Maintenance alert", detail: "One line is scheduled for preventive servicing." },
];

function toneClass(tone: IceMetric["tone"]) {
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

function statusClass(status: IceBatch["status"]) {
  switch (status) {
    case "Running":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Queued":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
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
                Ice Factory
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Control production shifts, capacity usage, dispatch stock, and maintenance planning for fish collection and
                cold-chain demand.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {iceMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Production batches</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Shift-wise output, stock availability, and operating status for each batch.
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
                      {["Batch", "Shift", "Output", "Stock", "Demand", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {iceBatches.map((row) => (
                      <tr key={row.batchId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.batchId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.shift}</td>
                        <td className="px-4 py-4 text-slate-600">{row.output}</td>
                        <td className="px-4 py-4 text-slate-600">{row.stock}</td>
                        <td className="px-4 py-4 text-slate-600">{row.demand}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Output balance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Track production pressure and available stock against demand.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Production load", width: "88%", tone: "bg-cyan-500" },
                  { label: "Dispatch coverage", width: "61%", tone: "bg-emerald-500" },
                  { label: "Maintenance window", width: "22%", tone: "bg-amber-500" },
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
                  "Schedule machine maintenance",
                  "Release dispatch stock",
                  "Increase ice output",
                  "Generate shift report",
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
            <h3 className="text-xl font-semibold text-slate-900">Factory timeline</h3>
            <div className="mt-5 space-y-4">
              {iceEvents.map((item) => (
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
                "One production line requires preventive maintenance.",
                "Emergency stock may be insufficient for afternoon demand.",
                "Dispatch queue is increasing faster than output.",
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