import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/mongodb";
 
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
 
const DATABASE_NAME = "AWM-ERP";
const COLLECTION_NAME = "salary_sheets";
 
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
 
type PaymentStatus = "Paid" | "Pending" | "Processing" | "Approved" | "Draft";
 
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
 
interface SalaryRecord {
  id: string;
  employeeId: string;
  name: string;
  // Composite duplicate-prevention key = companyName + employeeId + payrollMonth + payrollYear.
  // Added because the original schema had no company field — duplicate
  // checks were keyed on projectCode instead, which doesn't match the
  // "same company + worker + month + year" rule.
  companyName: string;
  designation: Designation;
  projectCode: string;
  siteLocation: string;
  currency: CurrencyCode;
  payrollMonth: string;
  payrollYear: number;
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
  leaveDays: number;
  absenceHours: number;
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  photoUrl: string | null;
  source?: "manual" | "bulk-paste" | "import" | "api";
  createdAt: Date;
  updatedAt: Date;
}
 
type SalaryRecordDocument = SalaryRecord & { _id?: unknown };
type RawRecord = Record<string, unknown>;
 
const ALLOWED_CURRENCIES: CurrencyCode[] = [
  "SAR",
  "BDT",
  "USD",
  "EUR",
  "GBP",
  "PKR",
  "INR",
  "AED",
  "QAR",
  "OMR",
];
 
const DEFAULT_CURRENCY: CurrencyCode = "SAR";
const DEFAULT_STATUS: PaymentStatus = "Pending";
const DEFAULT_OT_MULTIPLIER = 1.5;
const DEFAULT_COMPANY_NAME = "Unnamed Company";
 
function jsonError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status }
  );
}
 
function isPlainObject(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
 
function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
 
function round2(value: number) {
  return Math.round(value * 100) / 100;
}
 
function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
 
function toInt(value: unknown): number {
  return Math.trunc(toNumber(value));
}
 
function toPositiveInt(value: unknown, fallback: number) {
  const n = Math.floor(toNumber(value));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
 
function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}
 
function toCurrency(value: unknown): CurrencyCode {
  const v = toText(value, DEFAULT_CURRENCY).toUpperCase() as CurrencyCode;
  return ALLOWED_CURRENCIES.includes(v) ? v : DEFAULT_CURRENCY;
}
 
function toStatus(value: unknown): PaymentStatus {
  const v = toText(value, DEFAULT_STATUS).toLowerCase();
  if (v === "paid") return "Paid";
  if (v === "processing") return "Processing";
  if (v === "approved") return "Approved";
  if (v === "draft") return "Draft";
  return "Pending";
}
 
function toDesignation(value: unknown): Designation {
  const v = toText(value, "Helper").toLowerCase();
  if (v.includes("engineer")) return "Engineer";
  if (v.includes("foreman")) return "Foreman";
  if (v.includes("mason")) return "Mason";
  if (v.includes("laborer") || v.includes("labourer") || v.includes("worker")) return "Laborer";
  if (v.includes("supervisor")) return "Supervisor";
  if (v.includes("electric")) return "Electrician";
  if (v.includes("carpenter")) return "Carpenter";
  if (v.includes("plumb")) return "Plumber";
  if (v.includes("manager")) return "Manager";
  if (v.includes("skilled")) return "Skilled Labor";
  if (v.includes("general")) return "General Labor";
  if (v.includes("scaffolder")) return "Scaffolder";
  if (v.includes("steelfixer") || v.includes("steel fixer")) return "SteelFixer";
  return "Helper";
}
 
function currentMonthName() {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());
}
 
function currentYearNumber() {
  return new Date().getFullYear();
}
 
function calculateGross(baseRate: number, hoursWorked: number, overtimeHours: number, overtimeMultiplier: number) {
  return round2(baseRate * hoursWorked + baseRate * overtimeHours * overtimeMultiplier);
}
 
function buildLookupObject(obj: RawRecord) {
  const map = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) {
    map.set(normalizeKey(k), v);
  }
  return map;
}
 
function readLookup(lookup: Map<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const v = lookup.get(normalizeKey(key));
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}
 
