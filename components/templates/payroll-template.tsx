"use client";

import React from "react";

export default function PayrollTemplate() {
  const invoiceData = {
    id: "INV-2026-058",
    name: "মোঃ তারেক রহমান",
    base: 4500,
    allowance: 500,
    deduction: 150,
    net: 4850
  };

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">পে-রোল স্যালারি স্লিপ টেমপ্লেট (Payroll Slip UI)</h2>
        <p className="text-xs text-gray-500">বেসিক স্যালারি, হাউজিং অ্যালাউন্স এবং মোট পেইড বেতনের ক্যালকুলেশন ভিউ</p>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white max-w-xl mx-auto shadow-sm">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">Salary Payslip Statement</h3>
            <span className="text-[10px] text-gray-400 font-mono">আইডি: {invoiceData.id}</span>
          </div>
          <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold">May 2026</span>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div className="flex justify-between border-b pb-2 text-gray-700">
            <span>কর্মচারীর নাম:</span>
            <strong className="text-gray-900">{invoiceData.name}</strong>
          </div>

          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>মূল বেতন (Base Salary):</span>
              <span className="font-mono">{invoiceData.base} SAR</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>অ্যালাউন্স ও বোনাস (+):</span>
              <span className="font-mono">+{invoiceData.allowance} SAR</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>ট্যাক্স ও অন্যান্য কর্তন (-):</span>
              <span className="font-mono">-{invoiceData.deduction} SAR</span>
            </div>
          </div>

          <div className="flex justify-between border-t pt-3 font-bold text-sm text-slate-800 bg-slate-50 p-2 rounded">
            <span>মোট প্রদেয় নেট স্যালারি:</span>
            <span className="font-mono text-blue-600">{invoiceData.net} SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}