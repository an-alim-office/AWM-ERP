"use client";

import React, { useState } from "react";

export default function CurrencySettingsPage() {
  const [primaryCurrency, setPrimaryCurrency] = useState("SAR");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">কারেন্সি সেটিংস (Currency Settings)</h1>
        <p className="text-sm text-gray-500">পে-রোল ও হিসাবনিকাশের মূল মুদ্রা এবং ফরম্যাট সিলেক্ট করুন</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm">
          ডিফল্ট কারেন্সি সেটিংস সফলভাবে আপডেট হয়েছে!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="max-w-md">
          <label className="block text-sm font-semibold text-gray-700 mb-2">প্রধান মুদ্রা (Primary Currency)</label>
          <select
            value={primaryCurrency}
            onChange={(e) => setPrimaryCurrency(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
          >
            <option value="SAR">Saudi Riyal (SAR)</option>
            <option value="BDT">Bangladeshi Taka (BDT)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border text-xs text-gray-600">
          * মনে রাখবেন: কারেন্সি পরিবর্তন করলে পূর্ববর্তী কোনো রিপোর্টের ডাটার মান স্বয়ংক্রিয়ভাবে কনভার্ট হবে না, শুধুমাত্র নতুন এন্ট্রি ও পে-স্লিপে এই সিম্বলটি প্রদর্শিত হবে।
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition disabled:bg-blue-400"
          >
            {loading ? "আপডেট হচ্ছে..." : "কারেন্সি সেট করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}