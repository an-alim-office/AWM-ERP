"use client";
 
import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
 
type ApprovalStatus = "Approved" | "Pending" | "Review" | "Rejected";
type StatusFilter = "All" | "Active" | "Unactive" | "Delayed";
type CurrencyCode = string;
 
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
  currency: CurrencyCode;
  nationality: string;
  active: boolean;
  unactive: boolean;
  delayed: boolean;
  paymentMethod: "Bank" | "Cash" | "Mobile Banking" | "Card";
  approvalStatus: ApprovalStatus;
  remarks: string;
  date: string;
  lastUpdated: string;
};
 
type ApiResponse = {
  ok: boolean;
  generatedAt?: string;
  data: AdvanceSheetRow | AdvanceSheetRow[];
  summary?: {
    totalRows: number;
    active: number;
    unactive: number;
    delayed: number;
    totalNetAmount: number;
  };
};
 

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

/**
 * Central utility for international (English) digit formatting.
 * Uses the en-IN locale so values keep their lakh-grouping
 * (##,##,###) but render with ASCII digits — e.g. ৮,৫৯,০০০ -> 8,59,000.
 * Use this for any plain number shown to the user; formatMoney() already
 * uses it for currency values.
 */
function formatInternationalNumber(value: number, fractionDigits: number = 0): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
 
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
 
function formatMoney(value: number, currency: CurrencyCode = "BDT") {
  if (currency === "BDT") return moneyFormatter.format(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
 function formatCurrency(value: number, currency: string) {
  switch (currency) {
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);

    case "SAR":
      return new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency: "SAR",
        maximumFractionDigits: 2,
      }).format(value);

    default:
      return value;
  }
}
function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
 
const TABLE_COLUMNS = [
  { key: "sl", label: "SL", width: 76, minWidth: 60 },
  { key: "profile", label: "Profile", width: 112, minWidth: 92 },
  { key: "id", label: "ID", width: 130, minWidth: 96 },
  { key: "smartId", label: "SmartID", width: 150, minWidth: 112 },
  { key: "name", label: "Name", width: 210, minWidth: 150 },
  { key: "position", label: "Position", width: 190, minWidth: 140 },
  { key: "department", label: "Department", width: 170, minWidth: 130 },
  { key: "advance1", label: "Advance1", width: 150, minWidth: 118 },
  { key: "advance2", label: "Advance2", width: 150, minWidth: 118 },
  { key: "advance3", label: "Advance3", width: 150, minWidth: 118 },
  { key: "advance4", label: "Advance4", width: 150, minWidth: 118 },
  { key: "netAmount", label: "NetAmount", width: 170, minWidth: 135 },
  { key: "nationality", label: "Nationality", width: 155, minWidth: 120 },
  { key: "status", label: "Active / Unactive", width: 245, minWidth: 190 },
  { key: "approval", label: "Approval", width: 145, minWidth: 116 },
  { key: "payment", label: "Payment", width: 150, minWidth: 116 },
  { key: "remarks", label: "Remarks", width: 250, minWidth: 170 },
  { key: "date", label: "Date", width: 145, minWidth: 112 },
  { key: "lastUpdated", label: "LastUpdated", width: 185, minWidth: 145 },
  { key: "edit", label: "Edit", width: 110, minWidth: 92 },
  { key: "cancel", label: "Cancel", width: 120, minWidth: 96 },
] as const;
 
type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];
 
const DEFAULT_COLUMN_WIDTHS = TABLE_COLUMNS.reduce(
  (acc, column) => {
    acc[column.key] = column.width;
    return acc;
  },
  {} as Record<TableColumnKey, number>,
);
 
const DEFAULT_PROFESSION_COLORS = [
  "#7c3aed",
  "#0f766e",
  "#2563eb",
  "#db2777",
  "#b45309",
  "#059669",
  "#dc2626",
  "#0891b2",
  "#4f46e5",
  "#9333ea",
];
 
function getApprovalBadgeClass(status: ApprovalStatus) {
  switch (status) {
    case "Approved":


    return "border-emerald-400/40 bg-amber-400/10 text-emerald-200 shadow-emerald-500/10";

    case "Pending":
      return "border-amber-400/40 bg-amber-400/10 text-amber-800 shadow-amber-500/10";
    case "Review":
      return "border-sky-400/40 bg-sky-400/10 text-sky-700 shadow-sky-500/10";
    case "Rejected":
      return "border-rose-400/40 bg-amber-100/80 text-rose-700 shadow-rose-500/10";
    default:
      return "border-amber-300/60 bg-amber-100/80 text-slate-950";
  }
}
 
const CURRENCY_META_FALLBACK: Record<CurrencyCode, string> = {
  BDT: "Bangladeshi Taka",
  SAR: "Saudi Riyal",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  AED: "UAE Dirham",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  JPY: "Japanese Yen",
  SGD: "Singapore Dollar",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  IDR: "Indonesian Rupiah",
  QAR: "Qatari Riyal",
  KWD: "Kuwaiti Dinar",
  BHD: "Bahraini Dinar",
  ZAR: "South African Rand",
  NOK: "Norwegian Krone",
  SEK: "Swedish Krona",
  DKK: "Danish Krone",
  TRY: "Turkish Lira",
  NGN: "Nigerian Naira",
  PHP: "Philippine Peso",
  LKR: "Sri Lankan Rupee",
  NPR: "Nepalese Rupee",
  KRW: "South Korean Won",
  HKD: "Hong Kong Dollar",
  RUB: "Russian Ruble",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  NZD: "New Zealand Dollar",
  EGP: "Egyptian Pound",
};
 
async function fetchCurrencySymbols(): Promise<Record<CurrencyCode, string>> {
  try {
    const resp = await fetch("https://api.exchangerate.host/symbols", {
      cache: "force-cache",
    });
    if (!resp.ok) throw new Error("symbols fetch failed");
    const data = await resp.json();
    if (data && data.symbols) {
      const map: Record<string, string> = {};
      for (const k of Object.keys(data.symbols)) {
        map[k] = data.symbols[k]?.description || k;
      }
      if (!map["BDT"]) map["BDT"] = "Bangladeshi Taka";
      return map;
    }
  } catch {
    // ignore
  }
  return CURRENCY_META_FALLBACK;
}
 
