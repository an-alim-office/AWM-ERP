import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal Supply",
  description:
    "Plan seasonal availability, forecast supply swings, and align procurement with peak and off-season demand.",
};

type SeasonalMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type SeasonalRow = {
  season: string;
  species: string;
  supply: string;
  demand: string;
  gap: string;
  status: "Balanced" | "Tight" | "Surplus";
};

type SeasonalEvent = {
  time: string;
  title: string;
  detail: string;
};

const seasonalMetrics: SeasonalMetric[] = [
  { label: "Peak weeks", value: "8", note: "high volume period", tone: "cyan" },
  { label: "Supply coverage", value: "87%", note: "current forecast", tone: "emerald" },
  { label: "Tight items", value: "4", note: "watch list", tone: "amber" },
  { label: "Surplus items", value: "3", note: "storage planning", tone: "rose" },
];

const seasonalRows: SeasonalRow[] = [
  { season: "Monsoon", species: "Hilsa", supply: "High", demand: "Very High", gap: "-12%", status: "Tight" },
  { season: "Winter", species: "Rohu", supply: "Stable", demand: "High", gap: "+4%", status: "Balanced" },
  { season: "Summer", species: "Pangas", supply: "High", demand: "Moderate", gap: "+15%", status: "Surplus" },
  { season: "Festive", species: "Tilapia", supply: "Moderate", demand: "High", gap: "-7%", status: "Tight" },
];

const seasonalEvents: SeasonalEvent[] = [
  { time: "06:20", title: "Forecast refreshed", detail: "Seasonal supply model updated for peak-week planning." },
  { time: "08:00", title: "Shortage alert", detail: "Hilsa supply expected to tighten during the next cycle." },
  { time: "09:10", title: "Surplus review", detail: "Pangas surplus was flagged for cold storage allocation." },
  { time: "11:30", title: "Procurement window set", detail: "Buying targets were adjusted for the current season." },
];

function toneClass(tone: SeasonalMetric["tone"]) {
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

function statusClass(status: SeasonalRow["status"]) {
  switch (status) {
    case "Balanced":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Tight":
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
                Seasonal Supply
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Plan supply by season, balance procurement with market demand, and anticipate shortage or surplus before
                it affects operations.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {seasonalMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Seasonal outlook</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Compare season, species, supply level, demand level, and forecast gap.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Refresh forecast
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Season", "Species", "Supply", "Demand", "Gap", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {seasonalRows.map((row) => (
                      <tr key={`${row.season}-${row.species}`} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.season}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.supply}</td>
                        <td className="px-4 py-4 text-slate-600">{row.demand}</td>
                        <td className="px-4 py-4 text-slate-600">{row.gap}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Supply pressure</h2>
              <p className="mt-1 text-sm text-slate-500">
                Visualize how intense the supply situation is across the planning horizon.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Monsoon pressure", width: "78%", tone: "bg-amber-500" },
                  { label: "Winter balance", width: "64%", tone: "bg-emerald-500" },
                  { label: "Festival demand", width: "91%", tone: "bg-cyan-500" },
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
                  "Adjust procurement targets",
                  "Move surplus to storage",
                  "Flag shortage species",
                  "Export seasonal report",
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
            <h3 className="text-xl font-semibold text-slate-900">Seasonal timeline</h3>
            <div className="mt-5 space-y-4">
              {seasonalEvents.map((item) => (
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
                "Hilsa supply may tighten during the monsoon peak.",
                "Pangas surplus should be routed to storage early.",
                "Festival demand requires an updated buying plan.",
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