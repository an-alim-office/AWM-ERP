import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer & Fisherman Ledger",
  description:
    "Track procurement balances, settlements, advances, and transaction activity for farmers and fishermen.",
};

type LedgerSummaryItem = {
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "amber" | "slate";
};

type LedgerEntry = {
  name: string;
  role: string;
  village: string;
  fishType: string;
  qty: string;
  debit: string;
  credit: string;
  status: "Pending" | "Settled" | "Partially paid";
};

type ActivityItem = {
  title: string;
  description: string;
};

const ledgerSummary: LedgerSummaryItem[] = [
  { label: "Total members", value: "428", tone: "cyan" },
  { label: "Open balance", value: "৳1,24,500", tone: "amber" },
  { label: "Today’s transactions", value: "36", tone: "slate" },
  { label: "Collection success", value: "94.6%", tone: "emerald" },
];

const ledgerEntries: LedgerEntry[] = [
  {
    name: "Abdul Karim",
    role: "Fisherman",
    village: "Kalaroa",
    fishType: "Hilsa",
    qty: "42 kg",
    debit: "৳18,900",
    credit: "৳12,000",
    status: "Pending",
  },
  {
    name: "Mst. Rina",
    role: "Farmer",
    village: "Shyamnagar",
    fishType: "Rohu",
    qty: "58 kg",
    debit: "৳22,400",
    credit: "৳22,400",
    status: "Settled",
  },
  {
    name: "Nur Islam",
    role: "Fisherman",
    village: "Kaliganj",
    fishType: "Pangas",
    qty: "31 kg",
    debit: "৳14,250",
    credit: "৳9,000",
    status: "Partially paid",
  },
];

const activityLog: ActivityItem[] = [
  {
    title: "Morning catch recorded",
    description: "New intake synced from the Shyamnagar collection point.",
  },
  {
    title: "Partial settlement updated",
    description: "Two fishermen were marked for partial payment clearance.",
  },
  {
    title: "Advance adjusted",
    description: "Vendor advance was reconciled against yesterday’s intake.",
  },
  {
    title: "Records synced",
    description: "Ledger data was aligned with weighing and grading entries.",
  },
];

function getSummaryStyles(tone: LedgerSummaryItem["tone"]) {
  switch (tone) {
    case "cyan":
      return "border-cyan-400/20 bg-cyan-500/10 text-cyan-100";
    case "emerald":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
    case "amber":
      return "border-amber-400/20 bg-amber-500/10 text-amber-100";
    default:
      return "border-white/10 bg-white/5 text-slate-100";
  }
}

function getStatusStyles(status: LedgerEntry["status"]) {
  switch (status) {
    case "Settled":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
  }
}

export default function Page() {
  const totalDebit = "৳55,550";
  const totalCredit = "৳43,400";
  const netDue = "৳12,150";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Farmer & Fisherman Ledger
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Track member-wise procurement, credit, debit, advances, dues, and settlement history in one operational
                ledger with clear reconciliation visibility.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {ledgerSummary.map((item) => (
                <article
                  key={item.label}
                  className={`rounded-2xl border p-4 backdrop-blur-sm ${getSummaryStyles(item.tone)}`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:px-8 xl:grid-cols-[1.75fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Ledger overview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A high-clarity financial snapshot for collection, payment, and settlement operations.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Debit</p>
                  <p className="mt-1 font-semibold text-slate-900">{totalDebit}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Credit</p>
                  <p className="mt-1 font-semibold text-slate-900">{totalCredit}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Net due</p>
                  <p className="mt-1 font-semibold text-slate-900">{netDue}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Name", "Role", "Village", "Fish", "Qty", "Debit", "Credit", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {ledgerEntries.map((row) => (
                      <tr key={`${row.name}-${row.village}`} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.name}</td>
                        <td className="px-4 py-4 text-slate-600">{row.role}</td>
                        <td className="px-4 py-4 text-slate-600">{row.village}</td>
                        <td className="px-4 py-4 text-slate-600">{row.fishType}</td>
                        <td className="px-4 py-4 text-slate-600">{row.qty}</td>
                        <td className="px-4 py-4 text-slate-600">{row.debit}</td>
                        <td className="px-4 py-4 text-slate-600">{row.credit}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(row.status)}`}>
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reconciliation workflow</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use this space for approval, audit, and monthly closing steps.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Run reconciliation
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: "Verified entries", value: "312", detail: "Matched with weighbridge and intake logs." },
                { label: "Exceptions", value: "9", detail: "Requires manual review before settlement." },
                { label: "Close rate", value: "88%", detail: "Ledger segments closed for the current cycle." },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Today’s activity</h3>
            <div className="mt-4 space-y-3">
              {activityLog.map((item) => (
                <article key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Ledger actions</h3>
            <div className="mt-4 grid gap-3">
              {[
                "Reconcile pending balances",
                "Export monthly ledger",
                "Sync with procurement module",
                "Generate payment follow-up list",
              ].map((action) => (
                <button
                  key={action}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}