type RatesMap = Record<CurrencyCode, number>;
function useExchangeRates(base: CurrencyCode) {
  const [rates, setRates] = useState<RatesMap>({ [base]: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [symbols, setSymbols] = useState<Record<CurrencyCode, string>>(
    CURRENCY_META_FALLBACK,
  );
 
  useEffect(() => {
    let mounted = true;
    fetchCurrencySymbols().then((s) => {
      if (mounted) setSymbols(s);
    });
    return () => {
      mounted = false;
    };
  }, []);
 
  const loadRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
        base,
      )}`;
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) throw new Error("Failed to load rates");
      const json = await resp.json();
      const next: RatesMap = { [base]: 1 };
      if (json && json.rates) {
        for (const k of Object.keys(json.rates)) {
          next[k] = Number(json.rates[k]) || 0;
        }
      }
      setRates(next);
      setUpdatedAt(
        json?.date
          ? new Date(json.date).toLocaleString("en-GB")
          : new Date().toLocaleString("en-GB"),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rate load error");
    } finally {
      setLoading(false);
    }
  }, [base]);
 
  useEffect(() => {
    loadRates();
    const id = setInterval(loadRates, 1000 * 60 * 10);
    return () => clearInterval(id);
  }, [loadRates]);
 
  function convertToDisplay(amount: number, fromCurrency: CurrencyCode) {
    if (!amount || !Number.isFinite(amount)) return 0;
    if (fromCurrency === base) return amount;
    const r = rates[fromCurrency];
    if (!r || r <= 0) return amount;
    return amount / r;
  }
 
  return {
    base,
    rates,
    loading,
    error,
    updatedAt,
    symbols,
    supportedCodes: useMemo(() => Object.keys(symbols).sort(), [symbols]),
    convertToDisplay,
  };
}
 
function useOnClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void,
) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      const target = e.target as Node;
      for (const r of refs) {
        if (!r.current) continue;
        if (r.current.contains(target)) return;
      }
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [refs, handler]);
}
 
function CrownIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8.2c0-.9 1.05-1.38 1.72-.79l3.5 3.07 2.86-5.73a1.03 1.03 0 0 1 1.84 0l2.86 5.73 3.5-3.07c.67-.59 1.72-.11 1.72.79v8.35A2.45 2.45 0 0 1 18.55 19H5.45A2.45 2.45 0 0 1 3 16.55V8.2Z"
        fill="url(#goldCrown)"
      />
      <path d="M5 21h14" stroke="#FDE68A" strokeWidth="1.7" strokeLinecap="round" />
      <defs>
        <linearGradient id="goldCrown" x1="3" y1="4" x2="21" y2="19">
          <stop stopColor="#FFF7AD" />
          <stop offset="0.45" stopColor="#FACC15" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}
 
function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="M19 15l.8 2.7L22.5 18l-2.7.8L19 21.5l-.8-2.7-2.7-.8 2.7-.8L19 15Z" />
    </svg>
  );
}
 
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.47 0 .2 5.27.2 11.84c0 2.09.55 4.08 1.6 5.87L0 24l6.45-1.67a11.8 11.8 0 0 0 5.59 1.42h.01c6.57 0 11.84-5.27 11.84-11.84a11.8 11.8 0 0 0-3.37-8.43ZM12.04 21.3a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.82 1 .98-3.72-.22-.38a9.4 9.4 0 0 1-1.43-4.9c0-5.18 4.21-9.39 9.39-9.39 2.51 0 4.86.98 6.63 2.76a9.34 9.34 0 0 1 2.75 6.63c0 5.18-4.21 9.39-9.39 9.39Zm5.45-7.02c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15s-.77.98-.94 1.18-.35.22-.64.07a7.7 7.7 0 0 1-2.27-1.4 8.5 8.5 0 0 1-1.56-1.93c-.16-.28-.02-.43.12-.58.12-.12.27-.3.4-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.07-.15-.67-1.6-.92-2.18-.24-.58-.49-.5-.67-.5-.17 0-.37-.01-.57-.01s-.52.08-.79.38c-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}
 
function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l6-3 6 3V7" />
      <path d="M14 2l6 6" />
      <path d="M20 8h-6V2" />
    </svg>
  );
}
 
function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.02 2 10.98c0 2.725 1.293 5.178 3.39 6.862v3.558l3.1-1.704c1.07.3 2.212.463 3.41.463 5.523 0 10-4.02 10-8.98C21.9 6.02 17.523 2 12 2Zm-.503 6.53 2.568 2.736 4.418-2.736-4.418 4.736-2.568-2.736-4.515 2.736 4.515-4.736Z" />
    </svg>
  );
}
 
function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M9.03 15.44 8.87 19c.33 0 .47-.14.64-.3l1.54-1.48 3.2 2.35c.59.33 1.01.16 1.17-.54l2.12-9.95c.19-.88-.32-1.23-.9-1.02L4.53 10.2c-.86.33-.85.8-.15 1.01l3.12.97 7.23-4.56c.34-.23.66-.1.4.14" />
    </svg>
  );
}
 
function ShareIconSmall() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}
 
function StatusPill({
  active,
  unactive,
  delayed,
}: {
  active: boolean;
  unactive: boolean;
  delayed: boolean;
}) {
  return (
    <div className="flex min-w-[230px] flex-wrap gap-2">
      <span
        className={classNames(
          "rounded-full border px-2.5 py-1 text-xs font-semibold",
          active
            ? "border-emerald-300/50 bg-emerald-400/15 text-slate-950"
            : "border-amber-200/50 bg-amber-50/70 text-slate-500",
        )}
      >
        Active
      </span>
      <span
        className={classNames(
          "rounded-full border px-2.5 py-1 text-xs font-semibold",
          unactive
            ? "border-slate-300/40 bg-slate-300/10 text-slate-700"
            : "border-amber-200/50 bg-amber-50/70 text-slate-500",
        )}
      >
        Unactive
      </span>
      <span
        className={classNames(
          "rounded-full border px-2.5 py-1 text-xs font-semibold",
          delayed
            ? "border-rose-300/50 bg-rose-400/15 text-rose-700"
            : "border-amber-200/50 bg-amber-50/70 text-slate-500",
        )}
      >
        Delayed
      </span>
    </div>
  );
}
 
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <tr key={index} className="border-b border-amber-200/50">
          {Array.from({ length: 21 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded-full bg-amber-100/80" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
 
function VipMetricCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "gold" | "emerald" | "rose" | "sky";
}) {
  const toneClass = {
    gold: "from-[#1f1607] via-[#8a651d] to-[#f8dfa2] text-yellow-100 ring-yellow-200/45",
    emerald:
      "from-[#071f19] via-[#0f766e] to-[#a7f3d0] text-emerald-50 ring-emerald-200/35",
    rose: "from-[#2a0712] via-[#be123c] to-[#fecdd3] text-rose-50 ring-rose-200/35",
    sky: "from-[#07182f] via-[#0369a1] to-[#bae6fd] text-sky-50 ring-sky-200/35",
  }[tone];
 
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.9)] ring-1 backdrop-blur-xl",
        toneClass,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/78">{title}</p>
        <span className="rounded-full border border-white/30 bg-white/15 p-2 text-yellow-100 shadow-inner">
          <SparkleIcon />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white drop-shadow-sm">{value}</p>
      <p className="mt-1 text-xs font-medium text-white/68">{subtitle}</p>
    </div>
  );
}
 
function Modal({
  open,
  onClose,
  children,
  title,
  primaryActionLabel,
  primaryActionFormId,
  primaryActionDisabled,
  rightExtras,
  fullScreen,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  primaryActionFormId?: string;
  primaryActionDisabled?: boolean;
  rightExtras?: React.ReactNode;
  fullScreen?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (primaryActionFormId) {
          e.preventDefault();
          (document.getElementById(primaryActionFormId) as HTMLFormElement | null)?.requestSubmit();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, primaryActionFormId]);
 
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);
 
  if (!open) return null;
 
  return (
    <div
      aria-modal="true"
      role="dialog"
      className={classNames(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 no-print",
        fullScreen && "p-0",
      )}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-md transition-opacity"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={classNames(
          "relative z-[101] max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-200/50 bg-white shadow-[0_30px_90px_-30px_rgba(180,83,9,0.35)] ring-1 ring-amber-200/40",
          fullScreen && "h-screen w-screen max-w-none rounded-none border-0 ring-0",
        )}
      >
        <div className="relative bg-gradient-to-r from-amber-100 via-white to-amber-200 px-6 py-4 sm:px-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
          <h3 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl text-center">
            {title}
          </h3>
 
          {rightExtras ? (
            <div className="absolute right-24 top-2 hidden md:block">{rightExtras}</div>
          ) : null}
 
          {primaryActionFormId ? (
            <button
              type="submit"
              form={primaryActionFormId}
              disabled={primaryActionDisabled}
              className="absolute left-4 top-3 rounded-full border border-amber-500/45 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 px-3 py-1 text-xs font-bold text-slate-950 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryActionLabel ?? "Save"}
            </button>
          ) : null}
 
          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-full border border-amber-300/50 bg-amber-100/80 px-3 py-1 text-xs font-bold text-slate-950/80 hover:bg-amber-200/90"
          >
            Close
          </button>
        </div>
        <div className={classNames("overflow-y-auto p-4 sm:p-6", fullScreen && "h-[calc(100vh-56px)]")}>
          {children}
        </div>
      </div>
    </div>
  );
}
 
function ShareMenu({
  open,
  anchorRef,
  onClose,
  buildShareText,
  onNotify,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  buildShareText: () => string;
  onNotify?: (msg: string, tone?: "success" | "error" | "info") => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOnClickOutside([panelRef, anchorRef as any], onClose);
 
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
 
  useEffect(() => {
    if (!open) return;
    function compute() {
      const btn = anchorRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const estimatedWidth = 256;
      let left = Math.min(
        window.innerWidth - 8 - estimatedWidth,
        Math.max(8, r.left + r.width - estimatedWidth),
      );
      let top = r.bottom + 8;
 
      setPos({ top, left });
 
      requestAnimationFrame(() => {
        const el = panelRef.current;
        if (!el) return;
        const pr = el.getBoundingClientRect();
        let newLeft = left;
        let newTop = top;
        if (pr.right > window.innerWidth - 8) {
          newLeft = window.innerWidth - 8 - pr.width;
        }
        if (pr.left < 8) {
          newLeft = 8;
        }
        if (pr.bottom > window.innerHeight - 8) {
          newTop = Math.max(8, r.top - 8 - pr.height);
        }
        if (newLeft !== left || newTop !== top) {
          setPos({ top: newTop, left: newLeft });
        }
      });
    }
    compute();
    const onScrollOrResize = () => compute();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, anchorRef]);
 
  if (!open) return null;
 
  function urlSafe(text: string) {
    return encodeURIComponent(text);
  }
 
  const pageUrl = typeof location !== "undefined" ? location.href : "";
 
  function systemShare() {
    const text = buildShareText();
    if (navigator.share) {
      navigator
        .share({ title: "VIP Advance Sheet", text, url: pageUrl })
        .then(() => onNotify?.("Shared via system share.", "success"))
        .catch(() => {});
    } else {
      copyLink();
    }
    onClose();
  }
 
  function copyLink() {
    const text = buildShareText() + "\n\nLink: " + pageUrl;
    navigator.clipboard?.writeText(text).then(() => {
      onNotify?.("Link copied to clipboard.", "success");
    });
    onClose();
  }
 
  function shareWhatsApp() {
    const text = buildShareText() + "\n\n" + pageUrl;
    window.open(`https://wa.me/?text=${urlSafe(text)}`, "_blank", "noopener,noreferrer");
    onNotify?.("Opening WhatsAppâ€¦", "info");
    onClose();
  }
 
  function shareMessenger() {
    const textUrl = pageUrl || "https://";
    const deep = `fb-messenger://share?link=${urlSafe(textUrl)}`;
    const web = `https://www.facebook.com/sharer/sharer.php?u=${urlSafe(textUrl)}`;
    const opened = window.open(deep, "_blank");
    setTimeout(() => {
      if (!opened || opened.closed) {
        window.open(web, "_blank", "noopener,noreferrer");
      }
    }, 400);
    onNotify?.("Opening Messengerâ€¦", "info");
    onClose();
  }
 
  function shareTelegram() {
    const text = buildShareText();
    const tg = `https://t.me/share/url?url=${urlSafe(pageUrl)}&text=${urlSafe(text)}`;
    window.open(tg, "_blank", "noopener,noreferrer");
    onNotify?.("Opening Telegramâ€¦", "info");
    onClose();
  }
 
  function shareImo() {
    const text = buildShareText() + "\n\n" + pageUrl;
    const deep = `imo://share?text=${urlSafe(text)}`;
    const opened = window.open(deep, "_blank");
    setTimeout(() => {
      if (!opened || opened.closed) {
        copyLink();
      }
    }, 400);
    onNotify?.("Trying to open IMOâ€¦", "info");
    onClose();
  }
 
  function savePdf() {
    window.print();
    onNotify?.("Preparing to save as PDF (use browser Print > Save as PDF).", "info");
    onClose();
  }
 
  const panel = (
    <div
      ref={panelRef}
      className="z-[120] w-64 rounded-2xl border border-amber-200/50 bg-white p-2 shadow-2xl ring-1 ring-amber-200/40"
      style={{ position: "fixed", top: pos.top, left: pos.left }}
    >
      <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Share & Export
      </div>
      <div className="flex flex-col">
        <button
          onClick={savePdf}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-rose-500/20">
            <PdfIcon />
          </span>
          Save as PDF
        </button>
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            <WhatsAppIcon />
          </span>
          WhatsApp
        </button>
        <button
          onClick={shareMessenger}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-sky-500/20">
            <MessengerIcon />
          </span>
          Messenger
        </button>
        <button
          onClick={shareTelegram}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
            <TelegramIcon />
          </span>
          Telegram
        </button>
        <button
          onClick={shareImo}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-fuchsia-500/20">
            <ShareIconSmall />
          </span>
          IMO (best-effort)
        </button>
        <button
          onClick={copyLink}
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/15">
            ðŸ”—
          </span>
          Copy Link
        </button>
        <button
          onClick={systemShare}
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-950 hover:bg-amber-100/80"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/15">
            ðŸ“¤
          </span>
          System Share
        </button>
      </div>
    </div>
  );
 
  return typeof document !== "undefined" ? createPortal(panel, document.body) : panel;
}
 
