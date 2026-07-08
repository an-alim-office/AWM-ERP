"use client";
 
import React, { useCallback, useEffect, useMemo, useState } from "react";
 
import Link from "next/link";
 
import {
  Activity,
  AlarmClock,
  AlertCircle,
  AlertTriangle,
  Award,
  Banknote,
  BarChart3,
  BarChart4,
  Bell,
  Bot,
  Boxes,
  Brain,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  Cloud,
  Coins,
  Contact,
  CreditCard,
  Cpu,
  DollarSign,
  Factory,
  FileBarChart,
  FileDown,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Handshake,
  HeartHandshake,
  HelpCircle,
  History,
  IdCard,
  KeyRound,
  Landmark,
  Languages,
  LayoutDashboard,
  Layers,
  LineChart,
  Lock,
  MapPin,
  Megaphone,
  MessageSquare,
  Mic,
  Moon,
  Network,
  Package,
  Percent,
  PhoneCall,
  PieChart,
  Plane,
  Printer,
  QrCode,
  Radio,
  Receipt,
  Recycle,
  RefreshCw,
  Route,
  ScanFace,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Users2,
  Utensils,
  Volume2,
  Wallet,
  Warehouse,
  Wifi,
  Workflow,
  Wrench,
  Pill,
} from "lucide-react";
 
/**
 * =========================================================
 * AWM ERP 2026 - VIP এডমিন কন্ট্রোল প্যানেল
 * =========================================================
 * প্রজেক্টের app/ ডিরেক্টরির প্রতিটা রুট (page.tsx) থেকে মডিউল বের করে
 * এখানে তালিকাভুক্ত করা হয়েছে — মোট ১৫২টা মডিউল, ক্যাটাগরি-ভিত্তিক।
 * (auth/login/register পেজ ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে, কারণ ওগুলো
 * অথেনটিকেশন পেজ, ড্যাশবোর্ড মডিউল নয়।)
 * =========================================================
 */
 
type ModuleStatus = "Active" | "Monitoring" | "Secure";
 
type KPIState = {
  employees: number;
  presentToday: number;
  payrollTotal: number;
  lowStock: number;
  loading: boolean;
};
 
type RawModule = {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  desc: string;
};
 
type ModuleItem = RawModule & {
  id: number;
  status: ModuleStatus;
};
 
/**
 * === স্বয়ংক্রিয় Status নির্ধারণ ===
 * প্রতিটা মডিউলের জন্য ম্যানুয়ালি status লেখার বদলে এই ফাংশন
 * ক্যাটাগরি ও নাম বিশ্লেষণ করে সামঞ্জস্যপূর্ণভাবে status বসায়:
 * - Security ক্যাটাগরি → সবসময় "Secure"
 * - নামে live/monitor/real-time/tracking/iot থাকলে → "Monitoring"
 * - বাকি সব → "Active"
 */
function deriveStatus(name: string, category: string): ModuleStatus {
  if (category === "Security") return "Secure";
 
  const lower = name.toLowerCase();
  if (/live|monitor|real-time|tracking|iot/.test(lower)) {
    return "Monitoring";
  }
 
  return "Active";
}
 