function hasPayrollLikeFields(value: unknown) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value).map(normalizeKey);
  const markers = [
    "employeeid",
    "name",
    "companyname",
    "designation",
    "projectcode",
    "sitelocation",
    "baserate",
    "hoursworked",
    "overtimehours",
    "paymentstatus",
    "payrollmonth",
    "payrollyear",
  ];
  return markers.some((m) => keys.includes(m));
}
 
// Composite duplicate key: company_name + worker_id (employeeId) + month + year.
// This intentionally does NOT include projectCode — the same worker under
// the same company in the same payroll period is a duplicate regardless of
// which project they're tagged against.
function buildUniqueKey(record: Pick<SalaryRecord, "companyName" | "employeeId" | "payrollMonth" | "payrollYear">) {
  return [
    record.companyName.trim().toLowerCase(),
    record.employeeId.trim().toLowerCase(),
    record.payrollMonth.trim().toLowerCase(),
    String(record.payrollYear),
  ].join("::");
}
 
function calculateRecord(
  record: Omit<
    SalaryRecord,
    "grossSalary" | "totalAllowances" | "totalDeductions" | "netAmount" | "createdAt" | "updatedAt"
  >
): SalaryRecord {
  const baseRate = Math.max(0, toNumber(record.baseRate));
  const hoursWorked = Math.max(0, toNumber(record.hoursWorked));
  const overtimeHours = Math.max(0, toNumber(record.overtimeHours));
  const overtimeMultiplier = Math.max(1, toNumber(record.overtimeMultiplier) || DEFAULT_OT_MULTIPLIER);
 
  const housingAllowance = Math.max(0, toNumber(record.housingAllowance));
  const transportAllowance = Math.max(0, toNumber(record.transportAllowance));
  const riskAllowance = Math.max(0, toNumber(record.riskAllowance));
 
  const gosiDeduction = Math.max(0, toNumber(record.gosiDeduction));
  const taxDeduction = Math.max(0, toNumber(record.taxDeduction));
  const advanceDeduction = Math.max(0, toNumber(record.advanceDeduction));
  const leaveDays = Math.max(0, toInt(record.leaveDays));
  const absenceHours = Math.max(0, toNumber(record.absenceHours));
 
  const totalAllowances = round2(housingAllowance + transportAllowance + riskAllowance);
  const grossSalary = calculateGross(baseRate, hoursWorked, overtimeHours, overtimeMultiplier);
  const absenceDeduction = round2(baseRate * absenceHours);
  const totalDeductions = round2(gosiDeduction + taxDeduction + advanceDeduction + absenceDeduction);
  const netAmount = round2(Math.max(0, grossSalary + totalAllowances - totalDeductions));
 
  return {
    ...record,
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
    leaveDays,
    absenceHours,
    grossSalary,
    totalAllowances,
    totalDeductions,
    netAmount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
 
function normalizeInputRecord(input: unknown, fallbackMeta?: RawRecord): SalaryRecord {
  const source = isPlainObject(input) ? input : {};
  const meta = isPlainObject(fallbackMeta) ? fallbackMeta : {};
 
  const mergedLookup = new Map<string, unknown>();
  for (const [k, v] of Object.entries(meta)) mergedLookup.set(normalizeKey(k), v);
  for (const [k, v] of Object.entries(source)) mergedLookup.set(normalizeKey(k), v);
 
  const read = (keys: string[]) => readLookup(mergedLookup, keys);
 
  const payrollMonth = toText(
    read(["payrollMonth", "Payroll Month"]) ?? meta.payrollMonth ?? meta["Payroll Month"] ?? currentMonthName(),
    currentMonthName()
  );
 
  const payrollYear = toPositiveInt(
    read(["payrollYear", "Payroll Year"]) ?? meta.payrollYear ?? meta["Payroll Year"],
    currentYearNumber()
  );
 
  const photoValue = read(["photoUrl", "Photo URL"]);
  const sourceValue = toText(read(["source"]) ?? meta.source ?? "api", "api");
 
  // Company name falls back to a stable label (mirrors the frontend's
  // "Unnamed Company" behavior) so blank-name submissions still get a
  // consistent, non-empty key instead of colliding under "".
  const companyName =
    toText(read(["companyName", "Company Name", "company"]) ?? meta.companyName ?? meta["Company Name"] ?? "") ||
    DEFAULT_COMPANY_NAME;
 
  const raw: Omit<
    SalaryRecord,
    "grossSalary" | "totalAllowances" | "totalDeductions" | "netAmount" | "createdAt" | "updatedAt"
  > = {
    id: toText(read(["id"]) ?? randomUUID(), randomUUID()),
    employeeId: toText(read(["employeeId", "Employee ID", "empId", "workerId"]) ?? ""),
    name: toText(read(["name", "Employee Name"]) ?? ""),
    companyName,
    designation: toDesignation(read(["designation", "Designation"]) ?? "Helper"),
    projectCode: toText(read(["projectCode", "Project Code", "department", "Department"]) ?? "UNASSIGNED"),
    siteLocation: toText(read(["siteLocation", "Site Location", "workSiteLocation", "Work Site Location"]) ?? ""),
    currency: toCurrency(read(["currency", "Currency"]) ?? meta.currency ?? DEFAULT_CURRENCY),
    payrollMonth,
    payrollYear,
    baseRate: toNumber(read(["baseRate", "Base Rate", "Basic Salary"])),
    hoursWorked: toNumber(read(["hoursWorked", "Hours Worked", "Working Days"])),
    overtimeHours: toNumber(read(["overtimeHours", "Overtime Hours"])),
    overtimeMultiplier: toNumber(read(["overtimeMultiplier", "OT Multiplier"]) ?? DEFAULT_OT_MULTIPLIER),
    housingAllowance: toNumber(read(["housingAllowance", "Housing Allowance"])),
    transportAllowance: toNumber(read(["transportAllowance", "Transport Allowance"])),
    riskAllowance: toNumber(read(["riskAllowance", "Risk Allowance"])),
    gosiDeduction: toNumber(read(["gosiDeduction", "GOSI Deduction"])),
    taxDeduction: toNumber(read(["taxDeduction", "Tax Deduction", "Income Tax"])),
    advanceDeduction: toNumber(read(["advanceDeduction", "Advance Deduction", "Payroll Advance"])),
    leaveDays: toInt(read(["leaveDays", "Leave Days"])),
    absenceHours: toNumber(read(["absenceHours", "Absence Hours", "Absent Days"])),
    paymentStatus: toStatus(read(["paymentStatus", "Payment Status", "Payroll Status"]) ?? DEFAULT_STATUS),
    photoUrl: typeof photoValue === "string" ? photoValue : null,
    source:
      sourceValue === "manual" ||
      sourceValue === "bulk-paste" ||
      sourceValue === "import" ||
      sourceValue === "api"
        ? sourceValue
        : "api",
  };
 
  return calculateRecord(raw);
}
 
function validateRecord(record: SalaryRecord) {
  const errors: Record<string, string> = {};
 
  if (!record.companyName.trim()) errors.companyName = "Company name is required";
  if (!record.employeeId.trim()) errors.employeeId = "Employee ID is required";
  if (!record.name.trim()) errors.name = "Employee name is required";
  if (!record.projectCode.trim()) errors.projectCode = "Project code is required";
  if (!record.siteLocation.trim()) errors.siteLocation = "Site location is required";
  if (!record.payrollMonth.trim()) errors.payrollMonth = "Payroll month is required";
  if (record.baseRate <= 0) errors.baseRate = "Base rate must be greater than 0";
  if (record.payrollYear < 2000 || record.payrollYear > 2100) {
    errors.payrollYear = "Payroll year must be between 2000 and 2100";
  }
  if (!ALLOWED_CURRENCIES.includes(record.currency)) errors.currency = "Invalid currency";
  if (!["Paid", "Pending", "Processing", "Approved", "Draft"].includes(record.paymentStatus)) {
    errors.paymentStatus = "Invalid payment status";
  }
 
  return errors;
}
 
function toClientRecord(document: SalaryRecordDocument) {
  const { _id, ...rest } = document;
  return {
    ...rest,
    _id: _id !== undefined ? String(_id) : undefined,
    id: String(rest.id || _id || ""),
  };
}
 
function extractBodyRecords(body: unknown): { records: unknown[]; meta: RawRecord; mode: "lenient" | "strict" } {
  if (Array.isArray(body)) return { records: body, meta: {}, mode: "lenient" };
 
  if (!isPlainObject(body)) return { records: [], meta: {}, mode: "lenient" };
 
  const payload = body as RawRecord;
  const mode: "lenient" | "strict" =
    payload.mode === "strict" || (isPlainObject(payload.meta) && payload.meta.mode === "strict") ? "strict" : "lenient";
  const meta: RawRecord = isPlainObject(payload.meta) ? payload.meta : {};
 
  if (Array.isArray(payload.records)) return { records: payload.records, meta, mode };
  if (isPlainObject(payload.record)) return { records: [payload.record], meta, mode };
  if (hasPayrollLikeFields(payload)) return { records: [payload], meta, mode };
 
  return { records: [], meta, mode };
}
 
function normalizeAndDeduplicate(rawRecords: unknown[], meta: RawRecord) {
  const prepared: SalaryRecord[] = [];
  const rejectedRows: Array<{ row: number; errors: Record<string, string>; record: unknown }> = [];
 
  for (let i = 0; i < rawRecords.length; i++) {
    const item = rawRecords[i];
    try {
      const normalized = normalizeInputRecord(item, meta);
      const errors = validateRecord(normalized);
      if (Object.keys(errors).length > 0) {
        rejectedRows.push({ row: i + 1, errors, record: item });
        continue;
      }
      prepared.push(normalized);
    } catch {
      rejectedRows.push({
        row: i + 1,
        errors: { general: "Failed to normalize record" },
        record: item,
      });
    }
  }
 
  // Within a single request, if two rows resolve to the same composite key
  // (companyName + employeeId + payrollMonth + payrollYear), the later row
  // wins — mirrors how the Mongo upsert below would behave anyway.
  const map = new Map<string, SalaryRecord>();
  for (const row of prepared) {
    map.set(buildUniqueKey(row), row);
  }
 
  return {
    prepared: [...map.values()],
    rejectedRows,
  };
}
 
async function getCollection() {
  const db = await getDb();
  const collection = db.collection<SalaryRecordDocument>(COLLECTION_NAME);
 
  // Drop the old (pre-companyName) unique index if it's still present, so
  // it doesn't keep enforcing the retired employeeId+month+year+projectCode
  // rule alongside the new one. Safe to call repeatedly — ignored if the
  // index doesn't exist.
  try {
    await collection.dropIndex("uniq_employee_period_project");
  } catch {
    // index not present — nothing to drop
  }
 
  try {
    // Composite uniqueness: company_name + worker_id (employeeId) + month + year.
    await collection.createIndex(
      {
        companyName: 1,
        employeeId: 1,
        payrollMonth: 1,
        payrollYear: 1,
      },
      {
        unique: true,
        name: "uniq_company_employee_period",
        partialFilterExpression: {
          companyName: { $exists: true, $type: "string" },
          employeeId: { $exists: true, $type: "string" },
          payrollMonth: { $exists: true, $type: "string" },
          payrollYear: { $exists: true, $type: "number" },
        },
      }
    );
 
    await collection.createIndex({ createdAt: -1 }, { name: "idx_createdAt_desc" });
    await collection.createIndex({ updatedAt: -1 }, { name: "idx_updatedAt_desc" });
    await collection.createIndex({ companyName: 1, payrollYear: -1, payrollMonth: 1 }, { name: "idx_company_period" });
    await collection.createIndex({ employeeId: 1, payrollYear: -1, payrollMonth: 1 }, { name: "idx_worker_period" });
  } catch (error) {
    console.warn("salary_sheet index warning:", error);
  }
 
  return collection;
}
 
async function fetchByUniqueKeys(collection: ReturnType<typeof getCollection> extends Promise<infer T> ? T : never, records: SalaryRecord[]) {
  const filters = records.map((r) => ({
    companyName: r.companyName,
    employeeId: r.employeeId,
    payrollMonth: r.payrollMonth,
    payrollYear: r.payrollYear,
  }));
 
  if (filters.length === 0) return [];
 
  const docs = await collection
    .find({ $or: filters })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();
 
  return docs.map(toClientRecord);
}
 
export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);
 
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const month = searchParams.get("month")?.trim();
    const yearRaw = searchParams.get("year")?.trim();
    const currency = searchParams.get("currency")?.trim();
    const projectCode = searchParams.get("projectCode")?.trim();
    // Selecting a company (e.g. from the dashboard's company switcher)
    // scopes every result and the summary totals to that company, so the
    // dashboard cards update as soon as the frontend re-fetches with the
    // new companyName.
    const companyName = searchParams.get("companyName")?.trim();
 
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 500), 1000);
    const skip = (page - 1) * limit;
 
    const filter: Record<string, unknown> = {};
 
    if (search) {
      filter.$or = [
        { employeeId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { projectCode: { $regex: search, $options: "i" } },
        { siteLocation: { $regex: search, $options: "i" } },
      ];
    }
 
    if (status && status !== "All") filter.paymentStatus = status;
    if (month && month !== "All") filter.payrollMonth = month;
    if (yearRaw && yearRaw !== "All") {
      const parsedYear = toPositiveInt(yearRaw, 0);
      if (parsedYear > 0) filter.payrollYear = parsedYear;
    }
    if (currency && currency !== "All") filter.currency = currency;
    if (projectCode && projectCode !== "All") filter.projectCode = projectCode;
    if (companyName && companyName !== "All") filter.companyName = companyName;
 
    const [records, total, summary, companies] = await Promise.all([
      collection
        .find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
      collection
        .aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalGrossSalary: { $sum: "$grossSalary" },
              totalAllowances: { $sum: "$totalAllowances" },
              totalDeductions: { $sum: "$totalDeductions" },
              totalNetSalary: { $sum: "$netAmount" },
              averageNetSalary: { $avg: "$netAmount" },
              workerIds: { $addToSet: "$employeeId" },
              paidCount: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
              },
              pendingCount: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] },
              },
              processingCount: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Processing"] }, 1, 0] },
              },
              approvedCount: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Approved"] }, 1, 0] },
              },
              draftCount: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Draft"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalGrossSalary: { $ifNull: ["$totalGrossSalary", 0] },
              totalAllowances: { $ifNull: ["$totalAllowances", 0] },
              totalDeductions: { $ifNull: ["$totalDeductions", 0] },
              totalNetSalary: { $ifNull: ["$totalNetSalary", 0] },
              averageNetSalary: { $ifNull: ["$averageNetSalary", 0] },
              totalWorkers: { $size: "$workerIds" },
              paidCount: 1,
              pendingCount: 1,
              processingCount: 1,
              approvedCount: 1,
              draftCount: 1,
            },
          },
        ])
        .toArray(),
      // Distinct company list (independent of the companyName filter, but
      // respecting month/year/etc.) so the frontend can populate a company
      // switcher without a second round-trip.
      collection.distinct("companyName", (() => {
        const { companyName: _omit, ...rest } = filter;
        return rest;
      })()),
    ]);
 
    return NextResponse.json({
      success: true,
      records: records.map(toClientRecord),
      total,
      page,
      limit,
      companies: companies.filter((c): c is string => typeof c === "string").sort((a, b) => a.localeCompare(b)),
      summary:
        summary[0] || {
          totalGrossSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalNetSalary: 0,
          averageNetSalary: 0,
          totalWorkers: 0,
          paidCount: 0,
          pendingCount: 0,
          processingCount: 0,
          approvedCount: 0,
          draftCount: 0,
        },
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load salary sheets");
  }
}
 
