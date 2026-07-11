'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  Archive,
  BadgeCheck,
  BarChart4,
  BellRing,
  Bot,
  BrainCircuit,
  Building2,
  Cloud,
  CloudLightning,
  Cpu,
  Crown,
  Database,
  DatabaseBackup,
  DollarSign,
  Eye,
  FileCheck,
  Fingerprint,
  GitBranch,
  Globe2,
  HardDrive,
  History,
  KeyRound,
  Laptop,
  Layers,
  LineChart,
  Lock,
  Network,
  Radar,
  Receipt,
  RefreshCcw,
  RefreshCw,
  Scale,
  ScanSearch,
  Server,
  ServerCog,
  Shield,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  Siren,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  Settings2,
  Download,
  Upload,
  Printer,
  Share2,
  Save,
  RefreshCw as RefreshIcon,
  Eye as PreviewIcon,
  CheckCircle2,
  Diff,
  Captions,
  Search,
  HistoryIcon,
  SlidersHorizontal,
  SquareActivity,
  MapPinned,
  Globe,
  Languages,
  BadgePlus,
  LockKeyhole,
  ShieldQuestion,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Locale = 'en' | 'bn' | 'ar';
type Role = 'SUPER_ADMIN' | 'GLOBAL_ADMIN' | 'REGIONAL_ADMIN' | 'BRANCH_MANAGER' | 'USER';

type NotificationsState = {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
};

type ActionItem = {
  title: string;
  button: string;
  color: string;
  action: string;
  card: string;
  critical?: boolean;
};

type MetricCard = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  cardClass?: string;
  valueClass?: string;
  spanClass?: string;
};

type MetricSection = {
  title: string;
  icon: LucideIcon;
  iconClass: string;
  gridClass?: string;
  cards: MetricCard[];
};

type RouteLinkItem = {
  label: string;
  path: string;
  code: string;
  group: string;
  note: string;
};

type SystemMode = 'NORMAL' | 'ZERO_TRUST' | 'LOCKDOWN';
type ComplianceStatus = 'SUCCESS' | 'DENIED' | 'FAILED';

type ComplianceLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  status: ComplianceStatus;
  role: Role;
  locale: Locale;
  route: string;
  message: string;
  endpoint?: string;
  payload?: Record<string, unknown>;
};

type SharedEnterpriseState = {
  locale: Locale;
  role: Role;
  globalLockdown: boolean;
  zeroTrust: boolean;
  emergencyLock: boolean;
  autoRoute: boolean;
  autoSave: boolean;
  hpPrinterName: string;
  showThumbnails: boolean;
  lastAction: string;
  updatedAt: string;
};

const STORAGE_KEYS = {
  SHARED: 'awm-erp-global-shared-state-v2',
  LOCKDOWN: 'awm-erp-global-lockdown',
  ZERO_TRUST: 'awm-erp-zero-trust-mode',
  EMERGENCY_LOCK: 'awm-erp-emergency-lock',
  LAST_ACTION: 'awm-erp-settings-last-action',
  SETTINGS_SNAPSHOT: 'awm-erp-settings-snapshot',
  COMPLIANCE_LOGS: 'awm-erp-compliance-logs-v2',
  ROLE: 'awm-erp-current-role',
  LOCALE: 'awm-erp-current-locale',
} as const;

const roleOptions: Role[] = ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'REGIONAL_ADMIN', 'BRANCH_MANAGER', 'USER'];
const localeOptions: Locale[] = ['en', 'bn', 'ar'];

const TRANSLATIONS = {
  en: {
    title: 'Global System Settings',
    subtitle: 'Validate every global configuration, route, emergency control, and enterprise linkage with production-safe operations.',
    saveAll: 'Save All Configurations',
    currentAccessRole: 'Current Access Role',
    lastAction: 'Last Action',
    integrity: 'Integrity',
    validated: 'VALIDATED',
    checkRequired: 'CHECK REQUIRED',
    emergencyControlCenter: 'Emergency Control Center',
    globalLockdown: 'Global Lockdown',
    zeroTrust: 'Zero Trust',
    activateGlobalLockdown: 'Activate Global Lockdown',
    deactivateGlobalLockdown: 'Deactivate Global Lockdown',
    activateZeroTrust: 'Activate Zero Trust Mode',
    disableZeroTrust: 'Disable Zero Trust Mode',
    routeExplorer: 'Route Explorer',
    openSelectedPage: 'Open Selected Page',
    syncSelection: 'Sync Selection',
    notificationChannels: 'Notification Channels',
    passwordPolicy: 'Password Policy',
    twoFactorAuth: 'Two-Factor Authentication (2FA)',
    routeDropdown: 'Target ERP Routing Dropdown',
    selectedRoute: 'Selected Route',
    language: 'Language',
    role: 'Role',
    autoRoute: 'Auto Route',
    autoSave: 'Auto Save',
    printer: 'Printer',
    previewThumbnails: 'Preview Thumbnails',
    complianceLog: 'Compliance Log Console',
    exportLogs: 'Export Logs',
    clearLogs: 'Clear Logs',
    sharedState: 'Shared State Snapshot',
    emergencyLock: 'Emergency Lock',
    securityAudit: 'Security & Audit',
    enterpriseActions: 'Enterprise Action Console',
    globalFeatureMatrix: 'Global Feature Matrix',
    infrastructure: 'Infrastructure & System Health',
    settings: 'Settings',
    allRoutes: 'All Routes',
  },
  bn: {
    title: 'গ্লোবাল সিস্টেম সেটিংস',
    subtitle: 'প্রোডাকশন-সেইফ অপারেশনের মাধ্যমে প্রতিটি গ্লোবাল কনফিগারেশন, রাউট, ইমারজেন্সি কন্ট্রোল, এবং এন্টারপ্রাইজ লিংকেজ যাচাই করুন।',
    saveAll: 'সব কনফিগারেশন সেভ করুন',
    currentAccessRole: 'বর্তমান অ্যাক্সেস রোল',
    lastAction: 'সর্বশেষ অ্যাকশন',
    integrity: 'অখণ্ডতা',
    validated: 'যাচাইকৃত',
    checkRequired: 'পরীক্ষা প্রয়োজন',
    emergencyControlCenter: 'ইমারজেন্সি কন্ট্রোল সেন্টার',
    globalLockdown: 'গ্লোবাল লকডাউন',
    zeroTrust: 'জিরো ট্রাস্ট',
    activateGlobalLockdown: 'গ্লোবাল লকডাউন চালু করুন',
    deactivateGlobalLockdown: 'গ্লোবাল লকডাউন বন্ধ করুন',
    activateZeroTrust: 'জিরো ট্রাস্ট মোড চালু করুন',
    disableZeroTrust: 'জিরো ট্রাস্ট বন্ধ করুন',
    routeExplorer: 'রাউট এক্সপ্লোরার',
    openSelectedPage: 'নির্বাচিত পেজ খুলুন',
    syncSelection: 'সিলেকশন সিঙ্ক করুন',
    notificationChannels: 'নোটিফিকেশন চ্যানেল',
    passwordPolicy: 'পাসওয়ার্ড পলিসি',
    twoFactorAuth: 'টু-ফ্যাক্টর অথেনটিকেশন (2FA)',
    routeDropdown: 'টার্গেট ERP রাউটিং ড্রপডাউন',
    selectedRoute: 'নির্বাচিত রাউট',
    language: 'ভাষা',
    role: 'রোল',
    autoRoute: 'অটো রাউট',
    autoSave: 'অটো সেভ',
    printer: 'প্রিন্টার',
    previewThumbnails: 'প্রিভিউ থাম্বনেইল',
    complianceLog: 'কমপ্লায়েন্স লগ কনসোল',
    exportLogs: 'লগ এক্সপোর্ট',
    clearLogs: 'লগ ক্লিয়ার',
    sharedState: 'শেয়ার্ড স্টেট স্ন্যাপশট',
    emergencyLock: 'ইমারজেন্সি লক',
    securityAudit: 'সিকিউরিটি ও অডিট',
    enterpriseActions: 'এন্টারপ্রাইজ অ্যাকশন কনসোল',
    globalFeatureMatrix: 'গ্লোবাল ফিচার ম্যাট্রিক্স',
    infrastructure: 'ইনফ্রাস্ট্রাকচার ও সিস্টেম হেলথ',
    settings: 'সেটিংস',
    allRoutes: 'সব রাউট',
  },
  ar: {
    title: 'إعدادات النظام العالمية',
    subtitle: 'تحقق من كل إعداد عالمي وتوجيه وتحكم طارئ وربط مؤسسي بطريقة آمنة للإنتاج.',
    saveAll: 'حفظ جميع الإعدادات',
    currentAccessRole: 'دور الوصول الحالي',
    lastAction: 'آخر إجراء',
    integrity: 'السلامة',
    validated: 'تم التحقق',
    checkRequired: 'يتطلب فحص',
    emergencyControlCenter: 'مركز التحكم الطارئ',
    globalLockdown: 'الإغلاق العالمي',
    zeroTrust: 'الثقة الصفرية',
    activateGlobalLockdown: 'تفعيل الإغلاق العالمي',
    deactivateGlobalLockdown: 'إلغاء الإغلاق العالمي',
    activateZeroTrust: 'تفعيل وضع الثقة الصفرية',
    disableZeroTrust: 'إيقاف الثقة الصفرية',
    routeExplorer: 'مستكشف المسارات',
    openSelectedPage: 'فتح الصفحة المحددة',
    syncSelection: 'مزامنة الاختيار',
    notificationChannels: 'قنوات الإشعارات',
    passwordPolicy: 'سياسة كلمة المرور',
    twoFactorAuth: 'المصادقة الثنائية (2FA)',
    routeDropdown: 'القائمة المنسدلة لتوجيه ERP',
    selectedRoute: 'المسار المحدد',
    language: 'اللغة',
    role: 'الدور',
    autoRoute: 'التوجيه التلقائي',
    autoSave: 'الحفظ التلقائي',
    printer: 'الطابعة',
    previewThumbnails: 'صور المعاينة المصغرة',
    complianceLog: 'وحدة سجل الامتثال',
    exportLogs: 'تصدير السجلات',
    clearLogs: 'مسح السجلات',
    sharedState: 'لقطة الحالة المشتركة',
    emergencyLock: 'قفل الطوارئ',
    securityAudit: 'الأمان والتدقيق',
    enterpriseActions: 'وحدة إجراءات المؤسسة',
    globalFeatureMatrix: 'مصفوفة الميزات العالمية',
    infrastructure: 'البنية التحتية وصحة النظام',
    settings: 'الإعدادات',
    allRoutes: 'جميع المسارات',
  },
} as const;

