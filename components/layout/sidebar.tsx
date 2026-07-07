"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type BioMode = "fingerprint" | "face" | null;
type BioStatus = "idle" | "running" | "success" | "failed";
type ThemeMode = "dark" | "light";

type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

type SidebarSection = {
  key: string;
  title: string;
  icon: string;
  items: SidebarItem[];
};

type CommandItem = SidebarItem & {
  sectionKey: string;
  sectionTitle: string;
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
  key: "admin-panel",
  title: "Admin Panel",
  icon: "🛡️",
  items: [
    {
      label: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: "👤"
    }
  ]
},
  {
    key: "ai-control-center",
    title: "AI Control Center",
    icon: "🧠",
    items: [
      { label: "AI Assistant", href: "/ai/assistant", icon: "🤖", badge: "AI" },
      { label: "Smart ChatGPT", href: "/ai/chat", icon: "💬" },
      { label: "AI Analytics", href: "/ai/analytics", icon: "📊" },
      { label: "Attendance AI", href: "/ai/attendance", icon: "🧠" },
      { label: "Payroll AI", href: "/ai/payroll", icon: "💰" },
      { label: "Cost Management", href: "/ai/cost-management", icon: "💰" },
      { label: "AI Revenue Orchestrator", href: "/ai/revenue-orchestrator", icon: "💎" },
      { label: "Prediction AI", href: "/ai/prediction", icon: "📈" },
      { label: "AI Search", href: "/ai/search", icon: "🔍" },
      { label: "AWM SMS", href: "/communication/awm-sms", icon: "💬" },
      { label: "AWM Enterprise Social", href: "/community/awm-social", icon: "🌐" },
      { label: "Voice Command", href: "/ai/voice-command", icon: "🗣" },
      { label: "Multi-language AI", href: "/ai/multi-language", icon: "🌐" },
      { label: "AI Report Generator", href: "/ai/report-generator", icon: "📄" },
      { label: "Smart Pharmacy", href: "/ai/pharmacy/smart-hub", icon: "💊" },
      { label: "Smart Restaurant AI", href: "/ai/restaurant", icon: "🍽️" },
      { label: "AI e-Prescription", href: "/ai/ePrescription", icon: "📋" },
      {
        label: "AI-Driven Medical Imaging Intelligence",
        href: "/ai/driven-medical-imaging-intelligence",
        icon: "🧠",
      },
    ],
  },
  {
    key: "dashboard-system",
    title: "Dashboard System",
    icon: "📊",
    items: [
      { label: "Main Dashboard", href: "/dashboard", icon: "📊" },
      { label: "Live KPI", href: "/dashboard/live-kpi", icon: "📈", badge: "Live" },
      { label: "Notifications", href: "/dashboard/notifications", icon: "🔔" },
      { label: "Smart Calendar", href: "/dashboard/calendar", icon: "📅" },
      { label: "Activity Timeline", href: "/dashboard/activity-timeline", icon: "⚡" },
      {
        label: "Real-time Monitoring",
        href: "/dashboard/real-time-monitoring",
        icon: "📡",
      },
      { label: "Branch Overview", href: "/dashboard/branch-overview", icon: "🌍" },
    ],
  },
  {
    key: "hr-employee-management",
    title: "HR & Employee Management",
    icon: "👥",
    items: [
      { label: "Employees", href: "/hr/employees", icon: "👨" },
      { label: "Employee Profile", href: "/hr/employee-profile", icon: "🆔" },
      { label: "ID Card Generator", href: "/hr/id-card-generator", icon: "🪪" },
      { label: "Attendance", href: "/hr/attendance", icon: "🕒" },
      { label: "Face/Fingerprint", href: "/face/fingerprint", icon: "🧬" },
      { label: "Leave Management", href: "/hr/leave-management", icon: "🏖" },
      { label: "staff-advance-sheet", href: "/staff-advance-sheet", icon: "📄" },
      { label: "Contracts", href: "/hr/contracts", icon: "📑" },
      { label: "Performance Tracking", href: "/hr/performance", icon: "🎯" },
      { label: "Promotions", href: "/hr/promotions", icon: "🏆" },
      {
        label: "Disciplinary Actions",
        href: "/hr/disciplinary-actions",
        icon: "⚠",
      },
      {
        label: "Staff Advancement Count",
        href: "/staff-advancement/count",
        icon: "📌",
      },
      {
        label: "Staff Advancement Logs",
        href: "/staff-advancement/logs",
        icon: "🧾",
      },
      { label: "Face Attendance", href: "/face-attendance", icon: "🧑‍💻" },
    ],
  },
  {
    key: "payroll-finance",
    title: "Payroll & Finance",
    icon: "💰",
    items: [
      { label: "Payroll", href: "/payroll", icon: "💵" },
      { label: "Time Sheet", href: "/payroll/time-sheet", icon: "🕒" },
      { label: "Banking", href: "/payroll/banking", icon: "🏦" },
      { label: "Expenses", href: "/payroll/expenses", icon: "💳" },
      { label: "Tax Management", href: "/payroll/tax-management", icon: "📉" },
      { label: "Revenue", href: "/payroll/revenue", icon: "📈" },
      { label: "Profit / Loss", href: "/payroll/profit-loss", icon: "💲" },
      { label: "Financial Reports", href: "/payroll/financial-reports", icon: "📊" },
      { label: "Zakat Management", href: "/zakat-management", icon: "🕌", badge: "New" },
      { label: "Salary-Sheet", href: "/salary-sheet", icon: "$" },
      { label: "Construction Payroll", href: "/salary-sheet/construction-payroll", icon: "🏗️" },
      { label: "Multi Currency", href: "/payroll/multi-currency", icon: "💱" },
      { label: "Driver Attendance",href: "/payroll/driver-attendance",icon: "🚛",},
      {label: "AI Salary Prediction",href: "/payroll/ai-salary-prediction",icon: "🧠",},
      { label: "E-Commerce", href: "/E-Commerce", icon: "🛒" },
    ],
  },
  {
    key: "production-factory",
    title: "Production / Factory",
    icon: "🏭",
    items: [
      { label: "Production Planning", href: "/production/planning", icon: "🏗" },
      { label: "Line Management", href: "/production/line-management", icon: "🧵" },
      {
        label: "Machine Monitoring",
        href: "/production/machine-monitoring",
        icon: "⚙",
      },
      { label: "Raw Materials", href: "/production/raw-materials", icon: "📦" },
      { label: "Waste Analysis", href: "/production/waste-analysis", icon: "📉" },
      { label: "Production KPI", href: "/production/kpi", icon: "📊" },
      { label: "Maintenance", href: "/production/maintenance", icon: "🔧" },
      { label: "Equipment Status", href: "/production/equipment-status", icon: "🛠" },
    ],
  },
  {
    key: "inventory-supply-chain",
    title: "Inventory & Supply Chain",
    icon: "📦",
    items: [
      { label: "Inventory", href: "/inventory", icon: "📦" },
      { label: "Logistics", href: "/inventory/logistics", icon: "🚚" },
      { label: "Warehouse", href: "/inventory/warehouse", icon: "🏬" },
      {
        label: "Live Stock Tracking",
        href: "/inventory/live-stock-tracking",
        icon: "📍",
      },
      { label: "Purchase Orders", href: "/inventory/purchase-orders", icon: "🔄" },
      { label: "Supplier Management", href: "/inventory/suppliers", icon: "📥" },
      { label: "Delivery Tracking", href: "/inventory/delivery-tracking", icon: "📤" },
      {
        label: "QR / Barcode Scanner",
        href: "/inventory/qr-barcode-scanner",
        icon: "🔳",
      },
    ],
  },
  {
    key: "sales-crm",
    title: "Sales & CRM",
    icon: "🛒",
    items: [
      { label: "Customers", href: "/sales/customers", icon: "👥" },
      { label: "CRM", href: "/sales/crm", icon: "📞" },
      { label: "Marketing", href: "/sales/marketing", icon: "📧" },
      { label: "Invoices", href: "/sales/invoices", icon: "🧾" },
      { label: "Client Chat", href: "/sales/client-chat", icon: "💬" },
      { label: "Sales Analytics", href: "/sales/analytics", icon: "📈" },
      { label: "Lead Management", href: "/sales/leads", icon: "🎯" },
      { label: "AI Sales Assistant", href: "/sales/ai-assistant", icon: "🤖" },
    ],
  },
  {
    key: "reporting-center",
    title: "Reporting Center",
    icon: "📊",
    items: [
      { label: "Smart Reports", href: "/reports/smart-reports", icon: "📑" },
      { label: "Export PDF / Excel", href: "/reports/export", icon: "📤" },
      { label: "Data Visualization", href: "/reports/data-visualization", icon: "📈" },
      { label: "Charts", href: "/reports/charts", icon: "📊" },
      { label: "AI Insights", href: "/reports/ai-insights", icon: "🧠" },
      { label: "Forecasting", href: "/reports/forecasting", icon: "📉" },
      { label: "Print Center", href: "/reports/print-center", icon: "🖨" },
    ],
  },
  {
    key: "security-center",
    title: "Security Center",
    icon: "🔐",
    items: [
      { label: "Access Control", href: "/security/access-control", icon: "🔒" },
      { label: "User Roles", href: "/security/user-roles", icon: "👁" },
      { label: "Biometric Security", href: "/security/biometric", icon: "🧬" },
      { label: "Audit Logs", href: "/security/audit-logs", icon: "📜" },
      { label: "Threat Detection", href: "/security/threat-detection", icon: "🛡" },
      { label: "API Keys", href: "/security/api-keys", icon: "🔑" },
      { label: "Security Alerts", href: "/security/alerts", icon: "🔔" },
      { label: "IP Restrictions", href: "/security/ip-restrictions", icon: "🌐" },
    ],
  },
  {
    key: "global-settings",
    title: "Global Settings",
    icon: "🌍",
    items: [
      { label: "Quality Control", href: "/settings/quality-control", icon: "🧪" },
      { label: "Settings", href: "/settings", icon: "⚙" },
      { label: "Language", href: "/settings/language", icon: "🌐" },
      { label: "Theme", href: "/settings/theme", icon: "🎨" },
      { label: "Dark Mode", href: "/settings/dark-mode", icon: "🌙" },
      { label: "Mobile Sync", href: "/settings/mobile-sync", icon: "📱" },
      { label: "Cloud Backup", href: "/settings/cloud-backup", icon: "☁" },
      { label: "API Integration", href: "/settings/api-integration", icon: "🔗" },
      { label: "ERP Connectors", href: "/settings/erp-connectors", icon: "📡" },
    ],
  },
  {
    key: "next-gen-2026",
    title: "Next-Gen 2026 Features",
    icon: "🤖",
    items: [
      { label: "AI Voice ERP", href: "/next-gen/ai-voice-erp", icon: "🗣", badge: "New" },
      {
        label: "Autonomous AI Agent",
        href: "/next-gen/autonomous-ai-agent",
        icon: "🧠",
      },
      { label: "Live IoT Devices", href: "/next-gen/live-iot-devices", icon: "📡" },
      { label: "AR / VR Dashboard", href: "/next-gen/ar-vr-dashboard", icon: "🥽" },
      {
        label: "AI Workflow Automation",
        href: "/next-gen/ai-workflow-automation",
        icon: "🤖",
      },
      {
        label: "Remote Factory Control",
        href: "/next-gen/remote-factory-control",
        icon: "🛰",
      },
      {
        label: "Predictive Analytics",
        href: "/next-gen/predictive-analytics",
        icon: "🔮",
      },
      {
        label: "Auto Decision Engine",
        href: "/next-gen/auto-decision-engine",
        icon: "⚡",
      },
      {
        label: "AI Document Understanding",
        href: "/next-gen/ai-document-understanding",
        icon: "🧾",
      },
    ],
  },
];

