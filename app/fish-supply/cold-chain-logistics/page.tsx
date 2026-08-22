import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cold Chain Logistics",
  description:
    "Monitor temperature-controlled movement, vehicle status, transit time, and delivery integrity for fish and raw materials.",
};

type LogisticsSummary = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type Shipment = {
  shipmentId: string;
  origin: string;
  destination: string;
  vehicle: string;
  temperature: string;
  transit: string;
  status: "On track" | "Delayed" | "At risk";
};

type TimelineEvent = {
  time: string;
  title: string;
  detail: string;
};

const logisticsSummary: LogisticsSummary[] = [
  { label: "Active shipments", value: "24", note: "In transit right now", tone: "cyan" },
  { label: "Avg. temp", value: "2.8°C", note: "Last 24 hours", tone: "emerald" },
  { label: "On-time rate", value: "96.1%", note: "This week", tone: "amber" },
  { label: "Spoilage risk", value: "1.7%", note: "Threshold monitored", tone: "rose" },
];

const shipments: Shipment[] = [
  {
    shipmentId: "CL-2048",
    origin: "Kalaroa Depot",
    destination: "Dhaka Processing Unit",
    vehicle: "Reefer Truck 07",
    temperature: "2.4°C",
    transit: "4h 20m",
    status: "On track",
  },
  {
    shipmentId: "CL-2051",
    origin: "Shyamnagar Collection",
    destination: "Khulna Cold Store",
    vehicle: "Insulated Van 11",
    temperature: "3.1°C",
    transit: "2h 55m",
    status: "On track",
  },
  {
    shipmentId: "CL-2054",
    origin: "Kaliganj Hub",
    destination: "Export Packing Line",
    vehicle: "Reefer Truck 02",
    temperature: "5.6°C",
    transit: "5h 10m",
    status: "At risk",
  },
  {
    shipmentId: "CL-2058",
    origin: "Jessore Point",
    destination: "Port Warehouse",
    vehicle: "Cold Van 03",
    temperature: "4.8°C",
    transit: "Late by 22m",
    status: "Delayed",
  },
];

const timeline: TimelineEvent[] = [
  { time: "06:40", title: "Dispatch started", detail: "Vehicle checks completed and shipment released." },
  { time: "08:15", title: "Temperature verified", detail: "All probes reported within safe range." },
  { time: "10:05", title: "Transit checkpoint", detail: "Route deviation flagged for one vehicle." },
  { time: "11:20", title: "Delivery ETA updated", detail: "ETA recalculated after traffic slowdown." },
];

function statusClass(status: Shipment["status"]) {
  switch (status) {
    case "On track":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Delayed":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

function toneClass(tone: LogisticsSummary["tone"]) {
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

export default function Page() {
  const routeHealth = "Stable";
  const lateShipments = "2";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Cold Chain Logistics
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Maintain temperature integrity, monitor shipment movement, and reduce spoilage across the full cold-chain
                route from collection to final delivery.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {logisticsSummary.map((item) => (
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Shipment control</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Temperature, ETA, and live dispatch information for active cold-chain movements.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Register shipment
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Shipment", "Origin", "Destination", "Vehicle", "Temp", "Transit", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {shipments.map((row) => (
                      <tr key={row.shipmentId} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.shipmentId}</td>
                        <td className="px-4 py-4 text-slate-600">{row.origin}</td>
                        <td className="px-4 py-4 text-slate-600">{row.destination}</td>
                        <td className="px-4 py-4 text-slate-600">{row.vehicle}</td>
                        <td className="px-4 py-4 text-slate-600">{row.temperature}</td>
                        <td className="px-4 py-4 text-slate-600">{row.transit}</td>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Temperature intelligence</h2>
              <p className="mt-1 text-sm text-slate-500">
                Monitor threshold breaches and make preventive decisions before product quality drops.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { zone: "Zone A", temp: "2.1°C", range: "Safe", width: "78%" },
                  { zone: "Zone B", temp: "3.4°C", range: "Safe", width: "64%" },
                  { zone: "Zone C", temp: "5.6°C", range: "Warning", width: "92%" },
                ].map((item) => (
                  <div key={item.zone} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.zone}</span>
                      <span className="text-slate-500">
                        {item.temp} · {item.range}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.range === "Warning" ? "bg-amber-500" : "bg-cyan-500"}`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Action center</h2>
              <div className="mt-4 grid gap-3">
                {[
                  "Trigger reefer inspection",
                  "Re-route delayed shipment",
                  "Log temperature exception",
                  "Generate delivery report",
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
            <h3 className="text-xl font-semibold text-slate-900">Transit timeline</h3>
            <div className="mt-5 space-y-4">
              {timeline.map((item) => (
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
                "Door seal check due for reefer truck 02.",
                "One route has traffic delay beyond threshold.",
                "Temperature probe calibration required tomorrow.",
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