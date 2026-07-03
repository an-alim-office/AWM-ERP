import { NextRequest, NextResponse } from 'next/server';
import { randomUUID, createHash } from 'node:crypto';

// Next.js App Router runtime hints
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================
// ১) টাইপ ডেফিনিশন
// ============================================================
export type AdvancementType = 'Promotion' | 'Skill Certification' | 'Department Transfer';

export interface AdvancementLog {
  id: string;
  employeeName: string;
  previousRole: string;
  newRole: string;
  advancementType: AdvancementType;
  date: string;       // YYYY-MM-DD
  notes: string;
  createdAt: string;  // ISO
  updatedAt?: string; // ISO
}

// ============================================================
// ২) ইন-মেমোরি ডেটা (ডেমো পারপাসে)
// ============================================================
let advancementLogs: AdvancementLog[] = [
  {
    id: '1',
    employeeName: 'আরিফ রহমান',
    previousRole: 'Junior Developer',
    newRole: 'Mid-level Developer',
    advancementType: 'Promotion',
    date: '2026-05-10',
    notes: 'Next.js এবং প্রজেক্ট ম্যানেজমেন্টে চমৎকার পারফরম্যান্সের জন্য পদোন্নতি।',
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    employeeName: 'নাসরিন সুলতানা',
    previousRole: 'QA Engineer',
    newRole: 'Senior QA Automation Engineer',
    advancementType: 'Skill Certification',
    date: '2026-06-15',
    notes: 'AWS Certified Cloud Practitioner সার্টিফিকেট সম্পন্ন করার পর পদোন্নতি।',
    createdAt: new Date('2026-06-15T09:30:00Z').toISOString(),
  },
];

// Idempotency key cache (in-memory)
const idempotencyMap = new Map<string, string>();

// ============================================================
// ৩) ইউটিলস: CORS, রেসপন্স, ভ্যালিডেশন, পেজিং/সোর্টিং, রেট লিমিট
// ============================================================
const ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD';
const ALLOWED_HEADERS = 'Content-Type,Authorization,Idempotency-Key,If-None-Match,If-Match,X-Request-Id';
const EXPOSE_HEADERS = 'ETag,X-Total-Count,X-Request-Id';

function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || randomUUID();
}

function corsHeaders(req: NextRequest): Record<string, string> {
  const envOrigin = process.env.ALLOWED_ORIGIN;
  const origin = envOrigin ?? req.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Expose-Headers': EXPOSE_HEADERS,
    'Vary': 'Origin',
  };
}

function withBaseHeaders(req: NextRequest, extra?: Record<string, string>) {
  const rid = getRequestId(req);
  return {
    ...corsHeaders(req),
    'Cache-Control': 'no-store',
    'X-Request-Id': rid,
    ...(extra ?? {}),
  };
}

function json(req: NextRequest, payload: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return NextResponse.json(payload, {
    status,
    headers: withBaseHeaders(req, extraHeaders),
  });
}

function empty(req: NextRequest, status = 204, extraHeaders?: Record<string, string>) {
  return new NextResponse(null, {
    status,
    headers: withBaseHeaders(req, extraHeaders),
  });
}

const VALID_TYPES: AdvancementType[] = ['Promotion', 'Skill Certification', 'Department Transfer'];

function isValidAdvancementType(v: any): v is AdvancementType {
  return typeof v === 'string' && VALID_TYPES.includes(v as AdvancementType);
}

function isValidDateYYYYMMDD(s: any): s is string {
  if (typeof s !== 'string') return false;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === s;
}

function todayYYYYMMDD(): string {
  return new Date().toISOString().slice(0, 10);
}

function parsePositiveInt(value: string | null, defaultValue: number): number {
  const n = value === null ? NaN : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : defaultValue;
}

type SortBy = 'createdAt' | 'updatedAt' | 'date' | 'employeeName' | 'advancementType' | 'newRole' | 'previousRole';
type SortOrder = 'asc' | 'desc';

