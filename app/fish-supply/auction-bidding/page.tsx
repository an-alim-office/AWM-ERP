import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auction Bidding",
  description:
    "Monitor live auction lots, bidder activity, bid spread, settlement state, and auction-level operational signals.",
};

type AuctionSummary = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type AuctionLot = {
  lotId: string;
  species: string;
  grade: string;
  weight: string;
  startPrice: string;
  highestBid: string;
  bidders: number;
  status: "Open" | "Closed" | "Under review";
};

type BidEvent = {
  time: string;
  title: string;
  detail: string;
};

const auctionSummary: AuctionSummary[] = [
  { label: "Active lots", value: "18", note: "currently open for bidding", tone: "cyan" },
  { label: "Avg. spread", value: "4.2%", note: "between start and winning bid", tone: "amber" },
  { label: "Winning rate", value: "68%", note: "lots closed today", tone: "emerald" },
  { label: "Review queue", value: "3", note: "requires approval", tone: "rose" },
];

const auctionLots: AuctionLot[] = [
  {
    lotId: "A-104",
    species: "Hilsa",
    grade: "Premium",
    weight: "42 kg",
    startPrice: "৳18,000",
    highestBid: "৳21,900",
    bidders: 7,
    status: "Open",
  },
  {
    lotId: "A-109",
    species: "Rohu",
    grade: "Grade A",
    weight: "58 kg",
    startPrice: "৳11,500",
    highestBid: "৳13,250",
    bidders: 4,
    status: "Open",
  },
  {
    lotId: "A-117",
    species: "Pangas",
    grade: "Grade B",
    weight: "31 kg",
    startPrice: "৳7,200",
    highestBid: "৳8,050",
    bidders: 5,
    status: "Under review",
  },
  {
    lotId: "A-121",
    species: "Tilapia",
    grade: "Standard",
    weight: "46 kg",
    startPrice: "৳9,800",
    highestBid: "৳10,100",
    bidders: 3,
    status: "Closed",
  },
];

const bidEvents: BidEvent[] = [
  {
    time: "09:12",
    title: "Lot A-104 opened",
    detail: "Auction started with premium Hilsa lots and seven registered bidders.",
  },
  {
    time: "09:28",
    title: "Spike detected",
    detail: "Two rapid bids pushed the highest price above the planned reserve line.",
  },
  {
    time: "09:44",
    title: "Review queued",
    detail: "One lot was flagged for manual verification due to bid discrepancy.",
  },
  {
    time: "10:03",
    title: "Settlement prepared",
    detail: "Closed lots were moved into invoice generation and payment batching.",
  },
];

function toneClass(tone: AuctionSummary["tone"]) {
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

function statusClass(status: AuctionLot["status"]) {
  switch (status) {
    case "Open":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Closed":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

export default function Page() {
  const lotsClosed = 12;
  const avgIncrease = "19.6%";
  const reserveMet = "14/18";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Auction Bidding
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Track live bidding, reserve thresholds, lot performance, and settlement readiness from a single auction
                operations console.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {auctionSummary.map((item) => (
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

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:px-8 xl:grid-cols-[1.7fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Live auction board</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Real-time lot visibility with bidder counts, reserve movement, and final bid status.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Export bids
                </button>
                <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                  Open new lot
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Lot", "Species", "Grade", "Weight", "Start", "Highest bid", "Bidders", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {auctionLots.map((row) => (
                      <tr key={row.lotId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.lotId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.grade}</td>
                        <td className="px-4 py-4 text-slate-600">{row.weight}</td>
                        <td className="px-4 py-4 text-slate-600">{row.startPrice}</td>
                        <td className="px-4 py-4 text-slate-600">{row.highestBid}</td>
                        <td className="px-4 py-4 text-slate-600">{row.bidders}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Bidding analytics</h2>
              <p className="mt-1 text-sm text-slate-500">
                Operational metrics useful for management review and price trend decisions.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Lots closed", value: lotsClosed },
                  { label: "Avg. uplift", value: avgIncrease },
                  { label: "Reserve met", value: reserveMet },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { name: "Buyer competition", width: "82%", tone: "bg-cyan-500" },
                  { name: "Reserve hits", width: "68%", tone: "bg-emerald-500" },
                  { name: "Late bid ratio", width: "31%", tone: "bg-amber-500" },
                ].map((bar) => (
                  <div key={bar.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{bar.name}</span>
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
                  "Lock closed lots",
                  "Verify bidder identity",
                  "Adjust reserve threshold",
                  "Push invoices to finance",
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
            <h3 className="text-xl font-semibold text-slate-900">Bid timeline</h3>
            <div className="mt-5 space-y-4">
              {bidEvents.map((item) => (
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
                "One lot is approaching reserve with low bidder count.",
                "Manual review required for a bid increment anomaly.",
                "Settlement batch ready for finance approval.",
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