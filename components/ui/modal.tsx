"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      {/* ব্যাকড্রপ বা বাইরের কালো অংশে ক্লিক করলে বন্ধ হওয়ার লজিক */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* মডাল কন্টেন্ট বক্স */}
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden relative z-10 transform scale-100 transition-all max-h-[90vh] flex flex-col">
        {/* হেডার পার্ট */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 font-mono text-lg transition"
          >
            ×
          </button>
        </div>

        {/* বডি পার্ট (স্ক্রোলযোগ্য) */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-gray-600 leading-relaxed bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}