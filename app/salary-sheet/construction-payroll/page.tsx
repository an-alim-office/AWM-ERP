"use client";
 
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit3,
  Check,
  X,
  FileSpreadsheet,
  Plus,
  Camera,
  Building2,
  UserRound,
  Search,
  ChevronDown,
  Moon,
  Sun,
  Edit2,
  Menu,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Printer,
  FileDown,
  MessageCircle,
  Send,
  ZoomIn,
  ZoomOut,
  Palette,
} from "lucide-react";
import { ResizableTable, ResizableColumn } from "@/components/ResizableTable";
 
/* =========================================================================
   Types
   ========================================================================= */
 
type Designation =
  | "Engineer"
  | "Scaffolder"
  | "SteelFixer"
  | "Foreman"
  | "Mason"
  | "Laborer"
  | "Supervisor"
  | "Electrician"
  | "Carpenter"
  | "Plumber"
  | "Helper"
  | "Manager"
  | "Skilled Labor"
  | "General Labor";
 
type PaymentStatus = "Paid" | "Pending" | "Processing" | "Approved" | "Draft";
 
type CurrencyCode =
  | "SAR"
  | "BDT"
  | "USD"
  | "EUR"
  | "GBP"
  | "PKR"
  | "INR"
  | "AED"
  | "QAR"
  | "OMR";
 
interface PayrollWorker {
  id: string;
  employeeId: string;
  name: string;
  designation: Designation;
  projectCode: string;
  siteLocation: string;
 
  baseRate: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimeMultiplier: number;
 
  housingAllowance: number;
  transportAllowance: number;
  riskAllowance: number;
 
  gosiDeduction: number;
  taxDeduction: number;
  advanceDeduction: number;
  absenceHours: number;
  leaveDays: number;
 
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netAmount: number;
 
  paymentStatus: PaymentStatus;
  currency: CurrencyCode;
  payrollMonth: string;
  payrollYear: number;
 
  photoUrl: string | null;
  rowColor?: string | null;
  source?: "manual" | "bulk-paste" | "import" | "api";
}
 
interface PayrollAiSnapshot {
  workerCount: number;
  grossPayroll: number;
  netPayroll: number;
  allowancesTotal: number;
  deductionsTotal: number;
  overtimeHoursTotal: number;
  leaveDaysTotal: number;
  absenceHoursTotal: number;
  topProjects: Array<{ projectCode: string; totalNet: number }>;
  topDesignations: Array<{ designation: Designation; count: number }>;
  currency: CurrencyCode;
}
 
interface Props {
  initialData?: PayrollWorker[];
  onAiSnapshot?: (snapshot: PayrollAiSnapshot) => void;
}
 
type SalarySheetApiResponse<T> = {
  success: boolean;
  message?: string;
  record?: T;
  records?: T[];
  rejectedRows?: Array<{
    row: number;
    errors: Record<string, string>;
    record: unknown;
  }>;
};
 
type TableAlign = "left" | "center" | "right";
 
/* =========================================================================
   Constants
   ========================================================================= */
 
const COMPANY_NAME = "";
const DEFAULT_CURRENCY: CurrencyCode = "SAR";
 
const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
 
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => 2021 + i);
 
const DESIGNATION_OPTIONS: Designation[] = [
  "Engineer",
  "Scaffolder",
  "SteelFixer",
  "Foreman",
  "Supervisor",
  "Mason",
  "Laborer",
  "Electrician",
  "Carpenter",
  "Plumber",
  "Helper",
  "Manager",
  "Skilled Labor",
  "General Labor",
];
 
const STATUS_OPTIONS: PaymentStatus[] = ["Paid", "Pending", "Processing", "Approved", "Draft"];
 
const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string }> = [
  { code: "SAR", label: "Saudi Riyal (SAR)" },
  { code: "BDT", label: "Bangladeshi Taka (BDT)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "PKR", label: "Pakistani Rupee (PKR)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "QAR", label: "Qatari Riyal (QAR)" },
  { code: "OMR", label: "Omani Rial (OMR)" },
];
 
const DESIGNATION_LABELS: Record<Designation, string> = {
  Engineer: "Engineer",
  Scaffolder: "Scaffolder",
  SteelFixer: "SteelFixer",
  Foreman: "Foreman",
  Supervisor: "Supervisor",
  Mason: "Mason",
  Laborer: "Laborer",
  Electrician: "Electrician",
  Carpenter: "Carpenter",
  Plumber: "Plumber",
  Helper: "Helper",
  Manager: "Manager",
  "Skilled Labor": "Skilled Labor",
  "General Labor": "General Labor",
};
 
const STATUS_LABELS: Record<PaymentStatus, string> = {
  Paid: "Paid",
  Pending: "Pending",
  Processing: "Processing",
  Approved: "Approved",
  Draft: "Draft",
};
 
const ROW_COLOR_OPTIONS: Array<{ label: string; value: string | null }> = [
  { label: "None", value: null },
  { label: "Red", value: "#fee2e2" },
  { label: "Orange", value: "#ffedd5" },
  { label: "Amber", value: "#fef3c7" },
  { label: "Green", value: "#dcfce7" },
  { label: "Teal", value: "#ccfbf1" },
  { label: "Blue", value: "#dbeafe" },
  { label: "Violet", value: "#ede9fe" },
  { label: "Pink", value: "#fce7f3" },
  { label: "Slate", value: "#e2e8f0" },
];
 
const FONT_SCALE_MIN = 0.8;
const FONT_SCALE_MAX = 1.4;
const FONT_SCALE_STEP = 0.1;
 
const SOCIAL_MENU_ITEMS = [
  {
    label: "AWM-SMS",
    href: "/awm-sms",
    icon: <MessageCircle size={15} />,
  },
    
  {
    label: "WhatsApp",
    href: "https://wa.me/",
    icon: <MessageCircle size={15} />,
  },
  
{
  label: "Messenger",
  href: "https://www.messenger.com/",
  icon: <MessageCircle size={15} />,
},
 
  {
    label: "AWM Enterprise Social",
    href: "/enterprise-social",
    icon: <UserRound size={15} />,
  },
  {
    label: "Telegram",
    href: "https://t.me/",
    icon: <Send size={15} />,
  },
];
 
/* =========================================================================
   Helpers
   ========================================================================= */
 
function getCurrentPayrollPeriod() {
  const now = new Date();
  return {
    payrollMonth: now.toLocaleString("en-US", { month: "long" }),
    payrollYear: now.getFullYear(),
  };
}
 
function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
 
