import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raw Material Wastage",
  description:
    "Track raw material loss, rejection causes, spoilage trends, and recovery actions across the processing workflow.",
};

type WastageMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type WastageRow = {
  batchId: string;
  source: string;
  species: string;
  loss: string;
  cause: string;
  action: string;
  status: "Recovered" | "Under review" | "Discarded";
};

type WastageEvent = {
  time: string;
  title: string;
  detail: string;
};

const wastageMetrics: WastageMetric[] = [
  { label: "Total loss", value: "2.8 MT", note: "today’s wastage", tone: "rose" },
  { label: "Recovery rate", value: "74%", note: "reused or diverted", tone: "emerald" },
  { label: "Under review", value: "6", note: "open cases", tone: "amber" },
  { label: "High-risk lots", value: "3", note: "requires attention", tone: "cyan" },
];

const wastageRows: WastageRow[] = [
  {
    batchId: "WS-901",
    source: "Processing Line 2",
    species: "Hilsa",
    loss: "120 kg",
    cause: "Temperature breach",
    action: "Chilled recovery",
    status: "Recovered",
  },
  {
    batchId: "WS-902",
    source: "Cold Store Zone C",
    species: "Rohu",
    loss: "85 kg",
    cause: "Packaging failure",
    action: "Repacking review",
    status: "Under review",
  },
  {
    batchId: "WS-903",
    source: "Intake Bay B",
    species: "Pangas",
    loss: "64 kg",
    cause: "Late arrival",
    action: "Discard pending",
    status: "Under review",
  },
  {
    batchId: "WS-904",
    source: "QC Hold Area",
    species: "Tilapia",
    loss: "48 kg",
    cause: "Spoilage smell",
    action: "Disposal logged",
    status: "Discarded",
  },
];

const wastageEvents: WastageEvent[] = [
  { time: "07:05", title: "Loss reported", detail: "A temperature variance was logged in cold storage zone C." },
  { time: "08:25", title: "Recovery initiated", detail: "Recoverable fish was moved to a chilled salvage path." },
  { time: "09:40", title: "Review opened", detail: "Packaging failure cases were sent for QA assessment." },
  { time: "11:10", title: "Disposal confirmed", detail: "Discarded material was recorded in the wastage ledger." },
];

function toneClass(tone: WastageMetric["tone"]) {
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

function statusClass(status: WastageRow["status"]) {
  switch (status) {
    case "Recovered":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Under review":
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
                Raw Material Wastage
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Record spoilage, rejection, and salvage opportunities while keeping loss visibility tied to the source
                batch and downstream action.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {wastageMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Wastage register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor loss category, cause, and recovery status for each batch.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Log wastage
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Batch", "Source", "Species", "Loss", "Cause", "Action", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {wastageRows.map((row) => (
                      <tr key={row.batchId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.batchId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.source}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.loss}</td>
                        <td className="px-4 py-4 text-slate-600">{row.cause}</td>
                        <td className="px-4 py-4 text-slate-600">{row.action}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Loss distribution</h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare the biggest causes of wastage to prioritize corrective action.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Temperature breach", width: "76%", tone: "bg-rose-500" },
                  { label: "Packaging damage", width: "48%", tone: "bg-amber-500" },
                  { label: "Late arrival", width: "33%", tone: "bg-cyan-500" },
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
                  "Move salvageable stock",
                  "Approve disposal record",
                  "Open wastage incident",
                  "Export loss report",
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
            <h3 className="text-xl font-semibold text-slate-900">Wastage timeline</h3>
            <div className="mt-5 space-y-4">
              {wastageEvents.map((item) => (
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
                "Temperature breach losses need immediate root-cause review.",
                "Recheck batches should not remain open past shift end.",
                "Recovered stock must be relabeled before reuse.",
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