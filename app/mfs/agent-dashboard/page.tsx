"use client";

/**
 * MFS Control Center — unified operations console for a Bangladesh
 * mobile-financial-services operator/aggregator.
 *
 * Recommended fonts (add to your root layout, e.g. next/font or a
 * Google Fonts <link>):
 *   Display : "Fraunces"      (headlines, big ledger figures)
 *   Body/UI : "Inter"         (dense data, tables, nav)
 *   Mono    : "IBM Plex Mono" (references, phone numbers, amounts)
 *
 * All data below is illustrative/mock — wire each module's fetch to
 * your real `/api/mfs/*` endpoints in place of the local state.
 */

import { useMemo, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

const INK = "#0F1822";
const INK_SOFT = "rgba(255,255,255,0.6)";
const GOLD = "#B8912F";
const GREEN = "#1F7A4D";
const RED = "#B23A32";
const AMBER = "#C97A1E";
const SLATE = "#3B5166";
const DISPLAY_FONT = '"Fraunces", "Iowan Old Style", Georgia, serif';
const MONO_FONT = '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace';

type ModuleId =
  | "agent-dashboard"
  | "agent-onboarding"
  | "bb-compliance"
  | "bkash"
  | "cash-in-out"
  | "cellfin"
  | "commission"
  | "float-balance"
  | "fraud-aml-monitoring"
  | "merchant-payment"
  | "nagad"
  | "reconciliation"
  | "rocket"
  | "send-money"
  | "settlement"
  | "surecash"
  | "transaction-limits"
  | "transaction-reports"
  | "upay";

interface ModuleMeta {
  id: ModuleId;
  label: string;
  code: string;
  accent: string;
  group: string;
}

const NAV_GROUPS: { group: string; accent: string; items: ModuleMeta[] }[] = [
  {
    group: "Overview",
    accent: GOLD,
    items: [{ id: "agent-dashboard", label: "Agent Dashboard", code: "AD", accent: GOLD, group: "Overview" }],
  },
  {
    group: "Network",
    accent: GREEN,
    items: [
      { id: "agent-onboarding", label: "Agent Onboarding", code: "AO", accent: GREEN, group: "Network" },
      { id: "cash-in-out", label: "Cash In / Out", code: "CO", accent: GREEN, group: "Network" },
      { id: "commission", label: "Commission", code: "CM", accent: GREEN, group: "Network" },
      { id: "merchant-payment", label: "Merchant Payment", code: "MP", accent: GREEN, group: "Network" },
      { id: "send-money", label: "Send Money", code: "SM", accent: GREEN, group: "Network" },
    ],
  },
  {
    group: "Payment Rails",
    accent: "#8A5CC7",
    items: [
      { id: "bkash", label: "bKash", code: "BK", accent: "#E2136E", group: "Payment Rails" },
      { id: "cellfin", label: "CellFin", code: "CF", accent: "#3F7D20", group: "Payment Rails" },
      { id: "nagad", label: "Nagad", code: "NG", accent: "#F7941D", group: "Payment Rails" },
      { id: "rocket", label: "Rocket", code: "RK", accent: "#6C3FA3", group: "Payment Rails" },
      { id: "surecash", label: "SureCash", code: "SC", accent: "#0E8C89", group: "Payment Rails" },
      { id: "upay", label: "Upay", code: "UP", accent: "#1477C6", group: "Payment Rails" },
    ],
  },
  {
    group: "Risk & Compliance",
    accent: RED,
    items: [
      { id: "bb-compliance", label: "BB Compliance", code: "BB", accent: RED, group: "Risk & Compliance" },
      { id: "fraud-aml-monitoring", label: "Fraud & AML Monitoring", code: "FR", accent: RED, group: "Risk & Compliance" },
      { id: "transaction-limits", label: "Transaction Limits", code: "TL", accent: RED, group: "Risk & Compliance" },
    ],
  },
  {
    group: "Finance Ops",
    accent: SLATE,
    items: [
      { id: "float-balance", label: "Float Balance", code: "FB", accent: SLATE, group: "Finance Ops" },
      { id: "reconciliation", label: "Reconciliation", code: "RC", accent: SLATE, group: "Finance Ops" },
      { id: "settlement", label: "Settlement", code: "ST", accent: SLATE, group: "Finance Ops" },
      { id: "transaction-reports", label: "Transaction Reports", code: "TR", accent: SLATE, group: "Finance Ops" },
    ],
  },
];

const MODULE_META: Record<ModuleId, ModuleMeta> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items).map((m) => [m.id, m])
) as Record<ModuleId, ModuleMeta>;

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