function safeNumber(value: unknown): number {
  const raw =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(raw) || Number.isNaN(raw)) return 0;
  return raw < 0 ? 0 : raw;
}
 
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `EMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
 
function formatMoney(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}
 
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
 
function rowTint(worker: PayrollWorker, content: React.ReactNode): React.ReactNode {
  if (!worker.rowColor) return content;
  return (
    <div
      className="flex h-full min-h-[32px] w-full items-center"
      style={{
        backgroundColor: worker.rowColor,
        margin: "-8px -10px",
        padding: "8px 10px",
      }}
    >
      {content}
    </div>
  );
}
 
function recalculateWorker(worker: PayrollWorker): PayrollWorker {
  const baseRate = safeNumber(worker.baseRate);
  const hoursWorked = safeNumber(worker.hoursWorked);
  const overtimeHours = safeNumber(worker.overtimeHours);
  const overtimeMultiplier = Math.max(1, safeNumber(worker.overtimeMultiplier) || 1.5);
 
  const housingAllowance = safeNumber(worker.housingAllowance);
  const transportAllowance = safeNumber(worker.transportAllowance);
  const riskAllowance = safeNumber(worker.riskAllowance);
 
  const gosiDeduction = safeNumber(worker.gosiDeduction);
  const taxDeduction = safeNumber(worker.taxDeduction);
  const advanceDeduction = safeNumber(worker.advanceDeduction);
  const absenceHours = safeNumber(worker.absenceHours);
  const leaveDays = safeNumber(worker.leaveDays);
 
  const regularPay = baseRate * hoursWorked;
  const overtimePay = baseRate * overtimeHours * overtimeMultiplier;
  const totalAllowances = housingAllowance + transportAllowance + riskAllowance;
 
  const absenceDeduction = baseRate * absenceHours;
  const totalDeductions = gosiDeduction + taxDeduction + advanceDeduction + absenceDeduction;
 
  const grossSalary = parseFloat((regularPay + overtimePay + totalAllowances).toFixed(2));
  const netAmount = parseFloat(Math.max(0, grossSalary - totalDeductions).toFixed(2));
 
  return {
    ...worker,
    baseRate,
    hoursWorked,
    overtimeHours,
    overtimeMultiplier,
    housingAllowance,
    transportAllowance,
    riskAllowance,
    gosiDeduction,
    taxDeduction,
    advanceDeduction,
    absenceHours,
    leaveDays,
    grossSalary,
    totalAllowances: parseFloat(totalAllowances.toFixed(2)),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netAmount,
  };
}
 
function createEmptyWorker(
  period?: { payrollMonth: string; payrollYear: number },
  currency: CurrencyCode = DEFAULT_CURRENCY
): PayrollWorker {
  const p = period ?? getCurrentPayrollPeriod();
  return recalculateWorker({
    id: generateId(),
    employeeId: "",
    name: "",
    designation: "Laborer",
    projectCode: "",
    siteLocation: "",
    baseRate: 0,
    hoursWorked: 0,
    overtimeHours: 0,
    overtimeMultiplier: 1.5,
    housingAllowance: 0,
    transportAllowance: 0,
    riskAllowance: 0,
    gosiDeduction: 0,
    taxDeduction: 0,
    advanceDeduction: 0,
    absenceHours: 0,
    leaveDays: 0,
    grossSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    netAmount: 0,
    paymentStatus: "Pending",
    currency,
    payrollMonth: p.payrollMonth,
    payrollYear: p.payrollYear,
    photoUrl: null,
    rowColor: null,
    source: "manual",
  });
}
 
function splitDelimitedLine(line: string, delimiter: string) {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
 
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
 
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
 
    if (ch === delimiter && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }
 
    current += ch;
  }
 
  out.push(current.trim());
  return out.map((v) => v.replace(/^"(.*)"$/, "$1").trim());
}
 
function detectDelimiter(line: string) {
  const candidates = [
    { d: "\t", c: (line.match(/\t/g) || []).length },
    { d: "|", c: (line.match(/\|/g) || []).length },
    { d: ";", c: (line.match(/;/g) || []).length },
    { d: ",", c: (line.match(/,/g) || []).length },
  ];
  candidates.sort((a, b) => b.c - a.c);
  return candidates[0].c > 0 ? candidates[0].d : ",";
}
 
function looksLikeHeader(line: string) {
  const t = normalizeKey(line);
  return (
    t.includes("employeeid") ||
    t.includes("name") ||
    t.includes("designation") ||
    t.includes("projectcode") ||
    t.includes("sitelocation") ||
    t.includes("baserate")
  );
}
 
function normalizeDesignation(text: string): Designation {
  const v = text.trim().toLowerCase();
  if (v.includes("engineer")) return "Engineer";
  if (v.includes("scaffolder")) return "Scaffolder";
  if (v.includes("steelfixer")) return "SteelFixer";
  if (v.includes("foreman")) return "Foreman";
  if (v.includes("supervisor")) return "Supervisor";
  if (v.includes("mason")) return "Mason";
  if (v.includes("laborer") || v.includes("labourer") || v.includes("worker")) return "Laborer";
  if (v.includes("electric")) return "Electrician";
  if (v.includes("carpenter")) return "Carpenter";
  if (v.includes("plumb")) return "Plumber";
  if (v.includes("manager")) return "Manager";
  if (v.includes("skilled")) return "Skilled Labor";
  if (v.includes("general")) return "General Labor";
  return "Helper";
}
 
function normalizeStatus(text: string): PaymentStatus {
  const v = text.trim().toLowerCase();
  if (v === "paid") return "Paid";
  if (v === "processing") return "Processing";
  if (v === "approved") return "Approved";
  if (v === "draft") return "Draft";
  return "Pending";
}
 
function normalizeCurrency(text: string, fallback: CurrencyCode) {
  const v = text.trim().toUpperCase() as CurrencyCode;
  const allowed: CurrencyCode[] = ["SAR", "BDT", "USD", "EUR", "GBP", "PKR", "INR", "AED", "QAR", "OMR"];
  return allowed.includes(v) ? v : fallback;
}
 
function uniqueEmployeeId(baseId: string, existingIds: Set<string>) {
  const clean = baseId.trim();
  if (!clean) return generateId();
  if (!existingIds.has(clean.toLowerCase())) return clean;
 
  let i = 2;
  while (existingIds.has(`${clean}-${i}`.toLowerCase())) i++;
  return `${clean}-${i}`;
}
 
function buildLookupObject(obj: Record<string, unknown>) {
  const map = new Map<string, unknown>();
  Object.entries(obj).forEach(([k, v]) => map.set(normalizeKey(k), v));
  return map;
}
 
function readLookup(lookup: Map<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const v = lookup.get(normalizeKey(key));
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}
 
function normalizeWorkerLike(
  input: unknown,
  index: number,
  existingIds: Set<string>,
  defaults: { payrollMonth: string; payrollYear: number; currency: CurrencyCode }
): PayrollWorker {
  const obj = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const lookup = buildLookupObject(obj);
 
  const employeeIdRaw = String(
    readLookup(lookup, ["employeeId", "Employee ID", "empId", "id", "workerId"]) ??
      `AUTO-${defaults.payrollYear}-${index + 1}`
  );
 
  const employeeId = uniqueEmployeeId(employeeIdRaw, existingIds);
  existingIds.add(employeeId.toLowerCase());
 
  const worker: PayrollWorker = {
    id: String(readLookup(lookup, ["id"]) ?? generateId()),
    employeeId,
    name: String(readLookup(lookup, ["name", "Employee Name"]) ?? `Worker ${index + 1}`),
    designation: normalizeDesignation(String(readLookup(lookup, ["designation", "Designation"]) ?? "Helper")),
    projectCode: String(
      readLookup(lookup, ["projectCode", "Project Code", "project", "Department"]) ?? "UNASSIGNED"
    ),
    siteLocation: String(readLookup(lookup, ["siteLocation", "Site Location", "location", "site"]) ?? ""),
    baseRate: safeNumber(readLookup(lookup, ["baseRate", "Base Rate", "Basic Salary"])),
    hoursWorked: safeNumber(readLookup(lookup, ["hoursWorked", "Hours Worked", "Working Days"])),
    overtimeHours: safeNumber(readLookup(lookup, ["overtimeHours", "Overtime Hours"])),
    overtimeMultiplier: Math.max(1, safeNumber(readLookup(lookup, ["overtimeMultiplier", "OT Multiplier"])) || 1.5),
    housingAllowance: safeNumber(readLookup(lookup, ["housingAllowance", "Housing Allowance"])),
    transportAllowance: safeNumber(readLookup(lookup, ["transportAllowance", "Transport Allowance"])),
    riskAllowance: safeNumber(readLookup(lookup, ["riskAllowance", "Risk Allowance"])),
    gosiDeduction: safeNumber(readLookup(lookup, ["gosiDeduction", "GOSI Deduction"])),
    taxDeduction: safeNumber(readLookup(lookup, ["taxDeduction", "Tax Deduction", "Income Tax"])),
    advanceDeduction: safeNumber(readLookup(lookup, ["advanceDeduction", "Advance Deduction", "Payroll Advance"])),
    absenceHours: safeNumber(readLookup(lookup, ["absenceHours", "Absence Hours"])),
    leaveDays: safeNumber(readLookup(lookup, ["leaveDays", "Leave Days"])),
    grossSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    netAmount: 0,
    paymentStatus: normalizeStatus(
      String(readLookup(lookup, ["paymentStatus", "Payment Status", "Payroll Status"]) ?? "Pending")
    ),
    currency: normalizeCurrency(String(readLookup(lookup, ["currency", "Currency"]) ?? defaults.currency), defaults.currency),
    payrollMonth: String(readLookup(lookup, ["payrollMonth", "Payroll Month"]) ?? defaults.payrollMonth),
    payrollYear: safeNumber(readLookup(lookup, ["payrollYear", "Payroll Year"])) || defaults.payrollYear,
    photoUrl:
      typeof readLookup(lookup, ["photoUrl", "Photo URL"]) === "string"
        ? String(readLookup(lookup, ["photoUrl", "Photo URL"]))
        : null,
    rowColor:
      typeof readLookup(lookup, ["rowColor", "Row Color"]) === "string"
        ? String(readLookup(lookup, ["rowColor", "Row Color"]))
        : null,
    source: "bulk-paste",
  };
 
  return recalculateWorker(worker);
}
 
function parseKeyValueLine(line: string, delimiter: string) {
  const tokens = splitDelimitedLine(line, delimiter);
  const obj: Record<string, unknown> = {};
 
  for (const token of tokens) {
    const eqIndex = token.indexOf("=");
    const colonIndex = token.indexOf(":");
    const splitIndex =
      eqIndex >= 0 && colonIndex >= 0 ? Math.min(eqIndex, colonIndex) : Math.max(eqIndex, colonIndex);
 
    if (splitIndex <= 0) continue;
 
    const key = token.slice(0, splitIndex).trim();
    const value = token.slice(splitIndex + 1).trim();
    obj[key] = value;
  }
 
  return obj;
}
 
function parsePositionalLine(line: string, delimiter: string) {
  const cols = splitDelimitedLine(line, delimiter);
  const keys = [
    "employeeId",
    "name",
    "designation",
    "projectCode",
    "siteLocation",
    "baseRate",
    "hoursWorked",
    "overtimeHours",
    "overtimeMultiplier",
    "housingAllowance",
    "transportAllowance",
    "riskAllowance",
    "gosiDeduction",
    "taxDeduction",
    "advanceDeduction",
    "leaveDays",
    "absenceHours",
    "paymentStatus",
    "currency",
  ];
 
  const obj: Record<string, unknown> = {};
  keys.forEach((k, i) => {
    if (cols[i] !== undefined) obj[k] = cols[i];
  });
  return obj;
}
 
function extractRecordsFromBulkText(raw: string): Array<Record<string, unknown>> {
  const text = raw.trim();
  if (!text) return [];
 
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      if (Array.isArray((parsed as any).records)) return (parsed as any).records;
      if ((parsed as any).record && typeof (parsed as any).record === "object") return [(parsed as any).record];
      return [parsed];
    }
  } catch {
    // fall through
  }
 
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#") && !l.startsWith("//"));
 
  if (lines.length === 0) return [];
 
  const delimiter = detectDelimiter(lines[0]);
  let headers: string[] | null = null;
  let startIndex = 0;
 
  if (looksLikeHeader(lines[0])) {
    headers = splitDelimitedLine(lines[0], delimiter);
    startIndex = 1;
  }
 
  const rows: Record<string, unknown>[] = [];
 
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
 
    if (line.startsWith("{") && line.endsWith("}")) {
      try {
        const parsed = JSON.parse(line);
        if (parsed && typeof parsed === "object") rows.push(parsed);
        continue;
      } catch {
        // ignore
      }
    }
 
    if (line.includes("=") || line.includes(":")) {
      const kv = parseKeyValueLine(line, delimiter);
      if (Object.keys(kv).length > 0) {
        rows.push(kv);
        continue;
      }
    }
 
    if (headers) {
      const values = splitDelimitedLine(line, delimiter);
      const obj: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        if (values[idx] !== undefined) obj[h] = values[idx];
      });
      rows.push(obj);
      continue;
    }
 
    rows.push(parsePositionalLine(line, delimiter));
  }
 
  return rows;
}
 
async function apiJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
 
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }
  return data as T;
}
 
/* =========================================================================
   API helpers
   ========================================================================= */
 
function buildApiRecord(worker: PayrollWorker) {
  return {
    id: worker.id,
    employeeId: worker.employeeId.trim(),
    name: worker.name.trim(),
    designation: worker.designation,
    projectCode: worker.projectCode.trim(),
    siteLocation: worker.siteLocation.trim(),
    baseRate: worker.baseRate,
    hoursWorked: worker.hoursWorked,
    overtimeHours: worker.overtimeHours,
    overtimeMultiplier: worker.overtimeMultiplier,
    housingAllowance: worker.housingAllowance,
    transportAllowance: worker.transportAllowance,
    riskAllowance: worker.riskAllowance,
    gosiDeduction: worker.gosiDeduction,
    taxDeduction: worker.taxDeduction,
    advanceDeduction: worker.advanceDeduction,
    absenceHours: worker.absenceHours,
    leaveDays: worker.leaveDays,
    paymentStatus: worker.paymentStatus,
    currency: worker.currency,
    payrollMonth: worker.payrollMonth,
    payrollYear: worker.payrollYear,
    photoUrl: worker.photoUrl,
    rowColor: worker.rowColor ?? null,
    source: worker.source || "manual",
  };
}
 
async function saveNewWorkerToMongo(worker: PayrollWorker) {
  return apiJson<SalarySheetApiResponse<PayrollWorker>>("/api/payroll-service/salary-sheet", {
    method: "POST",
    body: JSON.stringify({
      record: buildApiRecord(worker),
      meta: {
        payrollMonth: worker.payrollMonth,
        payrollYear: worker.payrollYear,
        currency: worker.currency,
        source: worker.source || "manual",
      },
    }),
  });
}
 
async function saveBulkWorkersToMongo(workers: PayrollWorker[]) {
  if (workers.length === 0) throw new Error("No bulk rows to save");
 
  return apiJson<SalarySheetApiResponse<PayrollWorker>>("/api/payroll-service/salary-sheet", {
    method: "POST",
    body: JSON.stringify({
      mode: "lenient",
      meta: {
        payrollMonth: workers[0].payrollMonth,
        payrollYear: workers[0].payrollYear,
        currency: workers[0].currency,
        source: "bulk-paste",
      },
      records: workers.map(buildApiRecord),
    }),
  });
}
 
async function updateWorkerToMongo(worker: PayrollWorker) {
  return apiJson<SalarySheetApiResponse<PayrollWorker>>(
    `/api/payroll-service/salary-sheet?id=${encodeURIComponent(worker.id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        id: worker.id,
        record: buildApiRecord(worker),
        meta: {
          payrollMonth: worker.payrollMonth,
          payrollYear: worker.payrollYear,
          currency: worker.currency,
        },
      }),
    }
  );
}
 
