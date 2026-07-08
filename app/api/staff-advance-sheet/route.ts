import { NextRequest, NextResponse } from "next/server";
import { MongoClient, Db, Collection } from "mongodb";

export const runtime = "nodejs";

type ApprovalStatus = "Approved" | "Pending" | "Review" | "Rejected";

type AdvanceSheetRow = {
sl: number;
profilePicture: string;
id: string;
smartId: string;
name: string;
position: string;
department: string;
advance1: number;
advance2: number;
advance3: number;
advance4: number;
netAmount: number;
currency: "BDT" | "USD" | "EUR";
nationality: string;
active: boolean;
unactive: boolean;
delayed: boolean;
paymentMethod: "Bank" | "Cash" | "Mobile Banking" | "Card";
approvalStatus: ApprovalStatus;
remarks: string;
lastUpdated: string;
};

function recalculateNetAmount(row: AdvanceSheetRow) {
return (
Number(row.advance1 || 0) +
Number(row.advance2 || 0) +
Number(row.advance3 || 0) +
Number(row.advance4 || 0)
);
}

function buildSummary(data: AdvanceSheetRow[]) {
return {
totalRows: data.length,
active: data.filter((row) => row.active).length,
unactive: data.filter((row) => row.unactive).length,
delayed: data.filter((row) => row.delayed).length,
totalNetAmount: data.reduce((sum, row) => sum + row.netAmount, 0),
};
}

function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit) {
return NextResponse.json(body, {
status,
headers: {
"Cache-Control": "no-store, max-age=0",
...extraHeaders,
},
});
}

// MongoDB connection helpers
// Fallback: dev-এ লোকাল MongoDB ব্যবহার করবে; প্রোডাকশনে অবশ্যই MONGODB_URI দিতে হবে
const mongoUri =
process.env.MONGODB_URI ||
process.env.NEXT_PUBLIC_MONGODB_URI ||
(process.env.NODE_ENV !== "production" ? "mongodb://127.0.0.1:27017" : undefined);

const dbName = process.env.MONGODB_DB || "appdb";
const collectionName = "advanceSheetRows";

let client: MongoClient | null = null;
let db: Db | null = null;
let col: Collection<AdvanceSheetRow> | null = null;

async function getCollection(): Promise<Collection<AdvanceSheetRow>> {
if (!mongoUri) {
throw new Error("Missing environment variable: MONGODB_URI");
}
if (col) return col;
if (!client) {
client = new MongoClient(mongoUri);
await client.connect();
}
if (!db) {
db = client.db(dbName);
}
col = db.collection<AdvanceSheetRow>(collectionName);
await col.createIndex({ id: 1 }, { unique: true });
return col;
}