const rawModules: RawModule[] = [
  // ===== AI (16) =====
  { name: "AI Analytics", path: "/ai/analytics", icon: BarChart3, category: "AI", desc: "AI-driven workforce intelligence & insights" },
  { name: "AI Assistant", path: "/ai/assistant", icon: Bot, category: "AI", desc: "Natural-language ERP data assistant" },
  { name: "AI Attendance", path: "/ai/attendance", icon: Cpu, category: "AI", desc: "AI-assisted attendance verification" },
  { name: "AI Chat", path: "/ai/chat", icon: MessageSquare, category: "AI", desc: "Conversational AI interface for ERP queries" },
  { name: "AI Cost Management", path: "/ai/cost-management", icon: Calculator, category: "AI", desc: "AI-optimized cost tracking & control" },
  { name: "AI Medical Imaging Intelligence", path: "/ai/driven-medical-imaging-intelligence", icon: Stethoscope, category: "AI", desc: "AI-driven medical imaging analysis" },
  { name: "AI ePrescription", path: "/ai/ePrescription", icon: Pill, category: "AI", desc: "AI-assisted digital prescription generation" },
  { name: "AI Multi-Language", path: "/ai/multi-language", icon: Languages, category: "AI", desc: "AI-powered multi-language support" },
  { name: "AI Payroll", path: "/ai/payroll", icon: Wallet, category: "AI", desc: "AI-optimized payroll processing" },
  { name: "AI Pharmacy Smart Hub", path: "/ai/pharmacy/smart-hub", icon: Package, category: "AI", desc: "AI-driven pharmacy inventory & dispensing hub" },
  { name: "AI Prediction", path: "/ai/prediction", icon: TrendingUp, category: "AI", desc: "Machine-learning based business predictions" },
  { name: "AI Report Generator", path: "/ai/report-generator", icon: FileText, category: "AI", desc: "Automated AI-generated business reports" },
  { name: "AI Restaurant", path: "/ai/restaurant", icon: Utensils, category: "AI", desc: "AI-powered restaurant operations module" },
  { name: "AI Revenue Orchestrator", path: "/ai/revenue-orchestrator", icon: DollarSign, category: "AI", desc: "AI-coordinated revenue optimization engine" },
  { name: "AI Search", path: "/ai/search", icon: Search, category: "AI", desc: "AI-powered semantic ERP search" },
  { name: "AI Voice Command", path: "/ai/voice-command", icon: Mic, category: "AI", desc: "Voice-controlled AI ERP commands" },
 
  // ===== AI Search (5) =====
  { name: "Global Search", path: "/ai-search/global", icon: Globe, category: "AI Search", desc: "Cross-module global search engine" },
  { name: "Search History", path: "/ai-search/history", icon: History, category: "AI Search", desc: "Past search queries & history log" },
  { name: "Search Results", path: "/ai-search/results", icon: Sparkles, category: "AI Search", desc: "Ranked AI search result explorer" },
  { name: "Smart Suggestions", path: "/ai-search/suggestions", icon: Brain, category: "AI Search", desc: "AI-generated smart search suggestions" },
  { name: "Voice Search", path: "/ai-search/voice", icon: Volume2, category: "AI Search", desc: "Voice-activated ERP search" },
 
  // ===== Attendance (7) =====
  { name: "Face Attendance", path: "/attendance/face", icon: ScanFace, category: "Attendance", desc: "Biometric face-recognition clock-in" },
  { name: "Fingerprint Attendance", path: "/attendance/fingerprint", icon: Fingerprint, category: "Attendance", desc: "Fingerprint biometric clock-in" },
  { name: "GPS Attendance", path: "/attendance/gps", icon: MapPin, category: "Attendance", desc: "Location-verified GPS attendance" },
  { name: "Attendance History", path: "/attendance/history", icon: History, category: "Attendance", desc: "Historical attendance log & reports" },
  { name: "Attendance", path: "/attendance", icon: CalendarCheck, category: "Attendance", desc: "Central attendance management console" },
  { name: "QR Attendance", path: "/attendance/qr", icon: QrCode, category: "Attendance", desc: "QR-code based attendance check-in" },
  { name: "Shift Management", path: "/attendance/shifts", icon: Clock, category: "Attendance", desc: "Employee shift scheduling & rotation" },
 
  // ===== Communication (1) =====
  { name: "AWM SMS", path: "/communication/awm-sms", icon: MessageSquare, category: "Communication", desc: "Bulk & transactional SMS communication hub" },
 
  // ===== Community (1) =====
  { name: "AWM Social", path: "/community/awm-social", icon: Share2, category: "Community", desc: "Internal enterprise social community feed" },
 
  // ===== Dashboard (11) =====
  { name: "Activity Timeline", path: "/dashboard/activity-timeline", icon: Activity, category: "Dashboard", desc: "Chronological feed of system-wide activity" },
  { name: "Admin Control Panel", path: "/dashboard/admin", icon: ShieldCheck, category: "Dashboard", desc: "Central VIP administration control panel" },
  { name: "AI Analytics Dashboard", path: "/dashboard/ai-analytics", icon: BarChart4, category: "Dashboard", desc: "AI-driven executive analytics dashboard" },
  { name: "Branch Overview", path: "/dashboard/branch-overview", icon: Building2, category: "Dashboard", desc: "Multi-branch performance overview" },
  { name: "Calendar", path: "/dashboard/calendar", icon: CalendarDays, category: "Dashboard", desc: "Enterprise-wide events & scheduling calendar" },
  { name: "Live Attendance", path: "/dashboard/live-attendance", icon: Clock, category: "Dashboard", desc: "Real-time attendance monitoring dashboard" },
  { name: "Live KPI", path: "/dashboard/live-kpi", icon: Gauge, category: "Dashboard", desc: "Real-time KPI performance tracking" },
  { name: "Notifications", path: "/dashboard/notifications", icon: Bell, category: "Dashboard", desc: "Centralized system notification center" },
  { name: "Main Dashboard", path: "/dashboard", icon: LayoutDashboard, category: "Dashboard", desc: "Central command center for ERP operations" },
  { name: "Payroll Overview", path: "/dashboard/payroll-overview", icon: Wallet, category: "Dashboard", desc: "At-a-glance payroll summary dashboard" },
  { name: "Real-Time Monitoring", path: "/dashboard/real-time-monitoring", icon: Radio, category: "Dashboard", desc: "Live operational monitoring console" },
 
  // ===== E-Commerce (1) =====
  { name: "E-Commerce", path: "/E-Commerce", icon: ShoppingCart, category: "E-Commerce", desc: "Online storefront & order management" },
 
  // ===== Biometric (2) =====
  { name: "Face & Fingerprint Hub", path: "/face/fingerprint", icon: Fingerprint, category: "Biometric", desc: "Combined face & fingerprint enrollment hub" },
  { name: "Face Attendance (Kiosk)", path: "/face-attendance", icon: ScanFace, category: "Biometric", desc: "Standalone kiosk-mode face attendance" },
 
  // ===== HR (9) =====
  { name: "HR Attendance", path: "/hr/attendance", icon: CalendarCheck, category: "HR", desc: "HR-managed attendance oversight" },
  { name: "Contracts", path: "/hr/contracts", icon: FileText, category: "HR", desc: "Employee contract lifecycle management" },
  { name: "Disciplinary Actions", path: "/hr/disciplinary-actions", icon: AlertTriangle, category: "HR", desc: "Disciplinary case tracking & records" },
  { name: "Employee Profile", path: "/hr/employee-profile", icon: Contact, category: "HR", desc: "Individual employee profile management" },
  { name: "Employees", path: "/hr/employees", icon: Users, category: "HR", desc: "Manage employee database & records" },
  { name: "ID Card Generator", path: "/hr/id-card-generator", icon: IdCard, category: "HR", desc: "Automated employee ID card generation" },
  { name: "Leave Management", path: "/hr/leave-management", icon: Plane, category: "HR", desc: "Leave requests, approvals & balances" },
  { name: "Performance", path: "/hr/performance", icon: Award, category: "HR", desc: "Employee performance review tracking" },
  { name: "Promotions", path: "/hr/promotions", icon: GraduationCap, category: "HR", desc: "Career progression & promotion records" },
 
  // ===== Inventory (8) =====
  { name: "Delivery Tracking", path: "/inventory/delivery-tracking", icon: Truck, category: "Inventory", desc: "Real-time delivery & shipment tracking" },
  { name: "Live Stock Tracking", path: "/inventory/live-stock-tracking", icon: Boxes, category: "Inventory", desc: "Real-time stock level tracking" },
  { name: "Logistics", path: "/inventory/logistics", icon: Route, category: "Inventory", desc: "Logistics & route planning management" },
  { name: "Inventory", path: "/inventory", icon: Package, category: "Inventory", desc: "Stock control & inventory transactions" },
  { name: "Purchase Orders", path: "/inventory/purchase-orders", icon: Receipt, category: "Inventory", desc: "Purchase order creation & approval" },
  { name: "QR/Barcode Scanner", path: "/inventory/qr-barcode-scanner", icon: QrCode, category: "Inventory", desc: "QR & barcode scanning for stock ops" },
  { name: "Suppliers", path: "/inventory/suppliers", icon: Handshake, category: "Inventory", desc: "Supplier directory & relationship management" },
  { name: "Warehouse", path: "/inventory/warehouse", icon: Warehouse, category: "Inventory", desc: "Warehouse zone & capacity management" },
 
  // ===== Multi-Language AI (1) =====
  { name: "Multi-Language AI", path: "/multi-language-ai", icon: Languages, category: "AI", desc: "Platform-wide AI translation & localization" },
 
  // ===== NextGen (9) =====
  { name: "AI Document Understanding", path: "/next-gen/ai-document-understanding", icon: FileText, category: "NextGen", desc: "AI-based document parsing & comprehension" },
  { name: "AI Voice ERP", path: "/next-gen/ai-voice-erp", icon: Mic, category: "NextGen", desc: "Full voice-command ERP operation layer" },
  { name: "AI Workflow Automation", path: "/next-gen/ai-workflow-automation", icon: Workflow, category: "NextGen", desc: "End-to-end AI-driven workflow automation" },
  { name: "AR/VR Dashboard", path: "/next-gen/ar-vr-dashboard", icon: Layers, category: "NextGen", desc: "Immersive AR/VR data visualization" },
  { name: "Auto Decision Engine", path: "/next-gen/auto-decision-engine", icon: Brain, category: "NextGen", desc: "Autonomous rule-based decision engine" },
  { name: "Autonomous AI Agent", path: "/next-gen/autonomous-ai-agent", icon: Bot, category: "NextGen", desc: "Self-operating autonomous AI agent" },
  { name: "Live IoT Devices", path: "/next-gen/live-iot-devices", icon: Wifi, category: "NextGen", desc: "Real-time connected IoT device monitoring" },
  { name: "Predictive Analytics", path: "/next-gen/predictive-analytics", icon: TrendingUp, category: "NextGen", desc: "ML-powered forecasts & predictions" },
  { name: "Remote Factory Control", path: "/next-gen/remote-factory-control", icon: Factory, category: "NextGen", desc: "Remote industrial factory control panel" },
 
  // ===== Payroll (18) =====
  { name: "Payroll Advance", path: "/payroll/advance", icon: Banknote, category: "Payroll", desc: "Salary advance requests & disbursement" },
  { name: "AI Salary Prediction", path: "/payroll/ai-salary-prediction", icon: TrendingUp, category: "Payroll", desc: "AI-forecasted salary trend prediction" },
  { name: "Auto Calculation", path: "/payroll/auto-calculation", icon: Calculator, category: "Payroll", desc: "Automated payroll calculation engine" },
  { name: "Banking", path: "/payroll/banking", icon: Landmark, category: "Payroll", desc: "Bank transfer & disbursement management" },
  { name: "Deductions", path: "/payroll/deductions", icon: Percent, category: "Payroll", desc: "Salary deduction rules & tracking" },
  { name: "Driver Attendance", path: "/payroll/driver-attendance", icon: CalendarCheck, category: "Payroll", desc: "Driver-specific attendance & pay linkage" },
  { name: "Expenses", path: "/payroll/expenses", icon: CreditCard, category: "Payroll", desc: "Employee expense claims & reimbursement" },
  { name: "Financial Reports", path: "/payroll/financial-reports", icon: FileBarChart, category: "Payroll", desc: "Consolidated payroll financial reporting" },
  { name: "Hourly Payroll", path: "/payroll/hourly", icon: Timer, category: "Payroll", desc: "Hourly-rate payroll processing" },
  { name: "Monthly Payroll", path: "/payroll/monthly", icon: CalendarDays, category: "Payroll", desc: "Monthly salary run management" },
  { name: "Multi-Currency", path: "/payroll/multi-currency", icon: Coins, category: "Payroll", desc: "Multi-currency payroll conversion" },
  { name: "Overtime", path: "/payroll/overtime", icon: AlarmClock, category: "Payroll", desc: "Overtime hours & pay calculation" },
  { name: "Payroll", path: "/payroll", icon: Wallet, category: "Payroll", desc: "Automated payroll & salary processing" },
  { name: "Profit & Loss", path: "/payroll/profit-loss", icon: LineChart, category: "Payroll", desc: "Payroll-linked profit & loss statement" },
  { name: "Revenue", path: "/payroll/revenue", icon: TrendingUp, category: "Payroll", desc: "Revenue tracking linked to payroll costs" },
  { name: "Salary Sheet", path: "/payroll/Salary-Sheet", icon: FileSpreadsheet, category: "Payroll", desc: "Detailed salary sheet generation" },
  { name: "Tax Management", path: "/payroll/tax-management", icon: Receipt, category: "Payroll", desc: "Payroll tax computation & filing" },
  { name: "Time Sheet", path: "/payroll/time-sheet", icon: ClipboardList, category: "Payroll", desc: "Employee time sheet tracking" },
 
  // ===== Production (8) =====
  { name: "Equipment Status", path: "/production/equipment-status", icon: Cpu, category: "Production", desc: "Live production equipment status board" },
  { name: "Production KPI", path: "/production/kpi", icon: Gauge, category: "Production", desc: "Production line KPI tracking" },
  { name: "Line Management", path: "/production/line-management", icon: GitBranch, category: "Production", desc: "Production line configuration & control" },
  { name: "Machine Monitoring", path: "/production/machine-monitoring", icon: Radio, category: "Production", desc: "Real-time machine health monitoring" },
  { name: "Maintenance", path: "/production/maintenance", icon: Wrench, category: "Production", desc: "Preventive & corrective maintenance scheduling" },
  { name: "Planning", path: "/production/planning", icon: CalendarClock, category: "Production", desc: "Production planning & scheduling" },
  { name: "Raw Materials", path: "/production/raw-materials", icon: Package, category: "Production", desc: "Raw material inventory & consumption" },
  { name: "Waste Analysis", path: "/production/waste-analysis", icon: Recycle, category: "Production", desc: "Production waste tracking & analysis" },
 
  // ===== Reports (14) =====
  { name: "AI Insights", path: "/reports/ai-insights", icon: Sparkles, category: "Reports", desc: "AI-generated business insight reports" },
  { name: "Attendance Report", path: "/reports/attendance", icon: CalendarCheck, category: "Reports", desc: "Comprehensive attendance reporting" },
  { name: "Charts", path: "/reports/charts", icon: PieChart, category: "Reports", desc: "Visual chart-based data reporting" },
  { name: "Data Visualization", path: "/reports/data-visualization", icon: BarChart3, category: "Reports", desc: "Interactive enterprise data visualization" },
  { name: "Employee Reports", path: "/reports/employees", icon: Users, category: "Reports", desc: "Employee-focused report generation" },
  { name: "Excel Export", path: "/reports/excel", icon: FileSpreadsheet, category: "Reports", desc: "Export reports to Excel format" },
  { name: "Export Center", path: "/reports/export", icon: FileDown, category: "Reports", desc: "Centralized multi-format export hub" },
  { name: "Forecasting", path: "/reports/forecasting", icon: TrendingUp, category: "Reports", desc: "Trend-based business forecasting" },
  { name: "Overtime Report", path: "/reports/overtime", icon: AlarmClock, category: "Reports", desc: "Overtime usage reporting" },
  { name: "Reports", path: "/reports", icon: FileBarChart, category: "Reports", desc: "Exportable business analytics reports" },
  { name: "PDF Export", path: "/reports/pdf", icon: FileText, category: "Reports", desc: "Export reports to PDF format" },
  { name: "Print Center", path: "/reports/print-center", icon: Printer, category: "Reports", desc: "Centralized report printing hub" },
  { name: "Salary Report", path: "/reports/salary", icon: Wallet, category: "Reports", desc: "Detailed salary reporting" },
  { name: "Smart Reports", path: "/reports/smart-reports", icon: Brain, category: "Reports", desc: "AI-curated smart report recommendations" },
 
  // ===== Salary Sheet (top-level) (1) =====
  { name: "Salary Sheet (Global)", path: "/salary-sheet", icon: FileSpreadsheet, category: "Payroll", desc: "Global salary sheet overview" },
 
  // ===== Sales (8) =====
  { name: "AI Sales Assistant", path: "/sales/ai-assistant", icon: Bot, category: "Sales", desc: "AI-assisted sales recommendations" },
  { name: "Sales Analytics", path: "/sales/analytics", icon: BarChart3, category: "Sales", desc: "Sales performance analytics dashboard" },
  { name: "Client Chat", path: "/sales/client-chat", icon: MessageSquare, category: "Sales", desc: "Direct client messaging & chat" },
  { name: "Sales CRM", path: "/sales/crm", icon: Contact, category: "Sales", desc: "Lead pipeline & customer relationship" },
  { name: "Customers", path: "/sales/customers", icon: Users2, category: "Sales", desc: "Customer directory & account management" },
  { name: "Invoices", path: "/sales/invoices", icon: Receipt, category: "Sales", desc: "Invoice creation & payment tracking" },
  { name: "Leads", path: "/sales/leads", icon: Target, category: "Sales", desc: "Lead capture & conversion tracking" },
  { name: "Marketing", path: "/sales/marketing", icon: Megaphone, category: "Sales", desc: "Marketing campaign management" },
 
  // ===== Security (8) =====
  { name: "Access Control", path: "/security/access-control", icon: Lock, category: "Security", desc: "Role-based access control management" },
  { name: "Security Alerts", path: "/security/alerts", icon: AlertTriangle, category: "Security", desc: "Real-time security alert center" },
  { name: "API Keys", path: "/security/api-keys", icon: KeyRound, category: "Security", desc: "API key issuance & revocation" },
  { name: "Audit Logs", path: "/security/audit-logs", icon: History, category: "Security", desc: "User roles, permissions & audit logs" },
  { name: "Biometric Security", path: "/security/biometric", icon: Fingerprint, category: "Security", desc: "Biometric authentication security settings" },
  { name: "IP Restrictions", path: "/security/ip-restrictions", icon: Globe, category: "Security", desc: "IP allow/deny list management" },
  { name: "Threat Detection", path: "/security/threat-detection", icon: ShieldAlert, category: "Security", desc: "AI-driven threat detection engine" },
  { name: "User Roles", path: "/security/user-roles", icon: Shield, category: "Security", desc: "User role & permission configuration" },
 
  // ===== Settings (15) =====
  { name: "API Integration", path: "/settings/api-integration", icon: Network, category: "Settings", desc: "Third-party API integration settings" },
  { name: "Attendance Rules", path: "/settings/attendance-rules", icon: CalendarCheck, category: "Settings", desc: "Configurable attendance policy rules" },
  { name: "Cloud Backup", path: "/settings/cloud-backup", icon: Cloud, category: "Settings", desc: "Automated cloud data backup settings" },
  { name: "Company", path: "/settings/company", icon: Building2, category: "Settings", desc: "Company configuration & policies" },
  { name: "Currency", path: "/settings/currency", icon: Coins, category: "Settings", desc: "Base & supported currency configuration" },
  { name: "Dark Mode", path: "/settings/dark-mode", icon: Moon, category: "Settings", desc: "Dark mode appearance preferences" },
  { name: "ERP Connectors", path: "/settings/erp-connectors", icon: GitBranch, category: "Settings", desc: "External ERP system connectors" },
  { name: "Holidays", path: "/settings/holidays", icon: CalendarDays, category: "Settings", desc: "Company holiday calendar configuration" },
  { name: "Language", path: "/settings/language", icon: Languages, category: "Settings", desc: "Interface language preferences" },
  { name: "Mobile Sync", path: "/settings/mobile-sync", icon: Smartphone, category: "Settings", desc: "Mobile app synchronization settings" },
  { name: "OT Rules", path: "/settings/ot-rules", icon: AlarmClock, category: "Settings", desc: "Overtime policy rule configuration" },
  { name: "Settings", path: "/settings", icon: Settings, category: "Settings", desc: "General system configuration" },
  { name: "Payroll Rules", path: "/settings/payroll-rules", icon: Wallet, category: "Settings", desc: "Payroll calculation rule configuration" },
  { name: "Quality Control", path: "/settings/quality-control", icon: ShieldCheck, category: "Settings", desc: "Quality assurance rule configuration" },
  { name: "Theme", path: "/settings/theme", icon: Sparkles, category: "Settings", desc: "Visual theme & branding customization" },
 
  // ===== Staff Advancement (4) =====
  { name: "Staff Advance Sheet", path: "/staff-advance-sheet", icon: FileSpreadsheet, category: "Staff Advancement", desc: "Staff salary advance sheet overview" },
  { name: "Staff Advancement Count", path: "/staff-advancement/count", icon: Calculator, category: "Staff Advancement", desc: "Advancement count & summary tracking" },
  { name: "Staff Advancement Logs", path: "/staff-advancement/logs", icon: History, category: "Staff Advancement", desc: "Detailed staff advancement history log" },
  { name: "Staff Advancement Logs (Global)", path: "/staff-advancement-logs", icon: History, category: "Staff Advancement", desc: "Global staff advancement audit log" },
 
  // ===== Support (4) =====
  { name: "Activity Logs", path: "/support/activity-logs", icon: History, category: "Support", desc: "User & system activity support logs" },
  { name: "Contact Support", path: "/support/contact", icon: PhoneCall, category: "Support", desc: "Direct contact with support team" },
  { name: "Help Center", path: "/support/help-center", icon: HelpCircle, category: "Support", desc: "Self-service help & documentation center" },
  { name: "Support Notifications", path: "/support/notifications", icon: Bell, category: "Support", desc: "Support ticket & notification tracking" },
 
  // ===== Zakat Management (1) =====
  { name: "Zakat Management", path: "/zakat-management", icon: HeartHandshake, category: "Zakat", desc: "Islamic Zakat calculation & disbursement management" },
];
 