async function deleteWorkersFromMongo(ids: string[]) {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
 
  for (const chunk of chunks) {
    await apiJson(
      "/api/payroll-service/salary-sheet?" +
        new URLSearchParams({ ids: chunk.join(",") }).toString(),
      {
        method: "DELETE",
      }
    );
  }
}
 
async function fetchWorkersFromMongo(month: string, year: number) {
  const qs = new URLSearchParams({
    month,
    year: String(year),
    limit: "1000",
    page: "1",
  });
 
  const res = await fetch(`/api/payroll-service/salary-sheet?${qs.toString()}`, {
    cache: "no-store",
  });
 
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.message || "Failed to load workers");
  }
 
  return (Array.isArray(data.records) ? data.records : []).map((r: any) =>
    recalculateWorker({
      ...r,
      currency: r.currency || DEFAULT_CURRENCY,
      payrollMonth: r.payrollMonth || month,
      payrollYear: r.payrollYear || year,
      rowColor: r.rowColor ?? null,
      source: r.source || "api",
    })
  ) as PayrollWorker[];
}
 
/* =========================================================================
   UI helpers
   ========================================================================= */
 
function KpiCard({
  title,
  value,
  hint,
  themeMode,
}: {
  title: string;
  value: string;
  hint: string;
  themeMode: "vip" | "midnight";
}) {
  const isVip = themeMode === "vip";
 
  return (
    <div
      className={
        isVip
          ? "rounded-3xl border border-amber-300/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.32)]"
          : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div
        className={
          isVip
            ? "text-xs font-black uppercase tracking-[0.18em] text-amber-200"
            : "text-xs font-black uppercase tracking-[0.18em] text-slate-500"
        }
      >
        {title}
      </div>
      <div
        className={
          isVip
            ? "mt-2 text-2xl font-black text-white"
            : "mt-2 text-2xl font-black text-slate-950"
        }
      >
        {value}
      </div>
      <div
        className={
          isVip
            ? "mt-1 text-sm font-semibold text-slate-300"
            : "mt-1 text-sm font-semibold text-slate-500"
        }
      >
        {hint}
      </div>
    </div>
  );
}
 
function MiniStat({
  label,
  value,
  themeMode,
}: {
  label: string;
  value: string;
  themeMode: "vip" | "midnight";
}) {
  const isVip = themeMode === "vip";
 
  return (
    <div
      className={
        isVip
          ? "rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50 p-3 shadow-sm"
          : "rounded-2xl border border-slate-200 bg-white p-3"
      }
    >
      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
    </div>
  );
}
 
function SummaryBox({
  label,
  value,
  accent = false,
  themeMode,
}: {
  label: string;
  value: string;
  accent?: boolean;
  themeMode: "vip" | "midnight";
}) {
  const isVip = themeMode === "vip";
 
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? isVip
            ? "border-amber-300/40 bg-gradient-to-br from-emerald-50 via-white to-amber-50"
            : "border-emerald-200 bg-emerald-50"
          : isVip
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-950">{value}</div>
    </div>
  );
}
 
