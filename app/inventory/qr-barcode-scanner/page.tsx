"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScanLine,
  Barcode,
  QrCode,
  Camera,
  Zap,
  Search,
  CheckCircle2,
  XCircle,
  History,
  RefreshCcw,
} from "lucide-react";

type ScanType = "QR" | "BARCODE";

interface ScanLog {
  id: string;
  value: string;
  type: ScanType;
  time: string;
  status: "Valid" | "Invalid";
}

export default function BarcodeScannerPage() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [scanType, setScanType] = useState<ScanType>("QR");
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<ScanLog[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  const simulateScan = () => {
    if (!input.trim()) return;

    const isValid = Math.random() > 0.2;

    const newLog: ScanLog = {
      id: `LOG-${Date.now()}`,
      value: input,
      type: scanType,
      time: new Date().toLocaleTimeString(),
      status: isValid ? "Valid" : "Invalid",
    };

    setLogs((prev) => [newLog, ...prev]);
    setInput("");
  };

  const stats = useMemo(() => {
    return {
      total: logs.length,
      valid: logs.filter((l) => l.status === "Valid").length,
      invalid: logs.filter((l) => l.status === "Invalid").length,
    };
  }, [logs]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <ScanLine className="text-blue-400" />
          QR / Barcode Scanner
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time scanning system for inventory, warehouse & logistics tracking
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-black">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-center">
          <p className="text-xs text-emerald-300">Valid</p>
          <p className="text-xl font-black text-emerald-300">{stats.valid}</p>
        </div>

        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-center">
          <p className="text-xs text-red-300">Invalid</p>
          <p className="text-xl font-black text-red-300">{stats.invalid}</p>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex gap-2">
          <button
            onClick={() => setScanType("QR")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
              scanType === "QR"
                ? "bg-blue-600 border-blue-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            QR CODE
          </button>

          <button
            onClick={() => setScanType("BARCODE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
              scanType === "BARCODE"
                ? "bg-indigo-600 border-indigo-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            BARCODE
          </button>
        </div>

        <div className="flex flex-1 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter or simulate scan value..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none text-sm"
          />

          <button
            onClick={simulateScan}
            className="px-5 py-3 rounded-2xl bg-blue-600 font-bold text-sm"
          >
            Scan
          </button>
        </div>

      </div>

      {/* CAMERA */}
      <div className="rounded-3xl overflow-hidden border border-white/10 bg-black mb-6">

        <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Camera size={16} />
            Camera Scanner
          </div>

          {!active ? (
            <button onClick={startCamera} className="text-xs px-3 py-1 bg-green-600 rounded-lg">
              Start
            </button>
          ) : (
            <button onClick={stopCamera} className="text-xs px-3 py-1 bg-red-600 rounded-lg">
              Stop
            </button>
          )}
        </div>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-[360px] object-cover"
        />

      </div>

      {/* LOGS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <History size={16} />
          Scan History
        </div>

        <div className="divide-y divide-white/10">

          {logs.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">
              No scans yet
            </div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between">

                <div>
                  <p className="font-bold text-sm">{l.value}</p>
                  <p className="text-xs text-gray-400">{l.time} • {l.type}</p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    l.status === "Valid"
                      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
                      : "text-red-300 bg-red-500/10 border-red-500/20"
                  }`}
                >
                  {l.status}
                </span>

              </div>
            ))
          )}

        </div>

      </div>

    </main>
  );
}