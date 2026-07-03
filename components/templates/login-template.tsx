"use client";

import React, { useState } from "react";

export default function LoginTemplate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">অথেন্টিকেশন লগইন টেমপ্লেট (Secure Login UI)</h2>
        <p className="text-xs text-gray-500">সিস্টেম সিকিউরিটি এনশিওর করতে মডার্ন ফর্ম ডিজাইন</p>
      </div>

      <div className="max-w-md mx-auto p-6 border rounded-2xl bg-slate-50/50 shadow-inner space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-gray-800">ERP প্যানেলে সাইন-ইন করুন</h3>
          <p className="text-xs text-gray-400">আপনার অ্যাডমিন ক্রেডেনশিয়াল ব্যবহার করুন</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ইমেইল বা ইউজারনেম</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="admin@aymanworkforce.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow transition"
          >
            সিকিউর লগইন
          </button>
        </form>
      </div>
    </div>
  );
}