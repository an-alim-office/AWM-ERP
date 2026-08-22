import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const SUPPORTED_MODULES = [
  "bkash",
  "nagad",
  "rocket",
  "surecash",
  "upay",
  "agent-dashboard",
  "agent-onboarding",
  "cash-in-out",
  "merchant-payment",
  "send-money",
  "commission",
  "settlement",
  "reconciliation",
  "float-balance",
  "transaction-limits",
  "transaction-reports",
  "fraud-aml-monitoring",
  "bb-compliance",
] as const;

type SupportedModule = (typeof SUPPORTED_MODULES)[number];

function generateReferenceId(prefix: string = "MFS"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function validateAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0 && amount <= 1000000;
}

function validatePhone(phone: unknown): phone is string {
  return typeof phone === "string" && /^01[0-9]{9}$/.test(phone);
}

function maskSecret(value?: string | null) {
  if (!value) return "";
  return "***" + value.slice(-4);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function getSlugFromRequest(request: NextRequest) {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function isSupportedModule(slug: string): slug is SupportedModule {
  return SUPPORTED_MODULES.includes(slug as SupportedModule);
}

async function ensureAuth(_request: NextRequest) {
  return { ok: true, user: { id: "admin_1", role: "admin" } };
}

async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME || "AWM-ERP");
}

