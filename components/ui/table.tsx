"use client";

import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function Table({ headers, children }: TableProps) {
  // ডাটা না থাকলে ইউজারকে জানানোর ব্যবস্থা (এম্পটি স্টেট)
  if (!children) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm border rounded-xl bg-gray-50">
        কোনো ডাটা পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-gray-700 text-xs font-bold tracking-wide">
              {headers.map((header, idx) => (
                <th key={idx} scope="col" className="p-4 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-xs divide-y divide-slate-100 bg-white">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}