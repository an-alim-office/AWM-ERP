"use client";
 
import React, { useState, useEffect, useCallback, useRef } from 'react';
 
// ─── Types ────────────────────────────────────────────────────────────────────
interface CardData {
  empId: string;
  name: string;
  role: string;
  department: string;
  issueDate: string;
  expiryDate: string;
  bloodGroup: string;
  nationality: string;
  branch: string;
  accessLevel: string;
  phone: string;
  email: string;
}
 
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  monospace?: boolean;
}
 
// ─── Reusable Input Field ─────────────────────────────────────────────────────
const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, monospace }) => (
  <div className="group">
    <label className="block text-[10px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-500 mb-1.5 transition-colors group-focus-within:text-blue-500">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-900/60 dark:bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-slate-100 text-xs placeholder-slate-600 outline-none ring-0 transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 hover:border-slate-600 ${monospace ? 'font-mono' : ''}`}
    />
  </div>
);
 
// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="w-[320px] h-[480px] rounded-2xl bg-slate-800/60 animate-pulse border border-slate-700/40" />
);
 
// ─── Barcode Renderer ─────────────────────────────────────────────────────────
const BarcodeStripes: React.FC<{ value: string }> = ({ value }) => {
  const stripes = React.useMemo(() => {
    const codes: number[] = [];
    for (let i = 0; i < value.length; i++) {
      codes.push(value.charCodeAt(i) % 4);
    }
    return codes;
  }, [value]);
 
  return (
    <div className="flex items-end gap-[1.5px] h-10 px-1">
      {stripes.map((w, i) => (
        <div
          key={i}
          className="bg-current rounded-[0.5px]"
          style={{ width: `${w + 1}px`, height: `${60 + ((i * 7) % 40)}%` }}
        />
      ))}
    </div>
  );
};
 
// ─── Avatar Initials ──────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'text-2xl' }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold tracking-tight bg-gradient-to-br from-slate-800 to-slate-900 text-white ${size}`}>
      {initials || '??'}
    </div>
  );
};
 