function sortLogs(logs: AdvancementLog[], sortBy: SortBy, order: SortOrder): AdvancementLog[] {
  const factor = order === 'desc' ? -1 : 1;
  return [...logs].sort((a, b) => {
    let av: any = (a as any)[sortBy];
    let bv: any = (b as any)[sortBy];

    if (sortBy === 'createdAt' || sortBy === 'date' || sortBy === 'updatedAt') {
      const at = new Date(String(av)).getTime();
      const bt = new Date(String(bv)).getTime();
      return (at - bt) * factor;
    }

    av = String(av ?? '').toLowerCase();
    bv = String(bv ?? '').toLowerCase();
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  });
}

const ALL_FIELDS: (keyof AdvancementLog)[] = [
  'id',
  'employeeName',
  'previousRole',
  'newRole',
  'advancementType',
  'date',
  'notes',
  'createdAt',
  'updatedAt',
];

function projectFields(log: AdvancementLog, fields: (keyof AdvancementLog)[]): Partial<AdvancementLog> {
  const out: Partial<AdvancementLog> = {};
  for (const f of fields) {
    (out as any)[f] = (log as any)[f];
  }
  return out;
}

function sha1(jsonVal: unknown) {
  const jsonStr = JSON.stringify(jsonVal);
  return createHash('sha1').update(jsonStr).digest('hex');
}

function buildETag(payload: unknown): string {
  const hash = sha1(payload);
  // RFC7232 weak validator format: W/"<hash>"
  return `W/"${hash}"`;
}

function createErrorResponse(req: NextRequest, message: string, status: number, details?: any) {
  return json(req, { success: false, error: { message, details } }, status, { 'Allow': ALLOWED_METHODS });
}

// Simple in-memory rate limiter (per IP)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 120;          // 120 requests per minute per IP (tune as needed)
const rateStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const ip = (req as any).ip as string | undefined;
  return ip || 'unknown';
}

