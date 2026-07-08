"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Activity,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock3,
  Cpu,
  Eye,
  Fingerprint,
  Loader2,
  LockKeyhole,
  Radar,
  RefreshCcw,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Video,
  Wifi,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type VerificationState =
  | "idle"
  | "initializing"
  | "ready"
  | "processing"
  | "success"
  | "error";

interface AttendanceMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface ActivityLog {
  id: string;
  title: string;
  time: string;
  status:
    | "Success"
    | "Secure"
    | "Realtime";
}

/* =========================================================
   MOCKS
========================================================= */

const SECURITY_LOGS: ActivityLog[] =
  [
    {
      id: "ACT-1001",
      title:
        "AI Face Scan Initialized",
      time: "1 sec ago",
      status: "Realtime",
    },
    {
      id: "ACT-1002",
      title:
        "Biometric Validation Ready",
      time: "5 sec ago",
      status: "Secure",
    },
    {
      id: "ACT-1003",
      title:
        "Attendance Engine Active",
      time: "12 sec ago",
      status: "Success",
    },
  ];

/* =========================================================
   PAGE
========================================================= */

export default function FaceAttendancePage() {
  const router = useRouter();

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(null);

  const animationRef =
    useRef<number | null>(null);

  const [stream, setStream] =
    useState<MediaStream | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [pulse, setPulse] =
    useState(false);

  const [verificationState, setVerificationState] =
    useState<VerificationState>(
      "initializing"
    );

  const [statusMessage, setStatusMessage] =
    useState(
      "ক্যামেরা চালু হচ্ছে..."
    );

  /* =========================================================
     CAMERA INIT
  ========================================================= */

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        setVerificationState(
          "initializing"
        );

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode: "user",
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              },
              audio: false,
            }
          );

        if (!active) return;

        streamRef.current =
          mediaStream;

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject =
            mediaStream;
        }

        setVerificationState(
          "ready"
        );

        setStatusMessage(
          "আপনার মুখমণ্ডল ক্যামেরার সামনে রাখুন"
        );
      } catch (error) {
        console.error(
          "Camera Error:",
          error
        );

        setVerificationState(
          "error"
        );

        setStatusMessage(
          "ক্যামেরা পারমিশন পাওয়া যায়নি। দয়া করে পারমিশন দিন।"
        );
      }
    }

    startCamera();

    return () => {
      active = false;

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  /* =========================================================
     FACE SCAN EFFECT
  ========================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setPulse(
          (prev) => !prev
        );

        if (
          verificationState ===
          "ready"
        ) {
          setFaceDetected(
            (prev) => !prev
          );
        }
      }, 1400);

    return () =>
      clearInterval(interval);
  }, [verificationState]);

  /* =========================================================
     METRICS
  ========================================================= */

  const metrics: AttendanceMetric[] =
    useMemo(
      () => [
        {
          label:
            "AI Accuracy",
          value: "99.2%",
          icon: (
            <Cpu size={18} />
          ),
        },
        {
          label:
            "Recognition",
          value: "0.4s",
          icon: (
            <Zap size={18} />
          ),
        },
        {
          label:
            "Security",
          value: "AES-256",
          icon: (
            <LockKeyhole
              size={18}
            />
          ),
        },
        {
          label:
            "Live Camera",
          value: "Active",
          icon: (
            <Video size={18} />
          ),
        },
      ],
      []
    );

  /* =========================================================
     VERIFY
  ========================================================= */

  const captureAndVerify =
    useCallback(async () => {
      if (
        !videoRef.current ||
        !canvasRef.current
      )
        return;

      setLoading(true);

      setVerificationState(
        "processing"
      );

      setStatusMessage(
        "মুখমণ্ডল যাচাই করা হচ্ছে..."
      );

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      const context =
        canvas.getContext("2d");

      if (!context) {
        setLoading(false);
        return;
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.92
        );

      try {
        const response =
          await fetch(
            "/api/attendance-service/verify-face",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                {
                  image:
                    imageData,
                }
              ),
            }
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success
        ) {
          setVerificationState(
            "success"
          );

          setStatusMessage(
            "হাজিরা সফলভাবে গৃহীত হয়েছে!"
          );

          setTimeout(() => {
            router.push(
              "/attendance"
            );
          }, 1800);
        } else {
          setVerificationState(
            "error"
          );

          setStatusMessage(
            result.message ||
              "মুখমণ্ডল মিলল না! আবার চেষ্টা করুন।"
          );
        }
      } catch (error) {
        console.error(
          "Verification Error:",
          error
        );

        setVerificationState(
          "error"
        );

        setStatusMessage(
          "সার্ভারে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।"
        );
      } finally {
        setLoading(false);
      }
    }, [router]);

  /* =========================================================
     RESTART CAMERA
  ========================================================= */

  const restartCamera =
    useCallback(async () => {
      try {
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) =>
              track.stop()
            );
        }

        setVerificationState(
          "initializing"
        );

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode:
                  "user",
              },
              audio: false,
            }
          );

        streamRef.current =
          mediaStream;

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject =
            mediaStream;
        }

        setVerificationState(
          "ready"
        );

        setStatusMessage(
          "ক্যামেরা পুনরায় চালু হয়েছে"
        );
      } catch (error) {
        console.error(error);

        setVerificationState(
          "error"
        );

        setStatusMessage(
          "ক্যামেরা পুনরায় চালু করা যায়নি"
        );
      }
    }, []);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_20%),#f8fafc] text-slate-900 dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.18),transparent_20%),#020617] dark:text-white">

      {/* GRID */}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col justify-center p-4 md:p-6 xl:p-8">

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <section className="overflow-hidden rounded-[40px] border border-white/20 bg-white/70 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04]">

            <div className="relative p-5 md:p-7 xl:p-8">

              {/* HERO */}

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-300">
                    <Sparkles size={14} />
                    AI Face Attendance
                  </div>

                  <h1 className="mt-5 bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-violet-300 md:text-5xl">
                    Smart Biometric Attendance
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Enterprise-grade realtime facial recognition system with
                    AI-powered biometric verification, secure attendance tracking
                    and intelligent identity authentication engine.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {metrics.map(
                    (item) => (
                      <MetricCard
                        key={
                          item.label
                        }
                        item={item}
                      />
                    )
                  )}
                </div>
              </div>

              {/* CAMERA */}

              <div className="mt-8 overflow-hidden rounded-[34px] border border-slate-200/70 bg-slate-950 shadow-[0_25px_100px_rgba(15,23,42,0.20)] dark:border-white/10">

                <div className="relative aspect-[4/3] w-full overflow-hidden">

                  {/* VIDEO */}

                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover object-center [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)]"
                  />

                  {/* SCAN OVERLAY */}

                  <div className="pointer-events-none absolute inset-0">

                    {/* GRADIENT */}

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(2,6,23,0.45)_100%)]" />

                    {/* CORNERS */}

                    <div className="absolute left-6 top-6 h-16 w-16 rounded-tl-3xl border-l-4 border-t-4 border-cyan-400" />

                    <div className="absolute right-6 top-6 h-16 w-16 rounded-tr-3xl border-r-4 border-t-4 border-cyan-400" />

                    <div className="absolute bottom-6 left-6 h-16 w-16 rounded-bl-3xl border-b-4 border-l-4 border-cyan-400" />

                    <div className="absolute bottom-6 right-6 h-16 w-16 rounded-br-3xl border-b-4 border-r-4 border-cyan-400" />

                    {/* FACE GUIDE */}

                    <div className="absolute inset-0 flex items-center justify-center">

                      <div
                        className={`relative flex h-[280px] w-[220px] items-center justify-center rounded-[100px] border-2 transition-all duration-500 ${
                          faceDetected
                            ? "border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.35)]"
                            : "border-cyan-400/80"
                        }`}
                      >

                        <div
                          className={`absolute inset-0 rounded-[100px] transition-all duration-700 ${
                            pulse
                              ? "scale-105 border border-cyan-400/30"
                              : "scale-100"
                          }`}
                        />

                        {/* SCAN LINE */}

                        <div className="absolute inset-x-5 top-0 h-[2px] animate-[scan_3s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.9)]" />

                        {/* FACE ICON */}

                        <div className="flex flex-col items-center gap-4">

                          <div
                            className={`flex h-24 w-24 items-center justify-center rounded-full backdrop-blur-xl transition-all duration-300 ${
                              faceDetected
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/10 text-cyan-300"
                            }`}
                          >
                            <ScanFace
                              size={
                                42
                              }
                            />
                          </div>

                          <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-white">
                            {faceDetected
                              ? "Face Detected"
                              : "Scanning"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOP STATUS */}

                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">

                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          verificationState ===
                            "ready" ||
                          verificationState ===
                            "success"
                            ? "bg-emerald-400"
                            : verificationState ===
                              "processing"
                            ? "bg-amber-400 animate-pulse"
                            : verificationState ===
                              "error"
                            ? "bg-red-400"
                            : "bg-cyan-400 animate-pulse"
                        }`}
                      />

                      <span>
                        {verificationState ===
                        "processing"
                          ? "AI Verification Running"
                          : verificationState ===
                            "success"
                          ? "Attendance Confirmed"
                          : verificationState ===
                            "error"
                          ? "Verification Error"
                          : "Camera Active"}
                      </span>
                    </div>

                    {/* NETWORK */}

                    <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
                      <Wifi
                        size={14}
                      />
                      Secure Stream
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div className="mt-6 rounded-[30px] border border-slate-200/70 bg-white/70 p-5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-start gap-4">

                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        verificationState ===
                        "success"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : verificationState ===
                            "error"
                          ? "bg-red-500/10 text-red-600 dark:text-red-300"
                          : verificationState ===
                            "processing"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
                          : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
                      }`}
                    >
                      {verificationState ===
                      "success" ? (
                        <CheckCircle2
                          size={28}
                        />
                      ) : verificationState ===
                        "error" ? (
                        <AlertTriangle
                          size={28}
                        />
                      ) : verificationState ===
                        "processing" ? (
                        <Loader2
                          size={28}
                          className="animate-spin"
                        />
                      ) : (
                        <Radar
                          size={28}
                        />
                      )}
                    </div>

                    <div>

                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Smart Verification Status
                      </h3>

                      <p
                        className={`mt-2 text-sm font-semibold ${
                          loading
                            ? "animate-pulse text-cyan-600 dark:text-cyan-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {
                          statusMessage
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={
                        restartCamera
                      }
                      className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                      <RefreshCcw
                        size={16}
                      />
                      রিস্টার্ট
                    </button>

                    <button
                      type="button"
                      onClick={
                        captureAndVerify
                      }
                      disabled={
                        loading ||
                        !stream
                      }
                      className={`inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-black text-white transition-all duration-300 ${
                        loading ||
                        !stream
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 shadow-[0_20px_60px_rgba(59,130,246,0.35)] hover:-translate-y-[2px] active:scale-[0.98]"
                      }`}
                    >
                      {loading ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Fingerprint
                          size={18}
                        />
                      )}

                      {loading
                        ? "যাচাই করা হচ্ছে..."
                        : "হাজিরা দিন"}
                    </button>
                  </div>
                </div>
              </div>

              {/* HIDDEN CANVAS */}

              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>
          </section>

          {/* =====================================================
              RIGHT
          ===================================================== */}

          <section className="space-y-8">

            {/* AI STATUS */}

            <GlassCard>

              <div className="flex items-start justify-between gap-4">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck
                      size={14}
                    />
                    Enterprise Security
                  </div>

                  <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">
                    Biometric Security Layer
                  </h2>

                  <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Advanced facial recognition authentication powered by secure
                    AI identity validation and encrypted attendance orchestration.
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Eye size={30} />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <FeatureCard
                  icon={
                    <ScanFace
                      size={20}
                    />
                  }
                  title="Face Recognition"
                  value="Realtime"
                />

                <FeatureCard
                  icon={
                    <ShieldCheck
                      size={20}
                    />
                  }
                  title="Identity Security"
                  value="Protected"
                />

                <FeatureCard
                  icon={
                    <Activity
                      size={20}
                    />
                  }
                  title="AI Monitoring"
                  value="Active"
                />

                <FeatureCard
                  icon={
                    <UserCheck
                      size={20}
                    />
                  }
                  title="Attendance Sync"
                  value="Connected"
                />
              </div>
            </GlassCard>

            {/* ACTIVITY */}

            <GlassCard>

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    AI Activity Feed
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Realtime biometric processing timeline
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <Clock3
                    size={24}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {SECURITY_LOGS.map(
                  (item) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                    />
                  )
                )}
              </div>
            </GlassCard>

            {/* CAMERA STATE */}

            <GlassCard>

              <div className="flex items-start gap-4">

                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl ${
                    stream
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
                      : "bg-red-500/10 text-red-600 dark:text-red-300"
                  }`}
                >
                  {stream ? (
                    <Camera
                      size={30}
                    />
                  ) : (
                    <CameraOff
                      size={30}
                    />
                  )}
                </div>

                <div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Smart Camera Engine
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-400">
                    Optimized enterprise-grade camera streaming pipeline with
                    intelligent face detection and realtime biometric verification.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">

                    <Tag label="AI Vision" />

                    <Tag label="Realtime Scan" />

                    <Tag label="Encrypted" />

                    <Tag label="Low Latency" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>

      {/* ANIMATION */}

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 8%;
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          50% {
            opacity: 1;
          }

          100% {
            top: 92%;
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

const GlassCard = memo(
  function GlassCard({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-[34px] border border-white/20 bg-white/70 p-5 shadow-[0_20px_100px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04] md:p-7">
        {children}
      </div>
    );
  }
);

const MetricCard = memo(
  function MetricCard({
    item,
  }: {
    item: AttendanceMetric;
  }) {
    return (
      <div className="group rounded-3xl border border-slate-200/70 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          {item.icon}
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {item.label}
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
          {item.value}
        </h3>
      </div>
    );
  }
);

const FeatureCard = memo(
  function FeatureCard({
    icon,
    title,
    value,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
  }) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
          {icon}
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
          {title}
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
    );
  }
);

const ActivityCard = memo(
  function ActivityCard({
    item,
  }: {
    item: ActivityLog;
  }) {
    return (
      <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-[2px] dark:border-white/10 dark:bg-white/[0.03]">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
              <Activity size={20} />
            </div>

            <div>

              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {item.title}
              </h4>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {item.id} • {item.time}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
              item.status ===
              "Success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : item.status ===
                  "Secure"
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
                : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {item.status}
          </div>
        </div>
      </div>
    );
  }
);

const Tag = memo(
  function Tag({
    label,
  }: {
    label: string;
  }) {
    return (
      <div className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
        {label}
      </div>
    );
  }
);