function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-900">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="solid-input"
      />
    </div>
  );
}
 
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-900">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="solid-input appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
 
/* =========================================================================
   Main Component
   ========================================================================= */
 
export default function ConstructionSalarySheet2026({
  initialData,
  onAiSnapshot,
}: Props) {
  const currentPeriod = getCurrentPayrollPeriod();
 
  const [workers, setWorkers] = useState<PayrollWorker[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [payrollMonth, setPayrollMonth] = useState<string>(currentPeriod.payrollMonth);
  const [payrollYear, setPayrollYear] = useState<number>(currentPeriod.payrollYear);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
 
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
 
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<"new" | "edit">("new");
  const [draft, setDraft] = useState<PayrollWorker>(
    createEmptyWorker(
      { payrollMonth: currentPeriod.payrollMonth, payrollYear: currentPeriod.payrollYear },
      DEFAULT_CURRENCY
    )
  );
 
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [avatarTargetId, setAvatarTargetId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [themeMode, setThemeMode] = useState<"vip" | "midnight">("vip");
 
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const [tableAlign, setTableAlign] = useState<TableAlign>("left");
  const [tableVersion, setTableVersion] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [colorMenuTargetId, setColorMenuTargetId] = useState<string | null>(null);
 
  const colorMenuRef = useRef<HTMLDivElement>(null);
 
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const editorAvatarInputRef = useRef<HTMLInputElement>(null);
  const socialMenuRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const initial = initialData?.length ? initialData : [];
    if (initial.length > 0) {
      setWorkers(initial.map((w) => recalculateWorker({ ...w })));
      setLastRefreshed(new Date().toLocaleTimeString("en-US"));
    }
  }, [initialData]);
 
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);
 
  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (
        socialMenuRef.current &&
        !socialMenuRef.current.contains(e.target as Node)
      ) {
        setSocialMenuOpen(false);
      }
    };
 
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);
 
  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setColorMenuTargetId(null);
      }
    };
 
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);
 
  const loadWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkersFromMongo(payrollMonth, payrollYear);
      setWorkers(data);
      setLastRefreshed(new Date().toLocaleTimeString("en-US"));
    } catch (error) {
      console.error(error);
      setWorkers([]);
      setLastRefreshed(new Date().toLocaleTimeString("en-US"));
    } finally {
      setLoading(false);
    }
  }, [payrollMonth, payrollYear]);
 
  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);
 
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadWorkers();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadWorkers]);
 
  const summary = useMemo(() => {
    const grossPayroll = workers.reduce((sum, w) => sum + w.grossSalary, 0);
    const netPayroll = workers.reduce((sum, w) => sum + w.netAmount, 0);
    const allowancesTotal = workers.reduce((sum, w) => sum + w.totalAllowances, 0);
    const deductionsTotal = workers.reduce((sum, w) => sum + w.totalDeductions, 0);
    const overtimeHoursTotal = workers.reduce((sum, w) => sum + w.overtimeHours, 0);
    const leaveDaysTotal = workers.reduce((sum, w) => sum + w.leaveDays, 0);
    const absenceHoursTotal = workers.reduce((sum, w) => sum + w.absenceHours, 0);
 
    const projectMap = new Map<string, number>();
    const designationMap = new Map<Designation, number>();
 
    for (const w of workers) {
      const projectKey = w.projectCode || "UNASSIGNED";
      projectMap.set(projectKey, (projectMap.get(projectKey) || 0) + w.netAmount);
      designationMap.set(w.designation, (designationMap.get(w.designation) || 0) + 1);
    }
 
    return {
      workerCount: workers.length,
      grossPayroll,
      netPayroll,
      allowancesTotal,
      deductionsTotal,
      overtimeHoursTotal,
      leaveDaysTotal,
      absenceHoursTotal,
      topProjects: [...projectMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([projectCode, totalNet]) => ({ projectCode, totalNet })),
      topDesignations: [...designationMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([designation, count]) => ({ designation, count })),
    };
  }, [workers]);
 
  const aiSnapshot = useMemo<PayrollAiSnapshot>(
    () => ({
      workerCount: summary.workerCount,
      grossPayroll: summary.grossPayroll,
      netPayroll: summary.netPayroll,
      allowancesTotal: summary.allowancesTotal,
      deductionsTotal: summary.deductionsTotal,
      overtimeHoursTotal: summary.overtimeHoursTotal,
      leaveDaysTotal: summary.leaveDaysTotal,
      absenceHoursTotal: summary.absenceHoursTotal,
      topProjects: summary.topProjects,
      topDesignations: summary.topDesignations,
      currency,
    }),
    [summary, currency]
  );
 
  useEffect(() => {
    if (!onAiSnapshot) return;
    const t = setTimeout(() => onAiSnapshot(aiSnapshot), 250);
    return () => clearTimeout(t);
  }, [aiSnapshot, onAiSnapshot]);
 
  const filteredWorkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workers.filter((w) => {
      const matchesQuery =
        !q ||
        [w.employeeId, w.name, w.projectCode, w.siteLocation, w.designation]
          .join(" ")
          .toLowerCase()
          .includes(q);
 
      const matchesStatus = statusFilter === "All" ? true : w.paymentStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [workers, query, statusFilter]);
 
  const refresh = useCallback(async () => {
    await loadWorkers();
  }, [loadWorkers]);
 
  const openNewWorker = useCallback(() => {
    setEditorMode("new");
    setDraft(createEmptyWorker({ payrollMonth, payrollYear }, currency));
    setShowEditor(true);
  }, [payrollMonth, payrollYear, currency]);
 
  const openEditWorker = useCallback((worker: PayrollWorker) => {
    setEditorMode("edit");
    setDraft({ ...worker });
    setShowEditor(true);
  }, []);
 
  const saveDraft = async () => {
    try {
      if (!draft.employeeId.trim() || !draft.name.trim()) {
        alert("Employee ID and Name are required.");
        return;
      }
 
      const normalized = recalculateWorker({
        ...draft,
        employeeId: draft.employeeId.trim(),
        name: draft.name.trim(),
        projectCode: draft.projectCode.trim(),
        siteLocation: draft.siteLocation.trim(),
        currency,
        payrollMonth,
        payrollYear,
      });
 
      if (editorMode === "new") {
        await saveNewWorkerToMongo(normalized);
      } else {
        await updateWorkerToMongo(normalized);
      }
 
      setShowEditor(false);
      await loadWorkers();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to save worker");
    }
  };
 
  const submitBulkPaste = async () => {
    try {
      setBulkError("");
 
      const extracted = extractRecordsFromBulkText(bulkText) as Array<Record<string, unknown>>;
      if (extracted.length === 0) {
        setBulkError("No valid rows detected. Please paste CSV / TSV / pipe / JSON data.");
        return;
      }
 
      const existingIds = new Set(workers.map((w) => w.employeeId.toLowerCase()));
      const parsedWorkers = extracted.map((row, index) =>
        normalizeWorkerLike(row, index, existingIds, {
          payrollMonth,
          payrollYear,
          currency,
        })
      );
 
      await saveBulkWorkersToMongo(parsedWorkers);
 
      setBulkText("");
      setShowBulkPaste(false);
      await loadWorkers();
      alert("Bulk paste saved successfully.");
    } catch (error) {
      console.error(error);
      setBulkError(error instanceof Error ? error.message : "Bulk save failed");
    }
  };
 
  const deleteRow = useCallback(
    async (id: string) => {
      if (!confirm("Delete this worker row?")) return;
      try {
        await deleteWorkersFromMongo([id]);
        await loadWorkers();
      } catch (error) {
        console.error(error);
        alert("Failed to delete worker");
      }
    },
    [loadWorkers]
  );
 
  const clearAll = async () => {
    if (!confirm("This will delete all workers for the selected payroll period. Continue?")) return;
    try {
      await deleteWorkersFromMongo(workers.map((w) => w.id));
      setWorkers([]);
    } catch (error) {
      console.error(error);
      alert("Failed to clear all workers");
    }
  };
 
  const triggerRowAvatarUpload = (id: string) => {
    setAvatarTargetId(id);
    avatarInputRef.current?.click();
  };
 
  const handleRowAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const targetId = avatarTargetId;
    event.target.value = "";
    if (!file || !targetId) return;
 
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
 
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be 2MB or less.");
      return;
    }
 
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== "string") return;
 
      const current = workers.find((w) => w.id === targetId);
      if (!current) return;
 
      const updated = { ...current, photoUrl: dataUrl };
      setWorkers((prev) => prev.map((w) => (w.id === targetId ? updated : w)));
 
      try {
        await updateWorkerToMongo(updated);
        await loadWorkers();
      } catch (error) {
        console.error(error);
        alert("Failed to save avatar");
      }
    };
 
    reader.readAsDataURL(file);
  };
 
  const handleEditorAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
 
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
 
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be 2MB or less.");
      return;
    }
 
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== "string") return;
      setDraft((prev) => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };
 
  const handleRestoreJSON = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
 
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
 
      const rows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.records)
        ? parsed.records
        : parsed?.record
        ? [parsed.record]
        : [];
 
      if (!Array.isArray(rows) || rows.length === 0) {
        alert("Invalid backup format.");
        return;
      }
 
      const existingIds = new Set<string>();
      const normalized = rows.map((row, index) =>
        normalizeWorkerLike(row, index, existingIds, {
          payrollMonth,
          payrollYear,
          currency,
        })
      );
 
      await saveBulkWorkersToMongo(normalized);
      await loadWorkers();
      alert("Backup restored successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to restore backup file.");
    }
  };
 
  const exportCSV = () => {
    const header = [
      "Employee ID,Name,Designation,Project Code,Site Location,Base Rate,Hours Worked,Overtime Hours,OT Multiplier,Housing Allowance,Transport Allowance,Risk Allowance,GOSI Deduction,Tax Deduction,Advance Deduction,Leave Days,Absence Hours,Gross Salary,Total Allowances,Total Deductions,Net Amount,Payment Status,Currency,Payroll Month,Payroll Year",
    ];
    const rows = filteredWorkers.map(
      (w) =>
        [
          `"${w.employeeId}"`,
          `"${w.name}"`,
          `"${w.designation}"`,
          `"${w.projectCode}"`,
          `"${w.siteLocation}"`,
          w.baseRate,
          w.hoursWorked,
          w.overtimeHours,
          w.overtimeMultiplier,
          w.housingAllowance,
          w.transportAllowance,
          w.riskAllowance,
          w.gosiDeduction,
          w.taxDeduction,
          w.advanceDeduction,
          w.leaveDays,
          w.absenceHours,
          w.grossSalary,
          w.totalAllowances,
          w.totalDeductions,
          w.netAmount,
          `"${w.paymentStatus}"`,
          `"${w.currency}"`,
          `"${w.payrollMonth}"`,
          w.payrollYear,
        ].join(",")
    );
 
    const csv = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `awm_salary_sheet_${payrollYear}_${payrollMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const backupJSON = () => {
    const blob = new Blob([JSON.stringify(workers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `awm_salary_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
 
  useEffect(() => {
    if (!showEditor) return;
    if (editorMode === "new") {
      setDraft(createEmptyWorker({ payrollMonth, payrollYear }, currency));
    }
  }, [showEditor, editorMode, payrollMonth, payrollYear, currency]);
 
  const cycleTableAlign = useCallback(() => {
    setTableAlign((prev) => (prev === "left" ? "center" : prev === "center" ? "right" : "left"));
  }, []);
 
  const resetColumnWidths = useCallback(() => {
    setTableVersion((v) => v + 1);
  }, []);
 
  const zoomInTable = useCallback(() => {
    setFontScale((prev) => Math.min(FONT_SCALE_MAX, parseFloat((prev + FONT_SCALE_STEP).toFixed(2))));
  }, []);
 
  const zoomOutTable = useCallback(() => {
    setFontScale((prev) => Math.max(FONT_SCALE_MIN, parseFloat((prev - FONT_SCALE_STEP).toFixed(2))));
  }, []);
 
  const resetZoom = useCallback(() => {
    setFontScale(1);
  }, []);
 
  const setWorkerRowColor = useCallback(
    async (id: string, color: string | null) => {
      const current = workers.find((w) => w.id === id);
      if (!current) return;
 
      const updated = { ...current, rowColor: color };
      setWorkers((prev) => prev.map((w) => (w.id === id ? updated : w)));
      setColorMenuTargetId(null);
 
      try {
        await updateWorkerToMongo(updated);
      } catch (error) {
        console.error(error);
        alert("Failed to save row color");
      }
    },
    [workers]
  );
 
  const handlePrint = useCallback(() => {
    window.print();
  }, []);
 
  const handlePrintPdf = useCallback(() => {
    window.print();
  }, []);
 
  const tableAlignIcon =
    tableAlign === "left" ? (
      <AlignLeft size={15} />
    ) : tableAlign === "center" ? (
      <AlignCenter size={15} />
    ) : (
      <AlignRight size={15} />
    );
 
  const tableAlignLabel =
    tableAlign === "left" ? "Left" : tableAlign === "center" ? "Center" : "Right";
 
  const salaryColumns = useMemo<ResizableColumn<PayrollWorker>[]>(() => {
    return [
      {
        key: "index",
        label: "#",
        width: 70,
        align: tableAlign,
        render: (w, index) => rowTint(w, index + 1),
      },
      {
        key: "rowColor",
        label: "Mark",
        width: 70,
        align: "center",
        render: (w) =>
          rowTint(
            w,
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => setColorMenuTargetId((prev) => (prev === w.id ? null : w.id))}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white hover:border-slate-500"
                style={w.rowColor ? { backgroundColor: w.rowColor, borderColor: w.rowColor } : undefined}
                title="Mark row color"
              >
                {!w.rowColor && <Palette size={14} className="text-slate-500" />}
              </button>
 
              {colorMenuTargetId === w.id && (
                <div
                  ref={colorMenuRef}
                  className="absolute left-1/2 top-10 z-30 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {ROW_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setWorkerRowColor(w.id, opt.value)}
                        title={opt.label}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300"
                        style={{ backgroundColor: opt.value || "#ffffff" }}
                      >
                        {opt.value === null && <X size={12} className="text-slate-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
      },
      {
        key: "worker",
        label: "Worker",
        width: 110,
        align: tableAlign,
        render: (w) =>
          rowTint(
            w,
            <button
              type="button"
              onClick={() => triggerRowAvatarUpload(w.id)}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-100 font-black text-slate-700 hover:border-slate-500"
              title="Click to change photo"
            >
              {w.photoUrl ? (
                <img
                  src={w.photoUrl}
                  alt={w.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(w.name)
              )}
            </button>
          ),
      },
      {
        key: "employeeId",
        label: "Employee ID",
        width: 160,
        align: tableAlign,
        render: (w) => rowTint(w, <span className="font-mono text-slate-700">{w.employeeId}</span>),
      },
      {
        key: "name",
        label: "Name",
        width: 180,
        align: tableAlign,
        render: (w) => rowTint(w, w.name),
      },
      {
        key: "designation",
        label: "Designation",
        width: 160,
        align: tableAlign,
        render: (w) => rowTint(w, DESIGNATION_LABELS[w.designation]),
      },
      {
        key: "projectCode",
        label: "Project Code",
        width: 160,
        align: tableAlign,
        render: (w) => rowTint(w, w.projectCode || "-"),
      },
      {
        key: "siteLocation",
        label: "Site Location",
        width: 220,
        align: tableAlign,
        render: (w) => rowTint(w, w.siteLocation || "-"),
      },
      {
        key: "currency",
        label: "Currency",
        width: 110,
        align: tableAlign,
        render: (w) => rowTint(w, w.currency),
      },
      {
        key: "payrollMonth",
        label: "Payroll Month",
        width: 150,
        align: tableAlign,
        render: (w) => rowTint(w, w.payrollMonth),
      },
      {
        key: "payrollYear",
        label: "Payroll Year",
        width: 130,
        align: tableAlign,
        render: (w) => rowTint(w, String(w.payrollYear)),
      },
      {
        key: "baseRate",
        label: "Base Rate",
        width: 130,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.baseRate, w.currency || currency)),
      },
      {
        key: "hoursWorked",
        label: "Hours",
        width: 100,
        align: tableAlign,
        render: (w) => rowTint(w, w.hoursWorked.toFixed(1)),
      },
      {
        key: "overtimeHours",
        label: "OT Hrs",
        width: 100,
        align: tableAlign,
        render: (w) => rowTint(w, w.overtimeHours.toFixed(1)),
      },
      {
        key: "overtimeMultiplier",
        label: "OT Mult.",
        width: 110,
        align: tableAlign,
        render: (w) => rowTint(w, w.overtimeMultiplier.toFixed(2)),
      },
      {
        key: "housingAllowance",
        label: "Housing",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.housingAllowance, w.currency || currency)),
      },
      {
        key: "transportAllowance",
        label: "Transport",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.transportAllowance, w.currency || currency)),
      },
      {
        key: "riskAllowance",
        label: "Risk",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.riskAllowance, w.currency || currency)),
      },
      {
        key: "gosiDeduction",
        label: "GOSI",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.gosiDeduction, w.currency || currency)),
      },
      {
        key: "taxDeduction",
        label: "Tax",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.taxDeduction, w.currency || currency)),
      },
      {
        key: "advanceDeduction",
        label: "Advance",
        width: 120,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.advanceDeduction, w.currency || currency)),
      },
      {
        key: "leaveDays",
        label: "Leave",
        width: 90,
        align: tableAlign,
        render: (w) => rowTint(w, w.leaveDays.toFixed(0)),
      },
      {
        key: "absenceHours",
        label: "Absence",
        width: 100,
        align: tableAlign,
        render: (w) => rowTint(w, w.absenceHours.toFixed(1)),
      },
      {
        key: "grossSalary",
        label: "Gross",
        width: 140,
        align: tableAlign,
        render: (w) => rowTint(w, formatMoney(w.grossSalary, w.currency || currency)),
      },
      {
        key: "netAmount",
        label: "Net",
        width: 140,
        align: tableAlign,
        render: (w) =>
          rowTint(
            w,
            <span className="font-black text-emerald-700">
              {formatMoney(w.netAmount, w.currency || currency)}
            </span>
          ),
      },
      {
        key: "paymentStatus",
        label: "Status",
        width: 120,
        align: tableAlign,
        render: (w) => {
          const badgeClass =
            w.paymentStatus === "Paid"
              ? "bg-emerald-100 text-emerald-700"
              : w.paymentStatus === "Pending"
              ? "bg-amber-100 text-amber-700"
              : w.paymentStatus === "Processing"
              ? "bg-sky-100 text-sky-700"
              : w.paymentStatus === "Approved"
              ? "bg-violet-100 text-violet-700"
              : "bg-slate-100 text-slate-700";
 
          return rowTint(
            w,
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${badgeClass}`}>
              {STATUS_LABELS[w.paymentStatus]}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        width: 130,
        align: tableAlign,
        render: (w) =>
          rowTint(
            w,
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => openEditWorker(w)}
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                title="Edit worker"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => deleteRow(w.id)}
                className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                title="Delete worker"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ),
      },
    ];
  }, [currency, deleteRow, openEditWorker, tableAlign, colorMenuTargetId, setWorkerRowColor]);
 
  const headerClass =
    themeMode === "vip"
      ? "overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl ring-1 ring-white/10"
      : "overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl ring-1 ring-white/10";
 
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <style>{`
        :root {
          --navy: #0f172a;
          --navy2: #111c34;
          --navy3: #1e293b;
          --border: #e5e7eb;
          --muted: #64748b;
          --surface: #ffffff;
        }
 
        .solid-input {
          width: 100%;
          border: 1px solid var(--border);
          background: white;
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
        }
 
        .solid-input:focus {
          border-color: #334155;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
        }
 
        .solid-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 800;
        }
 
        .no-print {
          display: block;
        }
 
        .print-only {
          display: none;
        }
 
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
 
          html,
          body {
            background: #fff !important;
            color: #000 !important;
          }
 
          .no-print {
            display: none !important;
          }
 
          .print-only {
            display: block !important;
          }
 
          #print-area {
            display: block !important;
          }
 
          #print-area .overflow-x-auto {
            overflow: visible !important;
          }
 
          #print-area table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
 
          #print-area th,
          #print-area td {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
            font-size: 10px !important;
          }
 
          #print-area thead th {
            background: #0f172a !important;
            color: #fff !important;
          }
 
          .shadow-2xl,
          .shadow-sm {
            box-shadow: none !important;
          }
 
          .rounded-3xl,
          .rounded-2xl,
          .rounded-xl {
            border-radius: 0 !important;
          }
        }
      `}</style>
 
      <div className="mx-auto max-w-[1900px] p-4 md:p-8">
        {/* Header */}
        <header className={headerClass}>
          <div className="relative p-0">
            {/* Social & Communication dropdown */}
            <div ref={socialMenuRef} className="no-print absolute left-4 top-4 z-20">
              <button
                type="button"
                onClick={() => setSocialMenuOpen((v) => !v)}
                className="solid-badge whitespace-nowrap border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur hover:bg-white/15"
              >
                <Menu size={15} />
                Social & Communication
                <ChevronDown size={14} />
              </button>
 
              {socialMenuOpen && (
                <div className="mt-2 w-[280px] rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
                  {SOCIAL_MENU_ITEMS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : "_self"}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                      onClick={() => setSocialMenuOpen(false)}
                    >
                      <span className="text-sky-300">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
 
            <div className="grid gap-4 px-4 py-5 xl:grid-cols-[1fr_auto_1fr] xl:items-start xl:px-6">
              <div className="hidden xl:block" />
 
              <div className="text-center">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl xl:text-5xl">
                  Construction Salary
                </h1>
                <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-300 md:text-base">
                  Smart payroll management for construction teams, filters, bulk operations, and finance-ready reporting.
                </p>
              </div>
 
              <div className="justify-self-end rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                      Last Synced
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold text-white">
                      {lastRefreshed || "--:--:--"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <Building2 size={18} />
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-200">{COMPANY_NAME}</div>
                <div className="text-xs font-medium text-slate-400">{dateLabel}</div>
              </div>
            </div>
          </div>
        </header>
 
        {/* KPI + AI Bridge */}
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            themeMode={themeMode}
            title="Workers"
            value={summary.workerCount.toString()}
            hint="Active payroll rows"
          />
          <KpiCard
            themeMode={themeMode}
            title="Gross Payroll"
            value={formatMoney(summary.grossPayroll, currency)}
            hint="Before deductions"
          />
          <KpiCard
            themeMode={themeMode}
            title="Net Payroll"
            value={formatMoney(summary.netPayroll, currency)}
            hint="After deductions"
          />
          <KpiCard
            themeMode={themeMode}
            title="OT Hours"
            value={summary.overtimeHoursTotal.toFixed(1)}
            hint="Live overtime exposure"
          />
        </section>
 
        <section className="mt-4 grid gap-4 xl:grid-cols-3">
          <div
            className={
              themeMode === "vip"
                ? "rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50 p-5 shadow-sm"
                : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            }
          >
            <div className="text-sm font-black text-slate-950">Allowances / Deductions Snapshot</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
              <MiniStat themeMode={themeMode} label="Allowances" value={formatMoney(summary.allowancesTotal, currency)} />
              <MiniStat themeMode={themeMode} label="Deductions" value={formatMoney(summary.deductionsTotal, currency)} />
              <MiniStat themeMode={themeMode} label="Leave Days" value={summary.leaveDaysTotal.toFixed(0)} />
              <MiniStat themeMode={themeMode} label="Absence Hours" value={summary.absenceHoursTotal.toFixed(0)} />
            </div>
          </div>
 
          <div
            className={
              themeMode === "vip"
                ? "rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-amber-50 p-5 shadow-sm xl:col-span-2"
                : "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"
            }
          >
            <div className="text-sm font-black text-slate-950">AI Controls Center Bridge</div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              This module exposes a clean analytics snapshot for forecasting next-month labor expense, OT risk,
              budget drift, and project-wise payroll concentration.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Top Projects</div>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-900">
                  {summary.topProjects.map((p) => (
                    <div key={p.projectCode} className="flex items-center justify-between gap-4">
                      <span>{p.projectCode}</span>
                      <span>{formatMoney(p.totalNet, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Top Designations</div>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-900">
                  {summary.topDesignations.map((d) => (
                    <div key={d.designation} className="flex items-center justify-between gap-4">
                      <span>{DESIGNATION_LABELS[d.designation]}</span>
                      <span>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
 
        {/* Print area */}
        <section id="print-area" className="mt-6">
          <div className="print-only mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-slate-950">Construction Salary</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Payroll Period: {payrollMonth} {payrollYear} • Currency:{" "}
                  {CURRENCY_OPTIONS.find((c) => c.code === currency)?.label || currency}
                </div>
              </div>
              <div className="text-right text-sm font-semibold text-slate-600">
                <div>Alignment: {tableAlignLabel}</div>
                <div>Workers: {filteredWorkers.length}</div>
                <div>Status: {statusFilter}</div>
              </div>
            </div>
          </div>
 
          <div className="no-print mb-3 space-y-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
            {/* Row 1: primary actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowBulkPaste(true)}
                className="solid-badge whitespace-nowrap bg-emerald-500 px-3 py-2 text-white shadow-md shadow-emerald-500/20"
              >
                <Plus size={13} />
                Bulk Paste
              </button>
 
              <button
                type="button"
                onClick={openNewWorker}
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950 shadow-sm"
              >
                <Edit3 size={13} />
                Add Worker
              </button>
 
              <button
                type="button"
                onClick={refresh}
                className="solid-badge whitespace-nowrap bg-slate-700 px-3 py-2 text-white"
              >
                <RefreshCw size={13} className={autoRefresh ? "animate-spin" : ""} />
                Refresh
              </button>
 
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: autoRefresh ? "#16a34a" : "#94a3b8" }}
                />
                Auto Refresh
              </button>
 
              <span className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />
 
              <button
                type="button"
                onClick={exportCSV}
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950"
              >
                <FileSpreadsheet size={13} />
                CSV Export
              </button>
 
              <button
                type="button"
                onClick={backupJSON}
                className="solid-badge whitespace-nowrap bg-slate-200 px-3 py-2 text-slate-950"
              >
                <Download size={13} />
                JSON Backup
              </button>
 
              <button
                type="button"
                onClick={() => restoreInputRef.current?.click()}
                className="solid-badge whitespace-nowrap bg-slate-900 px-3 py-2 text-white"
              >
                <Upload size={13} />
                JSON Restore
              </button>
 
              <span className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />
 
              <button
                type="button"
                onClick={clearAll}
                className="solid-badge whitespace-nowrap bg-red-600 px-3 py-2 text-white"
              >
                <Trash2 size={13} />
                Clear All
              </button>
 
              <button
                type="button"
                onClick={() => setThemeMode((prev) => (prev === "vip" ? "midnight" : "vip"))}
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950 shadow-sm"
              >
                {themeMode === "vip" ? <Moon size={13} /> : <Sun size={13} />}
                Theme
              </button>
 
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreJSON}
              />
               <a
                href="/admin"
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950 shadow-sm"
              >
                Admin Dashboard
              </a>
            </div>
 
            {/* Row 2: table utilities - alignment, font size, print, columns */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={resetColumnWidths}
                className="solid-badge whitespace-nowrap bg-slate-950 px-3 py-2 text-white"
              >
                <RefreshCw size={13} />
                Reset Columns
              </button>
 
              <button
                type="button"
                onClick={cycleTableAlign}
                className="solid-badge whitespace-nowrap bg-slate-950 px-3 py-2 text-white shadow-sm"
                title="Toggle table text alignment"
              >
                {tableAlignIcon}
                {tableAlignLabel}
              </button>
 
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
                <button
                  type="button"
                  onClick={zoomOutTable}
                  disabled={fontScale <= FONT_SCALE_MIN}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm disabled:opacity-40"
                  title="Decrease font size"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-2 text-xs font-black text-slate-600"
                  title="Reset zoom"
                >
                  {Math.round(fontScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={zoomInTable}
                  disabled={fontScale >= FONT_SCALE_MAX}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm disabled:opacity-40"
                  title="Increase font size"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
 
              <button
                type="button"
                onClick={handlePrint}
                className="solid-badge whitespace-nowrap border border-slate-200 bg-white px-3 py-2 text-slate-950 shadow-sm"
              >
                <Printer size={13} />
                Print
              </button>
 
              <button
                type="button"
                onClick={handlePrintPdf}
                className="solid-badge whitespace-nowrap bg-slate-700 px-3 py-2 text-white"
              >
                <FileDown size={13} />
                Print &amp; PDF
              </button>
            </div>
 
            {/* Row 3: filters */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="solid-input h-9 min-w-[110px] px-2 text-xs"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
 
              <select
                value={String(payrollYear)}
                onChange={(e) => setPayrollYear(Number(e.target.value))}
                className="solid-input h-9 min-w-[90px] px-2 text-xs"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
 
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="solid-input h-9 min-w-[170px] px-2 text-xs"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
 
              <div className="relative min-w-[220px] flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={14}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="solid-input h-9 pl-9 text-xs"
                  placeholder="Search worker, project, site..."
                />
              </div>
 
              <div className="relative min-w-[160px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "All")}
                  className="solid-input h-9 appearance-none pr-8 text-xs"
                >
                  <option value="All">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                  size={14}
                />
              </div>
            </div>
          </div>
 
          <section
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            style={{ fontSize: `${fontScale}em` }}
          >
            <div className="overflow-x-auto">
              <ResizableTable
                key={tableVersion}
                columns={salaryColumns}
                data={filteredWorkers}
                getRowKey={(row) => row.id}
                showHeaderControls={false}
                className="rounded-3xl"
                tableClassName="awm-resizable-table awm-sticky-head awm-table-vip awm-table-zebra"
              />
            </div>
          </section>
        </section>
 
        <div className="no-print mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <UserRound size={13} />
          Designed for high-volume construction payroll with bulk ingestion, currency localization, and AI-ready analytics.
        </div>
 
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleRowAvatarChange}
        />
      </div>
 
      {/* Bulk Paste Modal */}
      {showBulkPaste && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-lg font-black text-slate-950">Bulk Paste Import</div>
                <div className="text-sm font-semibold text-slate-500">
                  Paste CSV / TSV / pipe / JSON / key-value rows. Missing fields won&apos;t drop rows.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBulkPaste(false);
                  setBulkText("");
                  setBulkError("");
                }}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>
 
            <div className="grid gap-4 p-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-900">
                  Paste Raw Attendance / Payroll Lines
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="min-h-[420px] w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm font-semibold text-slate-900 outline-none focus:border-slate-500"
                  placeholder={`EMP-101 | Ali Khan | Mason | PRJ-01 | Site A | SAR | 250 | 176 | 24 | 1.5 | 500 | 250 | 100 | 120 | 0 | 200 | 2 | 0 | Paid
