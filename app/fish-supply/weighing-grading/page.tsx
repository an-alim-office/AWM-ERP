import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weighing Grading",
  description:
    "Manage weighing records, grading decisions, batch classification, and quality-based sorting for fish lots.",
};

type WeighMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type WeighRow = {
  ticketId: string;
  species: string;
  gross: string;
  tare: string;
  net: string;
  grade: string;
  status: "Graded" | "Pending" | "Review";
};

type WeighEvent = {
  time: string;
  title: string;
  detail: string;
};

const weighMetrics: WeighMetric[] = [
  { label: "Tickets weighed", value: "68", note: "today's activity", tone: "cyan" },
  { label: "Graded lots", value: "90%", note: "completed batches", tone: "emerald" },
  { label: "Pending review", value: "5", note: "needs reassessment", tone: "amber" },
  { label: "Regrade rate", value: "2.1%", note: "of total lots", tone: "rose" },
];

const weighRows: WeighRow[] = [
  {
    ticketId: "WG-3001",
    species: "Hilsa",
    gross: "94 kg",
    tare: "6 kg",
    net: "88 kg",
    grade: "Premium",
    status: "Graded",
  },
  {
    ticketId: "WG-3002",
    species: "Rohu",
    gross: "162 kg",
    tare: "9 kg",
    net: "153 kg",
    grade: "Grade A",
    status: "Graded",
  },
  {
    ticketId: "WG-3003",
    species: "Pangas",
    gross: "82 kg",
    tare: "7 kg",
    net: "75 kg",
    grade: "Grade B",
    status: "Review",
  },
  {
    ticketId: "WG-3004",
    species: "Tilapia",
    gross: "41 kg",
    tare: "4 kg",
    net: "37 kg",
    grade: "Pending",
    status: "Pending",
  },
];

const weighEvents: WeighEvent[] = [
  { time: "06:30", title: "Scale calibrated", detail: "All weighing stations passed calibration verification." },
  { time: "07:55", title: "Premium lot graded", detail: "First Hilsa batch cleared premium classification." },
  { time: "09:15", title: "Regrade requested", detail: "One Pangas lot was flagged for manual review." },
  { time: "10:35", title: "Pending lot queued", detail: "Unclassified lots were moved to the grading queue." },
];

function toneClass(tone: WeighMetric["tone"]) {
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

function statusClass(status: WeighRow["status"]) {
  switch (status) {
    case "Graded":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
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
                Weighing Grading
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Capture gross and net weight, assign grades, and route lots through the classification workflow with
                precise control and clear visibility.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {weighMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Weighing register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track ticket ID, weight values, grade assignment, and review state.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Add ticket
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Ticket", "Species", "Gross", "Tare", "Net", "Grade", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {weighRows.map((row) => (
                      <tr key={row.ticketId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.ticketId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.gross}</td>
                        <td className="px-4 py-4 text-slate-600">{row.tare}</td>
                        <td className="px-4 py-4 text-slate-600">{row.net}</td>
                        <td className="px-4 py-4 text-slate-600">{row.grade}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Grading balance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Understand how lots are distributed across premium, review, and pending states.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Premium grade", width: "72%", tone: "bg-emerald-500" },
                  { label: "Review required", width: "39%", tone: "bg-amber-500" },
                  { label: "Pending classification", width: "24%", tone: "bg-cyan-500" },
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
                  "Confirm weight",
                  "Assign grade",
                  "Send to recheck",
                  "Export grading sheet",
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
            <h3 className="text-xl font-semibold text-slate-900">Weighing timeline</h3>
            <div className="mt-5 space-y-4">
              {weighEvents.map((item) => (
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
                "One Pangas lot needs manual reassessment.",
                "Pending tickets should be cleared before shift close.",
                "Scale calibration must stay valid through the shift.",
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