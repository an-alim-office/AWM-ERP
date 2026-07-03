"use client";

import React from "react";

interface LoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loader({ text = "ডাটা লোড হচ্ছে...", size = "md" }: LoaderProps) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3 w-full">
      <div className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className="text-gray-500 text-xs font-medium tracking-wide">{text}</p>}
    </div>
  );
}