export async function POST(request: NextRequest) {
  try {
    const collection = await getCollection();
    const body = await request.json().catch(() => null);
 
    const { records: rawRecords, meta, mode } = extractBodyRecords(body);
 
    if (rawRecords.length === 0) {
      return jsonError("No record data received", 400);
    }
 
    const { prepared, rejectedRows } = normalizeAndDeduplicate(rawRecords, meta);
 
    if (prepared.length === 0) {
      return jsonError("No valid records found in payload", 400, rejectedRows);
    }
 
    if (mode === "strict" && rejectedRows.length > 0) {
      return jsonError(
        "Bulk import aborted because one or more rows failed validation",
        400,
        rejectedRows
      );
    }
 
    const now = new Date();
 
    const bulkOps = prepared.map((record) => {
      const { id: _omitId, createdAt: _omitCreatedAt, updatedAt: _omitUpdatedAt, ...setDoc } = record;
 
      return {
        updateOne: {
          // Composite duplicate-prevention filter: company_name + worker_id
          // + month + year. Matching existing rows are updated in place
          // (upsert) instead of creating a second row for the same period.
          filter: {
            companyName: record.companyName,
            employeeId: record.employeeId,
            payrollMonth: record.payrollMonth,
            payrollYear: record.payrollYear,
          },
          update: {
            $set: {
              ...setDoc,
              updatedAt: now,
            },
            $setOnInsert: {
              id: record.id || randomUUID(),
              createdAt: now,
            },
          },
          upsert: true,
        },
      };
    });
 
    const result = await collection.bulkWrite(bulkOps, { ordered: false });
    const savedRecords = await fetchByUniqueKeys(collection, prepared);
 
    return NextResponse.json({
      success: true,
      message:
        prepared.length === 1
          ? "Salary record saved successfully"
          : "Bulk salary records saved successfully",
      mode,
      inputCount: rawRecords.length,
      acceptedCount: prepared.length,
      savedCount: prepared.length,
      insertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      rejectedCount: rejectedRows.length,
      rejectedRows,
      records: savedRecords,
    });
  } catch (error: unknown) {
    console.error(error);
 
    if (isPlainObject(error) && (error as { code?: number }).code === 11000) {
      return jsonError(
        "Duplicate record conflict: companyName + employeeId + payrollMonth + payrollYear already exists",
        409
      );
    }
 
    return jsonError("Failed to save salary sheet data");
  }
}
 
