"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ============================================================
   TYPES
   ============================================================ */
type AttendanceStatus = "Present" | "Absent" | "Leave";

type Attendance = {
  date: string;
  inTime: string;
  outTime: string;
  overtime: number;
  status: AttendanceStatus;
  workedHours: number;
  dailySalary: number;
  overtimePay: number;
  grossPay: number;
  note?: string;
  /** true = OT manually set (via CSV), skip auto-calc from in/out */
  otManual?: boolean;
};

type AdvanceLedger = {
  id: string;
  amount: number;
  installmentAmount: number;
  remainingAmount: number;
  paidAmount: number;
  createdAt: string;
  note?: string;
  active: boolean;
};

type AdvanceDeductionDetail = {
  advanceId: string;
  amount: number;
};

type SalaryLedger = {
  id: string;
  month: string;
  year: string;
  baseSalary: number;
  totalWorkedDays: number;
  totalOvertimeHours: number;
  overtimeRate: number;
  totalOvertimePay: number;
  grossSalary: number;
  totalAdvanceDeduction: number;
  netSalary: number;
  generatedAt: string;
  /** which advances got deducted and by how much (for reversal) */
  advanceDeductions: AdvanceDeductionDetail[];
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  license: string;
  photo?: string;
  company: string;
  trade: string;
  month: string;
  year: string;
  salaryPerMonth: number;
  salaryPerDay: number;
  overtimeRate: number;
  attendance: Attendance[];
  advances: AdvanceLedger[];
  salaryLedger: SalaryLedger[];
};

type DriverForm = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  license: string;
  company: string;
  trade: string;
  month: string;
  year: string;
  salaryPerMonth: number;
  overtimeRate: number;
};

type SortKey = "name" | "id" | "company" | "vehicle";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | AttendanceStatus;
type ThemeMode = "light" | "dark";
type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

/* ============================================================
   CONSTANTS & UTILITIES
   ============================================================ */
const STORAGE_KEY = "awm_erp_drivers_v4";
const THEME_KEY = "awm_erp_theme_v1";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      /* fall through */
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const getCurrentDate = () => new Date().toISOString().split("T")[0];

const getCurrentMonth = () =>
  new Date().toLocaleString("default", { month: "long" });

const getCurrentYear = () => new Date().getFullYear().toString();

