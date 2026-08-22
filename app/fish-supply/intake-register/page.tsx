import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raw Material Intake",
  description:
    "Capture incoming fish intake, verify weight, quality, source, and routing for downstream processing.",
};

type IntakeMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type IntakeRow = {
  intakeId: string;
  source: string;
  species: string;
  grossWeight: string;
  netWeight: string;
  check: string;
  status: "Approved" | "Hold" | "Rejected";
};

type IntakeEvent = {
  time: string;
  title: string;
  detail: string;
};

const intakeMetrics: IntakeMetric[] = [
  { label: "Intake lots", value: "56", note: "received today", tone: "cyan" },
  { label: "Approved", value: "91%", note: "quality cleared", tone: "emerald" },
  { label: "On hold", value: "5", note: "awaiting recheck", tone: "amber" },
  { label: "Rejected", value: "2", note: "failed intake", tone: "rose" },
];

const intakeRows: IntakeRow[] = [
  {
    intakeId: "IN-801",
    source: "Depot Ghat A",
    species: "Hilsa",
    grossWeight: "92 kg",
    netWeight: "88 kg",
    check: "Pass",
    status: "Approved",
  },
  {
    intakeId: "IN-802",
    source: "Depot Ghat B",
    species: "Rohu",
    grossWeight: "164 kg",
    netWeight: "157 kg",
    check: "Pass",
    status: "Approved",
  },
  {
    intakeId: "IN-803",
    source: "Collection Bay C",
    species: "Pangas",
    grossWeight: "78 kg",
    netWeight: "74 kg",
    check: "Recheck",
    status: "Hold",
  },
  {
    intakeId: "IN-804",
    source: "Vendor Dock 2",
    species: "Tilapia",
    grossWeight: "41 kg",
    netWeight: "38 kg",
    check: "Fail",
    status: "Rejected",
  },
];

const intakeEvents: IntakeEvent[] = [
  { time: "06:10", title: "First intake recorded", detail: "Morning lots were logged and assigned intake IDs." },
  { time: "07:45", title: "Quality checks completed", detail: "Weight and freshness checks were cleared for two batches." },
  { time: "09:00", title: "Hold applied", detail: "One Pangas lot was paused for manual re-verification." },
  { time: "10:20", title: "Rejected lot removed", detail: "Failed lot was moved out of the intake flow." },
];

function toneClass(tone: IntakeMetric["tone"]) {
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

function statusClass(status: IntakeRow["status"]) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Hold":
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
                Raw Material Intake
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Record incoming lots, validate gross and net weight, and route approved batches into the next processing
                stage with clear operational visibility.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {intakeMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Intake register</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track source, species, weights, inspection result, and final intake status.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Add intake
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Intake", "Source", "Species", "Gross", "Net", "Check", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {intakeRows.map((row) => (
                      <tr key={row.intakeId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.intakeId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.source}</td>
                        <td className="px-4 py-4 text-slate-600">{row.species}</td>
                        <td className="px-4 py-4 text-slate-600">{row.grossWeight}</td>
                        <td className="px-4 py-4 text-slate-600">{row.netWeight}</td>
                        <td className="px-4 py-4 text-slate-600">{row.check}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Intake balance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare lot clearance, hold volume, and quality pressure at a glance.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Cleared lots", width: "86%", tone: "bg-emerald-500" },
                  { label: "Hold volume", width: "42%", tone: "bg-amber-500" },
                  { label: "Rejected volume", width: "18%", tone: "bg-rose-500" },
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
                  "Confirm intake lot",
                  "Send lot for recheck",
                  "Reject failed batch",
                  "Export intake log",
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
            <h3 className="text-xl font-semibold text-slate-900">Intake timeline</h3>
            <div className="mt-5 space-y-4">
              {intakeEvents.map((item) => (
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
                "One lot is pending gross-to-net verification.",
                "Hold batches should be reviewed before noon.",
                "Rejected intake must be moved from the dock area.",
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