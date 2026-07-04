"use client";
 
import { useEffect, useMemo, useRef, useState, useCallback, ReactNode } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  RefreshCcw,
  Filter,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Wifi,
  Moon,
  Sun,
  Bell,
  Settings,
  MoreHorizontal,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Building2,
  Fingerprint,
  Radio,
  Eye,
  SlidersHorizontal,
  Badge,
  Timer,
  Minus,
} from "lucide-react";
 
// ── Types ──────────────────────────────────────────────────────────────────
type AttendanceStatus = "Present" | "Late" | "Absent" | "On Leave";
type Theme = "dark" | "light";
type SortField = "name" | "department" | "checkIn" | "status";
 
interface AttendanceUser {
  id: number;
  name: string;
  avatar: string;
  department: string;
  role: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
  location: string;
  method: "Biometric" | "Card" | "Manual" | "Mobile";
  workHours?: string;
  shift: "Morning" | "Evening" | "Night";
}
 
interface DeptStat {
  name: string;
  present: number;
  total: number;
  color: string;
}
 
// ── Static Data ────────────────────────────────────────────────────────────
const initialUsers: AttendanceUser[] = [
  { id: 1, name: "Sarah Mitchell", avatar: "SM", department: "Engineering", role: "Senior Engineer", checkIn: "08:02", status: "Present", location: "HQ - Floor 3", method: "Biometric", workHours: "8h 12m", shift: "Morning" },
  { id: 2, name: "Ahmed Al-Rashid", avatar: "AR", department: "Sales", role: "Sales Manager", checkIn: "09:18", status: "Late", location: "Riyadh Branch", method: "Card", shift: "Morning" },
  { id: 3, name: "Priya Nambiar", avatar: "PN", department: "HR", role: "HR Specialist", checkIn: "07:58", status: "Present", location: "HQ - Floor 1", method: "Biometric", workHours: "8h 42m", shift: "Morning" },
  { id: 4, name: "James Okafor", avatar: "JO", department: "Finance", role: "CFO", checkIn: "08:30", status: "Present", location: "HQ - Floor 5", method: "Mobile", workHours: "7h 55m", shift: "Morning" },
  { id: 5, name: "Lena Hoffmann", avatar: "LH", department: "Design", role: "UI/UX Lead", checkIn: "09:45", status: "Late", location: "Remote", method: "Mobile", shift: "Morning" },
  { id: 6, name: "Tariq Mahmoud", avatar: "TM", department: "Operations", role: "Ops Director", checkIn: "08:00", status: "Present", location: "HQ - Floor 2", method: "Biometric", workHours: "8h 30m", shift: "Morning" },
  { id: 7, name: "Nina Vasquez", avatar: "NV", department: "Engineering", role: "DevOps Engineer", checkIn: "—", status: "Absent", location: "—", method: "Manual", shift: "Morning" },
  { id: 8, name: "Omar Khalid", avatar: "OK", department: "Legal", role: "Legal Counsel", checkIn: "—", status: "On Leave", location: "—", method: "Manual", shift: "Morning" },
  { id: 9, name: "Yuki Tanaka", avatar: "YT", department: "Finance", role: "Analyst", checkIn: "08:15", status: "Present", location: "HQ - Floor 5", method: "Card", workHours: "8h 05m", shift: "Morning" },
  { id: 10, name: "Marcus Webb", avatar: "MW", department: "Sales", role: "Account Executive", checkIn: "08:50", status: "Present", location: "Jeddah Branch", method: "Biometric", workHours: "7h 40m", shift: "Morning" },
  { id: 11, name: "Fatima Al-Hassan", avatar: "FH", department: "HR", role: "Recruiter", checkIn: "07:45", status: "Present", location: "HQ - Floor 1", method: "Biometric", workHours: "8h 55m", shift: "Morning" },
  { id: 12, name: "Chen Wei", avatar: "CW", department: "Engineering", role: "Backend Engineer", checkIn: "16:00", checkOut: "—", status: "Present", location: "HQ - Floor 3", method: "Card", shift: "Evening" },
];
 
