"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  Camera,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function FingerprintPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);

  /* =====================================================
     LOAD FACE MODEL
  ===================================================== */
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("loading");

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    loadModels();
  }, []);

  /* =====================================================
     CAMERA START
  ===================================================== */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setMessage("Camera Active");
    } catch {
      setCameraOn(false);
      setMessage("Camera access denied");
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  /* =====================================================
     SAVE ATTENDANCE
  ===================================================== */
  const saveAttendance = useCallback(async () => {
    const response = await fetch("/api/face-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-001",
        latitude: 23.8103,
        longitude: 90.4125,
        faceVerified: true,
        timestamp: new Date(),
      }),
    });

    const data = await response.json();

    if (data.success) {
      setMessage("Attendance Saved Successfully");

      const speech = new SpeechSynthesisUtterance(
        "Attendance completed successfully"
      );
      window.speechSynthesis.speak(speech);
    } else {
      setMessage("Attendance Failed");
    }
  }, []);

  /* =====================================================
     FINGERPRINT VERIFY (WebAuthn)
  ===================================================== */
  const verifyFingerprint = useCallback(async () => {
    try {
      setLoading(true);

      if (!window.PublicKeyCredential) {
        setMessage("Fingerprint not supported");
        return;
      }

      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array([1, 2, 3, 4]),
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [],
      };

      const credential = await navigator.credentials.get({
        publicKey,
      } as any);

      if (credential) {
        await saveAttendance();
        setMessage("Fingerprint Verified Successfully");
      } else {
        setMessage("Fingerprint Verification Failed");
      }
    } catch {
      setMessage("Fingerprint Verification Failed");
    } finally {
      setLoading(false);
    }
  }, [saveAttendance]);

  /* =====================================================
     FACE VERIFY (SIMULATION / HOOK READY)
  ===================================================== */
  const verifyFace = useCallback(async () => {
    setLoading(true);

    try {
      // placeholder for real face match logic
      await new Promise((r) => setTimeout(r, 900));

      await saveAttendance();
      setMessage("Face Verified Successfully");
    } catch {
      setMessage("Face Verification Failed");
    } finally {
      setLoading(false);
    }
  }, [saveAttendance]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_25%),#0B1120] text-white p-6 md:p-10">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
            <ShieldCheck className="text-cyan-400" />
            Biometric Verification System
          </h1>
          <p className="text-gray-400 mt-2">
            Face + Fingerprint secure attendance module
          </p>
        </div>

        {/* CAMERA */}
        <div className="rounded-3xl overflow-hidden border border-cyan-500/30 bg-black shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[420px] md:h-[520px] object-cover"
          />
        </div>

        {/* STATUS */}
        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <Camera size={16} />
            {cameraOn ? "Camera Active" : "Camera Offline"}
          </div>

          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <Zap size={16} />
            Model: {status}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-4">

          <button
            onClick={verifyFingerprint}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-6 py-3 rounded-2xl font-bold transition"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Fingerprint size={18} />
            )}
            Verify Fingerprint
          </button>

          <button
            onClick={verifyFace}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-3 rounded-2xl font-bold transition"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ScanFace size={18} />
            )}
            Verify Face
          </button>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-lg">
            {message.includes("Failed") ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {message}
          </div>
        )}

      </div>
    </main>
  );
}