function CreateStaffModal({
  open,
  onClose,
  onCreate,
  nextSL,
  defaultCurrency,
  displayCurrency,
  supportedCurrencies,
  convertToDisplay,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (row: AdvanceSheetRow) => Promise<void> | void;
  nextSL: number;
  defaultCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  supportedCurrencies: Array<{ code: CurrencyCode; name: string }>;
  convertToDisplay: (amount: number, fromCurrency: CurrencyCode) => number;
  onNotify: (msg: string, tone?: "success" | "error" | "info") => void;
}) {
  const [draft, setDraft] = useState<AdvanceSheetRow>(() => ({
    sl: nextSL,
    profilePicture: "",
    id: `EMP-${Date.now().toString().slice(-6)}`,
    smartId: `SID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    name: "",
    position: "",
    department: "",
    advance1: 0,
    advance2: 0,
    advance3: 0,
    advance4: 0,
    netAmount: 0,
    currency: defaultCurrency,
    nationality: "",
    active: true,
    unactive: false,
    delayed: false,
    paymentMethod: "Bank",
    approvalStatus: "Pending",
    remarks: "",
    date: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString(),
  }));
  const [step, setStep] = useState<number>(1000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
 
  const DRAFT_KEY = "vip-create-staff-draft";
  const initialRef = useRef<string>("");
 
  useEffect(() => {
    setDraft((prev) => ({ ...prev, sl: nextSL }));
  }, [nextSL]);
 
  function recalcNet(next: AdvanceSheetRow) {
    next.netAmount =
      Number(next.advance1 || 0) +
      Number(next.advance2 || 0) +
      Number(next.advance3 || 0) +
      Number(next.advance4 || 0);
  }
 
  function patch<K extends keyof AdvanceSheetRow>(
    key: K,
    value: AdvanceSheetRow[K],
  ) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value } as AdvanceSheetRow;
 
      if (key === "active" && value === true) next.unactive = false;
      if (key === "unactive" && value === true) next.active = false;
 
      if (
        key === "advance1" ||
        key === "advance2" ||
        key === "advance3" ||
        key === "advance4"
      ) {
        recalcNet(next);
      }
 
      next.lastUpdated = new Date().toISOString();
      return next;
    });
  }
 
  function adjustAdvance(
    field: "advance1" | "advance2" | "advance3" | "advance4",
    delta: number,
  ) {
    setDraft((prev) => {
      const next = { ...prev } as AdvanceSheetRow;
      const v = Number(next[field] || 0) + delta;
      next[field] = v < 0 ? 0 : v;
      recalcNet(next);
      next.lastUpdated = new Date().toISOString();
      return next;
    });
  }
 
  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AdvanceSheetRow>;
        setDraft((prev) => {
          const next = { ...prev, ...parsed } as AdvanceSheetRow;
          recalcNet(next);
          next.lastUpdated = new Date().toISOString();
          return next;
        });
      }
    } catch {}
  }, [open]);
 
  useEffect(() => {
    if (open) {
      initialRef.current = JSON.stringify(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
 
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [draft, open]);
 
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!open) return;
      if (JSON.stringify(draft) !== initialRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [open, draft]);
 
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
 
    if (!draft.name.trim()) return setError(" Name is required ");
    if (!draft.id.trim()) return setError(" ID is required");
    if (!draft.smartId.trim()) return setError("Smart ID is required");
    if (!draft.date) return setError("Date is required");
 
    setSubmitting(true);
    try {
      await onCreate({ ...draft });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      onNotify("New staff saved successfully.", "success");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submit No valid records found in the pasted text";
      setError(msg);
      onNotify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }
 
  function onPickFile() {
    fileInputRef.current?.click();
  }
 
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      patch("profilePicture", url);
    };
    reader.readAsDataURL(file);
  }
 
  const shareAnchorRef = useRef<HTMLButtonElement>(null);
  const [openShare, setOpenShare] = useState(false);
 
  function buildShareText() {
    return `Staff Draft â€” ${draft.name || "(Unnamed)"}\nID: ${draft.id}\nNet: ${formatMoney(
      draft.netAmount,
      draft.currency,
    )} (${formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)} in ${displayCurrency})\nDate: ${draft.date}`;
  }
 
  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setDraft((d) => {
      const base: AdvanceSheetRow = {
        ...d!,
        profilePicture: "",
        name: "",
        position: "",
        department: "",
        advance1: 0,
        advance2: 0,
        advance3: 0,
        advance4: 0,
        netAmount: 0,
        nationality: "",
        approvalStatus: "Pending",
        remarks: "",
        lastUpdated: new Date().toISOString(),
      };
      return base;
    });
    onNotify("Draft cleared.", "info");
  }
 
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Staff"
      primaryActionLabel={submitting ? "Saving..." : "Save"}
      primaryActionFormId="create-staff-form"
      primaryActionDisabled={submitting}
      fullScreen
      rightExtras={
        <div className="flex items-center gap-2">
          <button
            ref={shareAnchorRef}
            type="button"
            onClick={() => setOpenShare((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-slate-950/90 hover:bg-amber-200/90"
          >
            <ShareIconSmall /> Share
          </button>
          <ShareMenu
            open={openShare}
            anchorRef={shareAnchorRef as any}
            onClose={() => setOpenShare(false)}
            buildShareText={buildShareText}
            onNotify={onNotify}
          />
        </div>
      }
    >
      <form id="create-staff-form" onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full ring-2 ring-fuchsia-400/40 shadow-2xl">
              <img
                src={
                  draft.profilePicture ||
                  "data:image/svg+xml;utf8," +
                    encodeURIComponent(
                      `<svg xmlns='http://www.w3.org/2000/svg' width='112' height='112'><rect width='100%' height='100%' fill='#0f172a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='14'>Profile Picture</text></svg>`,
                    )
                }
                alt="Profile Preview"
                className="h-28 w-28 object-cover"
              />
            </div>
            <button
              type="button"
              onClick={onPickFile}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/50 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-slate-950/90 hover:bg-amber-200/90"
            >
              Change
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>
 
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              SL
            </span>
            <input
              type="number"
              min={1}
              value={draft.sl}
              onChange={(e) => patch("sl", Number(e.target.value))}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              required
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              ID
            </span>
            <input
              value={draft.id}
              onChange={(e) => patch("id", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="EMP-XXXXX"
              required
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Smart ID
            </span>
            <input
              value={draft.smartId}
              onChange={(e) => patch("smartId", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="SID-XXXXXX"
              required
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Name
            </span>
            <input
              value={draft.name}
              onChange={(e) => patch("name", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="Full name"
              required
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Position
            </span>
            <input
              value={draft.position}
              onChange={(e) => patch("position", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="e.g., Senior Officer"
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Department
            </span>
            <input
              value={draft.department}
              onChange={(e) => patch("department", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="e.g., Finance"
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Date
            </span>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => patch("date", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              required
            />
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Currency
            </span>
            <select
              value={draft.currency}
              onChange={(e) => patch("currency", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
            >
              {supportedCurrencies.map((c) => (
                <option key={c.code} className="bg-slate-950" value={c.code}>
                  {c.code} â€” {c.name}
                </option>
              ))}
            </select>
          </label>
 
          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Display</span>
              <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-800">
                Net in {displayCurrency}:{" "}
                {formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)}
              </span>
            </div>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Advance 1
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance1}
                onChange={(e) => patch("advance1", Number(e.target.value))}
                className="w-full rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance1", -step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance1", step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Advance 2
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance2}
                onChange={(e) => patch("advance2", Number(e.target.value))}
                className="w-full rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance2", -step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance2", step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Advance 3
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance3}
                onChange={(e) => patch("advance3", Number(e.target.value))}
                className="w-full rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance3", -step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance3", step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Advance 4
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance4}
                onChange={(e) => patch("advance4", Number(e.target.value))}
                className="w-full rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance4", -step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance4", step)}
                  className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>
 
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Net Amount
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={draft.netAmount}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-bold text-amber-800 outline-none sm:w-auto"
              />
              <span className="rounded-lg border border-amber-200/50 bg-amber-100/80 px-3 py-2 text-xs text-slate-600">
                Base: {formatMoney(draft.netAmount, draft.currency)}
              </span>
              <span className="rounded-lg border border-amber-500/45 bg-amber-100/80 px-3 py-2 text-xs text-slate-950">
                Display:{" "}
                {formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)}
              </span>
            </div>
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Nationality
            </span>
            <input
              value={draft.nationality}
              onChange={(e) => patch("nationality", e.target.value)}
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="e.g., Bangladeshi"
            />
          </label>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Active
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch("active", e.target.checked)}
              />
              Active
            </label>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Unactive
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.unactive}
                onChange={(e) => patch("unactive", e.target.checked)}
              />
              Unactive
            </label>
          </div>
 
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Delayed
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.delayed}
                onChange={(e) => patch("delayed", e.target.checked)}
              />
              Delayed
            </label>
          </div>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Payment Method
            </span>
            <select
              value={draft.paymentMethod}
              onChange={(e) =>
                patch(
                  "paymentMethod",
                  e.target.value as AdvanceSheetRow["paymentMethod"],
                )
              }
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
            >
              <option className="bg-slate-950">Bank</option>
              <option className="bg-slate-950">Cash</option>
              <option className="bg-slate-950">Mobile Banking</option>
              <option className="bg-slate-950">Card</option>
            </select>
          </label>
 
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Approval Status
            </span>
            <select
              value={draft.approvalStatus}
              onChange={(e) =>
                patch("approvalStatus", e.target.value as ApprovalStatus)
              }
              className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
            >
              <option className="bg-slate-950">Approved</option>
              <option className="bg-slate-950">Pending</option>
              <option className="bg-slate-950">Review</option>
              <option className="bg-slate-950">Rejected</option>
            </select>
          </label>
 
          <label className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Remarks
            </span>
            <textarea
              rows={3}
              value={draft.remarks}
              onChange={(e) => patch("remarks", e.target.value)}
              className="w-full rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-400/70"
              placeholder="Additional notes..."
            />
          </label>
 
          <label className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Last Updated
            </span>
            <input
              value={new Date(draft.lastUpdated).toLocaleString("en-GB")}
              readOnly
              className="cursor-not-allowed rounded-xl border border-amber-200/50 bg-amber-50/70 px-3 py-2 text-slate-600 outline-none"
            />
          </label>
        </div>
 
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Step</span>
            <select
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="rounded-lg border border-amber-200/50 bg-white/95 px-2 py-1 text-xs text-slate-950 outline-none"
            >
              <option className="bg-slate-950" value={100}>100</option>
              <option className="bg-slate-950" value={500}>500</option>
              <option className="bg-slate-950" value={1000}>1000</option>
              <option className="bg-slate-950" value={5000}>5000</option>
            </select>
            <span className="ml-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-800">
              Net: {formatMoney(draft.netAmount, draft.currency)}
            </span>
            <span className="ml-2 rounded-full border border-amber-500/45 bg-amber-100/80 px-3 py-1 text-xs font-bold text-slate-950">
              {formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)}
            </span>
          </div>
 
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  advance1: 0,
                  advance2: 0,
                  advance3: 0,
                  advance4: 0,
                  netAmount: 0,
                  lastUpdated: new Date().toISOString(),
                }))
              }
              className="rounded-xl border border-amber-200/50 bg-amber-100/80 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-200/90"
            >
              Reset Advances
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="rounded-xl border border-amber-500/45 bg-sky-400/10 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-sky-400/20"
            >
              Clear Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </div>
 
        {error ? (
          <div className="rounded-xl border border-rose-300/30 bg-amber-100/80 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
 
type ToastTone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: ToastTone };
 
function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex w-[92vw] max-w-sm flex-col gap-2 no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            "animate-slide-up rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-lg",
            t.tone === "success" && "border-amber-500/45 bg-emerald-400/10 text-slate-950",
            t.tone === "error" && "border-rose-300/30 bg-amber-100/80 text-rose-700",
            t.tone === "info" && "border-sky-300/30 bg-sky-500/10 text-sky-700",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>{t.message}</div>
            <button
              className="rounded-md border border-amber-200/50 bg-amber-100/80 px-2 py-1 text-[10px] text-slate-950/80 hover:bg-amber-200/90"
              onClick={() => onClose(t.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
 
function parseBulkText(raw: string) {
  const text = raw.trim();
  if (!text) return [];
 
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    // CSV/TSV fallback
  }
 
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
 
  if (!lines.length) return [];
 
  const delimiter = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes("|")
      ? "|"
      : lines[0].includes(";")
        ? ";"
        : ",";
 
  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim())
    .filter(Boolean);
 
  if (headers.length > 3) {
    return lines.slice(1).map((line) => {
      const cols = line.split(delimiter);
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i]?.trim() ?? "";
      });
      return obj;
    });
  }
 
  return lines.map((line) => ({ raw: line }));
}
 
