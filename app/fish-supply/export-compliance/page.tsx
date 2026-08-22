import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Compliance",
  description:
    "Track export authorizations, screening, recordkeeping, training, audits, and corrective actions for compliant trade operations.",
};

type ComplianceMetric = {
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose";
};

type ComplianceTask = {
  id: string;
  title: string;
  detail: string;
  status: "Complete" | "In progress" | "Needs review";
};

type RiskItem = {
  area: string;
  level: "Low" | "Medium" | "High";
  action: string;
};

type AuditEvent = {
  time: string;
  title: string;
  detail: string;
};

const complianceMetrics: ComplianceMetric[] = [
  { label: "Open reviews", value: "8", note: "pending export clearance", tone: "amber" },
  { label: "Training coverage", value: "96%", note: "employees trained this quarter", tone: "emerald" },
  { label: "Audit score", value: "91/100", note: "last internal review", tone: "cyan" },
  { label: "Violations", value: "1", note: "under corrective action", tone: "rose" },
];

const complianceTasks: ComplianceTask[] = [
  {
    id: "EC-001",
    title: "Destination screening",
    detail: "Verify customer, country, and end-use before release.",
    status: "Complete",
  },
  {
    id: "EC-002",
    title: "Classification validation",
    detail: "Confirm product jurisdiction and export classification references.",
    status: "In progress",
  },
  {
    id: "EC-003",
    title: "License review",
    detail: "Check if authorization is required for current shipments.",
    status: "Needs review",
  },
  {
    id: "EC-004",
    title: "Record retention check",
    detail: "Ensure transaction files are retained in the approved archive.",
    status: "Complete",
  },
];

const riskItems: RiskItem[] = [
  { area: "End-user screening", level: "High", action: "Require manual approval before shipment release." },
  { area: "Document retention", level: "Medium", action: "Validate that all records are stored for the required period." },
  { area: "Training refresh", level: "Low", action: "Schedule next training cycle for new employees." },
  { area: "License trigger detection", level: "High", action: "Review all flagged destinations and product codes." },
];

const auditEvents: AuditEvent[] = [
  {
    time: "08:10",
    title: "Morning compliance review",
    detail: "Pending export files were checked against screening and authorization rules.",
  },
  {
    time: "09:35",
    title: "Violation logged",
    detail: "One documentation mismatch was sent to corrective-action workflow.",
  },
  {
    time: "10:20",
    title: "Training roster updated",
    detail: "New employees were added to the quarterly compliance training list.",
  },
  {
    time: "11:05",
    title: "Audit evidence archived",
    detail: "Approved transaction records were pushed into long-term retention storage.",
  },
];

function toneClass(tone: ComplianceMetric["tone"]) {
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

function taskStatusClass(status: ComplianceTask["status"]) {
  switch (status) {
    case "Complete":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "In progress":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
}

function riskLevelClass(level: RiskItem["level"]) {
  switch (level) {
    case "Low":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.11),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
                Fish and Raw Material
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Export Compliance
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Manage export screening, authorization checks, recordkeeping, training, audits, and corrective actions
                with a structured compliance workflow.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-[560px]">
              {complianceMetrics.map((item) => (
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
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Compliance checklist</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Core export controls and documentation items that must be reviewed before release.
                </p>
              </div>
              <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Start review
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["ID", "Task", "Detail", "Status"].map((head) => (
                        <th key={head} className="px-4 py-3 font-medium text-slate-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {complianceTasks.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-900">{row.id}</td>
                        <td className="px-4 py-4 text-slate-600">{row.title}</td>
                        <td className="px-4 py-4 text-slate-600">{row.detail}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${taskStatusClass(row.status)}`}>
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
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Risk matrix</h2>
              <p className="mt-1 text-sm text-slate-500">
                Track the highest-impact compliance risk areas and the next mitigation action.
              </p>

              <div className="mt-6 space-y-4">
                {riskItems.map((item) => (
                  <div key={item.area} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{item.area}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskLevelClass(item.level)}`}>
                        {item.level}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.action}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Corrective actions</h2>
              <div className="mt-4 grid gap-3">
                {[
                  "Escalate blocked shipment",
                  "Review screening exception",
                  "Update compliance policy",
                  "Schedule retraining session",
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
            <h3 className="text-xl font-semibold text-slate-900">Audit timeline</h3>
            <div className="mt-5 space-y-4">
              {auditEvents.map((item) => (
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
            <h3 className="text-xl font-semibold text-slate-900">Control center</h3>
            <div className="mt-4 grid gap-3">
              {[
                "Run destination screening",
                "Archive export records",
                "Launch annual risk assessment",
                "Open violation report",
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