export async function PUT(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => null);
 
    if (!isPlainObject(body)) {
      return jsonError("Invalid request body", 400);
    }
 
    const id = searchParams.get("id")?.trim() || toText(body.id, "");
    if (!id) return jsonError("Record id is required", 400);
 
    const input = isPlainObject(body.record) ? body.record : body;
    const normalized = normalizeInputRecord(input, isPlainObject(body.meta) ? body.meta : undefined);
    const normalizedWithId: SalaryRecord = {
      ...normalized,
      id,
    };
 
    const errors = validateRecord(normalizedWithId);
    if (Object.keys(errors).length > 0) {
      return jsonError("Validation failed", 400, errors);
    }
 
    // Composite duplicate check: company_name + worker_id + month + year,
    // excluding this record's own id (so saving a record without changing
    // its key doesn't flag itself as a duplicate).
    const duplicate = await collection.findOne({
      id: { $ne: id },
      companyName: normalized.companyName,
      employeeId: normalized.employeeId,
      payrollMonth: normalized.payrollMonth,
      payrollYear: normalized.payrollYear,
    });
 
    if (duplicate) {
      return jsonError(
        "Another record already exists for the same company, employee, month, and year",
        409
      );
    }
 
    const now = new Date();
    const { id: _omitId, createdAt: _omitCreatedAt, updatedAt: _omitUpdatedAt, ...setDoc } = normalizedWithId;
 
    const updateResult = await collection.updateOne(
      { id },
      {
        $set: {
          ...setDoc,
          id,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: false }
    );
 
    if (updateResult.matchedCount === 0) {
      return jsonError("Salary record not found", 404);
    }
 
    const updated = await collection.findOne({ id });
    if (!updated) {
      return jsonError("Salary record could not be loaded after update", 500);
    }
 
    return NextResponse.json({
      success: true,
      message: "Salary record updated successfully",
      record: toClientRecord(updated),
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to update salary sheet");
  }
}
 
export async function DELETE(request: NextRequest) {
  try {
    const collection = await getCollection();
    const { searchParams } = new URL(request.url);
 
    const id = searchParams.get("id")?.trim();
    const ids = searchParams
      .get("ids")
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean);
 
    if (!id && (!ids || ids.length === 0)) {
      return jsonError("Record id is required", 400);
    }
 
    const result = ids?.length
      ? await collection.deleteMany({ id: { $in: ids } })
      : await collection.deleteOne({ id });
 
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Salary sheet deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return jsonError("Failed to delete salary sheet");
  }
}
 