const deptStats: DeptStat[] = [
  { name: "Engineering", present: 8, total: 10, color: "#10b981" },
  { name: "Sales", present: 6, total: 8, color: "#3b82f6" },
  { name: "HR", present: 4, total: 4, color: "#8b5cf6" },
  { name: "Finance", present: 5, total: 6, color: "#f59e0b" },
  { name: "Operations", present: 7, total: 8, color: "#06b6d4" },
  { name: "Design", present: 3, total: 5, color: "#ec4899" },
];
 
// ── Utility ────────────────────────────────────────────────────────────────
function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
 
function getInitialColor(avatar: string) {
  const colors = [
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
  ];
  const idx = avatar.charCodeAt(0) % colors.length;
  return colors[idx];
}
 
// ── Mini Sparkline ─────────────────────────────────────────────────────────
function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}
 
// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, string> = {
    Present: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    Late: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    Absent: "border-red-500/30 bg-red-500/10 text-red-400",
    "On Leave": "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };
 
  const icons: Record<AttendanceStatus, ReactNode> = {
    Present: <CheckCircle2 className="h-3 w-3" />,
    Late: <Timer className="h-3 w-3" />,
    Absent: <UserX className="h-3 w-3" />,
    "On Leave": <Calendar className="h-3 w-3" />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", map[status])}>
      {icons[status]}
      {status}
    </span>
  );
}
 
// ── Method Badge ───────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: AttendanceUser["method"] }) {
  const map: Record<AttendanceUser["method"], { cls: string; icon: ReactNode }> = {
    Biometric: { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <Fingerprint className="h-3 w-3" /> },
    Card: { cls: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: <Badge className="h-3 w-3" /> },
    Mobile: { cls: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: <Wifi className="h-3 w-3" /> },
    Manual: { cls: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: <UserCheck className="h-3 w-3" /> },
  };
  const { cls, icon } = map[method];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest", cls)}>
      {icon} {method}
    </span>
  );
}
 
// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="h-10 w-10 rounded-xl bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="h-2 w-24 rounded bg-white/10" />
      </div>
      <div className="h-6 w-20 rounded-full bg-white/10" />
      <div className="h-3 w-16 rounded bg-white/10" />
    </div>
  );
}
 
