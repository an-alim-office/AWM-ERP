"use client";
import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Activity,
  AlertCircle,
  Bell,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  Filter,
  History,
  Loader2,
  Menu,
  Moon,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Sun,
  User,
  UserCircle2,
  Users,
  Wallet,
  Wifi,
  XCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  PanelsTopLeft,
  SlidersHorizontal,
  Download,
  Eye,
  CircleDot,
  Lock,
  FileText,
  Briefcase,
  Cpu,
  Database,
  MoreHorizontal,
  Globe2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
/* =========================================================
   TYPES
========================================================= */
type Role = "admin" | "hr" | "manager" | "employee" | "auditor";
type WorkflowStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Live";
type FieldType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "switch"
  | "date"
  | "datetime"
  | "number";
type SectionField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
};
type SectionConfig = {
  key: string;
  title: string;
  group: string;
  icon: React.ElementType;
  permissions: Role[];
  featureFlag?: string;
  workflow: {
    status: WorkflowStatus;
    approval: string;
  };
  fields: SectionField[];
};
type SectionState = {
  values: Record<string, unknown>;
  dirty: boolean;
  saving: boolean;
  expanded: boolean;
  loading: boolean;
  error?: string | null;
  updatedAt: string;
  history: Record<string, unknown>[];
};
type NotificationItem = {
  id: string;
  title: string;
  description: string;
  severity: "info" | "success" | "warning" | "error";
  createdAt: string;
};
type ActivityItem = {
  id: string;
  title: string;
  category: string;
  timestamp: string;
};
type ViewMode = "cards" | "table";
type DensityMode = "comfortable" | "compact";
type SortKey = "title" | "group" | "status" | "updatedAt";
type SortDirection = "asc" | "desc";
type EnterpriseStore = {
  role: Role;
  tenant: string;
  darkMode: boolean;
  hydrated: boolean;
  bootLoading: boolean;
  commandPalette: boolean;
  sidebarOpen: boolean;
  search: string;
  statusFilter: "all" | WorkflowStatus;
  groupFilter: "all" | string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  density: DensityMode;
  selectedSectionKey: string | null;
  notifications: NotificationItem[];
  activity: ActivityItem[];
  featureFlags: Record<string, boolean>;
  sections: Record<string, SectionState>;
  hydrate: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSearch: (v: string) => void;
  setStatusFilter: (v: "all" | WorkflowStatus) => void;
  setGroupFilter: (v: "all" | string) => void;
  setSortKey: (v: SortKey) => void;
  setSortDirection: (v: SortDirection) => void;
  setViewMode: (v: ViewMode) => void;
  setDensity: (v: DensityMode) => void;
  setSelectedSectionKey: (v: string | null) => void;
  toggleCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleSection: (k: string) => void;
  expandOnlySection: (k: string) => void;
  updateSection: (k: string, values: Record<string, unknown>) => void;
  saveSection: (k: string) => Promise<void>;
  undoSection: (k: string) => void;
};
/* =========================================================
   HELPERS
========================================================= */
const uid = () => Math.random().toString(36).slice(2);
const nowISO = () => new Date().toISOString();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
const formatRelativeTime = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
};
const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
const buildInitialValues = (fields: SectionField[]) => {
  const result: Record<string, unknown> = {};
  fields.forEach((f) => {
    switch (f.type) {
      case "checkbox":
      case "switch":
        result[f.key] = false;
        break;
      case "multiselect":
        result[f.key] = [];
        break;
      case "number":
        result[f.key] = 0;
        break;
      default:
        result[f.key] = "";
    }
  });
  return result;
};
const safeString = (value: unknown) =>
  typeof value === "string" ? value : String(value ?? "");
const safeNumber = (value: unknown) =>
  typeof value === "number" ? value : Number(value ?? 0);
const statusToneMap: Record<
  WorkflowStatus,
  {
    dot: string;
    badge: string;
  }
