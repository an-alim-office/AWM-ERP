import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Depot Ghat Collection",
  description:
    "Manage collection point intake, gate entries, supplier arrivals, and depot-level fish reception workflows.",
};

type CollectionSummary = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type CollectionRow = {
  receiptId: string;
  supplier: string;
  vessel: string;
  species: string;
  weight: string;
  gate: string;
  status: "Accepted" | "Pending" | "Rejected";
};

type DepotEvent = {
  time: string;
  title: string;
  detail: string;
};

const collectionSummary: CollectionSummary[] = [
  { label: "Today intake", value: "8.4 MT", note: "from all gates", tone: "cyan" },
  { label: "Receipts issued", value: "62", note: "completed entries", tone: "emerald" },
  { label: "Pending checks", value: "7", note: "awaiting verification", tone: "amber" },
  { label: "Rejected lots", value: "2", note: "quality mismatch", tone: "rose" },
];

const collectionRows: CollectionRow[] = [
  {
    receiptId: "DG-10021",
    supplier: "Abdul Karim",
    vessel: "Boat-17",
    species: "Hilsa",
    weight: "84 kg",
    gate: "Gate A",
    status: "Accepted",
  },
  {
    receiptId: "DG-10022",
    supplier: "Mst. Rina",
    vessel: "Truck-03",
    species: "Rohu",
    weight: "126 kg",
    gate: "Gate B",
    status: "Pending",
  },
  {
    receiptId: "DG-10023",
    supplier: "Nur Islam",
    vessel: "Boat-09",
    species: "Pangas",
    weight: "58 kg",
    gate: "Gate C",
    status: "Accepted",
  },
  {
    receiptId: "DG-10024",
    supplier: "Selim Reza",
    vessel: "Van-02",
    species: "Tilapia",
    weight: "41 kg",
    gate: "Gate A",
    status: "Rejected",
  },
];

const depotEvents: DepotEvent[] = [
  { time: "05:50", title: "Gate opened", detail: "Security and intake teams activated morning operations." },
  { time: "06:30", title: "High-value lot received", detail: "Premium Hilsa lot moved to weighing and grading." },
  { time: "08:10", title: "QC hold applied", detail: "One lot was paused due to packaging mismatch." },
  { time: "09:15", title: "Receipt batch printed", detail: "Approved collections were generated for supplier handover." },
];

function toneClass(tone: CollectionSummary["tone"]) {
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

function statusClass(status: CollectionRow["status"]) {
  switch (status) {
    case "Accepted":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.10),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Depot Ghat Collection
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Control intake at depot gates, validate supplier arrivals, and move approved lots into the next processing
                stage with clarity and speed.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {collectionSummary.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Collection register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Supplier arrival, receipt creation, and status tracking for depot-level intake.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                New receipt
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Receipt", "Supplier", "Vessel", "Species", "Weight", "Gate", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {collectionRows.map((row) => (
                      <tr key={row.receiptId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.receiptId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.supplier}</td>
                        <td className="px-4 py-4 text-slate-600">{row.vessel}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.weight}</td>
                        <td className="px-4 py-4 text-slate-600">{row.gate}</td>
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

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Gate readiness</h2>
              <p className="mt-1 text-sm text-slate-500">
                See which gates are under pressure and where queue management is needed.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Gate A", width: "84%", tone: "bg-cyan-500" },
                  { label: "Gate B", width: "62%", tone: "bg-emerald-500" },
                  { label: "Gate C", width: "48%", tone: "bg-amber-500" },
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
                  "Print receipt batch",
                  "Send lot to weighing",
                  "Flag pending verification",
                  "Close gate for audit",
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
            <h3 className="text-xl font-semibold text-slate-900">Collection timeline</h3>
            <div className="mt-5 space-y-4">
              {depotEvents.map((item) => (
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
                "One lot is pending quality verification before handover.",
                "Gate B queue is growing and may slow receipt processing.",
                "Receipt batch print completed but not yet signed off.",
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