// Initial seed data
function getSeedRows(): AdvanceSheetRow[] {
const now = new Date().toISOString();
const seed: AdvanceSheetRow[] = [
{
sl: 1,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Rahim",
id: "EMP-2026-001",
smartId: "VIP-BD-DHK-0001",
name: "Md. Rahim Uddin",
position: "Senior Finance Executive",
department: "Finance",
advance1: 25000,
advance2: 12000,
advance3: 8000,
advance4: 5000,
netAmount: 50000,
currency: "BDT",
nationality: "Bangladeshi",
active: true,
unactive: false,
delayed: false,
paymentMethod: "Bank",
approvalStatus: "Approved",
remarks: "Monthly operational advance cleared for VIP project.",
lastUpdated: now,
},
{
sl: 2,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ayesha",
id: "EMP-2026-002",
smartId: "VIP-BD-CTG-0002",
name: "Ayesha Akter",
position: "Project Coordinator",
department: "Operations",
advance1: 18000,
advance2: 9000,
advance3: 6000,
advance4: 0,
netAmount: 33000,
currency: "BDT",
nationality: "Bangladeshi",
active: true,
unactive: false,
delayed: true,
paymentMethod: "Mobile Banking",
approvalStatus: "Review",
remarks: "Advance 4 pending due to document verification.",
lastUpdated: now,
},
{
sl: 3,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Tanvir",
id: "EMP-2026-003",
smartId: "VIP-BD-SYL-0003",
name: "Tanvir Hasan",
position: "IT Lead",
department: "Technology",
advance1: 32000,
advance2: 15000,
advance3: 15000,
advance4: 10000,
netAmount: 72000,
currency: "BDT",
nationality: "Bangladeshi",
active: true,
unactive: false,
delayed: false,
paymentMethod: "Bank",
approvalStatus: "Approved",
remarks: "Infrastructure and cloud service advance.",
lastUpdated: now,
},
{
sl: 4,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Nusrat",
id: "EMP-2026-004",
smartId: "VIP-BD-DHK-0004",
name: "Nusrat Jahan",
position: "HR Business Partner",
department: "Human Resources",
advance1: 10000,
advance2: 7000,
advance3: 0,
advance4: 0,
netAmount: 17000,
currency: "BDT",
nationality: "Bangladeshi",
active: false,
unactive: true,
delayed: false,
paymentMethod: "Cash",
approvalStatus: "Pending",
remarks: "Employee welfare advance waiting for manager approval.",
lastUpdated: now,
},
{
sl: 5,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Karim",
id: "EMP-2026-005",
smartId: "VIP-BD-KHL-0005",
name: "Abdul Karim",
position: "Regional Sales Manager",
department: "Sales",
advance1: 45000,
advance2: 21000,
advance3: 16000,
advance4: 11000,
netAmount: 93000,
currency: "BDT",
nationality: "Bangladeshi",
active: true,
unactive: false,
delayed: true,
paymentMethod: "Card",
approvalStatus: "Review",
remarks: "Regional campaign advance; delayed settlement flagged.",
lastUpdated: now,
},
{
sl: 6,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Maria",
id: "EMP-2026-006",
smartId: "VIP-US-NYC-0006",
name: "Maria Johnson",
position: "International Consultant",
department: "Strategy",
advance1: 90000,
advance2: 45000,
advance3: 0,
advance4: 0,
netAmount: 135000,
currency: "BDT",
nationality: "American",
active: true,
unactive: false,
delayed: false,
paymentMethod: "Bank",
approvalStatus: "Approved",
remarks: "Converted international consultancy advance in BDT ledger.",
lastUpdated: now,
},
{
sl: 7,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Shuvo",
id: "EMP-2026-007",
smartId: "VIP-BD-RAJ-0007",
name: "Shuvo Das",
position: "Procurement Specialist",
department: "Procurement",
advance1: 27000,
advance2: 14000,
advance3: 9000,
advance4: 3000,
netAmount: 53000,
currency: "BDT",
nationality: "Bangladeshi",
active: true,
unactive: false,
delayed: false,
paymentMethod: "Bank",
approvalStatus: "Approved",
remarks: "Vendor prepayment and emergency purchase advance.",
lastUpdated: now,
},
{
sl: 8,
profilePicture: "https://api.dicebear.com/9.x/adventurer/svg?seed=Farzana",
id: "EMP-2026-008",
smartId: "VIP-BD-BAR-0008",
name: "Farzana Sultana",
position: "Compliance Officer",
department: "Compliance",
advance1: 16000,
advance2: 0,
advance3: 0,
advance4: 0,
netAmount: 16000,
currency: "BDT",
nationality: "Bangladeshi",
active: false,
unactive: true,
delayed: true,
paymentMethod: "Mobile Banking",
approvalStatus: "Rejected",
remarks: "Rejected due to incomplete supporting documents.",
lastUpdated: now,
},
];
for (const r of seed) {
r.netAmount = recalculateNetAmount(r);
}
return seed;
}

async function seedIfEmpty() {
const collection = await getCollection();
const count = await collection.estimatedDocumentCount();
if (count === 0) {
const seed = getSeedRows();
await collection.insertMany(seed);
}
}

function stripMongoId(doc: any): AdvanceSheetRow {
const { _id, ...rest } = doc;
return rest as AdvanceSheetRow;
}

// GET METHOD
export async function GET() {
try {
await seedIfEmpty();
const collection = await getCollection();
const docs = await collection.find({}).sort({ sl: 1 }).toArray();
const rows = docs.map(stripMongoId);
return jsonResponse({
ok: true,
generatedAt: new Date().toISOString(),
data: rows,
summary: buildSummary(rows),
});
} catch (error) {
return jsonResponse(
{
ok: false,
message: error instanceof Error ? error.message : "Failed to fetch advance sheet data.",
},
500
);
}
}

