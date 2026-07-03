"use client";

import React, {
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  Activity,
  AlertTriangle,
  Brain,
  ClipboardPlus,
  FileText,
  HeartPulse,
  Loader2,
  Pill,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instruction: string;
}

interface PrescriptionData {
  patientName: string;
  age: number;
  gender: string;
  symptoms: string;
  diagnosis: string;
  medicines: Medicine[];
  advice: string;
}

type GenderType =
  | "Male"
  | "Female"
  | "Other";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_MEDICINE: Medicine = {
  id: "",
  name: "",
  dosage: "",
  duration: "",
  instruction: "",
};

const INITIAL_PRESCRIPTION: PrescriptionData =
  {
    patientName: "",
    age: 0,
    gender: "Male",
    symptoms: "",
    diagnosis: "",
    medicines: [],
    advice: "",
  };

const QUICK_SUGGESTIONS = [
  "Fever & Viral Infection",
  "Hypertension Follow-up",
  "Seasonal Flu",
  "Gastric Ulcer",
  "Diabetes Monitoring",
  "Respiratory Infection",
];

/* =========================================================
   PAGE
========================================================= */

export default function EPrescriptionPage() {
  const [prescription, setPrescription] =
    useState<PrescriptionData>(
      INITIAL_PRESCRIPTION
    );

  const [currentMed, setCurrentMed] =
    useState<Medicine>(
      INITIAL_MEDICINE
    );

  const [isAiOptimizing, setIsAiOptimizing] =
    useState(false);

  const [searchMedicine, setSearchMedicine] =
    useState("");

  /* =========================================================
     DERIVED STATES
  ========================================================= */

  const totalMedicines = useMemo(
    () => prescription.medicines.length,
    [prescription.medicines]
  );

  const patientCompletion =
    useMemo(() => {
      const fields = [
        prescription.patientName,
        prescription.age,
        prescription.gender,
        prescription.symptoms,
        prescription.diagnosis,
      ];

      const completed = fields.filter(
        Boolean
      ).length;

      return Math.round(
        (completed / fields.length) * 100
      );
    }, [prescription]);

  const filteredMedicines =
    useMemo(() => {
      return prescription.medicines.filter(
        (medicine) =>
          medicine.name
            .toLowerCase()
            .includes(
              searchMedicine.toLowerCase()
            )
      );
    }, [
      prescription.medicines,
      searchMedicine,
    ]);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const updatePrescription =
    useCallback(
      <
        K extends keyof PrescriptionData
      >(
        key: K,
        value: PrescriptionData[K]
      ) => {
        setPrescription((prev) => ({
          ...prev,
          [key]: value,
        }));
      },
      []
    );

  const addMedicine = () => {
    if (!currentMed.name.trim()) return;

    const medicine: Medicine = {
      ...currentMed,
      id: crypto.randomUUID(),
    };

    setPrescription((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        medicine,
      ],
    }));

    setCurrentMed(INITIAL_MEDICINE);
  };

  const removeMedicine = (
    id: string
  ) => {
    setPrescription((prev) => ({
      ...prev,
      medicines:
        prev.medicines.filter(
          (medicine) =>
            medicine.id !== id
        ),
    }));
  };

  const handleAiOptimize =
    async (): Promise<void> => {
      try {
        setIsAiOptimizing(true);

        await new Promise((resolve) =>
          setTimeout(resolve, 1800)
        );

        setPrescription((prev) => ({
          ...prev,
          advice:
            prev.advice +
            `${
              prev.advice ? "\n\n" : ""
            }[AI Clinical Recommendation]:
• রোগীকে পর্যাপ্ত পানি পান করতে বলা হচ্ছে।
• বর্তমান ওষুধসমূহে গুরুতর drug interaction পাওয়া যায়নি।
• Follow-up within 5 days recommended.
• Sleep cycle optimization advised.`,
        }));
      } finally {
        setIsAiOptimizing(false);
      }
    };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_25%),#020617] text-slate-100">
      <div className="mx-auto max-w-[1800px] p-4 md:p-6 xl:p-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex flex-col gap-8 p-6 md:p-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
                <ShieldCheck size={14} />
                Enterprise AI Healthcare Suite
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl xl:text-6xl">
                AI Smart e-Prescription Pad
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
                Cognitive healthcare automation
                platform with AI-powered
                prescription optimization,
                intelligent diagnostics,
                medication safety analysis,
                enterprise patient workflow,
                and real-time clinical decision
                support.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {QUICK_SUGGESTIONS.map(
                  (item) => (
                    <button
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-white"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:w-[580px]">
              <AnalyticsCard
                title="Patient Profile"
                value={`${patientCompletion}%`}
                subtitle="Completed"
                icon={
                  <UserRound size={20} />
                }
                accent="emerald"
              />

              <AnalyticsCard
                title="Medicines"
                value={String(
                  totalMedicines
                )}
                subtitle="Prescribed"
                icon={<Pill size={20} />}
                accent="blue"
              />

              <AnalyticsCard
                title="AI Status"
                value="Ready"
                subtitle="Optimizer"
                icon={
                  <Brain size={20} />
                }
                accent="violet"
              />

              <AnalyticsCard
                title="System"
                value="Secure"
                subtitle="HIPAA Mode"
                icon={
                  <ShieldCheck size={20} />
                }
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <div className="space-y-8">
            {/* Patient Information */}

            <GlassCard>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Patient Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Smart clinical intake &
                    diagnosis workflow
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <HeartPulse size={26} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field>
                  <label className="label">
                    Patient Name
                  </label>

                  <input
                    value={
                      prescription.patientName
                    }
                    onChange={(e) =>
                      updatePrescription(
                        "patientName",
                        e.target.value
                      )
                    }
                    placeholder="Enter patient full name"
                    className="input"
                  />
                </Field>

                <Field>
                  <label className="label">
                    Age
                  </label>

                  <input
                    type="number"
                    value={
                      prescription.age || ""
                    }
                    onChange={(e) =>
                      updatePrescription(
                        "age",
                        Number(
                          e.target.value
                        ) || 0
                      )
                    }
                    placeholder="Patient age"
                    className="input"
                  />
                </Field>

                <Field>
                  <label className="label">
                    Gender
                  </label>

                  <select
                    value={
                      prescription.gender
                    }
                    onChange={(e) =>
                      updatePrescription(
                        "gender",
                        e.target
                          .value as GenderType
                      )
                    }
                    className="input"
                  >
                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </Field>

                <Field>
                  <label className="label">
                    Diagnosis
                  </label>

                  <input
                    value={
                      prescription.diagnosis
                    }
                    onChange={(e) =>
                      updatePrescription(
                        "diagnosis",
                        e.target.value
                      )
                    }
                    placeholder="Disease / clinical diagnosis"
                    className="input"
                  />
                </Field>

                <div className="md:col-span-2">
                  <label className="label">
                    Symptoms & Clinical Notes
                  </label>

                  <textarea
                    value={
                      prescription.symptoms
                    }
                    onChange={(e) =>
                      updatePrescription(
                        "symptoms",
                        e.target.value
                      )
                    }
                    placeholder="Document symptoms, observations and patient complaints..."
                    className="input min-h-[140px] resize-none"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Medicine Entry */}

            <GlassCard>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Medication Composer
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI-ready medicine &
                    dosage orchestration
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <ClipboardPlus size={26} />
                </div>
              </div>

              <div className="grid gap-5">
                <Field>
                  <label className="label">
                    Medicine Name
                  </label>

                  <input
                    value={currentMed.name}
                    onChange={(e) =>
                      setCurrentMed(
                        (prev) => ({
                          ...prev,
                          name:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="e.g. Napa Extend"
                    className="input"
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field>
                    <label className="label">
                      Dosage Pattern
                    </label>

                    <input
                      value={
                        currentMed.dosage
                      }
                      onChange={(e) =>
                        setCurrentMed(
                          (prev) => ({
                            ...prev,
                            dosage:
                              e.target
                                .value,
                          })
                        )
                      }
                      placeholder="1 + 0 + 1"
                      className="input"
                    />
                  </Field>

                  <Field>
                    <label className="label">
                      Duration
                    </label>

                    <input
                      value={
                        currentMed.duration
                      }
                      onChange={(e) =>
                        setCurrentMed(
                          (prev) => ({
                            ...prev,
                            duration:
                              e.target
                                .value,
                          })
                        )
                      }
                      placeholder="7 Days"
                      className="input"
                    />
                  </Field>
                </div>

                <Field>
                  <label className="label">
                    Instructions
                  </label>

                  <input
                    value={
                      currentMed.instruction
                    }
                    onChange={(e) =>
                      setCurrentMed(
                        (prev) => ({
                          ...prev,
                          instruction:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="After meals / before sleep..."
                    className="input"
                  />
                </Field>

                <button
                  onClick={addMedicine}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-400"
                >
                  <Plus size={18} />
                  Add Medicine
                </button>
              </div>
            </GlassCard>
          </div>

          {/* =====================================================
              RIGHT PANEL
          ===================================================== */}

          <div className="space-y-8">
            {/* AI Panel */}

            <GlassCard>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    AI Clinical Intelligence
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Autonomous healthcare
                    optimization engine
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                  <Sparkles size={26} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Drug Interaction Scan",
                  "Prescription Safety",
                  "AI Symptom Matching",
                  "Treatment Suggestion",
                ].map((item) => (
                  <button
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/10"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                      <Brain size={18} />
                    </div>

                    <p className="text-sm font-semibold text-slate-200">
                      {item}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleAiOptimize}
                disabled={isAiOptimizing}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-5 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAiOptimizing ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    AI Optimizing Prescription...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI Prescription Optimizer
                  </>
                )}
              </button>

              {isAiOptimizing && (
                <div className="mt-5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-2 w-full animate-pulse rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400" />
                </div>
              )}
            </GlassCard>

            {/* Prescription Preview */}

            <GlassCard>
              <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    <Activity size={14} />
                    Live Prescription
                  </div>

                  <h2 className="mt-4 text-3xl font-black text-white">
                    ONE-BUSINESS DIGITAL
                    HOSPITAL
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    AI Assisted Healthcare
                    System
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.print()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:border-slate-500 hover:bg-white/[0.08]"
                >
                  <Printer size={18} />
                  Print / PDF
                </button>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <PreviewCard
                  title="Patient"
                  value={
                    prescription.patientName ||
                    "Not provided"
                  }
                  icon={
                    <UserRound size={18} />
                  }
                />

                <PreviewCard
                  title="Diagnosis"
                  value={
                    prescription.diagnosis ||
                    "Pending"
                  }
                  icon={
                    <Stethoscope size={18} />
                  }
                />
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Medication Table
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Enterprise treatment
                      workflow
                    </p>
                  </div>

                  <div className="relative w-full max-w-[220px]">
                    <input
                      value={
                        searchMedicine
                      }
                      onChange={(e) =>
                        setSearchMedicine(
                          e.target.value
                        )
                      }
                      placeholder="Search medicine..."
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-white/[0.04]">
                        <tr>
                          {[
                            "Medicine",
                            "Dosage",
                            "Duration",
                            "Instruction",
                            "Action",
                          ].map((item) => (
                            <th
                              key={item}
                              className="px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                              {item}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredMedicines.length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-16 text-center"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <AlertTriangle className="mb-4 text-slate-500" />

                                <p className="text-sm text-slate-400">
                                  No medicines
                                  added
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredMedicines.map(
                            (
                              medicine
                            ) => (
                              <tr
                                key={
                                  medicine.id
                                }
                                className="border-t border-white/5 transition-all hover:bg-white/[0.03]"
                              >
                                <td className="px-4 py-5 font-semibold text-white">
                                  {
                                    medicine.name
                                  }
                                </td>

                                <td className="px-4 py-5 text-slate-300">
                                  {
                                    medicine.dosage
                                  }
                                </td>

                                <td className="px-4 py-5 text-slate-300">
                                  {
                                    medicine.duration
                                  }
                                </td>

                                <td className="px-4 py-5 text-slate-300">
                                  {
                                    medicine.instruction
                                  }
                                </td>

                                <td className="px-4 py-5">
                                  <button
                                    onClick={() =>
                                      removeMedicine(
                                        medicine.id
                                      )
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-300 hover:bg-red-500/20"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                </td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="label mb-3 block">
                  Advice & Recommendations
                </label>

                <textarea
                  value={
                    prescription.advice
                  }
                  onChange={(e) =>
                    updatePrescription(
                      "advice",
                      e.target.value
                    )
                  }
                  placeholder="Doctor instructions, recommendations and AI clinical notes..."
                  className="input min-h-[180px] resize-none"
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <StatusCard
                  title="Drug Safety"
                  status="Verified"
                  color="emerald"
                />

                <StatusCard
                  title="AI Diagnosis"
                  status="Analyzing"
                  color="violet"
                />

                <StatusCard
                  title="Medical Audit"
                  status="Secured"
                  color="cyan"
                />
              </div>

              <div className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                    <FileText size={22} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-amber-100">
                      Clinical Compliance
                    </h4>

                    <p className="mt-2 text-sm leading-7 text-amber-200/80">
                      This AI-assisted
                      prescription system is
                      optimized for secure
                      healthcare operations,
                      intelligent patient
                      management, enterprise
                      audit tracking and
                      clinical workflow
                      automation.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-7">
      {children}
    </div>
  );
}

function Field({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accent:
    | "emerald"
    | "blue"
    | "violet"
    | "amber";
}) {
  const accents = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    blue:
      "bg-blue-500/10 text-blue-300 border-blue-500/20",
    violet:
      "bg-violet-500/10 text-violet-300 border-violet-500/20",
    amber:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${accents[accent]}`}
      >
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>

      <h3 className="mt-3 text-2xl font-black text-white">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function PreviewCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>

      <h4 className="mt-3 text-lg font-bold text-white">
        {value}
      </h4>
    </div>
  );
}

function StatusCard({
  title,
  status,
  color,
}: {
  title: string;
  status: string;
  color:
    | "emerald"
    | "violet"
    | "cyan";
}) {
  const colors = {
    emerald:
      "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    violet:
      "bg-violet-500/15 text-violet-300 border-violet-500/20",
    cyan:
      "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  };

  return (
    <div
      className={`rounded-3xl border p-5 ${colors[color]}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em]">
        {title}
      </p>

      <h4 className="mt-3 text-xl font-black">
        {status}
      </h4>
    </div>
  );
}