// ─── Access Level Badge ───────────────────────────────────────────────────────
const AccessBadge: React.FC<{ level: string }> = ({ level }) => {
  const map: Record<string, { color: string; bg: string }> = {
    L1: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    L2: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    L3: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    L4: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    L5: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  };
  const style = map[level] ?? map['L2'];
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${style.color} ${style.bg} uppercase tracking-widest`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      ACCESS {level}
    </span>
  );
};
 
// ─── Front Card ───────────────────────────────────────────────────────────────
const FrontCard: React.FC<{ data: CardData }> = ({ data }) => (
  <div
    className="w-[320px] h-[480px] rounded-2xl relative overflow-hidden shadow-2xl flex flex-col print:shadow-none"
    style={{
      background: 'linear-gradient(145deg, #0f1724 0%, #111827 40%, #0c1220 100%)',
      border: '1.5px solid rgba(99,102,241,0.25)',
    }}
  >
    {/* Decorative mesh */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-indigo-600/20 via-blue-900/10 to-transparent" />
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-indigo-500/8 blur-2xl" />
      <div className="absolute top-20 -left-8 w-28 h-28 rounded-full bg-blue-500/6 blur-xl" />
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-f" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-f)" />
      </svg>
    </div>
 
    {/* Header */}
    <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
      <div>
        <div className="text-[11px] font-extrabold tracking-[0.2em] text-white uppercase font-mono">AWM Synapse AI</div>
        <div className="text-[8px] text-indigo-400 font-mono tracking-[0.15em] mt-0.5 uppercase">Enterprise · {data.branch}</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <AccessBadge level={data.accessLevel} />
        <span className="text-[8px] text-slate-600 font-mono">CORP ID</span>
      </div>
    </div>
 
    {/* Divider line */}
    <div className="relative z-10 mx-5 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
 
    {/* Avatar + Name */}
    <div className="relative z-10 flex flex-col items-center mt-5 px-5">
      <div
        className="w-24 h-24 rounded-xl p-[1.5px] shadow-xl"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }}
      >
        <Avatar name={data.name} size="text-[22px]" />
      </div>
      <div className="mt-3.5 text-center">
        <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight">{data.name}</h3>
        <p className="text-[10px] text-indigo-300 font-mono mt-0.5 tracking-wide">{data.role}</p>
        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{data.department}</p>
      </div>
    </div>
 
    {/* Credentials */}
    <div className="relative z-10 mx-5 mt-5 rounded-xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-sm px-4 py-3 space-y-2 font-mono text-[10px]">
      {[
        { label: 'EMPLOYEE ID', value: data.empId, highlight: true },
        { label: 'DEPARTMENT', value: data.department, highlight: false },
        { label: 'REGIONAL NODE', value: data.branch, highlight: false },
        { label: 'CONTACT', value: data.phone || '—', highlight: false },
      ].map(({ label, value, highlight }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-slate-500 tracking-widest text-[9px]">{label}</span>
          <span className={highlight ? 'text-indigo-300 font-bold' : 'text-slate-300'}>{value}</span>
        </div>
      ))}
    </div>
 
    {/* Footer */}
    <div
      className="relative z-10 mt-auto mx-5 mb-5 rounded-xl flex items-center justify-between px-4 py-2"
      style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}
    >
      <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">Secure Access Pass</span>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[8px] text-green-400 font-mono">ACTIVE</span>
      </div>
    </div>
  </div>
);
 
// ─── Back Card ────────────────────────────────────────────────────────────────
const BackCard: React.FC<{ data: CardData }> = ({ data }) => (
  <div
    className="w-[320px] h-[480px] rounded-2xl relative overflow-hidden shadow-2xl flex flex-col font-mono print:shadow-none"
    style={{
      background: 'linear-gradient(145deg, #0c1220 0%, #0f1724 60%, #111827 100%)',
      border: '1.5px solid rgba(99,102,241,0.25)',
    }}
  >
    {/* BG deco */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-purple-600/6 blur-2xl" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-b" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-b)" />
      </svg>
    </div>
 
    {/* Top chip strip */}
    <div className="relative z-10 h-10 mt-6 mx-5 rounded-lg border border-slate-700/40 bg-slate-900/50 flex items-center px-3 gap-2">
      <div className="w-8 h-5 rounded-sm border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-[2px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-yellow-500/60" />
          ))}
        </div>
      </div>
      <span className="text-[9px] text-slate-500 tracking-widest uppercase">Biometric Encrypted · ISO/IEC 14443</span>
    </div>
 
    {/* Personal Data */}
    <div className="relative z-10 mx-5 mt-4 rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3 space-y-2 text-[10px]">
      <div className="text-[9px] text-slate-600 tracking-widest uppercase border-b border-slate-800 pb-2 mb-2">Personal Details</div>
      {[
        { label: 'BLOOD GROUP', value: data.bloodGroup, cls: 'text-red-400 font-bold' },
        { label: 'NATIONALITY', value: data.nationality, cls: 'text-slate-300' },
        { label: 'ISSUE DATE', value: data.issueDate, cls: 'text-slate-300' },
        { label: 'EXPIRY DATE', value: data.expiryDate, cls: 'text-orange-400 font-bold' },
        { label: 'EMAIL', value: data.email || '—', cls: 'text-indigo-300 text-[9px]' },
      ].map(({ label, value, cls }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-slate-500 tracking-widest text-[9px]">{label}</span>
          <span className={cls}>{value}</span>
        </div>
      ))}
    </div>
 
    {/* Barcode Section */}
    <div className="relative z-10 mx-5 mt-4 rounded-xl border border-slate-700/40 bg-slate-900/60 px-4 py-3 flex flex-col items-center gap-1">
      <div className="text-[8px] text-slate-600 tracking-widest uppercase self-start mb-1">Machine Readable Zone</div>
      <div className="text-slate-300 w-full">
        <BarcodeStripes value={data.empId} />
      </div>
      <span className="text-[8px] text-slate-500 tracking-[0.25em] mt-1">*{data.empId}*</span>
    </div>
 
    {/* Disclaimer */}
    <div className="relative z-10 mx-5 mt-3 text-[8px] text-slate-600 text-center leading-relaxed px-2">
      Property of AWM Synapse AI Systems. Monitored via regional gateway. Return to nearest system terminal if found.
    </div>
 
    {/* Footer */}
    <div
      className="relative z-10 mt-auto mx-5 mb-5 rounded-xl flex items-center justify-between px-4 py-2"
      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}
    >
      <span className="text-[8px] text-slate-500 tracking-widest uppercase">AWM-SYN · {data.branch}</span>
      <span className="text-[8px] text-slate-600 font-mono">v2026.1</span>
    </div>
  </div>
);
 
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'both'>('both');
  const [saved, setSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
 
  const [cardData, setCardData] = useState<CardData>({
    empId: 'AWM-2026-089',
    name: 'H. M. Alim Uddin',
    role: 'Lead Solution Architect',
    department: 'AI Core & ERP Systems',
    issueDate: 'June 2026',
    expiryDate: 'Dec 2029',
    bloodGroup: 'B+',
    nationality: 'Bangladeshi',
    branch: 'Riyadh HQ',
    accessLevel: 'L4',
    phone: '+966 50 000 0000',
    email: 'alim@awmsynapse.ai',
  });
 
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);
 
  const updateField = useCallback(
    <K extends keyof CardData>(key: K, value: CardData[K]) => {
      setCardData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );
 
  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);
 
  const handlePrint = useCallback(() => {
    window.print();
  }, []);
 
  const handleReset = useCallback(() => {
    setCardData({
      empId: 'AWM-2026-089',
      name: 'H. M. Alim Uddin',
      role: 'Lead Solution Architect',
      department: 'AI Core & ERP Systems',
      issueDate: 'June 2026',
      expiryDate: 'Dec 2029',
      bloodGroup: 'B+',
      nationality: 'Bangladeshi',
      branch: 'Riyadh HQ',
      accessLevel: 'L4',
      phone: '+966 50 000 0000',
      email: 'alim@awmsynapse.ai',
    });
  }, []);
 
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-mono text-xs tracking-widest">INITIALIZING</span>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print-area { display: flex !important; gap: 48px !important; justify-content: center !important; padding: 40px !important; }
          .print-card { filter: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.8s infinite;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.2s; }
        .card-hover { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 24px 60px rgba(99,102,241,0.2); }
      `}</style>
 
      <div className="min-h-screen bg-[#080e1a] text-slate-100 print:bg-white">
 
        {/* ── Top Header ── */}
        <div className="print:hidden border-b border-slate-800/60 bg-[#0a1120]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="8" cy="12" r="2" />
                  <path d="M14 10h4M14 14h2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">Biometric ID Card Generator</h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">Corporate Smart Card · AWM Synapse AI Enterprise Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-2 rounded-lg transition-all font-mono tracking-wide"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="text-xs text-slate-100 border border-slate-700 hover:border-green-600 hover:bg-green-600/10 px-3 py-2 rounded-lg transition-all font-mono tracking-wide flex items-center gap-1.5"
              >
                {saved ? (
                  <>
                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-green-400">Saved</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save Draft
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="text-xs text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 font-mono tracking-wide"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
            </div>
          </div>
        </div>
 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 print:p-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start print:block">
 
            {/* ── Left Panel: Controls ── */}
            <div className="xl:col-span-1 print:hidden fade-up fade-up-1">
              <div
                className="rounded-2xl overflow-hidden border border-slate-700/40"
                style={{ background: 'linear-gradient(145deg, #0f1724, #111827)' }}
              >
                {/* Panel Header */}
                <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest uppercase text-slate-300 font-mono">Card Data Controller</div>
                    <div className="text-[9px] text-slate-600 mt-0.5 font-mono">Live preview updates in real-time</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
 
                <div className="p-5 space-y-4">
                  {/* Identity Group */}
                  <div className="space-y-1 mb-1">
                    <div className="text-[9px] font-bold tracking-[0.2em] text-indigo-500 uppercase font-mono">Identity</div>
                  </div>
                  <InputField label="Employee Name" value={cardData.name} onChange={(v) => updateField('name', v)} />
                  <InputField label="Designation / Role" value={cardData.role} onChange={(v) => updateField('role', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Employee ID" value={cardData.empId} onChange={(v) => updateField('empId', v)} monospace />
                    <div className="group">
                      <label className="block text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-1.5 transition-colors group-focus-within:text-blue-500">Access Level</label>
                      <select
                        value={cardData.accessLevel}
                        onChange={(e) => updateField('accessLevel', e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-slate-100 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                      >
                        {['L1', 'L2', 'L3', 'L4', 'L5'].map((l) => (
                          <option key={l} value={l} className="bg-slate-900">{l} — {['Visitor', 'Staff', 'Senior', 'Lead', 'Executive'][parseInt(l[1]) - 1]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
 
                  {/* Organization Group */}
                  <div className="pt-2 space-y-1">
                    <div className="text-[9px] font-bold tracking-[0.2em] text-indigo-500 uppercase font-mono">Organization</div>
                  </div>
                  <InputField label="Department" value={cardData.department} onChange={(v) => updateField('department', v)} />
                  <InputField label="Regional Branch / Node" value={cardData.branch} onChange={(v) => updateField('branch', v)} />
 
                  {/* Personal Group */}
                  <div className="pt-2 space-y-1">
                    <div className="text-[9px] font-bold tracking-[0.2em] text-indigo-500 uppercase font-mono">Personal</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Blood Group" value={cardData.bloodGroup} onChange={(v) => updateField('bloodGroup', v)} monospace />
                    <InputField label="Nationality" value={cardData.nationality} onChange={(v) => updateField('nationality', v)} />
                  </div>
                  <InputField label="Phone" value={cardData.phone} onChange={(v) => updateField('phone', v)} monospace />
                  <InputField label="Email" value={cardData.email} onChange={(v) => updateField('email', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Issue Date" value={cardData.issueDate} onChange={(v) => updateField('issueDate', v)} />
                    <InputField label="Expiry Date" value={cardData.expiryDate} onChange={(v) => updateField('expiryDate', v)} />
                  </div>
                </div>
 
                {/* Status bar */}
                <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">Unsaved changes</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-[9px] text-yellow-400 font-mono">Draft</span>
                  </div>
                </div>
              </div>
            </div>
 
            {/* ── Right Panel: Cards Preview ── */}
            <div className="xl:col-span-2 fade-up fade-up-2 print:block">
              {/* View Toggle - Screen only */}
              <div className="print:hidden mb-6 flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-700/60 overflow-hidden bg-slate-900/50 p-0.5">
                  {(['both', 'front', 'back'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] font-mono tracking-widest uppercase px-4 py-1.5 rounded-md transition-all ${
                        activeTab === tab
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-600 font-mono ml-auto">85.6 × 54 mm · CR80 Standard</span>
              </div>
 
              {/* Cards */}
              <div
                ref={printRef}
                className="print-area flex flex-col md:flex-row gap-6 justify-center items-center flex-wrap"
              >
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    {(activeTab === 'both' || activeTab === 'front') && (
                      <div className="card-hover print-card fade-up fade-up-2">
                        <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase text-center mb-2 print:hidden">Front Side</div>
                        <FrontCard data={cardData} />
                      </div>
                    )}
                    {(activeTab === 'both' || activeTab === 'back') && (
                      <div className="card-hover print-card fade-up fade-up-3">
                        <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase text-center mb-2 print:hidden">Back Side</div>
                        <BackCard data={cardData} />
                      </div>
                    )}
                  </>
                )}
              </div>
 
              {/* Info strip */}
              <div className="print:hidden mt-8 rounded-xl border border-slate-800/60 bg-slate-900/30 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Card Standard', value: 'ISO 7810 CR80' },
                  { label: 'Encryption', value: 'AES-256' },
                  { label: 'Access Zones', value: '5 Levels' },
                  { label: 'Valid Until', value: cardData.expiryDate },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">{label}</span>
                    <span className="text-[11px] text-slate-300 font-semibold font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}