function BulkPasteModal({
  open,
  onClose,
  onSaveMany,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  onSaveMany: (rows: AdvanceSheetRow[]) => Promise<void>;
  onNotify: (msg: string, tone?: ToastTone) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
 
  useEffect(() => {
    if (!open) setText("");
    if (!open) setError("");
  }, [open]);
 
  const handleSave = async () => {
    try {
      setError("");
      const parsed = parseBulkText(text);
      if (!parsed.length) {
        setError("Bulk Paste No valid records found in the pasted text");
        return;
      }
 
      const now = new Date().toISOString();
      const rows: AdvanceSheetRow[] = parsed.map((item: any, idx) => {
        const net =
          Number(item.advance1 || 0) +
          Number(item.advance2 || 0) +
          Number(item.advance3 || 0) +
          Number(item.advance4 || 0);
 
        return {
          sl: Number(item.sl || idx + 1),
          profilePicture: String(item.profilePicture || ""),
          id: String(item.id || `EMP-${Date.now().toString().slice(-6)}-${idx + 1}`),
          smartId: String(item.smartId || `SID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`),
          name: String(item.name || ""),
          position: String(item.position || ""),
          department: String(item.department || ""),
          advance1: Number(item.advance1 || 0),
          advance2: Number(item.advance2 || 0),
          advance3: Number(item.advance3 || 0),
          advance4: Number(item.advance4 || 0),
          netAmount: net,
          currency: String(item.currency || "BDT"),
          nationality: String(item.nationality || ""),
          active: String(item.active).toLowerCase() === "false" ? false : true,
          unactive: String(item.unactive).toLowerCase() === "true",
          delayed: String(item.delayed).toLowerCase() === "true",
          paymentMethod:
            item.paymentMethod === "Cash" ||
            item.paymentMethod === "Mobile Banking" ||
            item.paymentMethod === "Card"
              ? item.paymentMethod
              : "Bank",
          approvalStatus:
            item.approvalStatus === "Approved" ||
            item.approvalStatus === "Review" ||
            item.approvalStatus === "Rejected"
              ? item.approvalStatus
              : "Pending",
          remarks: String(item.remarks || ""),
          date: String(item.date || new Date().toISOString().slice(0, 10)),
          lastUpdated: now,
        };
      });
 
      await onSaveMany(rows);
      onNotify(`Bulk saved: ${rows.length} rows.`, "success");
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bulk paste save error";
      setError(msg);
      onNotify(msg, "error");
    }
  };
 
  return (
    <Modal open={open} onClose={onClose} title="Bulk Paste" fullScreen>
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200/50 bg-amber-50/70 p-4 text-sm text-slate-600">
          CSV / TSV / JSON data format must match the required header layout.
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`id,smartId,name,position,department,advance1,advance2,advance3,advance4,currency,nationality,date
EMP-101,SID-1,John Doe,Manager,Finance,1000,500,250,0,BDT,Bangladeshi,2026-07-01`}
          className="min-h-[55vh] w-full rounded-2xl border border-amber-200/50 bg-white/95 px-4 py-3 font-mono text-sm text-slate-950 outline-none focus:border-amber-400/70"
        />
        {error ? (
          <div className="rounded-xl border border-rose-300/30 bg-amber-100/80 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl border border-amber-500/45 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 px-4 py-2 text-sm font-bold text-slate-950 hover:brightness-105"
          >
            Save Bulk Rows
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setError("");
            }}
            className="rounded-xl border border-amber-200/50 bg-amber-100/80 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-200/90"
          >
            Clear Text
          </button>
        </div>
      </div>
    </Modal>
  );
}
 
