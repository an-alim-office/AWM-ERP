"use client";

import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "সার্চ করুন..." }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      {/* সার্চ আইকন */}
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-gray-800 bg-white placeholder-gray-400 shadow-sm transition"
        placeholder={placeholder}
      />
    </div>
  );
}