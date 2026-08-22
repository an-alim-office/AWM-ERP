import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Species Batch",
  description:
    "Track fish species-wise batches, production grouping, quality status, and lot movement across the workflow.",
};

type SpeciesMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type SpeciesBatchRow = {
  batchId: string;
  species: string;
  grade: string;
  lots: string;
  totalWeight: string;
  coldStore: string;
  status: "Ready" | "Grouped" | "On hold";
};

type SpeciesEvent = {
  time: string;
  title: string;
  detail: string;
};

const speciesMetrics: SpeciesMetric[] = [
  { label: "Active batches", value: "23", note: "species groups in flow", tone: "cyan" },
  { label: "Ready batches", value: "71%", note: "available for dispatch", tone: "emerald" },
  { label: "On hold", value: "4", note: "awaiting quality clearance", tone: "amber" },
  { label: "High-volume species", value: "6", note: "priority planning", tone: "rose" },
];

const speciesRows: SpeciesBatchRow[] = [
  {
    batchId: "SB-1101",
    species: "Hilsa",
    grade: "Premium",
    lots: "4 lots",
    totalWeight: "324 kg",
    coldStore: "Zone A",
    status: "Ready",
  },
  {
    batchId: "SB-1102",
    species: "Rohu",
    grade: "Grade A",
    lots: "7 lots",
    totalWeight: "510 kg",
    coldStore: "Zone B",
    status: "Grouped",
  },
  {
    batchId: "SB-1103",
    species: "Pangas",
    grade: "Grade B",
    lots: "5 lots",
    totalWeight: "278 kg",
    coldStore: "Zone C",
    status: "On hold",
  },
  {
    batchId: "SB-1104",
    species: "Tilapia",
    grade: "Standard",
    lots: "3 lots",
    totalWeight: "186 kg",
    coldStore: "Zone D",
    status: "Ready",
  },
];

const speciesEvents: SpeciesEvent[] = [
  { time: "06:35", title: "Batch grouping started", detail: "Species were grouped by grade and destination plan." },
  { time: "08:00", title: "Premium lots cleared", detail: "Hilsa lots moved to the ready-for-dispatch queue." },
  { time: "09:20", title: "Hold applied", detail: "Pangas batches were paused for quality clarification." },
  { time: "11:15", title: "Storage updated", detail: "Ready batches were assigned to cold storage zones." },
];

function toneClass(tone: SpeciesMetric["tone"]) {
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

function statusClass(status: SpeciesBatchRow["status"]) {
  switch (status) {
    case "Ready":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Grouped":
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
                Species Batch
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Group and monitor batches by species, grade, lot count, and storage destination for cleaner operational
                control.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {speciesMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Batch register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Organize species batches by grade, lot count, total weight, and storage zone.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Create batch
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Batch", "Species", "Grade", "Lots", "Weight", "Storage", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {speciesRows.map((row) => (
                      <tr key={row.batchId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.batchId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.grade}</td>
                        <td className="px-4 py-4 text-slate-600">{row.lots}</td>
                        <td className="px-4 py-4 text-slate-600">{row.totalWeight}</td>
                        <td className="px-4 py-4 text-slate-600">{row.coldStore}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Batch composition</h2>
              <p className="mt-1 text-sm text-slate-500">
                See how species groups are distributed across readiness and hold states.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Ready volume", width: "74%", tone: "bg-emerald-500" },
                  { label: "Grouped volume", width: "57%", tone: "bg-cyan-500" },
                  { label: "Hold volume", width: "28%", tone: "bg-amber-500" },
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
                  "Group species batch",
                  "Move batch to storage",
                  "Send batch for recheck",
                  "Export batch summary",
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
            <h3 className="text-xl font-semibold text-slate-900">Batch timeline</h3>
            <div className="mt-5 space-y-4">
              {speciesEvents.map((item) => (
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
                "Pangas batch is still waiting on quality clearance.",
                "Hilsa batches should remain in premium storage.",
                "Grouped lots need dispatch priority before noon.",
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