function rateLimit(req: NextRequest): { ok: boolean; headers?: Record<string, string> } {
  const key = getClientIp(req);
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, headers: { 'X-RateLimit-Limit': String(RATE_LIMIT_MAX), 'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - 1) } };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retry = Math.ceil((entry.resetAt - now) / 1000);
    return { ok: false, headers: { 'Retry-After': String(retry), 'X-RateLimit-Limit': String(RATE_LIMIT_MAX), 'X-RateLimit-Remaining': '0' } };
  }

  entry.count += 1;
  rateStore.set(key, entry);
  return { ok: true, headers: { 'X-RateLimit-Limit': String(RATE_LIMIT_MAX), 'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - entry.count) } };
}

// ============================================================
// ৪) OPTIONS (CORS preflight)
// ============================================================
export async function OPTIONS(request: NextRequest) {
  const headers = { 'Allow': ALLOWED_METHODS };
  return empty(request, 204, headers);
}

// ============================================================
// ৫) HEAD: কাউন্ট-ওনলি (বডি ছাড়া)
// ============================================================
export async function HEAD(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = (searchParams.get('search') || searchParams.get('q') || '').toLowerCase();
  const typeParam = searchParams.get('type');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const createdFrom = searchParams.get('createdFrom');
  const createdTo = searchParams.get('createdTo');

  let filtered = [...advancementLogs];

  if (search) {
    filtered = filtered.filter((log) =>
      log.employeeName.toLowerCase().includes(search) ||
      log.newRole.toLowerCase().includes(search) ||
      log.previousRole.toLowerCase().includes(search) ||
      log.notes.toLowerCase().includes(search)
    );
  }

  if (typeParam && isValidAdvancementType(typeParam)) {
    filtered = filtered.filter((log) => log.advancementType === typeParam);
  }

  if (dateFrom && isValidDateYYYYMMDD(dateFrom)) filtered = filtered.filter((l) => l.date >= dateFrom);
  if (dateTo && isValidDateYYYYMMDD(dateTo)) filtered = filtered.filter((l) => l.date <= dateTo);

  if (createdFrom) {
    const ts = new Date(createdFrom).getTime();
    if (!Number.isNaN(ts)) filtered = filtered.filter((l) => new Date(l.createdAt).getTime() >= ts);
  }
  if (createdTo) {
    const ts = new Date(createdTo).getTime();
    if (!Number.isNaN(ts)) filtered = filtered.filter((l) => new Date(l.createdAt).getTime() <= ts);
  }

  const headers = { 'X-Total-Count': String(filtered.length), 'Allow': ALLOWED_METHODS };
  return empty(request, 200, headers);
}

// ============================================================
// ৬) GET: ফিল্টারিং + সোর্টিং + পেজিনেশন + ফিল্ড প্রজেকশন + ETag + সিঙ্গেল রিসোর্স + স্ট্যাটস
// ============================================================
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) return createErrorResponse(request, 'Rate limit অতিক্রম করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।', 429, rl.headers);
  try {
    const { searchParams } = request.nextUrl;

    // Single resource fetch by id
    const id = searchParams.get('id');
    if (id) {
      const fieldsParam = searchParams.get('fields');
      let selectedFields: (keyof AdvancementLog)[] = ALL_FIELDS;
      if (fieldsParam && fieldsParam.trim()) {
        const requested = fieldsParam.split(',').map((s) => s.trim()).filter(Boolean) as (keyof AdvancementLog)[];
        const valid = requested.filter((f) => ALL_FIELDS.includes(f));
        selectedFields = Array.from(new Set<keyof AdvancementLog>(['id', ...valid]));
      }

      const found = advancementLogs.find((l) => l.id === id);
      if (!found) {
        return createErrorResponse(request, 'উক্ত আইডি সংবলিত কোনো লগ খুঁজে পাওয়া যায়নি।', 404);
      }

      const data = projectFields(found, selectedFields);
      const etag = buildETag(found);
      const ifNoneMatch = request.headers.get('if-none-match');
      const headers = { ETag: etag, 'X-Total-Count': '1' };

      if (ifNoneMatch && ifNoneMatch === etag) {
        return empty(request, 304, headers);
      }

      return json(request, { success: true, data }, 200, headers);
    }

    // Stats endpoint
    const statsParam = searchParams.get('stats');
    if (statsParam && ['1', 'true', 'yes'].includes(statsParam.toLowerCase())) {
      const byType: Record<AdvancementType, number> = {
        Promotion: 0,
        'Skill Certification': 0,
        'Department Transfer': 0,
      };
      const byMonth: Record<string, number> = {}; // YYYY-MM -> count
      const byEmployee: Record<string, number> = {};

      for (const log of advancementLogs) {
        byType[log.advancementType] = (byType[log.advancementType] || 0) + 1;
        const ym = log.date.slice(0, 7);
        byMonth[ym] = (byMonth[ym] || 0) + 1;
        byEmployee[log.employeeName] = (byEmployee[log.employeeName] || 0) + 1;
      }

      const topEmployees = Object.entries(byEmployee)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const payload = {
        success: true,
        data: {
          totals: { count: advancementLogs.length },
          byType,
          byMonth,
          topEmployees,
          lastUpdatedAt: advancementLogs
            .map((l) => l.updatedAt || l.createdAt)
            .sort()
            .at(-1) || null,
        },
      };

      const etag = buildETag(payload);
      const ifNoneMatch = request.headers.get('if-none-match');
      const headers = { ETag: etag, 'X-Total-Count': String(advancementLogs.length) };

      if (ifNoneMatch && ifNoneMatch === etag) {
        return empty(request, 304, headers);
      }

      return json(request, payload, 200, headers);
    }

    // List with filtering/pagination
    const search = (searchParams.get('search') || searchParams.get('q') || '').toLowerCase();
    const typeParam = searchParams.get('type');
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 10);

    const sortBy = (searchParams.get('sortBy') as SortBy) || 'createdAt';
    const order = (searchParams.get('order') as SortOrder) === 'asc' ? 'asc' : 'desc';

    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const createdFrom = searchParams.get('createdFrom');
    const createdTo = searchParams.get('createdTo');

    // Field projection
    const fieldsParam = searchParams.get('fields');
    let selectedFields: (keyof AdvancementLog)[] = ALL_FIELDS;
    if (fieldsParam && fieldsParam.trim()) {
      const requested = fieldsParam.split(',').map((s) => s.trim()).filter(Boolean) as (keyof AdvancementLog)[];
      const valid = requested.filter((f) => ALL_FIELDS.includes(f));
      selectedFields = Array.from(new Set<keyof AdvancementLog>(['id', ...valid]));
    }

    // Filter
    let filteredLogs = [...(advancementLogs || [])];

    if (search) {
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.employeeName.toLowerCase().includes(search) ||
          log.newRole.toLowerCase().includes(search) ||
          log.previousRole.toLowerCase().includes(search) ||
          log.notes.toLowerCase().includes(search)
      );
    }

    if (typeParam && isValidAdvancementType(typeParam)) {
      filteredLogs = filteredLogs.filter((log) => log.advancementType === typeParam);
    }

    if (dateFrom && isValidDateYYYYMMDD(dateFrom)) filteredLogs = filteredLogs.filter((l) => l.date >= dateFrom);
    if (dateTo && isValidDateYYYYMMDD(dateTo)) filteredLogs = filteredLogs.filter((l) => l.date <= dateTo);

    if (createdFrom) {
      const ts = new Date(createdFrom).getTime();
      if (!Number.isNaN(ts)) filteredLogs = filteredLogs.filter((l) => new Date(l.createdAt).getTime() >= ts);
    }
    if (createdTo) {
      const ts = new Date(createdTo).getTime();
      if (!Number.isNaN(ts)) filteredLogs = filteredLogs.filter((l) => new Date(l.createdAt).getTime() <= ts);
    }

    // Sort
    if (['createdAt', 'updatedAt', 'date', 'employeeName', 'advancementType', 'newRole', 'previousRole'].includes(sortBy)) {
      filteredLogs = sortLogs(filteredLogs, sortBy, order);
    }

    // Pagination
    const totalRecords = filteredLogs.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginated = filteredLogs.slice(startIndex, startIndex + limit);

    // Projection
    const projected = paginated.map((log) => projectFields(log, selectedFields));

    const payload = {
      success: true,
      meta: {
        totalRecords,
        currentPage: safePage,
        totalPages,
        limit,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
        sortBy,
        order,
      },
      data: projected,
    };

    // ETag support for list
    const etag = buildETag(payload);
    const ifNoneMatch = request.headers.get('if-none-match');
    const headers = { ETag: etag, 'X-Total-Count': String(totalRecords) };

    if (ifNoneMatch && ifNoneMatch === etag) {
      return empty(request, 304, headers);
    }

    return json(request, payload, 200, headers);
  } catch (error) {
    return createErrorResponse(request, 'সার্ভার ডেটা প্রসেস করতে ব্যর্থ হয়েছে।', 500);
  }
}