// ── Donut Ring ─────────────────────────────────────────────────────────────
function DonutRing({ value, size = 40, stroke = 3 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#att-grad)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      <defs>
        <linearGradient id="att-grad" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
 
// ── Main Page ──────────────────────────────────────────────────────────────
export default function LiveAttendancePage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [users, setUsers] = useState<AttendanceUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all">("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterShift, setFilterShift] = useState<"all" | "Morning" | "Evening" | "Night">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
 
  const isDark = theme === "dark";
 
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
  // Simulate live check-ins
  useEffect(() => {
    if (!liveEnabled) return;
    const names = ["Khalid Al-Saud", "Emma Thompson", "Raj Patel", "Sofia Rossi"];
    const depts = ["Engineering", "Sales", "HR", "Finance", "Operations"];
    const roles = ["Engineer", "Analyst", "Specialist", "Manager"];
    const locations = ["HQ - Floor 2", "HQ - Floor 4", "Riyadh Branch", "Remote"];
    let idx = 0;
    const interval = setInterval(() => {
      const name = names[idx % names.length];
      const initials = name.split(" ").map((n) => n[0]).join("");
      setUsers((prev) => {
        const exists = prev.find((u) => u.name === name);
        if (exists) return prev;
        return [
          {
            id: Date.now(),
            name,
            avatar: initials,
            department: depts[idx % depts.length],
            role: roles[idx % roles.length],
            checkIn: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
            status: "Present",
            location: locations[idx % locations.length],
            method: "Biometric",
            workHours: "0h 00m",
            shift: "Morning",
          },
          ...prev,
        ];
      });
      idx++;
    }, 18000);
    return () => clearInterval(interval);
  }, [liveEnabled]);
 
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1600);
  }, []);
 
  // Stats
  const stats = useMemo(() => {
    const present = users.filter((u) => u.status === "Present").length;
    const late = users.filter((u) => u.status === "Late").length;
    const absent = users.filter((u) => u.status === "Absent").length;
    const onLeave = users.filter((u) => u.status === "On Leave").length;
    const total = users.length;
    return { present, late, absent, onLeave, total, rate: Math.round((present / total) * 100) };
  }, [users]);
 
  const departments = useMemo(() => ["all", ...Array.from(new Set(users.map((u) => u.department)))], [users]);
 
  // Filter + sort
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => {
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
        const matchStatus = filterStatus === "all" || u.status === filterStatus;
        const matchDept = filterDept === "all" || u.department === filterDept;
        const matchShift = filterShift === "all" || u.shift === filterShift;
        return matchSearch && matchStatus && matchDept && matchShift;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "name") diff = a.name.localeCompare(b.name);
        else if (sortField === "department") diff = a.department.localeCompare(b.department);
        else if (sortField === "checkIn") diff = a.checkIn.localeCompare(b.checkIn);
        else if (sortField === "status") diff = a.status.localeCompare(b.status);
        return sortDir === "asc" ? diff : -diff;
      });
  }, [users, search, filterStatus, filterDept, filterShift, sortField, sortDir]);
 
  // Theme tokens
  const T = {
    bg: isDark ? "bg-[#020617]" : "bg-slate-100",
    card: isDark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200",
    cardHover: isDark ? "hover:border-white/20 hover:bg-white/[0.06]" : "hover:border-slate-300 hover:bg-slate-50",
    text: isDark ? "text-slate-100" : "text-slate-900",
    sub: isDark ? "text-slate-400" : "text-slate-500",
    muted: isDark ? "text-slate-500" : "text-slate-400",
    input: isDark ? "bg-black/20 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400",
    inputFocus: isDark ? "focus:border-emerald-500/40" : "focus:border-emerald-400",
    btnGhost: isDark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
    innerCard: isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200",
    tableHead: isDark ? "bg-white/[0.03] text-slate-500" : "bg-slate-50 text-slate-500",
    row: isDark ? "border-white/5 hover:bg-white/[0.03]" : "border-slate-100 hover:bg-slate-50",
  };
 
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Minus className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />;
  };
 
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
 
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
            <div className="h-6 w-64 rounded bg-white/10" />
            <div className="mt-4 h-4 w-80 rounded bg-white/10" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="mt-5 h-8 w-24 rounded bg-white/10" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <main className={cn("relative min-h-screen overflow-hidden transition-colors duration-500", T.bg, T.text)}>
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0">
        {isDark && <>
          <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
        </>}
      </div>
 
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">
 
        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <nav className={cn("flex items-center justify-between rounded-2xl border p-3 backdrop-blur-2xl", T.card)}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={cn("text-[9px] font-black uppercase tracking-[0.22em]", T.muted)}>Enterprise HRM</p>
              <p className={cn("text-sm font-black", T.text)}>Live Attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("hidden items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest sm:flex", isDark ? "border-white/10 bg-black/30 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600")}>
              <Clock className="h-3 w-3 text-emerald-400" />
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <button
              onClick={() => setLiveEnabled((v) => !v)}
              className={cn("hidden items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all sm:flex",
                liveEnabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : T.btnGhost)}
            >
              <span className="relative flex h-2 w-2">
                {liveEnabled && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", liveEnabled ? "bg-emerald-500" : "bg-slate-600")} />
              </span>
              {liveEnabled ? "Live" : "Paused"}
            </button>
            <button onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-all", T.btnGhost)}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-all", T.btnGhost)}>
              <Bell className="h-4 w-4" />
            </button>
            <button className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-all", T.btnGhost)}>
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </nav>
 
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className={cn("overflow-hidden rounded-[32px] border backdrop-blur-2xl", T.card)}>
          <div className="relative">
            <div className={cn("absolute inset-0", isDark ? "bg-[linear-gradient(120deg,rgba(16,185,129,0.08),transparent,rgba(59,130,246,0.06))]" : "bg-[linear-gradient(120deg,rgba(16,185,129,0.05),transparent,rgba(59,130,246,0.04))]")} />
            <div className="relative flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  <Radio className="h-3 w-3" />
                  Realtime Tracking Active
                </div>
                <h1 className={cn("text-3xl font-black tracking-tight md:text-5xl", T.text)}>
                  Live{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    Attendance
                  </span>{" "}
                  Dashboard
                </h1>
                <p className={cn("mt-4 text-sm leading-7 md:text-base", T.sub)}>
                  Monitor employee check-ins, track attendance patterns, and manage workforce presence across all locations in real time.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5">
                    <Activity className="h-4 w-4" />
                    Live Monitor
                  </button>
                  <button className={cn("inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5", T.btnGhost)}>
                    <Download className="h-4 w-4" />
                    Export Report
                  </button>
                  <button onClick={handleRefresh} className={cn("inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5", T.btnGhost)}>
                    <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    Refresh
                  </button>
                </div>
              </div>
 
              {/* Hero stats */}
              <div className="grid w-full max-w-xs grid-cols-2 gap-3">
                {[
                  { label: "Total Staff", value: stats.total, icon: Users, color: "text-blue-400", ring: 100 },
                  { label: "On Time", value: stats.present, icon: CheckCircle2, color: "text-emerald-400", ring: stats.rate },
                  { label: "Late", value: stats.late, icon: AlertTriangle, color: "text-amber-400", ring: Math.round((stats.late / stats.total) * 100) },
                  { label: "Absent", value: stats.absent + stats.onLeave, icon: UserX, color: "text-red-400", ring: Math.round(((stats.absent + stats.onLeave) / stats.total) * 100) },
                ].map((s) => (
                  <div key={s.label} className={cn("rounded-2xl border p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5", T.innerCard)}>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[9px] font-black uppercase tracking-[0.18em]", T.muted)}>{s.label}</span>
                      <div className="relative flex items-center justify-center">
                        <DonutRing value={s.ring} size={34} stroke={3} />
                        <s.icon className={cn("absolute h-3 w-3", s.color)} />
                      </div>
                    </div>
                    <h3 className={cn("mt-3 text-2xl font-black", T.text)}>{s.value}</h3>
                  </div>
                ))}
                <div className="col-span-2 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className={cn("text-xs font-bold", T.text)}>Attendance rate today</span>
                    </div>
                    <span className="text-xl font-black text-emerald-400">{stats.rate}%</span>
                  </div>
                  <div className={cn("mt-3 h-1.5 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-black/10")}>
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
 
        {/* ── METRIC CARDS ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { title: "Present", value: stats.present, icon: CheckCircle2, color: "text-emerald-400", spark: [12,15,14,18,16,20,19,22,21,24,23,stats.present], sparkColor: "#10b981", badge: `${stats.rate}%` },
            { title: "Late Arrivals", value: stats.late, icon: Timer, color: "text-amber-400", spark: [4,3,5,4,6,5,4,3,5,4,3,stats.late], sparkColor: "#f59e0b", badge: `${Math.round((stats.late/stats.total)*100)}%` },
            { title: "Absent", value: stats.absent, icon: UserX, color: "text-red-400", spark: [2,3,2,1,3,2,1,2,3,2,1,stats.absent], sparkColor: "#ef4444", badge: `${Math.round((stats.absent/stats.total)*100)}%` },
            { title: "On Leave", value: stats.onLeave, icon: Calendar, color: "text-blue-400", spark: [1,2,1,2,1,1,2,1,2,1,2,stats.onLeave], sparkColor: "#3b82f6", badge: `${Math.round((stats.onLeave/stats.total)*100)}%` },
          ].map((card) => (
            <div key={card.title} className={cn("group relative overflow-hidden rounded-[28px] border p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1", T.card, T.cardHover)}>
              <div className="flex items-start justify-between">
                <div className={cn("rounded-2xl border p-2.5", isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-slate-100")}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <span className={cn("text-[10px] font-black", T.muted)}>{card.badge}</span>
              </div>
              <h3 className={cn("mt-5 text-3xl font-black", T.text)}>{card.value}</h3>
              <p className={cn("mt-1 text-[10px] font-black uppercase tracking-[0.2em]", T.muted)}>{card.title}</p>
              <div className="mt-3">
                <Sparkline data={card.spark} color={card.sparkColor} />
              </div>
            </div>
          ))}
        </section>
 
        {/* ── DEPT BREAKDOWN ───────────────────────────────────────────── */}
        <section className={cn("rounded-[32px] border p-6 backdrop-blur-2xl", T.card)}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={cn("text-lg font-black", T.text)}>Department Breakdown</h2>
              <p className={cn("mt-0.5 text-sm", T.sub)}>Attendance by department today.</p>
            </div>
            <Building2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {deptStats.map((dept) => {
              const pct = Math.round((dept.present / dept.total) * 100);
              return (
                <div key={dept.name} className={cn("rounded-2xl border p-3 transition-all hover:-translate-y-0.5", T.innerCard)}>
                  <p className={cn("truncate text-[10px] font-black uppercase tracking-widest", T.muted)}>{dept.name}</p>
                  <p className={cn("mt-2 text-2xl font-black", T.text)}>{pct}%</p>
                  <p className={cn("text-[10px]", T.muted)}>{dept.present}/{dept.total}</p>
                  <div className={cn("mt-2 h-1 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-black/10")}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: dept.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
 
        {/* ── ATTENDANCE TABLE ──────────────────────────────────────────── */}
        <section className={cn("rounded-[32px] border p-6 backdrop-blur-2xl", T.card)}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className={cn("text-xl font-black", T.text)}>Employee Attendance</h2>
              <p className={cn("mt-1 text-sm", T.sub)}>Realtime check-in stream and workforce status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className={cn("absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2", T.muted)} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee..."
                  className={cn("h-10 w-44 rounded-xl border pl-9 pr-3 text-xs outline-none transition-all", T.input, T.inputFocus)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className={cn("absolute right-3 top-1/2 -translate-y-1/2", T.muted)}>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
 
              {/* Status filter */}
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | "all")}
                  className={cn("h-10 appearance-none rounded-xl border px-3 pr-7 text-xs font-bold outline-none transition-all", T.input, T.inputFocus)}>
                  <option value="all">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
                <ChevronDown className={cn("pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2", T.muted)} />
              </div>
 
              {/* Dept filter */}
              <div className="relative">
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                  className={cn("h-10 appearance-none rounded-xl border px-3 pr-7 text-xs font-bold outline-none transition-all", T.input, T.inputFocus)}>
                  {departments.map((d) => <option key={d} value={d}>{d === "all" ? "All Departments" : d}</option>)}
                </select>
                <ChevronDown className={cn("pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2", T.muted)} />
              </div>
 
              {/* Shift filter */}
              <div className="relative">
                <select value={filterShift} onChange={(e) => setFilterShift(e.target.value as typeof filterShift)}
                  className={cn("h-10 appearance-none rounded-xl border px-3 pr-7 text-xs font-bold outline-none transition-all", T.input, T.inputFocus)}>
                  <option value="all">All Shifts</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                <ChevronDown className={cn("pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2", T.muted)} />
              </div>
 
              {/* View toggle */}
              <div className={cn("flex items-center rounded-xl border p-1", isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-100")}>
                {(["table", "grid"] as const).map((v) => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className={cn("rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                      viewMode === v ? "bg-emerald-500 text-slate-950 shadow" : T.muted)}>
                    {v === "table" ? "Table" : "Grid"}
                  </button>
                ))}
              </div>
 
              <button className={cn("flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all", T.btnGhost)}>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
 
          {/* Results count */}
          <div className={cn("mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", T.muted)}>
            <span>{filteredUsers.length} employees</span>
            {(search || filterStatus !== "all" || filterDept !== "all" || filterShift !== "all") && (
              <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDept("all"); setFilterShift("all"); }}
                className="text-emerald-400 hover:underline">Clear filters</button>
            )}
          </div>
 
          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className={cn("text-left", T.tableHead)}>
                    {[
                      { label: "Employee", field: "name" as SortField },
                      { label: "Department", field: "department" as SortField },
                      { label: "Check In", field: "checkIn" as SortField },
                      { label: "Status", field: "status" as SortField },
                      { label: "Method", field: null },
                      { label: "Location", field: null },
                      { label: "Work Hours", field: null },
                      { label: "", field: null },
                    ].map((col) => (
                      <th key={col.label}
                        onClick={() => col.field && handleSort(col.field)}
                        className={cn("rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest", col.field && "cursor-pointer select-none")}>
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.field && <SortIcon field={col.field} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className={cn("h-8 w-8", T.muted)} />
                        <p className={cn("text-sm font-bold", T.muted)}>No employees found.</p>
                      </div>
                    </td></tr>
                  )}
                  {filteredUsers.map((user) => {
                    const isExpanded = expandedRow === user.id;
                    return (
                      <>
                        <tr key={user.id}
                          className={cn("cursor-pointer border-b transition-all duration-200", T.row, isExpanded && (isDark ? "bg-emerald-500/[0.03]" : "bg-emerald-50"))}
                          onClick={() => setExpandedRow(isExpanded ? null : user.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-white", getInitialColor(user.avatar))}>
                                {user.avatar}
                              </div>
                              <div>
                                <p className={cn("text-sm font-black", T.text)}>{user.name}</p>
                                <p className={cn("text-[10px]", T.muted)}>{user.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className={cn("px-4 py-3 text-xs font-semibold", T.sub)}>{user.department}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className={cn("h-3 w-3", T.muted)} />
                              <span className={cn("text-xs font-black", T.text)}>{user.checkIn}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                          <td className="px-4 py-3"><MethodBadge method={user.method} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <MapPin className={cn("h-3 w-3 shrink-0", T.muted)} />
                              <span className={cn("truncate text-[11px]", T.sub)}>{user.location}</span>
                            </div>
                          </td>
                          <td className={cn("px-4 py-3 text-xs font-black", T.text)}>{user.workHours ?? "—"}</td>
                          <td className="px-4 py-3">
                            <button className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-all", T.btnGhost)}>
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`exp-${user.id}`} className={isDark ? "bg-emerald-500/[0.02]" : "bg-emerald-50/50"}>
                            <td colSpan={8} className="px-6 pb-4 pt-0">
                              <div className={cn("rounded-2xl border p-4", T.innerCard)}>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                  {[
                                    { label: "Full Name", value: user.name },
                                    { label: "Role", value: user.role },
                                    { label: "Department", value: user.department },
                                    { label: "Shift", value: user.shift },
                                    { label: "Check In", value: user.checkIn },
                                    { label: "Check Out", value: user.checkOut ?? "—" },
                                    { label: "Work Hours", value: user.workHours ?? "—" },
                                    { label: "Method", value: user.method },
                                  ].map((f) => (
                                    <div key={f.label}>
                                      <p className={cn("text-[9px] font-black uppercase tracking-widest", T.muted)}>{f.label}</p>
                                      <p className={cn("mt-1 text-sm font-black", T.text)}>{f.value}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <button className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all", T.btnGhost)}>
                                    <Eye className="h-3 w-3" /> Full Profile
                                  </button>
                                  <button className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all", T.btnGhost)}>
                                    <TrendingUp className="h-3 w-3" /> History
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
 
          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.length === 0 && (
                <div className={cn("col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border py-16", T.innerCard)}>
                  <Search className={cn("h-8 w-8", T.muted)} />
                  <p className={cn("text-sm font-bold", T.muted)}>No employees found.</p>
                </div>
              )}
              {filteredUsers.map((user) => (
                <div key={user.id} className={cn("rounded-2xl border p-4 transition-all hover:-translate-y-0.5", T.innerCard, T.cardHover)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white", getInitialColor(user.avatar))}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className={cn("text-sm font-black", T.text)}>{user.name}</p>
                        <p className={cn("text-[10px]", T.muted)}>{user.role}</p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>
                  <div className={cn("mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-[10px]", isDark ? "border-white/5" : "border-slate-100")}>
                    <div>
                      <p className={T.muted}>Department</p>
                      <p className={cn("font-black", T.text)}>{user.department}</p>
                    </div>
                    <div>
                      <p className={T.muted}>Check In</p>
                      <p className={cn("font-black", T.text)}>{user.checkIn}</p>
                    </div>
                    <div>
                      <p className={T.muted}>Method</p>
                      <p className={cn("font-black", T.text)}>{user.method}</p>
                    </div>
                    <div>
                      <p className={T.muted}>Work Hours</p>
                      <p className={cn("font-black", T.text)}>{user.workHours ?? "—"}</p>
                    </div>
                  </div>
                  <div className={cn("mt-2 flex items-center gap-1 text-[10px]", T.muted)}>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{user.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
 
        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className={cn("flex items-center justify-between rounded-2xl border p-4 text-[10px] font-bold uppercase tracking-widest", T.card, T.muted)}>
          <span>Enterprise HRM © 2026 — Attendance Module v3.1</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>Live Sync</span>
          </div>
        </footer>
 
      </div>
    </main>
  );
}