EMP-102,Rahim,Laborer,PRJ-02,Site B,BDT,180,160,8,1.5,300,180,50,80,0,100,1,2,Pending
 
{
  "employeeId": "EMP-103",
  "name": "Karim",
  "designation": "Foreman",
  "projectCode": "PRJ-03",
  "siteLocation": "Site C",
  "baseRate": 220,
  "hoursWorked": 170,
  "overtimeHours": 12,
  "paymentStatus": "Processing"
}`}
                />
                {bulkError && <div className="mt-3 text-sm font-bold text-red-600">{bulkError}</div>}
              </div>
 
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-black text-slate-950">Column Order</div>
                  <div className="mt-3 space-y-2 text-xs font-semibold text-slate-600">
                    <div>1. Employee ID</div>
                    <div>2. Name</div>
                    <div>3. Designation</div>
                    <div>4. Project Code</div>
                    <div>5. Site Location</div>
                    <div>6. Currency</div>
                    <div>7. Base Rate</div>
                    <div>8. Hours Worked</div>
                    <div>9. OT Hours</div>
                    <div>10. OT Multiplier</div>
                    <div>11. Housing Allowance</div>
                    <div>12. Transport Allowance</div>
                    <div>13. Risk Allowance</div>
                    <div>14. GOSI Deduction</div>
                    <div>15. Tax Deduction</div>
                    <div>16. Advance Deduction</div>
                    <div>17. Leave Days</div>
                    <div>18. Absence Hours</div>
                    <div>19. Status</div>
                  </div>
                </div>
 
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-black text-amber-900">Important</div>
                  <p className="mt-2 text-sm font-semibold text-amber-900/80">
                    Incomplete rows are still preserved. Missing numeric fields become 0, missing IDs are auto-generated,
                    and valid rows are saved to MongoDB.
                  </p>
                </div>
 
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={submitBulkPaste}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700"
                  >
                    Save Bulk Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkPaste(false);
                      setBulkText("");
                      setBulkError("");
                    }}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Editor Drawer */}
      {showEditor && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/70">
          <div className="absolute right-0 top-0 h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <div className="text-lg font-black text-slate-950">
                  {editorMode === "new" ? "Add Worker" : "Edit Worker"}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  Construction payroll details, allowances, deductions, attendance, and status.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>
 
            <div className="p-6">
              <div className="mb-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => editorAvatarInputRef.current?.click()}
                  className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-100 font-black text-slate-700 hover:border-slate-500"
                >
                  {draft.photoUrl ? (
                    <img
                      src={draft.photoUrl}
                      alt="profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera size={22} />
                      <span className="text-xs">Photo</span>
                    </div>
                  )}
                </button>
                <input
                  ref={editorAvatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditorAvatarChange}
                />
              </div>
 
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Employee ID"
                  value={draft.employeeId}
                  onChange={(v) => setDraft((p) => ({ ...p, employeeId: v }))}
                />
                <Field
                  label="Name"
                  value={draft.name}
                  onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                />
                <SelectField
                  label="Designation"
                  value={draft.designation}
                  onChange={(v) => setDraft((p) => ({ ...p, designation: v as Designation }))}
                  options={DESIGNATION_OPTIONS.map((d) => ({ label: DESIGNATION_LABELS[d], value: d }))}
                />
                <Field
                  label="Project Code"
                  value={draft.projectCode}
                  onChange={(v) => setDraft((p) => ({ ...p, projectCode: v }))}
                />
                <Field
                  label="Site Location"
                  value={draft.siteLocation}
                  onChange={(v) => setDraft((p) => ({ ...p, siteLocation: v }))}
                />
                <SelectField
                  label="Payment Status"
                  value={draft.paymentStatus}
                  onChange={(v) => setDraft((p) => ({ ...p, paymentStatus: v as PaymentStatus }))}
                  options={STATUS_OPTIONS.map((s) => ({ label: STATUS_LABELS[s], value: s }))}
                />
 
                <Field
                  label="Base Rate"
                  value={String(draft.baseRate)}
                  onChange={(v) => setDraft((p) => ({ ...p, baseRate: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Hours Worked"
                  value={String(draft.hoursWorked)}
                  onChange={(v) => setDraft((p) => ({ ...p, hoursWorked: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Overtime Hours"
                  value={String(draft.overtimeHours)}
                  onChange={(v) => setDraft((p) => ({ ...p, overtimeHours: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="OT Multiplier"
                  value={String(draft.overtimeMultiplier)}
                  onChange={(v) => setDraft((p) => ({ ...p, overtimeMultiplier: safeNumber(v) }))}
                  type="number"
                  step="0.01"
                />
 
                <Field
                  label="Housing Allowance"
                  value={String(draft.housingAllowance)}
                  onChange={(v) => setDraft((p) => ({ ...p, housingAllowance: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Transport Allowance"
                  value={String(draft.transportAllowance)}
                  onChange={(v) => setDraft((p) => ({ ...p, transportAllowance: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Risk Allowance"
                  value={String(draft.riskAllowance)}
                  onChange={(v) => setDraft((p) => ({ ...p, riskAllowance: safeNumber(v) }))}
                  type="number"
                />
 
                <Field
                  label="GOSI Deduction"
                  value={String(draft.gosiDeduction)}
                  onChange={(v) => setDraft((p) => ({ ...p, gosiDeduction: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Tax Deduction"
                  value={String(draft.taxDeduction)}
                  onChange={(v) => setDraft((p) => ({ ...p, taxDeduction: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Advance Deduction"
                  value={String(draft.advanceDeduction)}
                  onChange={(v) => setDraft((p) => ({ ...p, advanceDeduction: safeNumber(v) }))}
                  type="number"
                />
 
                <Field
                  label="Leave Days"
                  value={String(draft.leaveDays)}
                  onChange={(v) => setDraft((p) => ({ ...p, leaveDays: safeNumber(v) }))}
                  type="number"
                />
                <Field
                  label="Absence Hours"
                  value={String(draft.absenceHours)}
                  onChange={(v) => setDraft((p) => ({ ...p, absenceHours: safeNumber(v) }))}
                  type="number"
                />
              </div>
 
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <SummaryBox
                  themeMode={themeMode}
                  label="Gross"
                  value={formatMoney(recalculateWorker(draft).grossSalary, draft.currency || currency)}
                />
                <SummaryBox
                  themeMode={themeMode}
                  label="Deductions"
                  value={formatMoney(recalculateWorker(draft).totalDeductions, draft.currency || currency)}
                />
                <SummaryBox
                  themeMode={themeMode}
                  label="Net"
                  value={formatMoney(recalculateWorker(draft).netAmount, draft.currency || currency)}
                  accent
                />
              </div>
 
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                >
                  <Check size={16} />
                  Save Worker
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}