// ============================================================
// ৭) POST: টাইপ-সেফ ভ্যালিডেশন + Idempotency-Key সাপোর্ট + রেট লিমিট
// ============================================================
export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) return createErrorResponse(request, 'Rate limit অতিক্রম করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।', 429, rl.headers);
  try {
    const idempotencyKey = request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key') || undefined;
    if (idempotencyKey && idempotencyMap.has(idempotencyKey)) {
      const existingId = idempotencyMap.get(idempotencyKey)!;
      const existing = advancementLogs.find((l) => l.id === existingId);
      if (existing) {
        return json(request, {
          success: true,
          message: 'আগে থেকেই এই রিকোয়েস্ট প্রসেস করা হয়েছে (idempotent)।',
          data: existing,
        }, 200, rl.headers);
      }
    }

    const body = (await request.json()) as Record<string, any>;
    const requiredFields = ['employeeName', 'newRole', 'advancementType'] as const;

    const missingFields = requiredFields.filter((field) => {
      const v = body[field];
      return typeof v !== 'string' || !v.trim();
    });

    if (missingFields.length > 0) {
      return createErrorResponse(request, 'প্রয়োজনীয় তথ্য অনুপস্থিত বা অসম্পূর্ণ।', 400, { missingFields, ...rl.headers });
    }

    if (!isValidAdvancementType(body.advancementType)) {
      return createErrorResponse(request, 'অগ্রগতির ধরণটি (advancementType) সঠিক নয়।', 400, { allowedValues: VALID_TYPES, ...rl.headers });
    }

    // Optional length validation
    if (String(body.employeeName).trim().length > 120) {
      return createErrorResponse(request, 'employeeName খুব লম্বা। সর্বোচ্চ 120 অক্ষর।', 400, rl.headers);
    }
    if (body.notes && String(body.notes).length > 2000) {
      return createErrorResponse(request, 'notes খুব লম্বা। সর্বোচ্চ 2000 অক্ষর।', 400, rl.headers);
    }

    let dateStr: string = todayYYYYMMDD();
    if (body.date !== undefined) {
      if (isValidDateYYYYMMDD(body.date)) dateStr = body.date;
      else return createErrorResponse(request, 'তারিখ (date) অবশ্যই YYYY-MM-DD ফরম্যাটে হতে হবে।', 400, rl.headers);
    }

    const newLog: AdvancementLog = {
      id: randomUUID(),
      employeeName: String(body.employeeName).trim(),
      previousRole: body.previousRole ? String(body.previousRole).trim() : 'N/A',
      newRole: String(body.newRole).trim(),
      advancementType: body.advancementType as AdvancementType,
      date: dateStr,
      notes: body.notes ? String(body.notes).trim() : '',
      createdAt: new Date().toISOString(),
    };

    advancementLogs.unshift(newLog);

    if (idempotencyKey) {
      idempotencyMap.set(idempotencyKey, newLog.id);
    }

    const headers = { Location: `/api/staff-advancement-logs?id=${newLog.id}`, ...(rl.headers || {}) };
    return json(request, {
      success: true,
      message: 'স্টাফ অ্যাডভান্সমেন্ট লগ সফলভাবে তৈরি হয়েছে।',
      data: newLog,
    }, 201, headers);
  } catch (error) {
    return createErrorResponse(request, 'ইনপুট ডেটা পার্স করতে সমস্যা হয়েছে।', 400, rl.headers);
  }
}

