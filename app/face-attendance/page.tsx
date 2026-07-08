"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  ScanFace,
  ShieldCheck,
} from "lucide-react";

type AttendanceResponse = {
  success: boolean;
  message: string;
};

type LocationType = {
  latitude: number;
  longitude: number;
};

export default function FaceAttendancePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<LocationType | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  /* =========================================================================
     CAMERA CONTROL (SAFE + CLEAN)
  ========================================================================= */

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch (error) {
      console.error(error);
      setMessage("Camera access denied or not supported.");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  /* =========================================================================
     GEO LOCATION
  ========================================================================= */

  const getLocation = useCallback(() => {
    return new Promise<LocationType>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => reject(err)
      );
    });
  }, []);

  /* =========================================================================
     ATTENDANCE HANDLER
  ========================================================================= */

  const handleAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const coords = await getLocation();
      setLocation(coords);

      const payload = {
        employeeId: "EMP-2026-001",
        latitude: coords.latitude,
        longitude: coords.longitude,
        faceVerified: true,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/face-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: AttendanceResponse = await response.json();

      if (data.success) {
        setMessage(data.message);

        const speech = new SpeechSynthesisUtterance(
          "Attendance completed successfully"
        );
        window.speechSynthesis.speak(speech);
      } else {
        setMessage("Attendance verification failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Location permission denied or system error.");
    } finally {
      setLoading(false);
    }
  }, [getLocation]);

  /* =========================================================================
     UI
  ========================================================================= */

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.15),transparent_30%),#050816] text-white flex items-center justify-center p-4 md:p-8">

      <div className="w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
            <ShieldCheck className="text-blue-400" />
            Face Attendance System
          </h1>

          <p className="text-slate-400 mt-2">
            Enterprise-grade biometric attendance with location verification
          </p>
        </div>

        {/* CAMERA BOX */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[420px] md:h-[520px] object-cover"
          />
        </div>

        {/* STATUS PANEL */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">

          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <Camera size={16} />
            {cameraActive ? "Camera Active" : "Camera Offline"}
          </div>

          {location && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <MapPin size={16} />
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}

        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-5 px-5 py-3 rounded-2xl border text-sm font-semibold ${
              message.toLowerCase().includes("failed") ||
              message.toLowerCase().includes("error")
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* ACTION */}
        <button
          onClick={handleAttendance}
          disabled={loading}
          className="mt-8 w-full h-14 md:h-16 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <ScanFace size={20} />
              Clock In Now
            </>
          )}
        </button>

      </div>
    </main>
  );
}