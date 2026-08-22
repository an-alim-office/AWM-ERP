"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BkashConfig {
  id: string;
  providerName: string;
  baseUrl: string;
  appKey: string;
  callbackUrl?: string;
  status: "active" | "inactive" | "pending";
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type TxType = "cash_in" | "cash_out" | "send_money" | "merchant_payment";
type TxStatus = "pending" | "success" | "failed" | "reversed";

interface Transaction {
  id: string;
  referenceId: string;
  amount: number;
  type: TxType;
  status: TxStatus;
  createdAt: string;
  customerMsisdn?: string;
  fee?: number;
  failureReason?: string;
}

interface FormState {
  baseUrl: string;
  appKey: string;
  appSecret: string; // left blank = "keep existing secret"
  callbackUrl: string;
  status: "active" | "inactive" | "pending";
}

interface FieldErrors {
  baseUrl?: string;
  appKey?: string;
  appSecret?: string;
  callbackUrl?: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  text: string;
}

const PAGE_SIZE = 10;
const AUTO_REFRESH_INTERVAL_MS = 30_000;
const MAX_RETRIES = 3;

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validate(form: FormState, isNewConfig: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.baseUrl.trim()) {
    errors.baseUrl = "Base URL is required.";
  } else {
    try {
      const url = new URL(form.baseUrl);
      if (url.protocol !== "https:") {
        errors.baseUrl = "Base URL must use https.";
      }
    } catch {
      errors.baseUrl = "Enter a valid URL, e.g. https://sandbox.pay.bka.sh";
    }
  }

  if (!form.appKey.trim()) {
    errors.appKey = "App key is required.";
  } else if (form.appKey.trim().length < 8) {
    errors.appKey = "App key looks too short — check for missing characters.";
  }

  if (isNewConfig && !form.appSecret.trim()) {
    errors.appSecret = "App secret is required for first-time setup.";
  } else if (form.appSecret && form.appSecret.trim().length < 8) {
    errors.appSecret = "App secret looks too short — check for missing characters.";
  }

  if (form.callbackUrl.trim()) {
    try {
      const url = new URL(form.callbackUrl);
      if (url.protocol !== "https:") {
        errors.callbackUrl = "Callback URL must use https.";
      }
    } catch {
      errors.callbackUrl = "Enter a valid callback URL.";
    }
  }

  return errors;
}