// ============================================================
// ৮) PUT/PATCH: আংশিক বা পূর্ণ আপডেট + If-Match (ETag) কনকারেন্সি কন্ট্রোল
// ============================================================
async function updateLog(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) return createErrorResponse(request, 'Rate limit অতিক্রম করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।', 429, rl.headers);

  try {
    const { searchParams } = request.nextUrl;
    const idFromQuery = searchParams.get('id');
    const body = (await request.json()) as Record<string, any>;
    const id = idFromQuery || body.id;

    if (!id || typeof id !== 'string') {
      return createErrorResponse(request, 'লগ আইডি (id) প্রদান করা বাধ্যতামূলক।', 400, rl.headers);
    }

    const logIndex = advancementLogs.findIndex((log) => log.id === id);
    if (logIndex === -1) {
      return createErrorResponse(request, 'উক্ত আইডি সংবলিত কোনো লগ খুঁজে পাওয়া যায়নি।', 404, rl.headers);
    }

    if (body.advancementType !== undefined && !isValidAdvancementType(body.advancementType)) {
      return createErrorResponse(request, 'অগ্রগতির ধরণটি সঠিক নয়।', 400, { allowedValues: VALID_TYPES, ...rl.headers });
    }

    if (body.date !== undefined && body.date !== null) {
      if (!isValidDateYYYYMMDD(body.date)) {
        return createErrorResponse(request, 'তারিখ (date) অবশ্যই YYYY-MM-DD ফরম্যাটে হতে হবে।', 400, rl.headers);
      }
    }

    // If-Match concurrency control (optional but recommended)
    const ifMatch = request.headers.get('if-match');
    if (ifMatch) {
      const current = advancementLogs[logIndex];
      const currentETag = buildETag(current);
      if (ifMatch !== '*' && ifMatch !== currentETag) {
        return createErrorResponse(request, 'প্রি-কন্ডিশন ব্যর্থ (ETag মিসম্যাচ)। রিফ্রেশ করে আবার চেষ্টা করুন।', 412, {
          expected: currentETag,
          received: ifMatch,
          ...rl.headers,
        });
      }
    }

    const current = advancementLogs[logIndex];
    const updated: AdvancementLog = {
      ...current,
      employeeName: body.employeeName !== undefined ? String(body.employeeName).trim() : current.employeeName,
      previousRole: body.previousRole !== undefined ? String(body.previousRole).trim() : current.previousRole,
      newRole: body.newRole !== undefined ? String(body.newRole).trim() : current.newRole,
      advancementType: body.advancementType !== undefined ? (body.advancementType as AdvancementType) : current.advancementType,
      notes: body.notes !== undefined ? String(body.notes).trim() : current.notes,
      date: body.date !== undefined ? String(body.date) : current.date,
      updatedAt: new Date().toISOString(),
    };

    advancementLogs[logIndex] = updated;

    const etag = buildETag(updated);
    return json(request, {
      success: true,
      message: 'লগের তথ্য সফলভাবে আপডেট করা হয়েছে।',
      data: updated,
    }, 200, { ETag: etag, ...(rl.headers || {}) });
  } catch (error) {
    return createErrorResponse(request, 'ডেটা আপডেট করতে সমস্যা হয়েছে।', 400, rl.headers);
  }
}