> = {
  Draft: {
    dot: "bg-zinc-400",
    badge:
      "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-400/10 dark:text-zinc-300 ring-zinc-500/20 dark:ring-zinc-400/20",
  },
  Pending: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
  },
  Approved: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
  },
  Rejected: {
    dot: "bg-rose-500",
    badge:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20",
  },
  Live: {
    dot: "bg-sky-500",
    badge:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20",
  },
};
const groupIconMap: Record<string, React.ElementType> = {
  Employee: User,
  Operations: Activity,
  Finance: Wallet,
  AI: Brain,
  Security: Shield,
};
const getSectionMatchScore = (
  section: SectionConfig,
  search: string,
  sectionState?: SectionState,
) => {
  const query = search.trim().toLowerCase();
  if (!query) return 1;
  const searchable = [
    section.title,
    section.group,
    section.workflow.status,
    section.workflow.approval,
    ...section.fields.map((field) => field.label),
    ...section.fields.map((field) => safeString(sectionState?.values?.[field.key])),
  ]
    .join(" ")
    .toLowerCase();
  return searchable.includes(query) ? 1 : 0;
};
/* =========================================================
   FEATURE FLAGS
========================================================= */
const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  aiCopilot: true,
  aiAnalytics: true,
  workflowEngine: true,
  attendanceEngine: true,
  payrollEngine: true,
  realtimePresence: true,
  auditLogs: true,
  offlineSync: true,
  documentAI: true,
  complianceCenter: true,
  governanceCenter: true,
  securityCenter: true,
};
/* =========================================================
   DATA
========================================================= */
const initialNotifications = (): NotificationItem[] => [
  {
    id: uid(),
    title: "Payroll Sync Completed",
    description: "Payroll successfully synced with finance engine.",
    severity: "success",
    createdAt: nowISO(),
  },
  {
    id: uid(),
    title: "Attendance Anomaly",
    description: "Late check-in detected for 14 employees.",
    severity: "warning",
    createdAt: nowISO(),
  },
  {
    id: uid(),
    title: "Security Risk",
    description: "Suspicious login detected from unknown device.",
    severity: "error",
    createdAt: nowISO(),
  },
  {
    id: uid(),
    title: "Directory Index Refreshed",
    description: "Employee search index rebuilt across global tenants.",
    severity: "info",
    createdAt: nowISO(),
  },
];
const initialActivity = (): ActivityItem[] => [
  {
    id: uid(),
    title: "Employee profile updated",
    category: "HR",
    timestamp: nowISO(),
  },
  {
    id: uid(),
    title: "Workflow approved",
    category: "Workflow",
    timestamp: nowISO(),
  },
  {
    id: uid(),
    title: "AI recommendation generated",
    category: "AI",
    timestamp: nowISO(),
  },
  {
    id: uid(),
    title: "Security policy adjusted",
    category: "Security",
    timestamp: nowISO(),
  },
];
const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "coreIdentity",
    title: "Core Identity",
    group: "Employee",
    icon: User,
    permissions: ["admin", "hr", "manager"],
    workflow: {
      status: "Live",
      approval: "Approved",
    },
    fields: [
      {
        key: "employeeId",
        label: "Employee ID",
        type: "text",
        required: true,
      },
      {
        key: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
      },
      {
        key: "department",
        label: "Department",
        type: "select",
        options: ["Engineering", "Finance", "Operations", "HR", "Sales"],
      },
    ],
  },
  {
    key: "contactInfo",
    title: "Contact Information",
    group: "Employee",
    icon: PhoneIcon,
    permissions: ["admin", "hr", "employee"],
    workflow: {
      status: "Approved",
      approval: "Verified",
    },
    fields: [
      {
        key: "phone",
        label: "Phone Number",
        type: "text",
      },
      {
        key: "address",
        label: "Address",
        type: "textarea",
      },
      {
        key: "emergencyContact",
        label: "Emergency Contact",
        type: "text",
      },
    ],
  },
  {
    key: "attendance",
    title: "Shift & Attendance",
    group: "Operations",
    icon: Clock3,
    permissions: ["admin", "manager", "hr"],
    workflow: {
      status: "Live",
      approval: "Auto",
    },
    fields: [
      {
        key: "shift",
        label: "Shift",
        type: "select",
        options: ["Morning", "Evening", "Night"],
      },
      {
        key: "remoteEligible",
        label: "Remote Eligible",
        type: "switch",
      },
      {
        key: "attendancePolicy",
        label: "Attendance Policy",
        type: "textarea",
      },
    ],
  },
  {
    key: "payroll",
    title: "Payroll",
    group: "Finance",
    icon: Wallet,
    permissions: ["admin", "hr"],
    workflow: {
      status: "Pending",
      approval: "Finance",
    },
    fields: [
      {
        key: "salary",
        label: "Salary",
        type: "number",
      },
      {
        key: "bankName",
        label: "Bank Name",
        type: "text",
      },
      {
        key: "accountNumber",
        label: "Account Number",
        type: "text",
      },
    ],
  },
  {
    key: "performance",
    title: "Performance & AI",
    group: "AI",
    icon: Brain,
    permissions: ["admin", "manager"],
    workflow: {
      status: "Live",
      approval: "AI Assisted",
    },
    fields: [
      {
        key: "kpi",
        label: "KPI Score",
        type: "number",
      },
      {
        key: "aiInsights",
        label: "AI Insights",
        type: "textarea",
      },
    ],
  },
  {
    key: "security",
    title: "Security Settings",
    group: "Security",
    icon: Shield,
    permissions: ["admin", "auditor"],
    workflow: {
      status: "Approved",
      approval: "Security",
    },
    fields: [
      {
        key: "mfaEnabled",
        label: "MFA Enabled",
        type: "switch",
      },
      {
        key: "deviceTrust",
        label: "Trusted Device",
        type: "switch",
      },
      {
        key: "riskScore",
        label: "Risk Score",
        type: "number",
      },
    ],
  },
];
/* =========================================================
   STORE
========================================================= */
const STORAGE_KEY = "enterprise-employee-center-v2026";
const buildSections = (): Record<string, SectionState> => {
  const result: Record<string, SectionState> = {};
  SECTION_CONFIGS.forEach((section, index) => {
    result[section.key] = {
      values: buildInitialValues(section.fields),
      dirty: false,
      saving: false,
      loading: true,
      expanded: index === 0,
      updatedAt: nowISO(),
      history: [],
      error: null,
    };
  });
  return result;
};
const useEnterpriseStore = create<EnterpriseStore>((set, get) => ({
  role: "admin",
  tenant: "enterprise-global",
  darkMode: false,
  hydrated: false,
  bootLoading: true,
  commandPalette: false,
  sidebarOpen: true,
  search: "",
  statusFilter: "all",
  groupFilter: "all",
  sortKey: "title",
  sortDirection: "asc",
  viewMode: "cards",
  density: "comfortable",
  selectedSectionKey: "coreIdentity",
  notifications: initialNotifications(),
  activity: initialActivity(),
  featureFlags: DEFAULT_FEATURE_FLAGS,
  sections: buildSections(),
  hydrate: () => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<EnterpriseStore>;
        set((state) => ({
          ...state,
          darkMode: parsed.darkMode ?? state.darkMode,
          sidebarOpen: parsed.sidebarOpen ?? state.sidebarOpen,
          search: parsed.search ?? state.search,
          statusFilter: parsed.statusFilter ?? state.statusFilter,
          groupFilter: parsed.groupFilter ?? state.groupFilter,
          sortKey: parsed.sortKey ?? state.sortKey,
          sortDirection: parsed.sortDirection ?? state.sortDirection,
          viewMode: parsed.viewMode ?? state.viewMode,
          density: parsed.density ?? state.density,
          selectedSectionKey:
            parsed.selectedSectionKey ?? state.selectedSectionKey,
          sections: parsed.sections
            ? Object.fromEntries(
                Object.entries(parsed.sections).map(([key, value]) => [
                  key,
                  {
                    ...(state.sections[key] ?? {
                      values: {},
                      dirty: false,
                      saving: false,
                      loading: false,
                      expanded: false,
                      updatedAt: nowISO(),
                      history: [],
                      error: null,
                    }),
                    ...value,
                    loading: false,
                    saving: false,
                  },
                ]),
              )
            : Object.fromEntries(
                Object.entries(state.sections).map(([key, value]) => [
                  key,
                  { ...value, loading: false, saving: false },
                ]),
              ),
          hydrated: true,
          bootLoading: false,
        }));
      } catch {
        set((state) => ({
          ...state,
          sections: Object.fromEntries(
            Object.entries(state.sections).map(([key, value]) => [
              key,
              { ...value, loading: false, saving: false },
            ]),
          ),
          hydrated: true,
          bootLoading: false,
        }));
      }
    } else {
      set((state) => ({
        ...state,
        sections: Object.fromEntries(
          Object.entries(state.sections).map(([key, value]) => [
            key,
            { ...value, loading: false, saving: false },
          ]),
        ),
        hydrated: true,
        bootLoading: false,
      }));
    }
    const mode = get().darkMode;
    root.classList.toggle("dark", mode);
  },
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return { darkMode: next };
    }),
  toggleSidebar: () =>
    set((s) => ({
      sidebarOpen: !s.sidebarOpen,
    })),
  setSearch: (v) =>
    set({
      search: v.slice(0, 120),
    }),
  setStatusFilter: (v) =>
    set({
      statusFilter: v,
    }),
  setGroupFilter: (v) =>
    set({
      groupFilter: v,
    }),
  setSortKey: (v) =>
    set({
      sortKey: v,
    }),
  setSortDirection: (v) =>
    set({
      sortDirection: v,
    }),
  setViewMode: (v) =>
    set({
      viewMode: v,
    }),
  setDensity: (v) =>
    set({
      density: v,
    }),
  setSelectedSectionKey: (v) =>
    set({
      selectedSectionKey: v,
    }),
  toggleCommandPalette: () =>
    set((s) => ({
      commandPalette: !s.commandPalette,
    })),
  closeCommandPalette: () =>
    set({
      commandPalette: false,
    }),
  toggleSection: (k) =>
    set((s) => ({
      selectedSectionKey: k,
      sections: {
        ...s.sections,
        [k]: {
          ...s.sections[k],
          expanded: !s.sections[k].expanded,
        },
      },
    })),
  expandOnlySection: (k) =>
    set((s) => ({
      selectedSectionKey: k,
      sections: Object.fromEntries(
        Object.entries(s.sections).map(([key, value]) => [
          key,
          { ...value, expanded: key === k ? true : value.expanded },
        ]),
      ),
    })),
  updateSection: (k, values) =>
    set((s) => ({
      sections: {
        ...s.sections,
        [k]: {
          ...s.sections[k],
          values,
          dirty: true,
          updatedAt: nowISO(),
          history: [...s.sections[k].history, s.sections[k].values].slice(-20),
        },
      },
    })),
  saveSection: async (k) => {
    set((s) => ({
      sections: {
        ...s.sections,
        [k]: {
          ...s.sections[k],
          saving: true,
          error: null,
        },
      },
    }));
    await sleep(900);
    set((s) => ({
      sections: {
        ...s.sections,
        [k]: {
          ...s.sections[k],
          dirty: false,
          saving: false,
          updatedAt: nowISO(),
        },
      },
      activity: [
        {
          id: uid(),
          title: `${SECTION_CONFIGS.find((x) => x.key === k)?.title ?? k} saved`,
          category: "Profile",
          timestamp: nowISO(),
        },
        ...s.activity,
      ].slice(0, 8),
    }));
  },
  undoSection: (k) => {
    const section = get().sections[k];
    const last = section.history.at(-1);
    if (!last) return;
    set((s) => ({
      sections: {
        ...s.sections,
        [k]: {
          ...s.sections[k],
          values: last,
          dirty: true,
          updatedAt: nowISO(),
          history: s.sections[k].history.slice(0, -1),
        },
      },
    }));
  },
}));
/* =========================================================
   ICON
========================================================= */
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.89.32 1.76.59 2.6a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.48-1.16a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.6.59A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
/* =========================================================
   UI PRIMITIVES
========================================================= */
const ShellCard = memo(function ShellCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-200/80 bg-white/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-[0_20px_60px_-28px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      {children}
    </div>
  );
});
const Skeleton = memo(function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700/80 dark:to-zinc-800",
        className,
      )}
    />
  );
});
const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: WorkflowStatus;
}) {
  const tone = statusToneMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        tone.badge,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
      {status}
    </span>
  );
});
/* =========================================================
   FIELD RENDERER
========================================================= */
const FieldRenderer = memo(function FieldRenderer({
  field,
  value,
  onChange,
  darkMode,
}: {
  field: SectionField;
  value: unknown;
  onChange: (v: unknown) => void;
  darkMode: boolean;
}) {
  const common = cn(
    "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:ring-4",
    darkMode
      ? "border-white/10 bg-white/[0.04] text-white focus:border-sky-500 focus:ring-sky-500/10"
      : "border-zinc-200 bg-white text-zinc-900 focus:border-sky-500 focus:ring-sky-500/10",
  );
  const labelHidden = field.type === "switch" || field.type === "checkbox";
  if (field.type === "textarea") {
    return (
      <textarea
        className={cn(common, "min-h-[110px] resize-y")}
        value={safeString(value)}
        placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        aria-label={labelHidden ? field.label : undefined}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        className={common}
        value={safeString(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        aria-label={labelHidden ? field.label : undefined}
      >
        <option value="">Select</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "switch" || field.type === "checkbox") {
    const checked = Boolean(value);
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={field.label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full border transition duration-300 focus:outline-none focus:ring-4",
          checked
            ? "border-sky-500/40 bg-sky-500/90 focus:ring-sky-500/20"
            : darkMode
              ? "border-white/10 bg-white/10 focus:ring-white/10"
              : "border-zinc-200 bg-zinc-200 focus:ring-zinc-300/50",
        )}
      >
        <span
          className={cn(
            "ml-1 block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    );
  }
  if (field.type === "number") {
    return (
      <input
        inputMode="decimal"
        type="number"
        className={common}
        value={safeNumber(value)}
        placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={field.disabled}
        aria-label={labelHidden ? field.label : undefined}
      />
    );
  }
  return (
    <input
      type={field.type}
      className={common}
      value={safeString(value)}
      placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
      onChange={(e) => onChange(e.target.value)}
      disabled={field.disabled}
      aria-label={labelHidden ? field.label : undefined}
      autoComplete="off"
      spellCheck={false}
    />
  );
});
/* =========================================================
   SECTION CARD
========================================================= */
const SectionCard = memo(function SectionCard({
  section,
  density,
  darkMode,
}: {
  section: SectionConfig;
  density: DensityMode;
  darkMode: boolean;
}) {
  const {
    sections,
    toggleSection,
    updateSection,
    saveSection,
    undoSection,
    selectedSectionKey,
    setSelectedSectionKey,
  } = useEnterpriseStore();
  const state = sections[section.key];
  const values = state.values;
  const isCompact = density === "compact";
  const isActive = selectedSectionKey === section.key;
  return (
    <motion.section
      layout
      initial={false}
      className={cn(
        "overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300",
        isActive
          ? "border-sky-500/30 shadow-[0_16px_60px_-30px_rgba(14,165,233,0.45)]"
          : "border-zinc-200/80 dark:border-white/10",
        darkMode
          ? "bg-zinc-950/60"
          : "bg-white/90 shadow-[0_14px_45px_-28px_rgba(0,0,0,0.22)]",
      )}
    >
      <button
        type="button"
        onClick={() => {
          setSelectedSectionKey(section.key);
          toggleSection(section.key);
        }}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
        aria-expanded={state.expanded}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "rounded-2xl p-3",
              darkMode
                ? "bg-sky-500/10 text-sky-300"
                : "bg-sky-100 text-sky-700",
            )}
          >
            <section.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "truncate text-base font-semibold",
                  darkMode ? "text-white" : "text-zinc-950",
                )}
              >
                {section.title}
              </h3>
              <StatusBadge status={section.workflow.status} />
            </div>
            <div
              className={cn(
                "mt-1 flex flex-wrap items-center gap-2 text-xs",
                darkMode ? "text-zinc-400" : "text-zinc-500",
              )}
            >
              <span>{section.group}</span>
              <span className="opacity-50">•</span>
              <span>{section.workflow.approval}</span>
              <span className="opacity-50">•</span>
              <span>{section.permissions.length} roles</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {state.dirty && (
            <span
              className={cn(
                "hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex",
                darkMode
                  ? "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
              )}
            >
              Unsaved
            </span>
          )}
          {state.saving && (
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
          )}
          {state.expanded ? (
            <ChevronDown
              className={cn(
                "h-5 w-5",
                darkMode ? "text-zinc-400" : "text-zinc-500",
              )}
            />
          ) : (
            <ChevronRight
              className={cn(
                "h-5 w-5",
                darkMode ? "text-zinc-400" : "text-zinc-500",
              )}
            />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {state.expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "border-t",
              darkMode ? "border-white/10" : "border-zinc-200",
            )}
          >
            {state.loading ? (
              <div
                className={cn(
                  "grid gap-4 p-4 sm:p-6",
                  isCompact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {Array.from({ length: Math.max(4, section.fields.length) }).map(
                  (_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ),
                )}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-4 p-4 sm:p-6",
                    isCompact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
                  )}
                >
                  {section.fields
                    .filter((field) => field.visible !== false)
                    .map((field) => (
                      <div
                        key={field.key}
                        className={cn(
                          "space-y-2",
                          field.type === "textarea" && !isCompact
                            ? "xl:col-span-3"
                            : "",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label
                            htmlFor={`${section.key}-${field.key}`}
                            className={cn(
                              "text-sm font-medium",
                              darkMode ? "text-zinc-200" : "text-zinc-700",
                            )}
                          >
                            {field.label}
                          </label>
                          {field.required && (
                            <span
                              className={cn(
                                "text-[11px]",
                                darkMode ? "text-rose-300" : "text-rose-600",
                              )}
                            >
                              Required
                            </span>
                          )}
                        </div>
                        <FieldRenderer
                          field={field}
                          value={values[field.key]}
                          darkMode={darkMode}
                          onChange={(nextValue) =>
                            updateSection(section.key, {
                              ...values,
                              [field.key]: nextValue,
                            })
                          }
                        />
                      </div>
                    ))}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                    darkMode ? "border-white/10" : "border-zinc-200",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1",
                        darkMode
                          ? "bg-white/5 text-zinc-400 ring-1 ring-white/10"
                          : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
                      )}
                    >
                      Updated {formatRelativeTime(state.updatedAt)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1",
                        darkMode
                          ? "bg-white/5 text-zinc-400 ring-1 ring-white/10"
                          : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
                      )}
                    >
                      {section.fields.length} fields
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => undoSection(section.key)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
                        darkMode
                          ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <History className="h-4 w-4" />
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => saveSection(section.key)}
                      disabled={state.saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {state.saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
});
/* =========================================================
   TABLE VIEW
========================================================= */
const SectionTable = memo(function SectionTable({
  items,
  darkMode,
}: {
  items: SectionConfig[];
  darkMode: boolean;
}) {
  const { sections, expandOnlySection, selectedSectionKey } = useEnterpriseStore();
  return (
    <ShellCard className="overflow-hidden">
      <div
        className={cn(
          "overflow-x-auto",
          darkMode ? "bg-zinc-950/50" : "bg-white/90",
        )}
      >
        <table className="min-w-full text-sm">
          <thead
            className={cn(
              darkMode
                ? "bg-white/[0.03] text-zinc-400"
                : "bg-zinc-50 text-zinc-600",
            )}
          >
            <tr>
              <th className="px-4 py-3 text-left font-medium">Section</th>
              <th className="px-4 py-3 text-left font-medium">Group</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Updated</th>
              <th className="px-4 py-3 text-left font-medium">Fields</th>
              <th className="px-4 py-3 text-left font-medium">State</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((section) => {
              const state = sections[section.key];
              const isActive = selectedSectionKey === section.key;
              return (
                <tr
                  key={section.key}
                  className={cn(
                    "border-t transition",
                    darkMode
                      ? "border-white/10 hover:bg-white/[0.03]"
                      : "border-zinc-200 hover:bg-zinc-50/80",
                    isActive &&
                      (darkMode ? "bg-sky-500/5" : "bg-sky-50/60"),
                  )}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-2xl p-2.5",
                          darkMode
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-sky-100 text-sky-700",
                        )}
                      >
                        <section.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "font-semibold",
                            darkMode ? "text-white" : "text-zinc-900",
                          )}
                        >
                          {section.title}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            darkMode ? "text-zinc-500" : "text-zinc-500",
                          )}
                        >
                          Approval: {section.workflow.approval}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={cn(darkMode ? "text-zinc-300" : "text-zinc-700", "px-4 py-4")}>
                    {section.group}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={section.workflow.status} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4",
                      darkMode ? "text-zinc-400" : "text-zinc-600",
                    )}
                  >
                    {formatRelativeTime(state.updatedAt)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4",
                      darkMode ? "text-zinc-300" : "text-zinc-700",
                    )}
                  >
                    {section.fields.length}
                  </td>
                  <td className="px-4 py-4">
                    {state.dirty ? (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          darkMode
                            ? "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                        )}
                      >
                        Unsaved
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          darkMode
                            ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                        )}
                      >
                        Synced
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => expandOnlySection(section.key)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition",
                        darkMode
                          ? "bg-white/5 text-zinc-200 hover:bg-white/10"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80",
                      )}
                    >
                      <Eye className="h-4 w-4" />
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ShellCard>
  );
});
/* =========================================================
   COMMAND PALETTE
========================================================= */
const CommandPalette = memo(function CommandPalette({
  open,
  items,
  onClose,
  darkMode,
}: {
  open: boolean;
  items: SectionConfig[];
  onClose: () => void;
  darkMode: boolean;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { expandOnlySection, setSelectedSectionKey } = useEnterpriseStore();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const searchable = [
        item.title,
        item.group,
        item.workflow.status,
        ...item.fields.map((field) => field.label),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [items, query]);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 px-4 pt-16 backdrop-blur-md sm:pt-24"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "w-full max-w-3xl overflow-hidden rounded-[28px] border shadow-2xl",
              darkMode
                ? "border-white/10 bg-zinc-950/95"
                : "border-zinc-200 bg-white/95",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "border-b p-4",
                darkMode ? "border-white/10" : "border-zinc-200",
              )}
            >
              <div className="flex items-center gap-3">
                <Search
                  className={cn(
                    "h-5 w-5",
                    darkMode ? "text-zinc-500" : "text-zinc-400",
                  )}
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sections, fields, workflows..."
                  className={cn(
                    "w-full bg-transparent text-sm outline-none",
                    darkMode
                      ? "text-white placeholder:text-zinc-500"
                      : "text-zinc-900 placeholder:text-zinc-400",
                  )}
                />
                <kbd
                  className={cn(
                    "rounded-xl border px-2 py-1 text-[11px]",
                    darkMode
                      ? "border-white/10 bg-white/5 text-zinc-400"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500",
                  )}
                >
                  ESC
                </kbd>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {filtered.length === 0 ? (
                <div
                  className={cn(
                    "rounded-2xl p-8 text-center text-sm",
                    darkMode ? "text-zinc-400" : "text-zinc-500",
                  )}
                >
                  No matching section found.
                </div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedSectionKey(item.key);
                      expandOnlySection(item.key);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition",
                      darkMode ? "hover:bg-white/5" : "hover:bg-zinc-50",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "rounded-2xl p-2.5",
                          darkMode
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-sky-100 text-sky-700",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "truncate font-medium",
                            darkMode ? "text-white" : "text-zinc-900",
                          )}
                        >
                          {item.title}
                        </div>
                        <div
                          className={cn(
                            "text-xs",
                            darkMode ? "text-zinc-500" : "text-zinc-500",
                          )}
                        >
                          {item.group} • {item.workflow.status}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4",
                        darkMode ? "text-zinc-500" : "text-zinc-400",
                      )}
                    />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