function MoreActionsMenu({
  open,
  onClose,
  anchorRef,
  children,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOnClickOutside([panelRef, anchorRef as any], onClose);
 
  if (!open) return null;
 
  return (
    <div
      ref={panelRef}
      className="absolute left-1/2 top-full z-30 mt-2 w-[300px] -translate-x-1/2 rounded-2xl border border-yellow-300/55 bg-[linear-gradient(135deg,#111827_0%,#3b2f11_34%,#d4af37_64%,#fff3b0_100%)] p-3 shadow-[0_24px_60px_-24px_rgba(17,24,39,0.9)]"
    >
      <div className="mx-auto flex max-w-[280px] flex-wrap items-center justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
 
export default function AdvanceSheetPage() {
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const alignClass = textAlign === "left" ? "text-left" : textAlign === "center" ? "text-center" : "text-right";
  const [tableZoom, setTableZoom] = useState<number>(100);
  const [openProfessionColors, setOpenProfessionColors] = useState(false);
  const [professionColors, setProfessionColors] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vip-profession-colors") || "{}");
    } catch {
      return {};
    }
  });
  const [columnWidths, setColumnWidths] = useState<Record<TableColumnKey, number>>(
    () => DEFAULT_COLUMN_WIDTHS,
  );
  const resizeStateRef = useRef<{
    key: TableColumnKey;
    startX: number;
    startWidth: number;
    minWidth: number;
  } | null>(null);
  const [rows, setRows] = useState<AdvanceSheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [approvalFilter, setApprovalFilter] = useState<"Any" | ApprovalStatus>("Any");
  const [paymentFilter, setPaymentFilter] = useState<"Any" | AdvanceSheetRow["paymentMethod"]>("Any");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
 
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdvanceSheetRow | null>(null);
  const [isPending, startTransition] = useTransition();
 
  const [openCreate, setOpenCreate] = useState(false);
  const [openBulkPaste, setOpenBulkPaste] = useState(false);
 
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);
  const closeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
 
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>("BDT");
  const {
    loading: ratesLoading,
    error: ratesError,
    updatedAt: ratesUpdatedAt,
    symbols,
    supportedCodes,
    convertToDisplay,
  } = useExchangeRates(displayCurrency);
 
  const currencyOptions = useMemo(
    () => supportedCodes.map((code) => ({ code, name: symbols[code] || code })),
    [supportedCodes, symbols],
  );
 
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vip-profession-colors", JSON.stringify(professionColors));
    }
  }, [professionColors]);
 
  const normalizeRecords = (data: any[]): AdvanceSheetRow[] => {
    return data.map((r: any) => {
      const isoToday = new Date().toISOString().slice(0, 10);
      const date = r?.date || (r?.lastUpdated ? String(r.lastUpdated).slice(0, 10) : isoToday);
      const currency: CurrencyCode = r?.currency || "BDT";
      return { ...r, date, currency } as AdvanceSheetRow;
    });
  };
 
  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
 
      const response = await fetch("/api/staff-advance-sheet", {
        method: "GET",
        signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
 
      if (!response.ok) {
        throw new Error("Failed to load advance sheet data");
      }
 
      const payload = (await response.json()) as ApiResponse;
      const data = Array.isArray(payload.data)
        ? payload.data
        : payload.data
          ? [payload.data]
          : [];
 
      setRows(normalizeRecords(data));
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
      setError(fetchError instanceof Error ? fetchError.message : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);
 
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadData();
      showToast("Auto refreshed data.", "info");
    }, 1000 * 60 * 5);
    return () => clearInterval(id);
  }, [autoRefresh, loadData, showToast]);
 
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
 
    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          row.sl,
          row.id,
          row.smartId,
          row.name,
          row.position,
          row.department,
          row.nationality,
          row.approvalStatus,
          row.paymentMethod,
          row.remarks,
          row.date,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
 
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && row.active) ||
        (statusFilter === "Unactive" && row.unactive) ||
        (statusFilter === "Delayed" && row.delayed);
 
      const matchesApproval = approvalFilter === "Any" || row.approvalStatus === approvalFilter;
 
      const matchesPayment = paymentFilter === "Any" || row.paymentMethod === paymentFilter;
 
      const matchesDate = (!dateFrom || row.date >= dateFrom) && (!dateTo || row.date <= dateTo);
 
      return matchesSearch && matchesStatus && matchesApproval && matchesPayment && matchesDate;
    });
  }, [rows, search, statusFilter, approvalFilter, paymentFilter, dateFrom, dateTo]);
 
  const professionList = useMemo(() => {
    const professions = rows
      .map((row) => row.position?.trim())
      .filter((position): position is string => Boolean(position));
    return Array.from(new Set(professions)).sort((a, b) => a.localeCompare(b));
  }, [rows]);
 
  function getProfessionColor(position: string) {
    const normalized = position.trim();
    if (!normalized) return "";
    const saved = professionColors[normalized];
    if (saved) return saved;
    const index = professionList.indexOf(normalized);
    return DEFAULT_PROFESSION_COLORS[
      Math.max(index, 0) % DEFAULT_PROFESSION_COLORS.length
    ];
  }
 
  function updateProfessionColor(position: string, color: string) {
    setProfessionColors((current) => ({
      ...current,
      [position]: color,
    }));
  }
 
  function resetProfessionColors() {
    setProfessionColors({});
    showToast("Profession colors reset.", "info");
  }
 
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.advance1 += convertToDisplay(row.advance1, row.currency);
        acc.advance2 += convertToDisplay(row.advance2, row.currency);
        acc.advance3 += convertToDisplay(row.advance3, row.currency);
        acc.advance4 += convertToDisplay(row.advance4, row.currency);
        acc.netAmount += convertToDisplay(row.netAmount, row.currency);
        if (row.active) acc.active += 1;
        if (row.unactive) acc.unactive += 1;
        if (row.delayed) acc.delayed += 1;
        return acc;
      },
      {
        netAmount: 0,
        advance1: 0,
        advance2: 0,
        advance3: 0,
        advance4: 0,
        active: 0,
        unactive: 0,
        delayed: 0,
      },
    );
  }, [filteredRows, convertToDisplay]);
 
  function handleEdit(row: AdvanceSheetRow) {
    setEditingId(row.id);
    setDraft({ ...row });
  }
 
  function handleCancel() {
    setEditingId(null);
    setDraft(null);
  }
 
  function updateDraft<K extends keyof AdvanceSheetRow>(
    key: K,
    value: AdvanceSheetRow[K],
  ) {
    setDraft((current) => {
      if (!current) return current;
 
      const next = { ...current, [key]: value };
 
      if (
        key === "advance1" ||
        key === "advance2" ||
        key === "advance3" ||
        key === "advance4"
      ) {
        (next as AdvanceSheetRow).netAmount =
          Number((next as AdvanceSheetRow).advance1 || 0) +
          Number((next as AdvanceSheetRow).advance2 || 0) +
          Number((next as AdvanceSheetRow).advance3 || 0) +
          Number((next as AdvanceSheetRow).advance4 || 0);
      }
 
      if (key === "active" && value === true) (next as AdvanceSheetRow).unactive = false;
      if (key === "unactive" && value === true) (next as AdvanceSheetRow).active = false;
 
      (next as AdvanceSheetRow).lastUpdated = new Date().toISOString();
      return next as AdvanceSheetRow;
    });
  }
 
  const genIdem = () => Math.random().toString(36).slice(2) + "-" + Date.now();
 
  function deleteRowLocal(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) handleCancel();
  }
 
  async function handleRemove(id: string) {
    const confirmDelete = window.confirm("Are you sure you want to delete this record¨¨?");
    if (!confirmDelete) return;
 
    try {
      setError(null);
      const resp = await fetch("/api/staff-advance-sheet", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id }),
      });
 
      if (!resp.ok) {
        console.warn("DELETE API failed; removing locally.");
      }
    } catch (e) {
      console.warn("DELETE request error; removing locally.", e);
    } finally {
      deleteRowLocal(id);
      showToast("Removed from list.", "success");
    }
  }
 
  async function handleClearAll() {
    const confirmDelete = window.confirm(
      "This will delete all rows. Are you sure you want to continue?",
    );
    if (!confirmDelete) return;
 
    try {
      setError(null);
      await Promise.allSettled(
        rows.map((r) =>
          fetch("/api/staff-advance-sheet", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ id: r.id }),
          }),
        ),
      );
    } catch {
      // ignore
    } finally {
      setRows([]);
      handleCancel();
      showToast("All rows cleared.", "success");
    }
  }
 
  function exportCsv() {
    const headers = [
      "SL",
      "Profile Picture",
      "ID",
      "Smart ID",
      "Name",
      "Position",
      "Department",
      "Advance 1",
      "Advance 2",
      "Advance 3",
      "Advance 4",
      "Net Amount",
      "Currency",
      "Nationality",
      "Active",
      "Unactive",
      "Delayed",
      "Payment Method",
      "Approval Status",
      "Remarks",
      "Date",
      "Last Updated",
    ];
 
    const csvRows = filteredRows.map((row) =>
      [
        row.sl,
        row.profilePicture,
        row.id,
        row.smartId,
        row.name,
        row.position,
        row.department,
        row.advance1,
        row.advance2,
        row.advance3,
        row.advance4,
        row.netAmount,
        row.currency,
        row.nationality,
        row.active ? "Yes" : "No",
        row.unactive ? "Yes" : "No",
        row.delayed ? "Yes" : "No",
        row.paymentMethod,
        row.approvalStatus,
        row.remarks,
        row.date,
        row.lastUpdated,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
 
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
 
    anchor.href = url;
    anchor.download = `vip-advance-sheet-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
 
    URL.revokeObjectURL(url);
    showToast("CSV exported.", "success");
  }
 
  function backupJson() {
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vip-advance-sheet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup JSON exported.", "success");
  }
 
  const restoreInputRef = useRef<HTMLInputElement>(null);
  function openRestorePicker() {
    restoreInputRef.current?.click();
  }
 
  async function onRestorePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
 
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const list: AdvanceSheetRow[] = Array.isArray(data) ? data : [data];
      const normalized = normalizeRecords(list);
      const replace = window.confirm("Replace existing rows with backup? Click 'Cancel' to Append.");
      if (replace) {
        setRows(normalized);
        showToast(`Restored ${normalized.length} rows (replaced).`, "success");
      } else {
        setRows((prev) => {
          const byId = new Map<string, AdvanceSheetRow>();
          for (const r of prev) byId.set(r.id, r);
          for (const r of normalized) byId.set(r.id, r);
          return Array.from(byId.values());
        });
        showToast(`Restored ${normalized.length} rows (merged).`, "success");
      }
    } catch {
      showToast("Invalid JSON backup.", "error");
    }
  }
 
  function buildShareSummary() {
    return `Premium Advance Sheet â€” VIP Finance Control. 2026
 
Total rows: ${filteredRows.length}
Net total (${displayCurrency}): ${formatMoney(totals.netAmount, displayCurrency)}
Active: ${totals.active} | Unactive: ${totals.unactive} | Delayed: ${totals.delayed}
Date: ${new Date().toLocaleDateString("en-GB")}`;
  }
 
  function handleWhatsAppShare() {
    try {
      const summaryText = buildShareSummary();
      const url = `https://wa.me/?text=${encodeURIComponent(
        summaryText + `\n\nLink: ${typeof location !== "undefined" ? location.href : ""}`,
      )}`;
      window.open(url, "_blank", "noopener,noreferrer");
      showToast("Opening WhatsAppâ€¦", "info");
    } catch {
      // silent
    }
  }
 
  function handlePrint() {
    window.print();
  }
 
  function handlePrintPdf() {
    window.print();
  }
 
  const nextSL = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => Number(r.sl) || 0)) + 1 : 1),
    [rows],
  );
 
  async function handleCreateNew(row: AdvanceSheetRow) {
    try {
      setError(null);
      const response = await fetch("/api/staff-advance-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": genIdem(),
          "X-Client-Version": "vip-advance-sheet/2026.06",
        },
        body: JSON.stringify(row),
      });
 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "​Failed to fetch response from server");
      }
 
      const payload = (await response.json()) as ApiResponse;
 
      const created = (Array.isArray(payload.data) ? payload.data[0] : payload.data) as AdvanceSheetRow;
 
      if (!created) {
        throw new Error("​Failed to create the new record");
      }
 
      setRows((prev) => [...prev, created]);
    } catch (saveError) {
      console.error("Create Error:", saveError);
      const msg =
        saveError instanceof Error
          ? saveError.message
          : "An error occurred while saving the data";
      setError(msg);
      showToast(msg, "error");
      throw saveError;
    }
  }
 
  async function handleBulkSave(rowsToSave: AdvanceSheetRow[]) {
    try {
      for (const row of rowsToSave) {
        await handleCreateNew(row);
      }
    } catch (e) {
      throw e;
    }
  }
 
  const pdfBtnRef = useRef<HTMLButtonElement>(null);
  const [openShare, setOpenShare] = useState(false);
 
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
  const moreMenuBtnRef = useRef<HTMLButtonElement>(null);

  // "Actions" dropdown (row/column operations) — sits next to "More Actions".
  const [openActionsMenu, setOpenActionsMenu] = useState(false);
  const actionsMenuBtnRef = useRef<HTMLButtonElement>(null);
 
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("vip-theme") as "dark" | "light") || "dark";
  });
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vip-theme", theme);
    }
  }, [theme]);
 
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName || "";
      const isTyping =
        /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target as HTMLElement)?.isContentEditable;
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (!isTyping && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setOpenCreate(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (editingId && draft) {
          e.preventDefault();
          handleSave();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, draft]); // eslint-disable-line react-hooks/exhaustive-deps
 
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (editingId) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editingId]);
 
  const tableWidth = useMemo(
    () => TABLE_COLUMNS.reduce((sum, column) => sum + columnWidths[column.key], 0),
    [columnWidths],
  );
 
  const startColumnResize = useCallback(
    (
      key: TableColumnKey,
      minWidth: number,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();
      resizeStateRef.current = {
        key,
        minWidth,
        startX: event.clientX,
        startWidth: columnWidths[key],
      };
      document.body.classList.add("vip-column-resizing");
    },
    [columnWidths],
  );
 
  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;
 
      const nextWidth = Math.max(
        resizeState.minWidth,
        resizeState.startWidth + event.clientX - resizeState.startX,
      );
 
      setColumnWidths((current) => ({
        ...current,
        [resizeState.key]: nextWidth,
      }));
    }
 
    function onMouseUp() {
      resizeStateRef.current = null;
      document.body.classList.remove("vip-column-resizing");
    }
 
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.classList.remove("vip-column-resizing");
    };
  }, []);
 
  const vipPrimaryActionClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-yellow-300/70 bg-[linear-gradient(135deg,#111827_0%,#3b2f11_34%,#d4af37_64%,#fff3b0_100%)] px-3 text-xs font-black text-white shadow-[0_14px_34px_-16px_rgba(17,24,39,0.85),0_0_0_1px_rgba(255,255,255,0.18)_inset] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const vipSoftActionClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-yellow-300/55 bg-[linear-gradient(135deg,#fff7d1_0%,#f8dfa2_38%,#c9952f_100%)] px-3 text-xs font-black text-slate-950 shadow-[0_14px_34px_-18px_rgba(120,53,15,0.75),0_0_0_1px_rgba(255,255,255,0.55)_inset] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95";
  const vipDangerActionClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-300/50 bg-[linear-gradient(135deg,#fff1f2_0%,#fecdd3_45%,#be123c_100%)] px-3 text-xs font-black text-rose-950 shadow-[0_14px_34px_-18px_rgba(190,18,60,0.7)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95";
  const vipPanelClass =
    "inline-flex h-9 items-center gap-2 rounded-xl border border-yellow-300/55 bg-[linear-gradient(135deg,#fffdf0_0%,#fef3c7_48%,#f8dfa2_100%)] px-3 shadow-[0_12px_30px_-20px_rgba(120,53,15,0.7)]";
  // Unified "VIP" style + white text for every button inside the More Actions dropdown
  const vipDropdownItemClass =
    "inline-flex h-9 w-[130px] items-center justify-center gap-1.5 rounded-xl border border-yellow-300/70 bg-[linear-gradient(135deg,#111827_0%,#3b2f11_34%,#d4af37_64%,#fff3b0_100%)] px-2 text-[11px] font-black text-white shadow-[0_14px_34px_-16px_rgba(17,24,39,0.85),0_0_0_1px_rgba(255,255,255,0.18)_inset] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  // Danger variant for destructive dropdown items (e.g. Delete Row)
  const vipDropdownDangerItemClass =
    "inline-flex h-9 w-[130px] items-center justify-center gap-1.5 rounded-xl border border-rose-300/60 bg-[linear-gradient(135deg,#fff1f2_0%,#fecdd3_45%,#be123c_100%)] px-2 text-[11px] font-black text-rose-950 shadow-[0_14px_34px_-18px_rgba(190,18,60,0.7)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95";
 
  // --- Row / Column action handlers (wired to the new "Actions" dropdown) ---
  function handleActionAddRow() {
    setOpenActionsMenu(false);
    setOpenCreate(true);
    showToast("Add New Row form opened.", "info");
  }
  function handleActionModifyRow() {
    setOpenActionsMenu(false);
    if (editingId) {
      showToast("Finish or cancel the current edit first.", "info");
      return;
    }
    if (!rows.length) {
      showToast("No rows available to modify.", "error");
      return;
    }
    const target = rows[0];
    setEditingId(target.id);
    setDraft({ ...target });
    showToast(`Modifying row: ${target.name || target.id}`, "success");
  }
  function handleActionDeleteRow() {
    setOpenActionsMenu(false);
    if (!rows.length) {
      showToast("No rows available to delete.", "error");
      return;
    }
    const target = rows[0];
    if (typeof window !== "undefined" && !window.confirm(`Delete row for ${target.name || target.id}?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== target.id));
    if (editingId === target.id) {
      setEditingId(null);
      setDraft(null);
    }
    showToast(`Deleted row: ${target.name || target.id}`, "success");
  }
  function handleActionAddColumn() {
    setOpenActionsMenu(false);
    showToast("Add New Column: schema is fixed in this build — extend TABLE_COLUMNS to add a column.", "info");
  }
  function handleActionModifyColumn() {
    setOpenActionsMenu(false);
    showToast("Modify Column: drag a column resize handle, or edit TABLE_COLUMNS widths.", "info");
  }
  function handleActionDeleteColumn() {
    setOpenActionsMenu(false);
    showToast("Delete Column: schema is fixed in this build — remove an entry from TABLE_COLUMNS to delete.", "info");
  }

  function handleSave() {
    if (!draft) return;
 
    startTransition(async () => {
      try {
        const response = await fetch("/api/advance-sheet", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Idempotency-Key": genIdem(),
            "X-Client-Version": "vip-advance-sheet/2026.06",
          },
          body: JSON.stringify(draft),
        });
 
        if (!response.ok) {
          throw new Error("Update failed.");
        }
 
        const payload = (await response.json()) as ApiResponse;
        const updated = (payload.data as AdvanceSheetRow) || draft;
 
        setRows((current) => current.map((row) => (row.id === draft.id ? updated : row)));
        setEditingId(null);
        setDraft(null);
        showToast("Changes saved.", "success");
      } catch (saveError) {
        const msg =
          saveError instanceof Error ? saveError.message : "Update à¦•à¦°à¦¾à¦° à¦¸à¦®à¦¯à¦¼ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à¦¯à¦¼à§‡à¦›à§‡à¥¤";
        setError(msg);
        showToast(msg, "error");
      }
    });
  }
 
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf0] text-slate-950">
      <div className="pointer-events-none fixed inset-0 decor-bg">
        <div className="absolute left-[-10%] top-[-12%] h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-[34rem] w-[34rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[25%] h-[36rem] w-[36rem] rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(217,119,6,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,119,6,0.12)_1px,transparent_1px)] bg-[size:54px_54px] opacity-20" />
      </div>
 
      <section className="relative mx-auto max-w-[1800px] px-4 py-0 sm:px-6 lg:px-2">
        <header className="relative overflow-hidden rounded-[2rem] border border-amber-200/20 bg-white/95 p-6 shadow-[0_24px_80px_rgba(245,158,11,0.18)] backdrop-blur-2xl sm:p-8 lg:p-10 print-surface">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
          <div className="absolute right-6 top-6 hidden rounded-full border border-amber-400/40 bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-800 lg:block">
            VIP
          </div>
 
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="-mt-1 mb-1 inline-flex max-w-full items-center justify-center gap-3 rounded-2xl border border-fuchsia-200/45 bg-[linear-gradient(135deg,#2e1065_0%,#6d28d9_42%,#a855f7_72%,#f5d0fe_100%)] px-6 py-3 text-3xl font-black text-white shadow-[0_24px_70px_-28px_rgba(88,28,135,0.95),0_0_0_1px_rgba(255,255,255,0.22)_inset] sm:px-10 sm:py-4 sm:text-5xl lg:text-6xl">
              <CrownIcon />
              <span className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
                Premium Advance Sheet
              </span>
            </div>
          </div>
        </header>
 
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <VipMetricCard
            title="Total Net Amount"
            value={formatMoney(totals.netAmount, displayCurrency)}
            subtitle={`Visible rows: ${filteredRows.length} â€” ${displayCurrency}`}
            tone="gold"
          />
          <VipMetricCard
            title="Active Members"
            value={String(totals.active)}
            subtitle="Currently eligible"
            tone="emerald"
          />
          <VipMetricCard
            title="Delayed Cases"
            value={String(totals.delayed)}
            subtitle="Needs follow-up"
            tone="rose"
          />
          <VipMetricCard
            title="Advance Volume"
            value={compactNumberFormatter.format(
              totals.advance1 + totals.advance2 + totals.advance3 + totals.advance4,
            )}
            subtitle={`A1 + A2 + A3 + A4 (${displayCurrency})`}
            tone="sky"
          />
        </section>
 
        <section className="mt-4 rounded-[1.5rem] border border-amber-200/50 bg-white/90 p-4 no-print">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <label className="relative flex-1">
              <span className="sr-only">Search advance sheet</span>
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, Smart ID, Name, Position, Nationality, Date..."
                className="w-full rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm text-slate-950 outline-none ring-0 placeholder:text-slate-400 transition focus:border-amber-200/50 focus:bg-white"
              />
            </label>
 
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-amber-200/50"
            >
              <option className="bg-slate-950" value="All">All Status</option>
              <option className="bg-slate-950" value="Active">Active</option>
              <option className="bg-slate-950" value="Unactive">Unactive</option>
              <option className="bg-slate-950" value="Delayed">Delayed</option>
            </select>
 
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as "Any" | ApprovalStatus)}
              className="rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-amber-200/50"
            >
              <option className="bg-slate-950" value="Any">Any Approval</option>
              <option className="bg-slate-950" value="Approved">Approved</option>
              <option className="bg-slate-950" value="Pending">Pending</option>
              <option className="bg-slate-950" value="Review">Review</option>
              <option className="bg-slate-950" value="Rejected">Rejected</option>
            </select>
 
            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as "Any" | AdvanceSheetRow["paymentMethod"])
              }
              className="rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-amber-200/50"
            >
              <option className="bg-slate-950" value="Any">Any Payment</option>
              <option className="bg-slate-950" value="Bank">Bank</option>
              <option className="bg-slate-950" value="Cash">Cash</option>
              <option className="bg-slate-950" value="Mobile Banking">Mobile Banking</option>
              <option className="bg-slate-950" value="Card">Card</option>
            </select>
 
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-amber-200/50"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-2xl border border-amber-200/50 bg-white/95 px-5 py-3.5 text-sm font-semibold text-slate-950 outline-none transition focus:border-amber-200/50"
              placeholder="To date"
            />
          </div>
        </section>
 
        <section className="mt-6 rounded-[2rem] border border-amber-200/50 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-300/30 bg-amber-100/80 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
 
          <div className="mb-4 no-print">
            <div className="overflow-x-auto rounded-2xl border border-yellow-300/45 bg-[linear-gradient(135deg,#fffdf7_0%,#fef3c7_48%,#fff7ed_100%)] p-3 shadow-[0_18px_48px_-30px_rgba(120,53,15,0.75)]">
              <div className="grid grid-flow-col grid-rows-2 auto-cols-max justify-start gap-2 xl:justify-center">
                <button type="button" onClick={() => setOpenCreate(true)} className={vipPrimaryActionClass}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/45 text-xs font-bold">+</span>
                  Add New Staff
                </button>
                <button type="button" onClick={() => setOpenBulkPaste(true)} className={vipSoftActionClass}>
                  Bulk Paste
                </button>
                <button type="button" onClick={exportCsv} className={vipSoftActionClass}>
                  Export CSV
                </button>
                <button type="button" onClick={backupJson} className={vipSoftActionClass}>
                  Backup JSON
                </button>
                <input ref={restoreInputRef} type="file" accept="application/json" className="hidden" onChange={onRestorePicked} />
                <button type="button" onClick={() => location.reload()} className={vipPrimaryActionClass}>
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRefresh((v) => !v)}
                  className={classNames(
                    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black shadow-[0_14px_34px_-18px_rgba(120,53,15,0.75)] transition hover:-translate-y-0.5",
                    autoRefresh
                      ? "border-emerald-300/65 bg-[linear-gradient(135deg,#052e2b_0%,#0f766e_45%,#a7f3d0_100%)] text-white"
                      : "border-yellow-300/55 bg-[linear-gradient(135deg,#fff7d1_0%,#f8dfa2_45%,#c9952f_100%)] text-slate-950",
                  )}
                >
                  {autoRefresh ? "Auto Refresh: ON" : "Auto Refresh: OFF"}
                </button>
                <button type="button" onClick={handlePrint} className={vipPrimaryActionClass}>
                  Print
                </button>
                <button type="button" onClick={handleClearAll} className={vipDangerActionClass}>
                  Clear All
                </button>
                <button type="button" onClick={() => window.location.reload()} className={vipSoftActionClass}>
                  Refresh Table
                </button>
                <div className={vipPanelClass}>
                  <span className="text-[11px] font-semibold text-slate-950">Display</span>
                  <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)} className="rounded-lg border border-amber-300/70 bg-white px-2 py-1 text-xs font-bold text-slate-950 outline-none focus:border-emerald-400/70 shadow-sm">
                    {currencyOptions.map((c) => (
                      <option key={c.code} className="bg-white text-slate-950" value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex h-9 items-center gap-1 rounded-xl border border-yellow-300/55 bg-[linear-gradient(135deg,#fffdf0_0%,#fef3c7_48%,#f8dfa2_100%)] p-1 shadow-[0_12px_30px_-20px_rgba(120,53,15,0.7)]">
                  <span className="px-2 text-[10px] uppercase tracking-widest text-slate-500">Align:</span>
                  {(["left", "center", "right"] as const).map((align) => (
                    <button key={align} type="button" onClick={() => setTextAlign(align)} className={classNames("rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition", textAlign === align ? "bg-slate-950 text-yellow-100 shadow-sm" : "text-slate-950/70 hover:bg-amber-100/80 hover:text-slate-950")}>
                      {align}
                    </button>
                  ))}
                </div>
                <div className="flex h-9 items-center gap-1 rounded-xl border border-fuchsia-300/55 bg-[linear-gradient(135deg,#faf5ff_0%,#f3e8ff_45%,#e9d5ff_100%)] p-1 shadow-[0_12px_30px_-20px_rgba(88,28,135,0.65)]">
                  <button type="button" onClick={() => setTableZoom((value) => Math.max(85, value - 5))} className="rounded-lg px-3 py-1.5 text-xs font-black text-purple-950 hover:bg-white/80">Zoom -</button>
                  <span className="min-w-12 px-2 text-center text-[11px] font-black text-purple-950">{tableZoom}%</span>
                  <button type="button" onClick={() => setTableZoom((value) => Math.min(125, value + 5))} className="rounded-lg px-3 py-1.5 text-xs font-black text-purple-950 hover:bg-white/80">Zoom +</button>
                </div>
                <button type="button" onClick={() => setOpenProfessionColors((value) => !value)} className={vipPrimaryActionClass}>
                  Profession Colors
                </button>
                <div className="relative">
                  <button
                    ref={moreMenuBtnRef}
                    type="button"
                    onClick={() => setOpenMoreMenu((v) => !v)}
                    className={vipPrimaryActionClass}
                  >
                    More Actions
                    <span className={classNames("transition-transform", openMoreMenu && "rotate-180")}>▾</span>
                  </button>
                  <MoreActionsMenu
                    open={openMoreMenu}
                    onClose={() => setOpenMoreMenu(false)}
                    anchorRef={moreMenuBtnRef as any}
                  >
                    <button type="button" onClick={openRestorePicker} className={vipDropdownItemClass}>
                      Restore JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                      className={vipDropdownItemClass}
                    >
                      Theme: {theme === "dark" ? "Dark" : "Light"}
                    </button>
                    <button type="button" onClick={handleWhatsAppShare} title="Share via WhatsApp" aria-label="Share via WhatsApp" className={vipDropdownItemClass}>
                      <span className="inline-flex h-4 w-4 items-center justify-center"><WhatsAppIcon /></span>
                      WhatsApp
                    </button>
                    <div className="relative">
                      <button
                        ref={pdfBtnRef}
                        type="button"
                        onClick={() => setOpenShare((v) => !v)}
                        title="Save/Share PDF"
                        aria-label="Save/Share PDF"
                        className={vipDropdownItemClass}
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center"><PdfIcon /></span>
                        PDF & Share
                      </button>
                      <ShareMenu open={openShare} anchorRef={pdfBtnRef as any} onClose={() => setOpenShare(false)} buildShareText={buildShareSummary} onNotify={showToast} />
                    </div>
                    <button type="button" onClick={handlePrintPdf} className={vipDropdownItemClass}>
                      Print / PDF
                    </button>
                  </MoreActionsMenu>
                </div>
                <div className="relative">
                  <button
                    ref={actionsMenuBtnRef}
                    type="button"
                    onClick={() => setOpenActionsMenu((v) => !v)}
                    className={vipPrimaryActionClass}
                  >
                    Actions
                    <span className={classNames("transition-transform", openActionsMenu && "rotate-180")}>▾</span>
                  </button>
                  <MoreActionsMenu
                    open={openActionsMenu}
                    onClose={() => setOpenActionsMenu(false)}
                    anchorRef={actionsMenuBtnRef as any}
                  >
                    <button type="button" onClick={handleActionAddRow} className={vipDropdownItemClass}>
                      Add New Row
                    </button>
                    <button type="button" onClick={handleActionModifyRow} className={vipDropdownItemClass}>
                      Modify Row
                    </button>
                    <button type="button" onClick={handleActionAddColumn} className={vipDropdownItemClass}>
                      Add New Column
                    </button>
                    <button type="button" onClick={handleActionModifyColumn} className={vipDropdownItemClass}>
                      Modify Column
                    </button>
                    <button type="button" onClick={handleActionDeleteColumn} className={vipDropdownItemClass}>
                      Delete Column
                    </button>
                    <button type="button" onClick={handleActionDeleteRow} className={vipDropdownDangerItemClass}>
                      Delete Row
                    </button>
                  </MoreActionsMenu>
                </div>
                <div className="inline-flex h-9 items-center rounded-xl border border-yellow-300/55 bg-[linear-gradient(135deg,#fffdf0_0%,#fef3c7_48%,#f8dfa2_100%)] px-3 text-[11px] font-semibold text-slate-700 shadow-[0_12px_30px_-20px_rgba(120,53,15,0.7)]">
                  {ratesLoading ? "Rates updating..." : `Auto-Update: ${ratesUpdatedAt || "Now"}`}
                  {ratesError ? <span className="ml-2 text-rose-700">({ratesError})</span> : null}
                </div>
              </div>
            </div>
 
            {openProfessionColors ? (
              <div className="mt-3 rounded-2xl border border-fuchsia-200/60 bg-white/95 p-4 shadow-[0_18px_48px_-30px_rgba(88,28,135,0.7)]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-purple-950">Profession Color Tags</div>
                  <button type="button" onClick={resetProfessionColors} className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-1.5 text-xs font-black text-purple-900 hover:bg-fuchsia-100">
                    Reset Colors
                  </button>
                </div>
                {professionList.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {professionList.map((profession, index) => {
                      const color = getProfessionColor(profession) || DEFAULT_PROFESSION_COLORS[index % DEFAULT_PROFESSION_COLORS.length];
                      return (
                        <label key={profession} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <input type="color" value={color} onChange={(event) => updateProfessionColor(profession, event.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">{profession}</span>
                          <span className="h-4 w-4 rounded-full border border-white shadow" style={{ backgroundColor: color }} />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-fuchsia-200 bg-fuchsia-50/70 px-4 py-3 text-sm font-semibold text-purple-900">
                    Add worker positions first, then assign colors by profession.
                  </div>
                )}
              </div>
            ) : null}
 
            <div className="mt-3 rounded-2xl border border-amber-200/25 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-800">
              Net Total ({displayCurrency}): {formatMoney(totals.netAmount, displayCurrency)}
            </div>
          </div>
 
          <div className="overflow-hidden rounded-[1.5rem] border border-amber-200/50">
            <div className="max-h-[72vh] overflow-auto">
              <table
                className="w-full table-fixed border-collapse text-left text-sm"
                style={{
                  minWidth: `${tableWidth}px`,
                  width: `${tableWidth}px`,
                  fontSize: `${tableZoom}%`,
                }}
              >
                <colgroup>
                  {TABLE_COLUMNS.map((column) => (
                    <col
                      key={column.key}
                      style={{ width: `${columnWidths[column.key]}px` }}
                    />
                  ))}
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[linear-gradient(135deg,#111827_0%,#3b2f11_42%,#d4af37_100%)] text-xs uppercase tracking-[0.16em] text-yellow-50 shadow-[0_16px_30px_-24px_rgba(17,24,39,0.95)] backdrop-blur-xl">
                  <tr>
                    {TABLE_COLUMNS.map((column) => {
                      const isActionColumn = column.key === "edit" || column.key === "cancel";
                      return (
                        <th
                          key={column.key}
                          scope="col"
                          className={classNames(
                            "relative border-r border-yellow-200/20 px-4 py-4 font-black last:border-r-0",
                            isActionColumn ? "text-center" : alignClass,
                          )}
                        >
                          <span className="block truncate drop-shadow-sm">
                            {column.label}
                          </span>
                          <button
                            type="button"
                            aria-label={`Resize ${column.label} column`}
                            title="Drag to resize column"
                            onMouseDown={(event) =>
                              startColumnResize(column.key, column.minWidth, event)
                            }
                            className="absolute inset-y-0 right-0 z-20 flex w-2 cursor-col-resize items-center justify-center opacity-70 transition hover:opacity-100"
                          >
                            <span className="h-7 w-px rounded-full bg-yellow-100/70" />
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
 
                <tbody className="divide-y divide-amber-100">
                  {loading ? (
                    <SkeletonRows />
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={21}
                        className="px-4 py-16 text-center text-slate-500"
                      >
                            ¦‹ advance sheet record ¦
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const isEditing = editingId === row.id && draft;
                      const view = isEditing ? draft! : row;
                      const professionColor = getProfessionColor(view.position);
 
                      const money = (val: number, cur: CurrencyCode) =>
                        formatMoney(convertToDisplay(val, cur), displayCurrency);
 
                      return (
                        <tr
                          key={row.id}
                          className="group bg-white transition hover:bg-amber-200/[0.055]"
                        >
                          <td className="px-4 py-4 font-bold text-amber-800">
                            {view.sl}
                          </td>
 
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={view.profilePicture}
                                alt={`${view.name} profile picture`}
                                className="h-11 w-11 rounded-2xl border border-amber-200/30 object-cover shadow-lg shadow-amber-200/70"
                              />
                            </div>
                          </td>
 
                          <td className="px-4 py-4 font-semibold text-slate-700">
                            {view.id}
                          </td>
 
                          <td className="px-4 py-4">
                            <span className="rounded-full border border-amber-500/45 bg-sky-400/10 px-3 py-1.5 font-mono text-xs font-bold text-sky-700">
                              {view.smartId}
                            </span>
                          </td>
 
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                value={view.name}
                                onChange={(event) =>
                                  updateDraft("name", event.target.value)
                                }
                                className="w-44 rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              <div>
                                <p className="font-bold text-slate-950">
                                  {view.name}
                                </p>
                                <p className="text-xs text-slate-500">{view.id}</p>
                              </div>
                            )}
                          </td>
 
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <input
                                value={view.position}
                                onChange={(event) =>
                                  updateDraft("position", event.target.value)
                                }
                                className="w-44 rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              <span
                                className="inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black shadow-sm"
                                style={{
                                  borderColor: professionColor
                                    ? `${professionColor}55`
                                    : "#cbd5e1",
                                  backgroundColor: professionColor
                                    ? `${professionColor}18`
                                    : "#f8fafc",
                                  color: professionColor || "#334155",
                                }}
                              >
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: professionColor || "#94a3b8",
                                  }}
                                />
                                <span className="truncate">{view.position}</span>
                              </span>
                            )}
                          </td>
 
                          <td className="px-4 py-4 text-slate-600">
                            {view.department}
                          </td>
 
                          {(["advance1", "advance2", "advance3", "advance4"] as const).map(
                            (field) => (
                              <td key={field} className="px-4 py-4 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min={0}
                                    value={view[field]}
                                    onChange={(event) =>
                                      updateDraft(field, Number(event.target.value))
                                    }
                                    className="w-28 rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-right text-slate-950 outline-none focus:border-amber-200/50"
                                  />
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="font-semibold text-slate-700">
                                      {money(view[field], view.currency)}
                                    </span>
                                    {displayCurrency !== view.currency ? (
                                      <span className="rounded-full border border-amber-200/50 bg-amber-50/70 px-2 py-0.5 text-[10px] text-slate-500">
                                        {view.currency}
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </td>
                            ),
                          )}
 
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-black text-amber-800">
                                {money(view.netAmount, view.currency)}
                              </span>
                              {displayCurrency !== view.currency ? (
                                <span className="rounded-full border border-amber-200/50 bg-amber-50/70 px-2 py-0.5 text-[10px] text-slate-500">
                                  {view.currency}
                                </span>
                              ) : null}
                            </div>
                          </td>
 
                          <td className="px-4 py-4 text-slate-600">
                            {isEditing ? (
                              <input
                                value={view.nationality}
                                onChange={(event) =>
                                  updateDraft("nationality", event.target.value)
                                }
                                className="w-32 rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              view.nationality
                            )}
                          </td>
 
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <div className="flex min-w-[240px] gap-3">
                                <label className="flex items-center gap-2 text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={view.active}
                                    onChange={(event) =>
                                      updateDraft("active", event.target.checked)
                                    }
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={view.unactive}
                                    onChange={(event) =>
                                      updateDraft("unactive", event.target.checked)
                                    }
                                  />
                                  Unactive
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={view.delayed}
                                    onChange={(event) =>
                                      updateDraft("delayed", event.target.checked)
                                    }
                                  />
                                  Delayed
                                </label>
                              </div>
                            ) : (
                              <StatusPill
                                active={view.active}
                                unactive={view.unactive}
                                delayed={view.delayed}
                              />
                            )}
                          </td>
 
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <select
                                value={view.approvalStatus}
                                onChange={(event) =>
                                  updateDraft("approvalStatus", event.target.value as ApprovalStatus)
                                }
                                className="rounded-xl border border-amber-200/50 bg-white/95 px-3 py-2 text-slate-950 outline-none focus:border-amber-200/50"
                              >
                                <option className="bg-slate-950">Approved</option>
                                <option className="bg-slate-950">Pending</option>
                                <option className="bg-slate-950">Review</option>
                                <option className="bg-slate-950">Rejected</option>
                              </select>
                            ) : (
                              <span
                                className={classNames(
                                  "rounded-full border px-3 py-1.5 text-xs font-bold shadow-lg",
                                  getApprovalBadgeClass(view.approvalStatus),
                                )}
                              >
                                {view.approvalStatus}
                              </span>
                            )}
                          </td>
 
                          <td className="px-4 py-4 text-slate-600">
                            {view.paymentMethod}
                          </td>
 
                          <td className="px-4 py-4 text-slate-500">
                            <span className="line-clamp-2 max-w-[240px]">
                              {view.remarks}
                            </span>
                          </td>
 
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {view.date ? new Date(view.date).toLocaleDateString("en-GB") : "-"}
                          </td>
 
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {new Date(view.lastUpdated).toLocaleString("en-GB")}
                          </td>
 
                          <td className="px-4 py-4 text-center">
                            {isEditing ? (
                              <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="rounded-xl border border-amber-500/45 bg-emerald-400/15 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isPending ? "Saving..." : "Save"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(row)}
                                className="rounded-xl border border-amber-300/30 bg-amber-400/15 px-4 py-2 text-xs font-black text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-400/25"
                              >
                                Edit
                              </button>
                            )}
                          </td>
 
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleRemove(row.id)}
                              className="rounded-xl border border-amber-500/45 bg-amber-100/80 px-4 py-2 text-xs font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-amber-200/90"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
 
                {!loading && filteredRows.length > 0 ? (
                  <tfoot className="bg-amber-300/10 text-sm text-amber-800">
                    <tr>
                      <td colSpan={21} className="px-4 py-3">
                        <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-5 py-2 text-center font-black">
                          <span className="opacity-90">
                            VIP Grand Summary ({displayCurrency})
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr className="font-black">
                      <td className="px-4 py-4 text-center" colSpan={7}>
                        Grand Total
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatMoney(totals.advance1, displayCurrency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatMoney(totals.advance2, displayCurrency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatMoney(totals.advance3, displayCurrency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatMoney(totals.advance4, displayCurrency)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatMoney(totals.netAmount, displayCurrency)}
                      </td>
                      <td className="px-4 py-4 text-center" colSpan={9}>
                        Active: {totals.active} Â· Unactive: {totals.unactive} Â· Delayed: {totals.delayed}
                      </td>
                    </tr>
                  </tfoot>
                ) : null}
              </table>
            </div>
          </div>
        </section>
      </section>
 
      {editingId && draft ? (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 no-print">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200/50 bg-white/95 px-4 py-3 backdrop-blur-md">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-xl border border-amber-500/45 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 px-5 py-2 text-xs font-black text-slate-950 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-xl border border-amber-500/45 bg-amber-100/80 px-5 py-2 text-xs font-black text-rose-700 hover:bg-amber-200/90"
            >
              Cancel
            </button>
            <span className="hidden text-[10px] text-slate-500 sm:block">
              Editing: {draft.name || draft.id} Â· Date: {draft.date}
            </span>
          </div>
        </div>
      ) : null}
 
      <CreateStaffModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={handleCreateNew}
        nextSL={nextSL}
        defaultCurrency="BDT"
        displayCurrency={displayCurrency}
        supportedCurrencies={currencyOptions}
        convertToDisplay={convertToDisplay}
        onNotify={showToast}
      />
 
      <BulkPasteModal
        open={openBulkPaste}
        onClose={() => setOpenBulkPaste(false)}
        onNotify={showToast}
        onSaveMany={handleBulkSave}
      />
 
      <ToastContainer toasts={toasts} onClose={closeToast} />
 
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0px); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 220ms ease-out both;
        }
        .vip-column-resizing,
        .vip-column-resizing * {
          cursor: col-resize !important;
          user-select: none !important;
        }
 
        @media print {
          @page {
            margin: 12mm;
          }
          html,
          body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .decor-bg {
            display: none !important;
          }
          .no-print,
          .no-print * {
            display: none !important;
          }
          main {
            background: #fff !important;
            color: #111 !important;
          }
          .print-surface {
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
          }
          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}