export async function PUT(request: NextRequest) {
  return updateLog(request);
}

export async function PATCH(request: NextRequest) {
  return updateLog(request);
}

// ============================================================
// ৯) DELETE: সিঙ্গেল বা বাল্ক ডিলিট (ids=...)
// ============================================================
export async function DELETE(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.ok) return createErrorResponse(request, 'Rate limit অতিক্রম করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।', 429, rl.headers);
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    let toDelete: string[] = [];
    if (idsParam && idsParam.trim()) {
      toDelete = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      toDelete = [id];
    }

    if (toDelete.length === 0) {
      return createErrorResponse(request, 'লগ আইডি (id) বা ids কুয়েরি প্যারামিটার প্রদান করা বাধ্যতামূলক।', 400, rl.headers);
    }

    const setToDelete = new Set(toDelete);
    const before = advancementLogs.length;
    advancementLogs = advancementLogs.filter((l) => !setToDelete.has(l.id));
    const after = advancementLogs.length;

    const deletedCount = before - after;
    if (deletedCount === 0) {
      return createErrorResponse(request, 'উক্ত আইডি/আইডিগুলোর কোনো লগ খুঁজে পাওয়া যায়নি।', 404, rl.headers);
    }

    return json(request, {
      success: true,
      message: 'লগ সফলভাবে মুছে ফেলা হয়েছে।',
      deletedCount,
      deletedIds: toDelete,
    }, 200, rl.headers);
  } catch (error) {
    return createErrorResponse(request, 'লগ মুছতে গিয়ে সার্ভারে সমস্যা হয়েছে।', 500, rl.headers);
  }
}