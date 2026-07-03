"use client";

import { useState, useEffect } from "react";
import ReportPage from "./ReportPage";

export default function EnterpriseOperations() {
  const [employees, setEmployees] = useState<any[]>([]);

  // স্থানীয় স্টোরেজ থেকে ডেটা লোড করার লজিক
  useEffect(() => {
    const savedData = localStorage.getItem("enterprise_db");
    if (savedData) {
      setEmployees(JSON.parse(savedData));
    }
  }, []);

  // ডেটাবেজ সিঙ্ক হ্যান্ডলার
  const syncDatabase = (data: any[]) => {
    setEmployees(data);
    localStorage.setItem("enterprise_db", JSON.stringify(data));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* আপনার বিদ্যমান হেডার এবং ফর্ম সেকশন এখানে থাকবে */}
      
      {/* Report Section - এখানে ReportPage এর সাথে সংযোগটি নিশ্চিত করা হয়েছে */}
      <div className="mt-12">
        <ReportPage 
          employees={employees} 
          onUpdateEmployees={syncDatabase} 
        />
      </div>
    </div>
  );
}