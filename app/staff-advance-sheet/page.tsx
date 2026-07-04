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

// All currency codes supported dynamically; keep type flexible
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
  date: string; // (YYYY-MM-DD)
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

const moneyFormatter = new Intl.NumberFormat("bn-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

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

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getApprovalBadgeClass(status: ApprovalStatus) {
  switch (status) {
    case "Approved":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-emerald-500/10";
    case "Pending":
      return "border-amber-400/40 bg-amber-400/10 text-amber-100 shadow-amber-500/10";
    case "Review":
      return "border-sky-400/40 bg-sky-400/10 text-sky-100 shadow-sky-500/10";
    case "Rejected":
      return "border-rose-400/40 bg-rose-400/10 text-rose-100 shadow-rose-500/10";
    default:
      return "border-white/20 bg-white/10 text-white";
  }
}

// Fallback currency meta if live symbols API fails
const CURRENCY_META_FALLBACK: Record<CurrencyCode, string> = {
  BDT: "Bangladeshi Taka",
  USD: "US Dollar",
  EUR: "Euro",
  SAR: "Saudi Riyal",
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

// Fetch all currency symbols from exchangerate.host
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
      // Ensure BDT present
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

  // Load symbols once
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
        json?.date ? new Date(json.date).toLocaleString("bn-BD") : new Date().toLocaleString("bn-BD"),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rate load error");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    loadRates();
    const id = setInterval(loadRates, 1000 * 60 * 10); // auto refresh every 10 min
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
    base, // display currency
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
  // Fixed stray/invalid character in path data
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l6-3 6 3V7" />
      <path d="M14 2l6 6" />
      <path d="M20 8h-6V2" />
    </svg>
  );
}

