"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ---------------------- CONSTANTS (kept intact + extended safely) ----------------------
const defaultColumns = [
  "SL",
  "ID NUMBER",
  "NAME",
  "POSITION",
  "HOURS",
  "DEPARTMENT",
  "CLOCK IN TIME",
  "CLOCK OUT TIME",
  "STATUS",
];

const statusOptions = Array.from(
  new Set([
    "Present",
    "Absent",
    "Late",
    "Leave",
    "Holiday",
    "Half Day",
    "Remote",
    "Field Work",
    "Training",
    "Weekend",
    "Suspended",
    // 2026 ERP Status Tracking (added; non-breaking)
    "Pending",
    "Approved",
    "Rejected",
  ])
);

// ---------------------- UTILS ----------------------
const classNames = (...a: (string | boolean | undefined | null)[]) =>
  a.filter(Boolean).join(" ");

const safeTimeToDate = (t?: string) => {
  if (!t) return null;
  const normalized = /^\d{2}:\d{2}(:\d{2})?$/.test(t) ? t : null;
  if (!normalized) return null;
  try {
    return new Date(`2025-01-01T${normalized}`);
  } catch {
    return null;
  }
};

const toCSV = (cols: string[], rows: any[]) => {
  const escape = (v: any) => {
    const s = (v ?? "").toString();
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const head = cols.map(escape).join(",");
  const body = rows
    .map((r) => cols.map((c) => escape(r.data?.[c] ?? "")).join(","))
    .join("\n");
  return `${head}\n${body}`;
};

const escapeHTML = (s: any) =>
  (s ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const downloadFile = (content: string, filename: string, mime = "text/csv") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Smart status classification (non-breaking: only applies when autoStatus is ON)
const classifyStatus = (inTime?: string, outTime?: string) => {
  const inD = safeTimeToDate(inTime);
  const outD = safeTimeToDate(outTime);
  if (!inD || !outD) return "Absent";
  if (outD <= inD) return "Absent";
  // Late if clock-in after 09:30
  const nineThirty = new Date("2025-01-01T09:30:00");
  if (inD > nineThirty) return "Late";
  return "Present";
};

const calculateDurationHours = (inTime?: string, outTime?: string) => {
  if (!inTime || !outTime) return 0;
  const start = new Date(`2025-01-01T${inTime}`);
  const end = new Date(`2025-01-01T${outTime}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (!isFinite(diff) || diff <= 0) return 0;
  return diff;
};

// Debounce hook (for search, autosave, etc.)
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---------------------- COMPONENT ----------------------
export default function TimeSheetPage() {
  const [columns, setColumns] = useState(defaultColumns);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
// Bulk Excel Paste
const [showPasteModal, setShowPasteModal] = useState(false);
const [pasteData, setPasteData] = useState("");
  const [autoStatus, setAutoStatus] = useState(true);

  const [month, setMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());

  // Company name (kept existing header, add persistence safely)
  const [companyName, setCompanyName] = useState("");

  // Advanced Form Page (full-screen) states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  // Selection + Header Edit/Delete buttons
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Overtime rule (simple, non-breaking)
  const [overtimeThresholdHours, setOvertimeThresholdHours] = useState(8);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    status: string[];
    department: string;
    minHours: string;
    maxHours: string;
    inFrom: string;
    inTo: string;
    outFrom: string;
    outTo: string;
  }>({
    status: [],
    department: "",
    minHours: "",
    maxHours: "",
    inFrom: "",
    inTo: "",
    outFrom: "",
    outTo: "",
  });

  // Debounced search and debounced rows for autosave
  const debouncedSearch = useDebounce(search, 300);
  const debouncedRowsForSave = useDebounce({ rows, columns, month, year }, 1200);

  // ---------------------- LOAD DATA FROM MONGODB (kept; enhanced with UX safety) ----------------------
  useEffect(() => {
    loadData();
    // Restore persisted preferences (non-breaking)
    try {
      const savedCompany = localStorage.getItem("ts_company_name");
      if (savedCompany) setCompanyName(savedCompany);
      const savedMonth = localStorage.getItem("ts_month");
      if (savedMonth) setMonth(savedMonth);
      const savedYear = localStorage.getItem("ts_year");
      if (savedYear) setYear(Number(savedYear));
      const savedAutoSave = localStorage.getItem("ts_auto_save");
      if (savedAutoSave) setAutoSave(savedAutoSave === "1");
      const savedThreshold = localStorage.getItem("ts_ot_threshold");
      if (savedThreshold) setOvertimeThresholdHours(Number(savedThreshold) || 8);
    } catch {}
    // Keyboard shortcuts (non-breaking, respectful)
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveData();
      } else if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        printTable();
      } else if (mod && e.key.toLowerCase() === "e") {
        e.preventDefault();
        exportCSV();
      } else if ((e.altKey || mod) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openCreateForm();
      } else if ((e.altKey || mod) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowFilters((s) => !s);
      } else if (e.key === "Escape" && showForm) {
        setShowForm(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payroll-service/time-sheet");
      const result = await res.json();
      if (result?.success && Array.isArray(result?.data) && result.data.length > 0) {
        const latest = result.data[0] || {};
        setColumns(latest.columns || defaultColumns);
        setRows(latest.rows || [{ id: Date.now(), data: {} }]);
      } else {
        setRows([{ id: Date.now(), data: {} }]);
      }
    } catch (error) {
      console.error(error);
      // Fail-safe: keep UI usable
      if (rows.length === 0) {
        setRows([{ id: Date.now(), data: {} }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- SAVE DATA (kept endpoint + payload; enhanced UX) ----------------------
  const saveData = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/payroll-service/time-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, columns, rows }),
      });

      const result = await res.json();
      if (result?.success) {
        setLastSavedAt(new Date().toLocaleTimeString());
        alert("Timesheet Saved Successfully");
      } else {
        alert("Save Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save (optional, non-breaking)
  useEffect(() => {
    try {
      localStorage.setItem("ts_auto_save", autoSave ? "1" : "0");
    } catch {}
  }, [autoSave]);

  useEffect(() => {
    if (!autoSave) return;
    if (isLoading) return;
    const run = async () => {
      try {
        setIsSaving(true);
        const res = await fetch("/api/payroll-service/time-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            month,
            year,
            columns,
            rows,
          }),
        });
        const result = await res.json();
        if (result?.success) {
          setLastSavedAt(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setIsSaving(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRowsForSave]);

  // ---------------------- PRINT FUNCTION (kept) ----------------------
  const printTable = () => {
    window.print();
  };

  // ---------------------- EXPORT CSV (kept + stable) ----------------------
  const exportCSV = () => {
    try {
      const csv = toCSV(columns, filteredRows);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadFile(csv, `timesheet-${month}-${year}-${timestamp}.csv`);
    } catch (e) {
      console.error(e);
      alert("CSV Export Failed");
    }
  };

  // ---------------------- EXPORT EXCEL (NEW) ----------------------
  const exportExcel = () => {
    try {
      const head = `<tr>${columns.map((c) => `<th>${escapeHTML(c)}</th>`).join("")}</tr>`;
      const body = filteredRows
        .map(
          (r) =>
            `<tr>${columns
              .map((c) => `<td>${escapeHTML(r.data?.[c] ?? "")}</td>`)
              .join("")}</tr>`
        )
        
        .join("");
      const html =
        `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
        `<head><meta charset="UTF-8"></head>` +
        `<body><table border="1">${head}${body}</table></body></html>`;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadFile(html, `timesheet-${month}-${year}-${timestamp}.xls`, "application/vnd.ms-excel");
    } catch (e) {
      console.error(e);
      alert("Excel Export Failed");
    }
  };

  // ---------------------- HOURS & OVERTIME CALCULATION (kept + OT) ----------------------
  const calculateHours = (inTime: string, outTime: string) => {
    const h = calculateDurationHours(inTime, outTime);
    return h > 0 ? h.toFixed(2) : "0";
  };

  const calculateOvertime = (hoursStr?: string) => {
    const h = parseFloat(hoursStr || "0") || 0;
    const ot = Math.max(0, h - overtimeThresholdHours);
    return ot > 0 ? ot.toFixed(2) : "0";
  };

  // ---------------------- COLUMN & ROW ACTIONS (kept) ----------------------
  const addColumn = () => {
    const field = prompt("Enter New Field Name");
    if (!field) return;
    if (columns.includes(field)) {
      alert("Field already exists");
      return;
    }
    setColumns([...columns, field]);
  };

  const addOvertimeColumn = () => {
    if (columns.includes("OVERTIME")) {
      alert("OVERTIME column already exists");
      return;
    }
    setColumns([...columns, "OVERTIME"]);
    setRows((prev) =>
      prev.map((r) => {
        const hrs = r.data?.["HOURS"];
        const ot = calculateOvertime(hrs);
        return { ...r, data: { ...r.data, OVERTIME: ot } };
      })
    );
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), data: {} }]);
  };

  // ---------------------- CELL UPDATE (kept, enhanced with autoStatus + OT) ----------------------
  const updateCell = (rowIndex: number, column: string, value: string) => {
    const updatedRows = [...rows];

    updatedRows[rowIndex].data = {
      ...updatedRows[rowIndex].data,
      [column]: value,
    };

    const inTime = updatedRows[rowIndex].data["CLOCK IN TIME"];
    const outTime = updatedRows[rowIndex].data["CLOCK OUT TIME"];

    if (columns.includes("HOURS")) {
      updatedRows[rowIndex].data["HOURS"] = calculateHours(inTime, outTime);
    }

    if (columns.includes("OVERTIME")) {
      updatedRows[rowIndex].data["OVERTIME"] = calculateOvertime(
        updatedRows[rowIndex].data["HOURS"]
      );
    }

    if (autoStatus && (column === "CLOCK IN TIME" || column === "CLOCK OUT TIME")) {
      const currentStatus = updatedRows[rowIndex].data["STATUS"];
      if (!currentStatus || ["Present", "Absent", "Late", "Pending"].includes(currentStatus)) {
        updatedRows[rowIndex].data["STATUS"] = classifyStatus(inTime, outTime);
      }
    }

    setRows(updatedRows);
  };

  // ---------------------- STATUS CLASS (kept + 2026) ----------------------
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Absent":
        return "bg-red-100 text-red-700";
      case "Late":
        return "bg-orange-100 text-orange-700";
      case "Leave":
        return "bg-blue-100 text-blue-700";
      case "Holiday":
        return "bg-purple-100 text-purple-700";
      case "Remote":
        return "bg-cyan-100 text-cyan-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-rose-100 text-rose-700";
      default:
        return "";
    }
  };

  // ---------------------- FILTERS ----------------------
  const departments = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      const d = (r.data?.["DEPARTMENT"] || "").toString().trim();
      if (d) s.add(d);
    }
    return Array.from(s).sort();
  }, [rows]);

  const matchesFilters = (row: any) => {
    const d = row.data || {};
    if (filters.status.length > 0) {
      const rs = (d["STATUS"] || "").toString();
      if (!filters.status.includes(rs)) return false;
    }
    if (filters.department) {
      if ((d["DEPARTMENT"] || "").toString() !== filters.department) return false;
    }
    const hours = parseFloat(d["HOURS"] || "0") || 0;
    if (filters.minHours && hours < parseFloat(filters.minHours)) return false;
    if (filters.maxHours && hours > parseFloat(filters.maxHours)) return false;

    const inTime = d["CLOCK IN TIME"];
    const outTime = d["CLOCK OUT TIME"];
    const inD = safeTimeToDate(inTime);
    const outD = safeTimeToDate(outTime);

    if (filters.inFrom) {
      const f = safeTimeToDate(filters.inFrom);
      if (f && inD && inD < f) return false;
    }
    if (filters.inTo) {
      const t = safeTimeToDate(filters.inTo);
      if (t && inD && inD > t) return false;
    }
    if (filters.outFrom) {
      const f = safeTimeToDate(filters.outFrom);
      if (f && outD && outD < f) return false;
    }
    if (filters.outTo) {
      const t = safeTimeToDate(filters.outTo);
      if (t && outD && outD > t) return false;
    }
    return true;
  };

  // ---------------------- FILTER (kept; performance via debouncedSearch + advanced) ----------------------
  const filteredRows = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let base = rows;
    if (q) {
      base = base.filter((row) => {
        const values = Object.values(row.data || {}).join(" ");
        return values.toLowerCase().includes(q);
      });
    }
    base = base.filter(matchesFilters);
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, debouncedSearch, filters]);

  // ---------------------- DASHBOARD & SUMMARY (NEW) ----------------------
  const summary = useMemo(() => {
    const total = filteredRows.length;
    let totalHours = 0;
    let totalOT = 0;
    const counts: Record<string, number> = {};
    for (const r of filteredRows) {
      const h = parseFloat(r.data?.["HOURS"] || "0") || 0;
      totalHours += h;
      const ot = Math.max(0, h - overtimeThresholdHours);
      totalOT += ot;
      const st = (r.data?.["STATUS"] || "").toString();
      counts[st] = (counts[st] || 0) + 1;
    }
    const avgHours = total > 0 ? totalHours / total : 0;
    return {
      total,
      totalHours: Number(totalHours.toFixed(2)),
      avgHours: Number(avgHours.toFixed(2)),
      totalOT: Number(totalOT.toFixed(2)),
      counts,
    };
  }, [filteredRows, overtimeThresholdHours]);

  // ---------------------- FORM OPEN/CLOSE ----------------------
  const buildInitialFormData = () => {
    const initial: Record<string, string> = {};
    columns.forEach((c) => {
      if (c === "SL") initial[c] = String(rows.length + 1);
      else initial[c] = "";
    });
    return initial;
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingRowIndex(null);
    const initial = buildInitialFormData();
    setFormData(initial);
    setFormError(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current
        ?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select")
        ?.focus();
    }, 50);
  };

  const openEditFormByIndex = (index: number) => {
    const row = rows[index];
    if (!row) return;
    setFormMode("edit");
    setEditingRowIndex(index);
    const copy: Record<string, string> = {};
    columns.forEach((c) => {
      copy[c] = (row.data?.[c] ?? "").toString();
    });
    setFormData(copy);
    setFormError(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current
        ?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select")
        ?.focus();
    }, 50);
  };

  const openEditSelected = () => {
    if (selectedRowId == null) {
      alert("Please select a row to Edit");
      return;
    }
    const index = rows.findIndex((r) => r.id === selectedRowId);
    if (index === -1) {
      alert("Selected row not found");
      return;
    }
    openEditFormByIndex(index);
  };

  const deleteSelected = () => {
    if (selectedRowId == null) {
      alert("Please select a row to Delete");
      return;
    }
    const row = rows.find((r) => r.id === selectedRowId);
    const name = row?.data?.["NAME"] || "";
    const sure = confirm(
      `Are you sure you want to delete the selected record${name ? ` (${name})` : ""}?`
    );
    if (!sure) return;
    setRows((prev) => prev.filter((r) => r.id !== selectedRowId));
    setSelectedRowId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
  };

  const submitForm = () => {
    const required = ["ID NUMBER", "NAME", "POSITION", "DEPARTMENT", "CLOCK IN TIME", "CLOCK OUT TIME"].filter((c) =>
      columns.includes(c)
    );
    for (const key of required) {
      if (!formData[key]) {
        setFormError(`${key} is required`);
        return;
      }
    }

    if (columns.includes("HOURS")) {
      const h = calculateHours(formData["CLOCK IN TIME"], formData["CLOCK OUT TIME"]);
      formData["HOURS"] = h;
    }
    if (columns.includes("OVERTIME")) {
      formData["OVERTIME"] = calculateOvertime(formData["HOURS"]);
    }
    if (autoStatus && columns.includes("STATUS")) {
      const auto = classifyStatus(formData["CLOCK IN TIME"], formData["CLOCK OUT TIME"]);
      if (!formData["STATUS"]) formData["STATUS"] = auto;
    }

    if (formMode === "edit" && editingRowIndex != null) {
      setRows((prev) => {
        const next = [...prev];
        next[editingRowIndex] = { ...next[editingRowIndex], data: { ...formData } };
        return next;
      });
    } else {
      const newRow = {
        id: Date.now(),
        data: { ...formData },
      };
      setRows((prev) => [...prev, newRow]);
    }

    setShowForm(false);
    setFormError(null);
  };

  // ---------------------- PERSIST PREFERENCES (non-breaking) ----------------------
  useEffect(() => {
    try {
      localStorage.setItem("ts_company_name", companyName);
    } catch {}
  }, [companyName]);
  useEffect(() => {
    try {
      localStorage.setItem("ts_month", month);
    } catch {}
  }, [month]);
  useEffect(() => {
    try {
      localStorage.setItem("ts_year", String(year));
    } catch {}
  }, [year]);
  useEffect(() => {
    try {
      localStorage.setItem("ts_ot_threshold", String(overtimeThresholdHours));
    } catch {}
  }, [overtimeThresholdHours]);

  // ---------------------- RENDER ----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-6">
      {/* TOP PREMIUM RED ACCENT LINE (non-breaking visual) */}
      <div className="h-1.5 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 mb-4 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />

      {/* HEADER HERO (kept; cleaner spacing) */}
      <div className="text-center mb-5 md:mb-7">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
          Ayman TimeSheet Management System
        </h1>
        <p className="text-slate-300 mt-2 text-sm md:text-base">Professional Timesheet ERP — 2026 Standard</p>
      </div>

      {/* PRO TOOLBAR (Premium Red Theme, Smart/Balanced Layout) */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-rose-900/95 via-red-800/95 to-rose-900/95 backdrop-blur-md border border-red-700/60 rounded-xl p-3 md:p-4 mb-5 shadow-xl shadow-red-900/20 ring-1 ring-red-500/20">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Company Name (inline editable) */}
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-transparent border-red-700/40 text-white placeholder-slate-300 w-40 md:w-56 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Company name"
          />

          {/* Period Selectors */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-transparent border-red-700/40 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Month"
          >
            <option className="bg-slate-900 text-white">January</option><option className="bg-slate-900 text-white">February</option><option className="bg-slate-900 text-white">March</option>
            <option className="bg-slate-900 text-white">April</option><option className="bg-slate-900 text-white">May</option><option className="bg-slate-900 text-white">June</option>
            <option className="bg-slate-900 text-white">July</option><option className="bg-slate-900 text-white">August</option><option className="bg-slate-900 text-white">September</option>
            <option className="bg-slate-900 text-white">October</option><option className="bg-slate-900 text-white">November</option><option className="bg-slate-900 text-white">December</option>
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 bg-transparent border-red-700/40 text-white placeholder-slate-300 w-24 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Year"
          />

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-transparent border-red-700/40 text-white placeholder-slate-300 flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Search"
          />

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={classNames(
              "px-3 py-2 rounded-lg font-semibold text-white shadow-sm",
              showFilters ? "bg-fuchsia-700 hover:bg-fuchsia-800" : "bg-fuchsia-600 hover:bg-fuchsia-700"
            )}
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </button>

          {/* Header Edit/Delete (operate on selected row) */}
          <button
            onClick={openEditSelected}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            disabled={selectedRowId == null}
            title="Edit selected row"
          >
            Edit
          </button>
          <button
            onClick={deleteSelected}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            disabled={selectedRowId == null}
            title="Delete selected row"
          >
            Delete
          </button>

            {/* Add / Columns */}
          <button
            onClick={addRow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
          >
            Add Row
          </button>
          <button
            onClick={addColumn}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
          >
            Add Column
          </button>
          <button
            onClick={addOvertimeColumn}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
          >
            Add Overtime
          </button>

          {/* Save / Edit Toggle */}
          <button
            onClick={saveData}
            disabled={isSaving}
            className={classNames(
              "px-3 py-2 rounded-lg font-semibold shadow-sm",
              isSaving ? "bg-yellow-400 cursor-not-allowed text-black" : "bg-yellow-500 hover:bg-yellow-600 text-black"
            )}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-2 rounded-lg font-semibold text-white shadow-sm ${
              editMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {editMode ? "Disable Edit" : "Enable Edit"}
          </button>

          {/* Toggles */}
          <label className="flex items-center gap-2 text-white font-semibold">
            <input
              type="checkbox"
              checked={autoStatus}
              onChange={(e) => setAutoStatus(e.target.checked)}
            />
            Auto Status
          </label>
          <label className="flex items-center gap-2 text-white font-semibold">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Auto Save
          </label>

          {/* Export + Print + Add New (grouped for balanced header) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportCSV}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            >
              Export CSV
            </button>
            <button
              onClick={exportExcel}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            >
              Export Excel
            </button>
            <button
              onClick={printTable}
              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            >
              Print
            </button>
            {/* Add New placed right next to Print for premium header balance */}
            <button
              onClick={openCreateForm}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
            >
              Add New
            </button>
          </div>

          {/* Right-side meta */}
          <div className="ml-auto flex items-center gap-3 text-xs md:text-sm text-white font-semibold">
            <span className="hidden md:inline opacity-80">Period:</span>
            <span className="font-bold">{month} {year}</span>
            <span className={classNames("px-2 py-1 rounded-md", isSaving ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200")}>
              {isSaving ? "Syncing..." : lastSavedAt ? `Saved ${lastSavedAt}` : "Ready"}
            </span>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <label className="block text-slate-300 text-sm mb-1">Status</label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                  setFilters((f) => ({ ...f, status: opts }));
                }}
                className="w-full h-28 rounded-md bg-slate-900 border border-slate-700 text-white p-2"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <label className="block text-slate-300 text-sm mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                className="w-full rounded-md bg-slate-900 border border-slate-700 text-white p-2"
              >
                <option value="">All</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Min Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minHours}
                    onChange={(e) => setFilters((f) => ({ ...f, minHours: e.target.value }))}
                    className="w-full rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Max Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxHours}
                    onChange={(e) => setFilters((f) => ({ ...f, maxHours: e.target.value }))}
                    className="w-full rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <label className="block text-slate-300 text-sm mb-1">Clock In Window</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={filters.inFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, inFrom: e.target.value }))}
                  className="rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                />
                <input
                  type="time"
                  value={filters.inTo}
                  onChange={(e) => setFilters((f) => ({ ...f, inTo: e.target.value }))}
                  className="rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <label className="block text-slate-300 text-sm mb-1">Clock Out Window</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={filters.outFrom}
                  onChange={(e) => setFilters((f) => ({ ...f, outFrom: e.target.value }))}
                  className="rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                />
                <input
                  type="time"
                  value={filters.outTo}
                  onChange={(e) => setFilters((f) => ({ ...f, outTo: e.target.value }))}
                  className="rounded-md bg-slate-900 border border-slate-700 text-white p-2"
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  setFilters({
                    status: [],
                    department: "",
                    minHours: "",
                    maxHours: "",
                    inFrom: "",
                    inTo: "",
                    outFrom: "",
                    outTo: "",
                  })
                }
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Clear Filters
              </button>

              <div className="ml-auto flex items-center gap-3 text-slate-300 text-sm">
                <label className="flex items-center gap-2">
                  <span>OT Threshold</span>
                  <input
                    type="number"
                    step="0.25"
                    min={0}
                    value={overtimeThresholdHours}
                    onChange={(e) => setOvertimeThresholdHours(Number(e.target.value))}
                    className="w-20 rounded-md bg-slate-900 border border-slate-700 text-white p-1.5"
                    title="Daily overtime threshold in hours"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SMART SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Records</div>
          <div className="text-white text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Total Hours</div>
          <div className="text-white text-2xl font-bold">{summary.totalHours}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Avg Hours</div>
          <div className="text-white text-2xl font-bold">{summary.avgHours}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Overtime (hrs)</div>
          <div className="text-white text-2xl font-bold">{summary.totalOT}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Approved</div>
          <div className="text-emerald-300 text-2xl font-bold">{summary.counts["Approved"] || 0}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Pending</div>
          <div className="text-amber-300 text-2xl font-bold">{summary.counts["Pending"] || 0}</div>
        </div>
      </div>

      {/* TABLE (kept + selection + responsive) */}
      <div className="overflow-x-auto rounded-2xl shadow-2xl border border-yellow-500/30 bg-white mt-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-600">Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="border border-slate-300 p-3 text-xs font-bold uppercase bg-slate-100 sticky left-0 z-10">
                  Select
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border border-slate-300 p-3 text-slate-900 font-bold text-xs uppercase bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={classNames(
                    "hover:bg-slate-50",
                    selectedRowId === row.id ? "bg-amber-50" : ""
                  )}
                >
                  <td className="border p-2 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="row-select"
                        checked={selectedRowId === row.id}
                        onChange={() => setSelectedRowId(row.id)}
                        aria-label="Select row"
                      />
                      <button
                        onClick={() => openEditFormByIndex(rows.findIndex((r) => r.id === row.id))}
                        className="text-amber-700 hover:text-amber-900 text-xs underline"
                        title="Edit this row"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                  {columns.map((col) => {
                    const isTimeCol = col === "CLOCK IN TIME" || col === "CLOCK OUT TIME";
                    const isStatusCol = col === "STATUS";
                    const isHoursCol = col === "HOURS";
                    const isOTCol = col === "OVERTIME";
                    return (
                      <td key={col} className="border p-2">
                        {isStatusCol ? (
                          <select
                            disabled={!editMode}
                            value={(row.data[col] as string) || ""}
                            onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                            className={`w-full rounded border p-2 ${getStatusClass(
                              row.data[col] as string
                            )}`}
                          >
                            <option value="">Select Status</option>
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : isTimeCol ? (
                          <input
                            disabled={!editMode}
                            type="time"
                            value={(row.data[col] as string) || ""}
                            onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                            className="w-full p-2 outline-none"
                          />
                        ) : isHoursCol || isOTCol ? (
                          <input
                            disabled
                            type="text"
                            value={(row.data[col] as string) || ""}
                            className="w-full p-2 bg-slate-100 text-slate-700"
                          />
                        ) : (
                          <input
                            disabled={!editMode}
                            type="text"
                            value={(row.data[col] as string) || ""}
                            onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                            className="w-full p-2 outline-none"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECONDARY CONTROLS BELOW (Reset Search) */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={() => {
            setSearch("");
            setFilters({
              status: [],
              department: "",
              minHours: "",
              maxHours: "",
              inFrom: "",
              inTo: "",
              outFrom: "",
              outTo: "",
            });
          }}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Reset Filters
        </button>
        <div className="text-slate-300 text-sm">
          Showing {filteredRows.length} of {rows.length} records
        </div>
      </div>

      {/* ADVANCED FORM PAGE (FULL SCREEN / FULL WIDTH) */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex"
          role="dialog"
          aria-modal="true"
          aria-labelledby="formTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div ref={formRef} className="bg-white text-slate-800 w-full h-full overflow-auto flex flex-col">
            {/* Sticky Form Header (Premium Red Theme) */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 text-white px-4 py-3 flex flex-wrap items-center gap-3 shadow-md">
              <h3 id="formTitle" className="text-xl font-semibold mr-auto">
                {formMode === "edit" ? "Edit Entry" : "Add New Entry"}
              </h3>

              {/* Inline Search (kept pattern-safe) */}
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 rounded-md border border-red-700/50 bg-slate-800 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                aria-label="Search within form"
              />

              <button
                onClick={addRow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Add Row
              </button>

              <button
                onClick={addColumn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Add Column
              </button>

              <button
                onClick={saveData}
                disabled={isSaving}
                className={classNames(
                  "px-3 py-2 rounded-md font-semibold shadow-sm",
                  isSaving ? "bg-yellow-400 cursor-not-allowed text-black" : "bg-yellow-500 hover:bg-yellow-600 text-black"
                )}
              >
                {isSaving ? "Saving..." : "Save Data"}
              </button>

              <button
                onClick={() => setEditMode(!editMode)}
                className={classNames(
                  "px-3 py-2 rounded-md font-semibold text-white shadow-sm",
                  editMode ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                )}
              >
                {editMode ? "Disable Edit" : "Enable Edit"}
              </button>

              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={autoStatus}
                  onChange={(e) => setAutoStatus(e.target.checked)}
                />
                Auto Status
              </label>

              <button
                onClick={printTable}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Print
              </button>

              <button
                onClick={exportCSV}
                className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Export CSV
              </button>

              <button
                onClick={exportExcel}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Export Excel
              </button>

              <button
                onClick={closeForm}
                className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-md font-semibold shadow-sm"
              >
                Close
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Context info */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-100 border rounded-lg p-3">
                  <div className="text-sm text-slate-600">Company</div>
                  <div className="font-semibold truncate">{companyName || "—"}</div>
                </div>
                <div className="bg-slate-100 border rounded-lg p-3">
                  <div className="text-sm text-slate-600">Period</div>
                  <div className="font-semibold">{month} {year}</div>
                </div>
                <div className="bg-slate-100 border rounded-lg p-3">
                  <div className="text-sm text-slate-600">Auto Status</div>
                  <div className="font-semibold">{autoStatus ? "Enabled" : "Disabled"}</div>
                </div>
                <div className="bg-slate-100 border rounded-lg p-3">
                  <div className="text-sm text-slate-600">OT Threshold</div>
                  <div className="font-semibold">{overtimeThresholdHours} hrs</div>
                </div>
              </div>

              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-2">
                  {formError}
                </div>
              )}

              {/* Dynamic form generated from columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map((col) => {
                  const isTimeCol = col === "CLOCK IN TIME" || col === "CLOCK OUT TIME";
                  const isStatusCol = col === "STATUS";
                  const isHoursCol = col === "HOURS";
                  const isOTCol = col === "OVERTIME";
                  return (
                    <div key={col} className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">{col}</label>
                      {isStatusCol ? (
                        <select
                          value={formData[col] || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, [col]: e.target.value }))}
                          className="border rounded-md px-3 py-2"
                        >
                          <option value="">Select Status</option>
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : isTimeCol ? (
                        <input
                          type="time"
                          value={formData[col] || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFormData((p) => {
                              const next = { ...p, [col]: v };
                              if (columns.includes("HOURS")) {
                                next["HOURS"] = calculateHours(next["CLOCK IN TIME"], next["CLOCK OUT TIME"]);
                              }
                              if (columns.includes("OVERTIME")) {
                                next["OVERTIME"] = calculateOvertime(next["HOURS"]);
                              }
                              if (autoStatus && columns.includes("STATUS") && !next["STATUS"]) {
                                next["STATUS"] = classifyStatus(next["CLOCK IN TIME"], next["CLOCK OUT TIME"]);
                              }
                              return next;
                            });
                          }}
                          className="border rounded-md px-3 py-2"
                        />
                      ) : isHoursCol || isOTCol ? (
                        <input
                          type="text"
                          value={formData[col] || ""}
                          readOnly
                          className="border rounded-md px-3 py-2 bg-slate-100 text-slate-700"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData[col] || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, [col]: e.target.value }))}
                          className="border rounded-md px-3 py-2"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={submitForm}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  {formMode === "edit" ? "Update Entry" : "Save Entry"}
                </button>
                <button
                  onClick={closeForm}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT STYLE (kept) */}
      <style jsx global>{`
        @media print {
          button, input, select {
            display: none !important;
          }
          body {
            background: white !important;
          }
          table {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
