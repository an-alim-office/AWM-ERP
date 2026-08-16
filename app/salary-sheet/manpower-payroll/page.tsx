"use client";

import React, { useState } from "react";

// Types for Employee Data
interface ManpowerWorker {
    sl: number;
    id: string;
    name: string;
    trade: string;
    hours: number;
    ratePerHour: number;
    advance: number;
    deduction: number;
    photoUrl?: string;
    // Ad-hoc extra columns added via the Row/Column tool (keyed by custom
    // column id, value is whatever text the user typed for that worker).
    customFields?: Record<string, string>;
}

type EditDraft = {
    id: string;
    name: string;
    trade: string;
    hours: number;
    ratePerHour: number;
    advance: number;
    deduction: number;
    photoUrl?: string;
    customFields?: Record<string, string>;
};

// Default sample data (used only when nothing is saved yet)
const DEFAULT_WORKERS: ManpowerWorker[] = [
    { sl: 1, id: "MP-101", name: "Rahim Uddin", trade: "Mason", hours: 220, ratePerHour: 15, advance: 500, deduction: 0 },
    { sl: 2, id: "MP-102", name: "Karim Hossain", trade: "Electrician", hours: 200, ratePerHour: 18, advance: 300, deduction: 0 },
    { sl: 3, id: "MP-103", name: "Salam Miah", trade: "Helper", hours: 240, ratePerHour: 10, advance: 200, deduction: 0 },
];

// localStorage keys — kept in one place so they're easy to change later
const LS_KEYS = {
    workers: "manpower-workers",
    monthlyWorkers: "manpower-monthly-workers",
    companyName: "manpower-company-name",
    currency: "manpower-currency",
    whatsAppTheme: "whatsapp-theme",
    messengerTheme: "messenger-theme",
    selectedYear: "manpower-selected-year",
    selectedMonth: "manpower-selected-month",
    customColumns: "manpower-custom-columns",
    sheetType: "manpower-sheet-type",
};
// Small helper: safely read + JSON-parse a localStorage value.
// Returns `fallback` if we're on the server, the key is missing, or the
// stored value is corrupted JSON (so a bad value never crashes the app).
function readLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

// Older saves stored workers as: { "2026-8": ManpowerWorker[] } — one company
// per period. The multi-company feature nests one more level:
// { "2026-8": { "Company A": ManpowerWorker[], "Company B": ManpowerWorker[] } }.
// This upgrades any old-format entries in place (using whatever company name
// was saved at the time) so existing saved data isn't lost.
function migrateCompanyMonthlyWorkers(
    raw: unknown,
    fallbackCompanyKey: string
): Record<string, Record<string, ManpowerWorker[]>> {
    if (!raw || typeof raw !== "object") return {};
    const migrated: Record<string, Record<string, ManpowerWorker[]>> = {};
    for (const [periodKey, value] of Object.entries(raw as Record<string, unknown>)) {
        if (Array.isArray(value)) {
            migrated[periodKey] = { [fallbackCompanyKey]: value as ManpowerWorker[] };
        } else if (value && typeof value === "object") {
            migrated[periodKey] = value as Record<string, ManpowerWorker[]>;
        }
    }
    return migrated;
}

