"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  BadgeDollarSign,
  Banknote,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileText,
  Filter,
  Landmark,
  Loader2,
  MoonStar,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type MadhabType =
  | "Hanafi"
  | "Shafi"
  | "Maliki"
  | "Hanbali";

type RecordType = {
  _id?: string;
  name: string;
  assets: number;
  liabilities: number;
  zakatDue: number;
  createdAt?: string;
};

type FormState = {
  name: string;
  assets: string;
  liabilities: string;
};

type SortType =
  | "latest"
  | "highest-zakat"
  | "highest-assets";

/* =========================================================
   CONSTANTS
========================================================= */

const MADHABS: MadhabType[] = [
  "Hanafi",
  "Shafi",
  "Maliki",
  "Hanbali",
];

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

/* =========================================================
   PAGE
========================================================= */

export default function ZakatManagementPage() {
  /* =========================================================
     STATES
  ========================================================= */

  const [selectedMadhab, setSelectedMadhab] =
    useState<MadhabType>("Hanafi");

  const [records, setRecords] = useState<
    RecordType[]
  >([]);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [submitting, setSubmitting] =
    useState<boolean>(false);

  const [showModal, setShowModal] =
    useState<boolean>(false);

  const [search, setSearch] =
    useState<string>("");

  const [darkMode, setDarkMode] =
    useState<boolean>(true);

  const [sortBy, setSortBy] =
    useState<SortType>("latest");

  const [formData, setFormData] =
    useState<FormState>({
      name: "",
      assets: "",
      liabilities: "",
    });

  /* =========================================================
     FETCH RECORDS
  ========================================================= */

  const fetchRecords = useCallback(
    async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/zakat-management",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch records"
          );
        }

        const data =
          await response.json();

        if (data?.success) {
          setRecords(data.data || []);
        }
      } catch (error) {
        console.error(
          "Fetch Records Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const totalAssets = useMemo(() => {
    return records.reduce(
      (accumulator, current) =>
        accumulator +
        Number(current.assets || 0),
      0
    );
  }, [records]);

  const totalLiabilities =
    useMemo(() => {
      return records.reduce(
        (accumulator, current) =>
          accumulator +
          Number(
            current.liabilities || 0
          ),
        0
      );
    }, [records]);

  const netAssets = useMemo(() => {
    return (
      totalAssets -
      totalLiabilities
    );
  }, [
    totalAssets,
    totalLiabilities,
  ]);

  const totalZakat = useMemo(() => {
    return netAssets > 0
      ? netAssets * 0.025
      : 0;
  }, [netAssets]);

  const nisabEligibleCount =
    useMemo(() => {
      return records.filter(
        (record) =>
          record.assets -
            record.liabilities >
          0
      ).length;
    }, [records]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredRecords = useMemo(() => {
    const filtered =
      records.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    switch (sortBy) {
      case "highest-zakat":
        return filtered.sort(
          (a, b) =>
            b.zakatDue -
            a.zakatDue
        );

      case "highest-assets":
        return filtered.sort(
          (a, b) =>
            b.assets - a.assets
        );

      default:
        return filtered.sort(
          (a, b) =>
            new Date(
              b.createdAt || ""
            ).getTime() -
            new Date(
              a.createdAt || ""
            ).getTime()
        );
    }
  }, [records, search, sortBy]);

  /* =========================================================
     CREATE RECORD
  ========================================================= */

  const handleCreateRecord =
    async (): Promise<void> => {
      try {
        if (!formData.name.trim()) {
          alert(
            "Account name is required"
          );
          return;
        }

        if (!formData.assets) {
          alert("Assets are required");
          return;
        }

        setSubmitting(true);

        const assets = Number(
          formData.assets
        );

        const liabilities = Number(
          formData.liabilities || 0
        );

        if (
          Number.isNaN(assets) ||
          Number.isNaN(liabilities)
        ) {
          alert("Invalid numeric values");
          return;
        }

        if (
          assets < 0 ||
          liabilities < 0
        ) {
          alert(
            "Negative values are not allowed"
          );
          return;
        }

        const zakatDue =
          Math.max(
            assets - liabilities,
            0
          ) * 0.025;

        const response = await fetch(
          "/api/zakat-management",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: formData.name,
              assets,
              liabilities,
              zakatDue,
              nisabEligible:
                assets - liabilities >
                0,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to create record"
          );
        }

        const data =
          await response.json();

        if (data.success) {
          setShowModal(false);

          setFormData({
            name: "",
            assets: "",
            liabilities: "",
          });

          await fetchRecords();
        }
      } catch (error) {
        console.error(
          "Create Record Error:",
          error
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =========================================================
     DELETE RECORD
  ========================================================= */

  const handleDelete = async (
    id?: string
  ) => {
    try {
      if (!id) return;

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this record?"
        );

      if (!confirmDelete) return;

      const response = await fetch(
        `/api/zakat-management/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Delete request failed"
        );
      }

      await fetchRecords();
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );
    }
  };

  /* =========================================================
     PDF EXPORT
  ========================================================= */

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);

      doc.text(
        "Enterprise Zakat Report",
        14,
        20
      );

      doc.setFontSize(11);

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        30
      );

      autoTable(doc, {
        startY: 40,

        head: [
          [
            "Account",
            "Assets",
            "Liabilities",
            "Zakat Due",
          ],
        ],

        body: filteredRecords.map(
          (record) => [
            record.name,
            `SAR ${record.assets.toLocaleString()}`,
            `SAR ${record.liabilities.toLocaleString()}`,
            `SAR ${record.zakatDue.toLocaleString()}`,
          ]
        ),

        styles: {
          fontSize: 10,
          cellPadding: 4,
        },

        headStyles: {
          fillColor: [5, 150, 105],
        },
      });

      doc.save(
        "enterprise-zakat-report.pdf"
      );
    } catch (error) {
      console.error(
        "PDF Export Error:",
        error
      );
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#020617] text-white"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-xl ${
                darkMode
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <ShieldCheck size={16} />

              <span className="text-sm font-semibold">
                Enterprise Islamic
                Finance Intelligence
              </span>
            </div>

            <h1 className="mt-5 text-4xl lg:text-6xl font-black tracking-tight">
              Zakat Management
            </h1>

            <p
              className={`mt-5 max-w-3xl leading-relaxed ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Advanced AI-powered zakat
              operations management with
              audit-ready workflows,
              intelligent finance
              analytics, enterprise-grade
              reporting, and real-time
              Islamic financial insights.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold transition-all duration-300 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:bg-slate-800"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              {darkMode ? (
                <SunMedium
                  size={18}
                />
              ) : (
                <MoonStar
                  size={18}
                />
              )}
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 hover:opacity-90 text-white px-5 py-3 font-semibold transition-all duration-300 shadow-2xl"
            >
              <Download size={18} />
              Export PDF
            </button>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:scale-[1.02] text-white px-5 py-3 font-semibold transition-all duration-300 shadow-[0_20px_40px_rgba(16,185,129,0.35)]"
            >
              <Plus size={18} />
              New Calculation
            </button>
          </div>
        </div>

        {/* =====================================================
            METRICS
        ===================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            darkMode={darkMode}
            title="Total Assets"
            value={`SAR ${totalAssets.toLocaleString()}`}
            growth="+12.5%"
            icon={
              <Wallet className="text-emerald-400" />
            }
            gradient="from-emerald-500/20 to-emerald-500/5"
          />

          <StatCard
            darkMode={darkMode}
            title="Liabilities"
            value={`SAR ${totalLiabilities.toLocaleString()}`}
            growth="+4.2%"
            icon={
              <Landmark className="text-amber-400" />
            }
            gradient="from-amber-500/20 to-amber-500/5"
          />

          <StatCard
            darkMode={darkMode}
            title="Net Assets"
            value={`SAR ${netAssets.toLocaleString()}`}
            growth="+18.7%"
            icon={
              <Building2 className="text-cyan-400" />
            }
            gradient="from-cyan-500/20 to-cyan-500/5"
          />

          <StatCard
            darkMode={darkMode}
            title="Total Zakat"
            value={`SAR ${totalZakat.toLocaleString()}`}
            growth="+9.9%"
            icon={
              <BadgeDollarSign className="text-fuchsia-400" />
            }
            gradient="from-fuchsia-500/20 to-fuchsia-500/5"
          />
        </div>

        {/* =====================================================
            GRID
        ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="xl:col-span-3 space-y-6">
            {/* AI PANEL */}

            <div
              className={`relative overflow-hidden rounded-[32px] border p-6 lg:p-8 ${
                darkMode
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-slate-200 bg-white"
              } backdrop-blur-2xl shadow-2xl`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%)]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <BrainCircuit className="text-white" />
                    </div>

                    <div>
                      <h2 className="text-3xl font-black">
                        AI Zakat Assistant
                      </h2>

                      <p
                        className={`mt-1 text-sm ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Smart Islamic
                        financial
                        intelligence engine
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Generate audit report",
                      "Compare madhab rulings",
                      "Business zakat intelligence",
                      "AI compliance verification",
                    ].map((item) => (
                      <button
                        key={item}
                        className={`group flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 ${
                          darkMode
                            ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Sparkles
                            size={16}
                            className="text-emerald-400"
                          />
                        </div>

                        <span className="font-medium text-sm">
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`w-full lg:max-w-md rounded-[28px] border p-6 ${
                    darkMode
                      ? "border-white/10 bg-[#08111f]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      AI Compliance
                    </span>

                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2
                        size={14}
                      />
                      ACTIVE
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <InsightItem
                      darkMode={
                        darkMode
                      }
                      label="Zakat Eligible Accounts"
                      value={`${nisabEligibleCount}`}
                    />

                    <InsightItem
                      darkMode={
                        darkMode
                      }
                      label="Current Madhab"
                      value={
                        selectedMadhab
                      }
                    />

                    <InsightItem
                      darkMode={
                        darkMode
                      }
                      label="AI Forecast Accuracy"
                      value="99.2%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div
              className={`rounded-[32px] border overflow-hidden ${
                darkMode
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-slate-200 bg-white"
              } backdrop-blur-2xl shadow-2xl`}
            >
              <div
                className={`flex flex-col gap-5 border-b p-6 lg:flex-row lg:items-center lg:justify-between ${
                  darkMode
                    ? "border-white/10"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <h2 className="text-2xl font-black">
                    Enterprise Records
                  </h2>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Real-time zakat
                    operations database
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search
                      size={18}
                      className={`absolute left-4 top-4 ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Search records..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all ${
                        darkMode
                          ? "bg-[#08111f] border border-white/10 focus:border-emerald-500 text-white"
                          : "bg-slate-50 border border-slate-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={16}
                      className={`absolute left-4 top-4 ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    />

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target
                            .value as SortType
                        )
                      }
                      className={`appearance-none pl-11 pr-10 py-4 rounded-2xl outline-none font-medium ${
                        darkMode
                          ? "bg-[#08111f] border border-white/10 text-white"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <option value="latest">
                        Latest
                      </option>

                      <option value="highest-zakat">
                        Highest Zakat
                      </option>

                      <option value="highest-assets">
                        Highest Assets
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr
                      className={`border-b ${
                        darkMode
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      {[
                        "Account",
                        "Assets",
                        "Liabilities",
                        "Zakat Due",
                        "Status",
                        "Created",
                        "Actions",
                      ].map((item) => (
                        <th
                          key={item}
                          className={`text-left px-6 py-5 text-xs uppercase tracking-[0.2em] font-black ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      [...Array(5)].map(
                        (_, index) => (
                          <tr
                            key={index}
                            className={`border-b ${
                              darkMode
                                ? "border-white/5"
                                : "border-slate-100"
                            }`}
                          >
                            {[...Array(7)].map(
                              (
                                __,
                                idx
                              ) => (
                                <td
                                  key={
                                    idx
                                  }
                                  className="px-6 py-5"
                                >
                                  <div
                                    className={`relative h-12 overflow-hidden rounded-2xl ${
                                      darkMode
                                        ? "bg-white/[0.05]"
                                        : "bg-slate-100"
                                    } ${shimmer}`}
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )
                    ) : filteredRecords.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-24 text-center"
                        >
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div
                              className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                                darkMode
                                  ? "bg-white/[0.05]"
                                  : "bg-slate-100"
                              }`}
                            >
                              <FileText className="text-slate-400" />
                            </div>

                            <div>
                              <h3 className="text-xl font-bold">
                                No Records
                                Found
                              </h3>

                              <p
                                className={`mt-2 ${
                                  darkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                }`}
                              >
                                Create your
                                first zakat
                                calculation
                                record.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(
                        (record) => {
                          const eligible =
                            record.assets -
                              record.liabilities >
                            0;

                          return (
                            <tr
                              key={
                                record._id
                              }
                              className={`border-b transition-all duration-300 ${
                                darkMode
                                  ? "border-white/5 hover:bg-white/[0.03]"
                                  : "border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <Building2 className="text-emerald-400" />
                                  </div>

                                  <div>
                                    <h3 className="font-bold">
                                      {
                                        record.name
                                      }
                                    </h3>

                                    <p
                                      className={`text-sm mt-1 ${
                                        darkMode
                                          ? "text-slate-500"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      Enterprise
                                      Account
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-5 font-semibold">
                                SAR{" "}
                                {record.assets.toLocaleString()}
                              </td>

                              <td className="px-6 py-5 font-semibold">
                                SAR{" "}
                                {record.liabilities.toLocaleString()}
                              </td>

                              <td className="px-6 py-5">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                                  <CircleDollarSign
                                    size={16}
                                  />
                                  SAR{" "}
                                  {record.zakatDue.toLocaleString()}
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                    eligible
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  <CheckCircle2
                                    size={14}
                                  />

                                  {eligible
                                    ? "Eligible"
                                    : "Not Eligible"}
                                </div>
                              </td>

                              <td
                                className={`px-6 py-5 text-sm ${
                                  darkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {record.createdAt
                                  ? new Date(
                                      record.createdAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>

                              <td className="px-6 py-5">
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      record._id
                                    )
                                  }
                                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300"
                                >
                                  <Trash2
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDEBAR
          ===================================================== */}

          <div className="space-y-6">
            {/* MADHAB */}

            <div
              className={`rounded-[32px] border p-6 ${
                darkMode
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-slate-200 bg-white"
              } backdrop-blur-2xl shadow-2xl`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Banknote className="text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Madhab Selection
                  </h2>

                  <p
                    className={`text-sm mt-1 ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Islamic finance
                    configuration
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {MADHABS.map(
                  (madhab) => (
                    <button
                      key={madhab}
                      onClick={() =>
                        setSelectedMadhab(
                          madhab
                        )
                      }
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                        selectedMadhab ===
                        madhab
                          ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-transparent shadow-xl"
                          : darkMode
                          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {madhab}
                        </span>

                        {selectedMadhab ===
                          madhab && (
                          <CheckCircle2
                            size={18}
                          />
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* QUICK INSIGHTS */}

            <div
              className={`rounded-[32px] border p-6 ${
                darkMode
                  ? "border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"
                  : "border-slate-200 bg-white"
              } backdrop-blur-2xl shadow-2xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs uppercase tracking-[0.2em] font-black ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    Financial Health
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    98.4%
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="text-emerald-400" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    label:
                      "Audit Compliance",
                    value: "Verified",
                  },
                  {
                    label:
                      "AI Monitoring",
                    value: "Active",
                  },
                  {
                    label:
                      "Automation",
                    value: "Enabled",
                  },
                ].map((item) => (
                  <Fragment
                    key={
                      item.label
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          item.label
                        }
                      </span>

                      <span className="font-bold">
                        {
                          item.value
                        }
                      </span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MODAL
        ===================================================== */}

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`relative w-full max-w-2xl overflow-hidden rounded-[36px] border ${
                darkMode
                  ? "border-white/10 bg-[#07111d]"
                  : "border-slate-200 bg-white"
              } shadow-[0_40px_120px_rgba(0,0,0,0.4)]`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_35%)]" />

              <div className="relative p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <FileText className="text-white" />
                    </div>

                    <div>
                      <h2 className="text-3xl font-black">
                        New Zakat
                        Calculation
                      </h2>

                      <p
                        className={`mt-1 text-sm ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Create enterprise
                        zakat record
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      darkMode
                        ? "bg-white/[0.05] hover:bg-white/[0.08]"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5">
                  <InputField
                    darkMode={
                      darkMode
                    }
                    label="Account Name"
                    placeholder="Enter account name"
                    value={
                      formData.name
                    }
                    onChange={(
                      value
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          name: value,
                        }
                      )
                    }
                  />

                  <InputField
                    darkMode={
                      darkMode
                    }
                    type="number"
                    label="Assets"
                    placeholder="Enter total assets"
                    value={
                      formData.assets
                    }
                    onChange={(
                      value
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          assets:
                            value,
                        }
                      )
                    }
                  />

                  <InputField
                    darkMode={
                      darkMode
                    }
                    type="number"
                    label="Liabilities"
                    placeholder="Enter liabilities"
                    value={
                      formData.liabilities
                    }
                    onChange={(
                      value
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          liabilities:
                            value,
                        }
                      )
                    }
                  />
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                    className={`px-5 py-4 rounded-2xl font-semibold transition-all ${
                      darkMode
                        ? "bg-white/[0.05] hover:bg-white/[0.08]"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={
                      handleCreateRecord
                    }
                    disabled={
                      submitting
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-4 font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-70"
                  >
                    {submitting && (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    )}

                    Save Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

type StatCardProps = {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
  gradient: string;
  darkMode: boolean;
};

function StatCard({
  title,
  value,
  growth,
  icon,
  gradient,
  darkMode,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 ${
        darkMode
          ? "border-white/10 bg-white/[0.04]"
          : "border-slate-200 bg-white"
      } shadow-2xl backdrop-blur-2xl`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-semibold ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h3 className="mt-4 text-3xl font-black tracking-tight">
            {value}
          </h3>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <TrendingUp
              size={14}
            />
            {growth}
          </div>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            darkMode
              ? "bg-white/[0.06]"
              : "bg-slate-100"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

type InsightItemProps = {
  label: string;
  value: string;
  darkMode: boolean;
};

function InsightItem({
  label,
  value,
  darkMode,
}: InsightItemProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
        darkMode
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`text-sm ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <span className="font-bold">
        {value}
      </span>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  darkMode: boolean;
};

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  darkMode,
}: InputFieldProps) {
  return (
    <div>
      <label
        className={`block mb-2 text-sm font-semibold ${
          darkMode
            ? "text-slate-300"
            : "text-slate-700"
        }`}
      >
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={`w-full rounded-2xl border px-5 py-4 outline-none transition-all ${
          darkMode
            ? "border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-emerald-500"
            : "border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:border-emerald-500"
        }`}
      />
    </div>
  );
}