async function handleBkash(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_configs");

  if (request.method === "GET") {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const config = await collection.findOne({ module: "bkash" });

    return json({
      success: true,
      data: {
        id: config?._id?.toString() || "config_1",
        providerName: "bKash",
        baseUrl: config?.baseUrl || process.env.BKASH_BASE_URL || "",
        appKey: maskSecret(config?.appKey || process.env.BKASH_APP_KEY || ""),
        appSecret: maskSecret(config?.appSecret || process.env.BKASH_APP_SECRET || ""),
        status: config?.status || "active",
        lastSyncAt: new Date().toISOString(),
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: config?.updatedAt || new Date().toISOString(),
        transactions: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
          id: `tx_${i + 1}`,
          referenceId: generateReferenceId("BK"),
          amount: Math.floor(Math.random() * 10000) + 100,
          type: ["cash_in", "cash_out", "send_money", "merchant_payment"][Math.floor(Math.random() * 4)],
          status: ["pending", "success", "failed", "reversed"][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.baseUrl !== "string" || typeof body.appKey !== "string") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const now = new Date();

    await collection.updateOne(
      { module: "bkash" },
      {
        $set: {
          module: "bkash",
          providerName: "bKash",
          baseUrl: body.baseUrl,
          appKey: body.appKey,
          appSecret: typeof body.appSecret === "string" ? body.appSecret : "",
          status: typeof body.status === "string" ? body.status : "inactive",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Configuration saved successfully",
      data: {
        id: "config_1",
        providerName: "bKash",
        baseUrl: body.baseUrl,
        appKey: maskSecret(body.appKey),
        status: body.status || "inactive",
        updatedAt: now.toISOString(),
      },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleNagad(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_configs");

  if (request.method === "GET") {
    const config = await collection.findOne({ module: "nagad" });

    return json({
      success: true,
      data: {
        id: config?._id?.toString() || "config_2",
        providerName: "Nagad",
        baseUrl: config?.baseUrl || process.env.NAGAD_BASE_URL || "",
        apiKey: maskSecret(config?.apiKey || process.env.NAGAD_API_KEY || ""),
        status: config?.status || "active",
        lastSyncAt: new Date().toISOString(),
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: config?.updatedAt || new Date().toISOString(),
        transactions: Array.from({ length: 10 }, (_, i) => ({
          id: `tx_${i + 1}`,
          referenceId: generateReferenceId("NG"),
          amount: Math.floor(Math.random() * 10000) + 100,
          type: ["cash_in", "cash_out", "send_money", "merchant_payment"][Math.floor(Math.random() * 4)],
          status: ["pending", "success", "failed", "reversed"][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.baseUrl !== "string" || typeof body.apiKey !== "string") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const now = new Date();

    await collection.updateOne(
      { module: "nagad" },
      {
        $set: {
          module: "nagad",
          providerName: "Nagad",
          baseUrl: body.baseUrl,
          apiKey: body.apiKey,
          status: typeof body.status === "string" ? body.status : "inactive",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Configuration saved successfully",
      data: {
        id: "config_2",
        providerName: "Nagad",
        baseUrl: body.baseUrl,
        apiKey: maskSecret(body.apiKey),
        status: body.status || "inactive",
        updatedAt: now.toISOString(),
      },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleRocket(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_configs");

  if (request.method === "GET") {
    const config = await collection.findOne({ module: "rocket" });

    return json({
      success: true,
      data: {
        id: config?._id?.toString() || "config_3",
        providerName: "Rocket",
        baseUrl: config?.baseUrl || process.env.ROCKET_BASE_URL || "",
        apiKey: maskSecret(config?.apiKey || process.env.ROCKET_API_KEY || ""),
        status: config?.status || "active",
        lastSyncAt: new Date().toISOString(),
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: config?.updatedAt || new Date().toISOString(),
        transactions: Array.from({ length: 10 }, (_, i) => ({
          id: `tx_${i + 1}`,
          referenceId: generateReferenceId("RK"),
          amount: Math.floor(Math.random() * 10000) + 100,
          type: ["cash_in", "cash_out", "send_money", "merchant_payment"][Math.floor(Math.random() * 4)],
          status: ["pending", "success", "failed", "reversed"][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.baseUrl !== "string" || typeof body.apiKey !== "string") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const now = new Date();

    await collection.updateOne(
      { module: "rocket" },
      {
        $set: {
          module: "rocket",
          providerName: "Rocket",
          baseUrl: body.baseUrl,
          apiKey: body.apiKey,
          status: typeof body.status === "string" ? body.status : "inactive",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Configuration saved successfully",
      data: {
        id: "config_3",
        providerName: "Rocket",
        baseUrl: body.baseUrl,
        apiKey: maskSecret(body.apiKey),
        status: body.status || "inactive",
        updatedAt: now.toISOString(),
      },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleSureCash(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_configs");

  if (request.method === "GET") {
    const config = await collection.findOne({ module: "surecash" });

    return json({
      success: true,
      data: {
        id: config?._id?.toString() || "config_4",
        providerName: "SureCash",
        baseUrl: config?.baseUrl || process.env.SURECASH_BASE_URL || "",
        apiKey: maskSecret(config?.apiKey || process.env.SURECASH_API_KEY || ""),
        status: config?.status || "active",
        lastSyncAt: new Date().toISOString(),
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: config?.updatedAt || new Date().toISOString(),
        transactions: Array.from({ length: 10 }, (_, i) => ({
          id: `tx_${i + 1}`,
          referenceId: generateReferenceId("SC"),
          amount: Math.floor(Math.random() * 10000) + 100,
          type: ["cash_in", "cash_out", "send_money", "merchant_payment"][Math.floor(Math.random() * 4)],
          status: ["pending", "success", "failed", "reversed"][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.baseUrl !== "string" || typeof body.apiKey !== "string") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const now = new Date();

    await collection.updateOne(
      { module: "surecash" },
      {
        $set: {
          module: "surecash",
          providerName: "SureCash",
          baseUrl: body.baseUrl,
          apiKey: body.apiKey,
          status: typeof body.status === "string" ? body.status : "inactive",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Configuration saved successfully",
      data: {
        id: "config_4",
        providerName: "SureCash",
        baseUrl: body.baseUrl,
        apiKey: maskSecret(body.apiKey),
        status: body.status || "inactive",
        updatedAt: now.toISOString(),
      },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleUpay(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_configs");

  if (request.method === "GET") {
    const config = await collection.findOne({ module: "upay" });

    return json({
      success: true,
      data: {
        id: config?._id?.toString() || "config_5",
        providerName: "Upay",
        baseUrl: config?.baseUrl || process.env.UPAY_BASE_URL || "",
        apiKey: maskSecret(config?.apiKey || process.env.UPAY_API_KEY || ""),
        status: config?.status || "active",
        lastSyncAt: new Date().toISOString(),
        createdAt: config?.createdAt || new Date().toISOString(),
        updatedAt: config?.updatedAt || new Date().toISOString(),
        transactions: Array.from({ length: 10 }, (_, i) => ({
          id: `tx_${i + 1}`,
          referenceId: generateReferenceId("UP"),
          amount: Math.floor(Math.random() * 10000) + 100,
          type: ["cash_in", "cash_out", "send_money", "merchant_payment"][Math.floor(Math.random() * 4)],
          status: ["pending", "success", "failed", "reversed"][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        })),
      },
    });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.baseUrl !== "string" || typeof body.apiKey !== "string") {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const now = new Date();

    await collection.updateOne(
      { module: "upay" },
      {
        $set: {
          module: "upay",
          providerName: "Upay",
          baseUrl: body.baseUrl,
          apiKey: body.apiKey,
          status: typeof body.status === "string" ? body.status : "inactive",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Configuration saved successfully",
      data: {
        id: "config_5",
        providerName: "Upay",
        baseUrl: body.baseUrl,
        apiKey: maskSecret(body.apiKey),
        status: body.status || "inactive",
        updatedAt: now.toISOString(),
      },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleAgentDashboard(request: NextRequest) {
  if (request.method !== "GET") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  return json({
    success: true,
    data: {
      stats: {
        totalAgents: 1250,
        activeAgents: 980,
        inactiveAgents: 220,
        pendingAgents: 50,
        totalTransactions: 125000,
        totalVolume: 450000000,
        todayTransactions: 3500,
        todayVolume: 12500000,
      },
      agents: [],
      alerts: [],
    },
  });
}

async function handleAgentOnboarding(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("agent_onboarding");

  if (request.method === "GET") {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (statusFilter) query.status = statusFilter;

    const agents = await collection.find(query).sort({ submittedAt: -1 }).toArray();
    return json({ success: true, data: agents });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.agentId || !["approve", "reject"].includes(body.action)) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { agentId: body.agentId },
      {
        $set: {
          status: body.action === "approve" ? "approved" : "rejected",
          reviewedAt: new Date(),
          reviewedBy: "admin_1",
        },
      }
    );

    return json({
      success: true,
      message: `Agent ${body.action}ed successfully`,
      data: { agentId: body.agentId, action: body.action, processedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleCashInOut(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("mfs_transactions");
  const url = new URL(request.url);
  const typeFilter = url.searchParams.get("type");

  if (request.method === "GET") {
    const query: Record<string, unknown> = {};
    if (typeFilter === "cash_in" || typeFilter === "cash_out") query.type = typeFilter;
    const transactions = await collection.find(query).sort({ createdAt: -1 }).limit(20).toArray();
    return json({ success: true, data: transactions });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (
      !body ||
      !["cash_in", "cash_out"].includes(body.type) ||
      !validateAmount(body.amount) ||
      !validatePhone(body.agentPhone) ||
      !validatePhone(body.customerPhone)
    ) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const amount = body.amount;
    const transaction = {
      id: `tx_${Date.now()}`,
      referenceId: generateReferenceId("CI"),
      type: body.type,
      amount,
      fee: amount * 0.01,
      total: amount * 1.01,
      agentPhone: body.agentPhone,
      customerPhone: body.customerPhone,
      status: "pending",
      createdAt: new Date(),
    };

    await collection.insertOne(transaction);
    return json({ success: true, message: "Transaction created", data: transaction }, 201);
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleMerchantPayment(request: NextRequest) {
  if (request.method !== "GET") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  const db = await getDb();
  const collection = db.collection("merchant_payments");
  const payments = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
  return json({ success: true, data: payments });
}

async function handleSendMoney(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("send_money_transactions");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      !validateAmount(body.amount) ||
      !validatePhone(body.senderPhone) ||
      !validatePhone(body.receiverPhone)
    ) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const amount = body.amount;
    const transaction = {
      id: `tx_${Date.now()}`,
      referenceId: generateReferenceId("SM"),
      senderPhone: body.senderPhone,
      receiverPhone: body.receiverPhone,
      amount,
      fee: amount * 0.005,
      total: amount * 1.005,
      status: "pending",
      createdAt: new Date(),
    };

    await collection.insertOne(transaction);
    return json({ success: true, message: "Send money transaction created", data: transaction }, 201);
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleCommission(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("commission_rules");

  if (request.method === "GET") {
    const rules = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rules });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || !body.name || !body.transactionType) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const rule = {
      id: `rule_${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(rule);
    return json({ success: true, message: "Commission rule created successfully", data: rule }, 201);
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleSettlement(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("settlements");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.settlementId || !body.action) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { settlementId: body.settlementId },
      { $set: { action: body.action, processedAt: new Date() } }
    );

    return json({
      success: true,
      message: "Settlement processed successfully",
      data: { settlementId: body.settlementId, action: body.action, processedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleReconciliation(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("reconciliations");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.id || !body.action) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { id: body.id },
      { $set: { action: body.action, note: body.note || "", resolvedAt: new Date() } }
    );

    return json({
      success: true,
      message: "Discrepancy resolved successfully",
      data: { id: body.id, action: body.action, note: body.note, resolvedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleFloatBalance(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("float_balances");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ updatedAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.agentId || !body.action || !body.amount) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { agentId: body.agentId },
      { $set: { action: body.action, amount: body.amount, adjustedAt: new Date() } },
      { upsert: true }
    );

    return json({
      success: true,
      message: "Balance adjusted successfully",
      data: { agentId: body.agentId, action: body.action, amount: body.amount, adjustedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleTransactionLimits(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("transaction_limits");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || !body.name || !body.transactionType) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    const rule = {
      id: `limit_${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(rule);
    return json({ success: true, message: "Limit rule created successfully", data: rule }, 201);
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleTransactionReports(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("transaction_reports");

  if (request.method === "GET") {
    const url = new URL(request.url);
    const typeFilter = url.searchParams.get("type");
    const statusFilter = url.searchParams.get("status");
    const search = url.searchParams.get("search") || "";

    const query: Record<string, unknown> = {};
    if (typeFilter) query.type = typeFilter;
    if (statusFilter) query.status = statusFilter;

    const rows = await collection.find(query).sort({ createdAt: -1 }).toArray();

    const filtered = rows.filter((tx: any) => {
      if (!search) return true;
      return (
        String(tx.referenceId || "").toLowerCase().includes(search.toLowerCase()) ||
        String(tx.customerPhone || "").includes(search)
      );
    });

    return json({ success: true, data: filtered });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleFraudAmlMonitoring(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("fraud_aml_alerts");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.id || !body.action) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { id: body.id },
      { $set: { action: body.action, status: body.status || "resolved", note: body.note || "", resolvedAt: new Date() } }
    );

    return json({
      success: true,
      message: "Alert resolved successfully",
      data: { id: body.id, action: body.action, status: body.status, note: body.note, resolvedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

async function handleBbCompliance(request: NextRequest) {
  const db = await getDb();
  const collection = db.collection("bb_compliance");

  if (request.method === "GET") {
    const rows = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return json({ success: true, data: rows });
  }

  if (request.method === "PUT") {
    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return json({ success: false, error: "Invalid request body" }, 400);
    }

    await collection.updateOne(
      { id: body.id },
      { $set: { status: body.status, notes: body.notes, updatedAt: new Date() } }
    );

    return json({
      success: true,
      message: "Compliance status updated successfully",
      data: { id: body.id, status: body.status, notes: body.notes, updatedAt: new Date().toISOString() },
    });
  }

  return json({ success: false, error: "Method not allowed" }, 405);
}

export async function GET(request: NextRequest) {
  const slug = getSlugFromRequest(request);

  if (!slug || !isSupportedModule(slug)) {
    return json({ success: false, error: "Module not found" }, 404);
  }

  const auth = await ensureAuth(request);
  if (!auth.ok) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const handlers: Record<SupportedModule, (req: NextRequest) => Promise<NextResponse>> = {
      bkash: handleBkash,
      nagad: handleNagad,
      rocket: handleRocket,
      surecash: handleSureCash,
      upay: handleUpay,
      "agent-dashboard": handleAgentDashboard,
      "agent-onboarding": handleAgentOnboarding,
      "cash-in-out": handleCashInOut,
      "merchant-payment": handleMerchantPayment,
      "send-money": handleSendMoney,
      commission: handleCommission,
      settlement: handleSettlement,
      reconciliation: handleReconciliation,
      "float-balance": handleFloatBalance,
      "transaction-limits": handleTransactionLimits,
      "transaction-reports": handleTransactionReports,
      "fraud-aml-monitoring": handleFraudAmlMonitoring,
      "bb-compliance": handleBbCompliance,
    };

    return await handlers[slug](request);
  } catch (error) {
    console.error(`Error handling ${slug}:`, error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function POST(request: NextRequest) {
  const slug = getSlugFromRequest(request);

  if (!slug || !isSupportedModule(slug)) {
    return json({ success: false, error: "Module not found" }, 404);
  }

  const auth = await ensureAuth(request);
  if (!auth.ok) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const handlers: Partial<Record<SupportedModule, (req: NextRequest) => Promise<NextResponse>>> = {
      bkash: handleBkash,
      nagad: handleNagad,
      rocket: handleRocket,
      surecash: handleSureCash,
      upay: handleUpay,
      "cash-in-out": handleCashInOut,
      "send-money": handleSendMoney,
      commission: handleCommission,
      "transaction-limits": handleTransactionLimits,
    };

    const handler = handlers[slug];
    if (!handler) {
      return json({ success: false, error: "Method not allowed for this module" }, 405);
    }

    return await handler(request);
  } catch (error) {
    console.error(`Error handling ${slug}:`, error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function PUT(request: NextRequest) {
  const slug = getSlugFromRequest(request);

  if (!slug || !isSupportedModule(slug)) {
    return json({ success: false, error: "Module not found" }, 404);
  }

  const auth = await ensureAuth(request);
  if (!auth.ok) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const handlers: Partial<Record<SupportedModule, (req: NextRequest) => Promise<NextResponse>>> = {
      "agent-onboarding": handleAgentOnboarding,
      settlement: handleSettlement,
      reconciliation: handleReconciliation,
      "float-balance": handleFloatBalance,
      "fraud-aml-monitoring": handleFraudAmlMonitoring,
      "bb-compliance": handleBbCompliance,
    };

    const handler = handlers[slug];
    if (!handler) {
      return json({ success: false, error: "Method not allowed for this module" }, 405);
    }

    return await handler(request);
  } catch (error) {
    console.error(`Error handling ${slug}:`, error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function DELETE() {
  return json({ success: false, error: "DELETE method not supported" }, 405);
}