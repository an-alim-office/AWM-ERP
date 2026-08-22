import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cold Storage Management",
  description:
    "Manage storage capacity, temperature zones, inventory aging, and product integrity for fish and raw materials.",
};

type StorageSummary = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type StorageUnit = {
  unitId: string;
  zone: string;
  capacity: string;
  occupied: string;
  temperature: string;
  aging: string;
  status: "Healthy" | "Warning" | "Critical";
};

type StorageEvent = {
  time: string;
  title: string;
  detail: string;
};

const storageSummary: StorageSummary[] = [
  { label: "Total capacity", value: "1,250 MT", note: "across all chambers", tone: "cyan" },
  { label: "Occupied space", value: "78%", note: "current utilization", tone: "emerald" },
  { label: "Near-expiry stock", value: "34 MT", note: "requires priority dispatch", tone: "amber" },
  { label: "Alert count", value: "5", note: "open issues", tone: "rose" },
];

const storageUnits: StorageUnit[] = [
  {
    unitId: "CS-01",
    zone: "Zone A",
    capacity: "240 MT",
    occupied: "182 MT",
    temperature: "1.8°C",
    aging: "4 days",
    status: "Healthy",
  },
  {
    unitId: "CS-02",
    zone: "Zone B",
    capacity: "310 MT",
    occupied: "276 MT",
    temperature: "2.9°C",
    aging: "6 days",
    status: "Warning",
  },
  {
    unitId: "CS-03",
    zone: "Zone C",
    capacity: "180 MT",
    occupied: "171 MT",
    temperature: "4.7°C",
    aging: "9 days",
    status: "Critical",
  },
  {
    unitId: "CS-04",
    zone: "Zone D",
    capacity: "265 MT",
    occupied: "192 MT",
    temperature: "2.3°C",
    aging: "3 days",
    status: "Healthy",
  },
];

const storageEvents: StorageEvent[] = [
  { time: "07:00", title: "Incoming stock received", detail: "New pallets scanned into Zone B for staging." },
  { time: "08:20", title: "Temperature variance detected", detail: "Unit CS-03 crossed the warning threshold." },
  { time: "10:10", title: "Dispatch priority updated", detail: "Aging inventory was moved to outbound queue." },
  { time: "11:45", title: "Audit log synced", detail: "Inventory and power consumption records were matched." },
];

function toneClass(tone: StorageSummary["tone"]) {
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

function statusClass(status: StorageUnit["status"]) {
  switch (status) {
    case "Healthy":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Warning":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.10),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Cold Storage Management
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Control chamber utilization, stock aging, temperature zones, and risk alerts to preserve product quality
                and reduce wastage.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {storageSummary.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Storage units</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review chamber status, temperature, and occupancy in a single operational view.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Add storage record
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Unit", "Zone", "Capacity", "Occupied", "Temp", "Aging", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {storageUnits.map((row) => (
                      <tr key={row.unitId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.unitId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.zone}</td>
                        <td className="px-4 py-4 text-slate-600">{row.capacity}</td>
                        <td className="px-4 py-4 text-slate-600">{row.occupied}</td>
                        <td className="px-4 py-4 text-slate-600">{row.temperature}</td>
                        <td className="px-4 py-4 text-slate-600">{row.aging}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Capacity balance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use this section for occupancy trends, loading pressure, and dispatch planning.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Zone A", width: "76%", tone: "bg-cyan-500" },
                  { label: "Zone B", width: "89%", tone: "bg-amber-500" },
                  { label: "Zone C", width: "95%", tone: "bg-rose-500" },
                  { label: "Zone D", width: "71%", tone: "bg-emerald-500" },
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
                  "Move stock from critical zone",
                  "Trigger temperature inspection",
                  "Generate aging report",
                  "Schedule power backup check",
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
            <h3 className="text-xl font-semibold text-slate-900">Storage timeline</h3>
            <div className="mt-5 space-y-4">
              {storageEvents.map((item) => (
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
                "Unit CS-03 temperature is above safe threshold.",
                "Near-expiry stock should be dispatched first.",
                "Power backup test is pending for Zone B.",
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