"use client";

import { useMemo, useState } from "react";

export default function ReportPage({ employees, onUpdateEmployees }: { employees: any[], onUpdateEmployees: (data: any[]) => void }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll'>('attendance');

  const toggleAttendance = (empId: string) => {
    onUpdateEmployees(employees.map(emp => 
      emp.id === empId ? { ...emp, isPresent: !emp.isPresent } : emp
    ));
  };

  const presentCount = useMemo(() => employees.filter(e => e.isPresent).length, [employees]);
  const totalPayout = useMemo(() => employees.reduce((acc, emp) => acc + Number(emp.net || 0), 0), [employees]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* সামারি কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Workforce", value: employees.length, color: "bg-slate-900" },
          { label: "Present Today", value: presentCount, color: "bg-emerald-500" },
          { label: "Total Payout", value: `$${totalPayout}`, color: "bg-blue-600" },
          { label: "Absent", value: employees.length - presentCount, color: "bg-indigo-600" }
        ].map((item, i) => (
          <div key={i} className={`${item.color} p-6 rounded-2xl text-white`}>
            <p className="text-[10px] opacity-50 uppercase tracking-widest">{item.label}</p>
            <h4 className="text-2xl font-black mt-1">{item.value}</h4>
          </div>
        ))}
      </div>

      {/* কন্ট্রোল বার */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('attendance')} className={`px-6 py-2 rounded-xl font-black uppercase text-xs transition ${activeTab === 'attendance' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Attendance</button>
          <button onClick={() => setActiveTab('payroll')} className={`px-6 py-2 rounded-xl font-black uppercase text-xs transition ${activeTab === 'payroll' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Payroll History</button>
        </div>
        <button onClick={() => window.print()} className="bg-red-500 text-white px-6 py-2 rounded-xl font-black uppercase text-xs hover:bg-red-600 transition">Export PDF</button>
      </div>

      {/* কন্টেন্ট এরিয়া */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {activeTab === 'attendance' ? (
          <AttendanceTable employees={employees} toggleAttendance={toggleAttendance} />
        ) : (
          <PayrollTable employees={employees} />
        )}
      </div>
    </div>
  );
}

// সাব-কম্পোনেন্টগুলো আলাদা রাখা ভালো প্র্যাকটিস
const AttendanceTable = ({ employees, toggleAttendance }: any) => (
  <table className="w-full text-center text-xs uppercase">
    <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
    <tbody>
      {employees.map((emp: any) => (
        <tr key={emp.id} className="border-b"><td className="p-4 font-bold">{emp.name}</td>
        <td className={`p-4 font-black ${emp.isPresent ? "text-emerald-500" : "text-red-500"}`}>{emp.isPresent ? "PRESENT" : "ABSENT"}</td>
        <td className="p-4"><button onClick={() => toggleAttendance(emp.id)} className={`px-4 py-2 rounded-lg ${emp.isPresent ? 'bg-red-500' : 'bg-emerald-500'} text-white`}>{emp.isPresent ? "Mark Absent" : "Mark Present"}</button></td></tr>
      ))}
    </tbody>
  </table>
);

const PayrollTable = ({ employees }: any) => (
  <table className="w-full text-center text-xs uppercase">
    <thead className="bg-slate-50"><tr><th className="p-4">Name</th><th className="p-4">Department</th><th className="p-4">Net Payout</th></tr></thead>
    <tbody>
      {employees.map((emp: any) => (
        <tr key={emp.id} className="border-b"><td className="p-4 font-bold">{emp.name}</td>
        <td className="p-4">{emp.department}</td><td className="p-4 font-black text-emerald-600">${emp.net}</td></tr>
      ))}
    </tbody>
  </table>
);