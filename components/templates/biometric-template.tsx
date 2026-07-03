"use client";

import React, { useState } from "react";

export default function BiometricTemplate() {
  const [deviceStatus, setDeviceStatus] = useState("Connected");
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState([
    { id: "W101", name: "আব্দুল্লাহ আল-মামুন", time: "08:02 AM", status: "Success" },
    { id: "W102", name: "মোঃ তারেক রহমান", time: "08:14 AM", status: "Success" },
  ]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newLog = { id: "W105", name: "হাসান মাহমুদ", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Success" };
      setLogs([newLog, ...logs]);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">बायोमेट्रिक डिवाइस टेंपलेट (Biometric Center)</h2>
          <p className="text-xs text-gray-500">ডিভাইস ক্লাউড কানেক্টিভিটি এবং লাইভ পাঞ্চ-ইন ডেটা লগ</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-semibold text-gray-600">{deviceStatus === "Connected" ? "ডিভাইস অনলাইন" : "অফলাইন"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 border rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">ডিভাইস মডেল</span>
            <h3 className="text-lg font-bold text-slate-700 mt-0.5">ZKTeco iClock 9000</h3>
            <p className="text-xs text-gray-500 mt-2 font-mono">IP: 192.168.1.205 | Port: 4370</p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition disabled:bg-indigo-400 flex items-center justify-center gap-2"
          >
            {isSyncing ? "সিঙ্ক হচ্ছে..." : "ম্যানুয়ালি ডাটা সিঙ্ক করুন"}
          </button>
        </div>

        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="p-3 bg-slate-100 font-bold text-xs text-gray-700 border-b">রিসেন্ট বায়োমেট্রিক পাঞ্চ লগ</div>
          <ul className="divide-y text-xs text-gray-600 max-h-[140px] overflow-y-auto">
            {logs.map((log, i) => (
              <li key={i} className="p-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <span className="font-bold text-gray-800">{log.name}</span>
                  <span className="block text-[10px] text-gray-400 font-mono">আইডি: {log.id}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-medium block text-slate-700">{log.time}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">সাফল্য</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}