const ALL_PAGE_LINKS: RouteLinkItem[] = [
  { label: 'Dashboard - Main Console', path: '/dashboard', code: 'SYS-DB', group: 'Dashboard', note: 'Executive overview and live KPIs' },
  { label: 'Dashboard - Admin', path: '/dashboard/admin', code: 'SYS-ADM', group: 'Dashboard', note: 'Administrative dashboard' },
  { label: 'Dashboard - Activity Timeline', path: '/dashboard/activity-timeline', code: 'SYS-TML', group: 'Dashboard', note: 'Activity timeline' },
  { label: 'Dashboard - AI Analytics', path: '/dashboard/ai-analytics', code: 'SYS-AIA', group: 'Dashboard', note: 'AI dashboard analytics' },
  { label: 'Dashboard - Branch Overview', path: '/dashboard/branch-overview', code: 'SYS-BOV', group: 'Dashboard', note: 'Branch overview' },
  { label: 'Dashboard - Calendar', path: '/dashboard/calendar', code: 'SYS-CAL', group: 'Dashboard', note: 'Calendar view' },
  { label: 'Dashboard - Live Attendance', path: '/dashboard/live-attendance', code: 'SYS-LAT', group: 'Dashboard', note: 'Live attendance view' },
  { label: 'Dashboard - Live KPI', path: '/dashboard/live-kpi', code: 'SYS-KPI', group: 'Dashboard', note: 'KPI management view' },
  { label: 'Dashboard - Notifications', path: '/dashboard/notifications', code: 'SYS-NOT', group: 'Dashboard', note: 'Alerts and notifications' },
  { label: 'Dashboard - Payroll Overview', path: '/dashboard/payroll-overview', code: 'SYS-PAY', group: 'Dashboard', note: 'Payroll overview' },
  { label: 'Dashboard - Real-Time Monitoring', path: '/dashboard/real-time-monitoring', code: 'SYS-RTM', group: 'Dashboard', note: 'Live monitoring console' },

  { label: 'HR - Employees', path: '/hr/employees', code: 'HRM-LIST', group: 'HR', note: 'Employee records and listing' },
  { label: 'HR - Employee Profile', path: '/hr/employee-profile', code: 'HRM-EMP', group: 'HR', note: 'Employee profile routing' },
  { label: 'HR - Attendance', path: '/hr/attendance', code: 'HRM-ATT', group: 'HR', note: 'HR attendance records' },
  { label: 'HR - Contracts', path: '/hr/contracts', code: 'HRM-CTR', group: 'HR', note: 'Contract management' },
  { label: 'HR - Disciplinary Actions', path: '/hr/disciplinary-actions', code: 'HRM-DIS', group: 'HR', note: 'Disciplinary actions' },
  { label: 'HR - ID Card Generator', path: '/hr/id-card-generator', code: 'HRM-IDC', group: 'HR', note: 'ID card output' },
  { label: 'HR - Leave Management', path: '/hr/leave-management', code: 'HRM-LVE', group: 'HR', note: 'Leave workflow routing' },
  { label: 'HR - Performance', path: '/hr/performance', code: 'HRM-PER', group: 'HR', note: 'Performance analysis' },
  { label: 'HR - Promotions', path: '/hr/promotions', code: 'HRM-PRO', group: 'HR', note: 'Promotion workflow' },
  { label: 'HR - Scanner', path: '/hr/scanner', code: 'HRM-SCN', group: 'HR', note: 'Scanner workflow' },

  { label: 'Attendance - Main', path: '/attendance', code: 'ATT-MAIN', group: 'Attendance', note: 'Attendance module' },
  { label: 'Attendance - Face', path: '/attendance/face', code: 'ATT-FACE', group: 'Attendance', note: 'Face attendance' },
  { label: 'Attendance - Fingerprint', path: '/attendance/fingerprint', code: 'ATT-FPR', group: 'Attendance', note: 'Fingerprint attendance' },
  { label: 'Attendance - GPS', path: '/attendance/gps', code: 'ATT-GPS', group: 'Attendance', note: 'GPS check-in' },
  { label: 'Attendance - History', path: '/attendance/history', code: 'ATT-HIS', group: 'Attendance', note: 'Attendance history' },
  { label: 'Attendance - QR', path: '/attendance/qr', code: 'ATT-QR', group: 'Attendance', note: 'QR attendance' },
  { label: 'Attendance - Shifts', path: '/attendance/shifts', code: 'ATT-SHF', group: 'Attendance', note: 'Shift management' },

  { label: 'Inventory - Main', path: '/inventory', code: 'INV-MAIN', group: 'Inventory', note: 'Inventory module home' },
  { label: 'Inventory - Product Entry', path: '/inventory', code: 'INV-PROD', group: 'Inventory', note: 'Product entry routing' },
  { label: 'Inventory - Delivery Tracking', path: '/inventory/delivery-tracking', code: 'INV-DEL', group: 'Inventory', note: 'Delivery tracking' },
  { label: 'Inventory - Live Stock Tracking', path: '/inventory/live-stock-tracking', code: 'INV-LST', group: 'Inventory', note: 'Stock tracking' },
  { label: 'Inventory - Logistics', path: '/inventory/logistics', code: 'INV-LOG', group: 'Inventory', note: 'Logistics module' },
  { label: 'Inventory - Purchase Orders', path: '/inventory/purchase-orders', code: 'INV-PO', group: 'Inventory', note: 'Purchase orders' },
  { label: 'Inventory - QR Barcode Scanner', path: '/inventory/qr-barcode-scanner', code: 'INV-SCAN', group: 'Inventory', note: 'Barcode / QR scanner' },
  { label: 'Inventory - Suppliers', path: '/inventory/suppliers', code: 'INV-SUP', group: 'Inventory', note: 'Supplier management' },
  { label: 'Inventory - Warehouse', path: '/inventory/warehouse', code: 'INV-WHS', group: 'Inventory', note: 'Warehouse operations' },

  { label: 'Sales - AI Assistant', path: '/sales/ai-assistant', code: 'SAL-AI', group: 'Sales', note: 'Sales AI assistant' },
  { label: 'Sales - Analytics', path: '/sales/analytics', code: 'SAL-ANA', group: 'Sales', note: 'Sales analytics' },
  { label: 'Sales - Client Chat', path: '/sales/client-chat', code: 'SAL-CHT', group: 'Sales', note: 'Client chat' },
  { label: 'Sales - CRM', path: '/sales/crm', code: 'SAL-CRM', group: 'Sales', note: 'CRM routing' },
  { label: 'Sales - Customers', path: '/sales/customers', code: 'SAL-CUS', group: 'Sales', note: 'Customer records' },
  { label: 'Accounts - Invoices', path: '/sales/invoices', code: 'ACC-INV', group: 'Sales', note: 'Invoice and bills' },
  { label: 'Sales - Leads', path: '/sales/leads', code: 'SAL-LED', group: 'Sales', note: 'Lead management' },
  { label: 'Sales - Marketing', path: '/sales/marketing', code: 'SAL-MKT', group: 'Sales', note: 'Marketing workflows' },

  { label: 'Reports - AI Insights', path: '/reports/ai-insights', code: 'RPT-AIN', group: 'Reports', note: 'AI insights' },
  { label: 'Reports - Attendance', path: '/reports/attendance', code: 'RPT-ATT', group: 'Reports', note: 'Attendance reporting' },
  { label: 'Reports - Charts', path: '/reports/charts', code: 'RPT-CHT', group: 'Reports', note: 'Charts dashboard' },
  { label: 'Reports - Data Visualization', path: '/reports/data-visualization', code: 'RPT-DVZ', group: 'Reports', note: 'Data visualization' },
  { label: 'Reports - Employees', path: '/reports/employees', code: 'RPT-EMP', group: 'Reports', note: 'Employee reporting' },
  { label: 'Reports - Excel', path: '/reports/excel', code: 'RPT-XLS', group: 'Reports', note: 'Excel reports' },
  { label: 'Reports - Export', path: '/reports/export', code: 'RPT-EXP', group: 'Reports', note: 'Export center' },
  { label: 'Reports - Forecasting', path: '/reports/forecasting', code: 'RPT-FRC', group: 'Reports', note: 'Forecasting' },
  { label: 'Reports - Overtime', path: '/reports/overtime', code: 'RPT-OT', group: 'Reports', note: 'Overtime reporting' },
  { label: 'Reports - PDF', path: '/reports/pdf', code: 'RPT-PDF', group: 'Reports', note: 'PDF reports' },
  { label: 'Reports - Print Center', path: '/reports/print-center', code: 'RPT-PRN', group: 'Reports', note: 'Print center' },
  { label: 'Reports - Salary', path: '/reports/salary', code: 'RPT-SAL', group: 'Reports', note: 'Salary reports' },
  { label: 'Reports - Smart Reports', path: '/reports/smart-reports', code: 'RPT-SMT', group: 'Reports', note: 'Smart reports' },

  { label: 'Security - Access Control', path: '/security/access-control', code: 'SEC-LOG', group: 'Security', note: 'Access control log' },
  { label: 'Security - Alerts', path: '/security/alerts', code: 'SEC-ALR', group: 'Security', note: 'Security alerts' },
  { label: 'Security - API Keys', path: '/security/api-keys', code: 'SEC-KEY', group: 'Security', note: 'API key management' },
  { label: 'Security - Audit Logs', path: '/security/audit-logs', code: 'SEC-AUD', group: 'Security', note: 'Audit log center' },
  { label: 'Security - Biometric', path: '/security/biometric', code: 'SEC-BIO', group: 'Security', note: 'Biometric security' },
  { label: 'Security - IP Restrictions', path: '/security/ip-restrictions', code: 'SEC-IPR', group: 'Security', note: 'IP restrictions' },
  { label: 'Security - Threat Detection', path: '/security/threat-detection', code: 'SEC-THR', group: 'Security', note: 'Threat detection' },
  { label: 'Security - User Roles', path: '/security/user-roles', code: 'SEC-ROL', group: 'Security', note: 'Role-based access' },

  { label: 'Settings - API Integration', path: '/settings/api-integration', code: 'SET-API', group: 'Settings', note: 'API integration' },
  { label: 'Settings - Attendance Rules', path: '/settings/attendance-rules', code: 'SET-ATT', group: 'Settings', note: 'Attendance rules' },
  { label: 'Settings - Cloud Backup', path: '/settings/cloud-backup', code: 'SET-BKP', group: 'Settings', note: 'Cloud backup' },
  { label: 'Settings - Company', path: '/settings/company', code: 'SET-COMP', group: 'Settings', note: 'Company settings' },
  { label: 'Settings - Currency', path: '/settings/currency', code: 'SET-CUR', group: 'Settings', note: 'Currency settings' },
  { label: 'Settings - Dark Mode', path: '/settings/dark-mode', code: 'SET-DARK', group: 'Settings', note: 'Dark mode' },
  { label: 'Settings - ERP Connectors', path: '/settings/erp-connectors', code: 'SET-CONN', group: 'Settings', note: 'Connector configuration' },
  { label: 'Settings - Holidays', path: '/settings/holidays', code: 'SET-HOL', group: 'Settings', note: 'Holiday management' },
  { label: 'Settings - Language', path: '/settings/language', code: 'SET-LNG', group: 'Settings', note: 'Language settings' },
  { label: 'Settings - Mobile Sync', path: '/settings/mobile-sync', code: 'SET-SYNC', group: 'Settings', note: 'Mobile sync' },
  { label: 'Settings - OT Rules', path: '/settings/ot-rules', code: 'SET-OT', group: 'Settings', note: 'OT rules' },
  { label: 'Settings - Payroll Rules', path: '/settings/payroll-rules', code: 'SET-PRL', group: 'Settings', note: 'Payroll rules' },
  { label: 'Settings - Quality Control', path: '/settings/quality-control', code: 'SET-QC', group: 'Settings', note: 'Quality control' },
  { label: 'Settings - Theme', path: '/settings/theme', code: 'SET-THEME', group: 'Settings', note: 'Theme settings' },
  { label: 'Settings - Main', path: '/settings', code: 'SET-MAIN', group: 'Settings', note: 'Settings home' },

  { label: 'Production - Equipment Status', path: '/production/equipment-status', code: 'PRD-EQP', group: 'Production', note: 'Equipment status' },
  { label: 'Production - KPI', path: '/production/kpi', code: 'PRD-KPI', group: 'Production', note: 'Production KPI' },
  { label: 'Production - Line Management', path: '/production/line-management', code: 'PRD-LNE', group: 'Production', note: 'Line management' },
  { label: 'Production - Machine Monitoring', path: '/production/machine-monitoring', code: 'PRD-MCH', group: 'Production', note: 'Machine monitoring' },
  { label: 'Production - Maintenance', path: '/production/maintenance', code: 'PRD-MNT', group: 'Production', note: 'Maintenance workflow' },
  { label: 'Production - Main', path: '/production', code: 'PRD-MAIN', group: 'Production', note: 'Production home' },
  { label: 'Production - Planning', path: '/production/planning', code: 'PRD-PLN', group: 'Production', note: 'Production planning' },
  { label: 'Production - Raw Materials', path: '/production/raw-materials', code: 'PRD-RAW', group: 'Production', note: 'Raw materials' },
  { label: 'Production - Waste Analysis', path: '/production/waste-analysis', code: 'PRD-WST', group: 'Production', note: 'Waste analysis' },

  { label: 'Next-Gen - AI Document Understanding', path: '/next-gen/ai-document-understanding', code: 'AI-DOC', group: 'Next-Gen', note: 'Document AI' },
  { label: 'Next-Gen - AI Voice ERP', path: '/next-gen/ai-voice-erp', code: 'AI-ERP', group: 'Next-Gen', note: 'AI voice routing' },
  { label: 'Next-Gen - AI Workflow Automation', path: '/next-gen/ai-workflow-automation', code: 'AI-WFA', group: 'Next-Gen', note: 'Workflow automation' },
  { label: 'Next-Gen - AR VR Dashboard', path: '/next-gen/ar-vr-dashboard', code: 'AI-ARV', group: 'Next-Gen', note: 'AR/VR dashboard' },
  { label: 'Next-Gen - Auto Decision Engine', path: '/next-gen/auto-decision-engine', code: 'AI-DEC', group: 'Next-Gen', note: 'Decision engine' },
  { label: 'Next-Gen - Autonomous AI Agent', path: '/next-gen/autonomous-ai-agent', code: 'AI-AGT', group: 'Next-Gen', note: 'Autonomous agent' },
  { label: 'Next-Gen - Live IoT Devices', path: '/next-gen/live-iot-devices', code: 'AI-IOT', group: 'Next-Gen', note: 'IoT monitoring' },
  { label: 'Next-Gen - Predictive Analytics', path: '/next-gen/predictive-analytics', code: 'AI-PRD', group: 'Next-Gen', note: 'Predictive analytics' },
  { label: 'Next-Gen - Remote Factory Control', path: '/next-gen/remote-factory-control', code: 'AI-RFC', group: 'Next-Gen', note: 'Remote factory control' },

  { label: 'AI - Analytics', path: '/ai/analytics', code: 'AI-ANL', group: 'AI', note: 'AI analytics' },
  { label: 'AI - Assistant', path: '/ai/assistant', code: 'AI-ASS', group: 'AI', note: 'AI assistant' },
  { label: 'AI - Attendance', path: '/ai/attendance', code: 'AI-ATT', group: 'AI', note: 'AI attendance' },
  { label: 'AI - Chat', path: '/ai/chat', code: 'AI-CHT', group: 'AI', note: 'AI chat' },
  { label: 'AI - Cost Management', path: '/ai/cost-management', code: 'AI-CST', group: 'AI', note: 'Cost management AI' },
  { label: 'AI - Driven Medical Imaging Intelligence', path: '/ai/driven-medical-imaging-intelligence', code: 'AI-MED', group: 'AI', note: 'Medical imaging AI' },
  { label: 'AI - ePrescription', path: '/ai/ePrescription', code: 'AI-RX', group: 'AI', note: 'ePrescription AI' },
  { label: 'AI - Multi Language', path: '/ai/multi-language', code: 'AI-MTL', group: 'AI', note: 'Multi-language AI' },
  { label: 'AI - Payroll', path: '/ai/payroll', code: 'AI-PRL', group: 'AI', note: 'AI payroll' },
  { label: 'AI - Pharmacy Smart Hub', path: '/ai/pharmacy/smart-hub', code: 'AI-PHM', group: 'AI', note: 'Pharmacy smart hub' },
  { label: 'AI - Prediction', path: '/ai/prediction', code: 'AI-PRT', group: 'AI', note: 'Prediction engine' },
  { label: 'AI - Report Generator', path: '/ai/report-generator', code: 'AI-RPG', group: 'AI', note: 'Report generator' },
  { label: 'AI - Restaurant', path: '/ai/restaurant', code: 'AI-RES', group: 'AI', note: 'Restaurant AI' },
  { label: 'AI - Revenue Orchestrator', path: '/ai/revenue-orchestrator', code: 'AI-RVN', group: 'AI', note: 'Revenue orchestration' },
  { label: 'AI - Search', path: '/ai/search', code: 'AI-SRH', group: 'AI', note: 'AI search' },
  { label: 'AI - Voice Command', path: '/ai/voice-command', code: 'AI-VCM', group: 'AI', note: 'Voice commands' },

  { label: 'AI Search - Global', path: '/ai-search/global', code: 'AIS-GLB', group: 'AI Search', note: 'Global search' },
  { label: 'AI Search - History', path: '/ai-search/history', code: 'AIS-HIS', group: 'AI Search', note: 'Search history' },
  { label: 'AI Search - Results', path: '/ai-search/results', code: 'AIS-RES', group: 'AI Search', note: 'Search results' },
  { label: 'AI Search - Suggestions', path: '/ai-search/suggestions', code: 'AIS-SUG', group: 'AI Search', note: 'Search suggestions' },
  { label: 'AI Search - Voice', path: '/ai-search/voice', code: 'AIS-VOI', group: 'AI Search', note: 'Voice search' },

  { label: 'Communication - AWM SMS', path: '/communication/awm-sms', code: 'COM-SMS', group: 'Communication', note: 'SMS communication hub' },
  { label: 'Community - AWM Social', path: '/community/awm-social', code: 'COM-SOC', group: 'Community', note: 'Social community hub' },

  { label: 'Support - Activity Logs', path: '/support/activity-logs', code: 'SUP-ACT', group: 'Support', note: 'Activity logs' },
  { label: 'Support - Contact', path: '/support/contact', code: 'SUP-CON', group: 'Support', note: 'Contact center' },
  { label: 'Support - Help Center', path: '/support/help-center', code: 'SUP-HLP', group: 'Support', note: 'Help center' },
  { label: 'Support - Notifications', path: '/support/notifications', code: 'SUP-NOT', group: 'Support', note: 'Support notifications' },

  { label: 'Staff Advance Sheet', path: '/staff-advance-sheet', code: 'STF-ADV', group: 'Staff', note: 'Advance sheet' },
  { label: 'Staff Advancement - Count', path: '/staff-advancement/count', code: 'STF-CNT', group: 'Staff', note: 'Advancement count' },
  { label: 'Staff Advancement - Logs', path: '/staff-advancement/logs', code: 'STF-LGS', group: 'Staff', note: 'Advancement logs' },
  { label: 'Staff Advancement Logs', path: '/staff-advancement-logs', code: 'STF-ALG', group: 'Staff', note: 'Staff logs' },

  { label: 'Zakat Management', path: '/zakat-management', code: 'ZKT-MGT', group: 'Finance', note: 'Zakat workflows' },

  { label: 'Home', path: '/', code: 'ROOT-HME', group: 'Root', note: 'Application root' },
  { label: 'Login', path: '/login', code: 'AUTH-LGN', group: 'Auth', note: 'Login page' },
  { label: 'Register', path: '/auth/register', code: 'AUTH-RGS', group: 'Auth', note: 'Register page' },
  { label: 'Forgot Password', path: '/auth/forgot-password', code: 'AUTH-FPW', group: 'Auth', note: 'Reset password' },
  { label: 'OTP Verification', path: '/auth/otp-verification', code: 'AUTH-OTP', group: 'Auth', note: 'OTP verification' },
] as const;