/* =========================================================
   MAIN PAGE
========================================================= */
export default function EmployeesPage() {
  const {
    darkMode,
    hydrated,
    bootLoading,
    hydrate,
    toggleDarkMode,
    sidebarOpen,
    toggleSidebar,
    search,
    setSearch,
    notifications,
    activity,
    commandPalette,
    toggleCommandPalette,
    closeCommandPalette,
    statusFilter,
    groupFilter,
    sortKey,
    sortDirection,
    setStatusFilter,
    setGroupFilter,
    setSortKey,
    setSortDirection,
    viewMode,
    setViewMode,
    density,
    setDensity,
    role,
    tenant,
    sections,
    selectedSectionKey,
  } = useEnterpriseStore();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const snapshot = {
      darkMode,
      sidebarOpen,
      search,
      statusFilter,
      groupFilter,
      sortKey,
      sortDirection,
      viewMode,
      density,
      selectedSectionKey,
      sections,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    hydrated,
    darkMode,
    sidebarOpen,
    search,
    statusFilter,
    groupFilter,
    sortKey,
    sortDirection,
    viewMode,
    density,
    selectedSectionKey,
    sections,
  ]);
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [toggleCommandPalette]);
  const allGroups = useMemo(
    () => Array.from(new Set(SECTION_CONFIGS.map((section) => section.group))),
    [],
  );
  const filteredSections = useMemo(() => {
    const result = SECTION_CONFIGS.filter((section) => {
      const state = sections[section.key];
      const matchesSearch =
        getSectionMatchScore(section, search, state) > 0;
      const matchesStatus =
        statusFilter === "all" || section.workflow.status === statusFilter;
      const matchesGroup =
        groupFilter === "all" || section.group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
    result.sort((a, b) => {
      const aState = sections[a.key];
      const bState = sections[b.key];
      const aValue =
        sortKey === "updatedAt"
          ? new Date(aState.updatedAt).getTime()
          : sortKey === "status"
            ? a.workflow.status
            : sortKey === "group"
              ? a.group
              : a.title;
      const bValue =
        sortKey === "updatedAt"
          ? new Date(bState.updatedAt).getTime()
          : sortKey === "status"
            ? b.workflow.status
            : sortKey === "group"
              ? b.group
              : b.title;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return result;
  }, [groupFilter, search, sections, sortDirection, sortKey, statusFilter]);
  const metrics = useMemo(() => {
    const total = SECTION_CONFIGS.length;
    const dirtyCount = Object.values(sections).filter((section) => section.dirty)
      .length;
    const liveCount = SECTION_CONFIGS.filter(
      (section) => section.workflow.status === "Live",
    ).length;
    const healthyRate = Math.round(((total - dirtyCount) / total) * 100);
    const riskAverage = Math.round(
      SECTION_CONFIGS.reduce((acc, section) => {
        const state = sections[section.key];
        const numericField = section.fields.find((field) => field.type === "number");
        if (!numericField) return acc + 72;
        const raw = state?.values?.[numericField.key];
        const num = Number(raw);
        return acc + (Number.isFinite(num) ? num : 72);
      }, 0) / total,
    );
    return {
      total,
      dirtyCount,
      liveCount,
      healthyRate,
      riskAverage,
    };
  }, [sections]);
  const selectedSection = useMemo(
    () => SECTION_CONFIGS.find((section) => section.key === selectedSectionKey) ?? null,
    [selectedSectionKey],
  );
  const sidebarItems = useMemo(
    () => filteredSections.slice(0, 12),
    [filteredSections],
  );
  const handleQuickOpen = useCallback(() => {
    toggleCommandPalette();
  }, [toggleCommandPalette]);
  const mainSurface = darkMode
    ? "bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),radial-gradient(circle_at_right,rgba(99,102,241,0.12),transparent_26%),#020617] text-white"
    : "bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle_at_right,rgba(99,102,241,0.08),transparent_24%),#f5f7fb] text-zinc-900";
  return (
    <div className={cn("min-h-screen transition-colors duration-300", mainSurface)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 z-40 hidden h-screen shrink-0 border-r backdrop-blur-xl transition-all duration-300 lg:block",
            sidebarOpen ? "w-[290px]" : "w-[88px]",
            darkMode
              ? "border-white/10 bg-zinc-950/80"
              : "border-zinc-200/80 bg-white/80",
          )}
        >
          <div
            className={cn(
              "flex h-20 items-center justify-between border-b px-4",
              darkMode ? "border-white/10" : "border-zinc-200",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-2.5 text-white shadow-lg shadow-sky-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <div
                    className={cn(
                      "truncate text-sm font-semibold",
                      darkMode ? "text-white" : "text-zinc-900",
                    )}
                  >
                    Enterprise ERP
                  </div>
                  <div
                    className={cn(
                      "truncate text-xs",
                      darkMode ? "text-zinc-500" : "text-zinc-500",
                    )}
                  >
                    Employee Center
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "rounded-2xl p-2.5 transition",
                darkMode ? "hover:bg-white/5" : "hover:bg-zinc-100",
              )}
              aria-label="Toggle sidebar"
            >
              <Menu
                className={cn(
                  "h-5 w-5",
                  darkMode ? "text-zinc-400" : "text-zinc-600",
                )}
              />
            </button>
          </div>
          <div className="space-y-6 p-4">
            <ShellCard
              className={cn(
                "overflow-hidden",
                darkMode ? "bg-white/[0.03]" : "bg-zinc-50/90",
              )}
            >
              <div className="p-3">
                <div
                  className={cn(
                    "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
                    darkMode ? "text-zinc-500" : "text-zinc-500",
                  )}
                >
                  Workspace
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Dashboard", icon: PanelsTopLeft, active: true },
                    { label: "Employee Profiles", icon: Users, active: true },
                    { label: "Workflow Engine", icon: Briefcase, active: false },
                    { label: "Documents", icon: FileText, active: false },
                    { label: "Security", icon: Lock, active: false },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                        item.active
                          ? darkMode
                            ? "bg-sky-500/10 text-sky-300"
                            : "bg-sky-50 text-sky-700"
                          : darkMode
                            ? "text-zinc-300 hover:bg-white/5"
                            : "text-zinc-700 hover:bg-white",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {sidebarOpen && (
                        <span className="truncate text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </ShellCard>
            <div>
              {sidebarOpen && (
                <div
                  className={cn(
                    "mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em]",
                    darkMode ? "text-zinc-500" : "text-zinc-500",
                  )}
                >
                  Sections
                </div>
              )}
              <div className="space-y-2">
                {sidebarItems.map((section) => {
                  const state = sections[section.key];
                  const active = selectedSectionKey === section.key;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => {
                        useEnterpriseStore.getState().setSelectedSectionKey(section.key);
                        useEnterpriseStore.getState().expandOnlySection(section.key);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                        active
                          ? darkMode
                            ? "bg-white/10 text-white"
                            : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                          : darkMode
                            ? "text-zinc-300 hover:bg-white/5"
                            : "text-zinc-700 hover:bg-white/80",
                      )}
                    >
                      <section.icon className="h-4 w-4 shrink-0 text-sky-500" />
                      {sidebarOpen && (
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {section.title}
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 flex items-center gap-2 text-[11px]",
                              darkMode ? "text-zinc-500" : "text-zinc-500",
                            )}
                          >
                            <span>{section.group}</span>
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                statusToneMap[section.workflow.status].dot,
                              )}
                            />
                            <span>{state.dirty ? "Unsaved" : "Synced"}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {sidebarOpen && (
              <ShellCard className="overflow-hidden">
                <div className="bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/10 p-2.5 dark:bg-white/10">
                      <Sparkles className="h-5 w-5 text-sky-500" />
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-semibold",
                          darkMode ? "text-white" : "text-zinc-900",
                        )}
                      >
                        AI Copilot Active
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-xs leading-5",
                          darkMode ? "text-zinc-400" : "text-zinc-600",
                        )}
                      >
                        Smart profile recommendations, anomaly tracking, and workflow hints are enabled.
                      </div>
                    </div>
                  </div>
                </div>
              </ShellCard>
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header
            className={cn(
              "sticky top-0 z-30 border-b backdrop-blur-xl",
              darkMode
                ? "border-white/10 bg-zinc-950/70"
                : "border-zinc-200/80 bg-white/75",
            )}
          >
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                      "rounded-2xl p-3 lg:hidden",
                      darkMode ? "bg-white/5" : "bg-white",
                    )}
                    aria-label="Toggle sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                        darkMode
                          ? "bg-white/5 text-zinc-400 ring-white/10"
                          : "bg-white text-zinc-600 ring-zinc-200",
                      )}
                    >
                      <Globe2 className="h-3.5 w-3.5" />
                      {tenant}
                    </div>
                    <h1
                      className={cn(
                        "mt-3 text-2xl font-semibold tracking-tight sm:text-3xl",
                        darkMode ? "text-white" : "text-zinc-950",
                      )}
                    >
                      Employee master workspace
                    </h1>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        darkMode ? "text-zinc-400" : "text-zinc-600",
                      )}
                    >
                      Centralized employee operations, workflow governance, AI insights, and enterprise profile management.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickOpen}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      darkMode
                        ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    <Command className="h-4 w-4" />
                    Command
                    <span
                      className={cn(
                        "rounded-lg px-2 py-1 text-[11px]",
                        darkMode
                          ? "bg-white/5 text-zinc-500"
                          : "bg-zinc-100 text-zinc-500",
                      )}
                    >
                      Ctrl K
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className={cn(
                      "rounded-2xl border p-3 transition",
                      darkMode
                        ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                    aria-label="Toggle theme"
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "relative rounded-2xl border p-3 transition",
                      darkMode
                        ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-950" />
                  </button>
                  <ShellCard className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 p-2 text-sky-500">
                        <UserCircle2 className="h-8 w-8" />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            darkMode ? "text-white" : "text-zinc-900",
                          )}
                        >
                          Enterprise Admin
                        </div>
                        <div
                          className={cn(
                            "text-xs capitalize",
                            darkMode ? "text-zinc-500" : "text-zinc-500",
                          )}
                        >
                          {role} • Global tenant
                        </div>
                      </div>
                    </div>
                  </ShellCard>
                </div>
              </div>
              <ShellCard className="p-3 sm:p-4">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,1fr))]">
                  <div className="relative">
                    <Search
                      className={cn(
                        "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2",
                        darkMode ? "text-zinc-500" : "text-zinc-400",
                      )}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search sections, fields, status..."
                      className={cn(
                        "w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-4",
                        darkMode
                          ? "border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/10"
                          : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:ring-sky-500/10",
                      )}
                    />
                  </div>
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4",
                      darkMode
                        ? "border-white/10 bg-white/[0.04] text-white focus:border-sky-500 focus:ring-sky-500/10"
                        : "border-zinc-200 bg-white text-zinc-900 focus:border-sky-500 focus:ring-sky-500/10",
                    )}
                    aria-label="Filter by group"
                  >
                    <option value="all">All groups</option>
                    {allGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as "all" | WorkflowStatus)
                    }
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4",
                      darkMode
                        ? "border-white/10 bg-white/[0.04] text-white focus:border-sky-500 focus:ring-sky-500/10"
                        : "border-zinc-200 bg-white text-zinc-900 focus:border-sky-500 focus:ring-sky-500/10",
                    )}
                    aria-label="Filter by workflow status"
                  >
                    <option value="all">All status</option>
                    {["Draft", "Pending", "Approved", "Rejected", "Live"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4",
                      darkMode
                        ? "border-white/10 bg-white/[0.04] text-white focus:border-sky-500 focus:ring-sky-500/10"
                        : "border-zinc-200 bg-white text-zinc-900 focus:border-sky-500 focus:ring-sky-500/10",
                    )}
                    aria-label="Sort by"
                  >
                    <option value="title">Sort: Title</option>
                    <option value="group">Sort: Group</option>
                    <option value="status">Sort: Status</option>
                    <option value="updatedAt">Sort: Updated</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      darkMode
                        ? "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                    )}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                  </button>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-2xl border p-1",
                      darkMode
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-zinc-200 bg-zinc-50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
                        viewMode === "cards"
                          ? darkMode
                            ? "bg-white/10 text-white"
                            : "bg-white text-zinc-900 shadow-sm"
                          : darkMode
                            ? "text-zinc-400"
                            : "text-zinc-500",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Cards
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
                        viewMode === "table"
                          ? darkMode
                            ? "bg-white/10 text-white"
                            : "bg-white text-zinc-900 shadow-sm"
                          : darkMode
                            ? "text-zinc-400"
                            : "text-zinc-500",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <PanelsTopLeft className="h-4 w-4" />
                        Table
                      </span>
                    </button>
                  </div>
                </div>
              </ShellCard>
            </div>
          </header>
          <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {[
                {
                  title: "Employee Records",
                  value: formatNumber(104228),
                  delta: "+8.2%",
                  positive: true,
                  icon: Users,
                  hint: "Across active global workforce",
                },
                {
                  title: "Realtime Presence",
                  value: "98.2%",
                  delta: "+1.4%",
                  positive: true,
                  icon: Wifi,
                  hint: "Sync health across attendance engine",
                },
                {
                  title: "Risk Intelligence",
                  value: `${metrics.riskAverage}`,
                  delta: "-6.8%",
                  positive: true,
                  icon: Shield,
                  hint: "Lower is better",
                },
                {
                  title: "Profile Stability",
                  value: `${metrics.healthyRate}%`,
                  delta: metrics.dirtyCount > 0 ? `${metrics.dirtyCount} unsaved` : "All synced",
                  positive: metrics.dirtyCount === 0,
                  icon: RefreshCcw,
                  hint: "Current data integrity index",
                },
              ].map((item) => (
                <ShellCard key={item.title} className="overflow-hidden p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          darkMode ? "text-zinc-400" : "text-zinc-500",
                        )}
                      >
                        {item.title}
                      </div>
                      {bootLoading ? (
                        <Skeleton className="mt-3 h-9 w-32" />
                      ) : (
                        <div
                          className={cn(
                            "mt-3 text-3xl font-semibold tracking-tight",
                            darkMode ? "text-white" : "text-zinc-950",
                          )}
                        >
                          {item.value}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                            item.positive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-300",
                          )}
                        >
                          {item.positive ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {item.delta}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            darkMode ? "text-zinc-500" : "text-zinc-500",
                          )}
                        >
                          {item.hint}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl p-3",
                        darkMode
                          ? "bg-sky-500/10 text-sky-300"
                          : "bg-sky-100 text-sky-700",
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                    </div>
                  </div>
                </ShellCard>
              ))}
            </div>
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_400px]">
              <div className="space-y-6">
                <ShellCard className="overflow-hidden">
                  <div className="grid gap-5 p-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div
                            className={cn(
                              "text-base font-semibold",
                              darkMode ? "text-white" : "text-zinc-950",
                            )}
                          >
                            Employee operations intelligence
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-sm",
                              darkMode ? "text-zinc-400" : "text-zinc-600",
                            )}
                          >
                            Smart orchestration layer for profile integrity, access controls, approvals, and operational readiness.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDensity(
                                density === "comfortable"
                                  ? "compact"
                                  : "comfortable",
                              )
                            }
                            className={cn(
                              "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
                              darkMode
                                ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                            )}
                          >
                            <Filter className="h-4 w-4" />
                            {density === "comfortable"
                              ? "Comfortable"
                              : "Compact"}
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
                              darkMode
                                ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                            )}
                          >
                            <Download className="h-4 w-4" />
                            Export
                          </button>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            label: "Live workflows",
                            value: metrics.liveCount,
                            icon: Zap,
                          },
                          {
                            label: "Unsaved changes",
                            value: metrics.dirtyCount,
                            icon: AlertCircle,
                          },
                          {
                            label: "Visible modules",
                            value: filteredSections.length,
                            icon: LayoutGrid,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className={cn(
                              "rounded-2xl border p-4",
                              darkMode
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-zinc-50/80",
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div
                                  className={cn(
                                    "text-xs font-medium uppercase tracking-[0.18em]",
                                    darkMode ? "text-zinc-500" : "text-zinc-500",
                                  )}
                                >
                                  {stat.label}
                                </div>
                                <div
                                  className={cn(
                                    "mt-3 text-2xl font-semibold",
                                    darkMode ? "text-white" : "text-zinc-950",
                                  )}
                                >
                                  {stat.value}
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "rounded-2xl p-3",
                                  darkMode
                                    ? "bg-sky-500/10 text-sky-300"
                                    : "bg-sky-100 text-sky-700",
                                )}
                              >
                                <stat.icon className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-3xl border p-5",
                        darkMode
                          ? "border-white/10 bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-transparent"
                          : "border-zinc-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-white",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-3 text-white shadow-lg shadow-sky-500/20">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-semibold",
                              darkMode ? "text-white" : "text-zinc-950",
                            )}
                          >
                            Enterprise AI Copilot
                          </div>
                          <div
                            className={cn(
                              "text-sm",
                              darkMode ? "text-zinc-400" : "text-zinc-600",
                            )}
                          >
                            Adaptive workforce intelligence
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-5 rounded-2xl border p-4",
                          darkMode
                            ? "border-white/10 bg-black/20"
                            : "border-white bg-white/80",
                        )}
                      >
                        <div
                          className={cn(
                            "text-xs font-semibold uppercase tracking-[0.18em]",
                            darkMode ? "text-zinc-500" : "text-zinc-500",
                          )}
                        >
                          Recommendation
                        </div>
                        <div
                          className={cn(
                            "mt-3 text-sm leading-6",
                            darkMode ? "text-zinc-200" : "text-zinc-700",
                          )}
                        >
                          Attendance anomalies increased 12% in monitored cohorts. Prioritize policy review for shift-based teams and validate remote eligibility against recent schedule deviations.
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {[
                          { label: "Model confidence", value: 94 },
                          { label: "Data freshness", value: 91 },
                          { label: "Compliance readiness", value: 97 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between text-xs">
                              <span
                                className={cn(
                                  darkMode ? "text-zinc-400" : "text-zinc-600",
                                )}
                              >
                                {item.label}
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  darkMode ? "text-zinc-200" : "text-zinc-700",
                                )}
                              >
                                {item.value}%
                              </span>
                            </div>
                            <div
                              className={cn(
                                "h-2 overflow-hidden rounded-full",
                                darkMode ? "bg-white/10" : "bg-zinc-200",
                              )}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ShellCard>
                {viewMode === "table" ? (
                  <SectionTable items={filteredSections} darkMode={darkMode} />
                ) : (
                  <div className="space-y-4">
                    {filteredSections.length === 0 ? (
                      <ShellCard className="p-10 text-center">
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div
                            className={cn(
                              "rounded-3xl p-4",
                              darkMode
                                ? "bg-white/5 text-zinc-400"
                                : "bg-zinc-100 text-zinc-500",
                            )}
                          >
                            <Search className="h-8 w-8" />
                          </div>
                          <div
                            className={cn(
                              "mt-4 text-lg font-semibold",
                              darkMode ? "text-white" : "text-zinc-950",
                            )}
                          >
                            No sections matched
                          </div>
                          <div
                            className={cn(
                              "mt-2 text-sm",
                              darkMode ? "text-zinc-400" : "text-zinc-600",
                            )}
                          >
                            Refine your search, status filter, or group selection.
                          </div>
                        </div>
                      </ShellCard>
                    ) : (
                      filteredSections.map((section) => (
                        <SectionCard
                          key={section.key}
                          section={section}
                          density={density}
                          darkMode={darkMode}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <ShellCard className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={cn(
                          "text-base font-semibold",
                          darkMode ? "text-white" : "text-zinc-950",
                        )}
                      >
                        Active section spotlight
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          darkMode ? "text-zinc-400" : "text-zinc-600",
                        )}
                      >
                        Current operational focus and context.
                      </div>
                    </div>
                    <button
                      type="button"
                      className={cn(
                        "rounded-2xl p-2.5 transition",
                        darkMode ? "hover:bg-white/5" : "hover:bg-zinc-100",
                      )}
                    >
                      <MoreHorizontal
                        className={cn(
                          "h-4 w-4",
                          darkMode ? "text-zinc-500" : "text-zinc-500",
                        )}
                      />
                    </button>
                  </div>
                  {selectedSection ? (
                    <div className="mt-5 space-y-4">
                      <div
                        className={cn(
                          "rounded-3xl border p-4",
                          darkMode
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-zinc-200 bg-zinc-50/70",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "rounded-2xl p-3",
                              darkMode
                                ? "bg-sky-500/10 text-sky-300"
                                : "bg-sky-100 text-sky-700",
                            )}
                          >
                            <selectedSection.icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div
                              className={cn(
                                "font-semibold",
                                darkMode ? "text-white" : "text-zinc-950",
                              )}
                            >
                              {selectedSection.title}
                            </div>
                            <div
                              className={cn(
                                "mt-1 text-sm",
                                darkMode ? "text-zinc-400" : "text-zinc-600",
                              )}
                            >
                              {selectedSection.group} workflow governed by{" "}
                              {selectedSection.workflow.approval}.
                            </div>
                            <div className="mt-3">
                              <StatusBadge status={selectedSection.workflow.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Fields",
                            value: selectedSection.fields.length,
                            icon: Database,
                          },
                          {
                            label: "Roles",
                            value: selectedSection.permissions.length,
                            icon: Shield,
                          },
                          {
                            label: "Updated",
                            value: formatRelativeTime(
                              sections[selectedSection.key].updatedAt,
                            ),
                            icon: Calendar,
                          },
                          {
                            label: "State",
                            value: sections[selectedSection.key].dirty
                              ? "Unsaved"
                              : "Synced",
                            icon: CircleDot,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={cn(
                              "rounded-2xl border p-4",
                              darkMode
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-zinc-50/70",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <item.icon
                                className={cn(
                                  "h-4 w-4",
                                  darkMode ? "text-zinc-500" : "text-zinc-500",
                                )}
                              />
                              <div
                                className={cn(
                                  "text-xs",
                                  darkMode ? "text-zinc-500" : "text-zinc-500",
                                )}
                              >
                                {item.label}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "mt-4 text-lg font-semibold",
                                darkMode ? "text-white" : "text-zinc-950",
                              )}
                            >
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "mt-5 rounded-2xl p-6 text-sm",
                        darkMode
                          ? "bg-white/[0.03] text-zinc-400"
                          : "bg-zinc-50 text-zinc-600",
                      )}
                    >
                      No section selected.
                    </div>
                  )}
                </ShellCard>
                <ShellCard className="overflow-hidden">
                  <div
                    className={cn(
                      "border-b px-5 py-4",
                      darkMode ? "border-white/10" : "border-zinc-200",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-semibold",
                          darkMode ? "text-white" : "text-zinc-950",
                        )}
                      >
                        Notification Center
                      </h3>
                      <Bell
                        className={cn(
                          "h-4 w-4",
                          darkMode ? "text-zinc-500" : "text-zinc-500",
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "rounded-2xl border p-4",
                          darkMode
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-zinc-200 bg-zinc-50/80",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div
                              className={cn(
                                "font-medium",
                                darkMode ? "text-white" : "text-zinc-900",
                              )}
                            >
                              {n.title}
                            </div>
                            <div
                              className={cn(
                                "mt-1 text-sm",
                                darkMode ? "text-zinc-400" : "text-zinc-600",
                              )}
                            >
                              {n.description}
                            </div>
                            <div
                              className={cn(
                                "mt-3 text-xs",
                                darkMode ? "text-zinc-500" : "text-zinc-500",
                              )}
                            >
                              {formatRelativeTime(n.createdAt)}
                            </div>
                          </div>
                          {n.severity === "success" && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          )}
                          {n.severity === "warning" && (
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                          )}
                          {n.severity === "error" && (
                            <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                          )}
                          {n.severity === "info" && (
                            <Activity className="h-5 w-5 shrink-0 text-sky-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ShellCard>
                <ShellCard className="overflow-hidden">
                  <div
                    className={cn(
                      "border-b px-5 py-4",
                      darkMode ? "border-white/10" : "border-zinc-200",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-semibold",
                          darkMode ? "text-white" : "text-zinc-950",
                        )}
                      >
                        Activity Timeline
                      </h3>
                      <History
                        className={cn(
                          "h-4 w-4",
                          darkMode ? "text-zinc-500" : "text-zinc-500",
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    {activity.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="mt-1 h-3 w-3 rounded-full bg-sky-500" />
                          <div
                            className={cn(
                              "mt-2 h-full w-px",
                              darkMode ? "bg-white/10" : "bg-zinc-200",
                            )}
                          />
                        </div>
                        <div className="pb-2">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              darkMode ? "text-white" : "text-zinc-900",
                            )}
                          >
                            {item.title}
                          </div>
                          <div
                            className={cn(
                              "mt-1 text-xs",
                              darkMode ? "text-zinc-500" : "text-zinc-500",
                            )}
                          >
                            {item.category} • {formatRelativeTime(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ShellCard>
                <ShellCard className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={cn(
                          "font-semibold",
                          darkMode ? "text-white" : "text-zinc-950",
                        )}
                      >
                        System Status
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          darkMode ? "text-zinc-400" : "text-zinc-600",
                        )}
                      >
                        Enterprise services operational
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                      Healthy
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {[
                      { label: "Realtime Sync", value: 94, icon: RefreshCcw },
                      { label: "AI Copilot", value: 91, icon: Cpu },
                      { label: "Security Engine", value: 97, icon: Shield },
                      { label: "Workflow Engine", value: 93, icon: Briefcase },
                    ].map((service) => (
                      <div key={service.label}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <service.icon
                              className={cn(
                                "h-4 w-4",
                                darkMode ? "text-zinc-500" : "text-zinc-500",
                              )}
                            />
                            <span
                              className={cn(
                                darkMode ? "text-zinc-300" : "text-zinc-700",
                              )}
                            >
                              {service.label}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              darkMode ? "text-zinc-400" : "text-zinc-500",
                            )}
                          >
                            {service.value}%
                          </span>
                        </div>
                        <div
                          className={cn(
                            "h-2 overflow-hidden rounded-full",
                            darkMode ? "bg-white/10" : "bg-zinc-200",
                          )}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${service.value}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ShellCard>
              </div>
            </div>
          </div>
        </main>
      </div>
      <CommandPalette
        open={commandPalette}
        items={SECTION_CONFIGS}
        onClose={closeCommandPalette}
        darkMode={darkMode}
      />
    </div>
  );
}