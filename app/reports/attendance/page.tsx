"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AttendanceRow {
  id: string;
  name: string;
  department: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  overtime: string;
  status: "Present" | "Late" | "Absent";
}

const MOCK_DATA: AttendanceRow[] = [
  {
    id: "W101",
    name: "আব্দুল্লাহ আল-মামুন",
    department: "Production",
    shift: "Morning",
    checkIn: "07:45 AM",
    checkOut: "05:00 PM",
    workHours: "09h 15m",
    overtime: "01h 00m",
    status: "Present",
  },
  {
    id: "W102",
    name: "মোঃ তারেক রহমান",
    department: "Operations",
    shift: "Morning",
    checkIn: "08:15 AM",
    checkOut: "05:00 PM",
    workHours: "08h 20m",
    overtime: "00h 15m",
    status: "Late",
  },
  {
    id: "W103",
    name: "আরিফ হোসেন",
    department: "Maintenance",
    shift: "Night",
    checkIn: "---",
    checkOut: "---",
    workHours: "00h 00m",
    overtime: "00h 00m",
    status: "Absent",
  },
  {
    id: "W104",
    name: "কামরুল ইসলাম",
    department: "Logistics",
    shift: "Morning",
    checkIn: "07:50 AM",
    checkOut: "05:00 PM",
    workHours: "09h 10m",
    overtime: "00h 45m",
    status: "Present",
  },
  {
    id: "W105",
    name: "সোহেল রানা",
    department: "Packaging",
    shift: "Evening",
    checkIn: "08:03 AM",
    checkOut: "05:15 PM",
    workHours: "09h 02m",
    overtime: "00h 30m",
    status: "Late",
  },
];

const statusStyles = {
  Present:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Late:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Absent:
    "bg-red-500/10 text-red-400 border border-red-500/20",
};

const SkeletonCard = memo(() => (
  <div className="h-[120px] animate-pulse rounded-3xl border border-white/5 bg-[#161b22]" />
));

SkeletonCard.displayName = "SkeletonCard";

const SkeletonRow = memo(() => (
  <div className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
));

SkeletonRow.displayName = "SkeletonRow";