const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const formatSAR = (amount: number) =>
  `SAR ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const safeDiv = (a: number, b: number) => (b ? a / b : 0);

const monthYearFromDate = (isoDate: string) => {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return { month: "", year: "" };
  return {
    month: d.toLocaleString("default", { month: "long" }),
    year: d.getFullYear().toString(),
  };
};

const getInitialForm = (): DriverForm => ({
  id: "",
  name: "",
  phone: "",
  vehicle: "",
  license: "",
  company: "",
  trade: "Driver",
  month: getCurrentMonth(),
  year: getCurrentYear(),
  salaryPerMonth: 3000,
  overtimeRate: 15,
});

const parseDateTime = (date: string, time: string) =>
  new Date(`${date}T${time}`);

/** FIX #5: Night shift support — if out<in, add 24h */
const calculateWorkedHours = (inTime: string, outTime: string, date: string) => {
  if (!inTime || !outTime) return 0;
  const inDate = parseDateTime(date, inTime);
  let outDate = parseDateTime(date, outTime);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;

  // Night shift: out time on next calendar day
  if (outDate.getTime() <= inDate.getTime()) {
    outDate = new Date(outDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const diff = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60);
  return Number(Math.max(diff, 0).toFixed(2));
};

const calculateOvertime = (inTime: string, outTime: string, date: string) => {
  const workedHours = calculateWorkedHours(inTime, outTime, date);
  return workedHours > 8 ? Number((workedHours - 8).toFixed(2)) : 0;
};

const calculateDailySalary = (
  salaryPerDay: number,
  status: AttendanceStatus,
) => (status !== "Present" ? 0 : Number((salaryPerDay || 0).toFixed(2)));

/** FIX #4: Support overtime override for CSV imports where in/out may be blank */
const calculateAttendancePayroll = (
  driver: Pick<Driver, "salaryPerDay" | "overtimeRate">,
  attendance: Attendance,
  otOverride?: number,
): Attendance => {
  const workedHours =
    attendance.inTime && attendance.outTime
      ? calculateWorkedHours(attendance.inTime, attendance.outTime, attendance.date)
      : 0;

  let overtime: number;
  if (typeof otOverride === "number" && otOverride >= 0) {
    // Trust CSV / manual OT value
    overtime = Number(otOverride.toFixed(2));
  } else if (attendance.otManual && attendance.overtime >= 0) {
    overtime = Number(attendance.overtime.toFixed(2));
  } else {
    overtime = attendance.inTime && attendance.outTime
      ? (workedHours > 8 ? Number((workedHours - 8).toFixed(2)) : 0)
      : 0;
  }

  const dailySalary = calculateDailySalary(driver.salaryPerDay, attendance.status);
  const overtimePay = Number(
    (overtime * (driver.overtimeRate || 0)).toFixed(2),
  );
  const grossPay = Number((dailySalary + overtimePay).toFixed(2));

  return {
    ...attendance,
    overtime,
    workedHours,
    dailySalary,
    overtimePay,
    grossPay,
  };
};

/** FIX #1: Actually apply advance deductions when finalizing */
const finalizeSalaryLedger = (
  driver: Driver,
  month: string,
  year: string,
): { ledger: SalaryLedger; updatedAdvances: AdvanceLedger[] } => {
  const monthAttendance = driver.attendance.filter((a) => {
    const my = monthYearFromDate(a.date);
    return my.month === month && my.year === year;
  });

  const presentRecords = monthAttendance.filter((a) => a.status === "Present");
  const totalWorkedDays = presentRecords.length;

  const totalOvertimeHours = Number(
    presentRecords.reduce((sum, item) => sum + item.overtime, 0).toFixed(2),
  );
  const totalOvertimePay = Number(
    presentRecords.reduce((sum, item) => sum + item.overtimePay, 0).toFixed(2),
  );
  const grossSalary = Number(
    presentRecords.reduce((sum, item) => sum + item.grossPay, 0).toFixed(2),
  );

  let totalAdvanceDeduction = 0;
  const advanceDeductions: AdvanceDeductionDetail[] = [];

  const updatedAdvances = driver.advances.map((advance) => {
    if (!advance.active || advance.remainingAmount <= 0) return advance;
    const deduction = Math.min(advance.installmentAmount, advance.remainingAmount);
    if (deduction <= 0) return advance;

    totalAdvanceDeduction += deduction;
    advanceDeductions.push({ advanceId: advance.id, amount: deduction });

    const remaining = Number((advance.remainingAmount - deduction).toFixed(2));
    const paidAmount = Number((advance.paidAmount + deduction).toFixed(2));
    return {
      ...advance,
      remainingAmount: remaining,
      paidAmount,
      active: remaining > 0,
    };
  });

  const netSalary = Number((grossSalary - totalAdvanceDeduction).toFixed(2));

  const ledger: SalaryLedger = {
    id: generateId(),
    month,
    year,
    baseSalary: driver.salaryPerMonth,
    totalWorkedDays,
    totalOvertimeHours,
    overtimeRate: driver.overtimeRate,
    totalOvertimePay,
    grossSalary,
    totalAdvanceDeduction,
    netSalary,
    generatedAt: new Date().toISOString(),
    advanceDeductions,
  };

  return { ledger, updatedAdvances };
};

/** Preview only — no side effects */
const previewSalaryLedger = (
  driver: Driver,
  month?: string,
  year?: string,
): SalaryLedger => {
  const targetMonth = month ?? driver.month;
  const targetYear = year ?? driver.year;

  const monthAttendance = driver.attendance.filter((a) => {
    const my = monthYearFromDate(a.date);
    return my.month === targetMonth && my.year === targetYear;
  });

  const presentRecords = monthAttendance.filter((a) => a.status === "Present");
  const totalWorkedDays = presentRecords.length;
  const totalOvertimeHours = Number(
    presentRecords.reduce((sum, item) => sum + item.overtime, 0).toFixed(2),
  );
  const totalOvertimePay = Number(
    presentRecords.reduce((sum, item) => sum + item.overtimePay, 0).toFixed(2),
  );
  const grossSalary = Number(
    presentRecords.reduce((sum, item) => sum + item.grossPay, 0).toFixed(2),
  );

  const currentInstallmentDue = driver.advances
    .filter((a) => a.active && a.remainingAmount > 0)
    .reduce(
      (sum, a) => sum + Math.min(a.installmentAmount, a.remainingAmount),
      0,
    );

  return {
    id: "preview",
    month: targetMonth,
    year: targetYear,
    baseSalary: driver.salaryPerMonth,
    totalWorkedDays,
    totalOvertimeHours,
    overtimeRate: driver.overtimeRate,
    totalOvertimePay,
    grossSalary,
    totalAdvanceDeduction: currentInstallmentDue,
    netSalary: Number((grossSalary - currentInstallmentDue).toFixed(2)),
    generatedAt: new Date().toISOString(),
    advanceDeductions: [],
  };
};

/* ============================================================
   ICONS (Inline SVG - no external deps)
   ============================================================ */
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const paths: Record<string, React.ReactNode> = {
    sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    search: (<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>),
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
    edit: (<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    check: <path d="M20 6 9 17l-5-5" />,
    download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
    upload: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />,
    print: (<><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>),
    users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
    clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
    wallet: (<><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>),
    calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
    grid: (<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>),
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    chart: <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />,
    zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    lock: (<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
    unlock: (<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>),
    refresh: (<><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>),
  };
  return (
    <svg className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

/* ============================================================
   REUSABLE COMPONENTS
   ============================================================ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[30px] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-3xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizeClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fadeIn" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn",
          sizeClass,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <h3 className="text-lg font-black">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

type ToastListProps = { toasts: Toast[]; onDismiss: (id: string) => void };

function ToastList({ toasts, onDismiss }: ToastListProps) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-3">
      {toasts.map((toast) => {
        const colorClass = {
          success: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
          error: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
          info: "border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200",
          warning: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
        }[toast.type];
        return (
          <div key={toast.id} className={cn("rounded-2xl border p-4 shadow-lg backdrop-blur-xl animate-slideInRight", colorClass)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold">{toast.title}</p>
                {toast.message && <p className="mt-1 text-xs opacity-80">{toast.message}</p>}
              </div>
              <button onClick={() => onDismiss(toast.id)} className="rounded-full p-1 transition hover:bg-black/10" aria-label="Dismiss">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function DriverAttendancePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState<DriverForm>(getInitialForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [payrollMonth, setPayrollMonth] = useState<string>(getCurrentMonth());
  const [payrollYear, setPayrollYear] = useState<string>(getCurrentYear());

  const [isLoaded, setIsLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [csvImportLoading, setCsvImportLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [clock, setClock] = useState<string>("");

  const [advanceModal, setAdvanceModal] = useState({
    open: false, driverId: "", amount: "1000", installments: "4", note: "",
  });
  const [manualAttendanceModal, setManualAttendanceModal] = useState({
    open: false, driverId: "", date: getCurrentDate(),
    inTime: "08:00", outTime: "17:00", status: "Present" as AttendanceStatus, note: "",
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false, driverId: "", driverName: "",
  });
  const [confirmFinalize, setConfirmFinalize] = useState({
    open: false, driverId: "", month: "", year: "",
  });
  const [confirmReverse, setConfirmReverse] = useState({
    open: false, driverId: "", ledgerId: "", label: "",
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const attendanceInputRef = useRef<HTMLInputElement | null>(null);
  const salaryInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------- toast ---------------- */
  const pushToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------------- load / persist ---------------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Driver[];
        if (Array.isArray(parsed)) setDrivers(parsed);
      }
      const storedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (storedTheme === "dark") setTheme("dark");
    } catch {
      setDrivers([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
  }, [drivers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(THEME_KEY, theme);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, isLoaded]);

  useEffect(() => {
    const tick = () => setClock(formatTime());
    tick();
    const int = setInterval(tick, 1000);
    return () => clearInterval(int);
  }, []);

  /* ---------------- driver CRUD ---------------- */
  const resetForm = () => { setForm(getInitialForm()); setEditingId(null); };

  const addOrUpdateDriver = () => {
    if (!form.id.trim() || !form.name.trim()) {
      pushToast("error", "Missing Fields", "Driver ID and Name are required.");
      return;
    }
    const salary = Number(form.salaryPerMonth) || 0;
    const otRate = Number(form.overtimeRate) || 0;

    if (editingId) {
      setDrivers((prev) => prev.map((d) => d.id === editingId ? {
        ...d,
        name: form.name.trim(), phone: form.phone.trim(),
        vehicle: form.vehicle.trim(), license: form.license.trim(),
        company: form.company.trim(), trade: form.trade.trim(),
        month: form.month, year: form.year,
        salaryPerMonth: salary,
        salaryPerDay: Number(safeDiv(salary, 30).toFixed(2)),
        overtimeRate: otRate,
      } : d));
      pushToast("success", "Driver Updated", `${form.name} has been updated.`);
      resetForm();
      return;
    }
    const exists = drivers.some((d) => d.id.toLowerCase() === form.id.trim().toLowerCase());
    if (exists) {
      pushToast("error", "Duplicate ID", `Driver ID "${form.id}" already exists.`);
      return;
    }
    const newDriver: Driver = {
      id: form.id.trim(), name: form.name.trim(), phone: form.phone.trim(),
      vehicle: form.vehicle.trim(), license: form.license.trim(),
      company: form.company.trim(), trade: form.trade.trim(),
      month: form.month, year: form.year,
      salaryPerMonth: salary,
      salaryPerDay: Number(safeDiv(salary, 30).toFixed(2)),
      overtimeRate: otRate,
      attendance: [], advances: [], salaryLedger: [],
    };
    setDrivers((prev) => [newDriver, ...prev]);
    setSelectedDriver(newDriver.id);
    resetForm();
    pushToast("success", "Driver Added", `${newDriver.name} has been registered.`);
  };

  const beginEditDriver = (driver: Driver) => {
    setEditingId(driver.id);
    setForm({
      id: driver.id, name: driver.name, phone: driver.phone,
      vehicle: driver.vehicle, license: driver.license,
      company: driver.company, trade: driver.trade,
      month: driver.month, year: driver.year,
      salaryPerMonth: driver.salaryPerMonth, overtimeRate: driver.overtimeRate,
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    pushToast("info", "Edit Mode", `Editing ${driver.name}.`);
  };

  const deleteDriver = () => {
    const { driverId, driverName } = confirmDelete;
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    if (selectedDriver === driverId) setSelectedDriver("");
    if (editingId === driverId) resetForm();
    setConfirmDelete({ open: false, driverId: "", driverName: "" });
    pushToast("success", "Driver Deleted", `${driverName} has been removed.`);
  };

  /* ---------------- attendance (upsert only, no ledger side-effect) ---------------- */
  const upsertAttendance = (
    driverId: string,
    updater: (existing: Attendance | undefined, driver: Driver) => Attendance | null,
    dateOverride?: string,
    otOverride?: number,
  ) => {
    const targetDate = dateOverride ?? getCurrentDate();
    setDrivers((prev) => prev.map((driver) => {
      if (driver.id !== driverId) return driver;
      const attendance = [...driver.attendance];
      const idx = attendance.findIndex((a) => a.date === targetDate);
      const existing = idx >= 0 ? attendance[idx] : undefined;
      const next = updater(existing, driver);
      if (!next) return driver;
      const computed = calculateAttendancePayroll(driver, next, otOverride);
      if (idx >= 0) attendance[idx] = computed;
      else attendance.unshift(computed);
      // sort desc by date so newest on top
      attendance.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      return { ...driver, attendance };
    }));
  };

  const markAttendance = (driverId: string, type: "checkin" | "checkout") => {
    const time = formatTime();
    upsertAttendance(driverId, (existing) => {
      if (type === "checkin") {
        return {
          date: getCurrentDate(),
          inTime: existing?.inTime || time,
          outTime: existing?.outTime || "",
          overtime: 0, status: "Present",
          workedHours: 0, dailySalary: 0, overtimePay: 0, grossPay: 0,
          note: existing?.note, otManual: false,
        };
      }
      if (!existing?.inTime) return null;
      return { ...existing, outTime: time, status: "Present", otManual: false };
    });
    if (type === "checkout") {
      const d = drivers.find((x) => x.id === driverId);
      const att = d?.attendance.find((a) => a.date === getCurrentDate());
      if (!att?.inTime) {
        pushToast("warning", "No Check-in", "Please check-in first.");
        return;
      }
    }
    pushToast("success", type === "checkin" ? "Checked In" : "Checked Out", `Recorded at ${time}`);
  };

  const setDriverAttendanceStatus = (driverId: string, status: Exclude<AttendanceStatus, "Present">) => {
    upsertAttendance(driverId, (existing) => ({
      date: getCurrentDate(),
      inTime: "", outTime: "", overtime: 0, status,
      workedHours: 0, dailySalary: 0, overtimePay: 0, grossPay: 0,
      note: existing?.note, otManual: false,
    }));
    pushToast("info", "Status Updated", `Marked as ${status}.`);
  };

  const saveManualAttendance = () => {
    const { driverId, date, inTime, outTime, status, note } = manualAttendanceModal;
    if (!driverId || !date) {
      pushToast("error", "Invalid Data", "Driver and Date are required.");
      return;
    }
    upsertAttendance(driverId, () => ({
      date,
      inTime: status === "Present" ? inTime : "",
      outTime: status === "Present" ? outTime : "",
      overtime: 0, status,
      workedHours: 0, dailySalary: 0, overtimePay: 0, grossPay: 0,
      note: note.trim() || undefined, otManual: false,
    }), date);
    setManualAttendanceModal({
      open: false, driverId: "", date: getCurrentDate(),
      inTime: "08:00", outTime: "17:00", status: "Present", note: "",
    });
    pushToast("success", "Attendance Saved", `Manual entry for ${date} recorded.`);
  };

  /* ---------------- advances ---------------- */
  const saveAdvance = () => {
    const { driverId, amount, installments, note } = advanceModal;
    const amt = Number(amount);
    const inst = Math.max(1, Number(installments) || 1);
    if (!driverId || !amt || amt <= 0) {
      pushToast("error", "Invalid Amount", "Enter a valid advance amount.");
      return;
    }
    const installmentAmount = Number(safeDiv(amt, inst).toFixed(2));
    setDrivers((prev) => prev.map((driver) => {
      if (driver.id !== driverId) return driver;
      const advance: AdvanceLedger = {
        id: generateId(), amount: amt, installmentAmount,
        remainingAmount: amt, paidAmount: 0,
        createdAt: new Date().toISOString(),
        note: note.trim() || undefined, active: true,
      };
      return { ...driver, advances: [advance, ...driver.advances] };
    }));
    setAdvanceModal({ open: false, driverId: "", amount: "1000", installments: "4", note: "" });
    pushToast("success", "Advance Added", `${formatSAR(amt)} split into ${inst} installments.`);
  };

  const closeAdvance = (driverId: string, advanceId: string) => {
    setDrivers((prev) => prev.map((driver) => {
      if (driver.id !== driverId) return driver;
      return {
        ...driver,
        advances: driver.advances.map((a) => a.id === advanceId ? { ...a, active: false } : a),
      };
    }));
    pushToast("info", "Advance Closed", "This advance will no longer deduct.");
  };

  /* ---------------- FIX #1 & #2: Finalize & Reverse payroll ---------------- */
  const finalizePayroll = () => {
    const { driverId, month, year } = confirmFinalize;
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    // Prevent double finalization
    const already = driver.salaryLedger.find((l) => l.month === month && l.year === year);
    if (already) {
      pushToast("error", "Already Finalized", `${month} ${year} was already finalized. Reverse it first.`);
      setConfirmFinalize({ open: false, driverId: "", month: "", year: "" });
      return;
    }

    const { ledger, updatedAdvances } = finalizeSalaryLedger(driver, month, year);

    setDrivers((prev) => prev.map((d) => d.id === driverId ? {
      ...d,
      advances: updatedAdvances,
      salaryLedger: [ledger, ...d.salaryLedger],
    } : d));

    setConfirmFinalize({ open: false, driverId: "", month: "", year: "" });
    pushToast(
      "success",
      "Payroll Finalized",
      `${month} ${year}: ${formatSAR(ledger.netSalary)} net. ${formatSAR(ledger.totalAdvanceDeduction)} deducted.`,
    );
  };

  const reversePayroll = () => {
    const { driverId, ledgerId } = confirmReverse;
    setDrivers((prev) => prev.map((driver) => {
      if (driver.id !== driverId) return driver;
      const ledger = driver.salaryLedger.find((l) => l.id === ledgerId);
      if (!ledger) return driver;

      // Restore advances
      const restoredAdvances = driver.advances.map((advance) => {
        const found = ledger.advanceDeductions.find((d) => d.advanceId === advance.id);
        if (!found) return advance;
        const restoredRemaining = Number((advance.remainingAmount + found.amount).toFixed(2));
        const restoredPaid = Math.max(0, Number((advance.paidAmount - found.amount).toFixed(2)));
        return {
          ...advance,
          remainingAmount: restoredRemaining,
          paidAmount: restoredPaid,
          active: true,
        };
      });

      return {
        ...driver,
        advances: restoredAdvances,
        salaryLedger: driver.salaryLedger.filter((l) => l.id !== ledgerId),
      };
    }));
    setConfirmReverse({ open: false, driverId: "", ledgerId: "", label: "" });
    pushToast("success", "Payroll Reversed", "Advances restored, ledger removed.");
  };

  /* ---------------- CSV parse ---------------- */
  const parseCSV = async (file: File): Promise<string[][]> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result?.toString() || "";
          const rows = csv.split(/\r?\n/).filter((r) => r.trim().length > 0)
            .map((row) => row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
          resolve(rows);
        } catch (error) { reject(error); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });

  /** FIX #3 & #4: proper upsert + OT override */
  const importAttendanceCSV = async (file: File) => {
    setCsvImportLoading(true);
    try {
      const rows = await parseCSV(file);
      const body = rows.slice(1);
      let updatedCount = 0;
      let recordsCount = 0;

      setDrivers((prev) => prev.map((driver) => {
        const matched = body.filter((r) => r[0] && r[0] === driver.id);
        if (!matched.length) return driver;
        updatedCount++;

        // Map for upsert by date
        const map = new Map<string, Attendance>();
        driver.attendance.forEach((a) => map.set(a.date, a));

        matched.forEach((row) => {
          const date = row[1] || getCurrentDate();
          const inTime = row[2] || "";
          const outTime = row[3] || "";
          const otCsv = Number(row[4] || 0);
          const status = ((row[5] || "Present").trim() as AttendanceStatus);

          const hasOtOverride = otCsv > 0 && (!inTime || !outTime);

          const baseAtt: Attendance = {
            date, inTime, outTime,
            overtime: otCsv,
            status: (["Present", "Absent", "Leave"].includes(status) ? status : "Present") as AttendanceStatus,
            workedHours: 0, dailySalary: 0, overtimePay: 0, grossPay: 0,
            note: row[6] || undefined,
            otManual: hasOtOverride,
          };
          const computed = calculateAttendancePayroll(
            driver,
            baseAtt,
            hasOtOverride ? otCsv : undefined,
          );
          map.set(date, computed);
          recordsCount++;
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
        );
        return { ...driver, attendance: merged };
      }));
      pushToast("success", "Attendance Imported", `${recordsCount} records across ${updatedCount} driver(s).`);
    } catch {
      pushToast("error", "Import Failed", "Could not parse CSV.");
    } finally {
      setCsvImportLoading(false);
    }
  };

  const importSalaryCSV = async (file: File) => {
    setCsvImportLoading(true);
    try {
      const rows = await parseCSV(file);
      const body = rows.slice(1);
      let updatedCount = 0;
      setDrivers((prev) => prev.map((driver) => {
        const matched = body.find((r) => r[0] === driver.id);
        if (!matched) return driver;
        updatedCount++;
        const salary = Number(matched[1] || 0);
        const otRate = Number(matched[2] || 0);
        return {
          ...driver,
          salaryPerMonth: salary,
          salaryPerDay: Number(safeDiv(salary, 30).toFixed(2)),
          overtimeRate: otRate,
        };
      }));
      pushToast("success", "Salary Imported", `${updatedCount} driver(s) updated.`);
    } catch {
      pushToast("error", "Import Failed", "Could not parse CSV.");
    } finally {
      setCsvImportLoading(false);
    }
  };

  /* ---------------- CSV export ---------------- */
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDriversCSV = () => {
    if (!drivers.length) { pushToast("warning", "No Data", "No drivers to export."); return; }
    const header = ["ID", "Name", "Phone", "Company", "Vehicle", "License", "Trade", "Salary/Month", "OT Rate"];
    const body = drivers.map((d) => [d.id, d.name, d.phone, d.company, d.vehicle, d.license, d.trade, d.salaryPerMonth, d.overtimeRate]);
    downloadCSV(`awm_drivers_${getCurrentDate()}.csv`, [header, ...body]);
    pushToast("success", "Exported", "Drivers list downloaded.");
  };

  const exportAttendanceCSV = (driver: Driver) => {
    if (!driver.attendance.length) { pushToast("warning", "No Data", "No attendance records."); return; }
    const header = ["Driver ID", "Date", "In", "Out", "OT (h)", "Status", "Worked (h)", "Daily Salary", "OT Pay", "Gross", "Note"];
    const body = driver.attendance.map((a) => [
      driver.id, a.date, a.inTime || "", a.outTime || "",
      a.overtime, a.status, a.workedHours, a.dailySalary, a.overtimePay, a.grossPay, a.note || "",
    ]);
    downloadCSV(`attendance_${driver.id}_${getCurrentDate()}.csv`, [header, ...body]);
    pushToast("success", "Exported", `Attendance for ${driver.name} downloaded.`);
  };

  const printPayslip = (driver: Driver, ledger: SalaryLedger) => {
    if (typeof window === "undefined") return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) { pushToast("error", "Print Blocked", "Popup blocked by browser."); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Payslip - ${driver.name}</title>
      <style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;padding:40px;color:#0f172a}
      .header{border-bottom:3px solid #0891b2;padding-bottom:16px;margin-bottom:24px}
      h1{margin:0;color:#0891b2;font-size:28px}
      .sub{color:#64748b;font-size:14px;margin-top:4px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
      .box{background:#f8fafc;border-radius:12px;padding:16px}
      .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
      .value{font-size:16px;font-weight:700;margin-top:4px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#0891b2;color:#fff;padding:12px;text-align:left;font-size:12px}
      td{padding:12px;border-bottom:1px solid #e2e8f0;font-size:13px}
      .total{background:#0891b2;color:#fff;padding:20px;border-radius:12px;margin-top:20px;display:flex;justify-content:space-between;align-items:center}
      .total .amt{font-size:28px;font-weight:900}
      .footer{margin-top:40px;color:#94a3b8;font-size:12px;text-align:center}</style></head><body>
      <div class="header"><h1>PAYSLIP • AWM ERP</h1>
      <div class="sub">${ledger.month} ${ledger.year} • Generated ${new Date(ledger.generatedAt).toLocaleString()}</div></div>
      <div class="grid">
        <div class="box"><div class="label">Driver</div><div class="value">${driver.name}</div><div class="sub">${driver.id}</div></div>
        <div class="box"><div class="label">Company / Vehicle</div><div class="value">${driver.company || "-"}</div><div class="sub">${driver.vehicle || "-"}</div></div>
        <div class="box"><div class="label">Base Salary</div><div class="value">${formatSAR(ledger.baseSalary)}</div></div>
        <div class="box"><div class="label">Worked Days</div><div class="value">${ledger.totalWorkedDays}</div></div>
      </div>
      <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
        <tr><td>Gross Salary</td><td style="text-align:right">${formatSAR(ledger.grossSalary)}</td></tr>
        <tr><td>Overtime Hours</td><td style="text-align:right">${ledger.totalOvertimeHours} h</td></tr>
        <tr><td>Overtime Pay</td><td style="text-align:right">${formatSAR(ledger.totalOvertimePay)}</td></tr>
        <tr><td>Advance Deduction</td><td style="text-align:right">-${formatSAR(ledger.totalAdvanceDeduction)}</td></tr>
      </tbody></table>
      <div class="total"><div><div style="font-size:12px;opacity:0.85">NET SALARY</div>
        <div style="font-size:11px;opacity:0.7">Payable Amount</div></div>
        <div class="amt">${formatSAR(ledger.netSalary)}</div></div>
      <div class="footer">AWM ERP • Enterprise Workforce Intelligence</div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
    pushToast("success", "Payslip Ready", `Print dialog opened.`);
  };

  /* ---------------- derived ---------------- */
  const filteredDrivers = useMemo(() => {
    const query = search.toLowerCase();
    const searched = drivers.filter((d) =>
      [d.name, d.id, d.phone, d.vehicle, d.company].join(" ").toLowerCase().includes(query)
    );
    const filtered = searched.filter((d) => {
      if (statusFilter === "all") return true;
      const att = d.attendance.find((a) => a.date === getCurrentDate());
      return att?.status === statusFilter;
    });
    return [...filtered].sort((a, b) => {
      const va = (a[sortKey] || "").toString().toLowerCase();
      const vb = (b[sortKey] || "").toString().toLowerCase();
      if (va < vb) return sortOrder === "asc" ? -1 : 1;
      if (va > vb) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [drivers, search, sortKey, sortOrder, statusFilter]);

  const selectedData = useMemo(
    () => drivers.find((d) => d.id === selectedDriver),
    [drivers, selectedDriver],
  );

  const dashboard = useMemo(() => {
    let present = 0, absent = 0, leave = 0, totalOT = 0, payroll = 0;
    drivers.forEach((driver) => {
      const att = driver.attendance.find((a) => a.date === getCurrentDate());
      if (!att) return;
      if (att.status === "Present") present++;
      if (att.status === "Absent") absent++;
      if (att.status === "Leave") leave++;
      totalOT += att.overtime;
      payroll += att.grossPay;
    });
    return { totalDrivers: drivers.length, present, absent, leave,
      totalOT: Number(totalOT.toFixed(2)), payroll: Number(payroll.toFixed(2)) };
  }, [drivers]);

  const roadmap = [
    { title: "GOSI Auto Contribution Engine", icon: "shield" },
    { title: "ZATCA E-Invoice Integration", icon: "chart" },
    { title: "Biometric Device Sync API", icon: "zap" },
    { title: "Geo-Fenced Attendance", icon: "shield" },
    { title: "Payroll Approval Workflow", icon: "check" },
    { title: "Multi-Currency Payroll", icon: "wallet" },
    { title: "Shift Management", icon: "clock" },
    { title: "Role-Based Payroll Access", icon: "shield" },
    { title: "AI Workforce Analytics", icon: "chart" },
    { title: "Automated Payslip PDF", icon: "download" },
  ];

  const todayLabel = useMemo(() => new Date().toLocaleDateString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }), []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - 2 + i).toString());
  }, []);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={cn("min-h-screen transition-colors duration-300",
      theme === "dark" ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-950")}>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.92) } to { opacity:1; transform: scale(1) } }
        @keyframes slideInRight { from { opacity:0; transform: translateX(20px) } to { opacity:1; transform: translateX(0) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.22s cubic-bezier(0.16,1,0.3,1); }
        .animate-slideInRight { animation: slideInRight 0.28s ease-out; }
        .shimmer-text {
          background: linear-gradient(90deg,#06b6d4,#2563eb,#06b6d4);
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <ToastList toasts={toasts} onDismiss={dismissToast} />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* ============ HERO ============ */}
          <div className={cn("mb-6 rounded-[34px] border p-6 shadow-2xl backdrop-blur-xl",
            theme === "dark" ? "border-slate-800/70 bg-slate-900/70" : "border-slate-200/70 bg-white/80")}>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  AWM ERP • Enterprise Workforce Intelligence
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Driver Attendance & <span className="shimmer-text">Payroll AI Suite</span>
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                    Real-time payroll automation, night-shift-aware overtime, advance auto-deduction,
                    monthly payroll finalization, CSV upsert engine and workforce analytics.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                    <Icon name="calendar" className="h-3.5 w-3.5" /> {todayLabel}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                    <Icon name="clock" className="h-3.5 w-3.5" /> <span className="font-mono">{clock}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Icon name="zap" className="h-3.5 w-3.5" /> Payroll Engine Active
                  </div>
                  <button onClick={() => setTheme((t) => t === "dark" ? "light" : "dark")}
                    className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold transition hover:scale-105 dark:border-slate-700 dark:bg-slate-950/60"
                    aria-label="Toggle theme">
                    <Icon name={theme === "dark" ? "sun" : "moon"} className="h-3.5 w-3.5" />
                    {theme === "dark" ? "Light" : "Dark"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {[
                  { label: "Drivers", value: dashboard.totalDrivers, icon: "users", color: "from-cyan-500 to-blue-600" },
                  { label: "Present", value: dashboard.present, icon: "check", color: "from-emerald-500 to-green-600" },
                  { label: "Absent", value: dashboard.absent, icon: "close", color: "from-rose-500 to-red-600" },
                  { label: "Leave", value: dashboard.leave, icon: "calendar", color: "from-amber-500 to-orange-600" },
                  { label: "OT Hours", value: dashboard.totalOT, icon: "clock", color: "from-violet-500 to-purple-600" },
                  { label: "Today Payroll", value: formatSAR(dashboard.payroll), icon: "wallet", color: "from-pink-500 to-fuchsia-600" },
                ].map((card) => (
                  <div key={card.label} className={cn("group relative overflow-hidden rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-xl",
                    theme === "dark" ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-white/70")}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br text-white", card.color)}>
                        <Icon name={card.icon} className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-black">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ EQUAL-HEIGHT: REGISTER + FILTERS ============ */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* REGISTER */}
            <div className={cn("flex h-full flex-col rounded-[34px] border p-6 shadow-xl backdrop-blur-xl",
              theme === "dark" ? "border-slate-800/70 bg-slate-900/70" : "border-slate-200/70 bg-white/80")}>
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{editingId ? "Update Driver" : "Register Driver"}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {editingId ? "Modify driver details and save changes." : "Enterprise-ready workforce onboarding."}
                  </p>
                </div>
                {editingId && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Editing
                  </span>
                )}
              </div>

              <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { key: "id", placeholder: "Driver ID", disabled: !!editingId },
                  { key: "name", placeholder: "Driver Name" },
                  { key: "phone", placeholder: "Phone" },
                  { key: "vehicle", placeholder: "Vehicle" },
                  { key: "license", placeholder: "License" },
                  { key: "company", placeholder: "Company" },
                  { key: "trade", placeholder: "Trade / Role" },
                ].map((field) => (
                  <input
                    key={field.key}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    value={form[field.key as keyof DriverForm] as string}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={cn("rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10",
                      field.disabled && "opacity-60",
                      theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}
                  />
                ))}
                <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                  className={cn("rounded-2xl border px-4 py-3 text-sm",
                    theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={cn("rounded-2xl border px-4 py-3 text-sm",
                    theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <input type="number" placeholder="Monthly Salary" value={form.salaryPerMonth}
                  onChange={(e) => setForm({ ...form, salaryPerMonth: Number(e.target.value) })}
                  className={cn("rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10",
                    theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")} />
                <input type="number" placeholder="OT Rate / Hour" value={form.overtimeRate}
                  onChange={(e) => setForm({ ...form, overtimeRate: Number(e.target.value) })}
                  className={cn("rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10",
                    theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={addOrUpdateDriver}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:scale-[1.02] active:scale-[0.98]">
                  <Icon name={editingId ? "check" : "plus"} className="h-4 w-4" />
                  {editingId ? "Save Changes" : "Add Driver"}
                </button>
                <button onClick={resetForm}
                  className={cn("flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]",
                    theme === "dark" ? "border-slate-700 bg-slate-950/60" : "border-slate-200 bg-white")}>
                  <Icon name="close" className="h-4 w-4" />
                  {editingId ? "Cancel Edit" : "Reset"}
                </button>
                <button onClick={() => attendanceInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:scale-[1.02] dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Icon name="upload" className="h-4 w-4" /> Attendance CSV
                </button>
                <button onClick={() => salaryInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-6 py-3 text-sm font-semibold text-violet-700 transition hover:scale-[1.02] dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                  <Icon name="upload" className="h-4 w-4" /> Salary CSV
                </button>
                <button onClick={exportDriversCSV}
                  className={cn("flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]",
                    theme === "dark" ? "border-slate-700 bg-slate-950/60" : "border-slate-200 bg-white")}>
                  <Icon name="download" className="h-4 w-4" /> Export Drivers
                </button>
                <input ref={attendanceInputRef} hidden type="file" accept=".csv"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void importAttendanceCSV(f); e.target.value = ""; }} />
                <input ref={salaryInputRef} hidden type="file" accept=".csv"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void importSalaryCSV(f); e.target.value = ""; }} />
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <strong>CSV Format (Attendance):</strong> ID, Date, InTime, OutTime, OT(h), Status, Note
              </div>
            </div>

            {/* FILTERS */}
            <div className={cn("flex h-full flex-col rounded-[34px] border p-6 shadow-xl backdrop-blur-xl",
              theme === "dark" ? "border-slate-800/70 bg-slate-900/70" : "border-slate-200/70 bg-white/80")}>
              <div className="mb-5">
                <h2 className="text-2xl font-black">Smart Filters</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Search, filter and sort your workforce.
                </p>
              </div>
              <div className="flex flex-1 flex-col space-y-4">
                <div className="relative">
                  <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, ID, phone, company, vehicle…"
                    className={cn("w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10",
                      theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                    className={cn("rounded-2xl border px-4 py-3 text-sm",
                      theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className={cn("rounded-2xl border px-4 py-3 text-sm",
                      theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                    <option value="name">Sort by Name</option>
                    <option value="id">Sort by ID</option>
                    <option value="company">Sort by Company</option>
                    <option value="vehicle">Sort by Vehicle</option>
                  </select>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className={cn("rounded-2xl border px-4 py-3 text-sm",
                      theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                {/* Payroll cycle selector */}
                <div className="mt-auto rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
                  <p className="mb-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    <Icon name="wallet" className="inline h-3.5 w-3.5" /> PAYROLL FINALIZATION CYCLE
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)}
                      className={cn("rounded-xl border px-3 py-2 text-sm",
                        theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)}
                      className={cn("rounded-xl border px-3 py-2 text-sm",
                        theme === "dark" ? "border-slate-700 bg-slate-950/70" : "border-slate-200 bg-white")}>
                      {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setViewMode("grid")}
                    className={cn("flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                      viewMode === "grid" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-200 dark:border-slate-700")}>
                    <Icon name="grid" className="h-4 w-4" /> Grid
                  </button>
                  <button onClick={() => setViewMode("compact")}
                    className={cn("flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
                      viewMode === "compact" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-200 dark:border-slate-700")}>
                    <Icon name="list" className="h-4 w-4" /> Compact
                  </button>
                  <div className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {filteredDrivers.length} Result{filteredDrivers.length !== 1 && "s"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ DRIVER LIST ============ */}
          <div className="mt-8">
            {!isLoaded || csvImportLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className={cn("rounded-[30px] border p-12 text-center",
                theme === "dark" ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white/70")}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <Icon name="users" className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-black">No Drivers Found</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {drivers.length === 0 ? "Register your first driver above to get started." : "Try adjusting your search or filter."}
                </p>
              </div>
            ) : (
              <div className={cn("grid gap-5",
                viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                {filteredDrivers.map((driver) => {
                  const todayAttendance = driver.attendance.find((a) => a.date === getCurrentDate());
                  const preview = previewSalaryLedger(driver, payrollMonth, payrollYear);
                  const activeAdvances = driver.advances.filter((a) => a.active && a.remainingAmount > 0).length;
                  const alreadyFinalized = driver.salaryLedger.some((l) => l.month === payrollMonth && l.year === payrollYear);

                  return (
                    <div key={driver.id}
                      className={cn("group relative rounded-[32px] border p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl",
                        theme === "dark" ? "border-slate-800/70 bg-slate-900/70" : "border-slate-200/70 bg-white/80")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-black text-white shadow-lg shadow-cyan-500/30">
                              {driver.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-lg font-black">{driver.name}</h3>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {driver.id} • {driver.trade}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            <p className="truncate"><span className="text-slate-400">Company:</span> {driver.company || "-"}</p>
                            <p className="truncate"><span className="text-slate-400">Vehicle:</span> {driver.vehicle || "-"}</p>
                            <p><span className="text-slate-400">Salary:</span> <span className="font-bold">{formatSAR(driver.salaryPerMonth)}</span></p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn("rounded-full px-3 py-1 text-xs font-bold",
                            todayAttendance?.status === "Present" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                            todayAttendance?.status === "Absent" && "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
                            todayAttendance?.status === "Leave" && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                            !todayAttendance && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                            {todayAttendance?.status || "No Record"}
                          </span>
                          {activeAdvances > 0 && (
                            <span className="rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                              {activeAdvances} Adv
                            </span>
                          )}
                          {alreadyFinalized && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              <Icon name="lock" className="inline h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button onClick={() => markAttendance(driver.id, "checkin")}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]">
                          <Icon name="check" className="h-4 w-4" /> Check In
                        </button>
                        <button onClick={() => markAttendance(driver.id, "checkout")}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:scale-[1.02] hover:bg-rose-700 active:scale-[0.98]">
                          <Icon name="logout" className="h-4 w-4" /> Check Out
                        </button>
                        <button onClick={() => setDriverAttendanceStatus(driver.id, "Leave")}
                          className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:scale-[1.02] hover:bg-amber-600 active:scale-[0.98]">
                          Leave
                        </button>
                        <button onClick={() => setDriverAttendanceStatus(driver.id, "Absent")}
                          className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white shadow-md shadow-slate-900/20 transition hover:scale-[1.02] hover:bg-slate-900 active:scale-[0.98] dark:bg-slate-700 dark:hover:bg-slate-600">
                          Absent
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className={cn("rounded-2xl p-3", theme === "dark" ? "bg-slate-950/60" : "bg-slate-100")}>
                          <p className="text-[11px] text-slate-500">Daily Salary</p>
                          <p className="mt-1 text-sm font-black">{formatSAR(todayAttendance?.dailySalary || 0)}</p>
                        </div>
                        <div className={cn("rounded-2xl p-3", theme === "dark" ? "bg-slate-950/60" : "bg-slate-100")}>
                          <p className="text-[11px] text-slate-500">OT Pay</p>
                          <p className="mt-1 text-sm font-black">{formatSAR(todayAttendance?.overtimePay || 0)}</p>
                        </div>
                      </div>

                      <div className={cn("mt-4 rounded-2xl border p-4",
                        theme === "dark" ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50")}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Net ({payrollMonth.slice(0,3)} {payrollYear})</p>
                            <p className="mt-1 text-xl font-black">{formatSAR(preview.netSalary)}</p>
                            <p className="text-[10px] text-slate-400">
                              Gross {formatSAR(preview.grossSalary)} − Adv {formatSAR(preview.totalAdvanceDeduction)}
                            </p>
                          </div>
                          <button onClick={() => setAdvanceModal({
                            open: true, driverId: driver.id, amount: "1000", installments: "4", note: "",
                          })}
                            className="flex items-center gap-1.5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-700 transition hover:scale-105 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                            <Icon name="plus" className="h-3.5 w-3.5" /> Advance
                          </button>
                        </div>
                        <button onClick={() => setConfirmFinalize({
                          open: true, driverId: driver.id, month: payrollMonth, year: payrollYear,
                        })}
                          disabled={alreadyFinalized}
                          className={cn("mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition",
                            alreadyFinalized
                              ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                              : "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md hover:scale-[1.02]")}>
                          <Icon name={alreadyFinalized ? "lock" : "check"} className="h-3.5 w-3.5" />
                          {alreadyFinalized ? "Already Finalized" : `Finalize ${payrollMonth.slice(0,3)} ${payrollYear}`}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => setSelectedDriver(driver.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]">
                          <Icon name="chart" className="h-4 w-4" /> Payroll
                        </button>
                        <button onClick={() => setManualAttendanceModal({
                          open: true, driverId: driver.id, date: getCurrentDate(),
                          inTime: "08:00", outTime: "17:00", status: "Present", note: "",
                        })}
                          className={cn("flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition hover:scale-[1.02]",
                            theme === "dark" ? "border-slate-700 bg-slate-950/60" : "border-slate-200 bg-white")}
                          title="Manual Attendance">
                          <Icon name="calendar" className="h-4 w-4" />
                        </button>
                        <button onClick={() => beginEditDriver(driver)}
                          className={cn("flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition hover:scale-[1.02]",
                            theme === "dark" ? "border-slate-700 bg-slate-950/60" : "border-slate-200 bg-white")}
                          title="Edit Driver">
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmDelete({
                          open: true, driverId: driver.id, driverName: driver.name,
                        })}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 transition hover:scale-[1.02] dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                          title="Delete Driver">
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============ PAYROLL DETAIL ============ */}
          {selectedData && (
            <div className={cn("mt-8 rounded-[34px] border p-6 shadow-2xl backdrop-blur-xl",
              theme === "dark" ? "border-slate-800/70 bg-slate-900/70" : "border-slate-200/70 bg-white/80")}>
              <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black sm:text-3xl">Payroll Intelligence</h2>
                    <button onClick={() => setSelectedDriver("")}
                      className={cn("rounded-full p-2 transition hover:scale-110",
                        theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600")}
                      title="Close">
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-bold">{selectedData.name}</span> • {selectedData.id} • Cycle: {payrollMonth} {payrollYear}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => exportAttendanceCSV(selectedData)}
                    className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:scale-[1.02]",
                      theme === "dark" ? "border-slate-700 bg-slate-950/60" : "border-slate-200 bg-white")}>
                    <Icon name="download" className="h-4 w-4" /> Export CSV
                  </button>
                  <button onClick={() => {
                    const ledger = previewSalaryLedger(selectedData, payrollMonth, payrollYear);
                    printPayslip(selectedData, ledger);
                  }}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]">
                    <Icon name="print" className="h-4 w-4" /> Print Preview
                  </button>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(() => {
                  const preview = previewSalaryLedger(selectedData, payrollMonth, payrollYear);
                  return [
                    { label: "Base Salary", value: formatSAR(selectedData.salaryPerMonth), color: "from-cyan-500 to-blue-600" },
                    { label: "Gross (Cycle)", value: formatSAR(preview.grossSalary), color: "from-fuchsia-500 to-pink-600" },
                    { label: "Net (Est.)", value: formatSAR(preview.netSalary), color: "from-emerald-500 to-green-600" },
                    { label: "OT Hours", value: preview.totalOvertimeHours, color: "from-amber-500 to-orange-600" },
                  ];
                })().map((item) => (
                  <div key={item.label} className={cn("relative overflow-hidden rounded-3xl border p-4",
                    theme === "dark" ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50")}>
                    <div className={cn("absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br opacity-20 blur-2xl", item.color)} />
                    <p className="relative text-xs text-slate-500">{item.label}</p>
                    <p className="relative mt-2 text-lg font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* ADVANCE LEDGER */}
              {selectedData.advances.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-black">Advance Ledger</h3>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedData.advances.map((a) => (
                      <div key={a.id} className={cn("rounded-2xl border p-4",
                        theme === "dark" ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50")}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                            a.active && a.remainingAmount > 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                            {a.remainingAmount <= 0 ? "PAID OFF" : a.active ? "ACTIVE" : "CLOSED"}
                          </span>
                        </div>
                        <p className="mt-2 text-lg font-black">{formatSAR(a.amount)}</p>
                        {a.note && <p className="text-[11px] text-slate-500 italic">"{a.note}"</p>}
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div><p className="text-slate-400">Installment</p><p className="font-bold">{formatSAR(a.installmentAmount)}</p></div>
                          <div><p className="text-slate-400">Paid</p><p className="font-bold text-emerald-600">{formatSAR(a.paidAmount)}</p></div>
                          <div><p className="text-slate-400">Remaining</p><p className="font-bold text-rose-600">{formatSAR(a.remainingAmount)}</p></div>
                        </div>
                        {a.active && a.remainingAmount > 0 && (
                          <button onClick={() => closeAdvance(selectedData.id, a.id)}
                            className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:scale-[1.02] dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                            Waive / Close Advance
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SALARY LEDGER HISTORY (FIX #2) */}
              {selectedData.salaryLedger.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-black">
                    <Icon name="lock" className="inline h-4 w-4" /> Payroll History
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedData.salaryLedger.map((l) => (
                      <div key={l.id} className={cn("rounded-2xl border-2 border-emerald-200 p-4 dark:border-emerald-500/30",
                        theme === "dark" ? "bg-slate-950/50" : "bg-emerald-50/50")}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{l.month} {l.year}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            FINALIZED
                          </span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                          {formatSAR(l.netSalary)}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <p>Gross: <span className="font-bold">{formatSAR(l.grossSalary)}</span></p>
                          <p>OT: <span className="font-bold">{l.totalOvertimeHours}h ({formatSAR(l.totalOvertimePay)})</span></p>
                          <p>Deducted: <span className="font-bold text-rose-600">-{formatSAR(l.totalAdvanceDeduction)}</span></p>
                          <p>Days: <span className="font-bold">{l.totalWorkedDays}</span></p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => printPayslip(selectedData, l)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:scale-[1.02]">
                            <Icon name="print" className="h-3.5 w-3.5" /> Payslip
                          </button>
                          <button onClick={() => setConfirmReverse({
                            open: true, driverId: selectedData.id, ledgerId: l.id, label: `${l.month} ${l.year}`,
                          })}
                            className="flex items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:scale-[1.02] dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                            <Icon name="refresh" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATTENDANCE TABLE */}
              <h3 className="mb-3 text-lg font-black">Attendance Ledger</h3>
              <div className={cn("overflow-hidden rounded-[30px] border",
                theme === "dark" ? "border-slate-800" : "border-slate-200")}>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={cn(theme === "dark" ? "bg-slate-950" : "bg-slate-100")}>
                      <tr>
                        {["Date", "In", "Out", "Worked", "OT", "Daily Salary", "OT Pay", "Gross", "Status"].map((h) => (
                          <th key={h} className="px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedData.attendance.length === 0 ? (
                        <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">No attendance records yet.</td></tr>
                      ) : (
                        selectedData.attendance.map((att, index) => (
                          <tr key={`${att.date}-${index}`}
                            className={cn("border-t transition",
                              theme === "dark" ? "border-slate-800 hover:bg-slate-950/40" : "border-slate-200 hover:bg-slate-50/80")}>
                            <td className="px-4 py-4 text-sm font-semibold">{att.date}</td>
                            <td className="px-4 py-4 text-sm">{att.inTime || "--"}</td>
                            <td className="px-4 py-4 text-sm">{att.outTime || "--"}</td>
                            <td className="px-4 py-4 text-sm font-semibold">{att.workedHours} h</td>
                            <td className="px-4 py-4 text-sm font-semibold">
                              {att.overtime} h {att.otManual && <span title="Manual" className="text-cyan-600">*</span>}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold">{formatSAR(att.dailySalary)}</td>
                            <td className="px-4 py-4 text-sm font-semibold">{formatSAR(att.overtimePay)}</td>
                            <td className="px-4 py-4 text-sm font-black">{formatSAR(att.grossPay)}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={cn("rounded-full px-3 py-1 text-xs font-bold",
                                att.status === "Present" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                                att.status === "Absent" && "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
                                att.status === "Leave" && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300")}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedData.attendance.some((a) => a.otManual) && (
                <p className="mt-2 text-xs text-slate-500">* Overtime imported from CSV (manual override)</p>
              )}

              <div className="mt-8">
                <h3 className="mb-4 text-2xl font-black">Payroll Gap Analysis Roadmap</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {roadmap.map((item) => (
                    <div key={item.title} className={cn("group rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl",
                      theme === "dark" ? "border-slate-800 bg-slate-950/50" : "border-slate-200 bg-slate-50")}>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                        <Icon name={item.icon} className="h-5 w-5" />
                      </div>
                      <h4 className="text-base font-black">{item.title}</h4>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Production-ready integration layer compatible with AWM ERP modular architecture.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Data stored locally • AWM ERP Suite © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* ============ MODAL: ADVANCE ============ */}
      <Modal open={advanceModal.open} onClose={() => setAdvanceModal((p) => ({ ...p, open: false }))} title="Add Salary Advance">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Amount (SAR)</label>
            <input type="number" value={advanceModal.amount}
              onChange={(e) => setAdvanceModal({ ...advanceModal, amount: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950/70"
              placeholder="1000" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Installments</label>
            <input type="number" value={advanceModal.installments}
              onChange={(e) => setAdvanceModal({ ...advanceModal, installments: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950/70"
              placeholder="4" />
            <p className="mt-1 text-xs text-slate-500">Deducted on each payroll finalization until fully paid.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Note (optional)</label>
            <input type="text" value={advanceModal.note}
              onChange={(e) => setAdvanceModal({ ...advanceModal, note: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950/70"
              placeholder="Emergency, medical, etc." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAdvanceModal((p) => ({ ...p, open: false }))}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950/60">
              Cancel
            </button>
            <button onClick={saveAdvance}
              className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20">
              Save Advance
            </button>
          </div>
        </div>
      </Modal>

      {/* ============ MODAL: MANUAL ATTENDANCE ============ */}
      <Modal open={manualAttendanceModal.open} onClose={() => setManualAttendanceModal((p) => ({ ...p, open: false }))} title="Manual Attendance Entry">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Date</label>
            <input type="date" value={manualAttendanceModal.date}
              onChange={(e) => setManualAttendanceModal({ ...manualAttendanceModal, date: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950/70" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Status</label>
            <select value={manualAttendanceModal.status}
              onChange={(e) => setManualAttendanceModal({ ...manualAttendanceModal, status: e.target.value as AttendanceStatus })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70">
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          {manualAttendanceModal.status === "Present" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500">In Time</label>
                <input type="time" value={manualAttendanceModal.inTime}
                  onChange={(e) => setManualAttendanceModal({ ...manualAttendanceModal, inTime: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Out Time <span className="text-cyan-600">(night shift OK)</span></label>
                <input type="time" value={manualAttendanceModal.outTime}
                  onChange={(e) => setManualAttendanceModal({ ...manualAttendanceModal, outTime: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70" />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500">Note (optional)</label>
            <input type="text" value={manualAttendanceModal.note}
              onChange={(e) => setManualAttendanceModal({ ...manualAttendanceModal, note: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70"
              placeholder="Optional remark" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setManualAttendanceModal((p) => ({ ...p, open: false }))}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950/60">
              Cancel
            </button>
            <button onClick={saveManualAttendance}
              className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20">
              Save Entry
            </button>
          </div>
        </div>
      </Modal>

      {/* ============ MODAL: DELETE CONFIRM ============ */}
      <Modal open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, driverId: "", driverName: "" })} title="Delete Driver" size="sm">
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <Icon name="trash" className="h-6 w-6" />
          </div>
          <p className="text-center text-sm">
            Are you sure you want to delete <span className="font-bold">{confirmDelete.driverName}</span>?
            This removes all attendance, advances and payroll history. Cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmDelete({ open: false, driverId: "", driverName: "" })}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950/60">
              Cancel
            </button>
            <button onClick={deleteDriver}
              className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20">
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

      {/* ============ MODAL: FINALIZE CONFIRM ============ */}
      <Modal open={confirmFinalize.open} onClose={() => setConfirmFinalize({ open: false, driverId: "", month: "", year: "" })} title="Finalize Payroll" size="sm">
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Icon name="lock" className="h-6 w-6" />
          </div>
          <p className="text-center text-sm">
            Finalize payroll for <span className="font-bold">{confirmFinalize.month} {confirmFinalize.year}</span>?
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            This will <strong>deduct advance installments</strong>, lock the month, and add a payroll record.
            You can reverse it later.
          </p>
          {confirmFinalize.driverId && (() => {
            const d = drivers.find((x) => x.id === confirmFinalize.driverId);
            if (!d) return null;
            const preview = previewSalaryLedger(d, confirmFinalize.month, confirmFinalize.year);
            return (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="flex justify-between"><span>Gross:</span><span className="font-bold">{formatSAR(preview.grossSalary)}</span></div>
                <div className="flex justify-between text-rose-600"><span>Advance Deduction:</span><span className="font-bold">-{formatSAR(preview.totalAdvanceDeduction)}</span></div>
                <div className="mt-2 flex justify-between border-t border-emerald-300 pt-2 dark:border-emerald-500/30">
                  <span className="font-bold">NET:</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{formatSAR(preview.netSalary)}</span>
                </div>
              </div>
            );
          })()}
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmFinalize({ open: false, driverId: "", month: "", year: "" })}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950/60">
              Cancel
            </button>
            <button onClick={finalizePayroll}
              className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
              Finalize & Deduct
            </button>
          </div>
        </div>
      </Modal>

      {/* ============ MODAL: REVERSE CONFIRM ============ */}
      <Modal open={confirmReverse.open} onClose={() => setConfirmReverse({ open: false, driverId: "", ledgerId: "", label: "" })} title="Reverse Payroll" size="sm">
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <Icon name="refresh" className="h-6 w-6" />
          </div>
          <p className="text-center text-sm">
            Reverse the finalized payroll for <span className="font-bold">{confirmReverse.label}</span>?
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            Previously deducted advances will be <strong>restored</strong>, and the payroll ledger entry will be removed.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmReverse({ open: false, driverId: "", ledgerId: "", label: "" })}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950/60">
              Cancel
            </button>
            <button onClick={reversePayroll}
              className="rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20">
              Reverse Payroll
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
