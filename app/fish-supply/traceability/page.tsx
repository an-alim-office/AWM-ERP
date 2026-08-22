import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traceability",
  description:
    "Track fish lots from source to dispatch with lot ID, origin, handling, storage, and compliance visibility.",
};

type TraceMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type TraceRow = {
  lotId: string;
  source: string;
  species: string;
  batch: string;
  storage: string;
  movement: string;
  status: "Traceable" | "Partial" | "Blocked";
};

type TraceEvent = {
  time: string;
  title: string;
  detail: string;
};

const traceMetrics: TraceMetric[] = [
  { label: "Traceable lots", value: "142", note: "fully linked", tone: "emerald" },
  { label: "Partial records", value: "11", note: "needs update", tone: "amber" },
  { label: "Blocked lots", value: "2", note: "compliance issue", tone: "rose" },
  { label: "Scan coverage", value: "98.4%", note: "current flow", tone: "cyan" },
];

const traceRows: TraceRow[] = [
  {
    lotId: "TR-2201",
    source: "Depot Ghat A",
    species: "Hilsa",
    batch: "SB-1101",
    storage: "Zone A",
    movement: "Intake → QC → Cold Store",
    status: "Traceable",
  },
  {
    lotId: "TR-2202",
    source: "Collection Bay C",
    species: "Rohu",
    batch: "SB-1102",
    storage: "Zone B",
    movement: "Intake → Grading → Dispatch",
    status: "Traceable",
  },
  {
    lotId: "TR-2203",
    source: "Vendor Dock 2",
    species: "Pangas",
    batch: "SB-1103",
    storage: "Zone C",
    movement: "Intake → Hold",
    status: "Partial",
  },
  {
    lotId: "TR-2204",
    source: "QC Hold Area",
    species: "Tilapia",
    batch: "SB-1104",
    storage: "Unassigned",
    movement: "Rejected → Disposal",
    status: "Blocked",
  },
];

const traceEvents: TraceEvent[] = [
  { time: "06:15", title: "Lot scanned", detail: "Source lot ID was assigned at the intake gate." },
  { time: "07:35", title: "Batch linked", detail: "Species batch and cold store zone were attached to the lot." },
  { time: "09:05", title: "Compliance check", detail: "One partial record was flagged for missing movement detail." },
  { time: "10:50", title: "Blocked lot updated", detail: "A non-compliant lot was marked for restricted handling." },
];

function toneClass(tone: TraceMetric["tone"]) {
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

function statusClass(status: TraceRow["status"]) {
  switch (status) {
    case "Traceable":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Partial":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
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
                Traceability
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Keep every lot connected from source to storage and dispatch with a clear lot-level trail for compliance,
                recall readiness, and downstream verification.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {traceMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Lot trace register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Follow each lot from source entry to storage or restricted handling.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Register lot
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Lot ID", "Source", "Species", "Batch", "Storage", "Movement", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {traceRows.map((row) => (
                      <tr key={row.lotId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.lotId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.source}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.batch}</td>
                        <td className="px-4 py-4 text-slate-600">{row.storage}</td>
                        <td className="px-4 py-4 text-slate-600">{row.movement}</td>
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

          <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Trace coverage</h2>
              <p className="mt-1 text-sm text-slate-500">
                See how much of the supply chain is fully linked versus partial or blocked.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Fully linked", width: "82%", tone: "bg-emerald-500" },
                  { label: "Partial linkage", width: "48%", tone: "bg-amber-500" },
                  { label: "Blocked chain", width: "14%", tone: "bg-rose-500" },
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
                  "Scan missing lot",
                  "Link batch and storage",
                  "Block non-compliant lot",
                  "Export trace report",
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
            <h3 className="text-xl font-semibold text-slate-900">Trace timeline</h3>
            <div className="mt-5 space-y-4">
              {traceEvents.map((item) => (
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
            <h3 className="text-xl font-semibold text-slate-900">Watchlist</h3>
            <div className="mt-4 space-y-3">
              {[
                "One lot has missing movement data and should be updated.",
                "Blocked lots must remain restricted until cleared.",
                "Trace labels should stay attached through dispatch.",
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