const fmtL = (n: number) => `৳${(n / 100000).toFixed(2)}L`;
const fmtK = (n: number) => `৳${(n / 1000).toFixed(1)}K`;
const fmtFull = (n: number) => `৳${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/*  Shared UI primitives                                               */
/* ------------------------------------------------------------------ */

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {text}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-[0_1px_2px_rgba(15,24,34,0.05)] backdrop-blur-sm">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-[28px] font-bold leading-none text-[#16212F]" style={{ fontFamily: DISPLAY_FONT }}>
        {value}
      </div>
      {sub && (
        <div className="mt-2 text-xs font-bold" style={{ color: accent }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/[0.06]">
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm font-bold text-slate-400">
                No records match the current filters.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="transition-colors hover:bg-black/[0.02]">
                {r.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap px-4 py-3 font-bold text-slate-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ModuleHeader({
  eyebrow,
  title,
  description,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: accent }}>
          {eyebrow}
        </span>
      </div>
      <h2 className="text-[30px] font-bold leading-tight text-[#16212F]" style={{ fontFamily: DISPLAY_FONT }}>
        {title}
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm font-bold text-slate-500">{description}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  accent,
  variant = "solid",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  accent: string;
  variant?: "solid" | "outline";
  disabled?: boolean;
}) {
  const solid = { backgroundColor: accent, color: "#FFFFFF" };
  const outline = { backgroundColor: "transparent", color: accent, borderColor: accent };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={variant === "solid" ? solid : outline}
      className={`rounded-lg border px-3.5 py-1.5 text-xs font-extrabold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "outline" ? "" : "border-transparent"
      } hover:opacity-90`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment-rail providers (shared config + generic module)            */
/* ------------------------------------------------------------------ */

interface ProviderCfg {
  key: string;
  name: string;
  color: string;
  code: string;
  float: number;
  volumeToday: number;
  txnToday: number;
  successRate: number;
  settlementStatus: string;
}

const PROVIDERS: Record<string, ProviderCfg> = {
  bkash: { key: "bkash", name: "bKash", color: "#E2136E", code: "BK", float: 284500000, volumeToday: 18450000, txnToday: 212430, successRate: 99.2, settlementStatus: "On schedule" },
  cellfin: { key: "cellfin", name: "CellFin", color: "#3F7D20", code: "CF", float: 18400000, volumeToday: 940000, txnToday: 7210, successRate: 96.8, settlementStatus: "On schedule" },
  nagad: { key: "nagad", name: "Nagad", color: "#F7941D", code: "NG", float: 196200000, volumeToday: 14220000, txnToday: 171050, successRate: 98.7, settlementStatus: "On schedule" },
  rocket: { key: "rocket", name: "Rocket", color: "#6C3FA3", code: "RK", float: 74300000, volumeToday: 4310000, txnToday: 38900, successRate: 97.9, settlementStatus: "Delayed 2h" },
  surecash: { key: "surecash", name: "SureCash", color: "#0E8C89", code: "SC", float: 31800000, volumeToday: 1870000, txnToday: 15420, successRate: 98.1, settlementStatus: "On schedule" },
  upay: { key: "upay", name: "Upay", color: "#1477C6", code: "UP", float: 22650000, volumeToday: 1120000, txnToday: 9870, successRate: 97.4, settlementStatus: "On schedule" },
};

const SAMPLE_TXNS: Record<string, { ref: string; customer: string; type: string; amount: number; status: string }[]> = {
  bkash: [
    { ref: "BK-7X2K9M", customer: "Rahim Uddin · 017XXXXXX21", type: "Cash In", amount: 5000, status: "Completed" },
    { ref: "BK-4P1L7Q", customer: "Merchant · Anjuman Store", type: "Merchant Pay", amount: 2350, status: "Completed" },
    { ref: "BK-9T3W2R", customer: "Sultana Begum · 019XXXXXX08", type: "Send Money", amount: 1200, status: "Pending" },
    { ref: "BK-2Y8N4D", customer: "Karim Sheikh · 018XXXXXX44", type: "Cash Out", amount: 8000, status: "Failed" },
  ],
  nagad: [
    { ref: "NG-3K7H2P", customer: "Jamal Hossain · 019XXXXXX63", type: "Cash In", amount: 3500, status: "Completed" },
    { ref: "NG-8Q1M5T", customer: "Merchant · Green Fabrics", type: "Merchant Pay", amount: 9600, status: "Completed" },
    { ref: "NG-6W4L9X", customer: "Nasrin Akter · 017XXXXXX90", type: "Send Money", amount: 700, status: "Completed" },
    { ref: "NG-1R7Y3Z", customer: "Habibur Rahman · 015XXXXXX12", type: "Cash Out", amount: 4200, status: "Pending" },
  ],
  rocket: [
    { ref: "RK-5D9F2G", customer: "Farida Yasmin · 016XXXXXX37", type: "Cash In", amount: 2000, status: "Completed" },
    { ref: "RK-2H8J4K", customer: "Merchant · Delta Traders", type: "Merchant Pay", amount: 15400, status: "Delayed" },
    { ref: "RK-7L1N6M", customer: "Anwar Kabir · 013XXXXXX55", type: "Cash Out", amount: 6000, status: "Completed" },
    { ref: "RK-9P4Q2S", customer: "Ruma Islam · 018XXXXXX29", type: "Send Money", amount: 950, status: "Failed" },
  ],
  surecash: [
    { ref: "SC-4B7C1D", customer: "Delwar Hossain · 017XXXXXX76", type: "Cash In", amount: 1800, status: "Completed" },
    { ref: "SC-6E2F9G", customer: "Merchant · City Pharma", type: "Merchant Pay", amount: 3100, status: "Completed" },
    { ref: "SC-8H5J3K", customer: "Shirin Aktar · 019XXXXXX15", type: "Cash Out", amount: 5200, status: "Pending" },
  ],
  upay: [
    { ref: "UP-1M6N4P", customer: "Tanvir Ahmed · 018XXXXXX82", type: "Cash In", amount: 2600, status: "Completed" },
    { ref: "UP-3Q9R7S", customer: "Merchant · Nabin Electronics", type: "Merchant Pay", amount: 7800, status: "Completed" },
    { ref: "UP-5T2U8V", customer: "Moushumi Rani · 016XXXXXX04", type: "Send Money", amount: 500, status: "Pending" },
  ],
  cellfin: [
    { ref: "CF-2A6B9C", customer: "Imran Hossain · 017XXXXXX53", type: "Cash In", amount: 1500, status: "Completed" },
    { ref: "CF-5D3E8F", customer: "Merchant · Islami Mart", type: "Merchant Pay", amount: 4200, status: "Completed" },
    { ref: "CF-7G1H4J", customer: "Ayesha Siddika · 019XXXXXX47", type: "Send Money", amount: 800, status: "Pending" },
  ],
};

function statusColor(status: string) {
  if (status === "Completed" || status === "Matched" || status === "Active" || status === "Approved" || status === "On schedule" || status === "Done") return GREEN;
  if (status === "Pending" || status === "Delayed" || status === "Delayed 2h" || status === "Investigating" || status === "In Review") return AMBER;
  return RED;
}

function RailModule({ cfg }: { cfg: ProviderCfg }) {
  const rows = SAMPLE_TXNS[cfg.key] ?? [];
  return (
    <>
      <ModuleHeader
        eyebrow={`Payment Rail · ${cfg.code}`}
        title={cfg.name}
        description={`Live rail health, float position, and transaction flow for ${cfg.name}.`}
        accent={cfg.color}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Float balance" value={fmtL(cfg.float)} sub="Reconciled 09:00" accent={cfg.color} />
        <StatCard label="Volume today" value={fmtL(cfg.volumeToday)} sub={`${cfg.txnToday.toLocaleString()} transactions`} accent={cfg.color} />
        <StatCard label="Success rate" value={`${cfg.successRate}%`} sub="Trailing 24h" accent={cfg.color} />
        <StatCard label="Settlement" value={cfg.settlementStatus} sub="Next cycle 20:00" accent={cfg.color} />
      </div>
      <DataTable
        columns={["Reference", "Customer", "Type", "Amount", "Status"]}
        rows={rows.map((r) => [r.ref, r.customer, r.type, fmtFull(r.amount), <Pill key={r.ref} text={r.status} color={statusColor(r.status)} />])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview: Agent Dashboard                                          */
/* ------------------------------------------------------------------ */

interface Agent {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive" | "pending" | "suspended";
  totalTransactions: number;
  totalVolume: number;
  lastActiveAt: string | null;
}

const INITIAL_AGENTS: Agent[] = [
  { id: "AG-1042", name: "Mizanur Rahman", phone: "017XXXXXX21", status: "active", totalTransactions: 18420, totalVolume: 42300000, lastActiveAt: "2026-08-19T10:12:00Z" },
  { id: "AG-1088", name: "Salma Khatun", phone: "019XXXXXX08", status: "active", totalTransactions: 15210, totalVolume: 35800000, lastActiveAt: "2026-08-20T06:41:00Z" },
  { id: "AG-1103", name: "Abdul Karim", phone: "018XXXXXX44", status: "pending", totalTransactions: 0, totalVolume: 0, lastActiveAt: null },
  { id: "AG-1117", name: "Ruksana Parvin", phone: "016XXXXXX37", status: "inactive", totalTransactions: 4200, totalVolume: 6100000, lastActiveAt: "2026-07-02T09:00:00Z" },
  { id: "AG-1129", name: "Jashim Uddin", phone: "015XXXXXX12", status: "suspended", totalTransactions: 980, totalVolume: 1200000, lastActiveAt: "2026-06-14T11:30:00Z" },
];

function AgentDashboardModule() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = agents.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.phone.includes(search);
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status === "active").length,
    inactive: agents.filter((a) => a.status === "inactive").length,
    pending: agents.filter((a) => a.status === "pending").length,
    volumeToday: agents.reduce((s, a) => s + a.totalVolume, 0),
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <ModuleHeader eyebrow="Overview" title="Agent Banking Dashboard" description="Network-wide view of agent performance, transactions, and float health." accent={GOLD} />
        <div className="flex gap-2">
          <ActionButton
            accent={GOLD}
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 600);
            }}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </ActionButton>
          <ActionButton accent={GOLD} variant="outline">
            Export CSV
          </ActionButton>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total agents" value={String(stats.total)} sub={`${stats.active} active · ${stats.inactive} inactive`} accent={GOLD} />
        <StatCard label="Pending approval" value={String(stats.pending)} sub="Awaiting review" accent={AMBER} />
        <StatCard label="Network volume" value={fmtL(stats.volumeToday)} sub="All agents, lifetime" accent={GOLD} />
        <StatCard label="Alerts" value="2" sub="1 warning · 1 info" accent={RED} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-[#16212F]">Agent Directory</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={["Agent", "Phone", "Status", "Transactions", "Volume", "Last active", "Actions"]}
        rows={filtered.map((a) => [
          a.name,
          a.phone,
          <Pill key={a.id + "s"} text={a.status} color={statusColor(a.status === "active" ? "Active" : a.status === "suspended" ? "Suspended" : a.status === "pending" ? "Pending" : "Inactive")} />,
          a.totalTransactions.toLocaleString(),
          fmtK(a.totalVolume),
          a.lastActiveAt ? new Date(a.lastActiveAt).toLocaleDateString() : "Never",
          <div key={a.id + "actions"} className="flex gap-2">
            {a.status !== "active" && (
              <ActionButton accent={GREEN} onClick={() => setAgents((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "active" } : x)))}>
                Activate
              </ActionButton>
            )}
            {a.status !== "suspended" && (
              <ActionButton accent={RED} onClick={() => setAgents((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "suspended" } : x)))}>
                Suspend
              </ActionButton>
            )}
          </div>,
        ])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Network: Agent Onboarding                                          */
/* ------------------------------------------------------------------ */

const ONBOARDING_STAGES = ["Submitted", "Document Review", "NID Verification", "Field Verification", "Approved"];

interface Applicant {
  id: string;
  name: string;
  district: string;
  stage: string;
  submittedAt: string;
}

function AgentOnboardingModule() {
  const [applicants, setApplicants] = useState<Applicant[]>([
    { id: "OB-3301", name: "Nazrul Islam", district: "Cumilla", stage: "Document Review", submittedAt: "2026-08-15" },
    { id: "OB-3312", name: "Taslima Begum", district: "Rangpur", stage: "NID Verification", submittedAt: "2026-08-16" },
    { id: "OB-3325", name: "Shahidul Islam", district: "Barishal", stage: "Field Verification", submittedAt: "2026-08-12" },
    { id: "OB-3330", name: "Nurun Nahar", district: "Sylhet", stage: "Submitted", submittedAt: "2026-08-19" },
  ]);

  const advance = (id: string) =>
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = ONBOARDING_STAGES.indexOf(a.stage);
        return idx < ONBOARDING_STAGES.length - 1 ? { ...a, stage: ONBOARDING_STAGES[idx + 1] } : a;
      })
    );

  const counts = ONBOARDING_STAGES.map((s) => applicants.filter((a) => a.stage === s).length);

  return (
    <>
      <ModuleHeader eyebrow="Network" title="Agent Onboarding" description="KYC pipeline for new agent applications from submission to approval." accent={GREEN} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {ONBOARDING_STAGES.map((s, i) => (
          <StatCard key={s} label={s} value={String(counts[i])} sub="in stage" accent={GREEN} />
        ))}
      </div>
      <DataTable
        columns={["Applicant", "District", "Stage", "Submitted", "Action"]}
        rows={applicants.map((a) => [
          a.name,
          a.district,
          <Pill key={a.id} text={a.stage} color={a.stage === "Approved" ? GREEN : SLATE} />,
          a.submittedAt,
          <ActionButton key={a.id + "btn"} accent={GREEN} disabled={a.stage === "Approved"} onClick={() => advance(a.id)}>
            Advance stage
          </ActionButton>,
        ])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Network: Cash In / Out                                             */
/* ------------------------------------------------------------------ */

function CashInOutModule() {
  const rows = [
    { agent: "Mizanur Rahman", district: "Dhaka", cashIn: 3200000, cashOut: 2100000 },
    { agent: "Salma Khatun", district: "Chattogram", cashIn: 2750000, cashOut: 1980000 },
    { agent: "Delwar Hossain", district: "Khulna", cashIn: 1420000, cashOut: 1650000 },
    { agent: "Farida Yasmin", district: "Rajshahi", cashIn: 980000, cashOut: 870000 },
  ];
  const totalIn = rows.reduce((s, r) => s + r.cashIn, 0);
  const totalOut = rows.reduce((s, r) => s + r.cashOut, 0);
  return (
    <>
      <ModuleHeader eyebrow="Network" title="Cash In / Cash Out" description="Till-level cash movement across the agent network, updated hourly." accent={GREEN} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Cash in (today)" value={fmtL(totalIn)} sub="Network-wide" accent={GREEN} />
        <StatCard label="Cash out (today)" value={fmtL(totalOut)} sub="Network-wide" accent={GREEN} />
        <StatCard label="Net position" value={fmtL(totalIn - totalOut)} sub="In minus out" accent={GREEN} />
        <StatCard label="Tills below limit" value="6" sub="Need replenishment" accent={AMBER} />
      </div>
      <DataTable
        columns={["Agent", "District", "Cash in", "Cash out", "Net"]}
        rows={rows.map((r) => [r.agent, r.district, fmtFull(r.cashIn), fmtFull(r.cashOut), fmtFull(r.cashIn - r.cashOut)])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Network: Commission                                                */
/* ------------------------------------------------------------------ */

function CommissionModule() {
  const tiers = [
    { tier: "Standard", rate: "0.40%", cap: "৳500 / txn" },
    { tier: "Silver (500+ txns/mo)", rate: "0.45%", cap: "৳600 / txn" },
    { tier: "Gold (2,000+ txns/mo)", rate: "0.50%", cap: "৳750 / txn" },
    { tier: "Platinum (5,000+ txns/mo)", rate: "0.55%", cap: "৳900 / txn" },
  ];
  const earners = [
    { agent: "Mizanur Rahman", tier: "Platinum", payable: 184200 },
    { agent: "Salma Khatun", tier: "Gold", payable: 142500 },
    { agent: "Habibur Rahman", tier: "Gold", payable: 118900 },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Network" title="Commission" description="Payout tiers, accrual, and the current cycle's payable commission." accent={GREEN} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Payable this cycle" value={fmtL(4820000)} sub="Cycle closes Aug 31" accent={GREEN} />
        <StatCard label="Agents earning" value="3,142" sub="Of 4,982 total" accent={GREEN} />
        <StatCard label="Avg. rate" value="0.46%" sub="Network blended" accent={GREEN} />
        <StatCard label="Disputes open" value="7" sub="Under review" accent={AMBER} />
      </div>
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Rate card</h3>
        <DataTable columns={["Tier", "Rate", "Per-transaction cap"]} rows={tiers.map((t) => [t.tier, t.rate, t.cap])} />
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Top earners this cycle</h3>
      <DataTable columns={["Agent", "Tier", "Payable"]} rows={earners.map((e) => [e.agent, <Pill key={e.agent} text={e.tier} color={GREEN} />, fmtFull(e.payable)])} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk & Compliance: BB Compliance                                   */
/* ------------------------------------------------------------------ */

function BBComplianceModule() {
  const checklist = [
    { item: "e-KYC coverage across active agents", status: "Done", detail: "99.4% complete" },
    { item: "Agent AML/CFT refresher training", status: "In Review", detail: "87% of network trained" },
    { item: "Quarterly CTR filing", status: "Done", detail: "Filed Aug 5" },
    { item: "STR filings for flagged cases", status: "Pending", detail: "3 cases outstanding" },
  ];
  const deadlines = [
    { report: "Monthly Agent Activity Return", due: "2026-08-25", status: "Pending" },
    { report: "Suspicious Transaction Report batch", due: "2026-08-22", status: "Pending" },
    { report: "Quarterly Float Reserve Certificate", due: "2026-09-10", status: "Not started" },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Risk & Compliance" title="Bangladesh Bank Compliance" description="Regulatory checklist and filing calendar for BB's PSP/MFS guidelines." accent={RED} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Overall compliance" value="94%" sub="Weighted score" accent={RED} />
        <StatCard label="Open items" value="2" sub="Require action" accent={AMBER} />
        <StatCard label="Next deadline" value="Aug 22" sub="STR batch filing" accent={RED} />
        <StatCard label="Last audit" value="Jul 2026" sub="No material findings" accent={GREEN} />
      </div>
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Compliance checklist</h3>
        <DataTable
          columns={["Requirement", "Status", "Detail"]}
          rows={checklist.map((c) => [c.item, <Pill key={c.item} text={c.status} color={statusColor(c.status)} />, c.detail])}
        />
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Upcoming filings</h3>
      <DataTable columns={["Report", "Due date", "Status"]} rows={deadlines.map((d) => [d.report, d.due, <Pill key={d.report} text={d.status} color={statusColor(d.status)} />])} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk & Compliance: Fraud & AML Monitoring                          */
/* ------------------------------------------------------------------ */

function FraudAmlModule() {
  const flagged = [
    { id: "FR-8821", customer: "017XXXXXX21", rule: "Rapid cash-out after cash-in", risk: 91, status: "Escalated" },
    { id: "FR-8834", customer: "019XXXXXX63", rule: "Velocity: 12 txns / 10 min", risk: 78, status: "Investigating" },
    { id: "FR-8850", customer: "Merchant · Delta Traders", rule: "Structuring below reporting threshold", risk: 66, status: "Investigating" },
    { id: "FR-8861", customer: "016XXXXXX37", rule: "Device linked to 5 prior accounts", risk: 54, status: "Open" },
  ];
  const riskColor = (r: number) => (r >= 80 ? RED : r >= 60 ? AMBER : SLATE);
  return (
    <>
      <ModuleHeader eyebrow="Risk & Compliance" title="Fraud & AML Monitoring" description="Rule-triggered alerts, case status, and network risk posture." accent={RED} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open cases" value="19" sub="4 escalated" accent={RED} />
        <StatCard label="Flagged today" value="34" sub="0.02% of volume" accent={AMBER} />
        <StatCard label="Avg. resolution" value="6.4 hrs" sub="Trailing 30 days" accent={RED} />
        <StatCard label="Rules active" value="42" sub="Across 5 rails" accent={RED} />
      </div>
      <DataTable
        columns={["Case", "Subject", "Triggered rule", "Risk score", "Status"]}
        rows={flagged.map((f) => [f.id, f.customer, f.rule, <Pill key={f.id} text={String(f.risk)} color={riskColor(f.risk)} />, <Pill key={f.id + "s"} text={f.status} color={statusColor(f.status)} />])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk & Compliance: Transaction Limits                              */
/* ------------------------------------------------------------------ */

function TransactionLimitsModule() {
  const tiers = [
    { tier: "Tier 0 · Unverified", cashIn: "৳10,000/day", cashOut: "৳5,000/day", send: "৳5,000/day", monthly: "৳50,000" },
    { tier: "Tier 1 · Basic e-KYC", cashIn: "৳25,000/day", cashOut: "৳20,000/day", send: "৳15,000/day", monthly: "৳200,000" },
    { tier: "Tier 2 · Full KYC", cashIn: "৳100,000/day", cashOut: "৳50,000/day", send: "৳50,000/day", monthly: "৳500,000" },
    { tier: "Merchant", cashIn: "Unlimited", cashOut: "৳300,000/day", send: "N/A", monthly: "৳5,000,000" },
  ];
  const breaches = [
    { account: "019XXXXXX08", tier: "Tier 1", type: "Daily send money", exceededBy: "৳3,200" },
    { account: "Merchant · Nabin Electronics", tier: "Merchant", type: "Daily cash out", exceededBy: "৳18,000" },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Risk & Compliance" title="Transaction Limits" description="Per-tier KYC limits and today's breach attempts, blocked automatically." accent={RED} />
      <div className="mb-6">
        <DataTable columns={["Tier", "Cash in", "Cash out", "Send money", "Monthly cap"]} rows={tiers.map((t) => [t.tier, t.cashIn, t.cashOut, t.send, t.monthly])} />
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Limit breach attempts (blocked)</h3>
      <DataTable columns={["Account", "Tier", "Limit type", "Exceeded by"]} rows={breaches.map((b) => [b.account, b.tier, b.type, <Pill key={b.account} text={b.exceededBy} color={RED} />])} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Finance Ops: Float Balance                                         */
/* ------------------------------------------------------------------ */

function FloatBalanceModule() {
  const rows = Object.values(PROVIDERS).map((p) => ({ ...p, threshold: p.float < 50000000 ? "Low" : "Healthy" }));
  const lowCount = rows.filter((r) => r.threshold === "Low").length;
  return (
    <>
      <ModuleHeader eyebrow="Finance Ops" title="Float Balance" description="Real-time float position across every settlement rail, with replenishment thresholds." accent={SLATE} />
      {lowCount > 0 && (
        <div className="mb-6 rounded-2xl border border-[#C97A1E]/30 bg-[#C97A1E]/10 px-4 py-3 text-sm font-extrabold text-[#8A5416]">
          {lowCount} rail{lowCount > 1 ? "s are" : " is"} below the ৳50L healthy-float threshold — replenishment recommended before end of day.
        </div>
      )}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total float" value={fmtL(Object.values(PROVIDERS).reduce((s, p) => s + p.float, 0))} sub="All rails combined" accent={SLATE} />
        <StatCard label="Rails below threshold" value={String(lowCount)} sub="Needs replenishment" accent={AMBER} />
        <StatCard label="Largest position" value="bKash" sub={fmtL(PROVIDERS.bkash.float)} accent={SLATE} />
        <StatCard label="Smallest position" value="Upay" sub={fmtL(PROVIDERS.upay.float)} accent={SLATE} />
      </div>
      <DataTable
        columns={["Rail", "Float balance", "Status", "Action"]}
        rows={rows.map((r) => [
          <Pill key={r.key} text={r.name} color={r.color} />,
          fmtFull(r.float),
          <Pill key={r.key + "t"} text={r.threshold} color={r.threshold === "Low" ? AMBER : GREEN} />,
          <ActionButton key={r.key + "b"} accent={SLATE} variant="outline">
            Request replenishment
          </ActionButton>,
        ])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Finance Ops: Reconciliation                                        */
/* ------------------------------------------------------------------ */

function ReconciliationModule() {
  const rows = [
    { rail: "bKash", matched: 212180, unmatched: 250, discrepancy: 184000 },
    { rail: "Nagad", matched: 170890, unmatched: 160, discrepancy: 92000 },
    { rail: "Rocket", matched: 38700, unmatched: 200, discrepancy: 156000 },
    { rail: "SureCash", matched: 15390, unmatched: 30, discrepancy: 8000 },
    { rail: "Upay", matched: 9840, unmatched: 30, discrepancy: 4500 },
  ];
  const totalDiscrepancy = rows.reduce((s, r) => s + r.discrepancy, 0);
  return (
    <>
      <ModuleHeader eyebrow="Finance Ops" title="Reconciliation" description="Daily ledger match between rail-reported and internally-recorded transactions." accent={SLATE} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Matched today" value="99.7%" sub="Across all rails" accent={GREEN} />
        <StatCard label="Unmatched records" value="670" sub="Under investigation" accent={AMBER} />
        <StatCard label="Total discrepancy" value={fmtFull(totalDiscrepancy)} sub="Net exposure" accent={RED} />
        <StatCard label="Oldest open item" value="3 days" sub="Rocket batch #4471" accent={AMBER} />
      </div>
      <DataTable
        columns={["Rail", "Matched", "Unmatched", "Discrepancy"]}
        rows={rows.map((r) => [r.rail, r.matched.toLocaleString(), <Pill key={r.rail} text={String(r.unmatched)} color={r.unmatched > 150 ? AMBER : GREEN} />, fmtFull(r.discrepancy)])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Finance Ops: Settlement                                            */
/* ------------------------------------------------------------------ */

function SettlementModule() {
  const rows = [
    { batch: "STL-08201", rail: "bKash", amount: 18450000, status: "Completed", eta: "Settled 06:00" },
    { batch: "STL-08202", rail: "Nagad", amount: 14220000, status: "Completed", eta: "Settled 06:00" },
    { batch: "STL-08203", rail: "Rocket", amount: 4310000, status: "Processing", eta: "ETA 14:00" },
    { batch: "STL-08204", rail: "SureCash", amount: 1870000, status: "Pending", eta: "ETA 20:00" },
    { batch: "STL-08205", rail: "Upay", amount: 1120000, status: "Pending", eta: "ETA 20:00" },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Finance Ops" title="Settlement" description="Bank settlement batches per rail, from initiation through confirmed clearing." accent={SLATE} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Settled today" value={fmtL(32670000)} sub="2 of 5 rails" accent={GREEN} />
        <StatCard label="In processing" value={fmtL(4310000)} sub="1 rail" accent={AMBER} />
        <StatCard label="Pending" value={fmtL(2990000)} sub="2 rails, ETA 20:00" accent={SLATE} />
        <StatCard label="Next cycle" value="20:00" sub="Daily automated run" accent={SLATE} />
      </div>
      <DataTable
        columns={["Batch", "Rail", "Amount", "Status", "Timing"]}
        rows={rows.map((r) => [r.batch, r.rail, fmtFull(r.amount), <Pill key={r.batch} text={r.status} color={statusColor(r.status)} />, r.eta])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Finance Ops: Transaction Reports                                   */
/* ------------------------------------------------------------------ */

function TransactionReportsModule() {
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-08-20");
  const [rail, setRail] = useState("all");
  const [reports, setReports] = useState([
    { name: "Network summary — July 2026", range: "Jul 1–31, 2026", generated: "2026-08-01", format: "XLSX" },
    { name: "bKash reconciliation export", range: "Aug 1–15, 2026", generated: "2026-08-16", format: "CSV" },
    { name: "Fraud case log — Q2 2026", range: "Apr 1–Jun 30, 2026", generated: "2026-07-03", format: "PDF" },
  ]);

  const generate = () => {
    const label = rail === "all" ? "All rails" : PROVIDERS[rail]?.name ?? rail;
    setReports((prev) => [{ name: `${label} — custom export`, range: `${from} to ${to}`, generated: new Date().toISOString().slice(0, 10), format: "CSV" }, ...prev]);
  };

  return (
    <>
      <ModuleHeader eyebrow="Finance Ops" title="Transaction Reports" description="Generate and download transaction extracts for finance, audit, and regulators." accent={SLATE} />
      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-black/[0.06] bg-white/70 p-5 backdrop-blur-sm">
        <div>
          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Rail</label>
          <select value={rail} onChange={(e) => setRail(e.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <option value="all">All rails</option>
            {Object.values(PROVIDERS).map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <ActionButton accent={SLATE} onClick={generate}>
          Generate report
        </ActionButton>
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Recent reports</h3>
      <DataTable
        columns={["Report", "Range", "Generated", "Format", ""]}
        rows={reports.map((r, i) => [
          r.name,
          r.range,
          r.generated,
          <Pill key={i} text={r.format} color={SLATE} />,
          <ActionButton key={i + "dl"} accent={SLATE} variant="outline">
            Download
          </ActionButton>,
        ])}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Network: Merchant Payment & Send Money                             */
/* ------------------------------------------------------------------ */

function MerchantPaymentModule() {
  const merchants = [
    { name: "Anjuman Store", category: "Grocery", volume: 4820000, txns: 3120 },
    { name: "Delta Traders", category: "Wholesale", volume: 15400000, txns: 890 },
    { name: "City Pharma", category: "Pharmacy", volume: 3100000, txns: 2450 },
    { name: "Nabin Electronics", category: "Electronics", volume: 7800000, txns: 610 },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Network" title="Merchant Payment" description="QR and merchant-code payment volume across the registered merchant base." accent={GREEN} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active merchants" value="12,480" sub="+312 this month" accent={GREEN} />
        <StatCard label="QR volume today" value={fmtL(31100000)} sub="Across 5 rails" accent={GREEN} />
        <StatCard label="Avg. ticket size" value="৳1,240" sub="Trailing 7 days" accent={GREEN} />
        <StatCard label="Settlement pending" value={fmtL(4200000)} sub="To 340 merchants" accent={AMBER} />
      </div>
      <DataTable columns={["Merchant", "Category", "Volume (30d)", "Transactions"]} rows={merchants.map((m) => [m.name, m.category, fmtFull(m.volume), m.txns.toLocaleString()])} />
    </>
  );
}

function SendMoneyModule() {
  const corridors = [
    { corridor: "Dhaka → Rangpur", volume: 8420000, txns: 21400 },
    { corridor: "Chattogram → Sylhet", volume: 6210000, txns: 15800 },
    { corridor: "Dhaka → Barishal", volume: 4980000, txns: 12900 },
    { corridor: "Khulna → Rajshahi", volume: 2140000, txns: 6700 },
  ];
  return (
    <>
      <ModuleHeader eyebrow="Network" title="Send Money" description="Peer-to-peer transfer volume and the network's busiest corridors." accent={GREEN} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="P2P volume today" value={fmtL(21750000)} sub="Across 5 rails" accent={GREEN} />
        <StatCard label="Transfers today" value="56,800" sub="+4.2% vs. yesterday" accent={GREEN} />
        <StatCard label="Fee revenue" value={fmtFull(1084000)} sub="Today, network-wide" accent={GREEN} />
        <StatCard label="Avg. transfer" value="৳383" sub="Trailing 7 days" accent={GREEN} />
      </div>
      <h3 className="mb-3 text-lg font-extrabold text-[#16212F]">Busiest corridors</h3>
      <DataTable columns={["Corridor", "Volume (7d)", "Transfers"]} rows={corridors.map((c) => [c.corridor, fmtFull(c.volume), c.txns.toLocaleString()])} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Signature: live float ledger strip                                 */
/* ------------------------------------------------------------------ */

function LedgerStrip() {
  const items = Object.values(PROVIDERS);
  return (
    <div className="flex items-center gap-0 overflow-x-auto border-b border-white/10 px-6 py-2.5" style={{ backgroundColor: INK }}>
      <span className="mr-4 shrink-0 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
        Live Float Ledger
      </span>
      {items.map((it) => (
        <div key={it.key} className="flex shrink-0 items-center gap-2 border-l border-white/10 px-4 first:border-l-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: it.color }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: it.color }} />
          </span>
          <span className="text-[11px] font-extrabold" style={{ color: INK_SOFT }}>
            {it.code}
          </span>
          <span className="text-[13px] font-bold text-white" style={{ fontFamily: MONO_FONT }}>
            {fmtL(it.float)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell: sidebar, top bar, module switch                             */
/* ------------------------------------------------------------------ */

function renderModule(id: ModuleId) {
  switch (id) {
    case "agent-dashboard":
      return <AgentDashboardModule />;
    case "agent-onboarding":
      return <AgentOnboardingModule />;
    case "bb-compliance":
      return <BBComplianceModule />;
    case "bkash":
      return <RailModule cfg={PROVIDERS.bkash} />;
    case "cash-in-out":
      return <CashInOutModule />;
    case "cellfin":
      return <RailModule cfg={PROVIDERS.cellfin} />;
    case "commission":
      return <CommissionModule />;
    case "float-balance":
      return <FloatBalanceModule />;
    case "fraud-aml-monitoring":
      return <FraudAmlModule />;
    case "merchant-payment":
      return <MerchantPaymentModule />;
    case "nagad":
      return <RailModule cfg={PROVIDERS.nagad} />;
    case "reconciliation":
      return <ReconciliationModule />;
    case "rocket":
      return <RailModule cfg={PROVIDERS.rocket} />;
    case "send-money":
      return <SendMoneyModule />;
    case "settlement":
      return <SettlementModule />;
    case "surecash":
      return <RailModule cfg={PROVIDERS.surecash} />;
    case "transaction-limits":
      return <TransactionLimitsModule />;
    case "transaction-reports":
      return <TransactionReportsModule />;
    case "upay":
      return <RailModule cfg={PROVIDERS.upay} />;
  }
}

export default function MFSControlCenter() {
  const [active, setActive] = useState<ModuleId>("agent-dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const meta = MODULE_META[active];

  const filteredGroups = useMemo(() => {
    if (!globalSearch.trim()) return NAV_GROUPS;
    const q = globalSearch.toLowerCase();
    return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) })).filter((g) => g.items.length > 0);
  }, [globalSearch]);

  return (
    <div className="flex min-h-screen font-sans" style={{ ["--accent" as any]: meta.accent }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[264px] shrink-0 overflow-y-auto transition-transform lg:static lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: INK }}
      >
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: GOLD }}>
            <span className="text-sm font-extrabold text-[#0F1822]">MC</span>
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">Meridian Pay</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: INK_SOFT }}>
              Control Center
            </div>
          </div>
        </div>

        <nav className="px-3 pb-8">
          {filteredGroups.map((g) => (
            <div key={g.group} className="mb-5">
              <div className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                {g.group}
              </div>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActive(item.id);
                        setMobileNavOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      style={{
                        backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                        color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold"
                        style={{ backgroundColor: isActive ? item.accent : "rgba(255,255,255,0.06)", color: isActive ? "#0B1017" : "rgba(255,255,255,0.6)" }}
                      >
                        {item.code}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {mobileNavOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />}

      {/* Main */}
      <div className="flex min-h-screen w-full flex-1 flex-col bg-gradient-to-br from-[#FBF9F4] via-[#F6F2E7] to-[#EFE9DA]">
        {/* Top bar */}
        <div
          className="flex items-center justify-between gap-4 border-b bg-white/60 px-6 py-3.5 backdrop-blur-sm transition-colors duration-300"
          style={{ borderBottomColor: `${meta.accent}33` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-extrabold text-slate-700 lg:hidden"
            >
              Menu
            </button>
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search modules…"
              className="w-56 rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-sm font-bold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold sm:inline-flex" style={{ backgroundColor: `${GOLD}1A`, color: GOLD }}>
              ● VIP DESK
            </span>
            <span className="text-xs font-bold text-slate-500">Bangladesh Bank PSP-114</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ backgroundColor: INK }}>
              RA
            </div>
          </div>
        </div>

        <LedgerStrip />

        {/* Module content */}
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">{renderModule(active)}</div>
        </main>
      </div>
    </div>
  );
}
