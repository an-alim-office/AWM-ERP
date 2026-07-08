"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Maternity Leave' | 'Unpaid Leave' | 'Compassionate Leave';

interface LeaveRequest {
  id: string;
  name: string;
  avatar: string;
  department: string;
  type: LeaveType;
  duration: string;
  daysCount: number;
  status: LeaveStatus;
  appliedDate: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  accent: string;
  icon: React.ReactNode;
  trend?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  ),
  ban: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
      <circle cx="12" cy="12" r="9" /><path d="M4.93 4.93l14.14 14.14" strokeLinecap="round" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trendUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_REQUESTS: LeaveRequest[] = [
  { id: 'LEV-401', name: 'Ahmed Mansoor', avatar: 'AM', department: 'Engineering', type: 'Annual Leave', duration: '5 Days', daysCount: 5, status: 'Pending', appliedDate: '25 June 2026', startDate: '01 July 2026', endDate: '05 July 2026', reason: 'Family vacation planned for summer break.' },
  { id: 'LEV-402', name: 'Youssef Al-Harbi', avatar: 'YA', department: 'Operations', type: 'Sick Leave', duration: '2 Days', daysCount: 2, status: 'Approved', appliedDate: '24 June 2026', startDate: '25 June 2026', endDate: '26 June 2026', reason: 'Medical consultation and recovery.' },
  { id: 'LEV-403', name: 'Fahad Mustafa', avatar: 'FM', department: 'Finance', type: 'Emergency Leave', duration: '1 Day', daysCount: 1, status: 'Rejected', appliedDate: '22 June 2026', startDate: '23 June 2026', endDate: '23 June 2026', reason: 'Personal emergency.' },
  { id: 'LEV-404', name: 'Sara Al-Zahrani', avatar: 'SZ', department: 'HR', type: 'Annual Leave', duration: '7 Days', daysCount: 7, status: 'Pending', appliedDate: '20 June 2026', startDate: '10 July 2026', endDate: '16 July 2026', reason: 'Annual leave entitlement.' },
  { id: 'LEV-405', name: 'Omar Khalid', avatar: 'OK', department: 'Marketing', type: 'Compassionate Leave', duration: '3 Days', daysCount: 3, status: 'Approved', appliedDate: '18 June 2026', startDate: '19 June 2026', endDate: '21 June 2026', reason: 'Bereavement.' },
  { id: 'LEV-406', name: 'Nadia Hassan', avatar: 'NH', department: 'AI Core', type: 'Maternity Leave', duration: '90 Days', daysCount: 90, status: 'Approved', appliedDate: '10 June 2026', startDate: '15 June 2026', endDate: '13 Sept 2026', reason: 'Maternity entitlement.' },
  { id: 'LEV-407', name: 'Tariq Al-Mutairi', avatar: 'TM', department: 'Security', type: 'Unpaid Leave', duration: '10 Days', daysCount: 10, status: 'Pending', appliedDate: '08 June 2026', startDate: '20 June 2026', endDate: '29 June 2026', reason: 'Personal matter.' },
];

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<LeaveStatus, { label: string; dot: string; badge: string; text: string }> = {
  Pending:   { label: 'Pending',   dot: 'bg-amber-400',   badge: 'bg-amber-500/10 border-amber-500/25',   text: 'text-amber-400' },
  Approved:  { label: 'Approved',  dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400' },
  Rejected:  { label: 'Rejected',  dot: 'bg-rose-400',    badge: 'bg-rose-500/10 border-rose-500/25',     text: 'text-rose-400' },
  Cancelled: { label: 'Cancelled', dot: 'bg-slate-400',   badge: 'bg-slate-500/10 border-slate-500/25',   text: 'text-slate-400' },
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  'Annual Leave':       'text-blue-400 bg-blue-500/8 border-blue-500/20',
  'Sick Leave':         'text-purple-400 bg-purple-500/8 border-purple-500/20',
  'Emergency Leave':    'text-orange-400 bg-orange-500/8 border-orange-500/20',
  'Maternity Leave':    'text-pink-400 bg-pink-500/8 border-pink-500/20',
  'Unpaid Leave':       'text-slate-400 bg-slate-500/8 border-slate-500/20',
  'Compassionate Leave':'text-teal-400 bg-teal-500/8 border-teal-500/20',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<StatCardProps> = ({ label, value, color, accent, icon, trend }) => (
  <div
    className="relative rounded-2xl p-5 overflow-hidden border transition-all duration-300 hover:scale-[1.02] group"
    style={{ background: 'linear-gradient(145deg, #0f1724, #111827)', borderColor: 'rgba(99,102,241,0.15)' }}
  >
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 ${accent}`} />
    <div className="relative z-10">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color} bg-current/10`} style={{ background: 'rgba(255,255,255,0.05)' }}>
        <span className={color}>{icon}</span>
      </div>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 font-mono">{label}</p>
      <h3 className={`text-3xl font-bold mt-1 tracking-tight ${color}`}>{value}</h3>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className="text-emerald-400">{Icons.trendUp}</span>
          <span className="text-[9px] text-emerald-400 font-mono">{trend}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string; dept: string }> = ({ initials, dept }) => {
  const colors: Record<string, string> = {
    Engineering: 'from-blue-600 to-indigo-600',
    Operations: 'from-teal-600 to-emerald-600',
    Finance: 'from-purple-600 to-violet-600',
    HR: 'from-pink-600 to-rose-600',
    Marketing: 'from-orange-600 to-amber-600',
    'AI Core': 'from-cyan-600 to-blue-600',
    Security: 'from-red-600 to-rose-600',
  };
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[dept] ?? 'from-slate-600 to-slate-700'} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-lg`}>
      {initials}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-slate-800" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-800 rounded w-32" />
      <div className="h-2.5 bg-slate-800/60 rounded w-48" />
    </div>
    <div className="h-6 bg-slate-800 rounded-full w-20" />
    <div className="h-6 bg-slate-800 rounded w-24" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'All'>('All');
  const [filterType, setFilterType] = useState<LeaveType | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: LeaveStatus } | null>(null);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => ({
    total: leaveRequests.length,
    approved: leaveRequests.filter(r => r.status === 'Approved').length,
    pending: leaveRequests.filter(r => r.status === 'Pending').length,
    rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
  }), [leaveRequests]);

  const filtered = useMemo(() => {
    let list = [...leaveRequests];
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== 'All') list = list.filter(r => r.status === filterStatus);
    if (filterType !== 'All') list = list.filter(r => r.type === filterType);
    list.sort((a, b) => sortDir === 'desc'
      ? b.id.localeCompare(a.id)
      : a.id.localeCompare(b.id));
    return list;
  }, [leaveRequests, search, filterStatus, filterType, sortDir]);

  const handleStatusChange = useCallback((id: string, newStatus: LeaveStatus) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setConfirmAction(null);
    setSelectedId(null);
  }, []);

  const selectedRequest = useMemo(() => leaveRequests.find(r => r.id === selectedId), [leaveRequests, selectedId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-mono text-xs tracking-widest">LOADING LEAVE MODULE</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation-delay:0.04s; }
        .fade-up-2 { animation-delay:0.09s; }
        .fade-up-3 { animation-delay:0.14s; }
        .fade-up-4 { animation-delay:0.19s; }
        .slide-in { animation: slideIn 0.35s ease both; }
        .scale-in { animation: scaleIn 0.25s ease both; }
        .row-hover { transition: background 0.15s ease; }
        .row-hover:hover { background: rgba(99,102,241,0.04); }
        select option { background: #0f1724; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:4px; }
      `}</style>

      <div className="min-h-screen bg-[#080e1a] text-slate-100">

        {/* ── Header ── */}
        <div className="border-b border-slate-800/60 bg-[#0a1120]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <span className="text-white">{Icons.calendar}</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">Leave Management</h1>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Workforce Time-Off · AWM Synapse AI Enterprise</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-2 rounded-lg transition-all font-mono flex items-center gap-1.5">
                {Icons.download} Export
              </button>
              <button
                className="text-[11px] text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 font-mono"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                {Icons.calendar} New Request
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Applications', value: stats.total,    color: 'text-slate-300',   accent: 'bg-slate-500',   icon: Icons.users,    trend: '+3 this month', cls: 'fade-up fade-up-1' },
              { label: 'Approved Leaves',    value: stats.approved, color: 'text-emerald-400', accent: 'bg-emerald-500', icon: Icons.check,    trend: '71% approval rate', cls: 'fade-up fade-up-2' },
              { label: 'Pending Action',     value: stats.pending,  color: 'text-amber-400',   accent: 'bg-amber-500',   icon: Icons.clock,    trend: undefined, cls: 'fade-up fade-up-3' },
              { label: 'Rejected',           value: stats.rejected, color: 'text-rose-400',    accent: 'bg-rose-500',    icon: Icons.ban,      trend: undefined, cls: 'fade-up fade-up-4' },
            ].map(({ label, value, color, accent, icon, trend, cls }) => (
              <div key={label} className={cls}>
                <StatCard label={label} value={value} color={color} accent={accent} icon={icon} trend={trend} />
              </div>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className="flex flex-col xl:flex-row gap-6">

            {/* ── Table Panel ── */}
            <div className="flex-1 min-w-0 fade-up fade-up-2">
              <div className="rounded-2xl border border-slate-700/40 overflow-hidden" style={{ background: 'linear-gradient(145deg,#0f1724,#111827)' }}>

                {/* Table Header */}
                <div className="px-5 py-4 border-b border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest uppercase text-slate-300 font-mono">Time-Off Applications</div>
                    <div className="text-[9px] text-slate-600 mt-0.5 font-mono">{filtered.length} of {leaveRequests.length} records</div>
                  </div>

                  {/* Search & Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">{Icons.search}</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-slate-900/60 border border-slate-700/60 rounded-lg pl-7 pr-3 py-2 text-[11px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 w-36 transition-all font-mono"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 text-slate-500">{Icons.filter}
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as LeaveStatus | 'All')}
                        className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none focus:border-indigo-500 transition-all font-mono"
                      >
                        <option value="All">All Status</option>
                        {(['Pending','Approved','Rejected','Cancelled'] as LeaveStatus[]).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value as LeaveType | 'All')}
                      className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-2 py-2 text-[11px] text-slate-300 outline-none focus:border-indigo-500 transition-all font-mono"
                    >
                      <option value="All">All Types</option>
                      {(['Annual Leave','Sick Leave','Emergency Leave','Maternity Leave','Unpaid Leave','Compassionate Leave'] as LeaveType[]).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {/* Sort */}
                    <button
                      onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                      className="text-[10px] font-mono text-slate-500 hover:text-slate-300 border border-slate-700/60 rounded-lg px-2.5 py-2 transition-all"
                    >
                      {sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
                    </button>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-800/50">
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : filtered.length === 0
                      ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-600">{Icons.filter}</div>
                          <p className="text-slate-600 text-xs font-mono">No records match your filters</p>
                          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterType('All'); }} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono transition-all">Clear filters</button>
                        </div>
                      )
                      : filtered.map((req) => {
                        const sc = STATUS_CONFIG[req.status];
                        const tc = LEAVE_TYPE_COLORS[req.type];
                        const isSelected = selectedId === req.id;
                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedId(isSelected ? null : req.id)}
                            className={`row-hover px-5 py-4 cursor-pointer transition-all ${isSelected ? 'bg-indigo-500/6 border-l-2 border-l-indigo-500' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Avatar */}
                              <Avatar initials={req.avatar} dept={req.department} />

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-white tracking-tight truncate">{req.name}</span>
                                  <span className="text-[9px] text-indigo-400 font-mono bg-indigo-500/8 border border-indigo-500/20 px-1.5 py-0.5 rounded">{req.id}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[9px] text-slate-500 font-mono">{req.department}</span>
                                  <span className="text-slate-700">·</span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${tc}`}>{req.type}</span>
                                  <span className="text-slate-700">·</span>
                                  <span className="text-[9px] text-slate-500 font-mono">{req.duration}</span>
                                </div>
                                <div className="text-[9px] text-slate-600 font-mono mt-0.5">{req.startDate} → {req.endDate}</div>
                              </div>

                              {/* Status */}
                              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${sc.badge} ${sc.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${req.status === 'Pending' ? 'animate-pulse' : ''}`} />
                                  {sc.label}
                                </span>
                                <span className="text-[9px] text-slate-600 font-mono">{req.appliedDate}</span>
                              </div>

                              {/* Quick Actions */}
                              {req.status === 'Pending' && (
                                <div className="flex-shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={() => setConfirmAction({ id: req.id, action: 'Approved' })}
                                    className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-400 flex items-center justify-center transition-all"
                                    title="Approve"
                                  >{Icons.check}</button>
                                  <button
                                    onClick={() => setConfirmAction({ id: req.id, action: 'Rejected' })}
                                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 text-rose-400 flex items-center justify-center transition-all"
                                    title="Reject"
                                  >{Icons.x}</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  }
                </div>

                {/* Table Footer */}
                {!loading && filtered.length > 0 && (
                  <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 font-mono">{filtered.length} records · Sorted by {sortDir === 'desc' ? 'newest' : 'oldest'}</span>
                    <div className="flex items-center gap-2">
                      {(['Pending','Approved','Rejected'] as LeaveStatus[]).map(s => (
                        <div key={s} className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                          <span className="text-[9px] text-slate-600 font-mono">{leaveRequests.filter(r => r.status === s).length} {s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Detail Panel ── */}
            {selectedRequest && (
              <div className="xl:w-80 flex-shrink-0 slide-in">
                <div className="rounded-2xl border border-slate-700/40 overflow-hidden sticky top-24" style={{ background: 'linear-gradient(145deg,#0f1724,#111827)' }}>
                  <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-slate-300 font-mono">Request Detail</div>
                    <button onClick={() => setSelectedId(null)} className="text-slate-600 hover:text-slate-300 transition-all">{Icons.x}</button>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Employee */}
                    <div className="flex items-center gap-3">
                      <Avatar initials={selectedRequest.avatar} dept={selectedRequest.department} />
                      <div>
                        <div className="text-sm font-bold text-white">{selectedRequest.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{selectedRequest.department}</div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-800/60" />

                    {/* Fields */}
                    {[
                      { label: 'Request ID', value: selectedRequest.id },
                      { label: 'Leave Type', value: selectedRequest.type },
                      { label: 'Duration', value: selectedRequest.duration },
                      { label: 'Start Date', value: selectedRequest.startDate },
                      { label: 'End Date', value: selectedRequest.endDate },
                      { label: 'Applied On', value: selectedRequest.appliedDate },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-2">
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase flex-shrink-0">{label}</span>
                        <span className="text-[10px] text-slate-300 font-mono text-right">{value}</span>
                      </div>
                    ))}

                    <div className="h-px bg-slate-800/60" />

                    {/* Reason */}
                    <div>
                      <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-1.5">Reason</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{selectedRequest.reason}</p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Current Status</span>
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[selectedRequest.status].badge} ${STATUS_CONFIG[selectedRequest.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedRequest.status].dot}`} />
                        {selectedRequest.status}
                      </span>
                    </div>

                    {/* Actions */}
                    {selectedRequest.status === 'Pending' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleStatusChange(selectedRequest.id, 'Approved')}
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold font-mono text-white transition-all"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedRequest.id, 'Rejected')}
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold font-mono text-rose-400 border border-rose-500/25 hover:bg-rose-500/10 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm scale-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 p-6 space-y-4" style={{ background: 'linear-gradient(145deg,#0f1724,#111827)' }}>
            <div className="text-sm font-bold text-white">Confirm Action</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to <span className={confirmAction.action === 'Approved' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{confirmAction.action === 'Approved' ? 'approve' : 'reject'}</span> this leave request?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleStatusChange(confirmAction.id, confirmAction.action)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono text-white transition-all ${confirmAction.action === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
              >
                Yes, {confirmAction.action === 'Approved' ? 'Approve' : 'Reject'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-mono text-slate-400 border border-slate-700 hover:border-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}