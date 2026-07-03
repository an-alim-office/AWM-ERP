"use client";

import React, { useState } from "react";

export default function PdfExportReportPage() {
  const [reportDoc, setReportDoc] = useState("payslip");
  const [workerId, setWorkerId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<any | null>(null);

  const handlePdfGeneration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPdf(null);

    // পিডিএফ জেনারেশন সিমুলেশন
    setTimeout(() => {
      setGeneratedPdf({
        title: reportDoc === "payslip" ? "Official Pay Slip" : "Workforce Statement",
        fileName: `${reportDoc}_report_${workerId || "all"}.pdf`,
        generatedAt: "2026-05-29 19:27",
        size: "245 KB",
        serialNo: "AWM-PDF-2026-0943"
      });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-6">
      {/* হেডার সেকশন */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">পিডিএফ রিপোর্ট পোর্টাল (PDF Reports)</h1>
        <p className="text-sm text-gray-500">অফিসিয়াল ডকুমেন্ট, স্যালারি স্লিপ এবং কর্মী স্টেটমেন্ট প্রফেশনাল পিডিএফ ফরম্যাটে প্রিন্ট বা ডাউনলোড করুন</p>
      </div>

      {/* কনফিগারেশন ফর্ম */}
      <form onSubmit={handlePdfGeneration} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-gray-50 p-4 rounded-lg border">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ডকুমেন্টের ধরণ (Document Type)</label>
          <select
            value={reportDoc}
            onChange={(e) => setReportDoc(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
          >
            <option value="payslip">ব্যক্তিগত পে-স্লিপ (Pay Slip)</option>
            <option value="attendance_summary">মাসিক হাজিরা সামারি (Attendance Summary)</option>
            <option value="clearance">চাকরি সমাপ্তি ও ক্লিয়ারেন্স (Clearance)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">কর্মী আইডি (Worker ID) *ঐচ্ছিক*</label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            placeholder="উদা: W102 (ফাঁকা রাখলে সবার হবে)"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow transition disabled:bg-rose-400 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>পিডিএফ তৈরি হচ্ছে...</span>
              </>
            ) : (
              <span>PDF জেনারেট করুন</span>
            )}
          </button>
        </div>
      </form>

      {/* লোডিং ও রেজাল্ট ডিসপ্লে */}
      {generatedPdf && (
        <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/20 shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-dashed">
          {/* লাইভ ডামি প্রিভিউ প্যানেল */}
          <div className="p-6 md:col-span-2 bg-slate-100 flex flex-col justify-between min-h-[200px]">
            <div className="border bg-white p-4 shadow-sm rounded space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-xs text-gray-400 tracking-wider">AYMAN WORKFORCE ERP</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-gray-600 font-mono">{generatedPdf.serialNo}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-800">{generatedPdf.title}</h3>
                <p className="text-xs text-gray-500">Generated for System Validation. Status: Approved.</p>
              </div>
              <div className="h-12 bg-slate-50 border border-dashed rounded flex items-center justify-center text-[11px] text-gray-400">
                [ কোম্পানির ডিজিটাল সিকিউরিটি সিল এবং বারকোড ]
              </div>
            </div>
            <span className="text-[11px] text-gray-400 mt-2 font-mono">তৈরির সময়: {generatedPdf.generatedAt}</span>
          </div>

          {/* অ্যাকশন প্যানেল */}
          <div className="p-6 flex flex-col justify-center items-center space-y-4 bg-white">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase">ফাইল সাইজ</p>
              <p className="text-xl font-black text-gray-700 font-mono mt-0.5">{generatedPdf.size}</p>
            </div>
            <div className="w-full space-y-2">
              <button className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded shadow transition">
                সরাসরি প্রিন্ট করুন
              </button>
              <button className="w-full py-2 bg-gray-800 hover:bg-gray-950 text-white font-medium text-sm rounded shadow transition font-mono text-xs">
                {generatedPdf.fileName} ডাউনলোড
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}