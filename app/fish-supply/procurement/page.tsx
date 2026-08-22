import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fish Procurement",
  description:
    "Manage supplier sourcing, purchase orders, intake planning, and procurement performance for fish operations.",
};

type ProcurementMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type ProcurementRow = {
  poId: string;
  supplier: string;
  species: string;
  targetQty: string;
  receivedQty: string;
  rate: string;
  status: "Ordered" | "Receiving" | "Completed";
};

type ProcurementEvent = {
  time: string;
  title: string;
  detail: string;
};

const procurementMetrics: ProcurementMetric[] = [
  { label: "Open POs", value: "19", note: "awaiting fulfillment", tone: "cyan" },
  { label: "Suppliers active", value: "43", note: "today’s sourcing pool", tone: "emerald" },
  { label: "Fill rate", value: "93.2%", note: "this week", tone: "amber" },
  { label: "Cost variance", value: "-1.8%", note: "vs target", tone: "rose" },
];

const procurementRows: ProcurementRow[] = [
  {
    poId: "PO-4001",
    supplier: "M/S Karim Traders",
    species: "Hilsa",
    targetQty: "120 kg",
    receivedQty: "96 kg",
    rate: "৳1,180/kg",
    status: "Receiving",
  },
  {
    poId: "PO-4002",
    supplier: "M/S Rina Fish Supply",
    species: "Rohu",
    targetQty: "240 kg",
    receivedQty: "240 kg",
    rate: "৳308/kg",
    status: "Completed",
  },
  {
    poId: "PO-4003",
    supplier: "Nur Enterprise",
    species: "Pangas",
    targetQty: "180 kg",
    receivedQty: "74 kg",
    rate: "৳196/kg",
    status: "Receiving",
  },
  {
    poId: "PO-4004",
    supplier: "Shyamnagar Collection",
    species: "Tilapia",
    targetQty: "150 kg",
    receivedQty: "150 kg",
    rate: "৳214/kg",
    status: "Completed",
  },
];

const procurementEvents: ProcurementEvent[] = [
  { time: "06:25", title: "Supplier shortlist updated", detail: "Preferred vendors were ranked by price and fill reliability." },
  { time: "07:10", title: "PO released", detail: "A new Hilsa purchase order was sent to the approved supplier." },
  { time: "08:30", title: "Partial receiving logged", detail: "Two POs entered the receiving phase at the depot." },
  { time: "10:00", title: "Cost review completed", detail: "Procurement costs were aligned with market benchmarks." },
];

function toneClass(tone: ProcurementMetric["tone"]) {
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

function statusClass(status: ProcurementRow["status"]) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Receiving":
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
                Fish Procurement
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Plan sourcing, release purchase orders, and monitor supplier fulfillment from request to receiving.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {procurementMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Purchase orders</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track requested quantity, received quantity, pricing, and fulfillment stage.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Create PO
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["PO", "Supplier", "Species", "Target", "Received", "Rate", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {procurementRows.map((row) => (
                      <tr key={row.poId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.poId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.supplier}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.targetQty}</td>
                        <td className="px-4 py-4 text-slate-600">{row.receivedQty}</td>
                        <td className="px-4 py-4 text-slate-600">{row.rate}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Procurement efficiency</h2>
              <p className="mt-1 text-sm text-slate-500">
                Measure sourcing performance against plan and watch for bottlenecks.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "On-time supply", width: "84%", tone: "bg-emerald-500" },
                  { label: "Partial receipt", width: "58%", tone: "bg-cyan-500" },
                  { label: "Late delivery risk", width: "26%", tone: "bg-amber-500" },
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
                  "Release approved supplier list",
                  "Reconcile received quantity",
                  "Flag rate deviation",
                  "Export PO summary",
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
            <h3 className="text-xl font-semibold text-slate-900">Procurement timeline</h3>
            <div className="mt-5 space-y-4">
              {procurementEvents.map((item) => (
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
                "Hilsa supplier capacity is below forecast.",
                "Two receiving POs are still partially fulfilled.",
                "Target cost variance is within acceptable range.",
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