'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// টাইপ সেফটি ও লোকাল ডিফিনিশন (server-only route ফাইল থেকে ইমপোর্ট নয়)
const ADVANCEMENT_OPTIONS = ['Promotion', 'Skill Certification', 'Department Transfer'] as const;
type AdvancementType = typeof ADVANCEMENT_OPTIONS[number];

interface AdvancementLog {
  id: string;
  employeeName: string;
  previousRole?: string | null;
  newRole: string;
  advancementType: AdvancementType;
  date: string; // ISO String
  notes?: string | null;
}

const API_BASE = '/api/staff-advancement-logs';

export default function StaffAdvancementDashboard() {
  // ডেটা স্টেট
  const [logs, setLogs] = useState<AdvancementLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ফর্ম স্টেট
  const [employeeName, setEmployeeName] = useState('');
  const [previousRole, setPreviousRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [advancementType, setAdvancementType] = useState<AdvancementType>('Promotion');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // অ্যাডভান্সড UI কন্ট্রোলস
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | AdvancementType>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // পেজিনেশন
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const abortRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    // আগের রিকোয়েস্ট থাকলে ক্যানসেল করুন
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(API_BASE, { signal: controller.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load logs: ${res.status}`);
      const data = (await res.json()) as AdvancementLog[];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('ডেটা লোড করতে সমস্যা হয়েছে:', err);
        setError('ডেটা লোড করতে সমস্যা হয়েছে। পরে চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchLogs]);

  // নতুন লগ সাবমিট করা
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // বেসিক ভ্যালিডেশন
    if (!employeeName.trim() || !newRole.trim()) {
      setError('কর্মচারীর নাম এবং নতুন পদ (Role) আবশ্যক।');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        employeeName: employeeName.trim(),
        previousRole: previousRole.trim() || undefined,
        newRole: newRole.trim(),
        advancementType,
        notes: notes.trim() || undefined,
      };
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await safeErrorMessage(res);
        throw new Error(msg || 'লগ সেভ করতে ব্যর্থ হয়েছে');
      }

      // Optimistic UX: ফর্ম রিসেট + রিফ্রেশ
      setEmployeeName('');
      setPreviousRole('');
      setNewRole('');
      setNotes('');
      await fetchLogs();
    } catch (err: any) {
      console.error('লগ সেভ করতে সমস্যা হয়েছে:', err);
      setError(err?.message || 'লগ সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ইউটিলস
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = logs.filter((l) => {
      const inType = typeFilter === 'All' ? true : l.advancementType === typeFilter;
      const inSearch =
        q.length === 0
          ? true
          : [l.employeeName, l.previousRole || '', l.newRole || '', l.notes || '']
              .join(' ')
              .toLowerCase()
              .includes(q);
      return inType && inSearch;
    });

    arr.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });

    return arr;
  }, [logs, search, typeFilter, sortOrder]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, currentPage, pageSize]);

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['id', 'employeeName', 'previousRole', 'newRole', 'advancementType', 'date', 'notes'];
    const rows = logs.map((l) => [
      l.id,
      escapeCsv(l.employeeName),
      escapeCsv(l.previousRole || ''),
      escapeCsv(l.newRole || ''),
      l.advancementType,
      l.date,
      escapeCsv(l.notes || ''),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-advancement-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b pb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Staff Advancement Logs</h1>
            <p className="text-gray-500 mt-1">কর্মকর্তা ও কর্মচারীদের পদোন্নতি এবং ক্যারিয়ারের অগ্রগতি ট্র্যাকিং সিস্টেম</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="bg-white border hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition"
              disabled={logs.length === 0}
              title={logs.length === 0 ? 'কোনো ডেটা নেই' : 'Export as CSV'}
            >
              Export CSV
            </button>
            <button
              onClick={() => fetchLogs()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* এরর আলার্ট */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* নতুন লগ যুক্ত করার ফর্ম */}
          <div className="bg-white p-6 rounded-xl shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">নতুন অগ্রগতি রেকর্ড করুন</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">কর্মচারীর নাম *</label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="যেমন: আরিফ রহমান"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">পূর্বের পদ (Role)</label>
                  <input
                    type="text"
                    value={previousRole}
                    onChange={(e) => setPreviousRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Junior Dev"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">নতুন পদ (Role) *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Mid Dev"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">অগ্রগতির ধরণ *</label>
                <select
                  value={advancementType}
                  onChange={(e) => setAdvancementType(e.target.value as AdvancementType)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {ADVANCEMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">অতিরিক্ত মন্তব্য/নোট</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="অগ্রগতি সম্পর্কিত বিস্তারিত তথ্য..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
              >
                {isSubmitting ? 'সেভ হচ্ছে...' : 'লগ যুক্ত করুন'}
              </button>
            </form>
          </div>

          {/* লগের তালিকা বা টেবিল */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">অগ্রগতি হিস্ট্রি (Logs)</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="সার্চ: নাম/রোল/নোট"
                />
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as 'All' | AdvancementType);
                    setPage(1);
                  }}
                  className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="All">সব ধরনের</option>
                  {ADVANCEMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                  className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="desc">নতুন আগে</option>
                  <option value="asc">পুরনো আগে</option>
                </select>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      প্রতি পেজে {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50"
                >
                  রিসেট
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-8">লোড হচ্ছে...</p>
            ) : filteredSorted.length === 0 ? (
              <p className="text-center text-gray-400 py-8">ম্যাচিং কোনো অগ্রগতির রেকর্ড নেই।</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                        <th className="p-3">কর্মচারী ও তারিখ</th>
                        <th className="p-3">টাইপ</th>
                        <th className="p-3">পরিবর্তন (Role)</th>
                        <th className="p-3">মন্তব্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pageItems.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition">
                          <td className="p-3">
                            <div className="font-semibold text-gray-950">{log.employeeName}</div>
                            <div className="text-xs text-gray-400">{formatDate(log.date)}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                log.advancementType === 'Promotion'
                                  ? 'bg-green-100 text-green-800'
                                  : log.advancementType === 'Skill Certification'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.advancementType}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            {log.previousRole ? (
                              <>
                                <span className="text-gray-400 line-through">{log.previousRole}</span>
                                <span className="text-indigo-600 font-medium"> → {log.newRole}</span>
                              </>
                            ) : (
                              <span className="text-indigo-600 font-medium">{log.newRole}</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-gray-600 max-w-xs truncate" title={log.notes || ''}>
                            {log.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <div>
                    মোট {total} টি রেকর্ড • পেজ {currentPage}/{totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 rounded border disabled:opacity-50"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      className="px-3 py-1 rounded border disabled:opacity-50"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper functions
function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.error || '';
  } catch {
    return '';
  }
}