// PUT METHOD
export async function PUT(request: NextRequest) {
try {
await seedIfEmpty();
const payload = (await request.json()) as Partial<AdvanceSheetRow>;

if (!payload.id || typeof payload.id !== "string") {
  return jsonResponse(
    { ok: false, message: "Valid employee ID is required for update." },
    400
  );
}

const collection = await getCollection();
const existing = await collection.findOne({ id: payload.id });

if (!existing) {
  return jsonResponse(
    { ok: false, message: `No advance sheet row found for ID: ${payload.id}` },
    404
  );
}

const merged: AdvanceSheetRow = {
  ...stripMongoId(existing),
  ...payload,
  sl: existing.sl,
  id: existing.id,
  smartId: payload.smartId ?? existing.smartId,
  profilePicture: payload.profilePicture ?? existing.profilePicture,
  name: payload.name ?? existing.name,
  position: payload.position ?? existing.position,
  department: payload.department ?? existing.department,
  advance1: Number(payload.advance1 ?? existing.advance1),
  advance2: Number(payload.advance2 ?? existing.advance2),
  advance3: Number(payload.advance3 ?? existing.advance3),
  advance4: Number(payload.advance4 ?? existing.advance4),
  currency: payload.currency ?? existing.currency,
  nationality: payload.nationality ?? existing.nationality,
  active: typeof payload.active === "boolean" ? payload.active : Boolean(existing.active),
  unactive: typeof payload.unactive === "boolean" ? payload.unactive : Boolean(existing.unactive),
  delayed: typeof payload.delayed === "boolean" ? payload.delayed : Boolean(existing.delayed),
  paymentMethod: payload.paymentMethod ?? existing.paymentMethod,
  approvalStatus: (payload.approvalStatus as ApprovalStatus) ?? existing.approvalStatus,
  remarks: payload.remarks ?? existing.remarks,
  lastUpdated: new Date().toISOString(),
  netAmount: 0,
};

merged.netAmount = recalculateNetAmount(merged);

if (merged.active && merged.unactive) {
  merged.unactive = false;
}

await collection.updateOne({ id: merged.id }, { $set: merged });

const allDocs = await collection.find({}).toArray();
const allRows = allDocs.map(stripMongoId);

return jsonResponse({
  ok: true,
  updatedAt: new Date().toISOString(),
  data: merged,
  summary: buildSummary(allRows),
});
} catch (error) {
return jsonResponse(
{
ok: false,
message: error instanceof Error ? error.message : "Invalid request body for advance sheet update.",
},
500
);
}
}

// POST METHOD
export async function POST(request: NextRequest) {
try {
await seedIfEmpty();
const payload = (await request.json()) as Partial<AdvanceSheetRow>;

if (!payload.id || typeof payload.id !== "string") {
  return jsonResponse(
    { ok: false, message: "Valid employee ID is required." },
    400
  );
}
if (!payload.name || typeof payload.name !== "string") {
  return jsonResponse(
    { ok: false, message: "Employee name is required." },
    400
  );
}

const collection = await getCollection();
const existing = await collection.findOne({ id: payload.id });

if (existing) {
  return jsonResponse(
    { ok: false, message: `An employee with ID ${payload.id} already exists.` },
    400
  );
}

const totalCount = await collection.countDocuments({});
const nextSl = totalCount + 1;

const newRow: AdvanceSheetRow = {
  sl: nextSl,
  id: payload.id,
  smartId: payload.smartId || `VIP-BD-NEW-${String(nextSl).padStart(4, "0")}`,
  profilePicture:
    payload.profilePicture ||
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(payload.name)}`,
  name: payload.name,
  position: payload.position || "Staff",
  department: payload.department || "General",
  advance1: Number(payload.advance1 || 0),
  advance2: Number(payload.advance2 || 0),
  advance3: Number(payload.advance3 || 0),
  advance4: Number(payload.advance4 || 0),
  currency: (payload.currency as AdvanceSheetRow["currency"]) || "BDT",
  nationality: payload.nationality || "Bangladeshi",
  active: typeof payload.active === "boolean" ? payload.active : true,
  unactive: typeof payload.unactive === "boolean" ? payload.unactive : false,
  delayed: typeof payload.delayed === "boolean" ? payload.delayed : false,
  paymentMethod: (payload.paymentMethod as AdvanceSheetRow["paymentMethod"]) || "Bank",
  approvalStatus: (payload.approvalStatus as ApprovalStatus) || "Pending",
  remarks: payload.remarks || "",
  lastUpdated: new Date().toISOString(),
  netAmount: 0,
};

newRow.netAmount = recalculateNetAmount(newRow);

if (newRow.active && newRow.unactive) {
  newRow.unactive = false;
}

await collection.insertOne(newRow);

const allDocs = await collection.find({}).sort({ sl: 1 }).toArray();
const allRows = allDocs.map(stripMongoId);

return jsonResponse(
  {
    ok: true,
    createdAt: new Date().toISOString(),
    data: newRow,
    allData: allRows,
    summary: buildSummary(allRows),
  },
  201
);
} catch (error) {
return jsonResponse(
{
ok: false,
message: error instanceof Error ? error.message : "Failed to create staff advance entry.",
},
500
);
}
}