const STORAGE_KEYS = {
  collapsed: "awm-sidebar-collapsed-v2",
  sections: "awm-sidebar-open-sections-v2",
  theme: "awm-sidebar-theme-v2",
  recent: "awm-sidebar-recent-v2",
} as const;

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];
const RECENT_LIMIT = 6;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function useDebouncedValue<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = globalThis.setTimeout(() => setDebounced(value), delay);
    return () => globalThis.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getInitialOpenSections(
  pathname: string | null,
  sections: SidebarSection[],
): Record<string, boolean> {
  const activeSection = sections.find((section) =>
    section.items.some((item) =>
      pathname
        ? item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
        : false,
    ),
  );

  return activeSection ? { [activeSection.key]: true } : {};
}

function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="space-y-3 px-3 py-4" aria-hidden="true">
      {SKELETON_ITEMS.map((item) => (
        <div
          key={item}
          className={cn(
            "overflow-hidden rounded-3xl border animate-pulse",
            "border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.04]",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-3",
              isCollapsed ? "justify-center" : "justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-200/80 dark:bg-white/10" />
              {!isCollapsed && (
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <div className="h-2.5 w-16 rounded-full bg-slate-200/60 dark:bg-white/5" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="h-6 w-10 rounded-full bg-slate-200/70 dark:bg-white/10" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniTrendBars() {
  const bars = [54, 72, 61, 88, 67, 94, 81];

  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((bar, index) => (
        <div
          key={`${bar}-${index}`}
          className="w-2 rounded-full bg-gradient-to-t from-cyan-500 via-blue-500 to-violet-500 opacity-80 transition-transform duration-300 hover:scale-y-110"
          style={{ height: `${bar}%` }}
        />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const mounted = useMounted();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    getInitialOpenSections(pathname, SIDEBAR_SECTIONS),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const [bioMode, setBioMode] = useState<BioMode>(null);
  const [bioStatus, setBioStatus] = useState<BioStatus>("idle");
  const [bioError, setBioError] = useState<string | null>(null);

  const [idCardGenerating, setIdCardGenerating] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);

  const allCommands = useMemo<CommandItem[]>(() => {
    return SIDEBAR_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        sectionKey: section.key,
        sectionTitle: section.title,
      })),
    );
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  useEffect(() => {
    if (!mounted || typeof globalThis.localStorage === "undefined") return;

    try {
      const storedCollapsed = globalThis.localStorage.getItem(STORAGE_KEYS.collapsed);
      const storedSections = globalThis.localStorage.getItem(STORAGE_KEYS.sections);
      const storedTheme = globalThis.localStorage.getItem(STORAGE_KEYS.theme);
      const storedRecent = globalThis.localStorage.getItem(STORAGE_KEYS.recent);

      if (storedCollapsed !== null) {
        setIsCollapsed(storedCollapsed === "true");
      }

      if (storedSections) {
        const parsed = JSON.parse(storedSections) as Record<string, boolean>;
        setOpenSections((prev) => ({ ...prev, ...parsed }));
      }

      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeMode(storedTheme);
      } else if (typeof globalThis.matchMedia === "function") {
        const prefersDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeMode(prefersDark ? "dark" : "light");
      }

      if (storedRecent) {
        const parsed = JSON.parse(storedRecent) as string[];
        if (Array.isArray(parsed)) {
          setRecentItems(parsed.slice(0, RECENT_LIMIT));
        }
      }
    } catch {
      setThemeMode("dark");
    } finally {
      setIsHydrated(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.collapsed, String(isCollapsed));
  }, [isCollapsed, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(openSections));
  }, [openSections, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.theme, themeMode);
  }, [themeMode, isHydrated, mounted]);

  useEffect(() => {
    if (!mounted || !isHydrated || typeof globalThis.localStorage === "undefined") return;
    globalThis.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentItems));
  }, [recentItems, isHydrated, mounted]);

  useEffect(() => {
    if (!pathname) return;

    const activeSection = SIDEBAR_SECTIONS.find((section) =>
      section.items.some((item) => isActive(item.href)),
    );

    if (activeSection) {
      setOpenSections((prev) => ({ ...prev, [activeSection.key]: true }));
    }

    const activeItem = allCommands.find((item) => isActive(item.href));
    if (activeItem) {
      setRecentItems((prev) => {
        const next = [activeItem.href, ...prev.filter((href) => href !== activeItem.href)];
        return next.slice(0, RECENT_LIMIT);
      });
    }
  }, [allCommands, isActive, pathname]);

  useEffect(() => {
    if (!mounted || typeof globalThis.addEventListener !== "function") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }

      if (event.key === "Escape") {
        setIsCommandOpen(false);
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [mounted]);

  const filteredSections = useMemo(() => {
    const query = normalizeSearch(debouncedSearchQuery);

    if (!query) return SIDEBAR_SECTIONS;

    return SIDEBAR_SECTIONS.map((section) => {
      const titleMatched = section.title.toLowerCase().includes(query);

      const items = titleMatched
        ? section.items
        : section.items.filter((item) => {
            const label = item.label.toLowerCase();
            const href = item.href.toLowerCase();
            const badge = item.badge?.toLowerCase() ?? "";
            return (
              label.includes(query) ||
              href.includes(query) ||
              badge.includes(query) ||
              section.key.toLowerCase().includes(query)
            );
          });

      return {
        ...section,
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [debouncedSearchQuery]);

  const commandResults = useMemo(() => {
    const query = normalizeSearch(searchQuery);

    if (!query) {
      const recent = recentItems
        .map((href) => allCommands.find((item) => item.href === href))
        .filter(Boolean) as CommandItem[];

      const fallback = allCommands.filter((item) => !recentItems.includes(item.href)).slice(0, 10);
      return [...recent, ...fallback].slice(0, 12);
    }

    return allCommands
      .filter((item) => {
        const haystack = `${item.label} ${item.href} ${item.sectionTitle} ${item.badge ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [allCommands, recentItems, searchQuery]);

  useEffect(() => {
    setCommandIndex(0);
  }, [searchQuery, isCommandOpen]);

  const totalModules = useMemo(() => {
    return SIDEBAR_SECTIONS.reduce((total, section) => total + section.items.length, 0);
  }, []);

  const totalSections = SIDEBAR_SECTIONS.length;

  const aiModules = useMemo(() => {
    return SIDEBAR_SECTIONS.find((section) => section.key === "ai-control-center")?.items.length ?? 0;
  }, []);

  const activeSectionCount = useMemo(() => {
    return Object.values(openSections).filter(Boolean).length;
  }, [openSections]);

  const matchedModulesCount = useMemo(() => {
    return filteredSections.reduce((total, section) => total + section.items.length, 0);
  }, [filteredSections]);

  const baseItemClass =
    "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60";

  const activeItemClass =
    "border border-cyan-400/30 bg-gradient-to-r from-cyan-500/16 via-blue-500/16 to-violet-500/16 text-slate-950 shadow-[0_18px_50px_-18px_rgba(6,182,212,0.45)] dark:text-white dark:shadow-[0_18px_50px_-18px_rgba(34,211,238,0.32)]";

  const inactiveItemClass =
    "border border-transparent text-slate-600 hover:border-slate-300/70 hover:bg-slate-900/[0.03] hover:text-slate-950 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-white";

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const startBio = useCallback(
    async (mode: Exclude<BioMode, null>) => {
      if (bioStatus === "running") return;

      setBioMode(mode);
      setBioStatus("running");
      setBioError(null);

      try {
        await new Promise((resolve) => globalThis.setTimeout(resolve, 1200));
        setBioStatus("success");
      } catch {
        setBioStatus("failed");
        setBioError("Biometric verification failed. Please try again.");
      }
    },
    [bioStatus],
  );

  const generateIdCard = useCallback(async () => {
    if (idCardGenerating) return;

    setIdCardGenerating(true);

    try {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 1200));
    } finally {
      setIdCardGenerating(false);
    }
  }, [idCardGenerating]);

  const getBioStatusText = useCallback(() => {
    if (bioStatus === "idle") return "System ready";
    if (bioStatus === "running") {
      return bioMode === "fingerprint" ? "Scanning fingerprint..." : "Scanning face...";
    }
    if (bioStatus === "success") return "Verified successfully";
    return bioError || "Verification failed";
  }, [bioError, bioMode, bioStatus]);

  const handleCommandItemOpen = useCallback((href: string, sectionKey: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
    setRecentItems((prev) => {
      const next = [href, ...prev.filter((item) => item !== href)];
      return next.slice(0, RECENT_LIMIT);
    });
    setIsCommandOpen(false);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const currentThemeIsDark = themeMode === "dark";

  return (
    <>
      <div
        className={cn(
          "relative",
          currentThemeIsDark ? "dark" : "",
        )}
      >
        <aside
          aria-label="Enterprise sidebar"
          className={cn(
            "sticky top-0 z-40 h-screen overflow-hidden border-r shadow-2xl transition-[width,background,border-color] duration-300 ease-out",
            currentThemeIsDark
              ? "border-white/10 bg-slate-950 text-white"
              : "border-slate-200 bg-slate-50 text-slate-950",
            isCollapsed ? "w-20" : "w-80 2xl:w-[22rem]",
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_22%)] dark:opacity-100 opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(255,255,255,0.04))] dark:opacity-100 opacity-40" />
            <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="absolute -right-24 top-28 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent dark:via-white/10" />
          </div>

          <div className="relative flex h-full flex-col">
            <div
              className={cn(
                "border-b p-4 backdrop-blur-xl",
                currentThemeIsDark
                  ? "border-white/10 bg-slate-950/70"
                  : "border-slate-200 bg-white/80",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[0_0_30px_rgba(34,211,238,0.20)]",
                      currentThemeIsDark
                        ? "border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-600/30"
                        : "border-cyan-200 bg-gradient-to-br from-cyan-100 via-white to-indigo-100",
                    )}
                  >
                    <span className="text-xl">⚡</span>
                    <span
                      className={cn(
                        "absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2",
                        currentThemeIsDark
                          ? "border-slate-950 bg-emerald-400"
                          : "border-white bg-emerald-500",
                      )}
                    />
                  </div>

                  {!isCollapsed && (
                    <div className="min-w-0">
                      <div className="truncate text-lg font-black tracking-wide">
                        AWM ERP AI
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-[11px]",
                          currentThemeIsDark ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        <span>Enterprise AI Suite</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            currentThemeIsDark
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700",
                          )}
                        >
                          ONLINE
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all duration-200",
                        currentThemeIsDark
                          ? "border-white/10 bg-white/[0.06] text-white/90 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                      )}
                      aria-label={currentThemeIsDark ? "Switch to light mode" : "Switch to dark mode"}
                      title={currentThemeIsDark ? "Light mode" : "Dark mode"}
                    >
                      {currentThemeIsDark ? "☀" : "🌙"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm transition-all duration-200",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.06] text-white/90 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                    )}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isCollapsed ? "☰" : "⇤"}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div
                    className={cn(
                      "rounded-2xl border p-2",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-slate-200 bg-white/90",
                    )}
                  >
                    <div className={cn("text-[10px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                      Modules
                    </div>
                    <div className="text-sm font-bold">{totalModules}</div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-2",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-slate-200 bg-white/90",
                    )}
                  >
                    <div className={cn("text-[10px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                      AI Core
                    </div>
                    <div className="text-sm font-bold text-cyan-500 dark:text-cyan-300">
                      {aiModules}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl border p-2",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-slate-200 bg-white/90",
                    )}
                  >
                    <div className={cn("text-[10px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                      Live
                    </div>
                    <div className="text-sm font-bold text-emerald-500 dark:text-emerald-300">
                      Safe
                    </div>
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <>
                  <div className="mt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsCommandOpen(true)}
                      className={cn(
                        "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-left text-sm transition-all duration-200",
                        currentThemeIsDark
                          ? "border-white/10 bg-white/[0.06] text-slate-300 hover:border-cyan-300/30 hover:bg-white/[0.08]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/70",
                      )}
                    >
                      <span className={cn("text-sm", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                        ⌘
                      </span>
                      <span className="flex-1 truncate">Search modules, pages, commands...</span>
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-1 text-[10px] font-semibold",
                          currentThemeIsDark
                            ? "border-white/10 bg-white/[0.04] text-slate-400"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                        )}
                      >
                        Ctrl K
                      </span>
                    </button>

                    <div className="relative">
                      <span
                        className={cn(
                          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm",
                          currentThemeIsDark ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        🔍
                      </span>
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search modules..."
                        aria-label="Search modules"
                        className={cn(
                          "w-full rounded-2xl border py-2.5 pl-9 pr-12 text-sm outline-none transition-all duration-200",
                          currentThemeIsDark
                            ? "border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/[0.08]"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white",
                        )}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className={cn(
                            "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-sm transition",
                            currentThemeIsDark
                              ? "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                          )}
                          aria-label="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div
                      className={cn(
                        "rounded-2xl border p-3",
                        currentThemeIsDark
                          ? "border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 via-blue-500/8 to-transparent"
                          : "border-cyan-100 bg-gradient-to-br from-cyan-50 to-white",
                      )}
                    >
                      <div className={cn("text-[10px] uppercase tracking-[0.2em]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                        Matched
                      </div>
                      <div className="mt-1 text-lg font-black">{matchedModulesCount}</div>
                      <div className={cn("mt-1 text-[11px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                        Search-ready modules
                      </div>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl border p-3",
                        currentThemeIsDark
                          ? "border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-indigo-500/8 to-transparent"
                          : "border-violet-100 bg-gradient-to-br from-violet-50 to-white",
                      )}
                    >
                      <div className={cn("text-[10px] uppercase tracking-[0.2em]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                        Expanded
                      </div>
                      <div className="mt-1 text-lg font-black">{activeSectionCount}</div>
                      <div className={cn("mt-1 text-[11px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                        Active groups
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isHydrated ? (
              <div className="flex-1 overflow-y-auto">
                <SidebarSkeleton isCollapsed={isCollapsed} />
              </div>
            ) : (
              <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
                {!isCollapsed && (
                  <div
                    className={cn(
                      "mb-3 rounded-3xl border p-3",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-slate-200 bg-white/90",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-300">
                          System Pulse
                        </div>
                        <div className={cn("mt-1 text-[11px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                          Navigation intelligence
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-bold",
                          currentThemeIsDark
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700",
                        )}
                      >
                        Stable
                      </span>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <MiniTrendBars />
                      <div className="text-right">
                        <div className="text-base font-black">{totalSections}</div>
                        <div className={cn("text-[11px]", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                          Business domains
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {filteredSections.length === 0 && !isCollapsed && (
                  <div
                    className={cn(
                      "rounded-3xl border px-4 py-8 text-center",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-slate-200 bg-white/90",
                    )}
                  >
                    <div className="text-3xl">🔎</div>
                    <div className="mt-3 text-sm font-semibold">No module found</div>
                    <div className={cn("mt-1 text-xs", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                      Try another search keyword.
                    </div>
                  </div>
                )}

                {filteredSections.map((section) => {
                  const sectionActive = section.items.some((item) => isActive(item.href));
                  const sectionOpen =
                    !isCollapsed &&
                    (normalizeSearch(debouncedSearchQuery).length > 0 ||
                      openSections[section.key] ||
                      sectionActive);

                  return (
                    <div
                      key={section.key}
                      className={cn(
                        "rounded-3xl border transition-all duration-300",
                        currentThemeIsDark
                          ? "border-white/8 bg-white/[0.02]"
                          : "border-slate-200/80 bg-white/80",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.key)}
                        className={cn(
                          "group flex w-full items-center rounded-3xl px-3 py-3 text-left text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                          sectionActive
                            ? currentThemeIsDark
                              ? "border border-cyan-300/25 bg-cyan-400/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.10)]"
                              : "border border-cyan-200 bg-cyan-50 text-slate-950 shadow-[0_10px_30px_-18px_rgba(34,211,238,0.35)]"
                            : currentThemeIsDark
                              ? "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                              : "border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                          isCollapsed ? "justify-center" : "justify-between",
                        )}
                        title={section.title}
                        aria-expanded={sectionOpen}
                        aria-controls={`section-panel-${section.key}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-lg transition",
                              sectionActive
                                ? currentThemeIsDark
                                  ? "border-cyan-300/25 bg-cyan-300/10"
                                  : "border-cyan-200 bg-cyan-100"
                                : currentThemeIsDark
                                  ? "border-white/10 bg-white/[0.04] group-hover:bg-white/[0.08]"
                                  : "border-slate-200 bg-white group-hover:bg-slate-100",
                            )}
                          >
                            {section.icon}
                          </span>

                          {!isCollapsed && (
                            <span className="min-w-0">
                              <span className="block truncate">{section.title}</span>
                              <span
                                className={cn(
                                  "mt-0.5 block text-[10px] font-medium",
                                  currentThemeIsDark ? "text-slate-500" : "text-slate-500",
                                )}
                              >
                                {section.items.length} modules
                              </span>
                            </span>
                          )}
                        </span>

                        {!isCollapsed && (
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px]",
                                sectionActive
                                  ? currentThemeIsDark
                                    ? "bg-cyan-300/15 text-cyan-200"
                                    : "bg-cyan-100 text-cyan-700"
                                  : currentThemeIsDark
                                    ? "bg-white/[0.06] text-slate-400"
                                    : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {section.items.length}
                            </span>
                            <span
                              className={cn(
                                "text-xs transition-transform duration-300",
                                currentThemeIsDark ? "text-slate-400" : "text-slate-500",
                                sectionOpen ? "rotate-90" : "",
                              )}
                            >
                              ▶
                            </span>
                          </span>
                        )}
                      </button>

                      <div
                        id={`section-panel-${section.key}`}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                          sectionOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={cn(
                              "ml-5 space-y-1 border-l pb-2 pl-3",
                              currentThemeIsDark ? "border-white/10" : "border-slate-200",
                            )}
                          >
                            {section.items.map((item) => {
                              const active = isActive(item.href);

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={cn(
                                    baseItemClass,
                                    active ? activeItemClass : inactiveItemClass,
                                  )}
                                  title={item.label}
                                  onClick={() => handleCommandItemOpen(item.href, section.key)}
                                >
                                  {active && (
                                    <span className="absolute -left-[13px] top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
                                  )}

                                  <span
                                    className={cn(
                                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm transition-all duration-300",
                                      active
                                        ? currentThemeIsDark
                                          ? "bg-cyan-300/15"
                                          : "bg-cyan-100"
                                        : currentThemeIsDark
                                          ? "bg-white/[0.04] group-hover:bg-white/[0.08]"
                                          : "bg-slate-100 group-hover:bg-slate-200",
                                    )}
                                  >
                                    {item.icon || "•"}
                                  </span>

                                  <span className="min-w-0 flex-1 truncate">{item.label}</span>

                                  {item.badge && (
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                        active
                                          ? currentThemeIsDark
                                            ? "bg-cyan-300/20 text-cyan-100"
                                            : "bg-cyan-100 text-cyan-700"
                                          : currentThemeIsDark
                                            ? "bg-blue-500/15 text-blue-200"
                                            : "bg-blue-100 text-blue-700",
                                      )}
                                    >
                                      {item.badge}
                                    </span>
                                  )}

                                  <span
                                    className={cn(
                                      "translate-x-1 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
                                      active
                                        ? currentThemeIsDark
                                          ? "text-cyan-200"
                                          : "text-cyan-600"
                                        : currentThemeIsDark
                                          ? "text-slate-500"
                                          : "text-slate-400",
                                    )}
                                  >
                                    ↗
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}

            <div
              className={cn(
                "border-t p-3 backdrop-blur-xl",
                currentThemeIsDark
                  ? "border-white/10 bg-slate-950/75"
                  : "border-slate-200 bg-white/85",
              )}
            >
              {!isCollapsed && (
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div
                      className={cn(
                        "text-xs font-bold uppercase tracking-[0.18em]",
                        currentThemeIsDark ? "text-slate-500" : "text-slate-500",
                      )}
                    >
                      Quick Actions
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-[11px]",
                        currentThemeIsDark ? "text-slate-500" : "text-slate-500",
                      )}
                    >
                      Biometric & ID utilities
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-[10px] font-bold",
                      currentThemeIsDark
                        ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                        : "border-cyan-200 bg-cyan-50 text-cyan-700",
                    )}
                  >
                    Smart
                  </span>
                </div>
              )}

              <div className={cn("grid gap-2", isCollapsed ? "grid-cols-1" : "grid-cols-3")}>
                <button
                  type="button"
                  onClick={() => startBio("fingerprint")}
                  disabled={bioStatus === "running"}
                  className={cn(
                    "rounded-2xl border px-2 py-2.5 text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    currentThemeIsDark
                      ? "border-white/10 bg-white/[0.06] text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                  )}
                  title="Fingerprint"
                >
                  🧬 {!isCollapsed && <span className="ml-1">Finger</span>}
                </button>

                <button
                  type="button"
                  onClick={() => startBio("face")}
                  disabled={bioStatus === "running"}
                  className={cn(
                    "rounded-2xl border px-2 py-2.5 text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    currentThemeIsDark
                      ? "border-white/10 bg-white/[0.06] text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                  )}
                  title="Face"
                >
                  🙂 {!isCollapsed && <span className="ml-1">Face</span>}
                </button>

                <button
                  type="button"
                  onClick={generateIdCard}
                  disabled={idCardGenerating}
                  className={cn(
                    "rounded-2xl border px-2 py-2.5 text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    currentThemeIsDark
                      ? "border-white/10 bg-white/[0.06] text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                      : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50",
                  )}
                  title="ID Card"
                >
                  🪪 {!isCollapsed && <span className="ml-1">ID</span>}
                </button>
              </div>

              {!isCollapsed && (
                <div
                  className={cn(
                    "mt-3 rounded-2xl border px-3 py-2.5 text-xs transition-all duration-300",
                    bioStatus === "success"
                      ? currentThemeIsDark
                        ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : bioStatus === "failed"
                        ? currentThemeIsDark
                          ? "border-red-400/25 bg-red-500/10 text-red-200"
                          : "border-red-200 bg-red-50 text-red-700"
                        : bioStatus === "running"
                          ? currentThemeIsDark
                            ? "border-amber-400/25 bg-amber-500/10 text-amber-100"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          : currentThemeIsDark
                            ? "border-white/10 bg-white/[0.05] text-slate-400"
                            : "border-slate-200 bg-white text-slate-600",
                  )}
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {bioStatus === "success"
                        ? "✅"
                        : bioStatus === "failed"
                          ? "❌"
                          : bioStatus === "running"
                            ? "⏳"
                            : "🛡"}
                    </span>
                    <span className="truncate">
                      {idCardGenerating ? "Generating ID card..." : getBioStatusText()}
                    </span>
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <div
                  className={cn(
                    "mt-3 rounded-3xl border p-3",
                    currentThemeIsDark
                      ? "border-white/10 bg-gradient-to-r from-white/[0.07] to-white/[0.03]"
                      : "border-slate-200 bg-gradient-to-r from-white to-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl",
                        currentThemeIsDark
                          ? "bg-gradient-to-br from-cyan-400/25 to-indigo-500/25"
                          : "bg-gradient-to-br from-cyan-100 to-indigo-100",
                      )}
                    >
                      👤
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">ERP Admin</div>
                      <div
                        className={cn(
                          "truncate text-[11px]",
                          currentThemeIsDark ? "text-slate-500" : "text-slate-500",
                        )}
                      >
                        Super Administrator
                      </div>
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {isCommandOpen && !isCollapsed && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsCommandOpen(false)}
          />
          <div className="absolute left-1/2 top-20 w-[min(44rem,calc(100vw-1.5rem))] -translate-x-1/2">
            <div
              className={cn(
                "overflow-hidden rounded-[28px] border shadow-2xl",
                currentThemeIsDark
                  ? "border-white/10 bg-slate-950/95 text-white"
                  : "border-slate-200 bg-white/95 text-slate-950",
              )}
            >
              <div
                className={cn(
                  "border-b p-3",
                  currentThemeIsDark ? "border-white/10" : "border-slate-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm", currentThemeIsDark ? "text-slate-400" : "text-slate-500")}>
                    🔍
                  </span>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setCommandIndex((prev) =>
                          Math.min(prev + 1, Math.max(commandResults.length - 1, 0)),
                        );
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setCommandIndex((prev) => Math.max(prev - 1, 0));
                      }
                      if (event.key === "Enter" && commandResults[commandIndex]) {
                        handleCommandItemOpen(
                          commandResults[commandIndex].href,
                          commandResults[commandIndex].sectionKey,
                        );
                      }
                    }}
                    placeholder="Search any module or route..."
                    className={cn(
                      "w-full bg-transparent text-sm outline-none",
                      currentThemeIsDark
                        ? "text-white placeholder:text-slate-500"
                        : "text-slate-950 placeholder:text-slate-400",
                    )}
                  />
                  <span
                    className={cn(
                      "rounded-lg border px-2 py-1 text-[10px] font-semibold",
                      currentThemeIsDark
                        ? "border-white/10 bg-white/[0.04] text-slate-400"
                        : "border-slate-200 bg-slate-50 text-slate-500",
                    )}
                  >
                    ESC
                  </span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {commandResults.length === 0 ? (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-8 text-center text-sm",
                      currentThemeIsDark ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    No results found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {commandResults.map((item, index) => (
                      <Link
                        key={`${item.sectionKey}-${item.href}`}
                        href={item.href}
                        onClick={() => handleCommandItemOpen(item.href, item.sectionKey)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200",
                          index === commandIndex
                            ? currentThemeIsDark
                              ? "border-cyan-300/25 bg-cyan-400/10"
                              : "border-cyan-200 bg-cyan-50"
                            : currentThemeIsDark
                              ? "border-transparent hover:border-white/10 hover:bg-white/[0.05]"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            index === commandIndex
                              ? currentThemeIsDark
                                ? "bg-cyan-300/10"
                                : "bg-cyan-100"
                              : currentThemeIsDark
                                ? "bg-white/[0.05]"
                                : "bg-slate-100",
                          )}
                        >
                          {item.icon}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{item.label}</div>
                          <div
                            className={cn(
                              "truncate text-[11px]",
                              currentThemeIsDark ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            {item.sectionTitle} · {item.href}
                          </div>
                        </div>

                        {item.badge ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[10px] font-bold",
                              currentThemeIsDark
                                ? "bg-blue-500/15 text-blue-200"
                                : "bg-blue-100 text-blue-700",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
