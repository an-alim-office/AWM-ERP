"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ActivitySquare,
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
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function ToggleButton({
  enabled,
  onClick,
  activeClass = "bg-blue-600",
  size = "sm",
  label,
}: {
  enabled: boolean;
  onClick: () => void;
  activeClass?: string;
  size?: "sm" | "md";
  label: string;
}) {
  const widthClass = size === "md" ? "w-12" : "w-11";
  const knobClass = size === "md" ? (enabled ? "translate-x-7" : "translate-x-1") : enabled ? "translate-x-6" : "translate-x-1";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onClick}
      className={`${widthClass} h-6 rounded-full transition relative ${enabled ? activeClass : "bg-slate-300"}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${knobClass}`} />
    </button>
  );
}

function MetricCardView({ card }: { card: MetricCard }) {
  const Icon = card.icon;

  return (
    <div className={`border rounded-xl p-5 ${card.cardClass ?? "bg-slate-50"} ${card.spanClass ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-sm text-slate-800">{card.title}</h4>
        <Icon className="h-5 w-5 text-slate-600" />
      </div>

      <p className={`text-3xl font-extrabold text-slate-900 mt-4 ${card.valueClass ?? ""}`}>{card.value}</p>

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

      <div className={section.gridClass ?? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"}>
        {section.cards.map((card) => (
          <MetricCardView key={`${section.title}-${card.title}`} card={card} />
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<NotificationsState>({
    email: true,
    sms: false,
    whatsapp: true,
  });

  const [multiBranchEnabled, setMultiBranchEnabled] = useState(true);
  const [systemEmergencyLock, setSystemEmergencyLock] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [currentUserRole] = useState("SUPER_ADMIN");

  const [globalLockdownLoading, setGlobalLockdownLoading] = useState(false);
  const [globalLockdownActive, setGlobalLockdownActive] = useState(false);

  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [apiMonitoringEnabled, setApiMonitoringEnabled] = useState(true);
  const [disasterRecoveryEnabled, setDisasterRecoveryEnabled] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [lastAction, setLastAction] = useState("System ready. No action executed yet.");

  const actions: ActionItem[] = useMemo(
    () => [
      {
        title: "Global AI Shutdown",
        button: "Initiate AI Emergency Shutdown",
        color: "bg-black hover:bg-slate-900",
        action: "AI_SHUTDOWN",
        card: "bg-slate-50",
      },
      {
        title: "Global Data Sync",
        button: "Force Global Data Sync",
        color: "bg-cyan-600 hover:bg-cyan-700",
        action: "GLOBAL_SYNC",
        card: "bg-cyan-50",
      },
      {
        title: "Enterprise Backup",
        button: "Execute Full Backup",
        color: "bg-emerald-600 hover:bg-emerald-700",
        action: "FULL_BACKUP",
        card: "bg-emerald-50",
      },
      {
        title: "Security Scan",
        button: "Run Global Security Scan",
        color: "bg-blue-600 hover:bg-blue-700",
        action: "SECURITY_SCAN",
        card: "bg-blue-50",
      },
      {
        title: "Zero Trust Security",
        button: "Activate Zero-Trust Mode",
        color: "bg-indigo-600 hover:bg-indigo-700",
        action: "ZERO_TRUST",
        card: "bg-indigo-50",
      },
      {
        title: "Disaster Recovery",
        button: "Start Recovery Mode",
        color: "bg-rose-600 hover:bg-rose-700",
        action: "DISASTER_RECOVERY",
        card: "bg-rose-50",
      },
      {
        title: "Global AI Shutdown",
        button: "Initiate AI Emergency Shutdown",
        color: "bg-black hover:bg-slate-900",
        action: "AI_SHUTDOWN",
        card: "bg-slate-50",
      },
      {
        title: "Global Data Sync",
        button: "Force Global Data Sync",
        color: "bg-cyan-600 hover:bg-cyan-700",
        action: "GLOBAL_SYNC",
        card: "bg-cyan-50",
      },
      {
        title: "Enterprise Backup",
        button: "Execute Full Backup",
        color: "bg-emerald-600 hover:bg-emerald-700",
        action: "FULL_BACKUP",
        card: "bg-emerald-50",
      },
      {
        title: "User Access Freeze",
        button: "Freeze All User Access",
        color: "bg-amber-600 hover:bg-amber-700",
        action: "FREEZE_ACCESS",
        card: "bg-amber-50",
      },
      {
        title: "AI Decision Reset",
        button: "Reset AI Decision Engine",
        color: "bg-violet-600 hover:bg-violet-700",
        action: "AI_RESET",
        card: "bg-violet-50",
      },
      {
        title: "Disaster Recovery",
        button: "Start Recovery Mode",
        color: "bg-rose-600 hover:bg-rose-700",
        action: "DISASTER_RECOVERY",
        card: "bg-rose-50",
      },
      {
        title: "Security Scan",
        button: "Run Global Security Scan",
        color: "bg-blue-600 hover:bg-blue-700",
        action: "SECURITY_SCAN",
        card: "bg-blue-50",
      },
      {
        title: "Cache Rebuild",
        button: "Rebuild Infrastructure Cache",
        color: "bg-slate-700 hover:bg-slate-800",
        action: "CACHE_REBUILD",
        card: "bg-slate-100",
      },
      {
        title: "Zero Trust Security",
        button: "Activate Zero-Trust Mode",
        color: "bg-indigo-600 hover:bg-indigo-700",
        action: "ZERO_TRUST",
        card: "bg-indigo-50",
      },
      {
        title: "Audit Export",
        button: "Export Audit Logs",
        color: "bg-orange-600 hover:bg-orange-700",
        action: "EXPORT_AUDIT",
        card: "bg-orange-50",
      },
      {
        title: "Branch Sync Reset",
        button: "Reset Branch Synchronization",
        color: "bg-teal-600 hover:bg-teal-700",
        action: "BRANCH_SYNC_RESET",
        card: "bg-teal-50",
      },
      {
        title: "AI Monitoring",
        button: "Restart AI Monitoring",
        color: "bg-pink-600 hover:bg-pink-700",
        action: "AI_MONITORING",
        card: "bg-pink-50",
      },
      {
        title: "Performance Optimization",
        button: "Optimize System Performance",
        color: "bg-lime-600 hover:bg-lime-700",
        action: "PERFORMANCE_OPTIMIZATION",
        card: "bg-lime-50",
      },
      {
        title: "Executive Broadcast",
        button: "Send Global Executive Alert",
        color: "bg-fuchsia-600 hover:bg-fuchsia-700",
        action: "EXECUTIVE_ALERT",
        card: "bg-fuchsia-50",
      },
      {
        title: "Infrastructure Restart",
        button: "Restart Infrastructure Services",
        color: "bg-gray-700 hover:bg-gray-800",
        action: "INFRA_RESTART",
        card: "bg-gray-100",
      },
      {
        title: "Database Protection",
        button: "Lock Enterprise Database",
        color: "bg-red-700 hover:bg-red-800",
        action: "DATABASE_LOCK",
        card: "bg-red-100",
      },
      {
        title: "Server Health Recovery",
        button: "Recover Failed Servers",
        color: "bg-green-700 hover:bg-green-800",
        action: "SERVER_RECOVERY",
        card: "bg-green-100",
      },
      {
        title: "AI Infrastructure Boost",
        button: "Boost AI Infrastructure",
        color: "bg-purple-700 hover:bg-purple-800",
        action: "AI_BOOST",
        card: "bg-purple-100",
      },
      {
        title: "Enterprise Maintenance",
        button: "Enable Maintenance Mode",
        color: "bg-yellow-600 hover:bg-yellow-700",
        action: "MAINTENANCE_MODE",
        card: "bg-yellow-100",
      },
      {
        title: "Live Infrastructure Analytics",
        button: "Launch Live Analytics",
        color: "bg-sky-600 hover:bg-sky-700",
        action: "LIVE_ANALYTICS",
        card: "bg-sky-100",
      },
    ],
    []
  );

  const handleEnterpriseAction = (action: string) => {
    console.log("Enterprise Action:", action);
    setLastAction(`Executed enterprise action: ${action}`);
  };

  const handleSaveAllConfigurations = async () => {
    try {
      setIsSaving(true);
      setLastAction("Saving all configurations...");
      await new Promise((resolve) => setTimeout(resolve, 900));
      setLastAction("All configurations saved successfully.");
      console.log("✅ All configurations saved");
    } catch (error) {
      console.error("Save failed", error);
      setLastAction("Configuration save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGlobalLockdown = async () => {
    const hasPermission = (allowedRoles: string[]) => allowedRoles.includes(currentUserRole);

    if (!hasPermission(["SUPER_ADMIN", "GLOBAL_ADMIN"])) {
      setLastAction("Permission denied: Global Lockdown requires SUPER_ADMIN or GLOBAL_ADMIN.");
      return;
    }

    try {
      setGlobalLockdownLoading(true);
      setLastAction("Activating Global Lockdown...");
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setGlobalLockdownActive(true);
      setSystemEmergencyLock(true);
      setLastAction("🚨 GLOBAL LOCKDOWN ACTIVATED");
      console.log("🚨 GLOBAL LOCKDOWN ACTIVATED");
    } catch (error) {
      console.error("Global Lockdown Failed", error);
      setLastAction("Global Lockdown failed.");
    } finally {
      setGlobalLockdownLoading(false);
    }
  };

  const infrastructureSections: MetricSection[] = useMemo(
    () => [
      {
        title: "Live Infrastructure Status",
        icon: Activity,
        iconClass: "text-cyan-600",
        gridClass: "grid grid-cols-1 md:grid-cols-3 gap-4",
        cards: [
          {
            title: "CPU Load",
            value: "42%",
            description: "Stable Operational State",
            icon: Cpu,
            cardClass: "bg-slate-50",
          },
          {
            title: "Storage Usage",
            value: "74%",
            description: "14.8TB / 20TB utilized",
            icon: HardDrive,
            cardClass: "bg-slate-50",
          },
          {
            title: "Network Traffic",
            value: "1.8Gbps",
            description: "Global Sync Healthy",
            icon: Network,
            cardClass: "bg-slate-50",
          },
        ],
      },
      {
        title: "AI-Powered Global Automation",
        icon: CloudLightning,
        iconClass: "text-violet-600",
        gridClass: "grid grid-cols-1 md:grid-cols-3 gap-4",
        cards: [
          {
            title: "Auto Load Balancing",
            value: "ACTIVE",
            description: "AI automatically redistributes traffic across global servers",
            icon: Activity,
            cardClass: "bg-slate-50",
            valueClass: "text-emerald-600",
          },
          {
            title: "Smart Failover Recovery",
            value: "ENABLED",
            description: "Detects outages & switches backup regions automatically",
            icon: RefreshCcw,
            cardClass: "bg-slate-50",
            valueClass: "text-emerald-600",
          },
          {
            title: "AI Threat Detection",
            value: "PROTECTED",
            description: "Real-time anomaly detection across all branches",
            icon: Shield,
            cardClass: "bg-slate-50",
            valueClass: "text-emerald-600",
          },
        ],
      },
      {
        title: "AI Global Automation Engine",
        icon: BrainCircuit,
        iconClass: "text-violet-600",
        cards: [
          {
            title: "AI Load Balancer",
            value: "ACTIVE",
            description: "Automatically redistributing global traffic load",
            icon: Activity,
            cardClass: "bg-gradient-to-br from-violet-50 to-white",
          },
          {
            title: "Failure Prediction",
            value: "98.2%",
            description: "AI anomaly detection accuracy",
            icon: AlertTriangle,
            cardClass: "bg-gradient-to-br from-red-50 to-white",
          },
          {
            title: "Smart Failover",
            value: "0.8s",
            description: "Average disaster recovery switch time",
            icon: RefreshCcw,
            cardClass: "bg-gradient-to-br from-cyan-50 to-white",
          },
          {
            title: "Global AI Health",
            value: "99.99%",
            description: "Worldwide infrastructure stability",
            icon: ShieldCheck,
            cardClass: "bg-gradient-to-br from-emerald-50 to-white",
          },
        ],
      },
      {
        title: "Global Security & Threat Center",
        icon: ShieldAlert,
        iconClass: "text-red-600",
        cards: [
          {
            title: "Threat Level",
            value: "LOW",
            description: "No active global attack detected",
            icon: ShieldAlert,
            cardClass: "bg-red-50",
            valueClass: "text-red-600",
          },
          {
            title: "Suspicious Logins",
            value: "3",
            description: "AI flagged unusual activities",
            icon: Eye,
            cardClass: "bg-amber-50",
          },
          {
            title: "Zero Trust Security",
            value: "ENABLED",
            description: "All branch access fully verified",
            icon: Lock,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Fraud Detection AI",
            value: "ACTIVE",
            description: "Monitoring transactions worldwide",
            icon: BrainCircuit,
            cardClass: "bg-emerald-50",
          },
        ],
      },
      {
        title: "Global AI Command Center",
        icon: Sparkles,
        iconClass: "text-violet-600",
        cards: [
          {
            title: "AI Decision Engine",
            value: "ACTIVE",
            description: "Autonomous operational intelligence enabled",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
          {
            title: "Revenue Forecast AI",
            value: "+18.4%",
            description: "Predicted quarterly growth",
            icon: TrendingUp,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Auto Resource Scaling",
            value: "ENABLED",
            description: "Dynamic infrastructure optimization active",
            icon: ServerCog,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Global AI Score",
            value: "9.8/10",
            description: "Enterprise optimization rating",
            icon: BadgeCheck,
            cardClass: "bg-amber-50",
          },
        ],
      },
      {
        title: "Global Compliance & Governance Center",
        icon: Scale,
        iconClass: "text-indigo-600",
        cards: [
          {
            title: "GDPR Compliance",
            value: "ACTIVE",
            description: "European privacy & user data governance enabled",
            icon: Fingerprint,
            cardClass: "bg-indigo-50",
          },
          {
            title: "SOC2 Monitoring",
            value: "PASSED",
            description: "Continuous enterprise audit validation running",
            icon: FileCheck,
            cardClass: "bg-cyan-50",
          },
          {
            title: "AI Policy Engine",
            value: "ENABLED",
            description: "Autonomous AI governance & ethics monitoring active",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
          {
            title: "Legal Risk Engine",
            value: "LOW",
            description: "No international compliance conflicts detected",
            icon: Scale,
            cardClass: "bg-red-50",
          },
        ],
      },
      {
        title: "Global Data Governance & Backup Center",
        icon: DatabaseBackup,
        iconClass: "text-cyan-600",
        cards: [
          {
            title: "Global Backup Nodes",
            value: "24 ACTIVE",
            description: "Multi-region encrypted backups operational",
            icon: Archive,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Live Replication",
            value: "0.4s",
            description: "Global database synchronization latency",
            icon: RefreshCw,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Disaster Recovery",
            value: "READY",
            description: "Autonomous failover systems enabled",
            icon: ShieldCheck,
            cardClass: "bg-amber-50",
          },
          {
            title: "Data Retention Policy",
            value: "10 YEARS",
            description: "Enterprise legal retention policy active",
            icon: Database,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global AI Command & Threat Center",
        icon: Radar,
        iconClass: "text-rose-600",
        cards: [
          {
            title: "Threat Detection",
            value: "24/7",
            description: "AI continuously monitoring global cyber attacks",
            icon: ShieldBan,
            cardClass: "bg-rose-50",
          },
          {
            title: "Suspicious Login AI",
            value: "3 Alerts",
            description: "Unusual branch login patterns detected",
            icon: ScanSearch,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Global Uptime",
            value: "99.999%",
            description: "Worldwide infrastructure operating normally",
            icon: ActivitySquare,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Auto Defense Engine",
            value: "ENABLED",
            description: "AI auto-isolating suspicious infrastructure nodes",
            icon: Siren,
            cardClass: "bg-amber-50",
          },
        ],
      },
      {
        title: "AI Predictive Business Analytics",
        icon: LineChart,
        iconClass: "text-emerald-600",
        gridClass: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
        cards: [
          {
            title: "Branch Performance",
            value: "92%",
            description: "Global operational efficiency score",
            icon: BarChart4,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Operational Risk",
            value: "LOW",
            description: "No major infrastructure risk predicted",
            icon: Shield,
            cardClass: "bg-amber-50",
          },
          {
            title: "Decision Engine",
            value: "ACTIVE",
            description: "AI generating executive-level strategic insights",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Financial Intelligence Center",
        icon: Wallet,
        iconClass: "text-emerald-600",
        cards: [
          {
            title: "Global Cashflow",
            value: "$48.2M",
            description: "Consolidated worldwide liquidity balance",
            icon: DollarSign,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Tax Automation",
            value: "ACTIVE",
            description: "AI-driven VAT & regional tax calculations enabled",
            icon: Receipt,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Fraud Monitor",
            value: "SECURE",
            description: "No suspicious transaction anomalies detected",
            icon: ShieldBan,
            cardClass: "bg-rose-50",
          },
          {
            title: "Smart Forecast AI",
            value: "+22%",
            description: "Predicted annual enterprise growth trajectory",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Workforce & Access Intelligence",
        icon: Users,
        iconClass: "text-blue-600",
        gridClass: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
        cards: [
          {
            title: "Active Workforce",
            value: "12,842",
            description: "Employees connected across global branches",
            icon: Users,
            cardClass: "bg-blue-50",
          },
          {
            title: "Trusted Devices",
            value: "98.7%",
            description: "Verified enterprise device authorization rate",
            icon: Laptop,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Workforce AI",
            value: "ENABLED",
            description: "Predictive workforce analytics & optimization active",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Financial Control Grid",
        icon: Wallet,
        iconClass: "text-emerald-600",
        cards: [
          {
            title: "Global Cashflow",
            value: "$48.2M",
            description: "Real-time enterprise liquidity across all regions",
            icon: Wallet,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Tax Automation",
            value: "ACTIVE",
            description: "Automated VAT & regional compliance validation",
            icon: FileCheck,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Smart Billing",
            value: "LIVE",
            description: "AI-powered invoice synchronization enabled",
            icon: Database,
            cardClass: "bg-amber-50",
          },
          {
            title: "Finance AI",
            value: "ENABLED",
            description: "AI forecasting & enterprise financial optimization active",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Recovery & Resilience Grid",
        icon: CloudLightning,
        iconClass: "text-cyan-600",
        cards: [
          {
            title: "Failover Status",
            value: "READY",
            description: "Multi-region disaster recovery prepared globally",
            icon: CloudLightning,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Attack Prevention",
            value: "ACTIVE",
            description: "Automated infrastructure protection enabled",
            icon: Shield,
            cardClass: "bg-rose-50",
          },
          {
            title: "System Health",
            value: "99.999%",
            description: "Global infrastructure operating normally",
            icon: Activity,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Recovery AI",
            value: "ENABLED",
            description: "Self-healing infrastructure & recovery automation active",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Data & Storage Intelligence",
        icon: Database,
        iconClass: "text-indigo-600",
        cards: [
          {
            title: "Data Replication",
            value: "LIVE",
            description: "Real-time cross-region database synchronization active",
            icon: RefreshCw,
            cardClass: "bg-indigo-50",
          },
          {
            title: "Storage Health",
            value: "97.8%",
            description: "Distributed storage clusters operating efficiently",
            icon: HardDrive,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Backup Engine",
            value: "ACTIVE",
            description: "Automated encrypted enterprise backups running",
            icon: Archive,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Data Intelligence AI",
            value: "ENABLED",
            description: "AI optimizing enterprise storage & data routing",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global API & Integration Orchestration",
        icon: CloudLightning,
        iconClass: "text-amber-600",
        cards: [
          {
            title: "API Gateway",
            value: "248 APIs",
            description: "International services connected successfully",
            icon: Globe2,
            cardClass: "bg-amber-50",
          },
          {
            title: "Webhook Status",
            value: "STABLE",
            description: "Enterprise event pipelines operating normally",
            icon: GitBranch,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Third-Party Control",
            value: "VERIFIED",
            description: "Secure vendor authentication & token validation active",
            icon: ShieldCheck,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Integration AI",
            value: "ACTIVE",
            description: "AI orchestrating enterprise-wide integrations automatically",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
        ],
      },
      {
        title: "Global Executive Command Center",
        icon: Crown,
        iconClass: "text-yellow-600",
        cards: [
          {
            title: "Executive Access",
            value: "LEVEL 1",
            description: "Highest enterprise command authorization active",
            icon: KeyRound,
            cardClass: "bg-yellow-50",
          },
          {
            title: "Decision Hub",
            value: "LIVE",
            description: "Global executive monitoring & branch coordination active",
            icon: Building2,
            cardClass: "bg-blue-50",
          },
          {
            title: "Strategic AI",
            value: "ENABLED",
            description: "AI generating executive strategic recommendations",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
          {
            title: "Enterprise Status",
            value: "SECURE",
            description: "Worldwide enterprise systems fully operational",
            icon: Shield,
            cardClass: "bg-emerald-50",
          },
        ],
      },
      {
        title: "Global Data Mesh & AI Sync Layer",
        icon: Database,
        iconClass: "text-indigo-600",
        cards: [
          {
            title: "Real-Time Data Sync",
            value: "ACTIVE",
            description: "All branches synchronized in 0.9s latency",
            icon: RefreshCcw,
            cardClass: "bg-indigo-50",
          },
          {
            title: "Distributed Data Mesh",
            value: "128 NODES",
            description: "Decentralized ERP data architecture active",
            icon: GitBranch,
            cardClass: "bg-cyan-50",
          },
          {
            title: "AI Data Routing Engine",
            value: "OPTIMIZED",
            description: "Smart routing between global ERP clusters",
            icon: Cpu,
            cardClass: "bg-violet-50",
          },
          {
            title: "Cloud Sync Layer",
            value: "STABLE",
            description: "Multi-region cloud replication healthy",
            icon: Cloud,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Event Stream Engine",
            value: "LIVE",
            description: "Kafka-style event streaming active across ERP",
            icon: Zap,
            cardClass: "bg-amber-50",
          },
          {
            title: "Data Consistency Engine",
            value: "99.99%",
            description: "Cross-region integrity validation passed",
            icon: ShieldCheck,
            cardClass: "bg-slate-50",
          },
          {
            title: "Global ERP State Monitor",
            value: "SYNCHRONIZED",
            description: "All enterprise modules unified under global state layer",
            icon: Globe2,
            cardClass: "bg-blue-50",
            spanClass: "xl:col-span-2",
          },
        ],
      },
      {
        title: "Global AI Autopilot Layer",
        icon: BrainCircuit,
        iconClass: "text-violet-600",
        cards: [
          {
            title: "Autonomous Decision Engine",
            value: "ACTIVE",
            description: "AI is making real-time operational decisions",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
          {
            title: "Performance Control AI",
            value: "97.8%",
            description: "System-wide efficiency automatically tuned",
            icon: Cpu,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Self-Healing System AI",
            value: "ENABLED",
            description: "Auto-recovery from system anomalies in real-time",
            icon: RefreshCcw,
            cardClass: "bg-amber-50",
          },
          {
            title: "Risk Prevention Core",
            value: "PROTECTED",
            description: "Predictive risk blocking before execution",
            icon: AlertTriangle,
            cardClass: "bg-red-50",
          },
          {
            title: "AI Governance Control",
            value: "ENFORCED",
            description: "Policies automatically enforced across all modules",
            icon: ShieldCheck,
            cardClass: "bg-indigo-50",
          },
          {
            title: "Global Autopilot Status",
            value: "FULLY AUTONOMOUS",
            description: "ERP operating independently with AI decision core active",
            icon: Cpu,
            cardClass: "bg-blue-50",
            spanClass: "xl:col-span-2",
          },
        ],
      },
      {
        title: "Predictive Enterprise Intelligence Core",
        icon: LineChart,
        iconClass: "text-emerald-600",
        cards: [
          {
            title: "Revenue Forecast AI",
            value: "+22.8%",
            description: "Predicted global revenue growth next quarter",
            icon: TrendingUp,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Branch Failure Risk",
            value: "LOW RISK",
            description: "AI detected no critical branch instability",
            icon: AlertTriangle,
            cardClass: "bg-red-50",
          },
          {
            title: "Performance Prediction",
            value: "94.6%",
            description: "Global efficiency score predicted stable",
            icon: BarChart4,
            cardClass: "bg-blue-50",
          },
          {
            title: "Strategic AI Insight",
            value: "OPTIMIZED",
            description: "AI suggests optimal expansion strategy globally",
            icon: BrainCircuit,
            cardClass: "bg-violet-50",
          },
          {
            title: "Activity Forecast",
            value: "STABLE",
            description: "User & branch activity trend remains consistent",
            icon: Activity,
            cardClass: "bg-cyan-50",
          },
          {
            title: "Target Optimization AI",
            value: "97.2%",
            description: "AI improving KPI targeting accuracy",
            icon: Target,
            cardClass: "bg-amber-50",
          },
          {
            title: "Global Decision Health",
            value: "99.91%",
            description: "All predictive models operating within safe thresholds",
            icon: ShieldCheck,
            cardClass: "bg-slate-50",
            spanClass: "xl:col-span-2",
          },
        ],
      },
      {
        title: "Global Autonomous ERP Core",
        icon: Cpu,
        iconClass: "text-indigo-600",
        cards: [
          {
            title: "Core AI Brain",
            value: "ACTIVE",
            description: "Central intelligence controlling entire ERP system",
            icon: BrainCircuit,
            cardClass: "bg-indigo-50",
          },
          {
            title: "Auto Decision Engine",
            value: "AUTONOMOUS",
            description: "No human approval required for system operations",
            icon: Bot,
            cardClass: "bg-violet-50",
          },
          {
            title: "Self Repair System",
            value: "HEALING",
            description: "Auto-fixing system failures in real-time",
            icon: RefreshCcw,
            cardClass: "bg-emerald-50",
          },
          {
            title: "Security Shield AI",
            value: "MAXIMUM",
            description: "Full enterprise-level threat protection active",
            icon: ShieldCheck,
            cardClass: "bg-red-50",
          },
          {
            title: "System Performance Index",
            value: "99.999%",
            description: "Global ERP operating at peak efficiency",
            icon: Activity,
            cardClass: "bg-blue-50",
            spanClass: "xl:col-span-2",
          },
          {
            title: "Autonomous Status",
            value: "FULLY AUTONOMOUS",
            description: "ERP system is now self-managed, self-optimized, and self-controlled",
            icon: Cpu,
            cardClass: "bg-slate-900 text-white",
            valueClass: "text-white",
            spanClass: "xl:col-span-2",
          },
        ],
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global System Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure enterprise-wide architectures, compliance, branches, and core integrations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAllConfigurations}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition"
          >
            {isSaving ? "Saving..." : "Save All Configurations"}
          </button>
        </header>

        <Tabs defaultValue="general" className="w-full">
          {/* NAV BAR */}
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full bg-slate-100 p-1 rounded-xl border mb-6 gap-1 h-auto">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Building2 className="h-4 w-4 mr-2 text-slate-500" /> General
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Shield className="h-4 w-4 mr-2 text-slate-500" /> Security
            </TabsTrigger>

            <TabsTrigger
              value="financials"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Wallet className="h-4 w-4 mr-2 text-slate-500" /> Financials
            </TabsTrigger>

            <TabsTrigger
              value="integration"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Database className="h-4 w-4 mr-2 text-slate-500" /> Integrations
            </TabsTrigger>

            <TabsTrigger
              value="infrastructure"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Server className="h-4 w-4 mr-2 text-slate-500" /> Infrastructure
            </TabsTrigger>

            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5 rounded-lg font-medium text-xs md:text-sm"
            >
              <Settings2 className="h-4 w-4 mr-2 text-slate-500" /> Multi-Branch
            </TabsTrigger>
          </TabsList>

          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-slate-500">Current Access Role</p>
              <p className="font-bold text-blue-700">{currentUserRole}</p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-white border flex-1">
              <p className="text-xs text-slate-500">Last System Action</p>
              <p className="font-semibold text-slate-800">{lastAction}</p>
            </div>
          </div>

          {/* 1. GENERAL & REGIONAL COMPLIANCE TAB */}
          <TabsContent value="general" className="space-y-6">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-900 flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-blue-600" /> Company Profile & Regionalization
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Enterprise Legal Name</label>
                    <input defaultValue="AWM Enterprise Ltd." className="w-full p-3 border rounded-lg bg-slate-50 font-medium" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Industry Vertical</label>
                    <input defaultValue="Manufacturing & Distribution" className="w-full p-3 border rounded-lg bg-slate-50 font-medium" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">CR Number / Trade License</label>
                    <input placeholder="Ex: 1010XXXXXX" className="w-full p-3 border rounded-lg bg-white" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">VAT / TIN / BIN Number</label>
                    <input placeholder="Ex: 3000XXXXXXXXXXX" className="w-full p-3 border rounded-lg bg-white" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-lg font-semibold mb-3 text-slate-800 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-slate-600" /> Notification Channels
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">System Email Alerts</p>
                      <p className="text-xs text-slate-500">Critical system updates</p>
                    </div>

                    <ToggleButton
                      label="Toggle System Email Alerts"
                      enabled={notifications.email}
                      onClick={() => setNotifications((prev) => ({ ...prev, email: !prev.email }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">SMS Gateway</p>
                      <p className="text-xs text-slate-500">OTP & Payroll dispatches</p>
                    </div>

                    <ToggleButton
                      label="Toggle SMS Gateway"
                      enabled={notifications.sms}
                      onClick={() => setNotifications((prev) => ({ ...prev, sms: !prev.sms }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">WhatsApp Business Automated</p>
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
            </section>
          </TabsContent>

          {/* 2. SECURITY & RBAC TAB */}
          <TabsContent value="security" className="space-y-4">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-indigo-600" /> Role-Based Access Control (RBAC)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Define permissions across different management layers, global accounts, and branches.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEnterpriseAction("CONFIGURE_MATRIX_MAP")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                >
                  Configure Matrix Map
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Policy Level 1</span>
                  <h3 className="font-bold text-sm mt-2 text-slate-800">Password Compliance Enforcer</h3>
                  <p className="text-xs text-slate-500 mb-3">Enforce alphanumeric characters, signs, and monthly mandatory rotation.</p>
                  <select className="p-2 border rounded-lg w-full bg-white text-sm">
                    <option>Strict (Minimum 12 Characters + 2FA)</option>
                    <option>Standard (Minimum 8 Characters)</option>
                  </select>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-500">Require 2FA via authenticator apps for all corporate roles.</p>
                  </div>

                  <ToggleButton
                    label="Toggle Two-Factor Authentication"
                    enabled={twoFactorAuth}
                    activeClass="bg-indigo-600"
                    onClick={() => setTwoFactorAuth((prev) => !prev)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-base">
                  <History className="h-4 w-4 text-slate-600" /> Global Audit Trails (Live Tracking)
                </h3>

                <div className="border rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2.5 font-bold grid grid-cols-3 border-b">
                    <div>Timestamp</div>
                    <div>Operator Role</div>
                    <div>Action Context</div>
                  </div>

                  <div className="p-2.5 grid grid-cols-3 border-b bg-white text-slate-600">
                    <div>Just Now</div>
                    <div className="text-blue-600 font-medium">Super Admin</div>
                    <div>Updated Regional .env.local system configurations</div>
                  </div>

                  <div className="p-2.5 grid grid-cols-3 bg-white text-slate-600">
                    <div>Live</div>
                    <div className="text-indigo-600 font-medium">{currentUserRole}</div>
                    <div>{lastAction}</div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* 3. FINANCIALS TAB */}
          <TabsContent value="financials" className="space-y-4">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-900 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" /> Multi-Currency Ledger & Regional Tax
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Primary Base Currency</label>
                    <select className="w-full p-3 border rounded-lg bg-white font-medium text-sm">
                      <option>SAR (Saudi Riyal) - Regional Corporate</option>
                      <option>BDT (Bangladeshi Taka)</option>
                      <option>USD (United States Dollar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Tax Architecture Rule</label>
                    <select className="w-full p-3 border rounded-lg bg-white font-medium text-sm">
                      <option>ZATCA Compliance (Saudi Arabia 15%)</option>
                      <option>NBR VAT Compliance (Bangladesh)</option>
                      <option>Custom Tax Matrix</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Global VAT Rate (%)</label>
                    <input type="number" defaultValue="15" className="w-full p-3 border rounded-lg bg-white font-medium text-sm" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <strong>E-Invoicing Note:</strong> All invoices will automatically append cryptographically signed XML segments aligned with local enterprise compliance.
              </div>
            </section>
          </TabsContent>

          {/* 4. INTEGRATIONS TAB */}
          <TabsContent value="integration" className="space-y-4">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-900 flex items-center gap-2">
                  <CloudLightning className="h-5 w-5 text-amber-500" /> Third-Party Enterprise APIs
                </h2>

                <p className="text-xs text-slate-500 -mt-2 mb-4">
                  Manage third-party microservices. All system secrets are processed through protected server architecture.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 border rounded-xl bg-slate-50 gap-4">
                    <div>
                      <h4 className="font-bold text-sm">Payment Gateway Service</h4>
                      <p className="text-xs text-slate-500">Mada / Visa / Mastercard clearing API pipelines</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">Active & Hooked</span>
                  </div>

                  <div className="flex justify-between items-center p-4 border rounded-xl bg-slate-50 gap-4">
                    <div>
                      <h4 className="font-bold text-sm">Twilio / SMS Operator Node</h4>
                      <p className="text-xs text-slate-500">International programmatic notification channels</p>
                    </div>
                    <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-semibold">Configured</span>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* 5. INFRASTRUCTURE & SYSTEM HEALTH TAB */}
          <TabsContent value="infrastructure" className="space-y-6">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-900 flex items-center gap-2">
                  <Server className="h-5 w-5 text-cyan-600" />
                  Infrastructure & System Health
                </h2>

                <p className="text-sm text-slate-500">
                  Monitor cloud synchronization, API uptime, storage nodes, and enterprise recovery systems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-slate-50 border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4 text-cyan-600" />
                    <h3 className="font-bold text-sm">Global Servers</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">24</p>
                  <p className="text-xs text-emerald-600 mt-1">Active Worldwide Nodes</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-bold text-sm">API Uptime</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">99.98%</p>
                  <p className="text-xs text-emerald-600 mt-1">All Services Operational</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4 text-amber-600" />
                    <h3 className="font-bold text-sm">Cloud Storage</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">14.8TB</p>
                  <p className="text-xs text-slate-500 mt-1">Synced Across Regions</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-sm">Network Health</h3>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">Excellent</p>
                  <p className="text-xs text-emerald-600 mt-1">Global Traffic Stable</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Cloud Synchronization</h3>
                    <p className="text-xs text-slate-500">Real-time replication between enterprise branches.</p>
                  </div>

                  <ToggleButton
                    label="Toggle Cloud Synchronization"
                    enabled={cloudSyncEnabled}
                    activeClass="bg-cyan-600"
                    onClick={() => setCloudSyncEnabled((prev) => !prev)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">API Monitoring</h3>
                    <p className="text-xs text-slate-500">Observe enterprise gateway uptime and latency.</p>
                  </div>

                  <ToggleButton
                    label="Toggle API Monitoring"
                    enabled={apiMonitoringEnabled}
                    activeClass="bg-cyan-600"
                    onClick={() => setApiMonitoringEnabled((prev) => !prev)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Disaster Recovery</h3>
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

              {/* GLOBAL BRANCH CONTROL CENTER */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-blue-600" />
                  Global Branch Control Center
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-5 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">Real-Time Branch Sync</h4>
                        <p className="text-sm text-slate-500 mt-1">Synchronize all international branches instantly</p>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>

                    <div className="mt-4">
                      <p className="text-2xl font-extrabold text-slate-900">128 Branches</p>
                      <p className="text-xs text-emerald-600 mt-1">Fully Connected</p>
                    </div>
                  </div>

                  <div className="border rounded-xl p-5 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">Emergency Global Lock</h4>
                        <p className="text-sm text-slate-500 mt-1">Instantly freeze all branch operations worldwide</p>
                      </div>
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGlobalLockdown}
                      disabled={globalLockdownLoading}
                      className={`mt-5 w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        globalLockdownActive ? "bg-emerald-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                      } ${globalLockdownLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {globalLockdownLoading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Activating Global Lockdown...
                        </>
                      ) : globalLockdownActive ? (
                        <>🚨 Global Lockdown Active</>
                      ) : (
                        <>Activate Global Lockdown</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ENTERPRISE ACTION CONSOLE */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-slate-700" />
                  Enterprise Action Console
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {actions.map((item, index) => (
                    <div key={`${item.action}-${index}`} className={`border rounded-xl p-4 ${item.card}`}>
                      <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Action Key: {item.action}</p>

                      <button
                        type="button"
                        onClick={() => handleEnterpriseAction(item.action)}
                        className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-bold text-white transition ${item.color}`}
                      >
                        {item.button}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SYSTEM BLOCKS */}
              <div className="border rounded-xl p-5 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">System Blocks</h4>
                  <Layers className="h-5 w-5 text-slate-600" />
                </div>

                <p className="text-3xl font-extrabold text-slate-900 mt-4">ACTIVE</p>
                <p className="text-xs text-slate-500 mt-2">Modular system architecture blocks operational</p>
              </div>

              {infrastructureSections.map((section) => (
                <MetricSectionView key={section.title} section={section} />
              ))}
            </section>
          </TabsContent>

          {/* 6. MULTI-BRANCH ENTERPRISE ARCHITECTURE */}
          <TabsContent value="advanced" className="space-y-6">
            <section className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl gap-4">
                <div>
                  <h3 className="font-bold text-blue-900 flex items-center gap-2 text-lg">
                    <GitBranch className="h-5 w-5 text-blue-600" /> Enterprise Multi-Branch Topography
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Synchronize real-time inventories, local cross-transfers, and consolidated balance sheets.
                  </p>
                </div>

                <ToggleButton
                  label="Toggle Enterprise Multi-Branch Topography"
                  enabled={multiBranchEnabled}
                  activeClass="bg-blue-600"
                  size="md"
                  onClick={() => setMultiBranchEnabled((prev) => !prev)}
                />
              </div>

              {multiBranchEnabled && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-900 text-base">Active Operations Nodes</h3>
                    <button
                      type="button"
                      onClick={() => handleEnterpriseAction("PROVISION_NEW_BRANCH")}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-2 rounded-lg transition"
                    >
                      + Provision New Branch
                    </button>
                  </div>

                  <div className="overflow-x-auto border rounded-xl shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase border-b">
                        <tr>
                          <th className="p-4">Branch Registry Identifier</th>
                          <th className="p-4">Geographic Coordinates/Region</th>
                          <th className="p-4">Zonal Compliance Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y bg-white">
                        <tr className="hover:bg-slate-50 transition">
                          <td className="p-4 font-semibold text-slate-900">Riyadh Central HQ</td>
                          <td className="p-4 text-slate-600">Olaya District, KSA</td>
                          <td className="p-4">
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Operational</span>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition">
                          <td className="p-4 font-semibold text-slate-900">Dhaka Logistics Center</td>
                          <td className="p-4 text-slate-600">Uttara Sector 4, Bangladesh</td>
                          <td className="p-4">
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Operational</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl mt-4 gap-4">
                <div>
                  <h3 className="font-bold text-red-900 flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4 text-red-600" /> Emergency Kill-Switch (Lockout)
                  </h3>
                  <p className="text-xs text-red-700 mt-0.5">
                    Instantly restricts writes and sessions across all branches during anomalies or breach mitigation events.
                  </p>
                </div>

                <ToggleButton
                  label="Toggle Emergency Kill-Switch"
                  enabled={systemEmergencyLock}
                  activeClass="bg-red-600"
                  size="md"
                  onClick={() => setSystemEmergencyLock((prev) => !prev)}
                />
              </div>

              {/* ULTIMATE GLOBAL ERP CONTROL CENTER */}
              <div className="space-y-8">
                <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold">Global ERP Infrastructure Command</h2>
                      <p className="text-slate-300 mt-2">Centralized worldwide enterprise monitoring & AI control</p>
                    </div>

                    <div className="text-right">
                      <p className="text-5xl font-extrabold">99.99%</p>
                      <p className="text-slate-300 text-sm mt-1">Global Stability</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {[
                    ["Global Branches", "128", "Worldwide branches connected", "bg-blue-50", "text-slate-900"],
                    ["AI Autopilot", "ACTIVE", "Autonomous enterprise operations enabled", "bg-violet-50", "text-violet-700"],
                    ["Threat Engine", "SECURED", "AI monitoring suspicious activity globally", "bg-rose-50", "text-rose-700"],
                    ["Compliance Status", "VERIFIED", "GDPR / SOC2 / ISO governance active", "bg-emerald-50", "text-emerald-700"],
                    ["Predictive AI", "97.2%", "KPI prediction accuracy", "bg-cyan-50", "text-cyan-700"],
                    ["System Health", "OPTIMAL", "Infrastructure operating normally", "bg-amber-50", "text-amber-700"],
                    ["Executive Core", "LIVE", "Strategic AI decision support enabled", "bg-indigo-50", "text-indigo-700"],
                  ].map(([title, value, description, bg, color]) => (
                    <div key={title} className={`border rounded-2xl p-5 ${bg}`}>
                      <h4 className="font-bold text-slate-800">{title}</h4>
                      <p className={`text-4xl font-extrabold mt-4 ${color}`}>{value}</p>
                      <p className="text-xs text-slate-500 mt-2">{description}</p>
                    </div>
                  ))}

                  <div className="border rounded-2xl p-5 bg-slate-100">
                    <h4 className="font-bold text-slate-800">Emergency Lockdown</h4>
                    <button
                      type="button"
                      onClick={handleGlobalLockdown}
                      disabled={globalLockdownLoading}
                      className="mt-5 w-full bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold transition-all"
                    >
                      {globalLockdownLoading ? "Activating..." : globalLockdownActive ? "Activated" : "Activate"}
                    </button>
                    <p className="text-xs text-slate-500 mt-3">Instantly freeze worldwide operations</p>
                  </div>
                </div>
              </div>

              {/* FINAL ENTERPRISE EXPERIENCE LAYERS */}
              <div className="mt-8 space-y-8">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Realtime Global Notification Center</h3>
                      <p className="text-sm text-slate-500 mt-1">Worldwide ERP events & AI alerts</p>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="font-semibold text-sm text-emerald-700">Singapore branch synchronized successfully</p>
                      <p className="text-xs text-slate-500 mt-1">2 seconds ago</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="font-semibold text-sm text-amber-700">AI detected unusual login attempt</p>
                      <p className="text-xs text-slate-500 mt-1">1 minute ago</p>
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                      <p className="font-semibold text-sm text-cyan-700">Global analytics engine updated successfully</p>
                      <p className="text-xs text-slate-500 mt-1">4 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Enterprise Audit Timeline</h3>

                  <div className="space-y-4">
                    {[
                      ["bg-emerald-500", "GDPR validation completed", "Europe Region • 12 mins ago"],
                      ["bg-cyan-500", "AI policy engine updated", "Global AI Core • 25 mins ago"],
                      ["bg-rose-500", "Security firewall rules regenerated", "Threat Center • 1 hour ago"],
                    ].map(([dot, title, time]) => (
                      <div key={title} className="flex gap-4">
                        <div className={`h-3 w-3 rounded-full ${dot} mt-2`} />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{title}</p>
                          <p className="text-xs text-slate-500 mt-1">{time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Global Feature Matrix</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-bold text-slate-700">Feature</th>
                          <th className="text-left py-3 font-bold text-slate-700">Status</th>
                          <th className="text-left py-3 font-bold text-slate-700">Region</th>
                          <th className="text-left py-3 font-bold text-slate-700">AI Control</th>
                        </tr>
                      </thead>

                      <tbody>
                        {[
                          ["AI Autopilot", "ACTIVE", "Global", "ENABLED"],
                          ["Threat Monitoring", "RUNNING", "Worldwide", "ENABLED"],
                          ["Compliance Engine", "VERIFIED", "EU / US / ASIA", "ENABLED"],
                        ].map(([feature, status, region, ai]) => (
                          <tr key={feature} className="border-b">
                            <td className="py-3">{feature}</td>
                            <td className="py-3 text-emerald-600 font-bold">{status}</td>
                            <td className="py-3">{region}</td>
                            <td className="py-3">{ai}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl p-6 bg-gradient-to-r from-violet-600 to-indigo-700 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-5">
                    <div>
                      <h3 className="text-2xl font-extrabold">Enterprise AI Core Status</h3>
                      <p className="text-sm text-violet-100 mt-2">All autonomous systems operational</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {[
                        ["AI Stability", "99.99%"],
                        ["Branch Sync", "128"],
                        ["Threats Blocked", "1,284"],
                        ["AI Decisions", "LIVE"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-violet-100 text-xs">{label}</p>
                          <p className="text-2xl font-extrabold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FINAL ENTERPRISE EXPERIENCE LAYER */}
              <div className="mt-8 space-y-8">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Global Server Regions</h3>
                      <p className="text-sm text-slate-500 mt-1">Worldwide infrastructure deployment zones</p>
                    </div>
                    <div className="text-xs font-bold text-emerald-600">ALL REGIONS OPERATIONAL</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      ["North America", "12 Nodes", "AWS + Azure Hybrid Cloud", "bg-cyan-50"],
                      ["Europe", "8 Nodes", "GDPR Protected Infrastructure", "bg-emerald-50"],
                      ["Asia Pacific", "14 Nodes", "Ultra-low latency AI routing", "bg-violet-50"],
                      ["Middle East", "5 Nodes", "Enterprise regional failover", "bg-amber-50"],
                    ].map(([region, nodes, description, bg]) => (
                      <div key={region} className={`rounded-xl border p-4 ${bg}`}>
                        <p className="font-bold text-slate-800">{region}</p>
                        <p className="text-2xl font-extrabold mt-3">{nodes}</p>
                        <p className="text-xs text-slate-500 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">AI Decision Stream</h3>
                      <p className="text-sm text-slate-500 mt-1">Realtime autonomous ERP decisions</p>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    {[
                      ["bg-violet-50", "text-violet-700", "AI rerouted Asia-Pacific traffic automatically", "Latency optimization completed • 8 sec ago"],
                      ["bg-cyan-50", "text-cyan-700", "Predictive scaling activated for EU infrastructure", "Resource balancing complete • 24 sec ago"],
                      ["bg-rose-50", "text-rose-700", "AI blocked suspicious API request cluster", "Security defense executed • 1 min ago"],
                    ].map(([bg, color, title, time]) => (
                      <div key={title} className={`rounded-xl border ${bg} p-4`}>
                        <p className={`font-semibold ${color} text-sm`}>{title}</p>
                        <p className="text-xs text-slate-500 mt-1">{time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Enterprise API Infrastructure</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                    {[
                      ["Auth API", "ONLINE"],
                      ["Billing API", "ONLINE"],
                      ["AI API", "ACTIVE"],
                      ["Kafka Queue", "HEALTHY"],
                      ["Audit Logs", "ACTIVE"],
                      ["AI Agents", "RUNNING"],
                    ].map(([api, status]) => (
                      <div key={api} className="rounded-xl border p-4 text-center bg-emerald-50">
                        <p className="font-bold text-sm">{api}</p>
                        <p className="text-emerald-600 text-xs mt-2">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6 bg-slate-900 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-extrabold">Enterprise ERP Core</h3>
                      <p className="text-slate-400 mt-2 text-sm">AI-native global infrastructure orchestration platform</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        ["Branches", "128"],
                        ["Active Users", "48K+"],
                        ["AI Decisions", "LIVE"],
                        ["Uptime", "99.999%"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-slate-400 text-xs">{label}</p>
                          <p className="font-extrabold text-xl">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ULTRA ENTERPRISE CONTROL EXTENSIONS */}
              <div className="mt-8 space-y-8">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Realtime System Load Balancer</h3>
                      <p className="text-sm text-slate-500 mt-1">Dynamic enterprise infrastructure balancing</p>
                    </div>
                    <div className="text-emerald-600 text-xs font-bold">AUTO ACTIVE</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["API Load", "64%", "Optimized automatically", "bg-cyan-50"],
                      ["AI Compute", "82%", "Neural engine scaling active", "bg-violet-50"],
                      ["Queue Traffic", "NORMAL", "Kafka stream healthy", "bg-emerald-50"],
                    ].map(([title, value, description, bg]) => (
                      <div key={title} className={`rounded-xl border p-5 ${bg}`}>
                        <p className="text-sm font-bold text-slate-700">{title}</p>
                        <p className="text-3xl font-extrabold mt-3">{value}</p>
                        <p className="text-xs text-slate-500 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Autonomous AI Agents</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      ["Finance AI", "Revenue optimization engine", "bg-blue-50"],
                      ["HR AI", "Workforce intelligence monitoring", "bg-violet-50"],
                      ["Security AI", "Global threat protection engine", "bg-cyan-50"],
                      ["Logistics AI", "Smart supply chain optimization", "bg-emerald-50"],
                    ].map(([title, description, bg]) => (
                      <div key={title} className={`rounded-xl border p-5 ${bg}`}>
                        <p className="font-bold text-slate-800">{title}</p>
                        <p className="text-2xl font-extrabold mt-4">ACTIVE</p>
                        <p className="text-xs text-slate-500 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Enterprise Permission Matrix</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Role</th>
                          <th className="text-left py-3">Access</th>
                          <th className="text-left py-3">AI Permission</th>
                          <th className="text-left py-3">Infrastructure</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border-b">
                          <td className="py-3">Super Admin</td>
                          <td className="py-3 text-emerald-600 font-bold">FULL</td>
                          <td className="py-3">ENABLED</td>
                          <td className="py-3">GLOBAL</td>
                        </tr>

                        <tr className="border-b">
                          <td className="py-3">Regional Director</td>
                          <td className="py-3 text-cyan-600 font-bold">LIMITED</td>
                          <td className="py-3">ENABLED</td>
                          <td className="py-3">REGION</td>
                        </tr>

                        <tr className="border-b">
                          <td className="py-3">Branch Manager</td>
                          <td className="py-3 text-amber-600 font-bold">CONTROLLED</td>
                          <td className="py-3">RESTRICTED</td>
                          <td className="py-3">LOCAL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-5">
                    <div>
                      <h3 className="text-2xl font-extrabold">Global Deployment Network</h3>
                      <p className="text-slate-400 text-sm mt-2">Multi-cloud enterprise infrastructure orchestration</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {[
                        ["AWS", "ACTIVE"],
                        ["Azure", "ACTIVE"],
                        ["GCP", "ACTIVE"],
                        ["Edge Nodes", "84"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-slate-400 text-xs">{label}</p>
                          <p className="text-xl font-extrabold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FINAL ULTRA ENTERPRISE MODULES */}
              <div className="mt-8 space-y-8">
                <div className="border rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Live Global Event Stream</h3>
                      <p className="text-sm text-slate-500 mt-1">Realtime enterprise-wide system activity</p>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    {[
                      ["rounded-xl border p-4 bg-cyan-50", "text-cyan-700", "Tokyo branch synchronized inventory successfully", "12 seconds ago"],
                      ["rounded-xl border p-4 bg-emerald-50", "text-emerald-700", "AI optimized payroll processing across 42 branches", "1 minute ago"],
                      ["rounded-xl border p-4 bg-rose-50", "text-rose-700", "Suspicious API behavior blocked automatically", "3 minutes ago"],
                    ].map(([box, color, title, time]) => (
                      <div key={title} className={box}>
                        <p className={`font-semibold ${color} text-sm`}>{title}</p>
                        <p className="text-xs text-slate-500 mt-1">{time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">AI Resource Orchestration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      ["Compute Scaling", "AUTO", "Dynamic AI compute allocation active", "bg-violet-50"],
                      ["Database Clusters", "24", "Multi-region replicated clusters", "bg-cyan-50"],
                      ["AI Queue Engine", "HEALTHY", "Distributed event processing stable", "bg-emerald-50"],
                      ["Edge Processing", "LIVE", "Regional low-latency edge execution active", "bg-amber-50"],
                    ].map(([title, value, description, bg]) => (
                      <div key={title} className={`rounded-xl border p-5 ${bg}`}>
                        <p className="font-bold text-sm text-slate-800">{title}</p>
                        <p className="text-3xl font-extrabold mt-4">{value}</p>
                        <p className="text-xs text-slate-500 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-2xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Global Tenant Control</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["Enterprise Tenants", "128", "Active organizations connected", "bg-blue-50"],
                      ["Tenant Isolation", "SECURE", "Cross-tenant security fully enforced", "bg-emerald-50"],
                      ["AI Tenant Routing", "ACTIVE", "Intelligent workload distribution enabled", "bg-violet-50"],
                    ].map(([title, value, description, bg]) => (
                      <div key={title} className={`rounded-xl border p-5 ${bg}`}>
                        <p className="font-bold text-slate-800">{title}</p>
                        <p className="text-3xl font-extrabold mt-4">{value}</p>
                        <p className="text-xs text-slate-500 mt-2">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-extrabold">Enterprise System Health Score</h3>
                      <p className="text-white/80 text-sm mt-2">AI-calculated realtime global infrastructure status</p>
                    </div>

                    <div className="text-center">
                      <p className="text-5xl font-extrabold">99.98%</p>
                      <p className="text-sm text-white/80 mt-2">OPTIMAL PERFORMANCE</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}