export default function ManpowerPayrollPage() {
    // ===== Persisted State =====
    const [workers, setWorkers] = useState<ManpowerWorker[]>(DEFAULT_WORKERS);
    // Nested by period first, then by company: companyMonthlyWorkers[periodKey][companyKey].
    // This is what lets the same year+month hold several companies' worker
    // lists side by side, switchable from the company dropdown.
    const [companyMonthlyWorkers, setCompanyMonthlyWorkers] = useState<
        Record<string, Record<string, ManpowerWorker[]>>
    >({});
    const [companyName, setCompanyName] = useState<string>("");
    const [currency, setCurrency] = useState<string>("SAR");

    // Company switcher dropdown (next to the Company Name display) + its
    // per-row "copied" feedback.
    const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
    const [copiedCompany, setCopiedCompany] = useState<string | null>(null);
    const companyMenuRef = React.useRef<HTMLDivElement>(null);

    const [isHydrated, setIsHydrated] = useState(false);
    // "manpower" = আগের ফুল ফিচার শিট, "driver" = নতুন Driver Salary Sheet মোড।
    // দুটোই ঠিক একই workers/companyMonthlyWorkers ইঞ্জিন ব্যবহার করে —
    // শুধু কলাম লেবেল/লেআউট আলাদা দেখায় (নিচে periodKey দ্রষ্টব্য)।
    const [sheetType, setSheetType] = useState<"manpower" | "driver">("manpower");

    // Unified "More" dropdown (v-icon) — Clear All-এর বাম পাশে।
    const [mainMenuOpen, setMainMenuOpen] = useState(false);
    const mainMenuRef = React.useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
    const [bulkPasteText, setBulkPasteText] = useState("");
    // Duplicate-prevention feedback shown inline in the two "add worker"
    // modals (composite key: company_name + worker_id + month + year).
    const [addWorkerError, setAddWorkerError] = useState<string | null>(null);
    const [bulkPasteError, setBulkPasteError] = useState<string | null>(null);

    // Bulk Deduction (%) — the small dropdown in the Deduction column header
    // that lets you cut a percentage off every worker's Gross Salary at once.
    const [bulkDeductionOpen, setBulkDeductionOpen] = useState(false);
    const [bulkDeductionPercent, setBulkDeductionPercent] = useState("");
    const [bulkDeductionError, setBulkDeductionError] = useState<string | null>(null);
    const bulkDeductionRef = React.useRef<HTMLDivElement>(null);

    // Bulk Advance Entry — the small dropdown in the Advance column header
    // that lets you paste a list of "Worker ID  Amount" lines and set each
    // matched worker's Advance in one go.
    const [bulkAdvanceOpen, setBulkAdvanceOpen] = useState(false);
    const [bulkAdvanceText, setBulkAdvanceText] = useState("");
    const [bulkAdvanceError, setBulkAdvanceError] = useState<string | null>(null);
    const bulkAdvanceRef = React.useRef<HTMLDivElement>(null);

    // Bulk Profile Photo Upload — the small ▼ dropdown in the SL column
    // header that lets the user select many image files at once. Each
    // file's name (minus extension) is matched against a worker's ID and
    // that worker's photoUrl is set automatically — no manual per-row
    // photo picking needed.
    const [bulkPhotoOpen, setBulkPhotoOpen] = useState(false);
    const [bulkPhotoError, setBulkPhotoError] = useState<string | null>(null);
    const bulkPhotoRef = React.useRef<HTMLDivElement>(null);

    // Row / Column / Table-size tool — the small ▼ dropdown just to the
    // left of "Clear All" that lets the user (a) append blank rows to the
    // table, (b) add ad-hoc custom columns, and (c) grow/shrink the whole
    // table (this simply reuses the existing zoom controls below).
    const [rowColumnMenuOpen, setRowColumnMenuOpen] = useState(false);
    const rowColumnMenuRef = React.useRef<HTMLDivElement>(null);
    const [addRowsCount, setAddRowsCount] = useState("");
    const [customColumns, setCustomColumns] = useState<{ id: string; label: string }[]>([]);
    const [newColumnLabel, setNewColumnLabel] = useState("");

    // Rows are now identified by their (always-unique) `sl` serial number
    // instead of `id`, because "Add Rows" can create several blank rows
    // whose Worker ID is empty until the user fills it in — those would
    // otherwise collide if tracked by id.
    const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
    const [editingWorkerSl, setEditingWorkerSl] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState<Partial<EditDraft>>({});

    const currencyOptions = [
        { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
        { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
        { code: "USD", name: "US Dollar", symbol: "$" },
        { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
        { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
        { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
        { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
        { code: "OMR", name: "Omani Rial", symbol: "﷼" },
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "GBP", name: "British Pound", symbol: "£" },
        { code: "INR", name: "Indian Rupee", symbol: "₹" },
        { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
    ];

    const selectedCurrency =
        currencyOptions.find((item) => item.code === currency) || currencyOptions[0];
    const [searchQuery, setSearchQuery] = useState("");

    // NOTE: These still start with today's year/month as the deterministic
    // default (needed so server and client render the same thing on first
    // paint). The real fix is the post-mount load effect further below,
    // which overwrites these with whatever was last saved in localStorage —
    // see LS_KEYS.selectedYear / LS_KEYS.selectedMonth.
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [activeResizeColumn, setActiveResizeColumn] = useState<string | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);

    const handleColumnDoubleClick = (columnKey: string) => {
        const defaultWidths: Record<string, number> = {
            sl: 60,
            id: 110,
            name: 180,
            trade: 140,
            hours: 110,
            rate: 110,
            gross: 140,
            advance: 130,
            deduction: 130,
            net: 140,
            action: 100,
        };

        const currentWidth = columnWidths[columnKey] || defaultWidths[columnKey] || 120;
        const nextWidth = currentWidth < 160 ? Math.min(currentWidth * 1.5, 300) : 80;

        setColumnWidths((prev) => ({
            ...prev,
            [columnKey]: nextWidth,
        }));
    };

    const handleColumnResizeStart = (
        e: React.MouseEvent,
        columnKey: string,
        currentWidth: number
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveResizeColumn(columnKey);
        setResizeStartX(e.clientX);
        setResizeStartWidth(currentWidth);
    };

    React.useEffect(() => {
        if (!activeResizeColumn) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(
                60,
                Math.min(400, resizeStartWidth + (e.clientX - resizeStartX))
            );

            setColumnWidths((prev) => ({
                ...prev,
                [activeResizeColumn]: newWidth,
            }));
        };

        const handleMouseUp = () => {
            setActiveResizeColumn(null);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [activeResizeColumn, resizeStartX, resizeStartWidth]);

    // ===== Toolbar State =====
    const [toolbarOpen, setToolbarOpen] = useState(false);
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    const [alignMode, setAlignMode] =
        useState<"left" | "center" | "right">("left");

    const [zoomLevel, setZoomLevel] = useState(100);

    const [whatsAppTheme, setWhatsAppTheme] = useState<"light" | "dark">("light");
    const [messengerTheme, setMessengerTheme] = useState<"light" | "dark">("light");

    // ===== One-time Post-mount Load =====
    React.useEffect(() => {
        setWorkers(readLocalStorage<ManpowerWorker[]>(LS_KEYS.workers, DEFAULT_WORKERS));
        const savedCompanyName = readLocalStorage<string>(LS_KEYS.companyName, "");
        const rawMonthly = readLocalStorage<unknown>(LS_KEYS.monthlyWorkers, {});
        setCompanyMonthlyWorkers(
            migrateCompanyMonthlyWorkers(
                rawMonthly,
                (savedCompanyName || "Unnamed Company").trim() || "Unnamed Company"
            )
        );
        setCompanyName(savedCompanyName);
        setCurrency(readLocalStorage<string>(LS_KEYS.currency, "SAR"));
        setWhatsAppTheme(
            readLocalStorage<"light" | "dark">(LS_KEYS.whatsAppTheme, "light")
        );
        setMessengerTheme(
            readLocalStorage<"light" | "dark">(LS_KEYS.messengerTheme, "light")
        );
        // Restore the last-used Year/Month period so a refresh doesn't jump
        // back to the current calendar month.
        setSelectedYear(
            readLocalStorage<number>(LS_KEYS.selectedYear, new Date().getFullYear())
        );
        setSelectedMonth(
            readLocalStorage<number>(LS_KEYS.selectedMonth, new Date().getMonth() + 1)
        );
        // Restore any custom (user-added) columns.
        setCustomColumns(
            readLocalStorage<{ id: string; label: string }[]>(LS_KEYS.customColumns, [])
        );
        setSheetType(
            readLocalStorage<"manpower" | "driver">(LS_KEYS.sheetType, "manpower")
        );
        setIsHydrated(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Persistence Effects =====
    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.workers, JSON.stringify(workers));
        } catch {
            // ignore
        }
    }, [workers, isHydrated]);

    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.monthlyWorkers, JSON.stringify(companyMonthlyWorkers));
        } catch {
            // ignore
        }
    }, [companyMonthlyWorkers, isHydrated]);

    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.companyName, JSON.stringify(companyName));
        } catch {
            // ignore
        }
    }, [companyName, isHydrated]);

    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.currency, JSON.stringify(currency));
        } catch {
            // ignore
        }
    }, [currency, isHydrated]);

    // Persist selectedYear / selectedMonth so a page refresh restores the
    // exact salary period the user was last viewing instead of resetting
    // to the current month.
    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.selectedYear, JSON.stringify(selectedYear));
        } catch {
            // ignore
        }
    }, [selectedYear, isHydrated]);

    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.selectedMonth, JSON.stringify(selectedMonth));
        } catch {
            // ignore
        }
    }, [selectedMonth, isHydrated]);

    // Persist any custom columns the user has added via the Row/Column tool.
    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.customColumns, JSON.stringify(customColumns));
        } catch {
            // ignore
        }
    }, [customColumns, isHydrated]);

    React.useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(LS_KEYS.sheetType, JSON.stringify(sheetType));
        } catch {
            // ignore
        }
    }, [sheetType, isHydrated]);

    const [newWorker, setNewWorker] = useState({
        id: "",
        name: "",
        trade: "",
        hours: 0,
        ratePerHour: 0,
        advance: 0,
        deduction: 0,
        photoUrl: "",
    });

    const handlePhotoUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        onLoaded: (dataUrl: string) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onLoaded(reader.result);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
                setToolbarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-action-menu]")) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the company switcher dropdown on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (companyMenuRef.current && !companyMenuRef.current.contains(e.target as Node)) {
                setCompanyMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the bulk-deduction popover on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (bulkDeductionRef.current && !bulkDeductionRef.current.contains(e.target as Node)) {
                setBulkDeductionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the bulk-advance popover on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (bulkAdvanceRef.current && !bulkAdvanceRef.current.contains(e.target as Node)) {
                setBulkAdvanceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the bulk-photo-upload popover on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (bulkPhotoRef.current && !bulkPhotoRef.current.contains(e.target as Node)) {
                setBulkPhotoOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the Row/Column/Table-size popover on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (rowColumnMenuRef.current && !rowColumnMenuRef.current.contains(e.target as Node)) {
                setRowColumnMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Close the unified "More" menu on outside click.
    React.useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (mainMenuRef.current && !mainMenuRef.current.contains(e.target as Node)) {
                setMainMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const toggleToolbar = () => {
        setToolbarOpen((prev) => !prev);
    };

    const handleAlign = (mode: "left" | "center" | "right") => {
        setAlignMode(mode);
    };

    const alignClass =
        alignMode === "left" ? "text-left" : alignMode === "center" ? "text-center" : "text-right";

    const zoomOut = () => {
        setZoomLevel((z) => Math.max(50, z - 10));
    };

    const zoomIn = () => {
        setZoomLevel((z) => Math.min(300, z + 10));
    };

    const resetZoom = () => {
        setZoomLevel(100);
    };

    // Refresh — workers / monthlyWorkers / companyName / currency /
    // selectedYear / selectedMonth are all mirrored into localStorage on
    // every change, so the lazy load effect above restores everything,
    // including the exact salary period, after reload.
    const refreshPage = () => {
        window.location.reload();
    };

    const changeWhatsAppTheme = (
        theme: "light" | "dark"
    ) => {
        setWhatsAppTheme(theme);
        localStorage.setItem(LS_KEYS.whatsAppTheme, theme);
    };

    const changeMessengerTheme = (
        theme: "light" | "dark"
    ) => {
        setMessengerTheme(theme);
        localStorage.setItem(LS_KEYS.messengerTheme, theme);
    };

    const buildSummaryText = () => {
        return [
            companyName || "Manpower Salary Sheet",
            `Period: ${monthNames[selectedMonth - 1]} ${selectedYear}`,
            `Workers: ${filteredWorkers.length}`,
            `Total Hours: ${totalHours}`,
            `Total Gross: ${selectedCurrency.symbol}${totalGrossSalary.toFixed(2)}`,
            `Total Advance: ${selectedCurrency.symbol}${totalAdvance.toFixed(2)}`,
            `Total Deduction: ${selectedCurrency.symbol}${totalDeduction.toFixed(2)}`,
            `Total Net Payable: ${selectedCurrency.symbol}${totalNetPayable.toFixed(2)}`,
        ].join("\n");
    };

    const shareViaWhatsApp = () => {
        const text = encodeURIComponent(buildSummaryText());
        window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
        setToolbarOpen(false);
    };

    const shareViaMessenger = async () => {
        try {
            await navigator.clipboard.writeText(buildSummaryText());
        } catch {
            // ignore
        }
        window.open("https://www.messenger.com/", "_blank", "noopener,noreferrer");
        setToolbarOpen(false);
    };

    const calculateGrossSalary = (hours: number, rate: number) => hours * rate;
    const calculateNetAmount = (hours: number, rate: number, advance: number, deduction: number) =>
        calculateGrossSalary(hours, rate) - advance - deduction;

    const totalHours = workers.reduce((acc, curr) => acc + Number(curr.hours), 0);
    const totalGrossSalary = workers.reduce(
        (acc, curr) => acc + calculateGrossSalary(curr.hours, curr.ratePerHour),
        0
    );
    const totalAdvance = workers.reduce((acc, curr) => acc + Number(curr.advance), 0);
    const totalDeduction = workers.reduce((acc, curr) => acc + Number(curr.deduction), 0);
    const totalNetPayable = workers.reduce(
        (acc, curr) => acc + calculateNetAmount(curr.hours, curr.ratePerHour, curr.advance, curr.deduction),
        0
    );
    // NOTE on auto-updating dashboard cards: the four summary cards below
    // (Total Net Amount, Active Members, Delayed Cases, Advance Volume) are
    // all derived directly from the `workers` state on every render. Since
    // handleCompanySwitch() replaces `workers` with the target company's
    // list, these totals recompute automatically the instant the company
    // changes — no extra "refresh" step is needed.

    // sheetType যুক্ত থাকায় Manpower আর Driver-এর ডাটা স্বয়ংক্রিয়ভাবে
    // আলাদা থাকে — বাকি সব ফাংশন (Bulk Paste, Export, Add Worker,
    // duplicate-check ইত্যাদি) অপরিবর্তিত থেকেও দুই শিটের ডাটা মিশবে না।
    const periodKey = `${sheetType}-${selectedYear}-${selectedMonth}`;

    // The company currently being viewed/edited, keyed within the current
    // period. Falls back to a stable label so blank-name entries still get
    // a consistent storage key instead of colliding under "".
    const companyKey = (companyName.trim() || "Unnamed Company");

    // Every company that has data saved for the current year+month, plus
    // whichever company is active right now (even if it has no workers
    // yet) so a brand-new company still shows up highlighted in the list.
    const periodCompanies = Array.from(
        new Set([...Object.keys(companyMonthlyWorkers[periodKey] || {}), companyKey])
    ).sort((a, b) => a.localeCompare(b));

    // ===== Duplicate Prevention Helpers =====
    // Normalizes a Worker ID for comparison (trims whitespace, case-insensitive)
    // so "MP-101", " mp-101 ", and "Mp-101" are treated as the same ID.
    const normalizeId = (id: string) => id.trim().toLowerCase();

    // Bulk Advance Entry and Bulk Photo Upload need something unique to
    // match a pasted line / an uploaded file's name against a worker row.
    // Manpower rows are matched by Worker ID as before; the Driver sheet
    // never collects a Worker ID (see the Add Worker modal below), so
    // driver rows are matched by Name instead. This is what keeps those
    // two bulk-entry tools working correctly on whichever sheet is active.
    const getMatchIdentifier = (worker: ManpowerWorker) =>
        sheetType === "driver" ? worker.name : worker.id;
    const identifierLabel = sheetType === "driver" ? "Driver Name" : "Worker ID";

    // Enforces the composite uniqueness rule: company_name + worker_id +
    // month + year. The same worker_id IS allowed to repeat across
    // different companies or different months/years — it is only a
    // duplicate when company + worker_id + month + year all match.
    // `excludeSl` lets an in-place edit skip matching itself.
    const findDuplicateWorker = (
        id: string,
        company: string,
        period: string,
        excludeSl?: number
    ): ManpowerWorker | undefined => {
        const target = normalizeId(id);
        if (!target) return undefined;
        const list =
            company === companyKey && period === periodKey
                ? workers
                : companyMonthlyWorkers[period]?.[company] || [];
        return list.find((w) => normalizeId(w.id) === target && w.sl !== excludeSl);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const handlePeriodChange = (year: number, month: number) => {
        const oldKey = `${sheetType}-${selectedYear}-${selectedMonth}`;
        const newKey = `${sheetType}-${year}-${month}`;

        setCompanyMonthlyWorkers((prev) => {
            const oldPeriodData = { ...(prev[oldKey] || {}) };
            oldPeriodData[companyKey] = workers;
            const next = { ...prev, [oldKey]: oldPeriodData };
            const newPeriodData = next[newKey] || {};
            setWorkers(newPeriodData[companyKey] || []);
            return next;
        });
        setSelectedYear(year);
        setSelectedMonth(month);
    };

    // Manpower ⇄ Driver সুইচ — বর্তমান শিটের ডাটা সেভ করে রেখে টার্গেট
    // sheetType-এর (একই company + একই year/month-এর) ডাটা লোড করে।
    // handleCompanySwitch-এর মতোই কাজ করে, শুধু periodKey-এর sheetType অংশ বদলায়।
    const handleSheetTypeSwitch = (type: "manpower" | "driver") => {
        if (type === sheetType) {
            setMainMenuOpen(false);
            return;
        }
        const oldKey = `${sheetType}-${selectedYear}-${selectedMonth}`;
        const newKey = `${type}-${selectedYear}-${selectedMonth}`;

        setCompanyMonthlyWorkers((prev) => {
            const oldPeriodData = { ...(prev[oldKey] || {}) };
            oldPeriodData[companyKey] = workers;
            const next = { ...prev, [oldKey]: oldPeriodData };
            const newPeriodData = next[newKey] || {};
            setWorkers(newPeriodData[companyKey] || []);
            return next;
        });
        setSheetType(type);
        setMainMenuOpen(false);
    };

    // Switches the active company for the current period:

    // Switches the active company for the current period: saves whatever
    // is on screen under the company you're leaving, then loads the target
    // company's data (blank if it doesn't have any yet). Because `workers`
    // changes here, every total/card that reads from `workers` re-renders
    // with the new company's numbers automatically.
    const handleCompanySwitch = (company: string) => {
        const currentKey = companyKey;
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[currentKey] = workers;
            const next = { ...prev, [periodKey]: periodData };
            setWorkers(periodData[company] || []);
            return next;
        });
        setCompanyName(company);
        setCompanyMenuOpen(false);
    };

    // Prompts for a brand-new company name and switches straight to it
    // (blank table, ready for Add Worker / Bulk Paste) for the current
    // year+month. If the name already exists for this period, it just
    // switches to that existing company instead of creating a duplicate.
    const handleCreateNewCompany = () => {
        const name = window.prompt("নতুন কোম্পানির নাম লিখুন:");
        if (name === null) return;
        const trimmed = name.trim();
        if (!trimmed) return;
        handleCompanySwitch(trimmed);
    };

    // Copies one company's full worker table (for the current period) to
    // the clipboard as tab-separated text, so it pastes cleanly into Excel
    // or Google Sheets. Works for any company in the dropdown, not just the
    // one currently on screen. Adapts its columns to whichever sheet
    // (Manpower / Driver) is active, mirroring Export CSV.
    const handleCopyCompanyData = async (company: string) => {
        const companyWorkers =
            company === companyKey ? workers : companyMonthlyWorkers[periodKey]?.[company] || [];

        const isDriver = sheetType === "driver";
        const headers = isDriver
            ? [
                "SL", "Name",
                ...customColumns.map((c) => c.label),
                "Day", "RPD", "Amount", "AD", "Net Amount", "Remarks",
            ]
            : [
                "SL", "ID", "Name", "Trade",
                ...customColumns.map((c) => c.label),
                "Hours", "Rate/Hour",
                "Gross Salary", "Advance", "Deduction", "Net Amount",
            ];

        const rows = companyWorkers.map((w) => {
            const gross = calculateGrossSalary(w.hours, w.ratePerHour);
            const net = calculateNetAmount(w.hours, w.ratePerHour, w.advance, w.deduction);
            return isDriver
                ? [
                    w.sl, w.name,
                    ...customColumns.map((c) => w.customFields?.[c.id] || ""),
                    w.hours, w.ratePerHour.toFixed(2), gross.toFixed(2),
                    w.advance.toFixed(2), net.toFixed(2), w.trade,
                ].join("\t")
                : [
                    w.sl, w.id, w.name, w.trade,
                    ...customColumns.map((c) => w.customFields?.[c.id] || ""),
                    w.hours,
                    w.ratePerHour.toFixed(2), gross.toFixed(2),
                    w.advance.toFixed(2), w.deduction.toFixed(2), net.toFixed(2),
                ].join("\t");
        });

        const text = [
            `${company} — ${monthNames[selectedMonth - 1]} ${selectedYear}`,
            headers.join("\t"),
            ...rows,
        ].join("\n");

        try {
            await navigator.clipboard.writeText(text);
            setCopiedCompany(company);
            window.setTimeout(() => setCopiedCompany(null), 1500);
        } catch {
            // Clipboard API unavailable (e.g. insecure context) — fail silently.
        }
    };

    const parseHoursValue = (value: string): number => {
        if (!value) return 0;
        if (value.includes(":")) {
            const [h = 0, m = 0, s = 0] = value
                .split(":")
                .map((part) => Number(part.trim()) || 0);
            return Number((h + m / 60 + s / 3600).toFixed(2));
        }
        return Number(value) || 0;
    };

    const handleAddWorker = (e: React.FormEvent) => {
        e.preventDefault();
        setAddWorkerError(null);
        if (!newWorker.name || (sheetType === "manpower" && !newWorker.id)) return;

        // Duplicate prevention (company_name + worker_id + month + year):
        // block only when the SAME Worker ID already exists for THIS
        // company in THIS exact month/year. The same ID is fine under a
        // different company, or in a different month/year for this company.
        const duplicate = findDuplicateWorker(newWorker.id, companyKey, periodKey);
        if (duplicate) {
            setAddWorkerError(
                `Worker ID "${newWorker.id.trim()}" ইতিমধ্যে "${companyKey}"-এর ${monthNames[selectedMonth - 1]} ${selectedYear} মাসে বিদ্যমান (${duplicate.name})। একই কোম্পানি ও একই মাসে একই Worker ID দুইবার যোগ করা যাবে না।`
            );
            return;
        }

        const workerToAdd: ManpowerWorker = {
            sl: workers.length + 1,
            id: newWorker.id.trim(),
            name: newWorker.name,
            trade: newWorker.trade || "General",
            hours: Number(newWorker.hours),
            ratePerHour: Number(newWorker.ratePerHour),
            advance: Number(newWorker.advance),
            deduction: Number(newWorker.deduction),
            photoUrl: newWorker.photoUrl || undefined,
            customFields: {},
        };

        const updatedWorkers = [...workers, workerToAdd];
        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });
        setNewWorker({ id: "", name: "", trade: "", hours: 0, ratePerHour: 0, advance: 0, deduction: 0, photoUrl: "" });
        setIsModalOpen(false);
    };

    // Bulk Paste accepts data copied straight out of "Copy Company Data" or
    // "Export CSV" too — those include SL, Gross Salary and Net Amount
    // columns alongside the plain ID/Name/Trade/Hours/Rate/Advance/Deduction
    // layout. This detects which layout a pasted row is using (by column
    // count) so those extra columns line up correctly instead of shifting
    // Advance/Deduction into the wrong place.
    //
    // Whatever number a user typed (or miscalculated) into a Gross Salary
    // or Net Amount column is ALWAYS discarded here — those two values are
    // never stored; the whole app derives them everywhere from
    // calculateGrossSalary/calculateNetAmount using Hours, Rate, Advance
    // and Deduction. So Hours stays the single source of truth and any
    // manual arithmetic mistake in a pasted Gross/Net figure can never
    // reach the table.
    //
    // The Driver sheet has no Worker ID and no Deduction column (see the
    // table headers / Add Worker modal), so it uses its own layout:
    // Name, Day, RPD, AD, Remarks — plus the SL/Amount/Net Amount variant
    // produced by Copy Company Data / Export CSV for that sheet.
    const parseBulkPasteRow = (
        rawColumns: string[]
    ): Omit<ManpowerWorker, "sl"> | null => {
        const columns = rawColumns.map((value) => value.trim());

        if (sheetType === "driver") {
            let name = "";
            let hoursRaw = "";
            let rateRaw = "";
            let advanceRaw = "";
            let remarksRaw = "";

            if (columns.length >= 8) {
                // SL, Name, Day, RPD, Amount, AD, Net Amount, Remarks
                [, name, hoursRaw, rateRaw, , advanceRaw, , remarksRaw] = columns;
            } else if (columns.length === 7) {
                // Name, Day, RPD, Amount, AD, Net Amount, Remarks
                [name, hoursRaw, rateRaw, , advanceRaw, , remarksRaw] = columns;
            } else if (columns.length >= 5) {
                // Name, Day, RPD, AD, Remarks
                [name, hoursRaw, rateRaw, advanceRaw, remarksRaw] = columns;
            } else {
                // Name, Day, RPD, AD (default)
                [name, hoursRaw, rateRaw, advanceRaw] = columns;
            }

            name = (name || "").trim();
            if (!name) return null;
            if (name.toLowerCase() === "name") return null; // pasted header row

            return {
                id: "",
                name,
                trade: (remarksRaw || "").trim(),
                hours: parseHoursValue((hoursRaw || "").trim()),
                ratePerHour: Number((rateRaw || "").trim()) || 0,
                advance: Number((advanceRaw || "").trim()) || 0,
                deduction: 0,
            };
        }

        let id = "";
        let name = "";
        let trade = "";
        let hoursRaw = "";
        let rateRaw = "";
        let advanceRaw = "";
        let deductionRaw = "";

        if (columns.length >= 10) {
            // SL, ID, Name, Trade, Hours, Rate/Hour, Gross Salary, Advance, Deduction, Net Amount
            [, id, name, trade, hoursRaw, rateRaw, , advanceRaw, deductionRaw] = columns;
        } else if (columns.length === 9) {
            // ID, Name, Trade, Hours, Rate/Hour, Gross Salary, Advance, Deduction, Net Amount
            [id, name, trade, hoursRaw, rateRaw, , advanceRaw, deductionRaw] = columns;
        } else if (columns.length === 8) {
            // SL, ID, Name, Trade, Hours, Rate/Hour, Advance, Deduction
            [, id, name, trade, hoursRaw, rateRaw, advanceRaw, deductionRaw] = columns;
        } else {
            // ID, Name, Trade, Hours, Rate/Hour, Advance, Deduction (default)
            [id, name, trade, hoursRaw, rateRaw, advanceRaw, deductionRaw] = columns;
        }

        id = (id || "").trim();
        name = (name || "").trim();
        trade = (trade || "").trim();

        if (!id || !name) return null;

        // Silently skip a pasted header row (e.g. from a copied table)
        // instead of adding a bogus "ID / Name" worker.
        if (normalizeId(id) === "id" && name.toLowerCase() === "name") return null;

        return {
            id,
            name,
            trade: trade || "General",
            hours: parseHoursValue((hoursRaw || "").trim()),
            ratePerHour: Number((rateRaw || "").trim()) || 0,
            advance: Number((advanceRaw || "").trim()) || 0,
            deduction: Number((deductionRaw || "").trim()) || 0,
        };
    };

    const handleBulkPaste = () => {
        setBulkPasteError(null);
        const rows = bulkPasteText
            .trim()
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (!rows.length) return;

        const parsedWorkers = rows
            .map((row) => {
                const columns = row.includes("\t") ? row.split("\t") : row.split(",");
                return parseBulkPasteRow(columns);
            })
            .filter(
                (worker): worker is Omit<ManpowerWorker, "sl"> => worker !== null
            );

        if (!parsedWorkers.length) return;

        // Duplicate prevention (company_name + worker_id + month + year):
        // skip any pasted row whose ID already exists for this company +
        // period, and also skip repeated IDs within the pasted batch itself
        // (so pasting the same row twice by mistake doesn't create a dupe).
        // Driver rows have no ID (see parseBulkPasteRow above), so this
        // check is naturally a no-op for the Driver sheet, same as Add
        // Worker / findDuplicateWorker elsewhere in the app.
        const seenInBatch = new Set<string>();
        const skippedIds: string[] = [];
        const dedupedWorkers: Omit<ManpowerWorker, "sl">[] = [];

        for (const worker of parsedWorkers) {
            const normalized = normalizeId(worker.id);
            const alreadyExists = worker.id
                ? findDuplicateWorker(worker.id, companyKey, periodKey)
                : undefined;
            if ((worker.id && alreadyExists) || (worker.id && seenInBatch.has(normalized))) {
                skippedIds.push(worker.id);
                continue;
            }
            if (worker.id) seenInBatch.add(normalized);
            dedupedWorkers.push(worker);
        }

        if (!dedupedWorkers.length) {
            setBulkPasteError(
                `কোনো নতুন ${sheetType === "driver" ? "Driver" : "Worker"} যোগ করা হয়নি — সবগুলো ID ইতিমধ্যে "${companyKey}"-এর ${monthNames[selectedMonth - 1]} ${selectedYear} মাসে বিদ্যমান: ${skippedIds.join(", ")}`
            );
            return;
        }

        const startSl = workers.length + 1;
        const workersToAdd: ManpowerWorker[] = dedupedWorkers.map((worker, index) => ({
            ...worker,
            sl: startSl + index,
        }));

        const updatedWorkers = [...workers, ...workersToAdd];
        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });
        setBulkPasteText("");

        if (skippedIds.length) {
            // Keep the modal open so the user can see exactly which IDs
            // were skipped, instead of silently dropping them.
            setBulkPasteError(
                `${skippedIds.length}টি ডুপ্লিকেট Worker ID বাদ দেওয়া হয়েছে (ইতিমধ্যে এই কোম্পানি ও মাসে বিদ্যমান): ${skippedIds.join(", ")}. বাকি ${dedupedWorkers.length}টি সফলভাবে যোগ হয়েছে।`
            );
        } else {
            setIsBulkPasteOpen(false);
        }
    };

    // Bulk Deduction (%) — applies a single percentage cut against every
    // worker's current Gross Salary (hours * rate) at once. The computed
    // amount is written into each worker's `deduction` field (the same
    // field the per-row edit form uses), so Net Amount recalculates
    // automatically everywhere it's already derived from `deduction`
    // (table rows, footer totals, dashboard cards, CSV export). The
    // Deduction column only exists on the Manpower sheet, so this tool is
    // naturally scoped to Manpower already (its column header doesn't
    // render on the Driver sheet).
    const handleApplyBulkDeduction = () => {
        const raw = bulkDeductionPercent.trim();
        const percent = parseFloat(raw);

        if (raw === "" || isNaN(percent) || percent < 0 || percent > 100) {
            setBulkDeductionError("০ থেকে ১০০ এর মধ্যে একটি সংখ্যা দিন");
            return;
        }
        setBulkDeductionError(null);

        const updatedWorkers = workers.map((w) => {
            const gross = calculateGrossSalary(w.hours, w.ratePerHour);
            const deductionAmount = Number(((gross * percent) / 100).toFixed(2));
            return { ...w, deduction: deductionAmount };
        });

        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });

        setBulkDeductionOpen(false);
    };

    // Parses one "identifier  amount" line for Bulk Advance Entry. Accepts
    // tab-separated (paste from Excel/Sheets), comma-separated, or plain
    // whitespace-separated — whichever the user pastes. The identifier is
    // a Worker ID on the Manpower sheet, or a Driver Name on the Driver
    // sheet (see getMatchIdentifier / identifierLabel above) — matching
    // happens later in handleApplyBulkAdvance once the sheet's rows are
    // available, so this stays a plain two-token parse.
    const parseBulkAdvanceLine = (line: string): { id: string; amount: number } | null => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const parts = trimmed.includes("\t")
            ? trimmed.split("\t")
            : trimmed.includes(",")
                ? trimmed.split(",")
                : trimmed.split(/\s+/);
        const id = (parts[0] || "").trim();
        const amountRaw = (parts[1] || "").trim();
        if (!id || amountRaw === "") return null;
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount < 0) return null;
        return { id, amount };
    };

    // Bulk Advance Entry — takes a pasted list of "Identifier  Amount"
    // lines and sets each matched worker's Advance field in a single pass.
    // Uses a Map keyed by normalized identifier so matching stays
    // O(workers + lines) even with large lists (matters since the request
    // calls for it to stay fast with many entries at once) rather than an
    // identifier-by-identifier nested scan. The identifier is Worker ID on
    // the Manpower sheet and Driver Name on the Driver sheet.
    const handleApplyBulkAdvance = () => {
        const lines = bulkAdvanceText
            .trim()
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (!lines.length) {
            setBulkAdvanceError(`অন্তত একটি ${identifierLabel} ও টাকার পরিমাণ দিন`);
            return;
        }

        const idToAmount = new Map<string, number>();
        let invalidLineCount = 0;

        lines.forEach((line) => {
            const parsed = parseBulkAdvanceLine(line);
            if (!parsed) {
                invalidLineCount++;
                return;
            }
            idToAmount.set(normalizeId(parsed.id), parsed.amount);
        });

        if (idToAmount.size === 0) {
            setBulkAdvanceError(`কোনো বৈধ লাইন পাওয়া যায়নি। ফরম্যাট: ${identifierLabel} পরিমাণ`);
            return;
        }

        const matchedKeys = new Set<string>();
        const updatedWorkers = workers.map((w) => {
            const key = normalizeId(getMatchIdentifier(w));
            const amount = idToAmount.get(key);
            if (amount === undefined) return w;
            matchedKeys.add(key);
            // Adds to whatever Advance the worker already has, rather than
            // replacing it — e.g. an existing 200 plus a new 300 becomes 500.
            return { ...w, advance: Number((w.advance + amount).toFixed(2)) };
        });

        const notFoundIds = Array.from(idToAmount.keys()).filter((key) => !matchedKeys.has(key));

        if (matchedKeys.size === 0) {
            setBulkAdvanceError(`কোনো ${identifierLabel} মিলেনি: ${notFoundIds.join(", ")}`);
            return;
        }

        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });

        if (notFoundIds.length || invalidLineCount) {
            const parts: string[] = [];
            if (notFoundIds.length) {
                parts.push(`${notFoundIds.length}টি ${identifierLabel} খুঁজে পাওয়া যায়নি: ${notFoundIds.join(", ")}`);
            }
            if (invalidLineCount) {
                parts.push(`${invalidLineCount}টি লাইন সঠিক ফরম্যাটে নেই`);
            }
            setBulkAdvanceError(`${matchedKeys.size}টি শ্রমিকের Advance-এ যোগ হয়েছে। ${parts.join(" ")}`);
        } else {
            setBulkAdvanceError(null);
            setBulkAdvanceText("");
            setBulkAdvanceOpen(false);
        }
    };

    // Strips the file extension from a filename so "MP-101.jpg" becomes
    // "MP-101" for matching against a Worker ID (or a Driver Name on the
    // Driver sheet).
    const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, "");

    // Reads one File as a base64 data URL (wrapped in a Promise so multiple
    // files can be read in sequence with await inside a loop).
    const readFileAsDataURL = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Read failed"));
                }
            };
            reader.onerror = () => reject(new Error("Read failed"));
            reader.readAsDataURL(file);
        });

    // Bulk Profile Photo Upload — takes a multi-file selection where each
    // file's name (minus extension) identifies a worker (Worker ID on the
    // Manpower sheet, Driver Name on the Driver sheet — e.g. "MP-101.jpg"
    // or "Karim Mia.jpg"), and automatically assigns each photo to the
    // matching worker's row. Files whose name doesn't match any current
    // worker are skipped and reported back, rather than silently dropped.
    const handleBulkPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setBulkPhotoError(null);

        const fileArray = Array.from(files);
        // Map of normalized identifier -> photo data URL, built from the
        // selected files' names. If two files share the same identifier,
        // the last one read wins.
        const idToDataUrl = new Map<string, string>();

        try {
            for (const file of fileArray) {
                const idFromFilename = normalizeId(stripExtension(file.name));
                if (!idFromFilename) continue;
                const dataUrl = await readFileAsDataURL(file);
                idToDataUrl.set(idFromFilename, dataUrl);
            }
        } catch {
            setBulkPhotoError("ছবি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            e.target.value = "";
            return;
        }

        const matchedIds = new Set<string>();
        const updatedWorkers = workers.map((w) => {
            const key = normalizeId(getMatchIdentifier(w));
            const dataUrl = idToDataUrl.get(key);
            if (!dataUrl) return w;
            matchedIds.add(key);
            return { ...w, photoUrl: dataUrl };
        });

        // File names whose identifier didn't match any worker currently in
        // this company + period's list.
        const unmatchedFileIds = Array.from(idToDataUrl.keys()).filter(
            (key) => !matchedIds.has(key)
        );

        if (matchedIds.size === 0) {
            setBulkPhotoError(
                `কোনো ${identifierLabel} মিলেনি। প্রতিটি ছবির ফাইলের নাম অবশ্যই ${identifierLabel} অনুযায়ী হতে হবে। পাওয়া ফাইল নাম: ${unmatchedFileIds.join(", ")}`
            );
            e.target.value = "";
            return;
        }

        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });

        if (unmatchedFileIds.length) {
            setBulkPhotoError(
                `${matchedIds.size}টি ছবি সফলভাবে সংশ্লিষ্ট কর্মীর সাথে বসানো হয়েছে। ${unmatchedFileIds.length}টি ফাইলের ${identifierLabel} কোনো Worker-এর সাথে মেলেনি: ${unmatchedFileIds.join(", ")}`
            );
        } else {
            setBulkPhotoError(null);
            setBulkPhotoOpen(false);
        }

        e.target.value = "";
    };

    // ===== Row / Column / Table-size Tool =====

    // Appends N blank rows to the currently visible table. The Worker ID
    // is left empty (never auto-generated) — the user fills it in via the
    // row's own "Edit" action afterwards, same as every other field.
    const handleAddBlankRows = () => {
        const count = parseInt(addRowsCount, 10);
        if (!count || count < 1) return;

        const startSl = workers.length + 1;
        const blankWorkers: ManpowerWorker[] = Array.from({ length: count }, (_, index) => ({
            sl: startSl + index,
            id: "",
            name: "",
            trade: "",
            hours: 0,
            ratePerHour: 0,
            advance: 0,
            deduction: 0,
            customFields: {},
        }));

        const updatedWorkers = [...workers, ...blankWorkers];
        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });
        setAddRowsCount("");
    };

    // Adds a brand-new custom column (e.g. "NID", "Department"). Existing
    // workers simply show a blank value for it until edited.
    const handleAddCustomColumn = () => {
        const label = newColumnLabel.trim();
        if (!label) return;
        const newCol = {
            id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            label,
        };
        setCustomColumns((prev) => [...prev, newCol]);
        setNewColumnLabel("");
    };

    // Removes a custom column's data from one worker's customFields object
    // (used when a column is deleted, so removed data doesn't linger
    // invisibly in storage).
    const stripColumnFromFields = (
        fields: Record<string, string> | undefined,
        colId: string
    ): Record<string, string> | undefined => {
        if (!fields || !(colId in fields)) return fields;
        const rest = { ...fields };
        delete rest[colId];
        return rest;
    };

    // Removes a custom column entirely — from the header, from every
    // worker currently on screen, and from every saved company/period.
    const handleRemoveCustomColumn = (colId: string) => {
        setCustomColumns((prev) => prev.filter((c) => c.id !== colId));

        setWorkers((prev) =>
            prev.map((w) => ({ ...w, customFields: stripColumnFromFields(w.customFields, colId) }))
        );

        setCompanyMonthlyWorkers((prev) => {
            const next: Record<string, Record<string, ManpowerWorker[]>> = {};
            for (const [period, companies] of Object.entries(prev)) {
                const updatedCompanies: Record<string, ManpowerWorker[]> = {};
                for (const [company, list] of Object.entries(companies)) {
                    updatedCompanies[company] = list.map((w) => ({
                        ...w,
                        customFields: stripColumnFromFields(w.customFields, colId),
                    }));
                }
                next[period] = updatedCompanies;
            }
            return next;
        });
    };

    const handleClearAll = () => {
        const confirmed = window.confirm(
            "এটি বর্তমান ও সংরক্ষিত সব মাস ও কোম্পানির Worker ডাটা স্থায়ীভাবে মুছে ফেলবে। আপনি কি নিশ্চিত?"
        );
        if (!confirmed) return;

        setWorkers([]);
        setCompanyMonthlyWorkers({});
        setEditingWorkerSl(null);
        setEditDraft({});
        setOpenActionMenu(null);
        setCompanyMenuOpen(false);
        setSearchQuery("");
        setIsModalOpen(false);
        setIsBulkPasteOpen(false);
        setAddWorkerError(null);
        setBulkPasteError(null);
        setCustomColumns([]);
        setNewColumnLabel("");
        setAddRowsCount("");
        setRowColumnMenuOpen(false);

        try {
            localStorage.removeItem(LS_KEYS.workers);
            localStorage.removeItem(LS_KEYS.monthlyWorkers);
            localStorage.removeItem(LS_KEYS.customColumns);
        } catch {
            // ignore
        }

        setToolbarOpen(false);
    };

    const handleDelete = (sl: number) => {
        const updatedWorkers = workers
            .filter((w) => w.sl !== sl)
            .map((item, index) => ({ ...item, sl: index + 1 }));

        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });

        if (editingWorkerSl === sl) {
            setEditingWorkerSl(null);
            setEditDraft({});
        }
        setOpenActionMenu(null);
    };

    const handleEditStart = (worker: ManpowerWorker) => {
        setEditingWorkerSl(worker.sl);
        setEditDraft({
            id: worker.id,
            name: worker.name,
            trade: worker.trade,
            hours: worker.hours,
            ratePerHour: worker.ratePerHour,
            advance: worker.advance,
            deduction: worker.deduction,
            photoUrl: worker.photoUrl,
            customFields: { ...(worker.customFields || {}) },
        });
        setOpenActionMenu(null);
    };

    const handleEditChange = (field: keyof EditDraft, value: string | number) => {
        setEditDraft((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditCustomFieldChange = (colId: string, value: string) => {
        setEditDraft((prev) => ({
            ...prev,
            customFields: { ...(prev.customFields || {}), [colId]: value },
        }));
    };

    const handleEditSave = (sl: number) => {
        if (editingWorkerSl !== sl) return;

        const currentWorker = workers.find((w) => w.sl === sl);
        if (!currentWorker) return;

        const newId = (editDraft.id ?? currentWorker.id).toString().trim();

        // Duplicate prevention (company_name + worker_id + month + year)
        // also applies when editing an existing (or previously blank) ID.
        if (newId && newId !== currentWorker.id) {
            const duplicate = findDuplicateWorker(newId, companyKey, periodKey, sl);
            if (duplicate) {
                window.alert(
                    `Worker ID "${newId}" ইতিমধ্যে "${companyKey}"-এর ${monthNames[selectedMonth - 1]} ${selectedYear} মাসে বিদ্যমান (${duplicate.name})। একই কোম্পানি ও একই মাসে একই Worker ID দুইবার ব্যবহার করা যাবে না।`
                );
                return;
            }
        }

        const updatedWorkers = workers.map((w) =>
            w.sl === sl
                ? {
                    ...w,
                    id: newId || w.id,
                    name: (editDraft.name ?? w.name).toString().trim() || w.name,
                    trade: (editDraft.trade ?? w.trade).toString().trim() || w.trade,
                    hours: Number(editDraft.hours ?? w.hours) || 0,
                    ratePerHour: Number(editDraft.ratePerHour ?? w.ratePerHour) || 0,
                    advance: Number(editDraft.advance ?? w.advance) || 0,
                    deduction: Number(editDraft.deduction ?? w.deduction) || 0,
                    photoUrl: editDraft.photoUrl ?? w.photoUrl,
                    customFields: { ...(w.customFields || {}), ...(editDraft.customFields || {}) },
                }
                : w
        );

        setWorkers(updatedWorkers);
        setCompanyMonthlyWorkers((prev) => {
            const periodData = { ...(prev[periodKey] || {}) };
            periodData[companyKey] = updatedWorkers;
            return { ...prev, [periodKey]: periodData };
        });
        setEditingWorkerSl(null);
        setEditDraft({});
        setOpenActionMenu(null);
    };

    const handleEditCancel = () => {
        setEditingWorkerSl(null);
        setEditDraft({});
    };

    const handleExportCSV = () => {
        const headers = sheetType === "driver"
            ? [
                "SL", "Name",
                ...customColumns.map((c) => c.label),
                "Day", "RPD", "Amount", "AD", "Net Amount", "Remarks",
            ]
            : [
                "SL", "ID", "Name", "Trade",
                ...customColumns.map((c) => c.label),
                "Hours", "Rate/Hour", "Gross Salary", "Advance", "Deduction", "Net Amount",
            ];

        const rows = workers.map((worker) => {
            const grossSalary = calculateGrossSalary(worker.hours, worker.ratePerHour);
            const netAmount = calculateNetAmount(
                worker.hours,
                worker.ratePerHour,
                worker.advance,
                worker.deduction
            );

            return sheetType === "driver"
                ? [
                    worker.sl,
                    worker.name,
                    ...customColumns.map((c) => worker.customFields?.[c.id] || ""),
                    worker.hours,
                    worker.ratePerHour,
                    grossSalary,
                    worker.advance,
                    netAmount,
                    worker.trade,
                ]
                : [
                    worker.sl,
                    worker.id,
                    worker.name,
                    worker.trade,
                    ...customColumns.map((c) => worker.customFields?.[c.id] || ""),
                    worker.hours,
                    worker.ratePerHour,
                    grossSalary,
                    worker.advance,
                    worker.deduction,
                    netAmount,
                ];
        });
        const escapeCSV = (value: string | number) => {
            const stringValue = String(value);
            return /[",\\n]/.test(stringValue)
                ? `"${stringValue.replace(/"/g, '""')}"`
                : stringValue;
        };

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCSV).join(","))
            .join("\\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `manpower-salary-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredWorkers = normalizedSearch
        ? workers.filter(
            (worker) =>
                worker.id.toLowerCase().includes(normalizedSearch) ||
                worker.name.toLowerCase().includes(normalizedSearch)
        )
        : workers;

    return (
        <div className="p-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen text-slate-900 font-semibold">
            {/* ===== Print-only Styles =====
                Goal: when the user clicks "Print / Export", only the
                company-name header, the table's column headers, and the
                worker salary rows should print — no toolbar, no dashboard
                cards, no buttons/menus, and no page chrome. The layout
                should read like a plain Excel print-out: thin black grid
                lines, black text on white, no shadows/gradients/rounded
                pills. */}
            <style jsx global>{`
                @media print {
                    /* Hide everything on the page by default ... */
                    body * {
                        visibility: hidden;
                    }
                    /* ...then reveal only the printable table area. */
                    #printArea,
                    #printArea * {
                        visibility: visible;
                    }
                    #printArea {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    /* Neutralize the on-screen zoom transform and the
                       horizontal-scroll wrapper so the table prints at
                       full natural width instead of scaled/cropped. */
                    #printArea .print-scale-wrapper {
                        transform: none !important;
                        width: 100% !important;
                    }
                    #printArea .print-scroll-wrapper {
                        overflow: visible !important;
                        max-height: none !important;
                    }
                    /* The sticky column headers must not stay pinned when
                       printing — a real print-out should just show them
                       once, in normal document flow, at the top of the
                       table like any static <thead>. */
                    #printArea th {
                        position: static !important;
                    }

                    /* Anything explicitly marked no-print never appears in
                       the printout (toolbars, buttons, dropdowns, cards). */
                    .no-print {
                        display: none !important;
                    }

                    /* Elements marked print-only are hidden on screen (see
                       the base rule below) and shown only in print — used
                       for the company-name header block. */
                    .print-only {
                        display: block !important;
                    }

                    /* Excel-like table: thin solid borders, no shadows,
                       no rounded corners, black text on white. */
                    #printArea table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        table-layout: auto !important;
                        font-size: 11px !important;
                    }
                    #printArea th,
                    #printArea td {
                        border: 1px solid #000 !important;
                        padding: 4px 6px !important;
                        color: #000 !important;
                        background: #fff !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    #printArea thead tr,
                    #printArea tfoot tr {
                        background: #f0f0f0 !important;
                    }
                    #printArea .rounded-xl,
                    #printArea .rounded-full,
                    #printArea .shadow-xl,
                    #printArea .border-2 {
                        border-radius: 0 !important;
                        box-shadow: none !important;
                    }
                    /* Worker profile photos aren't part of the salary sheet
                       data — skip them in the printout. */
                    #printArea img {
                        display: none !important;
                    }
                    /* The action (Edit/Save/Delete) column and the bulk
                       entry dropdown triggers are UI-only — never printed. */
                    #printArea .action-col,
                    #printArea .bulk-entry-trigger {
                        display: none !important;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                }

                /* Hidden on screen; only switched on inside @media print above. */
                .print-only {
                    display: none;
                }
            `}</style>

            {/* Header Section — sticky so the title, currency picker and all
                the toolbar buttons stay pinned to the top of the viewport
                while the page is scrolled; only the worker rows below move. */}
            <div className="no-print sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-black via-slate-950 to-indigo-950 p-6 rounded-2xl shadow-[0_25px_60px_-20px_rgba(217,119,6,0.45)] border border-amber-400/30 text-white">
                <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
                </div>

                <div className="-mt-3 relative">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-base font-extrabold text-white tracking-tight leading-tight">
                            {sheetType === "driver" ? "Driver Salary Sheet" : "Manpower Salary Sheet"}
                        </h1>
                        <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                            ✦ VIP
                        </span>
                    </div>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="mt-1 w-52 px-3 py-1.5 bg-slate-950 text-amber-200 rounded-md border border-amber-400/40 shadow-md text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
                        title="Select salary currency"
                    >
                        {currencyOptions.map((item) => (
                            <option key={item.code} value={item.code} className="bg-slate-950 text-amber-100">
                                {item.symbol} {item.code} - {item.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-[11px] text-slate-300 font-semibold leading-tight mt-1">
                        Manage hourly wages, deployment hours, and advances for contractual workers.
                    </p>
                </div>
                <div className="flex items-center gap-3 relative">
                    {/* Row / Column / Table-size tool — sits just to the left
                        of "Clear All" as requested. */}
                    <div ref={rowColumnMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setRowColumnMenuOpen((prev) => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={rowColumnMenuOpen}
                            aria-label="Row, Column & Table Size tools"
                            title="Row/Column যোগ করুন এবং টেবিলের সাইজ বাড়ান/কমান"
                            className="px-2.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-amber-200 font-bold text-xs rounded-md shadow-md border border-amber-400/40 flex items-center justify-center transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 transition-transform ${rowColumnMenuOpen ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {rowColumnMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-72 bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-amber-400/30 z-[100] overflow-hidden">

                                {/* Add Rows */}
                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">
                                        Add Rows
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={addRowsCount}
                                            onChange={(e) => setAddRowsCount(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddBlankRows();
                                                }
                                            }}
                                            placeholder="e.g. 5"
                                            className="flex-1 border border-amber-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddBlankRows}
                                            className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-slate-400">
                                        নতুন ফাঁকা Row যোগ হবে — পরে Action ▸ Edit থেকে ID ও তথ্য বসান
                                    </p>
                                </div>

                                {/* Add Column */}
                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">
                                        Add Column
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newColumnLabel}
                                            onChange={(e) => setNewColumnLabel(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddCustomColumn();
                                                }
                                            }}
                                            placeholder="e.g. NID / Department"
                                            className="flex-1 border border-amber-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomColumn}
                                            className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {customColumns.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {customColumns.map((col) => (
                                                <span
                                                    key={col.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-amber-200"
                                                >
                                                    {col.label}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCustomColumn(col.id)}
                                                        title="এই কলাম মুছে ফেলুন"
                                                        className="text-rose-400 hover:text-rose-300"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Table Size — reuses the same zoomLevel state as
                                    the existing Tools ▸ Zoom controls, so both stay
                                    in sync and nothing existing is duplicated/broken. */}
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                        Table Size
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={zoomOut}
                                            disabled={zoomLevel <= 50}
                                            title="Table ছোট করুন"
                                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            −
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetZoom}
                                            title="Click to reset to 100%"
                                            className="text-[11px] font-black text-amber-300 hover:text-amber-200 w-10 text-center"
                                        >
                                            {zoomLevel}%
                                        </button>
                                        <button
                                            type="button"
                                            onClick={zoomIn}
                                            disabled={zoomLevel >= 300}
                                            title="Table বড় করুন"
                                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== Unified "More" dropdown (v-icon) ===== */}
                    <div ref={mainMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMainMenuOpen((prev) => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={mainMenuOpen}
                            aria-label="More tools"
                            title="আরও অপশন"
                            className="px-2.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-amber-200 font-bold text-xs rounded-md shadow-md border border-amber-400/40 flex items-center justify-center transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${mainMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {mainMenuOpen && (
                            <div className="absolute left-0 top-full mt-2 w-80 max-h-[80vh] overflow-y-auto bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-amber-400/30 z-[100]">
                                <button type="button" onClick={() => { handleExportCSV(); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800">📤 Export CSV</button>
                                <button type="button" onClick={() => { setAddWorkerError(null); setIsModalOpen(true); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800">+ Add {sheetType === "driver" ? "Driver" : "Worker"}</button>
                                <button type="button" onClick={() => { setBulkPasteError(null); setIsBulkPasteOpen(true); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800">Bulk Paste</button>

                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">Salary Year &amp; Month</p>
                                    <select
                                        value={`${selectedYear}-${selectedMonth}`}
                                        onChange={(e) => { const [year, month] = e.target.value.split("-").map(Number); handlePeriodChange(year, month); }}
                                        className="w-full px-3 py-1.5 bg-white text-slate-900 rounded-md border border-amber-300 text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
                                    >
                                        {(() => {
                                            const startYear = new Date().getFullYear() - 2;
                                            const endYear = 2050;
                                            const yearCount = endYear - startYear + 1;
                                            return Array.from({ length: yearCount }, (_, index) => {
                                                const year = startYear + index;
                                                return monthNames.map((monthName, monthIndex) => (
                                                    <option key={`${year}-${monthIndex + 1}`} value={`${year}-${monthIndex + 1}`}>{year} - {monthName}</option>
                                                ));
                                            });
                                        })()}
                                    </select>
                                </div>

                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">Currency</p>
                                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-1.5 bg-white text-slate-900 rounded-md border border-amber-300 text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300">
                                        {currencyOptions.map((item) => (
                                            <option key={item.code} value={item.code}>{item.symbol} {item.code} - {item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">Align</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["left", "center", "right"] as const).map((mode) => (
                                            <button key={mode} type="button" onClick={() => handleAlign(mode)} className={`py-2 rounded font-bold text-sm capitalize transition-colors ${alignMode === mode ? "bg-amber-400 text-slate-950 shadow" : "bg-slate-800 hover:bg-slate-700 text-slate-100"}`}>{mode}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                                    <button type="button" onClick={zoomOut} disabled={zoomLevel <= 50} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed">Zoom −</button>
                                    <button type="button" onClick={resetZoom} title="Click to reset to 100%" className="font-extrabold text-amber-300 hover:text-amber-200">{zoomLevel}%</button>
                                    <button type="button" onClick={zoomIn} disabled={zoomLevel >= 300} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed">Zoom +</button>
                                </div>

                                <button type="button" onClick={() => { refreshPage(); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800">🔄 Refresh</button>

                                <details className="border-b border-slate-800">
                                    <summary className="px-4 py-3 cursor-pointer font-bold hover:bg-slate-800 list-none flex items-center justify-between">
                                        <span>🟢 WhatsApp Theme</span>
                                        <span className="text-[10px] font-black uppercase text-amber-300">{whatsAppTheme}</span>
                                    </summary>
                                    <div className="p-3 space-y-2">
                                        {(["light", "dark"] as const).map((theme) => (
                                            <button key={theme} type="button" onClick={() => changeWhatsAppTheme(theme)} className={`w-full py-2 rounded capitalize font-bold transition-colors ${whatsAppTheme === theme ? "bg-emerald-600 text-white" : "bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-100"}`}>{theme}</button>
                                        ))}
                                        <button type="button" onClick={shareViaWhatsApp} className="w-full py-2 rounded font-bold bg-emerald-500 hover:bg-emerald-400 text-white">Share Summary via WhatsApp</button>
                                    </div>
                                </details>

                                <details className="border-b border-slate-800">
                                    <summary className="px-4 py-3 cursor-pointer font-bold hover:bg-slate-800 list-none flex items-center justify-between">
                                        <span>💬 Messenger Theme</span>
                                        <span className="text-[10px] font-black uppercase text-amber-300">{messengerTheme}</span>
                                    </summary>
                                    <div className="p-3 space-y-2">
                                        {(["light", "dark"] as const).map((theme) => (
                                            <button key={theme} type="button" onClick={() => changeMessengerTheme(theme)} className={`w-full py-2 rounded capitalize font-bold transition-colors ${messengerTheme === theme ? "bg-sky-600 text-white" : "bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-100"}`}>{theme}</button>
                                        ))}
                                        <button type="button" onClick={shareViaMessenger} className="w-full py-2 rounded font-bold bg-sky-500 hover:bg-sky-400 text-white">Copy Summary &amp; Open Messenger</button>
                                    </div>
                                </details>

                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">Add Rows</p>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="1" value={addRowsCount} onChange={(e) => setAddRowsCount(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBlankRows(); } }} placeholder="e.g. 5" className="flex-1 border border-amber-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" />
                                        <button type="button" onClick={handleAddBlankRows} className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black">Add</button>
                                    </div>
                                </div>

                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">Add Column</p>
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={newColumnLabel} onChange={(e) => setNewColumnLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomColumn(); } }} placeholder="e.g. NID / Department" className="flex-1 border border-amber-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" />
                                        <button type="button" onClick={handleAddCustomColumn} className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black">Add</button>
                                    </div>
                                    {customColumns.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {customColumns.map((col) => (
                                                <span key={col.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-amber-200">
                                                    {col.label}
                                                    <button type="button" onClick={() => handleRemoveCustomColumn(col.id)} className="text-rose-400 hover:text-rose-300">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="button" onClick={() => { window.print(); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800">🖨️ Print / Export</button>

                                {sheetType === "manpower" ? (
                                    <button type="button" onClick={() => handleSheetTypeSwitch("driver")} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold text-amber-300 border-b border-slate-800">🚚 Driver Salary Sheet</button>
                                ) : (
                                    <button type="button" onClick={() => handleSheetTypeSwitch("manpower")} className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold text-amber-300 border-b border-slate-800">🏗️ Manpower Salary Sheet</button>
                                )}

                                <button type="button" onClick={() => { handleClearAll(); setMainMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-rose-950 font-bold text-rose-400">🗑️ Clear All</button>
                            </div>
                        )}
                    </div>

                    {/* Clear All — wipes every worker (current + all saved months) */}

                    {/* Clear All — wipes every worker (current + all saved months) */}
                    <button
                        type="button"
                        onClick={handleClearAll}
                        title="Clear all worker data (current and saved months)"
                        className="px-3 py-1.5 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold text-xs rounded-md shadow-md border border-rose-400/40 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                        🗑️ Clear All
                    </button>

                    {/* ===== Toolbar Menu ===== */}
                    <div ref={toolbarRef} className="relative">

                        <button
                            type="button"
                            onClick={toggleToolbar}
                            aria-expanded={toolbarOpen}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-amber-200 font-bold text-xs rounded-md shadow-md border border-amber-400/40 flex items-center gap-1.5 transition-colors"
                        >
                            ⚙ Tools
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-3.5 h-3.5 transition-transform ${toolbarOpen ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {toolbarOpen && (
                            <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-amber-400/30 z-[100] overflow-hidden">

                                {/* ALIGN */}
                                <div className="px-4 py-3 border-b border-slate-800">
                                    <p className="text-xs font-bold text-amber-300 uppercase mb-2 tracking-wider">
                                        Align
                                    </p>

                                    <div className="grid grid-cols-3 gap-2">
                                        {(["left", "center", "right"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => handleAlign(mode)}
                                                className={`py-2 rounded font-bold text-sm capitalize transition-colors ${mode === alignMode
                                                    ? "bg-amber-400 text-slate-950 shadow"
                                                    : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ZOOM */}
                                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">

                                    <button
                                        type="button"
                                        onClick={zoomOut}
                                        disabled={zoomLevel <= 50}
                                        className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Zoom −
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetZoom}
                                        title="Click to reset to 100%"
                                        className="font-extrabold text-amber-300 hover:text-amber-200"
                                    >
                                        {zoomLevel}%
                                    </button>

                                    <button
                                        type="button"
                                        onClick={zoomIn}
                                        disabled={zoomLevel >= 300}
                                        className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Zoom +
                                    </button>

                                </div>

                                {/* Refresh */}
                                <button
                                    type="button"
                                    onClick={refreshPage}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 font-bold border-b border-slate-800"
                                >
                                    🔄 Refresh
                                </button>

                                {/* WhatsApp */}
                                <details className="border-b border-slate-800">
                                    <summary className="px-4 py-3 cursor-pointer font-bold hover:bg-slate-800 list-none flex items-center justify-between">
                                        <span>🟢 WhatsApp Theme</span>
                                        <span className="text-[10px] font-black uppercase text-amber-300">{whatsAppTheme}</span>
                                    </summary>

                                    <div className="p-3 space-y-2">
                                        {(["light", "dark"] as const).map((theme) => (
                                            <button
                                                key={theme}
                                                type="button"
                                                onClick={() => changeWhatsAppTheme(theme)}
                                                className={`w-full py-2 rounded capitalize font-bold transition-colors ${whatsAppTheme === theme
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-100"
                                                    }`}
                                            >
                                                {theme}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={shareViaWhatsApp}
                                            className="w-full py-2 rounded font-bold bg-emerald-500 hover:bg-emerald-400 text-white"
                                        >
                                            Share Summary via WhatsApp
                                        </button>
                                    </div>
                                </details>

                                {/* Messenger */}
                                <details>
                                    <summary className="px-4 py-3 cursor-pointer font-bold hover:bg-slate-800 list-none flex items-center justify-between">
                                        <span>💬 Messenger Theme</span>
                                        <span className="text-[10px] font-black uppercase text-amber-300">{messengerTheme}</span>
                                    </summary>

                                    <div className="p-3 space-y-2">
                                        {(["light", "dark"] as const).map((theme) => (
                                            <button
                                                key={theme}
                                                type="button"
                                                onClick={() => changeMessengerTheme(theme)}
                                                className={`w-full py-2 rounded capitalize font-bold transition-colors ${messengerTheme === theme
                                                    ? "bg-sky-600 text-white"
                                                    : "bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-100"
                                                    }`}
                                            >
                                                {theme}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={shareViaMessenger}
                                            className="w-full py-2 rounded font-bold bg-sky-500 hover:bg-sky-400 text-white"
                                            title="Copies the summary to your clipboard and opens Messenger"
                                        >
                                            Copy Summary &amp; Open Messenger
                                        </button>
                                    </div>
                                </details>

                            </div>
                        )}

                    </div>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-md shadow-md border border-amber-300/60 transition-all whitespace-nowrap"
                        title="Export salary data as CSV"
                    >
                        Export CSV
                    </button>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ID or Name..."
                            aria-label="Search worker by ID or name"
                            className="w-full bg-slate-950/60 text-amber-100 placeholder:text-slate-400 px-4 py-2 pr-9 rounded-md border border-amber-400/30 shadow-md text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 font-black"
                                aria-label="Clear search"
                                title="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setAddWorkerError(null);
                            setIsModalOpen(true);
                        }}
                        className="px-1 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-md shadow-md border border-amber-300/40 transition-all"
                    >
                        + Add {sheetType === "driver" ? "Driver" : "Worker"}
                    </button>
                    <button
                        onClick={() => {
                            setBulkPasteError(null);
                            setIsBulkPasteOpen(true);
                        }}
                        className="px-1 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm rounded-md shadow-md border border-amber-300/40 transition-all"
                    >
                        Bulk Paste
                    </button>

                    <select
                        value={`${selectedYear}-${selectedMonth}`}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split("-").map(Number);
                            handlePeriodChange(year, month);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm rounded-md shadow-md border border-amber-300/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-200"
                        title="Change salary year and month"
                    >
                        {(() => {
                            const startYear = new Date().getFullYear() - 2;
                            const endYear = 2050;
                            const yearCount = endYear - startYear + 1;

                            return Array.from({ length: yearCount }, (_, index) => {
                                const year = startYear + index;
                                return monthNames.map((monthName, monthIndex) => (
                                    <option
                                        key={`${year}-${monthIndex + 1}`}
                                        value={`${year}-${monthIndex + 1}`}
                                    >
                                        {year} - {monthName}
                                    </option>
                                ));
                            });
                        })()}
                    </select>

                    <button
                        onClick={() => window.print()}
                        className="px-1 py-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-amber-200 font-bold text-sm rounded-md shadow-md border border-amber-400/40 transition-all"
                    >
                        Print / Export
                    </button>
                </div>
            </div>
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                {/* Total Net Amount */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b0f19] via-[#131a2b] to-[#1c1408] p-6 text-white shadow-[0_20px_50px_-15px_rgba(250,204,21,0.35)] border border-yellow-400/40 ring-1 ring-white/5">
                    <p className="text-sm font-extrabold text-yellow-300/90 uppercase tracking-wide">Total Net Amount</p>

                    <h2 className="mt-3 text-4xl font-black tracking-tight text-yellow-300 drop-shadow-[0_2px_10px_rgba(250,204,21,0.35)]">
                        {selectedCurrency.symbol}{totalNetPayable.toLocaleString("en-US")}
                    </h2>

                    <p className="mt-2 text-sm font-bold text-slate-200">
                        Visible Rows: {filteredWorkers.length}
                    </p>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-yellow-400/15 border border-yellow-400/50 flex items-center justify-center text-lg text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.35)]">
                        ✦
                    </div>
                </div>

                {/* Active Members */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#03110c] via-[#062018] to-[#0a1f1a] p-6 text-white shadow-[0_20px_50px_-15px_rgba(16,255,169,0.3)] border border-emerald-400/40 ring-1 ring-white/5">
                    <p className="text-sm font-extrabold text-emerald-300/90 uppercase tracking-wide">Active Members</p>

                    <h2 className="mt-3 text-4xl font-black text-emerald-300 drop-shadow-[0_2px_10px_rgba(16,255,169,0.3)]">
                        {filteredWorkers.length}
                    </h2>

                    <p className="mt-2 text-sm font-bold text-slate-200">
                        Currently Eligible
                    </p>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-emerald-400/15 border border-emerald-400/50 flex items-center justify-center text-lg text-emerald-300 shadow-[0_0_15px_rgba(16,255,169,0.3)]">
                        ✦
                    </div>
                </div>

                {/* Delayed Cases */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#170307] via-[#26060c] to-[#1c0710] p-6 text-white shadow-[0_20px_50px_-15px_rgba(251,113,133,0.35)] border border-rose-400/40 ring-1 ring-white/5">
                    <p className="text-sm font-extrabold text-rose-300/90 uppercase tracking-wide">Delayed Cases</p>

                    <h2 className="mt-3 text-4xl font-black text-rose-300 drop-shadow-[0_2px_10px_rgba(251,113,133,0.35)]">
                        {
                            workers.filter(
                                (w) => calculateNetAmount(w.hours, w.ratePerHour, w.advance, w.deduction) <= 0
                            ).length
                        }
                    </h2>

                    <p className="mt-2 text-sm font-bold text-slate-200">
                        Needs Follow-up
                    </p>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-rose-400/15 border border-rose-400/50 flex items-center justify-center text-lg text-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.35)]">
                        ✦
                    </div>
                </div>

                {/* Advance Volume */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020b18] via-[#061428] to-[#081b2e] p-6 text-white shadow-[0_20px_50px_-15px_rgba(56,189,248,0.35)] border border-sky-400/40 ring-1 ring-white/5">
                    <p className="text-sm font-extrabold text-sky-300/90 uppercase tracking-wide">Advance Volume</p>

                    <h2 className="mt-3 text-4xl font-black text-sky-300 drop-shadow-[0_2px_10px_rgba(56,189,248,0.35)]">
                        {selectedCurrency.symbol}{totalAdvance.toLocaleString("en-US")}
                    </h2>

                    <p className="mt-2 text-sm font-bold text-slate-200">
                        Total Advance
                    </p>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-sky-400/15 border border-sky-400/50 flex items-center justify-center text-lg text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.35)]">
                        ✦
                    </div>
                </div>

            </div>
            <div className="no-print mb-3 grid grid-cols-1 md:grid-cols-3 items-center gap-3 rounded-lg border border-amber-300/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-2 shadow-sm">
                <div className="text-sm font-extrabold text-amber-200 text-center md:text-left">
                    Salary Period: {monthNames[selectedMonth - 1]} {selectedYear}
                </div>

                <div ref={companyMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setCompanyMenuOpen((prev) => !prev)}
                        aria-haspopup="menu"
                        aria-expanded={companyMenuOpen}
                        aria-label="Company Name — click to switch company"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-amber-300/30 rounded-md px-3 py-2 text-sm font-extrabold text-amber-100 shadow-sm min-h-[38px] hover:bg-slate-800 transition-colors"
                    >
                        <span className="truncate">{companyName || "Company Name"}</span>
                        <span
                            className={`text-amber-300 text-[10px] transition-transform shrink-0 ${companyMenuOpen ? "rotate-180" : ""
                                }`}
                        >
                            ▼
                        </span>
                    </button>

                    {companyMenuOpen && (
                        <div
                            role="menu"
                            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 max-w-[90vw] bg-slate-950 border border-amber-400/30 rounded-xl shadow-2xl z-[110] overflow-hidden text-left"
                        >
                            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 truncate">
                                    {monthNames[selectedMonth - 1]} {selectedYear} — কোম্পানি
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCreateNewCompany}
                                    className="text-[10px] font-black text-emerald-300 hover:text-emerald-200 whitespace-nowrap"
                                >
                                    + নতুন
                                </button>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {periodCompanies.map((company) => {
                                    const count = (
                                        company === companyKey
                                            ? workers
                                            : companyMonthlyWorkers[periodKey]?.[company] || []
                                    ).length;
                                    const isActive = company === companyKey;

                                    return (
                                        <div
                                            key={company}
                                            className={`flex items-center justify-between gap-1 px-3 py-2 text-xs font-bold border-b border-slate-800/60 ${isActive
                                                ? "bg-amber-400/10 text-amber-200"
                                                : "text-slate-200 hover:bg-slate-800"
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => handleCompanySwitch(company)}
                                                className="flex-1 min-w-0 text-left truncate"
                                                title={`${company} এর ডাটা দেখুন`}
                                            >
                                                {company}{" "}
                                                <span className="text-slate-400 font-semibold">({count})</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyCompanyData(company)}
                                                title="সম্পূর্ণ ডাটা কপি করুন"
                                                className="shrink-0 px-1.5 py-1 rounded hover:bg-amber-400/20 text-amber-300"
                                            >
                                                {copiedCompany === company ? "✓" : "📋"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-xs font-bold text-amber-300/80 text-center md:text-right">
                    Separate data is maintained for each month and company
                </div>
            </div>

            {normalizedSearch && (
                <div className="no-print mb-3 flex items-center justify-between rounded-lg border border-amber-300/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-2 shadow-sm">
                    <span className="text-sm font-extrabold text-amber-200">
                        Search: "{searchQuery}"
                    </span>
                    <span className="text-xs font-bold text-amber-300/80">
                        {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? "s" : ""} found
                    </span>
                </div>
            )}

            {/* ===== Printable Area =====
                Everything the "Print / Export" button should output lives
                inside this wrapper: the company-name header (visible only
                in print) and the salary table itself. */}
            <div id="printArea">
                {/* Print-only header — company name + salary period.
                    Hidden on screen, shown only when printing. */}
                <div className="print-only text-center mb-4">
                    <h2 className="text-xl font-bold m-0">{companyName || "Company Name"}</h2>
                    <p className="text-sm m-0 mt-1">
                        {sheetType === "driver" ? "Driver Salary Sheet" : "Salary Sheet"} — {monthNames[selectedMonth - 1]} {selectedYear}
                    </p>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-xl border-2 border-amber-300/40">
                    {/* Excel-style freeze pane: this wrapper scrolls both
                        directions on its own (bounded height), while the
                        <th> cells inside stay `sticky top-0` so the column
                        headers stay put and only the worker rows move. */}
                    <div className="print-scroll-wrapper overflow-x-auto overflow-y-auto max-h-[65vh] rounded-xl">
                        <div
                            className="print-scale-wrapper"
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: "top left",
                                width: `${10000 / zoomLevel}%`,
                            }}
                        >
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-gradient-to-r from-black via-slate-950 to-black text-amber-200 text-[16px] uppercase tracking-wider border-b-2 border-amber-400/40">
                                        {(() => {
                                            const isDriver = sheetType === "driver";
                                            const baseHeaders: Array<[string, string, string]> = isDriver
                                                ? [
                                                    ["sl", "SL", "text-center"],
                                                    ["name", "NAME", ""],
                                                ]
                                                : [
                                                    ["sl", "SL", "text-center"],
                                                    ["id", "ID", ""],
                                                    ["name", "Name", ""],
                                                    ["trade", "Trade", ""],
                                                ];
                                            const customHeaders: Array<[string, string, string]> = customColumns.map(
                                                (col) => [col.id, col.label, ""]
                                            );
                                            const restHeaders: Array<[string, string, string]> = isDriver
                                                ? [
                                                    ["hours", "DAY", "text-right"],
                                                    ["rate", "RPD", "text-right"],
                                                    ["gross", "AMOUNT", "text-right"],
                                                    ["advance", "AD", "text-right"],
                                                    ["net", "NET SAL", "text-right"],
                                                    ["trade", "REMARKS", ""],
                                                    ["action", "ACTION", "text-center"],
                                                ]
                                                : [
                                                    ["hours", "Hours", "text-right"],
                                                    ["rate", "R/P/H", "text-right"],
                                                    ["gross", "Gr. Salary", "text-right"],
                                                    ["advance", "Advance", "text-right"],
                                                    ["deduction", "Deduction", "text-right"],
                                                    ["net", "Net Sal", "text-right"],
                                                    ["action", "Action", "text-center"],
                                                ];
                                            const allHeaders = [...baseHeaders, ...customHeaders, ...restHeaders];
                                            const isCustomColumnKey = (key: string) =>
                                                customColumns.some((c) => c.id === key);

                                            return allHeaders.map(([key, label, forcedAlign]) => {
                                                const defaultWidth: Record<string, number> = {
                                                    sl: 60, id: 110, name: 180, trade: 140, hours: 110,
                                                    rate: 110, gross: 140, advance: 130, deduction: 130, net: 140, action: 100,
                                                };
                                                const width = columnWidths[key] || defaultWidth[key] || 140;
                                                const thAlign = forcedAlign || alignClass;
                                                const isActionCol = key === "action";

                                                return (
                                                    <th
                                                        key={key}
                                                        style={{ width, minWidth: width }}
                                                        onDoubleClick={() => handleColumnDoubleClick(key)}
                                                        title="Double-click to resize. Drag the right edge for custom width."
                                                        className={`sticky top-0 z-20 bg-slate-950 py-3 px-4 font-extrabold text-amber-200 border-b-2 border-amber-400/40 shadow-[0_2px_0_rgba(0,0,0,0.4)] ${thAlign} select-none cursor-col-resize hover:bg-amber-400/10 transition-colors ${isActionCol ? "action-col" : ""
                                                            }`}
                                                    >
                                                        {key === "sl" ? (
                                                            <span
                                                                ref={bulkPhotoRef}
                                                                className="relative inline-flex items-center gap-1 justify-center w-full"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onDoubleClick={(e) => e.stopPropagation()}
                                                            >
                                                                {label}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBulkPhotoOpen((prev) => !prev)}
                                                                    aria-haspopup="menu"
                                                                    aria-expanded={bulkPhotoOpen}
                                                                    aria-label="Bulk profile photo upload"
                                                                    title={`${identifierLabel} অনুযায়ী নামকরণ করা একাধিক ছবি একসাথে আপলোড করুন`}
                                                                    className="bulk-entry-trigger inline-flex items-center justify-center w-4 h-4 rounded hover:bg-amber-400/20 text-amber-300 shrink-0"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className={`w-3 h-3 transition-transform ${bulkPhotoOpen ? "rotate-180" : ""}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>

                                                                {bulkPhotoOpen && (
                                                                    <div
                                                                        role="menu"
                                                                        className="no-print absolute left-0 top-full mt-2 w-72 bg-white border border-amber-200 rounded-md shadow-xl p-3 text-left normal-case tracking-normal z-50"
                                                                    >
                                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                                            Bulk Upload Profile Pictures
                                                                        </label>
                                                                        <p className="text-[10px] text-slate-400 mb-2">
                                                                            Each file must be named using the exact {identifierLabel} : <span className="font-mono">{sheetType === "driver" ? "Karim Mia.jpg" : "MP-101.jpg"}</span>। The system will auto-match and update the profiles accordingly.
                                                                        </p>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            multiple
                                                                            onChange={handleBulkPhotoUpload}
                                                                            className="w-full text-[11px] font-semibold text-slate-600 file:mr-2 file:px-2.5 file:py-1.5 file:rounded file:border-0 file:bg-amber-500 file:text-slate-950 file:font-bold file:text-xs file:cursor-pointer hover:file:bg-amber-400"
                                                                        />
                                                                        {bulkPhotoError && (
                                                                            <p className="mt-2 text-[10px] font-bold text-rose-600">
                                                                                {bulkPhotoError}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </span>
                                                        ) : key === "advance" ? (
                                                            <span
                                                                ref={bulkAdvanceRef}
                                                                className="relative inline-flex items-center gap-1 justify-end w-full"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onDoubleClick={(e) => e.stopPropagation()}
                                                            >
                                                                {label}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBulkAdvanceOpen((prev) => !prev)}
                                                                    aria-haspopup="menu"
                                                                    aria-expanded={bulkAdvanceOpen}
                                                                    aria-label="Bulk advance entry"
                                                                    title={`একাধিক ${identifierLabel} ও অ্যাডভান্স একসাথে বসান`}
                                                                    className="bulk-entry-trigger inline-flex items-center justify-center w-4 h-4 rounded hover:bg-amber-400/20 text-amber-300 shrink-0"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className={`w-3 h-3 transition-transform ${bulkAdvanceOpen ? "rotate-180" : ""}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>

                                                                {bulkAdvanceOpen && (
                                                                    <div
                                                                        role="menu"
                                                                        className="no-print absolute right-0 top-full mt-2 w-72 bg-white border border-amber-200 rounded-md shadow-xl p-3 text-left normal-case tracking-normal z-50"
                                                                    >
                                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                                            {identifierLabel} & Advance amount (one per line)
                                                                        </label>
                                                                        <p className="text-[10px] text-slate-400 mb-1.5">
                                                                            This will be added to the previous advance, not replaced.
                                                                        </p>
                                                                        <textarea
                                                                            autoFocus
                                                                            rows={5}
                                                                            value={bulkAdvanceText}
                                                                            onChange={(e) => {
                                                                                setBulkAdvanceText(e.target.value);
                                                                                setBulkAdvanceError(null);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter" && !e.shiftKey) {
                                                                                    e.preventDefault();
                                                                                    handleApplyBulkAdvance();
                                                                                } else if (e.key === "Escape") {
                                                                                    setBulkAdvanceOpen(false);
                                                                                }
                                                                            }}
                                                                            placeholder={
                                                                                sheetType === "driver"
                                                                                    ? "Karim Mia 500\nRahim Ali 300"
                                                                                    : "MP-101 500\nMP-102 300\nMP-103\t200"
                                                                            }
                                                                            className="w-full border border-amber-300 rounded px-2 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
                                                                        />
                                                                        <div className="flex items-center justify-between gap-2 mt-2">
                                                                            <p className="text-[10px] text-slate-400">
                                                                                Shift+Enter নতুন লাইন, শুধু Enter-এ প্রয়োগ হবে
                                                                            </p>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleApplyBulkAdvance}
                                                                                className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                                                                            >
                                                                                OK
                                                                            </button>
                                                                        </div>
                                                                        {bulkAdvanceError && (
                                                                            <p className="mt-1.5 text-[10px] font-bold text-rose-600">
                                                                                {bulkAdvanceError}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </span>
                                                        ) : key === "deduction" ? (
                                                            <span
                                                                ref={bulkDeductionRef}
                                                                className="relative inline-flex items-center gap-1 justify-end w-full"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onDoubleClick={(e) => e.stopPropagation()}
                                                            >
                                                                {label}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBulkDeductionOpen((prev) => !prev)}
                                                                    aria-haspopup="menu"
                                                                    aria-expanded={bulkDeductionOpen}
                                                                    aria-label="Bulk deduction by percentage"
                                                                    title="সকল শ্রমিকের বেতন থেকে একসাথে % কর্তন করুন"
                                                                    className="bulk-entry-trigger inline-flex items-center justify-center w-4 h-4 rounded hover:bg-amber-400/20 text-amber-300 shrink-0"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className={`w-3 h-3 transition-transform ${bulkDeductionOpen ? "rotate-180" : ""}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>

                                                                {bulkDeductionOpen && (
                                                                    <div
                                                                        role="menu"
                                                                        className="no-print absolute right-0 top-full mt-2 w-60 bg-white border border-amber-200 rounded-md shadow-xl p-3 text-left normal-case tracking-normal z-50"
                                                                    >
                                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                                            The deduction rate from the gross salary of all workers,
                                                                        </label>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="relative flex-1">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    step="0.01"
                                                                                    autoFocus
                                                                                    value={bulkDeductionPercent}
                                                                                    onChange={(e) => {
                                                                                        setBulkDeductionPercent(e.target.value);
                                                                                        setBulkDeductionError(null);
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === "Enter") {
                                                                                            e.preventDefault();
                                                                                            handleApplyBulkDeduction();
                                                                                        } else if (e.key === "Escape") {
                                                                                            setBulkDeductionOpen(false);
                                                                                        }
                                                                                    }}
                                                                                    placeholder="e.g. 5"
                                                                                    className="w-full border border-amber-300 rounded px-2 py-1.5 pr-6 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                                />
                                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">%</span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleApplyBulkDeduction}
                                                                                className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                                                                            >
                                                                                OK
                                                                            </button>
                                                                        </div>
                                                                        {bulkDeductionError && (
                                                                            <p className="mt-1.5 text-[10px] font-bold text-rose-600">
                                                                                {bulkDeductionError}
                                                                            </p>
                                                                        )}
                                                                        <p className="mt-1.5 text-[10px] text-slate-400">
                                                                            Enter চাপলে সাথে সাথে সবার Deduction ও Net Amount আপডেট হবে
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </span>
                                                        ) : isCustomColumnKey(key) ? (
                                                            <span
                                                                className="relative inline-flex items-center gap-1 justify-start w-full"
                                                                onClick={(e) => e.stopPropagation()}
                                                                onDoubleClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span className="truncate">{label}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomColumn(key)}
                                                                    title="এই কলাম মুছে ফেলুন"
                                                                    className="no-print bulk-entry-trigger inline-flex items-center justify-center w-4 h-4 rounded hover:bg-rose-400/20 text-rose-300 shrink-0"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            label
                                                        )}
                                                        <span
                                                            onMouseDown={(e) =>
                                                                handleColumnResizeStart(e, key, width)
                                                            }
                                                            className="no-print absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-amber-300/50"
                                                        />
                                                    </th>
                                                );
                                            });
                                        })()}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-100 text-[14px] text-slate-900 font-bold bg-white">
                                    {filteredWorkers.length > 0 ? (
                                        filteredWorkers.map((worker) => {
                                            const grossSalary = calculateGrossSalary(worker.hours, worker.ratePerHour);
                                            const netAmount = calculateNetAmount(worker.hours, worker.ratePerHour, worker.advance, worker.deduction);
                                            const isEditing = editingWorkerSl === worker.sl;

                                            return (
                                                <tr
                                                    key={worker.sl}
                                                    className={`transition-colors font-bold border-b border-amber-100 ${isEditing
                                                        ? "bg-amber-50 ring-1 ring-inset ring-amber-300"
                                                        : "bg-white odd:bg-amber-50/40 hover:bg-amber-50/80"
                                                        }`}
                                                >
                                                    <td style={{ width: columnWidths.sl || 60, minWidth: columnWidths.sl || 60 }} className="py-3 px-4 text-center font-medium">
                                                        <div className="relative inline-block w-9 h-9">
                                                            <img
                                                                src={
                                                                    (isEditing ? editDraft.photoUrl : worker.photoUrl) ||
                                                                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(worker.name)}&backgroundType=gradientLinear`
                                                                }
                                                                alt={worker.name}
                                                                className="w-9 h-9 rounded-full border border-amber-300/50 shadow-sm object-cover"
                                                            />
                                                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 text-white text-xs font-black pointer-events-none">
                                                                {worker.sl}
                                                            </span>
                                                            {isEditing && (
                                                                <label
                                                                    title="Change photo"
                                                                    className="no-print absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[8px] cursor-pointer shadow"
                                                                >
                                                                    📷
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) =>
                                                                            handlePhotoUpload(e, (dataUrl) =>
                                                                                setEditDraft((prev) => ({ ...prev, photoUrl: dataUrl }))
                                                                            )
                                                                        }
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {sheetType === "manpower" && (
                                                        <td style={{ width: columnWidths.id || 110, minWidth: columnWidths.id || 110 }} className={`py-3 px-4 font-extrabold text-amber-700 ${alignClass} bg-gradient-to-b from-white via-white to-amber-50/40 border-x border-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]`}>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editDraft.id ?? ""}
                                                                    onChange={(e) => handleEditChange("id", e.target.value)}
                                                                    placeholder="Worker ID"
                                                                    className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            ) : (
                                                                worker.id || <span className="text-slate-300 italic font-semibold">—</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    {/* Name */}
                                                    <td style={{ width: columnWidths.name || 180, minWidth: columnWidths.name || 180 }} className={`py-3 px-4 font-extrabold text-slate-900 ${alignClass}`}>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editDraft.name ?? ""}
                                                                onChange={(e) => handleEditChange("name", e.target.value)}
                                                                className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                            />
                                                        ) : (
                                                            worker.name
                                                        )}
                                                    </td>

                                                    {/* Trade — Manpower মোডে এখানেই থাকে */}
                                                    {sheetType === "manpower" && (
                                                        <td style={{ width: columnWidths.trade || 140, minWidth: columnWidths.trade || 140 }} className={`py-3 px-4 ${alignClass}`}>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editDraft.trade ?? ""}
                                                                    onChange={(e) => handleEditChange("trade", e.target.value)}
                                                                    className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-900 text-[14px] font-extrabold rounded-full border border-amber-300">
                                                                    {worker.trade}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Custom (user-added) columns */}
                                                    {customColumns.map((col) => (
                                                        <td
                                                            key={col.id}
                                                            style={{ width: columnWidths[col.id] || 140, minWidth: columnWidths[col.id] || 140 }}
                                                            className={`py-3 px-4 ${alignClass}`}
                                                        >
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editDraft.customFields?.[col.id] ?? worker.customFields?.[col.id] ?? ""}
                                                                    onChange={(e) => handleEditCustomFieldChange(col.id, e.target.value)}
                                                                    className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            ) : (
                                                                worker.customFields?.[col.id] || ""
                                                            )}
                                                        </td>
                                                    ))}

                                                    {/* Hours */}
                                                    <td style={{ width: columnWidths.hours || 110, minWidth: columnWidths.hours || 110 }} className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editDraft.hours ?? 0}
                                                                onChange={(e) => handleEditChange("hours", Number(e.target.value))}
                                                                className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-mono font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                            />
                                                        ) : (
                                                            `${worker.hours} hrs`
                                                        )}
                                                    </td>

                                                    {/* Rate */}
                                                    <td style={{ width: columnWidths.rate || 110, minWidth: columnWidths.rate || 110 }} className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={editDraft.ratePerHour ?? 0}
                                                                onChange={(e) => handleEditChange("ratePerHour", Number(e.target.value))}
                                                                className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-mono font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                            />
                                                        ) : (
                                                            `${selectedCurrency.symbol}${worker.ratePerHour.toFixed(2)}`
                                                        )}
                                                    </td>

                                                    <td style={{ width: columnWidths.gross || 140, minWidth: columnWidths.gross || 140 }} className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                                                        {selectedCurrency.symbol}{grossSalary.toFixed(2)}
                                                    </td>

                                                    {/* Advance */}
                                                    <td style={{ width: columnWidths.advance || 130, minWidth: columnWidths.advance || 130 }} className="py-3 px-4 text-right font-mono font-extrabold text-rose-700">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={editDraft.advance ?? 0}
                                                                onChange={(e) => handleEditChange("advance", Number(e.target.value))}
                                                                className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-mono font-bold text-rose-700 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                            />
                                                        ) : (
                                                            `-${selectedCurrency.symbol}${worker.advance.toFixed(2)}`
                                                        )}
                                                    </td>

                                                    {/* Deduction — শুধু Manpower মোডে দেখা যায় */}
                                                    {sheetType === "manpower" && (
                                                        <td style={{ width: columnWidths.deduction || 130, minWidth: columnWidths.deduction || 130 }} className="py-3 px-4 text-right font-mono font-extrabold text-orange-700">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={editDraft.deduction ?? 0}
                                                                    onChange={(e) => handleEditChange("deduction", Number(e.target.value))}
                                                                    className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-mono font-bold text-orange-700 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            ) : (
                                                                `-${selectedCurrency.symbol}${worker.deduction.toFixed(2)}`
                                                            )}
                                                        </td>
                                                    )}

                                                    <td style={{ width: columnWidths.net || 140, minWidth: columnWidths.net || 140 }} className="py-3 px-4 text-right font-mono font-extrabold text-amber-800 bg-amber-50">
                                                        {selectedCurrency.symbol}{netAmount.toFixed(2)}
                                                    </td>

                                                    {/* Remarks — শুধু Driver মোডে, Net Amount-এর পরে (worker.trade ফিল্ড রিইউজ করা হচ্ছে) */}
                                                    {sheetType === "driver" && (
                                                        <td style={{ width: columnWidths.trade || 160, minWidth: columnWidths.trade || 160 }} className={`py-3 px-4 ${alignClass}`}>
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editDraft.trade ?? ""}
                                                                    onChange={(e) => handleEditChange("trade", e.target.value)}
                                                                    placeholder="Remarks"
                                                                    className="w-full border border-amber-300 rounded px-2 py-1 text-[14px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            ) : (
                                                                worker.trade || <span className="text-slate-300 italic">—</span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Action dropdown: Edit / Save / Delete — never printed */}
                                                    <td style={{ width: columnWidths.action || 100, minWidth: columnWidths.action || 100 }} className="action-col py-3 px-4 text-center relative overflow-visible">
                                                        <div className="relative inline-block text-left" data-action-menu>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setOpenActionMenu((prev) => (prev === worker.sl ? null : worker.sl))
                                                                }
                                                                aria-haspopup="menu"
                                                                aria-expanded={openActionMenu === worker.sl}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-amber-300/60 bg-white hover:bg-amber-50 text-slate-700 text-xs font-bold shadow-sm transition-colors"
                                                            >
                                                                Action
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className={`w-3.5 h-3.5 transition-transform ${openActionMenu === worker.sl ? "rotate-180" : ""}`}
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>

                                                            {openActionMenu === worker.sl && (
                                                                <div
                                                                    role="menu"
                                                                    className="absolute right-0 z-40 mt-1 w-36 bg-white border border-amber-200 rounded-md shadow-xl overflow-hidden text-left"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        onClick={() => handleEditStart(worker)}
                                                                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        onClick={() => handleEditSave(worker.sl)}
                                                                        disabled={!isEditing}
                                                                        className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                                                    >
                                                                        💾 Save
                                                                    </button>
                                                                    {isEditing && (
                                                                        <button
                                                                            type="button"
                                                                            role="menuitem"
                                                                            onClick={() => {
                                                                                handleEditCancel();
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                                                                        >
                                                                            ✕ Cancel
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        role="menuitem"
                                                                        onClick={() => handleDelete(worker.sl)}
                                                                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                                                                    >
                                                                        🗑️ Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={(sheetType === "driver" ? 9 : 11) + customColumns.length} className="text-center py-6 text-slate-400">
                                                No {sheetType === "driver" ? "driver" : "worker"} data available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* Table Footer */}
                                <tfoot>
                                    <tr className="bg-gradient-to-r from-black via-slate-950 to-black text-amber-200 font-extrabold text-[14px] border-t-2 border-amber-400/40">
                                        <td colSpan={(sheetType === "driver" ? 2 : 4) + customColumns.length} className="py-3 px-4 text-right uppercase tracking-wider font-extrabold text-amber-200/90">
                                            Total Summary:
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">{totalHours}{sheetType === "driver" ? " days" : " hrs"}</td>
                                        <td className="py-3 px-4 text-right">-</td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-white">{selectedCurrency.symbol}{totalGrossSalary.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-300">-{selectedCurrency.symbol}{totalAdvance.toFixed(2)}</td>
                                        {sheetType === "manpower" && (
                                            <td className="py-3 px-4 text-right font-mono font-extrabold text-orange-300">-{selectedCurrency.symbol}{totalDeduction.toFixed(2)}</td>
                                        )}
                                        <td className="py-3 px-4 text-right font-mono text-amber-300 font-extrabold text-base bg-black/30">
                                            {selectedCurrency.symbol}{totalNetPayable.toFixed(2)}
                                        </td>
                                        {sheetType === "driver" && <td></td>}
                                        <td className="action-col"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Paste Modal */}
            {isBulkPasteOpen && (
                <div className="no-print fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border-2 border-amber-300/50">
                        <h2 className="text-lg font-extrabold text-slate-950 mb-2">
                            Bulk Paste {sheetType === "driver" ? "Drivers" : "Workers"}
                        </h2>
                        <p className="text-xs text-slate-500 mb-3">
                            {sheetType === "driver" ? (
                                <>
                                    Paste one driver per line using Tab-separated (Excel/Sheets) or
                                    comma-separated columns:
                                    <span className="font-mono"> Name, Day, RPD, AD, Remarks</span>
                                    <span className="block mt-1 text-slate-400">
                                        AD (Advance) and Remarks are optional — leave blank and Advance will be treated as 0.
                                    </span>
                                    <span className="block mt-1 text-slate-400">
                                        Pasting rows copied from "Copy Data" / "Export CSV" (which also include SL, Amount and Net Amount) works too — Amount and Net Amount are always recalculated from Day, RPD and AD.
                                    </span>
                                </>
                            ) : (
                                <>
                                    Paste one worker per line using Tab-separated (Excel/Sheets) or
                                    comma-separated columns:
                                    <span className="font-mono">
                                        {" "}ID, Name, Trade, Hours, Rate/Hour, Advance, Deduction
                                    </span>
                                    <span className="block mt-1 text-slate-400">
                                        Advance and Deduction columns are optional — leave blank and they will be treated as 0.
                                    </span>
                                    <span className="block mt-1 text-slate-400">
                                        Pasting rows copied from "Copy Data" / "Export CSV" (which also include SL, Gross Salary and Net Amount) works too — those two columns are always recalculated from Hours, Rate, Advance and Deduction, so any manual calculation mistake in a pasted Gross Salary or Net Amount figure is automatically corrected.
                                    </span>
                                </>
                            )}
                        </p>

                        <div className="mb-3">
                            <label className="block text-xs font-extrabold text-slate-950 mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name for this salary period"
                                className="w-full border border-amber-300/60 rounded-md px-3 py-2 text-sm font-bold text-slate-950 placeholder:text-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                            <p className="mt-1 text-[10px] text-slate-400">
                                এই নামেই ডাটা সেভ হবে। ভিন্ন কোম্পানি যোগ করতে উপরের ▼ ড্রপডাউন থেকে "+ নতুন" ব্যবহার করুন।
                            </p>
                        </div>

                        <textarea
                            autoFocus
                            rows={10}
                            value={bulkPasteText}
                            onChange={(e) => setBulkPasteText(e.target.value)}
                            placeholder={
                                sheetType === "driver"
                                    ? `Karim Mia\t26\t400\t500\tLate arrival\nRahim Ali\t28\t350\t0\t`
                                    : `MP-104\tJamal Hossain\tPlumber\t220\t15\t500\t50\nMP-105\tRony Mia\tHelper\t200\t10\t200\t0`
                            }
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-amber-500 resize-y"
                        />

                        {bulkPasteError && (
                            <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                                ⚠️ {bulkPasteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setBulkPasteText("");
                                    setBulkPasteError(null);
                                    setIsBulkPasteOpen(false);
                                }}
                                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded hover:bg-slate-200"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleBulkPaste}
                                disabled={!bulkPasteText.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black rounded hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add All {sheetType === "driver" ? "Drivers" : "Workers"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Worker Modal */}
            {isModalOpen && (
                <div className="no-print fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border-2 border-amber-300/50">
                        <h2 className="text-lg font-extrabold text-slate-950 mb-4">
                            Add New {sheetType === "driver" ? "Driver" : "Worker"} Entry
                        </h2>
                        <form onSubmit={handleAddWorker} className="space-y-3">
                            <div>
                                <label className="block text-xs font-extrabold text-slate-950 mb-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Enter company name for this salary period"
                                    className="w-full border border-amber-300/60 rounded-md px-3 py-2 text-sm font-bold text-slate-950 placeholder:text-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                                <p className="mt-1 text-[10px] text-slate-400">
                                    এই নামেই ডাটা সেভ হবে। ভিন্ন কোম্পানি যোগ করতে উপরের ▼ ড্রপডাউন থেকে "+ নতুন" ব্যবহার করুন।
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-slate-950 mb-1">
                                    Profile Photo
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-300/60 bg-amber-50 flex items-center justify-center shrink-0">
                                        {newWorker.photoUrl ? (
                                            <img src={newWorker.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-amber-400 text-[10px] font-bold">No Photo</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handlePhotoUpload(e, (dataUrl) =>
                                                setNewWorker((prev) => ({ ...prev, photoUrl: dataUrl }))
                                            )
                                        }
                                        className="text-xs font-semibold text-slate-600"
                                    />
                                </div>
                            </div>
                            {sheetType === "manpower" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Worker ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. MP-104"
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                        value={newWorker.id}
                                        onChange={(e) => setNewWorker({ ...newWorker, id: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Jamal Hossain"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                    value={newWorker.name}
                                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                                />
                            </div>
                            {sheetType === "manpower" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Trade/Role</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Plumber"
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                        value={newWorker.trade}
                                        onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        {sheetType === "driver" ? "Day" : "Hours"}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                        value={newWorker.hours}
                                        onChange={(e) => setNewWorker({ ...newWorker, hours: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        {sheetType === "driver" ? `RPD (${selectedCurrency.symbol}/day)` : `Rate (${selectedCurrency.symbol}/hr)`}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                        value={newWorker.ratePerHour}
                                        onChange={(e) => setNewWorker({ ...newWorker, ratePerHour: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        {sheetType === "driver" ? `AD (${selectedCurrency.symbol})` : `Advance (${selectedCurrency.symbol})`}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                        value={newWorker.advance}
                                        onChange={(e) => setNewWorker({ ...newWorker, advance: Number(e.target.value) })}
                                    />
                                </div>
                                {sheetType === "manpower" ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Deduction ({selectedCurrency.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            title="Any fixed amount to cut from this worker's salary — e.g. sold salary or a specific deduction"
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                            value={newWorker.deduction}
                                            onChange={(e) => setNewWorker({ ...newWorker, deduction: Number(e.target.value) })}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Late arrival"
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-amber-500"
                                            value={newWorker.trade}
                                            onChange={(e) => setNewWorker({ ...newWorker, trade: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            {addWorkerError && (
                                <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                                    ⚠️ {addWorkerError}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddWorkerError(null);
                                        setIsModalOpen(false);
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black rounded hover:from-amber-400 hover:to-yellow-300"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