function MessengerIcon() {
  // Fixed invalid character in path data
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.02 2 10.98c0 2.725 1.293 5.178 3.39 6.862v3.558l3.1-1.704c1.07.3 2.212.463 3.41.463 5.523 0 10-4.02 10-8.98C21.9 6.02 17.523 2 12 2Zm-.503 6.53 2.568 2.736 4.418-2.736-4.418 4.736-2.568-2.736-4.515 2.736 4.515-4.736Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M9.03 15.44 8.87 19c.33 0 .47-.14.64-.3l1.54-1.48 3.2 2.35c.59.33 1.01.16 1.17-.54ল2.12-9.95c.19-.88-.32-1.23-.9-1.02L4.53 10.2c-.86.33-.85.8-.15 1.01l3.12.97 7.23-4.56c.34-.23.66-.1.4.14" />
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
            ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
            : "border-white/10 bg-white/5 text-slate-500",
        )}
      >
        Active
      </span>
      <span
        className={classNames(
          "rounded-full border px-2.5 py-1 text-xs font-semibold",
          unactive
            ? "border-slate-300/40 bg-slate-300/10 text-slate-100"
            : "border-white/10 bg-white/5 text-slate-500",
        )}
      >
        Unactive
      </span>
      <span
        className={classNames(
          "rounded-full border px-2.5 py-1 text-xs font-semibold",
          delayed
            ? "border-rose-300/50 bg-rose-400/15 text-rose-100"
            : "border-white/10 bg-white/5 text-slate-500",
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
        <tr key={index} className="border-b border-white/10">
          {Array.from({ length: 21 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded-full bg-white/10" />
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
    gold: "from-amber-300/25 to-yellow-600/10 text-amber-100 ring-amber-300/20",
    emerald:
      "from-emerald-300/20 to-emerald-700/10 text-emerald-100 ring-emerald-300/20",
    rose: "from-rose-300/20 to-rose-700/10 text-rose-100 ring-rose-300/20",
    sky: "from-sky-300/20 to-sky-700/10 text-sky-100 ring-sky-300/20",
  }[tone];

  return (
    <div
      className={classNames(
        "rounded-3xl bg-gradient-to-br p-5 shadow-2xl ring-1 backdrop-blur-xl",
        toneClass,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/65">{title}</p>
        <span className="rounded-full bg-white/10 p-2 text-current">
          <SparkleIcon />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-white/55">{subtitle}</p>
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
      // Ctrl/Cmd + S => submit target form
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={classNames(
          "relative z-[101] max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0a13] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10",
          fullScreen && "h-screen w-screen max-w-none rounded-none border-0 ring-0",
        )}
      >
        <div className="relative bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-rose-600/10 px-6 py-4 sm:px-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl text-center">
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
              // Moved to left top as requested
              className="absolute left-4 top-3 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryActionLabel ?? "Save"}
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80 hover:bg-white/15"
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

  // Position the menu with a portal to avoid any clipping by overflow-hidden parents
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    function compute() {
      const btn = anchorRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      // Estimated width of panel (w-64 => ~256px). We'll correct after mount if needed.
      const estimatedWidth = 256;
      let left = Math.min(
        window.innerWidth - 8 - estimatedWidth,
        Math.max(8, r.left + r.width - estimatedWidth),
      );
      let top = r.bottom + 8;

      setPos({ top, left });

      // After render, correct with actual width/height if overflows
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
    onNotify?.("Opening WhatsApp…", "info");
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
    onNotify?.("Opening Messenger…", "info");
    onClose();
  }

  function shareTelegram() {
    const text = buildShareText();
    const tg = `https://t.me/share/url?url=${urlSafe(pageUrl)}&text=${urlSafe(text)}`;
    window.open(tg, "_blank", "noopener,noreferrer");
    onNotify?.("Opening Telegram…", "info");
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
    onNotify?.("Trying to open IMO…", "info");
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
      className="z-[120] w-64 rounded-2xl border border-white/10 bg-[#0b0a13] p-2 shadow-2xl ring-1 ring-white/10"
      style={{ position: "fixed", top: pos.top, left: pos.left }}
    >
      <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Share & Export
      </div>
      <div className="flex flex-col">
        <button
          onClick={savePdf}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-rose-500/20">
            <PdfIcon />
          </span>
          Save as PDF
        </button>
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20">
            <WhatsAppIcon />
          </span>
          WhatsApp
        </button>
        <button
          onClick={shareMessenger}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-sky-500/20">
            <MessengerIcon />
          </span>
          Messenger
        </button>
        <button
          onClick={shareTelegram}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-500/20">
            <TelegramIcon />
          </span>
          Telegram
        </button>
        <button
          onClick={shareImo}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-fuchsia-500/20">
            <ShareIconSmall />
          </span>
          IMO (best-effort)
        </button>
        <button
          onClick={copyLink}
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/15">
            🔗
          </span>
          Copy Link
        </button>
        <button
          onClick={systemShare}
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/15">
            📤
          </span>
          System Share
        </button>
      </div>
    </div>
  );

  // Portal to body to avoid clipping
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

  // Track initial snapshot for beforeunload guard
  const initialRef = useRef<string>("");

  // Draft autosave to localStorage
  const DRAFT_KEY = "vip-create-staff-draft";

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

      if (key === "active" && value === true) {
        next.unactive = false;
      }
      if (key === "unactive" && value === true) {
        next.active = false;
      }

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

  // Load draft when modal opens
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

  // Set initial snapshot only when modal toggles open
  useEffect(() => {
    if (open) {
      initialRef.current = JSON.stringify(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [draft, open]);

  // beforeunload guard for modal draft
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

    if (!draft.name.trim()) return setError("Name প্রয়োজন।");
    if (!draft.id.trim()) return setError("ID প্রয়োজন।");
    if (!draft.smartId.trim()) return setError("Smart ID প্রয়োজন।");
    if (!draft.date) return setError("Date প্রয়োজন।");

    setSubmitting(true);
    try {
      await onCreate({ ...draft });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      onNotify("New staff saved successfully.", "success");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submit করতে সমস্যা হয়েছে।";
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
    return `Staff Draft — ${draft.name || "(Unnamed)"}\nID: ${draft.id}\nNet: ${formatMoney(
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
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/15"
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
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 hover:bg-white/15"
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
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              SL
            </span>
            <input
              type="number"
              min={1}
              value={draft.sl}
              onChange={(e) => patch("sl", Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              ID
            </span>
            <input
              value={draft.id}
              onChange={(e) => patch("id", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="EMP-XXXXX"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Smart ID
            </span>
            <input
              value={draft.smartId}
              onChange={(e) => patch("smartId", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="SID-XXXXXX"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Name
            </span>
            <input
              value={draft.name}
              onChange={(e) => patch("name", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="Full name"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Position
            </span>
            <input
              value={draft.position}
              onChange={(e) => patch("position", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="e.g., Senior Officer"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Department
            </span>
            <input
              value={draft.department}
              onChange={(e) => patch("department", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="e.g., Finance"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Date
            </span>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => patch("date", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Currency
            </span>
            <select
              value={draft.currency}
              onChange={(e) => patch("currency", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
            >
              {supportedCurrencies.map((c) => (
                <option key={c.code} className="bg-slate-950" value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Display</span>
              <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-100">
                Net in {displayCurrency}:{" "}
                {formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Advance 1
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance1}
                onChange={(e) => patch("advance1", Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance1", -step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance1", step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Advance 2
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance2}
                onChange={(e) => patch("advance2", Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance2", -step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance2", step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Advance 3
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance3}
                onChange={(e) => patch("advance3", Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance3", -step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance3", step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Advance 4
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft.advance4}
                onChange={(e) => patch("advance4", Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance4", -step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  -{step >= 1000 ? `${step / 1000}k` : step}
                </button>
                <button
                  type="button"
                  onClick={() => adjustAdvance("advance4", step)}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-2 text-xs"
                >
                  +{step >= 1000 ? `${step / 1000}k` : step}
                </button>
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Net Amount
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={draft.netAmount}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-bold text-amber-100 outline-none sm:w-auto"
              />
              <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-300">
                Base: {formatMoney(draft.netAmount, draft.currency)}
              </span>
              <span className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
                Display:{" "}
                {formatMoney(convertToDisplay(draft.netAmount, draft.currency), displayCurrency)}
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Nationality
            </span>
            <input
              value={draft.nationality}
              onChange={(e) => patch("nationality", e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="e.g., Bangladeshi"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Active
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch("active", e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Unactive
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={draft.unactive}
                onChange={(e) => patch("unactive", e.target.checked)}
              />
              Unactive
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Delayed
            </span>
            <label className="inline-flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={draft.delayed}
                onChange={(e) => patch("delayed", e.target.checked)}
              />
              Delayed
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
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
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
            >
              <option className="bg-slate-950">Bank</option>
              <option className="bg-slate-950">Cash</option>
              <option className="bg-slate-950">Mobile Banking</option>
              <option className="bg-slate-950">Card</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Approval Status
            </span>
            <select
              value={draft.approvalStatus}
              onChange={(e) =>
                patch("approvalStatus", e.target.value as ApprovalStatus)
              }
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
            >
              <option className="bg-slate-950">Approved</option>
              <option className="bg-slate-950">Pending</option>
              <option className="bg-slate-950">Review</option>
              <option className="bg-slate-950">Rejected</option>
            </select>
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Remarks
            </span>
            <textarea
              rows={3}
              value={draft.remarks}
              onChange={(e) => patch("remarks", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-300/50"
              placeholder="Additional notes..."
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Last Updated
            </span>
            <input
              value={new Date(draft.lastUpdated).toLocaleString("bn-BD")}
              readOnly
              className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 outline-none"
            />
          </label>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Step</span>
            <select
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none"
            >
              <option className="bg-slate-950" value={100}>
                100
              </option>
              <option className="bg-slate-950" value={500}>
                500
              </option>
              <option className="bg-slate-950" value={1000}>
                1000
              </option>
              <option className="bg-slate-950" value={5000}>
                5000
              </option>
            </select>
            <span className="ml-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">
              Net: {formatMoney(draft.netAmount, draft.currency)}
            </span>
            <span className="ml-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
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
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15"
            >
              Reset Advances
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-xs font-bold text-sky-100 hover:bg-sky-400/20"
            >
              Clear Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl border border-fuchsia-300/30 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}

// Toast system (lightweight)
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
            t.tone === "success" && "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
            t.tone === "error" && "border-rose-300/30 bg-rose-500/10 text-rose-100",
            t.tone === "info" && "border-sky-300/30 bg-sky-500/10 text-sky-100",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>{t.message}</div>
            <button
              className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/15"
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

export default function AdvanceSheetPage() {
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

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);
  const closeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Global Display Currency (Real-time)
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

  // Auto refresh toggle for data (5 minutes)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const normalizeRecords = (data: any[]): AdvanceSheetRow[] => {
    return data.map((r: any) => {
      const isoToday = new Date().toISOString().slice(0, 10);
      const date =
        r?.date ||
        (r?.lastUpdated ? String(r.lastUpdated).slice(0, 10) : isoToday);
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
        throw new Error("Advance sheet data লোড করা যায়নি।");
      }

      const payload = (await response.json()) as ApiResponse;
      const data = Array.isArray(payload.data)
        ? payload.data
        : payload.data
        ? [payload.data]
        : [];

      setRows(normalizeRecords(data));
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unexpected error occurred.",
      );
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

      const matchesApproval =
        approvalFilter === "Any" || row.approvalStatus === approvalFilter;

      const matchesPayment =
        paymentFilter === "Any" || row.paymentMethod === paymentFilter;

      const matchesDate =
        (!dateFrom || row.date >= dateFrom) && (!dateTo || row.date <= dateTo);

      return matchesSearch && matchesStatus && matchesApproval && matchesPayment && matchesDate;
    });
  }, [rows, search, statusFilter, approvalFilter, paymentFilter, dateFrom, dateTo]);

  // Totals in Display Currency (Real-time converted)
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

      if (key === "active" && value === true)
        (next as AdvanceSheetRow).unactive = false;
      if (key === "unactive" && value === true)
        (next as AdvanceSheetRow).active = false;

      (next as AdvanceSheetRow).lastUpdated = new Date().toISOString();
      return next as AdvanceSheetRow;
    });
  }

  // Idempotency key helper
  const genIdem = () => Math.random().toString(36).slice(2) + "-" + Date.now();

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

        setRows((current) =>
          current.map((row) => (row.id === draft.id ? updated : row)),
        );
        setEditingId(null);
        setDraft(null);
        showToast("Changes saved.", "success");
      } catch (saveError) {
        const msg =
          saveError instanceof Error
            ? saveError.message
            : "Update করার সময় সমস্যা হয়েছে।";
        setError(msg);
        showToast(msg, "error");
      }
    });
  }

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
        throw new Error(errorData.message || "সার্ভারে ডাটা সেভ করা যায়নি।");
      }

      const payload = (await response.json()) as ApiResponse;

      const created = (Array.isArray(payload.data)
        ? payload.data[0]
        : payload.data) as AdvanceSheetRow;

      if (!created) {
        throw new Error("সার্ভার থেকে সঠিক ডাটা রিটার্ন আসেনি।");
      }

      setRows((prev) => [...prev, created]);
    } catch (saveError) {
      console.error("Create Error:", saveError);
      const msg =
        saveError instanceof Error
          ? saveError.message
          : "নতুন স্টাফ সেভ করার সময় কোনো সমস্যা হয়েছে।";
      setError(msg);
      showToast(msg, "error");
      throw saveError;
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
    anchor.download = `vip-advance-sheet-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
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
        // Append with de-dup by id
        setRows((prev) => {
          const byId = new Map<string, AdvanceSheetRow>();
          for (const r of prev) byId.set(r.id, r);
          for (const r of normalized) byId.set(r.id, r);
          return Array.from(byId.values());
        });
        showToast(`Restored ${normalized.length} rows (merged).`, "success");
      }
    } catch (err) {
      showToast("Invalid JSON backup.", "error");
    }
  }

  function buildShareSummary() {
    return `Premium Advance Sheet — VIP Finance Control. 2026

Total rows: ${filteredRows.length}
Net total (${displayCurrency}): ${formatMoney(totals.netAmount, displayCurrency)}
Active: ${totals.active} | Unactive: ${totals.unactive} | Delayed: ${totals.delayed}
Date: ${new Date().toLocaleDateString("bn-BD")}`;
  }

  function handleWhatsAppShare() {
    try {
      const summaryText = buildShareSummary();
      const url = `https://wa.me/?text=${encodeURIComponent(
        summaryText +
          `\n\nLink: ${typeof location !== "undefined" ? location.href : ""}`,
      )}`;
      window.open(url, "_blank", "noopener,noreferrer");
      showToast("Opening WhatsApp…", "info");
    } catch {
      // silent
    }
  }

  function handlePrintPdf() {
    window.print();
  }

  const nextSL = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => Number(r.sl) || 0)) + 1 : 1),
    [rows],
  );

  // Remove staff
  async function handleRemove(id: string) {
    const confirmDelete = window.confirm(
      "আপনি কি নিশ্চিত এই স্টাফকে লিস্ট থেকে মুছে ফেলতে চান?"
    );
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
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) {
        handleCancel();
      }
      showToast("Removed from list.", "success");
    }
  }

  // PDF Share popover (Header)
  const pdfBtnRef = useRef<HTMLButtonElement>(null);
  const [openShare, setOpenShare] = useState(false);

  // Theme (minimal, keeps existing design intact)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("vip-theme") as "dark" | "light") || "dark";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vip-theme", theme);
    }
  }, [theme]);

  // Keyboard UX: focus search with "/", open create with "n", Ctrl/Cmd+S to save edit
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName || "";
      const isTyping =
        /INPUT|TEXTAREA|SELECT/.test(tag) ||
        (e.target as HTMLElement)?.isContentEditable;
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

  // beforeunload guard for inline edit
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

  return (
    <main className={classNames("min-h-screen overflow-hidden", theme === "dark" ? "bg-[#08050f] text-white" : "bg-[#f6f7fb] text-slate-900")}>
      <div className="pointer-events-none fixed inset-0 decor-bg">
        <div className="absolute left-[-10%] top-[-12%] h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[25%] h-[36rem] w-[36rem] rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:54px_54px] opacity-20" />
      </div>

      <section className="relative mx-auto max-w-[1800px] px-4 py-0 sm:px-6 lg:px-2">
        <header className="relative overflow-hidden rounded-[2rem] border border-amber-200/20 bg-white/[0.055] p-6 shadow-[0_0_70px_rgba(245,158,11,0.14)] backdrop-blur-2xl sm:p-8 lg:p-10 print-surface">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
          <div className="absolute right-6 top-6 hidden rounded-full border border-amber-200/20 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-100 lg:block">
            VIP
          </div>

          {/* Add New Staff moved to top-left as requested */}
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="no-print absolute left-6 top-6 inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl active:scale-95 focus:outline-none"
          >
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
              +
            </span>
            <span className="relative z-10">Add New Staff</span>
          </button>

          <div className="flex flex-col items-center gap-1 text-center">
            <div className="-mt-1 mb-1 inline-flex items-center gap-3 rounded-full border border-amber-200/25 bg-gradient-to-r from-amber-300/15 to-white/5 px-2 py-1 text-2xl font-semibold text-amber-100 shadow-2xl shadow-amber-900/20">
              <CrownIcon />
              Premium Advance Sheet
            </div>

            <h1 className="max-w-5xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              <span className="bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent"></span>
            </h1>

            <p className="mt-1.5 max-w-4xl text-base leading-7 text-slate-400 xs:text-lg">
              VIP Finance Control. 2026
            </p>

            <div className="no-print mt-4 w-full overflow-x-auto">
              <div className="inline-flex w-max items-center gap-3 whitespace-nowrap">
                <button
                  onClick={exportCsv}
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-amber-200/25 bg-amber-300/15 px-5 text-sm font-bold text-amber-50 shadow-lg shadow-amber-900/20 transition hover:-translate-y-0.5 hover:bg-amber-300/25"
                >
                  Export CSV
                </button>

                <button
                  onClick={backupJson}
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-5 text-sm font-bold text-emerald-50 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-300/20"
                >
                  Backup JSON
                </button>

                <button
                  onClick={openRestorePicker}
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-sky-300/25 bg-sky-300/10 px-5 text-sm font-bold text-sky-50 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-300/20"
                >
                  Restore JSON
                </button>
                <input
                  ref={restoreInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={onRestorePicked}
                />

                <button
                  onClick={() => location.reload()}
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Refresh
                </button>

                {/* Auto Refresh Toggle */}
                <button
                  type="button"
                  onClick={() => setAutoRefresh((v) => !v)}
                  className={classNames(
                    "inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold transition",
                    autoRefresh
                      ? "border-emerald-300/30 bg-emerald-600/30 text-emerald-50"
                      : "border-white/15 bg-white/10 text-white",
                  )}
                >
                  {autoRefresh ? "Auto Refresh: ON" : "Auto Refresh: OFF"}
                </button>

                {/* Theme toggle (minimal) */}
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Theme: {theme === "dark" ? "Dark" : "Light"}
                </button>

                {/* Global Display Currency Selector */}
                <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-3">
                  <span className="text-xs font-semibold text-emerald-100">Display</span>
                  <select
                    value={displayCurrency}
                    onChange={(e) => setDisplayCurrency(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300/50"
                  >
                    {currencyOptions.map((c) => (
                      <option key={c.code} className="bg-slate-950" value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/10 px-4 text-xs text-slate-300">
                  {ratesLoading ? "Rates updating..." : `Auto-Update: ${ratesUpdatedAt || "Now"}`}
                  {ratesError ? (
                    <span className="ml-2 text-rose-300">({ratesError})</span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  title="Share via WhatsApp"
                  aria-label="Share via WhatsApp"
                  className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-gradient-to-r from-emerald-600 to-green-600 px-5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-95"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <WhatsAppIcon />
                  </span>
                  WhatsApp
                </button>

                {/* Old Add New Staff button hidden to avoid duplication after moving to top-left */}
                <button
                  type="button"
                  onClick={() => setOpenCreate(true)}
                  className="hidden relative h-11 min-w-[150px] items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl active:scale-95 focus:outline-none"
                >
                  <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 blur-xl transition-opacity duration-300 hover:opacity-100" />
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                    +
                  </span>
                  <span className="relative z-10">Add New Staff</span>
                </button>

                <div className="relative">
                  <button
                    ref={pdfBtnRef}
                    type="button"
                    onClick={() => setOpenShare((v) => !v)}
                    title="Save/Share PDF"
                    aria-label="Save/Share PDF"
                    className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-rose-300/30 bg-gradient-to-r from-rose-600 to-pink-600 px-5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-95"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                      <PdfIcon />
                    </span>
                    PDF & Share
                  </button>
                  <ShareMenu
                    open={openShare}
                    anchorRef={pdfBtnRef as any}
                    onClose={() => setOpenShare(false)}
                    buildShareText={buildShareSummary}
                    onNotify={showToast}
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="hidden"
                >
                  Hidden Print
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <VipMetricCard
            title="Total Net Amount"
            value={formatMoney(totals.netAmount, displayCurrency)}
            subtitle={`Visible rows: ${filteredRows.length} — ${displayCurrency}`}
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
              totals.advance1 +
                totals.advance2 +
                totals.advance3 +
                totals.advance4,
            )}
            subtitle={`A1 + A2 + A3 + A4 (${displayCurrency})`}
            tone="sky"
          />
        </section>

        {/* Advanced Filters */}
        <section className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 no-print">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <label className="relative flex-1">
              <span className="sr-only">Search advance sheet</span>
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, Smart ID, Name, Position, Nationality, Date..."
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500 transition focus:border-amber-200/50 focus:bg-black/35"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-amber-200/50"
            >
              <option className="bg-slate-950" value="All">
                All Status
              </option>
              <option className="bg-slate-950" value="Active">
                Active
              </option>
              <option className="bg-slate-950" value="Unactive">
                Unactive
              </option>
              <option className="bg-slate-950" value="Delayed">
                Delayed
              </option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) =>
                setApprovalFilter(e.target.value as "Any" | ApprovalStatus)
              }
              className="rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-amber-200/50"
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
              className="rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-amber-200/50"
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
              className="rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-amber-200/50"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-amber-200/50"
              placeholder="To date"
            />
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
          <div className="flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between no-print">
            <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row">
              {/* moved search/filters to the above section */}
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <div className="rounded-2xl border border-amber-200/15 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
                Net Total ({displayCurrency}): {formatMoney(totals.netAmount, displayCurrency)}
              </div>

              {editingId && draft ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="rounded-xl border border-emerald-300/30 bg-emerald-500/20 px-4 py-3 text-xs font-black text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-xs font-black text-rose-100 hover:bg-rose-500/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="max-h-[72vh] overflow-auto">
              <table className="min-w-[1950px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#120d1d]/95 text-xs uppercase tracking-[0.18em] text-amber-100 backdrop-blur-xl">
                  <tr>
                    <th className="px-4 py-4">SL</th>
                    <th className="px-4 py-4">Profile</th>
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">SmartID</th>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Position</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4 text-right">Advance1</th>
                    <th className="px-4 py-4 text-right">Advance2</th>
                    <th className="px-4 py-4 text-right">Advance3</th>
                    <th className="px-4 py-4 text-right">Advance4</th>
                    <th className="px-4 py-4 text-right">NetAmount</th>
                    <th className="px-4 py-4">Nationality</th>
                    <th className="px-4 py-4">Active / Unactive </th>
                    <th className="px-4 py-4">Approval</th>
                    <th className="px-4 py-4">Payment</th>
                    <th className="px-4 py-4">Remarks</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">LastUpdated</th>
                    <th className="px-4 py-4 text-center">Edit</th>
                    <th className="px-4 py-4 text-center">Cancel</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <SkeletonRows />
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={21}
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        কোনো advance sheet record পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const isEditing = editingId === row.id && draft;
                      const view = isEditing ? draft! : row;

                      const money = (val: number, cur: CurrencyCode) =>
                        formatMoney(convertToDisplay(val, cur), displayCurrency);

                      return (
                        <tr
                          key={row.id}
                          className="group bg-white/[0.025] transition hover:bg-amber-200/[0.055]"
                        >
                          <td className="px-4 py-4 font-bold text-amber-100">
                            {view.sl}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={view.profilePicture}
                                alt={`${view.name} profile picture`}
                                className="h-11 w-11 rounded-2xl border border-amber-200/30 object-cover shadow-lg shadow-amber-950/40"
                              />
                            </div>
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-200">
                            {view.id}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1.5 font-mono text-xs font-bold text-sky-100">
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
                                className="w-44 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              <div>
                                <p className="font-bold text-white">
                                  {view.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {view.id}
                                </p>
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
                                className="w-44 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              <span className="text-slate-200">
                                {view.position}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-slate-300">
                            {view.department}
                          </td>

                          {(
                            ["advance1", "advance2", "advance3", "advance4"] as const
                          ).map((field) => (
                            <td key={field} className="px-4 py-4 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min={0}
                                  value={view[field]}
                                  onChange={(event) =>
                                    updateDraft(field, Number(event.target.value))
                                  }
                                  className="w-28 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-right text-white outline-none focus:border-amber-200/50"
                                />
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-semibold text-slate-200">
                                    {money(view[field], view.currency)}
                                  </span>
                                  {displayCurrency !== view.currency ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                                      {view.currency}
                                    </span>
                                  ) : null}
                                </div>
                              )}
                            </td>
                          ))}

                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 font-black text-amber-100">
                                {money(view.netAmount, view.currency)}
                              </span>
                              {displayCurrency !== view.currency ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                                  {view.currency}
                                </span>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-slate-300">
                            {isEditing ? (
                              <input
                                value={view.nationality}
                                onChange={(event) =>
                                  updateDraft("nationality", event.target.value)
                                }
                                className="w-32 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200/50"
                              />
                            ) : (
                              view.nationality
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {isEditing ? (
                              <div className="flex min-w-[240px] gap-3">
                                <label className="flex items-center gap-2 text-xs text-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={view.active}
                                    onChange={(event) =>
                                      updateDraft("active", event.target.checked)
                                    }
                                  />
                                  Active
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-200">
                                  <input
                                    type="checkbox"
                                    checked={view.unactive}
                                    onChange={(event) =>
                                      updateDraft("unactive", event.target.checked)
                                    }
                                  />
                                  Unactive
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-200">
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
                                  updateDraft(
                                    "approvalStatus",
                                    event.target.value as ApprovalStatus,
                                  )
                                }
                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-200/50"
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

                          <td className="px-4 py-4 text-slate-300">
                            {view.paymentMethod}
                          </td>

                          <td className="px-4 py-4 text-slate-400">
                            <span className="line-clamp-2 max-w-[240px]">
                              {view.remarks}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-xs text-slate-300">
                            {view.date
                              ? new Date(view.date).toLocaleDateString("bn-BD")
                              : "-"}
                          </td>

                          <td className="px-4 py-4 text-xs text-slate-500">
                            {new Date(view.lastUpdated).toLocaleString("bn-BD")}
                          </td>

                          <td className="px-4 py-4 text-center">
                            {isEditing ? (
                              <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isPending ? "Saving..." : "Save"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(row)}
                                className="rounded-xl border border-amber-300/30 bg-amber-400/15 px-4 py-2 text-xs font-black text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-400/25"
                              >
                                Edit
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleRemove(row.id)}
                              className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-2 text-xs font-black text-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-400/20"
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
                  <tfoot className="bg-amber-300/10 text-sm text-amber-100">
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
                        Active: {totals.active} · Unactive: {totals.unactive} ·
                        Delayed: {totals.delayed}
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
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0a13]/90 px-4 py-3 backdrop-blur-md">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-xl border border-emerald-300/30 bg-emerald-500/20 px-5 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-xl border border-rose-300/25 bg-rose-500/10 px-5 py-2 text-xs font-black text-rose-100 hover:bg-rose-500/20"
            >
              Cancel
            </button>
            <span className="hidden text-[10px] text-slate-400 sm:block">
              Editing: {draft.name || draft.id} · Date: {draft.date}
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

      <ToastContainer toasts={toasts} onClose={closeToast} />

      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0px); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 220ms ease-out both;
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