function detectEnvironment(baseUrl: string): "sandbox" | "production" | "unknown" {
  if (!baseUrl) return "unknown";
  const lower = baseUrl.toLowerCase();
  if (lower.includes("sandbox")) return "sandbox";
  if (lower.startsWith("https://")) return "production";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/*  Small utilities                                                    */
/* ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "symbol",
  maximumFractionDigits: 2,
});

function formatAmount(n: number) {
  // Intl gives "BDT 1,234.00" in some locales — normalize to a Taka glyph.
  return currency.format(n).replace("BDT", "৳").replace("৳ ", "৳");
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit | undefined,
  retries = MAX_RETRIES,
  signal?: AbortSignal
): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt < retries) {
    try {
      const res = await fetch(input, { ...init, signal });
      // Retry on server errors (5xx) and 429; surface 4xx immediately.
      if (res.status >= 500 || res.status === 429) {
        throw new Error(`Server responded ${res.status}`);
      }
      return res;
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
      attempt += 1;
      if (attempt < retries) {
        const backoff = 400 * 2 ** (attempt - 1); // 400ms, 800ms, ...
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

function maskKey(key: string) {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}${"•".repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
}

function exportTransactionsToCsv(rows: Transaction[]) {
  const header = ["Reference ID", "Amount", "Type", "Status", "Date"];
  const lines = rows.map((t) =>
    [t.referenceId, t.amount.toFixed(2), t.type, t.status, t.createdAt].join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bkash-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Presentational helpers                                             */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  inactive: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  reversed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          status === "active" || status === "success"
            ? "bg-emerald-500"
            : status === "failed"
            ? "bg-red-500"
            : status === "pending"
            ? "bg-amber-500"
            : status === "reversed"
            ? "bg-blue-500"
            : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "bad";
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function BkashPage() {
  const [config, setConfig] = useState<BkashConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confirmingStatusChange, setConfirmingStatusChange] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    baseUrl: "",
    appKey: "",
    appSecret: "",
    callbackUrl: "",
    status: "inactive",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TxStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ---------------- toast helpers ---------------- */

  const pushToast = useCallback((type: Toast["type"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  /* ---------------- data fetching ---------------- */

  const fetchConfig = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetchWithRetry("/api/mfs/bkash", undefined, MAX_RETRIES, signal);
      const data = await res.json();
      if (res.ok && data.data) {
        setConfig(data.data);
        setFormData(() => ({
          baseUrl: data.data.baseUrl || "",
          appKey: data.data.appKey || "",
          appSecret: "",
          callbackUrl: data.data.callbackUrl || "",
          status: data.data.status || "inactive",
        }));
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        pushToast("error", "Couldn't load configuration. Retrying failed — check your connection.");
      }
    } finally {
      setLoadingConfig(false);
    }
  }, [pushToast]);

  const fetchTransactions = useCallback(
    async (signal?: AbortSignal, silent = false) => {
      if (!silent) setLoadingTx(true);
      try {
        const res = await fetchWithRetry("/api/mfs/bkash?limit=100", undefined, MAX_RETRIES, signal);
        const data = await res.json();
        if (res.ok && data.data?.transactions) {
          setTransactions(data.data.transactions);
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          if (!silent) pushToast("error", "Couldn't load transactions.");
        }
      } finally {
        if (!silent) setLoadingTx(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    fetchConfig(controller.signal);
    fetchTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchConfig, fetchTransactions]);

  // Auto-refresh transactions silently in the background.
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const controller = new AbortController();
      fetchTransactions(controller.signal, true);
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTransactions]);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo, sortDesc]);

  /* ---------------- derived data ---------------- */

  const stats = useMemo(() => {
    const total = transactions.length;
    const success = transactions.filter((t) => t.status === "success").length;
    const failed = transactions.filter((t) => t.status === "failed").length;
    const volume = transactions
      .filter((t) => t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0);
    const successRate = total ? Math.round((success / total) * 100) : 0;
    return { total, success, failed, volume, successRate };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let rows = [...transactions];
    if (debouncedSearch) {
      rows = rows.filter((t) => t.referenceId.toLowerCase().includes(debouncedSearch));
    }
    if (typeFilter !== "all") {
      rows = rows.filter((t) => t.type === typeFilter);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((t) => t.status === statusFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      rows = rows.filter((t) => new Date(t.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // inclusive of whole day
      rows = rows.filter((t) => new Date(t.createdAt).getTime() <= to);
    }
    rows.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDesc ? -diff : diff;
    });
    return rows;
  }, [transactions, debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const pagedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ---------------- form handlers ---------------- */

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormData((f) => ({ ...f, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  }

  useEffect(() => {
    setErrors(validate(formData, !config));
  }, [formData, config]);

  const isDeactivating = config?.status === "active" && formData.status !== "active";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ baseUrl: true, appKey: true, appSecret: true, callbackUrl: true, status: true });
    const currentErrors = validate(formData, !config);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) {
      pushToast("error", "Fix the highlighted fields before saving.");
      return;
    }
    if (isDeactivating && !confirmingStatusChange) {
      setConfirmingStatusChange(true);
      return;
    }
    setConfirmingStatusChange(false);
    await submitConfig();
  }

  async function submitConfig() {
    setSaving(true);
    try {
      const payload: Partial<FormState> = { ...formData };
      if (!payload.appSecret) delete payload.appSecret; // keep existing secret server-side

      const res = await fetchWithRetry(
        "/api/mfs/bkash",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        1 // don't blind-retry a mutating request
      );
      const data = await res.json();
      if (res.ok) {
        pushToast("success", "Configuration saved successfully.");
        setFormData((f) => ({ ...f, appSecret: "" }));
        fetchConfig();
      } else {
        pushToast("error", data.error || "Failed to save configuration.");
      }
    } catch {
      pushToast("error", "Network error — configuration was not saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    try {
      const res = await fetchWithRetry("/api/mfs/bkash/test", { method: "POST" }, 1);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        pushToast("success", "Connection test passed — credentials are valid.");
      } else {
        pushToast("error", data.error || "Connection test failed.");
      }
    } catch {
      pushToast("error", "Couldn't reach the test endpoint.");
    } finally {
      setTesting(false);
    }
  }

  async function handleSyncNow() {
    setSyncing(true);
    try {
      const res = await fetchWithRetry("/api/mfs/bkash/sync", { method: "POST" }, 1);
      if (res.ok) {
        pushToast("success", "Sync started — transactions will update shortly.");
        fetchConfig();
        fetchTransactions(undefined, true);
      } else {
        const data = await res.json().catch(() => ({}));
        pushToast("error", data.error || "Sync failed to start.");
      }
    } catch {
      pushToast("error", "Couldn't reach the sync endpoint.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleCopyKey() {
    if (!formData.appKey) return;
    try {
      await navigator.clipboard.writeText(formData.appKey);
      pushToast("info", "App key copied to clipboard.");
    } catch {
      pushToast("error", "Couldn't copy — copy it manually instead.");
    }
  }

  async function handleCopyReference(referenceId: string) {
    try {
      await navigator.clipboard.writeText(referenceId);
      pushToast("info", "Reference ID copied.");
    } catch {
      pushToast("error", "Couldn't copy — copy it manually instead.");
    }
  }

  async function handleRetryTransaction(tx: Transaction) {
    setRetryingId(tx.id);
    try {
      const res = await fetchWithRetry(
        `/api/mfs/bkash/transactions/${tx.id}/retry`,
        { method: "POST" },
        1
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        pushToast("success", `Retry queued for ${tx.referenceId}.`);
        fetchTransactions(undefined, true);
        setSelectedTx(null);
      } else {
        pushToast("error", data.error || "Retry failed to start.");
      }
    } catch {
      pushToast("error", "Couldn't reach the retry endpoint.");
    } finally {
      setRetryingId(null);
    }
  }

  const environment = detectEnvironment(formData.baseUrl);

  /* ---------------- render ---------------- */

  return (
    <div
      className="min-h-screen bg-white text-gray-900 font-bold p-6"
      style={{ colorScheme: "light" }}
    >
    <div className="max-w-7xl mx-auto">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-lg shadow-lg px-4 py-3 text-sm font-bold text-white flex items-start justify-between gap-3 ${
              t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-gray-800"
            }`}
          >
            <span>{t.text}</span>
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              aria-label="Dismiss notification"
              className="opacity-80 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">bKash Integration</h1>
            {environment !== "unknown" && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  environment === "sandbox"
                    ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                }`}
              >
                {environment === "sandbox" ? "Sandbox" : "Live"}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">Configure, monitor, and reconcile your bKash MFS integration</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing || !formData.baseUrl.trim() || !formData.appKey.trim()}
            className="px-4 py-2 text-sm font-bold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? "Testing…" : "Test Connection"}
          </button>
          <button
            onClick={handleSyncNow}
            disabled={syncing || !config}
            title={!config ? "Save a configuration first to enable sync" : undefined}
            className="px-4 py-2 text-sm font-bold bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-200"
          >
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Transactions" value={String(stats.total)} />
        <StatCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          tone={stats.successRate >= 90 ? "good" : stats.successRate < 60 ? "bad" : "default"}
          hint={`${stats.success} succeeded`}
        />
        <StatCard label="Failed" value={String(stats.failed)} tone={stats.failed > 0 ? "bad" : "default"} />
        <StatCard label="Settled Volume" value={formatAmount(stats.volume)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configuration form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">API Configuration</h2>

          {loadingConfig ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-md" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="baseUrl" className="block text-sm font-bold text-gray-700 mb-1">
                  Base URL
                </label>
                <input
                  id="baseUrl"
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => updateField("baseUrl", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, baseUrl: true }))}
                  aria-invalid={!!(touched.baseUrl && errors.baseUrl)}
                  aria-describedby="baseUrl-error"
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    touched.baseUrl && errors.baseUrl
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="https://sandbox.pay.bka.sh"
                />
                {touched.baseUrl && errors.baseUrl && (
                  <p id="baseUrl-error" className="mt-1 text-xs text-red-600">
                    {errors.baseUrl}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="appKey" className="block text-sm font-bold text-gray-700 mb-1">
                  App Key
                </label>
                <div className="flex gap-2">
                  <input
                    id="appKey"
                    type="text"
                    value={formData.appKey}
                    onChange={(e) => updateField("appKey", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, appKey: true }))}
                    aria-invalid={!!(touched.appKey && errors.appKey)}
                    className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 font-mono text-sm ${
                      touched.appKey && errors.appKey
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="Enter app key"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-xs text-gray-600 hover:bg-gray-50 shrink-0"
                  >
                    Copy
                  </button>
                </div>
                {touched.appKey && errors.appKey && (
                  <p className="mt-1 text-xs text-red-600">{errors.appKey}</p>
                )}
              </div>

              <div>
                <label htmlFor="appSecret" className="block text-sm font-bold text-gray-700 mb-1">
                  App Secret {config && <span className="text-gray-400 font-bold">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    id="appSecret"
                    type={revealSecret ? "text" : "password"}
                    value={formData.appSecret}
                    onChange={(e) => updateField("appSecret", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, appSecret: true }))}
                    aria-invalid={!!(touched.appSecret && errors.appSecret)}
                    className={`w-full px-3 py-2 pr-16 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 font-mono text-sm ${
                      touched.appSecret && errors.appSecret
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder={config ? maskKey(config.appKey) : "Enter app secret"}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white px-1"
                  >
                    {revealSecret ? "Hide" : "Show"}
                  </button>
                </div>
                {touched.appSecret && errors.appSecret && (
                  <p className="mt-1 text-xs text-red-600">{errors.appSecret}</p>
                )}
              </div>

              <div>
                <label htmlFor="callbackUrl" className="block text-sm font-bold text-gray-700 mb-1">
                  Callback URL <span className="text-gray-400 font-bold">(optional)</span>
                </label>
                <input
                  id="callbackUrl"
                  type="url"
                  value={formData.callbackUrl}
                  onChange={(e) => updateField("callbackUrl", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, callbackUrl: true }))}
                  aria-invalid={!!(touched.callbackUrl && errors.callbackUrl)}
                  className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 font-mono text-sm ${
                    touched.callbackUrl && errors.callbackUrl
                      ? "border-red-400 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="https://yourapp.com/api/webhooks/bkash"
                />
                <p className="mt-1 text-xs text-gray-500 font-bold">
                  bKash will POST transaction events to this URL.
                </p>
                {touched.callbackUrl && errors.callbackUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.callbackUrl}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value as FormState["status"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {confirmingStatusChange && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="font-bold">Deactivating will stop new bKash transactions immediately.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={submitConfig}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-bold hover:bg-amber-700"
                    >
                      Confirm & Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingStatusChange(false)}
                      className="px-3 py-1.5 border border-amber-300 rounded-md text-xs font-bold text-amber-800 hover:bg-amber-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving…" : "Save Configuration"}
              </button>
            </form>
          )}
        </div>

        {/* Integration status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Integration Status</h2>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-refresh
            </label>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Provider</span>
              <span className="font-bold text-gray-900">bKash</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              {config ? <StatusBadge status={config.status} /> : <span className="text-gray-400">Not configured</span>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Sync</span>
              <span className="font-bold text-gray-900" title={config?.lastSyncAt ?? undefined}>
                {relativeTime(config?.lastSyncAt ?? null)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created</span>
              <span className="font-bold text-gray-900">
                {config?.createdAt ? new Date(config.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-bold text-gray-900">
                {config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference ID…"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search transactions by reference ID"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TxType | "all")}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              <option value="cash_in">Cash in</option>
              <option value="cash_out">Cash out</option>
              <option value="send_money">Send money</option>
              <option value="merchant_payment">Merchant payment</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TxStatus | "all")}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
            <label className="flex items-center gap-1 text-xs font-bold text-gray-500">
              From
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter from date"
              />
            </label>
            <label className="flex items-center gap-1 text-xs font-bold text-gray-500">
              To
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter to date"
              />
            </label>
            {(dateFrom || dateTo || search || typeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => exportTransactionsToCsv(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reference ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => setSortDesc((s) => !s)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    Date {sortDesc ? "↓" : "↑"}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingTx ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pagedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-bold">
                    {transactions.length === 0
                      ? "No transactions yet — they'll appear here once bKash starts sending activity."
                      : "No transactions match your filters."}
                  </td>
                </tr>
              ) : (
                pagedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                      {tx.referenceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 capitalize">
                      {tx.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyReference(tx.referenceId);
                        }}
                        className="text-gray-400 hover:text-gray-700 font-bold text-xs"
                        aria-label={`Copy reference ${tx.referenceId}`}
                      >
                        Copy
                      </button>
                      {tx.status === "failed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryTransaction(tx);
                          }}
                          disabled={retryingId === tx.id}
                          className="ml-3 text-blue-600 hover:text-blue-800 font-bold text-xs disabled:opacity-50"
                        >
                          {retryingId === tx.id ? "Retrying…" : "Retry"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loadingTx && filteredTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTransactions.length)} of{" "}
              {filteredTransactions.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction detail modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Transaction details"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 font-bold">Reference ID</dt>
                <dd className="text-gray-900 font-bold font-mono">{selectedTx.referenceId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 font-bold">Amount</dt>
                <dd className="text-gray-900 font-bold">{formatAmount(selectedTx.amount)}</dd>
              </div>
              {selectedTx.fee !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 font-bold">Fee</dt>
                  <dd className="text-gray-900 font-bold">{formatAmount(selectedTx.fee)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500 font-bold">Type</dt>
                <dd className="text-gray-900 font-bold capitalize">{selectedTx.type.replace(/_/g, " ")}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500 font-bold">Status</dt>
                <dd>
                  <StatusBadge status={selectedTx.status} />
                </dd>
              </div>
              {selectedTx.customerMsisdn && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 font-bold">Customer</dt>
                  <dd className="text-gray-900 font-bold font-mono">{selectedTx.customerMsisdn}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500 font-bold">Date</dt>
                <dd className="text-gray-900 font-bold">{new Date(selectedTx.createdAt).toLocaleString()}</dd>
              </div>
              {selectedTx.status === "failed" && selectedTx.failureReason && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <dt className="text-red-700 font-bold text-xs mb-1">Failure reason</dt>
                  <dd className="text-red-800 font-bold text-sm">{selectedTx.failureReason}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleCopyReference(selectedTx.referenceId)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                Copy Reference
              </button>
              {selectedTx.status === "failed" && (
                <button
                  onClick={() => handleRetryTransaction(selectedTx)}
                  disabled={retryingId === selectedTx.id}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {retryingId === selectedTx.id ? "Retrying…" : "Retry Transaction"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