const modules: ModuleItem[] = rawModules.map((m, index) => ({
  id: index + 1,
  ...m,
  status: deriveStatus(m.name, m.category),
}));
 
const categories: string[] = [
  "All",
  ...Array.from(new Set(modules.map((m) => m.category))),
];
 
const getStatusStyle = (
  status: ModuleStatus
): {
  dot: string;
  badge: string;
} => {
  switch (status) {
    case "Active":
      return {
        dot: "bg-green-500",
        badge: "bg-green-100 text-green-700",
      };
 
    case "Monitoring":
      return {
        dot: "bg-yellow-500",
        badge: "bg-yellow-100 text-yellow-700",
      };
 
    case "Secure":
      return {
        dot: "bg-red-500",
        badge: "bg-red-100 text-red-700",
      };
 
    default:
      return {
        dot: "bg-gray-500",
        badge: "bg-gray-100 text-gray-700",
      };
  }
};
 
export default function AdminDashboardPage() {
  const [search, setSearch] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [now, setNow] = useState<Date>(new Date());
 
  const [kpis, setKpis] = useState<KPIState>({
    employees: 245,
    presentToday: 218,
    payrollTotal: 125000,
    lowStock: 7,
    loading: false,
  });
 
  const [refreshing, setRefreshing] = useState<boolean>(false);
 
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
 
    return () => {
      window.clearInterval(timer);
    };
  }, []);
 
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
 
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
 
      setKpis((prev) => ({
        ...prev,
        employees: prev.employees,
        presentToday: prev.presentToday,
        payrollTotal: prev.payrollTotal,
        lowStock: prev.lowStock,
        loading: false,
      }));
    } finally {
      setRefreshing(false);
    }
  }, []);
 
  const filteredModules = useMemo(() => {
    const value = search.toLowerCase().trim();
 
    return modules.filter((module) => {
      const matchesCategory =
        activeCategory === "All" || module.category === activeCategory;
 
      if (!matchesCategory) return false;
 
      if (!value) return true;
 
      return (
        module.name.toLowerCase().includes(value) ||
        module.category.toLowerCase().includes(value) ||
        module.desc.toLowerCase().includes(value)
      );
    });
  }, [search, activeCategory]);
 
  const moduleStats = useMemo(() => {
    return {
      total: modules.length,
      active: modules.filter((module) => module.status === "Active").length,
      monitoring: modules.filter((module) => module.status === "Monitoring")
        .length,
      secure: modules.filter((module) => module.status === "Secure").length,
    };
  }, []);
 
  const kpiCards = useMemo(
    () => [
      {
        label: "Active Employees",
        value: kpis.loading ? "—" : kpis.employees.toLocaleString(),
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
        ring: "ring-blue-100",
        trend: "+12%",
        up: true,
      },
      {
        label: "Present Today",
        value: kpis.loading ? "—" : kpis.presentToday.toLocaleString(),
        icon: Clock,
        color: "text-green-600",
        bg: "bg-green-50",
        ring: "ring-green-100",
        trend: "+8%",
        up: true,
      },
      {
        label: "Monthly Payroll",
        value: kpis.loading
          ? "—"
          : `$${kpis.payrollTotal.toLocaleString()}`,
        icon: Wallet,
        color: "text-purple-600",
        bg: "bg-purple-50",
        ring: "ring-purple-100",
        trend: "+3%",
        up: true,
      },
      {
        label: "Low Stock Alerts",
        value: kpis.loading ? "—" : kpis.lowStock.toString(),
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        ring: "ring-red-100",
        trend: "-2",
        up: false,
      },
    ],
    [kpis]
  );
 
  const formattedDate = useMemo(() => {
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [now]);
 
  const formattedTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [now]);
 
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur">
                <Activity className="h-4 w-4" />
                <span>
                  System Operational · {moduleStats.total} Modules Active
                </span>
              </div>
 
              <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                AWM ERP VIP Admin Dashboard
              </h1>
 
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                Centralized enterprise administration panel with real-time
                monitoring, analytics, automation, and secure module
                management across all {moduleStats.total} platform modules.
              </p>
            </div>
 
            <div className="flex w-full flex-col gap-4 xl:w-96">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-blue-200">{formattedDate}</p>
 
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {formattedTime}
                </p>
              </div>
 
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 
                <input
                  type="text"
                  value={search}
                  placeholder="Search ERP modules..."
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
 
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
 
                {refreshing ? "Refreshing Dashboard..." : "Refresh Dashboard"}
              </button>
            </div>
          </div>
        </section>
 
        {/* KPI Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
 
            return (
              <article
                key={card.label}
                className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${card.ring}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
 
                    <h2 className="mt-3 text-3xl font-bold text-slate-900">
                      {card.value}
                    </h2>
                  </div>
 
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
 
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {card.up ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
 
                  <span
                    className={
                      card.up
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                    }
                  >
                    {card.trend}
                  </span>
 
                  <span className="text-slate-400">vs last month</span>
                </div>
              </article>
            );
          })}
        </section>
 
        {/* Module Statistics */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Modules
            </p>
 
            <h3 className="mt-3 text-4xl font-bold text-slate-900">
              {moduleStats.total}
            </h3>
          </div>
 
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active</p>
 
            <h3 className="mt-3 text-4xl font-bold text-green-600">
              {moduleStats.active}
            </h3>
          </div>
 
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Monitoring</p>
 
            <h3 className="mt-3 text-4xl font-bold text-yellow-600">
              {moduleStats.monitoring}
            </h3>
          </div>
 
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Secure</p>
 
            <h3 className="mt-3 text-4xl font-bold text-red-600">
              {moduleStats.secure}
            </h3>
          </div>
        </section>
 
        {/* Category Filter Chips */}
        <section className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-1.5 opacity-70">
                  ({modules.filter((m) => m.category === category).length})
                </span>
              )}
            </button>
          ))}
        </section>
 
        {/* Module Header */}
        <section className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              ERP Modules
            </h2>
 
            <p className="mt-1 text-sm text-slate-500">
              Enterprise-wide module administration & monitoring
            </p>
          </div>
 
          <div className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            {filteredModules.length} of {moduleStats.total} modules shown
          </div>
        </section>
 
        {/* Module Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filteredModules.map((module) => {
            const Icon = module.icon;
 
            const statusStyle = getStatusStyle(module.status);
 
            return (
              <Link
                key={module.id}
                href={module.path}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:bg-blue-50">
                    <Icon className="h-6 w-6 text-slate-700 transition group-hover:text-blue-600" />
                  </div>
 
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                    />
 
                    {module.status}
                  </span>
                </div>
 
                <div className="mt-5">
                  <h3 className="text-xl font-bold text-slate-900 transition group-hover:text-blue-600">
                    {module.name}
                  </h3>
 
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {module.desc}
                  </p>
                </div>
 
                <div className="mt-6 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {module.category}
                  </span>
 
                  <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-blue-600">
                    Open Module
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
 
        {/* Empty State */}
        {filteredModules.length === 0 && (
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              No Modules Found
            </h3>
 
            <p className="mt-3 text-slate-500">
              Try another keyword or category to locate your ERP module.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}