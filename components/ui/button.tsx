"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-400",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400 disabled:bg-gray-50",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-400",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 disabled:bg-emerald-400"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
}