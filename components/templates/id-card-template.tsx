"use client";

import React from "react";

export default function IdCardTemplate() {
  const sampleWorker = {
    name: "H.M. Alim Uddin",
    role: "Lead Software Developer",
    id: "AWM-2026-904",
    dept: "IT & Software Engineering",
    blood: "O+",
    joined: "May 2026"
  };

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">ডিজিটাল আইডি কার্ড প্রিন্ট টেমপ্লেট (ID Card UI)</h2>
        <p className="text-xs text-gray-500">কর্মচারীদের জন্য অফিসিয়াল বারকোড সহ সিকিউর আইডি কার্ড ভিউ</p>
      </div>

      {/* আইডি কার্ড প্রিভিউ ডিজাইন */}
      <div className="flex justify-center py-4 bg-slate-50 border rounded-xl">
        <div className="w-72 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center p-6 space-y-4 relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          {/* কোম্পানি হেডার */}
          <div className="text-center">
            <h4 className="text-xs font-black text-blue-700 tracking-wider">AYMAN WORKFORCE</h4>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest">Enterprise Solution</span>
          </div>

          {/* ডামি অ্যাভাটার প্লেসহোল্ডার */}
          <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-slate-50 flex items-center justify-center text-gray-300 relative overflow-hidden">
            <span className="text-3xl">👤</span>
          </div>

          {/* কর্মীর ডিটেইলস */}
          <div className="text-center space-y-0.5">
            <h3 className="text-base font-bold text-gray-800">{sampleWorker.name}</h3>
            <p className="text-xs text-indigo-600 font-semibold">{sampleWorker.role}</p>
            <p className="text-[10px] text-gray-400 font-medium">{sampleWorker.dept}</p>
          </div>

          {/* মেটা ইনফো */}
          <div className="w-full bg-slate-50 p-2.5 rounded-xl grid grid-cols-2 gap-1 text-[10px] text-gray-600 border border-dashed">
            <div><span className="text-gray-400">আইডি:</span> <strong className="font-mono">{sampleWorker.id}</strong></div>
            <div><span className="text-gray-400">রক্তের গ্রুপ:</span> <strong>{sampleWorker.blood}</strong></div>
            <div className="col-span-2 text-center border-t pt-1 mt-1 border-gray-200/60">
              <span className="text-gray-400">যোগদান:</span> <strong>{sampleWorker.joined}</strong>
            </div>
          </div>

          {/* ডামি বারকোড স্ট্রিপ */}
          <div className="w-full h-8 bg-slate-900 bg-opacity-95 flex flex-col justify-center items-center rounded text-[7px] text-white font-mono tracking-widest select-none opacity-80">
            ||||| | |||| ||| || ||||| ||| |||
            <span className="text-[6px] tracking-normal mt-0.5">{sampleWorker.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}