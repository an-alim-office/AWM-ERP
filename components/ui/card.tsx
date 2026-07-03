"use client";

import React from "react";

// নতুন ইন্টারফেস যাতে ড্যাশবোর্ড থেকে পাঠানো প্রপসগুলো কাজ করে
interface CardProps {
  title?: string;
  value?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({ title, value, icon, children, className = "" }: CardProps) {
  // যদি title থাকে তবে সিম্পল কার্ড হিসেবে রেন্ডার হবে
  if (title) {
    return (
      <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition ${className}`}>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {icon && <span className="text-xs text-blue-500 mt-2 block capitalize">{icon}</span>}
      </div>
    );
  }

  // যদি children থাকে (যেমন: CardHeader/CardBody), তবে আগের মতো কাজ করবে
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}

// সাব-কম্পোনেন্টগুলো ঠিক আছে
export function CardHeader({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`border-b pb-3 mb-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`${className}`}>{children}</div>;
}