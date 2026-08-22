import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fish Market Price",
  description:
    "Track live market prices, species trends, regional averages, and procurement signals for fish trading operations.",
};

type MarketMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type PriceRow = {
  species: string;
  market: string;
  min: string;
  avg: string;
  max: string;
  change: string;
  trend: "Up" | "Down" | "Stable";
};

type PriceEvent = {
  time: string;
  title: string;
  detail: string;
};

const marketMetrics: MarketMetric[] = [
  { label: "Active species", value: "14", note: "tracked today", tone: "cyan" },
  { label: "Avg. movement", value: "+3.4%", note: "vs yesterday", tone: "emerald" },
  { label: "High volatility", value: "4", note: "species under pressure", tone: "amber" },
  { label: "Procurement alerts", value: "6", note: "needs review", tone: "rose" },
];

const priceRows: PriceRow[] = [
  {
    species: "Hilsa",
    market: "Dhaka",
    min: "৳1,050",
    avg: "৳1,220",
    max: "৳1,450",
    change: "+5.1%",
    trend: "Up",
  },
  {
    species: "Rohu",
    market: "Khulna",
    min: "৳260",
    avg: "৳315",
    max: "৳360",
    change: "+2.4%",
    trend: "Up",
  },
  {
    species: "Pangas",
    market: "Jessore",
    min: "৳170",
    avg: "৳198",
    max: "৳225",
    change: "-1.2%",
    trend: "Down",
  },
  {
    species: "Tilapia",
    market: "Chattogram",
    min: "৳180",
    avg: "৳210",
    max: "৳238",
    change: "+0.8%",
    trend: "Stable",
  },
];

const priceEvents: PriceEvent[] = [
  { time: "08:00", title: "Opening price recorded", detail: "Hilsa and Rohu opened stronger than yesterday." },
  { time: "09:15", title: "Volatility alert", detail: "Pangas prices slipped after higher arrivals." },
  { time: "10:30", title: "Demand spike", detail: "Premium fish demand increased near urban markets." },
  { time: "11:20", title: "Procurement guidance updated", detail: "Buying thresholds were revised for active species." },
];

function toneClass(tone: MarketMetric["tone"]) {
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

function trendClass(trend: PriceRow["trend"]) {
  switch (trend) {
    case "Up":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Down":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
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
                Fish Market Price
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Monitor live species pricing, market shifts, and procurement thresholds to make faster buying and selling
                decisions.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {marketMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Price board</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regional price ranges with average, min, max, and daily movement.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Refresh market data
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Species", "Market", "Min", "Avg", "Max", "Change", "Trend"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {priceRows.map((row) => (
                      <tr key={`${row.species}-${row.market}`} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.market}</td>
                        <td className="px-4 py-4 text-slate-600">{row.min}</td>
                        <td className="px-4 py-4 text-slate-600">{row.avg}</td>
                        <td className="px-4 py-4 text-slate-600">{row.max}</td>
                        <td className="px-4 py-4 text-slate-600">{row.change}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${trendClass(row.trend)}`}>
                            {row.trend}
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Price trend signal</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use this view for procurement planning and fast reaction to market conditions.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Premium species", width: "82%", tone: "bg-cyan-500" },
                  { label: "Mid-range species", width: "67%", tone: "bg-emerald-500" },
                  { label: "Low-price pressure", width: "39%", tone: "bg-amber-500" },
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Procurement actions</h2>
              <div className="mt-4 grid gap-3">
                {[
                  "Update buying threshold",
                  "Mark volatile species",
                  "Create market alert",
                  "Export daily price sheet",
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
            <h3 className="text-xl font-semibold text-slate-900">Market timeline</h3>
            <div className="mt-5 space-y-4">
              {priceEvents.map((item) => (
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
                "Hilsa supply is tightening in the Dhaka market.",
                "Pangas prices are under short-term pressure.",
                "Rohu remains stable with moderate demand.",
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