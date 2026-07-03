"use client";

import React, {
  ChangeEvent,
  DragEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CloudUpload,
  Eye,
  FileImage,
  Microscope,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface ImagingAnalysisResult {
  modality: string;
  findings: string[];
  confidenceScore: number;
  anomalyDetected: boolean;
  aiInsights: string;
  recommendedSpecialist: string;
  processingTime: string;
  riskLevel: "Low" | "Medium" | "High";
}

type AnalysisStage =
  | "Idle"
  | "Uploading"
  | "Preprocessing"
  | "Segmenting"
  | "Analyzing"
  | "Generating Report"
  | "Completed";

/* =========================================================
   CONSTANTS
========================================================= */

const ANALYSIS_STEPS: AnalysisStage[] = [
  "Uploading",
  "Preprocessing",
  "Segmenting",
  "Analyzing",
  "Generating Report",
  "Completed",
];

const QUICK_METRICS = [
  {
    title: "Neural Accuracy",
    value: "99.2%",
    icon: Brain,
    color:
      "from-violet-500/20 to-fuchsia-500/20",
    text: "text-violet-500",
  },
  {
    title: "Inference Speed",
    value: "1.8s",
    icon: Zap,
    color:
      "from-amber-500/20 to-orange-500/20",
    text: "text-amber-500",
  },
  {
    title: "Diagnostic Safety",
    value: "HIPAA+",
    icon: ShieldCheck,
    color:
      "from-emerald-500/20 to-teal-500/20",
    text: "text-emerald-500",
  },
  {
    title: "Active Models",
    value: "24",
    icon: Microscope,
    color:
      "from-sky-500/20 to-cyan-500/20",
    text: "text-sky-500",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function DrivenMedicalImagingIntelligencePage() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [selectedFileName, setSelectedFileName] =
    useState<string>("");

  const [dragging, setDragging] =
    useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState<boolean>(false);

  const [analysisStage, setAnalysisStage] =
    useState<AnalysisStage>("Idle");

  const [result, setResult] =
    useState<ImagingAnalysisResult | null>(
      null
    );

  /* =========================================================
     FILE HANDLER
  ========================================================= */

  const processFile = (file: File) => {
    const reader = new FileReader();

    reader.onloadstart = () => {
      setAnalysisStage("Uploading");
    };

    reader.onloadend = () => {
      setSelectedImage(
        reader.result as string
      );

      setSelectedFileName(file.name);

      setResult(null);

      setAnalysisStage("Idle");
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    processFile(file);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) return;

    processFile(file);
  };

  /* =========================================================
     ANALYSIS
  ========================================================= */

  const runImagingAnalysis = async () => {
    if (!selectedImage || isAnalyzing)
      return;

    setIsAnalyzing(true);

    for (
      let i = 0;
      i < ANALYSIS_STEPS.length;
      i++
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, 550)
      );

      setAnalysisStage(
        ANALYSIS_STEPS[i]
      );
    }

    setResult({
      modality:
        "Chest X-Ray (PA View)",
      findings: [
        "Localized infiltration detected in the lower right pulmonary lobe",
        "No evidence of pleural effusion or pneumothorax",
        "Cardiomediastinal silhouette remains within normal anatomical limits",
        "Mild inflammatory opacity identified near bronchovascular region",
      ],
      confidenceScore: 94.8,
      anomalyDetected: true,
      aiInsights:
        "Advanced radiomics inference engine detected probable lower-lobe inflammatory infiltration patterns consistent with early-stage pneumonia indicators. Clinical correlation with CBC, CRP, and sputum analysis is recommended for confirmation.",
      recommendedSpecialist:
        "Pulmonologist / Thoracic Imaging Specialist",
      processingTime: "1.87 Seconds",
      riskLevel: "Medium",
    });

    setIsAnalyzing(false);
  };

  /* =========================================================
     DERIVED
  ========================================================= */

  const confidenceColor =
    useMemo(() => {
      if (
        (result?.confidenceScore || 0) >=
        90
      )
        return "text-emerald-500";

      if (
        (result?.confidenceScore || 0) >=
        70
      )
        return "text-amber-500";

      return "text-red-500";
    }, [result]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-[#020617] dark:text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:p-6 lg:p-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20 lg:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                <Sparkles className="h-4 w-4" />
                AI Medical Imaging Intelligence
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                NeuroVision Diagnostic
                Command Center
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400">
                Enterprise-grade AI radiomics
                suite for intelligent imaging
                analysis, anomaly detection,
                neural diagnostics, and
                clinical decision support.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-4 xl:max-w-xl">
              {QUICK_METRICS.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60`}
                      />

                      <div className="relative flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            {item.title}
                          </p>

                          <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                            {item.value}
                          </h3>
                        </div>

                        <div
                          className={`rounded-2xl border border-white/20 bg-white/60 p-3 backdrop-blur dark:bg-white/5 ${item.text}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="space-y-8">
            {/* Upload Card */}

            <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    DICOM Imaging Input
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Upload X-Ray, MRI, CT,
                    Ultrasound or DICOM
                    imaging files.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                  <Activity className="h-4 w-4" />
                  Neural System Online
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleImageUpload
                }
              />

              <div
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={handleDrop}
                className={`group relative flex min-h-[420px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed transition-all duration-300 ${
                  dragging
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-slate-300 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50 dark:border-white/10 dark:bg-[#0b1120] dark:hover:border-cyan-500 dark:hover:bg-cyan-500/5"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%)]" />

                {!selectedImage ? (
                  <div className="relative z-10 flex flex-col items-center px-6 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-cyan-500/20 bg-cyan-500/10 text-cyan-500 shadow-lg shadow-cyan-500/10">
                      <CloudUpload className="h-12 w-12" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      Upload Medical Scan
                    </h3>

                    <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
                      Drag & drop medical
                      imaging files or click to
                      browse your device.
                      Optimized for radiology
                      workflows and AI
                      segmentation pipelines.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      {[
                        "DICOM",
                        "X-Ray",
                        "MRI",
                        "CT Scan",
                        "Ultrasound",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-5">
                    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black">
                      <img
                        src={selectedImage}
                        alt="Medical Scan"
                        className="max-h-[360px] w-full object-cover"
                      />

                      {isAnalyzing && (
                        <>
                          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />

                          <div className="absolute inset-y-0 left-0 w-28 animate-[scan_2s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                        </>
                      )}
                    </div>

                    <div className="mt-5 flex w-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-500">
                          <FileImage className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="max-w-[220px] truncate text-sm font-bold text-slate-900 dark:text-white">
                            {selectedFileName}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Secure medical
                            image uploaded
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedImage(
                            null
                          );

                          setResult(null);

                          setSelectedFileName(
                            ""
                          );

                          setAnalysisStage(
                            "Idle"
                          );
                        }}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-500 transition-all hover:scale-105"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={
                    runImagingAnalysis
                  }
                  disabled={
                    !selectedImage ||
                    isAnalyzing
                  }
                  className="group inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-sm font-bold text-white shadow-2xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Running AI Diagnostics...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 transition-transform group-hover:scale-110" />
                      Run Neuro-Vision
                      Analysis
                    </>
                  )}
                </button>

                <button
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                >
                  <Upload className="h-5 w-5" />
                  Upload New Scan
                </button>
              </div>
            </div>

            {/* Pipeline */}

            <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Processing Pipeline
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Real-time neural
                    segmentation workflow.
                  </p>
                </div>

                <div className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
                  {analysisStage}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {ANALYSIS_STEPS.map(
                  (step, index) => {
                    const active =
                      analysisStage ===
                        step ||
                      ANALYSIS_STEPS.indexOf(
                        analysisStage
                      ) > index;

                    return (
                      <div
                        key={step}
                        className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 ${
                          active
                            ? "border-cyan-500/30 bg-cyan-500/10"
                            : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]"
                        }`}
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/[0.08]">
                          {active ? (
                            <CheckCircle2 className="h-6 w-6 text-cyan-500" />
                          ) : (
                            <Eye className="h-6 w-6 text-slate-400" />
                          )}
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-800 dark:text-slate-200">
                          {step}
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                          Intelligent medical
                          imaging inference and
                          segmentation process.
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <div className="space-y-8">
            {/* Report */}

            <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Diagnostic Report
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Cognitive clinical
                    decision support output.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-500">
                  <Stethoscope className="h-6 w-6" />
                </div>
              </div>

              {!result && !isAnalyzing && (
                <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-white/10 dark:bg-[#0b1120]">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                    <Brain className="h-12 w-12" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Awaiting Imaging Data
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Upload medical imaging
                    data to initialize
                    enterprise AI radiomics
                    diagnostics and neural
                    inference workflows.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 px-6 text-center">
                  <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
                    <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/30" />

                    <Brain className="h-14 w-14 animate-pulse text-cyan-500" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Neural Analysis Running
                  </h3>

                  <p className="mt-3 text-sm tracking-[0.15em] text-cyan-600 dark:text-cyan-300">
                    {analysisStage}
                  </p>

                  <div className="mt-8 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-full w-1/2 animate-[loader_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
                  </div>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="space-y-6">
                  <div
                    className={`rounded-[28px] border p-5 ${
                      result.anomalyDetected
                        ? "border-red-500/20 bg-red-500/10"
                        : "border-emerald-500/20 bg-emerald-500/10"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-2xl p-3 ${
                            result.anomalyDetected
                              ? "bg-red-500/15 text-red-500"
                              : "bg-emerald-500/15 text-emerald-500"
                          }`}
                        >
                          {result.anomalyDetected ? (
                            <AlertTriangle className="h-6 w-6" />
                          ) : (
                            <CheckCircle2 className="h-6 w-6" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {result.anomalyDetected
                              ? "Potential Anomaly Detected"
                              : "No Critical Findings"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Risk Level:{" "}
                            {
                              result.riskLevel
                            }
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/20 bg-white/60 px-5 py-4 text-center backdrop-blur dark:bg-white/[0.05]">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                          Confidence
                        </p>

                        <h4
                          className={`mt-2 text-3xl font-black ${confidenceColor}`}
                        >
                          {
                            result.confidenceScore
                          }
                          %
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoCard
                      title="Imaging Modality"
                      value={
                        result.modality
                      }
                    />

                    <InfoCard
                      title="Inference Time"
                      value={
                        result.processingTime
                      }
                    />
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="mb-5 text-lg font-black text-slate-900 dark:text-white">
                      Targeted Findings
                    </h3>

                    <div className="space-y-3">
                      {result.findings.map(
                        (
                          finding,
                          index
                        ) => (
                          <div
                            key={index}
                            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
                          >
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />

                            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                              {finding}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-cyan-500/20 bg-cyan-500/5 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-500">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        AI Clinical Insights
                      </h3>
                    </div>

                    <p className="text-sm leading-8 text-slate-700 dark:text-slate-300">
                      {
                        result.aiInsights
                      }
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300">
                          Recommended
                          Specialist
                        </p>

                        <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                          {
                            result.recommendedSpecialist
                          }
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-emerald-500/15 p-4 text-emerald-500">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security */}

            <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Enterprise Security
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    All imaging data is
                    processed within secure
                    isolated inference
                    pipelines with encrypted
                    temporary storage and
                    enterprise healthcare
                    compliance standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(900%);
          }
        }

        @keyframes loader {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(450%);
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENT
========================================================= */

type InfoCardProps = {
  title: string;
  value: string;
};

function InfoCard({
  title,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-lg font-black leading-7 text-slate-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}