type RouteOption = (typeof ALL_PAGE_LINKS)[number];
type TargetRoutePath = RouteOption['path'];
type TargetRouteCode = RouteOption['code'];

type SharedStateKey = keyof SharedEnterpriseState;

function ToggleButton({
  enabled,
  onClick,
  activeClass = 'bg-blue-600',
  size = 'sm',
  label,
  disabled = false,
}: {
  enabled: boolean;
  onClick: () => void;
  activeClass?: string;
  size?: 'sm' | 'md';
  label: string;
  disabled?: boolean;
}) {
  const widthClass = size === 'md' ? 'w-12' : 'w-11';
  const knobClass = size === 'md' ? (enabled ? 'translate-x-7' : 'translate-x-1') : enabled ? 'translate-x-6' : 'translate-x-1';

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onClick}
      disabled={disabled}
      className={`${widthClass} h-6 rounded-full transition relative ${enabled ? activeClass : 'bg-slate-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${knobClass}`} />
    </button>
  );
}

function MetricCardView({ card }: { card: MetricCard }) {
  const Icon = card.icon;

  return (
    <div className={`border rounded-xl p-5 ${card.cardClass ?? 'bg-slate-50'} ${card.spanClass ?? ''}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-sm text-slate-800">{card.title}</h4>
        <Icon className="h-5 w-5 text-slate-600" />
      </div>

      <p className={`text-3xl font-extrabold text-slate-900 mt-4 ${card.valueClass ?? ''}`}>{card.value}</p>

      <p className="text-xs text-slate-500 mt-2">{card.description}</p>
    </div>
  );
}

function MetricSectionView({ section }: { section: MetricSection }) {
  const Icon = section.icon;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${section.iconClass}`} />
        {section.title}
      </h3>

      <div className={section.gridClass ?? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'}>
        {section.cards.map((card) => (
          <MetricCardView key={`${section.title}-${card.title}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-300">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-xs text-slate-500 mt-1">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function currentPathnameMatches(pathname: string | null, routePath: string): boolean {
  if (!pathname) return false;
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `awm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTimeLocale(locale: Locale, value: string | Date): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-GB',
    bn: 'bn-BD',
    ar: 'ar-EG',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);
}

async function fetchJsonWithTimeout(url: string, payload: unknown, timeoutMs = 4000): Promise<{ ok: boolean; status: number; data?: unknown; error?: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AWM-ERP-Client': 'UniversalSettings',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'same-origin',
    });

    const text = await response.text();
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, error };
  } finally {
    clearTimeout(timeout);
  }
}

const DEFAULT_SHARED_STATE: SharedEnterpriseState = {
  locale: 'en',
  role: 'SUPER_ADMIN',
  globalLockdown: false,
  zeroTrust: false,
  emergencyLock: false,
  autoRoute: true,
  autoSave: true,
  hpPrinterName: 'HP Connected Printer',
  showThumbnails: true,
  lastAction: 'System ready. No action executed yet.',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_COMPLIANCE_LOGS: ComplianceLogEntry[] = [];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [locale, setLocale] = useState<Locale>('en');
  const [currentUserRole, setCurrentUserRole] = useState<Role>('SUPER_ADMIN');

  const [notifications, setNotifications] = useState<NotificationsState>({
    email: true,
    sms: false,
    whatsapp: true,
  });

  const [multiBranchEnabled, setMultiBranchEnabled] = useState(true);
  const [systemEmergencyLock, setSystemEmergencyLock] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const [globalLockdownLoading, setGlobalLockdownLoading] = useState(false);
  const [globalLockdownActive, setGlobalLockdownActive] = useState(false);
  const [zeroTrustActive, setZeroTrustActive] = useState(false);

  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [apiMonitoringEnabled, setApiMonitoringEnabled] = useState(true);
  const [disasterRecoveryEnabled, setDisasterRecoveryEnabled] = useState(true);

  const [autoRoute, setAutoRoute] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [hpPrinterName, setHpPrinterName] = useState('HP Connected Printer');
  const [showThumbnails, setShowThumbnails] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [lastAction, setLastAction] = useState('System ready. No action executed yet.');
  const [selectedRoutePath, setSelectedRoutePath] = useState<TargetRoutePath>('/dashboard');
  const [selectedRouteCode, setSelectedRouteCode] = useState<TargetRouteCode>('SYS-DB');
  const [complianceLogs, setComplianceLogs] = useState<ComplianceLogEntry[]>(DEFAULT_COMPLIANCE_LOGS);
  const [sharedState, setSharedState] = useState<SharedEnterpriseState>(DEFAULT_SHARED_STATE);
  const [settingsBusy, setSettingsBusy] = useState(false);

  const t = (key: keyof typeof TRANSLATIONS.en): string => TRANSLATIONS[locale][key];

  const canControlCritical = useMemo(
    () => ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(currentUserRole),
    [currentUserRole]
  );

  const selectedRoute = useMemo(
    () => ALL_PAGE_LINKS.find((item) => item.path === selectedRoutePath) ?? ALL_PAGE_LINKS[0],
    [selectedRoutePath]
  );

  const currentMode = useMemo<SystemMode>(() => {
    if (globalLockdownActive) return 'LOCKDOWN';
    if (zeroTrustActive) return 'ZERO_TRUST';
    return 'NORMAL';
  }, [globalLockdownActive, zeroTrustActive]);

  const routeGroups = useMemo(() => {
    const groups = new Map<string, RouteLinkItem[]>();
    for (const route of ALL_PAGE_LINKS) {
      const list = groups.get(route.group) ?? [];
      list.push(route);
      groups.set(route.group, list);
    }
    return Array.from(groups.entries()).map(([group, routes]) => ({ group, routes }));
  }, []);

  const broadcastGlobalState = (nextState?: Partial<SharedEnterpriseState>) => {
    const state: SharedEnterpriseState = {
      ...sharedState,
      locale,
      role: currentUserRole,
      globalLockdown: globalLockdownActive,
      zeroTrust: zeroTrustActive,
      emergencyLock: systemEmergencyLock,
      autoRoute,
      autoSave,
      hpPrinterName,
      showThumbnails,
      lastAction,
      updatedAt: new Date().toISOString(),
      ...nextState,
    };

    setSharedState(state);

    try {
      localStorage.setItem(STORAGE_KEYS.SHARED, JSON.stringify(state));
      localStorage.setItem(STORAGE_KEYS.LOCKDOWN, String(state.globalLockdown));
      localStorage.setItem(STORAGE_KEYS.ZERO_TRUST, String(state.zeroTrust));
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_LOCK, String(state.emergencyLock));
      localStorage.setItem(STORAGE_KEYS.LAST_ACTION, state.lastAction);
      localStorage.setItem(STORAGE_KEYS.ROLE, state.role);
      localStorage.setItem(STORAGE_KEYS.LOCALE, state.locale);
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS_SNAPSHOT,
        JSON.stringify({
          path: selectedRoutePath,
          code: selectedRouteCode,
          selectedAt: state.updatedAt,
          autoRoute: state.autoRoute,
          autoSave: state.autoSave,
          hpPrinterName: state.hpPrinterName,
          showThumbnails: state.showThumbnails,
          role: state.role,
          locale: state.locale,
        })
      );
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('awm-enterprise-state', { detail: state }));
    }
  };

  const appendComplianceLog = async (
    entry: Omit<ComplianceLogEntry, 'id' | 'timestamp'> & { timestamp?: string; id?: string }
  ) => {
    const logEntry: ComplianceLogEntry = {
      id: entry.id ?? createId(),
      timestamp: entry.timestamp ?? new Date().toISOString(),
      action: entry.action,
      status: entry.status,
      role: entry.role,
      locale: entry.locale,
      route: entry.route,
      message: entry.message,
      endpoint: entry.endpoint,
      payload: entry.payload,
    };

    setComplianceLogs((prev) => {
      const next = [logEntry, ...prev].slice(0, 250);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLIANCE_LOGS, JSON.stringify(next));
      } catch {}
      return next;
    });

    const logPayload = {
      ...logEntry,
      pathname,
      sharedState: {
        locale,
        role: currentUserRole,
        globalLockdown: globalLockdownActive,
        zeroTrust: zeroTrustActive,
        emergencyLock: systemEmergencyLock,
      },
    };

    const endpoints = ['/api/compliance/logs', '/api/audit/logs', '/api/enterprise/compliance'];
    for (const endpoint of endpoints) {
      await fetchJsonWithTimeout(endpoint, logPayload).catch(() => null);
    }
  };

  const setCriticalState = async (
    next: Partial<{ lockdown: boolean; zeroTrust: boolean; emergency: boolean }>,
    message: string,
    status: ComplianceStatus = 'SUCCESS',
    endpoint?: string,
    payload?: Record<string, unknown>
  ) => {
    if (typeof next.lockdown === 'boolean') setGlobalLockdownActive(next.lockdown);
    if (typeof next.zeroTrust === 'boolean') setZeroTrustActive(next.zeroTrust);
    if (typeof next.emergency === 'boolean') setSystemEmergencyLock(next.emergency);
    setLastAction(message);
    broadcastGlobalState();

    await appendComplianceLog({
      action: endpoint ?? message,
      status,
      role: currentUserRole,
      locale,
      route: pathname ?? '/',
      message,
      endpoint,
      payload,
    });
  };

  useEffect(() => {
    try {
      const savedShared = localStorage.getItem(STORAGE_KEYS.SHARED);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.COMPLIANCE_LOGS);

      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      const savedLocale = localStorage.getItem(STORAGE_KEYS.LOCALE);

      if (savedShared) {
        const parsed = JSON.parse(savedShared) as Partial<SharedEnterpriseState>;
        if (parsed.locale && localeOptions.includes(parsed.locale)) setLocale(parsed.locale);
        if (parsed.role && roleOptions.includes(parsed.role)) setCurrentUserRole(parsed.role);
        if (typeof parsed.globalLockdown === 'boolean') setGlobalLockdownActive(parsed.globalLockdown);
        if (typeof parsed.zeroTrust === 'boolean') setZeroTrustActive(parsed.zeroTrust);
        if (typeof parsed.emergencyLock === 'boolean') setSystemEmergencyLock(parsed.emergencyLock);
        if (typeof parsed.autoRoute === 'boolean') setAutoRoute(parsed.autoRoute);
        if (typeof parsed.autoSave === 'boolean') setAutoSave(parsed.autoSave);
        if (typeof parsed.hpPrinterName === 'string') setHpPrinterName(parsed.hpPrinterName);
        if (typeof parsed.showThumbnails === 'boolean') setShowThumbnails(parsed.showThumbnails);
        if (typeof parsed.lastAction === 'string') setLastAction(parsed.lastAction);
        setSharedState((prev) => ({ ...prev, ...parsed } as SharedEnterpriseState));
      } else {
        if (savedLocale && localeOptions.includes(savedLocale as Locale)) setLocale(savedLocale as Locale);
        if (savedRole && roleOptions.includes(savedRole as Role)) setCurrentUserRole(savedRole as Role);
      }

      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs) as ComplianceLogEntry[];
        if (Array.isArray(parsedLogs)) setComplianceLogs(parsedLogs);
      }

      const snapshot = localStorage.getItem(STORAGE_KEYS.SETTINGS_SNAPSHOT);
      if (snapshot) {
        const parsed = JSON.parse(snapshot) as { path?: TargetRoutePath; code?: TargetRouteCode };
        if (parsed.path) setSelectedRoutePath(parsed.path);
        if (parsed.code) setSelectedRouteCode(parsed.code);
      }
    } catch {}

    const syncFromStorage = () => {
      try {
        const savedShared = localStorage.getItem(STORAGE_KEYS.SHARED);
        if (savedShared) {
          const parsed = JSON.parse(savedShared) as Partial<SharedEnterpriseState>;
          if (parsed.locale && localeOptions.includes(parsed.locale)) setLocale(parsed.locale);
          if (parsed.role && roleOptions.includes(parsed.role)) setCurrentUserRole(parsed.role);
          if (typeof parsed.globalLockdown === 'boolean') setGlobalLockdownActive(parsed.globalLockdown);
          if (typeof parsed.zeroTrust === 'boolean') setZeroTrustActive(parsed.zeroTrust);
          if (typeof parsed.emergencyLock === 'boolean') setSystemEmergencyLock(parsed.emergencyLock);
          if (typeof parsed.autoRoute === 'boolean') setAutoRoute(parsed.autoRoute);
          if (typeof parsed.autoSave === 'boolean') setAutoSave(parsed.autoSave);
          if (typeof parsed.hpPrinterName === 'string') setHpPrinterName(parsed.hpPrinterName);
          if (typeof parsed.showThumbnails === 'boolean') setShowThumbnails(parsed.showThumbnails);
          if (typeof parsed.lastAction === 'string') setLastAction(parsed.lastAction);
        }
      } catch {}
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEYS.SHARED ||
        event.key === STORAGE_KEYS.LOCKDOWN ||
        event.key === STORAGE_KEYS.ZERO_TRUST ||
        event.key === STORAGE_KEYS.EMERGENCY_LOCK ||
        event.key === STORAGE_KEYS.LAST_ACTION
      ) {
        syncFromStorage();
      }
    };

    const onCustom = () => syncFromStorage();

    window.addEventListener('storage', onStorage);
    window.addEventListener('awm-enterprise-state', onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('awm-enterprise-state', onCustom as EventListener);
    };
  }, []);

  useEffect(() => {
    const docLang = locale === 'ar' ? 'ar' : locale === 'bn' ? 'bn' : 'en';
    document.documentElement.lang = docLang;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.globalLockdown = String(globalLockdownActive);
    document.documentElement.dataset.zeroTrust = String(zeroTrustActive);
    document.documentElement.dataset.emergencyLock = String(systemEmergencyLock);

    if (globalLockdownActive) {
      document.body.classList.add('awm-global-lockdown-active');
    } else {
      document.body.classList.remove('awm-global-lockdown-active');
    }

    if (zeroTrustActive) {
      document.body.classList.add('awm-zero-trust-active');
    } else {
      document.body.classList.remove('awm-zero-trust-active');
    }
  }, [globalLockdownActive, zeroTrustActive, systemEmergencyLock]);

  useEffect(() => {
    broadcastGlobalState();
  }, [locale, currentUserRole, globalLockdownActive, zeroTrustActive, systemEmergencyLock, autoRoute, autoSave, hpPrinterName, showThumbnails, lastAction]);

  const updateLocale = (next: Locale) => {
    setLocale(next);
    setLastAction(`Locale switched to ${next.toUpperCase()}`);
  };

  const updateRole = (next: Role) => {
    setCurrentUserRole(next);
    setLastAction(`Role changed to ${next}`);
  };

  const handleEnterpriseAction = async (action: string, critical = false) => {
    const safeRoute = pathname ?? '/';
    const status: ComplianceStatus = critical && !canControlCritical ? 'DENIED' : 'SUCCESS';

    if (critical && !canControlCritical) {
      const message = locale === 'ar'
        ? 'تم رفض الإذن: يتطلب هذا الإجراء صلاحيات عليا.'
        : locale === 'bn'
          ? 'অনুমতি নেই: এই অ্যাকশনটির জন্য উচ্চতর অনুমোদন প্রয়োজন।'
          : 'Permission denied: This action requires elevated access.';
      setLastAction(message);
      await appendComplianceLog({
        action,
        status,
        role: currentUserRole,
        locale,
        route: safeRoute,
        message,
        endpoint: '/api/enterprise/actions',
        payload: { action, critical, role: currentUserRole, locale: safeRoute },
      });
      return;
    }

    const payload = {
      action,
      role: currentUserRole,
      locale,
      route: safeRoute,
      sharedState: {
        globalLockdown: globalLockdownActive,
        zeroTrust: zeroTrustActive,
        emergencyLock: systemEmergencyLock,
      },
    };

    const apiResult = await fetchJsonWithTimeout('/api/enterprise/actions', payload).catch(() => ({ ok: false, status: 0 }));
    const message = apiResult.ok
      ? `Executed enterprise action: ${action}`
      : `Executed locally: ${action}`;

    setLastAction(message);
    await appendComplianceLog({
      action,
      status: apiResult.ok ? 'SUCCESS' : 'FAILED',
      role: currentUserRole,
      locale,
      route: safeRoute,
      message,
      endpoint: '/api/enterprise/actions',
      payload,
    });
  };

  const handleSaveAllConfigurations = async () => {
    try {
      setIsSaving(true);
      setSettingsBusy(true);
      const payload = {
        sharedState: {
          locale,
          role: currentUserRole,
          globalLockdown: globalLockdownActive,
          zeroTrust: zeroTrustActive,
          emergencyLock: systemEmergencyLock,
          autoRoute,
          autoSave,
          hpPrinterName,
          showThumbnails,
          notifications,
          multiBranchEnabled,
          twoFactorAuth,
          cloudSyncEnabled,
          apiMonitoringEnabled,
          disasterRecoveryEnabled,
          selectedRoutePath,
          selectedRouteCode,
        },
        pathname,
      };

      const apiResult = await fetchJsonWithTimeout('/api/settings/save', payload);
      await appendComplianceLog({
        action: 'SAVE_ALL_CONFIGURATIONS',
        status: apiResult.ok ? 'SUCCESS' : 'FAILED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message: apiResult.ok ? 'All configurations saved successfully.' : 'Configuration save failed; local fallback applied.',
        endpoint: '/api/settings/save',
        payload,
      });

      setLastAction(apiResult.ok ? 'All configurations saved successfully.' : 'All configurations saved locally.');
    } catch {
      setLastAction('Configuration save failed.');
      await appendComplianceLog({
        action: 'SAVE_ALL_CONFIGURATIONS',
        status: 'FAILED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message: 'Configuration save failed.',
        endpoint: '/api/settings/save',
      });
    } finally {
      setIsSaving(false);
      setSettingsBusy(false);
    }
  };

  const handleGlobalLockdown = async () => {
    if (!canControlCritical) {
      const message = locale === 'ar'
        ? 'يتطلب الإغلاق العالمي صلاحيات SUPER_ADMIN أو GLOBAL_ADMIN.'
        : locale === 'bn'
          ? 'গ্লোবাল লকডাউনের জন্য SUPER_ADMIN বা GLOBAL_ADMIN প্রয়োজন।'
          : 'Global Lockdown requires SUPER_ADMIN or GLOBAL_ADMIN.';
      setLastAction(message);
      await appendComplianceLog({
        action: 'GLOBAL_LOCKDOWN',
        status: 'DENIED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message,
        endpoint: '/api/security/global-lockdown',
      });
      return;
    }

    try {
      setGlobalLockdownLoading(true);
      setLastAction('Activating Global Lockdown...');
      const payload = {
        enabled: true,
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        sharedState: sharedState,
      };

      const apiResult = await fetchJsonWithTimeout('/api/security/global-lockdown', payload, 6000);
      await setCriticalState(
        { lockdown: true, emergency: true },
        apiResult.ok ? '🚨 GLOBAL LOCKDOWN ACTIVATED' : '🚨 GLOBAL LOCKDOWN ACTIVATED LOCALLY',
        apiResult.ok ? 'SUCCESS' : 'FAILED',
        '/api/security/global-lockdown',
        payload
      );
    } catch {
      setLastAction('Global Lockdown failed.');
      await appendComplianceLog({
        action: 'GLOBAL_LOCKDOWN',
        status: 'FAILED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message: 'Global Lockdown failed.',
        endpoint: '/api/security/global-lockdown',
      });
    } finally {
      setGlobalLockdownLoading(false);
    }
  };

  const handleDeactivateGlobalLockdown = async () => {
    if (!canControlCritical) {
      const message = locale === 'ar'
        ? 'لا يمكن إلغاء الإغلاق العالمي.'
        : locale === 'bn'
          ? 'গ্লোবাল লকডাউন বন্ধ করার অনুমতি নেই।'
          : 'Permission denied: Cannot deactivate Global Lockdown.';
      setLastAction(message);
      await appendComplianceLog({
        action: 'GLOBAL_LOCKDOWN_OFF',
        status: 'DENIED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message,
        endpoint: '/api/security/global-lockdown',
      });
      return;
    }

    const payload = { enabled: false, role: currentUserRole, locale, route: pathname ?? '/' };
    const apiResult = await fetchJsonWithTimeout('/api/security/global-lockdown', payload);
    await setCriticalState(
      { lockdown: false, emergency: false },
      apiResult.ok ? 'Global Lockdown deactivated.' : 'Global Lockdown deactivated locally.',
      apiResult.ok ? 'SUCCESS' : 'FAILED',
      '/api/security/global-lockdown',
      payload
    );
  };

  const handleZeroTrustMode = async () => {
    if (!canControlCritical) {
      const message = locale === 'ar'
        ? 'وضع الثقة الصفرية يتطلب صلاحيات عليا.'
        : locale === 'bn'
          ? 'জিরো ট্রাস্ট মোড চালু করতে উচ্চতর অনুমোদন প্রয়োজন।'
          : 'Zero Trust Mode requires elevated access.';
      setLastAction(message);
      await appendComplianceLog({
        action: 'ZERO_TRUST_ON',
        status: 'DENIED',
        role: currentUserRole,
        locale,
        route: pathname ?? '/',
        message,
        endpoint: '/api/security/zero-trust',
      });
      return;
    }

    const payload = {
      enabled: true,
      role: currentUserRole,
      locale,
      route: pathname ?? '/',
      sharedState,
    };
    const apiResult = await fetchJsonWithTimeout('/api/security/zero-trust', payload);
    await setCriticalState(
      { zeroTrust: true, emergency: true },
      apiResult.ok ? '✅ ZERO TRUST MODE ACTIVATED' : '✅ ZERO TRUST MODE ACTIVATED LOCALLY',
      apiResult.ok ? 'SUCCESS' : 'FAILED',
      '/api/security/zero-trust',
      payload
    );
  };

  const handleZeroTrustOff = async () => {
    const payload = { enabled: false, role: currentUserRole, locale, route: pathname ?? '/' };
    const apiResult = await fetchJsonWithTimeout('/api/security/zero-trust', payload);
    await setCriticalState(
      { zeroTrust: false },
      apiResult.ok ? 'Zero Trust Mode disabled.' : 'Zero Trust Mode disabled locally.',
      apiResult.ok ? 'SUCCESS' : 'FAILED',
      '/api/security/zero-trust',
      payload
    );
  };

  const handleRouteSelect = (path: TargetRoutePath) => {
    const found = ALL_PAGE_LINKS.find((item) => item.path === path);
    if (!found) return;
    setSelectedRoutePath(found.path);
    setSelectedRouteCode(found.code);
    setLastAction(`Selected route: ${found.label} (${found.path})`);
    broadcastGlobalState();
  };

  const exportLogs = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            locale,
            role: currentUserRole,
            sharedState,
            complianceLogs,
            route: pathname,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awm-erp-compliance-logs-${currentUserRole}-${locale}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const clearLogs = async () => {
    setComplianceLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPLIANCE_LOGS);
    } catch {}
    setLastAction('Compliance logs cleared.');
    await appendComplianceLog({
      action: 'CLEAR_LOGS',
      status: 'SUCCESS',
      role: currentUserRole,
      locale,
      route: pathname ?? '/',
      message: 'Compliance logs cleared.',
      endpoint: '/api/compliance/logs/clear',
    });
  };

  const actions: ActionItem[] = useMemo(
    () => [
      { title: 'Global AI Shutdown', button: 'Initiate AI Emergency Shutdown', color: 'bg-black hover:bg-slate-900', action: 'AI_SHUTDOWN', card: 'bg-slate-50' },
      { title: 'Global Data Sync', button: 'Force Global Data Sync', color: 'bg-cyan-600 hover:bg-cyan-700', action: 'GLOBAL_SYNC', card: 'bg-cyan-50' },
      { title: 'Enterprise Backup', button: 'Execute Full Backup', color: 'bg-emerald-600 hover:bg-emerald-700', action: 'FULL_BACKUP', card: 'bg-emerald-50' },
      { title: 'Security Scan', button: 'Run Global Security Scan', color: 'bg-blue-600 hover:bg-blue-700', action: 'SECURITY_SCAN', card: 'bg-blue-50' },
      { title: 'Zero Trust Security', button: 'Activate Zero Trust Mode', color: 'bg-indigo-600 hover:bg-indigo-700', action: 'ZERO_TRUST', card: 'bg-indigo-50', critical: true },
      { title: 'Disaster Recovery', button: 'Start Recovery Mode', color: 'bg-rose-600 hover:bg-rose-700', action: 'DISASTER_RECOVERY', card: 'bg-rose-50' },
      { title: 'User Access Freeze', button: 'Freeze All User Access', color: 'bg-amber-600 hover:bg-amber-700', action: 'FREEZE_ACCESS', card: 'bg-amber-50', critical: true },
      { title: 'AI Decision Reset', button: 'Reset AI Decision Engine', color: 'bg-violet-600 hover:bg-violet-700', action: 'AI_RESET', card: 'bg-violet-50' },
      { title: 'Cache Rebuild', button: 'Rebuild Infrastructure Cache', color: 'bg-slate-700 hover:bg-slate-800', action: 'CACHE_REBUILD', card: 'bg-slate-100' },
      { title: 'Audit Export', button: 'Export Audit Logs', color: 'bg-orange-600 hover:bg-orange-700', action: 'EXPORT_AUDIT', card: 'bg-orange-50' },
      { title: 'Branch Sync Reset', button: 'Reset Branch Synchronization', color: 'bg-teal-600 hover:bg-teal-700', action: 'BRANCH_SYNC_RESET', card: 'bg-teal-50' },
      { title: 'AI Monitoring', button: 'Restart AI Monitoring', color: 'bg-pink-600 hover:bg-pink-700', action: 'AI_MONITORING', card: 'bg-pink-50' },
      { title: 'Performance Optimization', button: 'Optimize System Performance', color: 'bg-lime-600 hover:bg-lime-700', action: 'PERFORMANCE_OPTIMIZATION', card: 'bg-lime-50' },
      { title: 'Executive Broadcast', button: 'Send Global Executive Alert', color: 'bg-fuchsia-600 hover:bg-fuchsia-700', action: 'EXECUTIVE_ALERT', card: 'bg-fuchsia-50' },
      { title: 'Infrastructure Restart', button: 'Restart Infrastructure Services', color: 'bg-gray-700 hover:bg-gray-800', action: 'INFRA_RESTART', card: 'bg-gray-100' },
      { title: 'Database Protection', button: 'Lock Enterprise Database', color: 'bg-red-700 hover:bg-red-800', action: 'DATABASE_LOCK', card: 'bg-red-100', critical: true },
      { title: 'Server Health Recovery', button: 'Recover Failed Servers', color: 'bg-green-700 hover:bg-green-800', action: 'SERVER_RECOVERY', card: 'bg-green-100' },
      { title: 'AI Infrastructure Boost', button: 'Boost AI Infrastructure', color: 'bg-purple-700 hover:bg-purple-800', action: 'AI_BOOST', card: 'bg-purple-100' },
      { title: 'Enterprise Maintenance', button: 'Enable Maintenance Mode', color: 'bg-yellow-600 hover:bg-yellow-700', action: 'MAINTENANCE_MODE', card: 'bg-yellow-100' },
      { title: 'Live Infrastructure Analytics', button: 'Launch Live Analytics', color: 'bg-sky-600 hover:bg-sky-700', action: 'LIVE_ANALYTICS', card: 'bg-sky-100' },
    ],
    []
  );

  const infrastructureSections: MetricSection[] = useMemo(
    () => [
      {
        title: 'Live Infrastructure Status',
        icon: Activity,
        iconClass: 'text-cyan-600',
        gridClass: 'grid grid-cols-1 md:grid-cols-3 gap-4',
        cards: [
          { title: 'CPU Load', value: '42%', description: 'Stable operational state', icon: Cpu, cardClass: 'bg-slate-50' },
          { title: 'Storage Usage', value: '74%', description: '14.8TB / 20TB utilized', icon: HardDrive, cardClass: 'bg-slate-50' },
          { title: 'Network Traffic', value: '1.8Gbps', description: 'Global sync healthy', icon: Network, cardClass: 'bg-slate-50' },
        ],
      },
      {
        title: 'AI-Powered Global Automation',
        icon: CloudLightning,
        iconClass: 'text-violet-600',
        gridClass: 'grid grid-cols-1 md:grid-cols-3 gap-4',
        cards: [
          { title: 'Auto Load Balancing', value: 'ACTIVE', description: 'AI redistributes global traffic load', icon: Activity, cardClass: 'bg-slate-50', valueClass: 'text-emerald-600' },
          { title: 'Smart Failover Recovery', value: 'ENABLED', description: 'Detects outages and switches backup regions', icon: RefreshCcw, cardClass: 'bg-slate-50', valueClass: 'text-emerald-600' },
          { title: 'AI Threat Detection', value: 'PROTECTED', description: 'Real-time anomaly detection across all branches', icon: Shield, cardClass: 'bg-slate-50', valueClass: 'text-emerald-600' },
        ],
      },
      {
        title: 'Global Security & Threat Center',
        icon: ShieldAlert,
        iconClass: 'text-red-600',
        cards: [
          { title: 'Threat Level', value: 'LOW', description: 'No active global attack detected', icon: ShieldAlert, cardClass: 'bg-red-50', valueClass: 'text-red-600' },
          { title: 'Suspicious Logins', value: '3', description: 'AI flagged unusual activities', icon: Eye, cardClass: 'bg-amber-50' },
          { title: 'Zero Trust Security', value: zeroTrustActive ? 'ENABLED' : 'DISABLED', description: 'All branch access verified', icon: Lock, cardClass: 'bg-cyan-50', valueClass: zeroTrustActive ? 'text-emerald-600' : 'text-slate-700' },
          { title: 'Fraud Detection AI', value: 'ACTIVE', description: 'Monitoring transactions worldwide', icon: BrainCircuit, cardClass: 'bg-emerald-50' },
        ],
      },
      {
        title: 'Global AI Command Center',
        icon: Sparkles,
        iconClass: 'text-violet-600',
        cards: [
          { title: 'AI Decision Engine', value: 'ACTIVE', description: 'Autonomous operational intelligence enabled', icon: BrainCircuit, cardClass: 'bg-violet-50' },
          { title: 'Revenue Forecast AI', value: '+18.4%', description: 'Predicted quarterly growth', icon: TrendingUp, cardClass: 'bg-emerald-50' },
          { title: 'Auto Resource Scaling', value: 'ENABLED', description: 'Dynamic infrastructure optimization active', icon: ServerCog, cardClass: 'bg-cyan-50' },
          { title: 'Global AI Score', value: '9.8/10', description: 'Enterprise optimization rating', icon: BadgeCheck, cardClass: 'bg-amber-50' },
        ],
      },
      {
        title: 'Global Governance & Backup Center',
        icon: DatabaseBackup,
        iconClass: 'text-cyan-600',
        cards: [
          { title: 'Global Backup Nodes', value: '24 ACTIVE', description: 'Encrypted backups operational', icon: Archive, cardClass: 'bg-cyan-50' },
          { title: 'Live Replication', value: '0.4s', description: 'Database synchronization latency', icon: RefreshCw, cardClass: 'bg-emerald-50' },
          { title: 'Disaster Recovery', value: 'READY', description: 'Autonomous failover systems enabled', icon: ShieldCheck, cardClass: 'bg-amber-50' },
          { title: 'Data Retention Policy', value: '10 YEARS', description: 'Enterprise retention policy active', icon: Database, cardClass: 'bg-violet-50' },
        ],
      },
      {
        title: 'Predictive Enterprise Intelligence',
        icon: LineChart,
        iconClass: 'text-emerald-600',
        cards: [
          { title: 'Branch Performance', value: '92%', description: 'Global operational efficiency score', icon: BarChart4, cardClass: 'bg-cyan-50' },
          { title: 'Operational Risk', value: 'LOW', description: 'No major infrastructure risk predicted', icon: Shield, cardClass: 'bg-amber-50' },
          { title: 'Decision Engine', value: 'ACTIVE', description: 'AI generating strategic insights', icon: BrainCircuit, cardClass: 'bg-violet-50' },
          { title: 'Target Optimization', value: '97.2%', description: 'KPI targeting accuracy', icon: Target, cardClass: 'bg-emerald-50' },
        ],
      },
      {
        title: 'Enterprise Financial Intelligence',
        icon: Wallet,
        iconClass: 'text-emerald-600',
        cards: [
          { title: 'Global Cashflow', value: '$48.2M', description: 'Consolidated liquidity balance', icon: DollarSign, cardClass: 'bg-emerald-50' },
          { title: 'Tax Automation', value: 'ACTIVE', description: 'VAT and regional tax validation enabled', icon: Receipt, cardClass: 'bg-cyan-50' },
          { title: 'Fraud Monitor', value: 'SECURE', description: 'No suspicious transaction anomalies detected', icon: ShieldBan, cardClass: 'bg-rose-50' },
          { title: 'Smart Forecast AI', value: '+22%', description: 'Predicted annual growth trajectory', icon: BrainCircuit, cardClass: 'bg-violet-50' },
        ],
      },
      {
        title: 'Workforce and Access Intelligence',
        icon: Users,
        iconClass: 'text-blue-600',
        gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
        cards: [
          { title: 'Active Workforce', value: '12,842', description: 'Employees connected across branches', icon: Users, cardClass: 'bg-blue-50' },
          { title: 'Trusted Devices', value: '98.7%', description: 'Verified device authorization rate', icon: Laptop, cardClass: 'bg-emerald-50' },
          { title: 'Workforce AI', value: 'ENABLED', description: 'Predictive workforce analytics active', icon: BrainCircuit, cardClass: 'bg-violet-50' },
        ],
      },
      {
        title: 'Global Data Mesh & Sync Layer',
        icon: Database,
        iconClass: 'text-indigo-600',
        cards: [
          { title: 'Real-Time Data Sync', value: 'ACTIVE', description: 'All branches synchronized in 0.9s latency', icon: RefreshCcw, cardClass: 'bg-indigo-50' },
          { title: 'Distributed Data Mesh', value: '128 NODES', description: 'Decentralized ERP data architecture active', icon: GitBranch, cardClass: 'bg-cyan-50' },
          { title: 'AI Data Routing Engine', value: 'OPTIMIZED', description: 'Smart routing between global ERP clusters', icon: Cpu, cardClass: 'bg-violet-50' },
          { title: 'Cloud Sync Layer', value: 'STABLE', description: 'Multi-region cloud replication healthy', icon: Cloud, cardClass: 'bg-emerald-50' },
          { title: 'Event Stream Engine', value: 'LIVE', description: 'Enterprise event streaming active', icon: Zap, cardClass: 'bg-amber-50' },
          { title: 'Global ERP State Monitor', value: 'SYNCHRONIZED', description: 'All modules unified under global state layer', icon: Globe2, cardClass: 'bg-blue-50', spanClass: 'xl:col-span-2' },
        ],
      },
      {
        title: 'Autonomous ERP Core',
        icon: Cpu,
        iconClass: 'text-indigo-600',
        cards: [
          { title: 'Core AI Brain', value: 'ACTIVE', description: 'Central intelligence controlling ERP system', icon: BrainCircuit, cardClass: 'bg-indigo-50' },
          { title: 'Auto Decision Engine', value: 'AUTONOMOUS', description: 'No human approval required', icon: Bot, cardClass: 'bg-violet-50' },
          { title: 'Self Repair System', value: 'HEALING', description: 'Auto-fixing anomalies in real time', icon: RefreshCcw, cardClass: 'bg-emerald-50' },
          { title: 'Security Shield AI', value: 'MAXIMUM', description: 'Full enterprise threat protection active', icon: ShieldCheck, cardClass: 'bg-red-50' },
          { title: 'System Performance Index', value: '99.999%', description: 'Global ERP operating at peak efficiency', icon: Activity, cardClass: 'bg-blue-50', spanClass: 'xl:col-span-2' },
          { title: 'Autonomous Status', value: 'FULLY AUTONOMOUS', description: 'ERP is self-managed and self-optimized', icon: Cpu, cardClass: 'bg-slate-900 text-white', valueClass: 'text-white', spanClass: 'xl:col-span-2' },
        ],
      },
    ],
    [zeroTrustActive]
  );

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      const savedLocale = localStorage.getItem(STORAGE_KEYS.LOCALE);
      const savedShared = localStorage.getItem(STORAGE_KEYS.SHARED);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.COMPLIANCE_LOGS);

      if (savedLocale && localeOptions.includes(savedLocale as Locale)) setLocale(savedLocale as Locale);
      if (savedRole && roleOptions.includes(savedRole as Role)) setCurrentUserRole(savedRole as Role);

      if (savedShared) {
        const parsed = JSON.parse(savedShared) as Partial<SharedEnterpriseState>;
        if (parsed.locale && localeOptions.includes(parsed.locale)) setLocale(parsed.locale);
        if (parsed.role && roleOptions.includes(parsed.role)) setCurrentUserRole(parsed.role);
        if (typeof parsed.globalLockdown === 'boolean') setGlobalLockdownActive(parsed.globalLockdown);
        if (typeof parsed.zeroTrust === 'boolean') setZeroTrustActive(parsed.zeroTrust);
        if (typeof parsed.emergencyLock === 'boolean') setSystemEmergencyLock(parsed.emergencyLock);
        if (typeof parsed.autoRoute === 'boolean') setAutoRoute(parsed.autoRoute);
        if (typeof parsed.autoSave === 'boolean') setAutoSave(parsed.autoSave);
        if (typeof parsed.hpPrinterName === 'string') setHpPrinterName(parsed.hpPrinterName);
        if (typeof parsed.showThumbnails === 'boolean') setShowThumbnails(parsed.showThumbnails);
        if (typeof parsed.lastAction === 'string') setLastAction(parsed.lastAction);
        setSharedState((prev) => ({ ...prev, ...parsed } as SharedEnterpriseState));
      }

      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs) as ComplianceLogEntry[];
        if (Array.isArray(parsedLogs)) setComplianceLogs(parsedLogs);
      }

      const snapshot = localStorage.getItem(STORAGE_KEYS.SETTINGS_SNAPSHOT);
      if (snapshot) {
        const parsed = JSON.parse(snapshot) as { path?: TargetRoutePath; code?: TargetRouteCode };
        if (parsed.path) setSelectedRoutePath(parsed.path);
        if (parsed.code) setSelectedRouteCode(parsed.code);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusTone =
    currentMode === 'NORMAL'
      ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20'
      : currentMode === 'ZERO_TRUST'
        ? 'bg-sky-500/15 text-sky-200 ring-sky-500/20'
        : 'bg-rose-500/15 text-rose-200 ring-rose-500/20';

  return (
    <main
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      lang={locale}
      className="min-h-screen bg-slate-50 p-6 text-slate-800 md:p-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Current Path: {pathname}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
                Mode: {currentMode}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t('allRoutes')}: {ALL_PAGE_LINKS.length}
              </span>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Critical Buttons: {actions.filter((item) => item.critical).length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAllConfigurations}
            disabled={isSaving || settingsBusy}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving || settingsBusy ? 'Saving...' : t('saveAll')}
          </button>
        </header>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-700">{t('emergencyControlCenter')}</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{t('globalLockdown')} & {t('zeroTrust')}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  These controls are active, persistent, and written to shared enterprise state so the system status can be reflected across all pages.
                </p>
              </div>
              <Siren className="h-6 w-6 text-red-600" />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={handleGlobalLockdown}
                disabled={globalLockdownLoading}
                className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                  globalLockdownActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                } ${globalLockdownLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {globalLockdownLoading ? 'Activating Global Lockdown...' : globalLockdownActive ? 'Global Lockdown Active' : t('activateGlobalLockdown')}
              </button>

              <button
                type="button"
                onClick={handleDeactivateGlobalLockdown}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {t('deactivateGlobalLockdown')}
              </button>

              <button
                type="button"
                onClick={handleZeroTrustMode}
                className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                  zeroTrustActive ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {zeroTrustActive ? 'Zero Trust Mode Active' : t('activateZeroTrust')}
              </button>

              <button
                type="button"
                onClick={handleZeroTrustOff}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {t('disableZeroTrust')}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{t('lastAction')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{lastAction}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{t('integrity')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{ALL_PAGE_LINKS.length > 0 ? t('validated') : t('checkRequired')}</p>
            <p className="mt-1 text-xs text-slate-500">Dropdown, actions, security, and audit controls are present.</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 rounded-xl border bg-slate-100 p-1 md:grid-cols-6">
            <TabsTrigger value="general" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Building2 className="mr-2 h-4 w-4 text-slate-500" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Shield className="mr-2 h-4 w-4 text-slate-500" />
              Security
            </TabsTrigger>
            <TabsTrigger value="financials" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Wallet className="mr-2 h-4 w-4 text-slate-500" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="integration" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Database className="mr-2 h-4 w-4 text-slate-500" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Server className="mr-2 h-4 w-4 text-slate-500" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm md:text-sm">
              <Settings2 className="mr-2 h-4 w-4 text-slate-500" />
              Multi-Branch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
              <SectionTitle
                icon={Globe2}
                title="Target ERP Processing Module"
                subtitle="Select any page in the ERP and route scanned data directly to that destination."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-bold text-slate-600">{t('routeDropdown')}</label>
                  <select
                    value={selectedRoutePath}
                    onChange={(e) => handleRouteSelect(e.target.value as TargetRoutePath)}
                    className="w-full rounded-lg border bg-white p-3 text-sm font-medium"
                  >
                    {ALL_PAGE_LINKS.map((route) => (
                      <option key={`${route.code}-${route.path}`} value={route.path}>
                        {route.label} ({route.code}) — {route.path}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{t('selectedRoute')}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedRoute.label}</p>
                    <p className="text-xs text-amber-700">{selectedRoute.code}</p>
                    <p className="mt-1 text-xs text-slate-500">{selectedRoute.path}</p>
                    <p className="mt-1 text-xs text-slate-500">{selectedRoute.note}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(selectedRoute.path)}
                      className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      {t('openSelectedPage')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnterpriseAction('GLOBAL_SYNC')}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t('syncSelection')}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-2 block text-xs font-bold text-slate-600">{t('routeExplorer')}</label>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {ALL_PAGE_LINKS.map((route) => (
                      <Link
                        key={`${route.code}-${route.path}-link`}
                        href={route.path}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition hover:bg-slate-100 ${
                          currentPathnameMatches(pathname, route.path) ? 'border-amber-300 bg-amber-50' : 'bg-white'
                        }`}
                      >
                        <span className="font-medium text-slate-800">
                          {route.label}
                          <span className="ml-2 text-xs text-slate-500">({route.code})</span>
                        </span>
                        <span className="text-xs text-slate-500">{route.group}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <BellRing className="h-4 w-4 text-slate-600" />
                  {t('notificationChannels')}
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold">System Email Alerts</p>
                      <p className="text-xs text-slate-500">Critical system updates</p>
                    </div>
                    <ToggleButton
                      label="Toggle System Email Alerts"
                      enabled={notifications.email}
                      onClick={() => setNotifications((prev) => ({ ...prev, email: !prev.email }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold">SMS Gateway</p>
                      <p className="text-xs text-slate-500">OTP & payroll dispatches</p>
                    </div>
                    <ToggleButton
                      label="Toggle SMS Gateway"
                      enabled={notifications.sms}
                      onClick={() => setNotifications((prev) => ({ ...prev, sms: !prev.sms }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold">WhatsApp Business Automated</p>
                      <p className="text-xs text-slate-500">Client voucher notifications</p>
                    </div>
                    <ToggleButton
                      label="Toggle WhatsApp Business Automated"
                      enabled={notifications.whatsapp}
                      onClick={() => setNotifications((prev) => ({ ...prev, whatsapp: !prev.whatsapp }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-1 block text-xs font-bold text-slate-600">{t('language')}</label>
                  <select
                    value={locale}
                    onChange={(e) => updateLocale(e.target.value as Locale)}
                    className="w-full rounded-lg border bg-white p-3 text-sm font-medium"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-1 block text-xs font-bold text-slate-600">{t('role')}</label>
                  <select
                    value={currentUserRole}
                    onChange={(e) => updateRole(e.target.value as Role)}
                    className="w-full rounded-lg border bg-white p-3 text-sm font-medium"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-1 block text-xs font-bold text-slate-600">{t('printer')}</label>
                  <input
                    value={hpPrinterName}
                    onChange={(e) => {
                      setHpPrinterName(e.target.value);
                      setLastAction(`Printer changed to ${e.target.value}`);
                    }}
                    className="w-full rounded-lg border bg-white p-3 text-sm font-medium"
                  />
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <label className="mb-1 block text-xs font-bold text-slate-600">{t('autoRoute')}</label>
                  <ToggleButton
                    label="Toggle Auto Route"
                    enabled={autoRoute}
                    activeClass="bg-cyan-600"
                    size="md"
                    onClick={() => setAutoRoute((prev) => !prev)}
                  />
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-bold text-slate-600">{t('autoSave')}</label>
                    <ToggleButton
                      label="Toggle Auto Save"
                      enabled={autoSave}
                      activeClass="bg-emerald-600"
                      size="md"
                      onClick={() => setAutoSave((prev) => !prev)}
                    />
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
                <SectionTitle icon={KeyRound} title="Role-Based Access Control (RBAC)" subtitle="Define permissions across management layers and branches." />
                <button
                  type="button"
                  onClick={() => handleEnterpriseAction('CONFIGURE_MATRIX_MAP')}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Configure Matrix Map
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <label className="mb-1 block text-xs font-bold text-slate-600">{t('passwordPolicy')}</label>
                  <select className="w-full rounded-lg border bg-white p-3 text-sm font-medium">
                    <option>Strict (Minimum 12 Characters + 2FA)</option>
                    <option>Standard (Minimum 8 Characters)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('twoFactorAuth')}</h3>
                    <p className="text-xs text-slate-500">Require 2FA via authenticator apps.</p>
                  </div>
                  <ToggleButton
                    label="Toggle Two-Factor Authentication"
                    enabled={twoFactorAuth}
                    activeClass="bg-indigo-600"
                    onClick={() => setTwoFactorAuth((prev) => !prev)}
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <SectionTitle icon={Lock} title={t('securityAudit')} subtitle="Critical controls with global state and compliance logging." />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleGlobalLockdown}
                    disabled={globalLockdownLoading}
                    className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      globalLockdownActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                    } ${globalLockdownLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {globalLockdownLoading ? 'Activating...' : globalLockdownActive ? '🚨 Global Lockdown Active' : t('activateGlobalLockdown')}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeactivateGlobalLockdown}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t('deactivateGlobalLockdown')}
                  </button>

                  <button
                    type="button"
                    onClick={handleZeroTrustMode}
                    className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      zeroTrustActive ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {zeroTrustActive ? '✅ Zero Trust Mode Active' : t('activateZeroTrust')}
                  </button>

                  <button
                    type="button"
                    onClick={handleZeroTrustOff}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t('disableZeroTrust')}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-800">
                  <History className="h-4 w-4 text-slate-600" />
                  Global Audit Trails
                </h3>
                <div className="overflow-hidden rounded-lg border text-xs">
                  <div className="grid grid-cols-4 border-b bg-slate-100 p-2.5 font-bold">
                    <div>Timestamp</div>
                    <div>Operator Role</div>
                    <div>Locale</div>
                    <div>Action Context</div>
                  </div>
                  <div className="grid grid-cols-4 border-b bg-white p-2.5 text-slate-600">
                    <div>Just Now</div>
                    <div className="font-medium text-blue-600">Super Admin</div>
                    <div>{locale.toUpperCase()}</div>
                    <div>Updated regional configurations</div>
                  </div>
                  <div className="grid grid-cols-4 bg-white p-2.5 text-slate-600">
                    <div>Live</div>
                    <div className="font-medium text-indigo-600">{currentUserRole}</div>
                    <div>{locale}</div>
                    <div>{lastAction}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <SectionTitle icon={ShieldCheck} title={t('complianceLog')} subtitle="Compliance logs are written locally and sent to backend endpoints when available." />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={exportLogs}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      {t('exportLogs')}
                    </button>
                    <button
                      type="button"
                      onClick={clearLogs}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    >
                      {t('clearLogs')}
                    </button>
                  </div>
                </div>

                <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {complianceLogs.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-5 text-sm text-slate-500">
                      No compliance logs yet.
                    </div>
                  ) : (
                    complianceLogs.map((entry) => (
                      <div key={entry.id} className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{entry.action}</span>
                              <span
                                className={[
                                  'rounded-full px-2.5 py-1 text-xs font-bold',
                                  entry.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : entry.status === 'DENIED'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800',
                                ].join(' ')}
                              >
                                {entry.status}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{entry.role}</span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{entry.locale}</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{entry.message}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatTimeLocale(locale, entry.timestamp)} • {entry.route} {entry.endpoint ? `• ${entry.endpoint}` : ''}
                            </p>
                          </div>
                        </div>

                        <pre className="mt-4 max-h-60 overflow-auto rounded-xl border bg-slate-950 p-4 text-xs leading-6 text-amber-100">
{JSON.stringify(entry, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <section className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <SectionTitle icon={Wallet} title="Multi-Currency Ledger & Regional Tax" subtitle="Financial configuration for local and global ERP nodes." />
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Primary Base Currency</label>
                  <select className="w-full rounded-lg border bg-white p-3 text-sm font-medium">
                    <option>SAR (Saudi Riyal) - Regional Corporate</option>
                    <option>BDT (Bangladeshi Taka)</option>
                    <option>USD (United States Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Tax Architecture Rule</label>
                  <select className="w-full rounded-lg border bg-white p-3 text-sm font-medium">
                    <option>ZATCA Compliance (Saudi Arabia 15%)</option>
                    <option>NBR VAT Compliance (Bangladesh)</option>
                    <option>Custom Tax Matrix</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Global VAT Rate (%)</label>
                  <input type="number" defaultValue="15" className="w-full rounded-lg border bg-white p-3 text-sm font-medium" />
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                <strong>E-Invoicing Note:</strong> All invoices will automatically append cryptographically signed XML segments aligned with local enterprise compliance.
              </div>
            </section>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <section className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <SectionTitle icon={CloudLightning} title="Third-Party Enterprise APIs" subtitle="Manage microservices and connector health." />
              <div className="space-y-3">
                <div className="flex flex-col gap-4 rounded-xl border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Payment Gateway Service</h4>
                    <p className="text-xs text-slate-500">Mada / Visa / Mastercard clearing API pipelines</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Active & Hooked</span>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Twilio / SMS Operator Node</h4>
                    <p className="text-xs text-slate-500">International notification channels</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">Configured</span>
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <SectionTitle icon={Globe2} title={t('routeExplorer')} subtitle="All module/page links are available here and in the dropdown above." />
                <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                  {routeGroups.map((group) => (
                    <div key={group.group} className="rounded-xl border bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{group.group}</p>
                        <span className="text-[11px] text-slate-400">{group.routes.length}</span>
                      </div>
                      <div className="space-y-2">
                        {group.routes.map((route) => (
                          <Link
                            key={`${route.group}-${route.code}-${route.path}-integration`}
                            href={route.path}
                            className={`block rounded-lg border px-3 py-2 text-sm transition hover:bg-slate-100 ${
                              currentPathnameMatches(pathname, route.path) ? 'border-amber-300 bg-amber-50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-slate-800">{route.label}</span>
                              <span className="text-xs text-slate-500">{route.code}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{route.path}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <SectionTitle icon={MapPinned} title="Global State-aware Routing" subtitle="Critical actions write to the shared enterprise state and compliance layer." />
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleEnterpriseAction('GLOBAL_SYNC')}
                    className="rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Force Global Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterpriseAction('EXPORT_AUDIT')}
                    className="rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    Export Audit Logs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterpriseAction('MAINTENANCE_MODE')}
                    className="rounded-lg bg-yellow-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-700"
                  >
                    Enable Maintenance Mode
                  </button>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
              <SectionTitle icon={Server} title={t('infrastructure')} subtitle="Monitor cloud synchronization, API uptime, storage nodes, and recovery systems." />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-600" />
                    <h3 className="text-sm font-bold">Global Servers</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">24</p>
                  <p className="mt-1 text-xs text-emerald-600">Active worldwide nodes</p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold">API Uptime</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">99.98%</p>
                  <p className="mt-1 text-xs text-emerald-600">All services operational</p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold">Cloud Storage</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">14.8TB</p>
                  <p className="mt-1 text-xs text-slate-500">Synced across regions</p>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold">Network Health</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">Excellent</p>
                  <p className="mt-1 text-xs text-emerald-600">Global traffic stable</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-xl border bg-slate-50 p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Cloud Synchronization</h3>
                    <p className="text-xs text-slate-500">Real-time replication between enterprise branches.</p>
                  </div>
                  <ToggleButton
                    label="Toggle Cloud Synchronization"
                    enabled={cloudSyncEnabled}
                    activeClass="bg-cyan-600"
                    onClick={() => setCloudSyncEnabled((prev) => !prev)}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-slate-50 p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">API Monitoring</h3>
                    <p className="text-xs text-slate-500">Observe enterprise gateway uptime and latency.</p>
                  </div>
                  <ToggleButton
                    label="Toggle API Monitoring"
                    enabled={apiMonitoringEnabled}
                    activeClass="bg-cyan-600"
                    onClick={() => setApiMonitoringEnabled((prev) => !prev)}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-slate-50 p-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Disaster Recovery</h3>
                    <p className="text-xs text-slate-500">Automated encrypted backup restoration systems.</p>
                  </div>
                  <ToggleButton
                    label="Toggle Disaster Recovery"
                    enabled={disasterRecoveryEnabled}
                    activeClass="bg-cyan-600"
                    onClick={() => setDisasterRecoveryEnabled((prev) => !prev)}
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-slate-50 p-5">
                <SectionTitle icon={Layers} title="Emergency Lock & Recovery" subtitle="These controls remain connected to every page through persistent storage." />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleGlobalLockdown}
                    disabled={globalLockdownLoading}
                    className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      globalLockdownActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                    } ${globalLockdownLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {globalLockdownLoading ? 'Activating Global Lockdown...' : globalLockdownActive ? '🚨 Global Lockdown Active' : t('activateGlobalLockdown')}
                  </button>

                  <button
                    type="button"
                    onClick={handleZeroTrustMode}
                    className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                      zeroTrustActive ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {zeroTrustActive ? '✅ Zero Trust Mode Active' : t('activateZeroTrust')}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">{t('enterpriseActions')}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {actions.map((item, index) => (
                    <div key={`${item.action}-${index}`} className={`rounded-xl border p-4 ${item.card}`}>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-500">Action Key: {item.action}</p>
                      <button
                        type="button"
                        onClick={() => handleEnterpriseAction(item.action, Boolean(item.critical))}
                        className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-bold text-white transition ${item.color}`}
                      >
                        {item.button}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {infrastructureSections.map((section) => (
                <MetricSectionView key={section.title} section={section} />
              ))}
            </section>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-blue-900">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    Enterprise Multi-Branch Topography
                  </h3>
                  <p className="mt-1 text-xs text-blue-700">Synchronize inventories, transfers, and consolidated balance sheets.</p>
                </div>
                <ToggleButton
                  label="Toggle Enterprise Multi-Branch Topography"
                  enabled={multiBranchEnabled}
                  activeClass="bg-blue-600"
                  size="md"
                  onClick={() => setMultiBranchEnabled((prev) => !prev)}
                />
              </div>

              {multiBranchEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-slate-900">Active Operations Nodes</h3>
                    <button
                      type="button"
                      onClick={() => handleEnterpriseAction('PROVISION_NEW_BRANCH')}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      + Provision New Branch
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-slate-100 text-xs font-bold uppercase text-slate-700">
                        <tr>
                          <th className="p-4">Branch Registry Identifier</th>
                          <th className="p-4">Geographic Coordinates / Region</th>
                          <th className="p-4">Zonal Compliance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        <tr className="transition hover:bg-slate-50">
                          <td className="p-4 font-semibold text-slate-900">Riyadh Central HQ</td>
                          <td className="p-4 text-slate-600">Olaya District, KSA</td>
                          <td className="p-4">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Operational</span>
                          </td>
                        </tr>
                        <tr className="transition hover:bg-slate-50">
                          <td className="p-4 font-semibold text-slate-900">Dhaka Logistics Center</td>
                          <td className="p-4 text-slate-600">Uttara Sector 4, Bangladesh</td>
                          <td className="p-4">
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Operational</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-bold text-red-900">
                      <Lock className="h-4 w-4 text-red-600" />
                      Emergency Kill-Switch
                    </h3>
                    <p className="mt-1 text-xs text-red-700">Instantly restrict writes and sessions across all branches.</p>
                  </div>
                  <ToggleButton
                    label="Toggle Emergency Kill-Switch"
                    enabled={systemEmergencyLock}
                    activeClass="bg-red-600"
                    size="md"
                    onClick={async () => {
                      setSystemEmergencyLock((prev) => !prev);
                      const nextValue = !systemEmergencyLock;
                      setLastAction(nextValue ? 'Emergency Kill-Switch enabled.' : 'Emergency Kill-Switch disabled.');
                      await appendComplianceLog({
                        action: 'EMERGENCY_KILL_SWITCH',
                        status: 'SUCCESS',
                        role: currentUserRole,
                        locale,
                        route: pathname ?? '/',
                        message: nextValue ? 'Emergency Kill-Switch enabled.' : 'Emergency Kill-Switch disabled.',
                        endpoint: '/api/security/emergency-lock',
                        payload: { enabled: nextValue },
                      });
                    }}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 text-white">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold">Global ERP Infrastructure Command</h2>
                    <p className="mt-2 text-slate-300">Centralized worldwide enterprise monitoring & AI control</p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-extrabold">99.99%</p>
                    <p className="mt-1 text-slate-300 text-sm">Global Stability</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Global Branches', '128', 'Worldwide branches connected', 'bg-blue-50', 'text-slate-900'],
                  ['AI Autopilot', 'ACTIVE', 'Autonomous enterprise operations enabled', 'bg-violet-50', 'text-violet-700'],
                  ['Threat Engine', 'SECURED', 'AI monitoring suspicious activity globally', 'bg-rose-50', 'text-rose-700'],
                  ['Compliance Status', 'VERIFIED', 'GDPR / SOC2 / ISO governance active', 'bg-emerald-50', 'text-emerald-700'],
                  ['Predictive AI', '97.2%', 'KPI prediction accuracy', 'bg-cyan-50', 'text-cyan-700'],
                  ['System Health', 'OPTIMAL', 'Infrastructure operating normally', 'bg-amber-50', 'text-amber-700'],
                  ['Executive Core', 'LIVE', 'Strategic AI decision support enabled', 'bg-indigo-50', 'text-indigo-700'],
                ].map(([title, value, description, bg, color]) => (
                  <div key={title as string} className={`rounded-2xl border p-5 ${bg as string}`}>
                    <h4 className="font-bold text-slate-800">{title as string}</h4>
                    <p className={`mt-4 text-4xl font-extrabold ${color as string}`}>{value as string}</p>
                    <p className="mt-2 text-xs text-slate-500">{description as string}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <SectionTitle icon={Radar} title="Security Telemetry" subtitle="Continuous audit and threat telemetry across the stack." />
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Threat Alerts</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">03</p>
                    <p className="mt-1 text-xs text-slate-500">AI flagged unusual activity</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Firewall State</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">SECURE</p>
                    <p className="mt-1 text-xs text-slate-500">All perimeter rules active</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Zero Trust</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{zeroTrustActive ? 'ON' : 'OFF'}</p>
                    <p className="mt-1 text-xs text-slate-500">Global verification state</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Lockdown</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{globalLockdownActive ? 'ON' : 'OFF'}</p>
                    <p className="mt-1 text-xs text-slate-500">Emergency global lock state</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6">
                <h3 className="mb-5 text-lg font-bold text-slate-900">Enterprise Audit Timeline</h3>
                <div className="space-y-4">
                  {[
                    ['bg-emerald-500', 'GDPR validation completed', 'Europe Region • 12 mins ago'],
                    ['bg-cyan-500', 'AI policy engine updated', 'Global AI Core • 25 mins ago'],
                    ['bg-rose-500', 'Security firewall rules regenerated', 'Threat Center • 1 hour ago'],
                  ].map(([dot, title, time]) => (
                    <div key={title as string} className="flex gap-4">
                      <div className={`mt-2 h-3 w-3 rounded-full ${dot as string}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{title as string}</p>
                        <p className="mt-1 text-xs text-slate-500">{time as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-gradient-to-r from-violet-600 to-indigo-700 text-white">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold">Enterprise AI Core Status</h3>
                    <p className="mt-2 text-sm text-violet-100">All autonomous systems operational</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                    {[
                      ['AI Stability', '99.99%'],
                      ['Branch Sync', '128'],
                      ['Threats Blocked', '1,284'],
                      ['AI Decisions', 'LIVE'],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-violet-100 text-xs">{label as string}</p>
                        <p className="text-2xl font-extrabold">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6">
                <h3 className="mb-5 text-lg font-bold text-slate-900">{t('globalFeatureMatrix')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-bold text-slate-700">Feature</th>
                        <th className="py-3 text-left font-bold text-slate-700">Status</th>
                        <th className="py-3 text-left font-bold text-slate-700">Region</th>
                        <th className="py-3 text-left font-bold text-slate-700">AI Control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['AI Autopilot', 'ACTIVE', 'Global', 'ENABLED'],
                        ['Threat Monitoring', 'RUNNING', 'Worldwide', 'ENABLED'],
                        ['Compliance Engine', 'VERIFIED', 'EU / US / ASIA', 'ENABLED'],
                      ].map(([feature, status, region, ai]) => (
                        <tr key={feature as string} className="border-b">
                          <td className="py-3">{feature as string}</td>
                          <td className="py-3 font-bold text-emerald-600">{status as string}</td>
                          <td className="py-3">{region as string}</td>
                          <td className="py-3">{ai as string}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <SectionTitle icon={Layers} title={t('sharedState')} subtitle="A comprehensive, route-aware registry that can be shared across all pages." />
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('language')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{locale.toUpperCase()}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('role')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{currentUserRole}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('globalLockdown')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{globalLockdownActive ? 'ON' : 'OFF'}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('zeroTrust')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{zeroTrustActive ? 'ON' : 'OFF'}</p>
              </div>
            </div>

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-xl border bg-white p-4">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {ALL_PAGE_LINKS.map((route) => (
                  <Link
                    key={`${route.code}-${route.path}-snapshot`}
                    href={route.path}
                    className={`rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-slate-100 ${
                      currentPathnameMatches(pathname, route.path) ? 'border-amber-300 bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{route.label}</span>
                      <span className="text-xs text-slate-500">{route.code}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{route.path}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}