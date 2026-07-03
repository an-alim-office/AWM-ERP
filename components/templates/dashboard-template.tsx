"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Table from "@/components/ui/table";

export default function DashboardTemplate() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ডাটা ফেচ করার ফাংশন
  async function fetchEmployees() {
    setLoading(true);
    try {
      const response = await fetch("/api/employee-service");
      if (!response.ok) throw new Error("নেটওয়ার্ক রেসপন্স সমস্যা");
      
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : (data.employees || []));
    } catch (error) {
      console.error("ডাটা লোড করতে সমস্যা:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      {/* কার্ড সেকশন */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          title="মোট কর্মী" 
          value={loading ? "..." : employees.length.toString()} 
          icon="users" 
        />
      </div>

      {/* টেবিল সেকশন */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-6">সাম্প্রতিক কর্মী তালিকা</h2>
        
        <Table headers={["আইডি", "নাম", "পদবী", "স্ট্যাটাস", "অ্যাকশন"]}>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">লোড হচ্ছে...</td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center">কোনো ডাটা পাওয়া যায়নি</td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp._id || Math.random()} className="border-b hover:bg-gray-50">
                <td className="p-4 text-xs font-mono">...{emp._id?.slice(-4)}</td>
                <td className="p-4 font-medium">{emp.name}</td>
                <td className="p-4 text-gray-600">{emp.position}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] rounded-full font-bold ${
                    emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 font-bold hover:underline">এডিট</button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>
    </div>
  );
}