export default function AttendanceReportPage() {
  const [reportDate, setReportDate] =
    useState("2026-05-29");

  const [filterType, setFilterType] =
    useState("all");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [search, setSearch] = useState("");

  const [reportData, setReportData] =
    useState<AttendanceRow[] | null>(null);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsGenerating(true);
    setReportData(null);

    setTimeout(() => {
      let filtered = [...MOCK_DATA];

      if (filterType !== "all") {
        filtered = filtered.filter(
          (item) =>
            item.status === filterType
        );
      }

      setReportData(filtered);
      setIsGenerating(false);
    }, 1200);
  };

  const filteredSearchData = useMemo(() => {
    if (!reportData) return [];

    return reportData.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.department
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [reportData, search]);

  const analytics = useMemo(() => {
    const source =
      filteredSearchData.length > 0
        ? filteredSearchData
        : [];

    return {
      total: source.length,
      present: source.filter(
        (r) => r.status === "Present"
      ).length,
      late: source.filter(
        (r) => r.status === "Late"
      ).length,
      absent: source.filter(
        (r) => r.status === "Absent"
      ).length,
    };
  }, [filteredSearchData]);

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#0d1117] text-gray-100"
          : "bg-[#f5f7fb] text-gray-900"
      }`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1700px]">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-blue-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                Enterprise Attendance Intelligence
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                হাজিরা রিপোর্ট
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-gray-400">
                AI-powered workforce attendance
                monitoring, shift analytics,
                employee tracking & enterprise
                reporting system.
              </p>
            </div>

            <button
              onClick={() =>
                setDarkMode((prev) => !prev)
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30"
            >
              {darkMode
                ? "Light Mode"
                : "Dark Mode"}
            </button>
          </div>

          {/* Analytics */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {!mounted ? (
              Array.from({
                length: 4,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))
            ) : (
              <>
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Total Employees
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-blue-400">
                    {analytics.total}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Present
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-emerald-400">
                    {analytics.present}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Late
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-amber-400">
                    {analytics.late}
                  </h2>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Absent
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-red-400">
                    {analytics.absent}
                  </h2>
                </div>
              </>
            )}
          </div>

          {/* Filter Form */}
          <form
            onSubmit={handleGenerateReport}
            className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-2xl xl:grid-cols-4"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                তারিখ নির্বাচন করুন
              </label>

              <input
                type="date"
                value={reportDate}
                onChange={(e) =>
                  setReportDate(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-blue-400/40"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                ফিল্টার স্ট্যাটাস
              </label>

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value
                  )
                }
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-blue-400/40"
              >
                <option value="all">
                  সকল কর্মচারী
                </option>

                <option value="Present">
                  উপস্থিত
                </option>

                <option value="Late">
                  দেরি
                </option>

                <option value="Absent">
                  অনুপস্থিত
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Search Employee
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="আইডি / নাম / বিভাগ"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none transition-all duration-300 focus:border-blue-400/40"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating
                  ? "রিপোর্ট তৈরি হচ্ছে..."
                  : "রিপোর্ট জেনারেট করুন"}
              </button>
            </div>
          </form>

          {/* Loading */}
          {isGenerating && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-2xl">
              <div className="space-y-4">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <SkeletonRow
                    key={index}
                  />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />

                <span>
                  AI attendance engine data
                  processing করছে...
                </span>
              </div>
            </div>
          )}

          {/* Table */}
          {!isGenerating &&
            reportData && (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-2xl">
                {/* Header */}
                <div className="border-b border-white/5 px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight">
                        Attendance Summary
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        রিপোর্ট তারিখঃ{" "}
                        {reportDate}
                      </p>
                    </div>

                    <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                      Total Employees:{" "}
                      {
                        filteredSearchData.length
                      }
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1400px]">
                    <thead className="border-b border-white/5 bg-black/10">
                      <tr>
                        {[
                          "Employee ID",
                          "নাম",
                          "Department",
                          "Shift",
                          "Check In",
                          "Check Out",
                          "Work Hours",
                          "Overtime",
                          "Status",
                        ].map((head) => (
                          <th
                            key={head}
                            className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-gray-500"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSearchData.map(
                        (row) => (
                          <tr
                            key={row.id}
                            className="border-b border-white/5 transition-all duration-300 hover:bg-white/[0.03]"
                          >
                            <td className="px-6 py-5">
                              <span className="font-bold text-blue-400">
                                {row.id}
                              </span>
                            </td>

                            <td className="px-6 py-5 font-semibold">
                              {row.name}
                            </td>

                            <td className="px-6 py-5 text-sm text-cyan-300">
                              {
                                row.department
                              }
                            </td>

                            <td className="px-6 py-5 text-sm">
                              {row.shift}
                            </td>

                            <td className="px-6 py-5 font-mono text-sm">
                              {
                                row.checkIn
                              }
                            </td>

                            <td className="px-6 py-5 font-mono text-sm">
                              {
                                row.checkOut
                              }
                            </td>

                            <td className="px-6 py-5 text-sm font-semibold text-emerald-300">
                              {
                                row.workHours
                              }
                            </td>

                            <td className="px-6 py-5 text-sm font-semibold text-violet-300">
                              {
                                row.overtime
                              }
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                  statusStyles[
                                    row.status
                                  ]
                                }`}
                              >
                                {row.status ===
                                "Present"
                                  ? "উপস্থিত"
                                  : row.status ===
                                    "Late"
                                  ? "দেরি"
                                  : "অনুপস্থিত"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Empty State */}
          {!isGenerating &&
            reportData &&
            filteredSearchData.length ===
              0 && (
              <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-3xl">
                  📄
                </div>

                <h3 className="text-2xl font-black tracking-tight">
                  কোনো ডাটা পাওয়া যায়নি
                </h3>

                <p className="mt-3 text-sm text-gray-400">
                  Search অথবা filter
                  পরিবর্তন করে পুনরায়
                  চেষ্টা করুন।
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}