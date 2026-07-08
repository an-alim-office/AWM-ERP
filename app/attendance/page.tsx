"use client";
import { useEffect, useState } from 'react';

interface AttendanceLog {
  _id?: string;
  id?: string;
  employeeId: string;
  name: string;
  companyName: string;
  position: string;
  profilePic?: string;
  dob?: string;
  bloodGroup?: string;
  nidDoc?: string;
  passportDoc?: string;
  baseSalary: number;     // কর্মচারীর মূল বেতন
  salaryAdvance: number;  // অগ্রিম নেওয়া টাকা
  netSalary: number;      // মূল বেতন - অগ্রিম (অটো ক্যালকুলেটেড)
  date: string;
  status: string;
  method: string;
  time: string;
  location?: { lat: number; lng: number } | null;
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ফিল্টার ও সার্চ স্টেট
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // পেজিনেশন স্টেট
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // অফিস শুরু এবং লেট কাউন্টিং টাইম
  const OFFICE_START_TIME = "09:15";

  // জিওলোকেশন এবং ডিভাইস সিমুলেশন স্টেট
  const [useLocation, setUseLocation] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // ম্যানুয়াল এন্ট্রি মডাল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCompanyActive, setCustomCompanyActive] = useState(false);
  
  // আইডি কার্ড জেনারেশন স্টেট
  const [selectedEmpForCard, setSelectedEmpForCard] = useState<AttendanceLog | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // বিশ্বের সেরা এবং আপনার লোকাল প্রজেক্টের কোম্পানির নামের লিস্ট (অটো অপশন)
  const GLOBAL_COMPANIES = [
    "AlimPay Ltd.", "AWM ERP Solutions", "Avk Tech", "Saudi Aramco", "NEOM Company", 
    "SABIC", "STC (Jawwy)", "Google LLC", "Microsoft Corporation", "Apple Inc.", 
    "Amazon Web Services", "Meta Platforms", "Tesla Inc.", "Netflix", "IBM", 
    "Oracle", "Intel", "Samsung Electronics", "Sony Corporation", "Tata Consultancy Services"
  ];

  const initialFormState: AttendanceLog = {
    employeeId: '',  
    name: '',
    companyName: '', 
    position: '',    
    profilePic: '',  
    dob: '', 
    bloodGroup: '',  
    nidDoc: '',      
    passportDoc: '', 
    baseSalary: 0,
    salaryAdvance: 0,
    netSalary: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    method: 'Manual',
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    location: null 
  };

  const [formData, setFormData] = useState<AttendanceLog>(initialFormState);

  // স্যালারি এবং অ্যাডভান্স ইনপুট পরিবর্তনের সাথে সাথে নেট স্যালারি অটো-মাইনাস করার এফেক্ট লজিক
  useEffect(() => {
    const base = Number(formData.baseSalary) || 0;
    const advance = Number(formData.salaryAdvance) || 0;
    setFormData(prev => ({
      ...prev,
      netSalary: base - advance
    }));
  }, [formData.baseSalary, formData.salaryAdvance]);

  // ডাটা ফেচ করার ফাংশন
  const fetchAttendance = () => {
    setLoading(true);
    fetch('/api/attendance-service')
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((result) => {
        // ডাটা ম্যাপ করে নেট স্যালারি সিকিউর করা (সার্ভার থেকে netSalary না আসলেও যাতে ক্লায়েন্টে অটো-মাইনাস দেখায়)
        const mappedData = (result.data || result || []).map((item: any) => {
          const base = Number(item.baseSalary) || 0;
          const advance = Number(item.salaryAdvance) || 0;
          return {
            ...item,
            baseSalary: base,
            salaryAdvance: advance,
            netSalary: item.netSalary !== undefined ? item.netSalary : (base - advance)
          };
        });
        setAttendanceData(mappedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // বায়োমেট্রিক ডিভাইস স্ক্যানিং সিমুলেটর লজিক
  const handleMethodChange = (methodValue: string) => {
    setFormData({ ...formData, method: methodValue });
    
    if (methodValue === 'Fingerprint' || methodValue === 'ID Card') {
      setIsScanning(true);
      setScanSuccess(false);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setFormData((prev) => ({
          ...prev,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }));
      }, 2500);
    } else {
      setIsScanning(false);
      setScanSuccess(false);
    }
  };

  // ব্রাউজার থেকে লাইভ জিওলোকেশন ল্যাটিটিউড/লঙ্গিটিউড ডাটা নেওয়ার লজিক
  const handleLocationToggle = (checked: boolean) => {
    setUseLocation(checked);
    if (checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }));
          },
          (error) => {
            console.error("Geolocation Error:", error);
            alert("লোকেশন অ্যাক্সেস পাওয়া যায়নি! দয়া করে ব্রাউজার পারমিশন চেক করুন।");
            setUseLocation(false);
          }
        );
      } else {
        alert("আপনার ব্রাউজারে জিওলোকেশন সাপোর্ট করে না।");
        setUseLocation(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, location: null }));
    }
  };

  // ইমেজ/ডকুমেন্ট ফাইলকে Base64 এ কনভার্ট করার জেনেরিক লজিক
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AttendanceLog) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ডাটা ডিলিট করার হ্যান্ডলার
  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই হাজিরার রেকর্ডটি ডিলিট করতে চান?")) return;
    
    try {
      const response = await fetch(`/api/attendance-service?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert("রেকর্ডটি সফলভাবে ডিলিট করা হয়েছে।");
        fetchAttendance();
      } else {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // ফর্ম সাবমিট করার হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) {
      alert("ডিভাইস স্ক্যানিং শেষ হওয়া পর্যন্ত অপেক্ষা করুন।");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/attendance-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("স্টাফ রেকর্ড সফলভাবে যুক্ত করা হয়েছে!");
        setIsModalOpen(false);
        setUseLocation(false);
        setScanSuccess(false);
        setCustomCompanyActive(false);
        setFormData(initialFormState);
        fetchAttendance();
      } else {
        alert("রেকর্ড যুক্ত করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPDF = () => { window.print(); };
  const handlePrintIDCard = () => { window.print(); };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = "8801700000000"; 
    const text = encodeURIComponent("Hello Support Team, I need assistance with the Staff Administration Management Dashboard.");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  // সার্চ, স্ট্যাটাস এবং ডেট ফিল্টার লজিক
  const filteredData = attendanceData.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || item.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // পেজিনেশন ক্যালকুলেশন
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // সিএসভি (CSV) ফাইল এক্সপোর্ট লজিক
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("এক্সপোর্ট করার মতো কোনো ডেটা নেই!");
      return;
    }

    const headers = ["S.L", "ID", "Name", "Company", "Position", "Base Salary", "Salary Advance", "Net Salary Payable", "Date", "Status", "Method", "Time", "Coordinates"];
    const rows = filteredData.map((item, index) => {
      const geoLoc = item.location ? `${item.location.lat};${item.location.lng}` : 'N/A';
      return [
        index + 1,
        `"${item.employeeId || 'N/A'}"`,
        `"${item.name || 'N/A'}"`,
        `"${item.companyName || 'N/A'}"`, 
        `"${item.position || 'N/A'}"`,
        `"${item.baseSalary || 0}"`,
        `"${item.salaryAdvance || 0}"`,
        `"${item.netSalary || 0}"`,
        `"${item.date || 'N/A'}"`,
        `"${item.status || 'N/A'}"`,
        `"${item.method || 'N/A'}"`,
        `"${item.time || 'N/A'}"`,
        `"${geoLoc}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Staff_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // সামারি গ্লোবাল ক্যালকুলেশন
  const totalEmployees = filteredData.length;
  const presentCount = filteredData.filter(item => (item.status || '').toLowerCase() === 'present').length;
  const absentCount = filteredData.filter(item => (item.status || '').toLowerCase() === 'absent').length;
  const lateCount = filteredData.filter(item => 
    (item.status || '').toLowerCase() === 'present' && item.time && item.time > OFFICE_START_TIME
  ).length;

  // ডাইনামিক স্যালারি অটোসাম লজিক (বেস, অ্যাডভান্স এবং নিট পে-এবল আলাদা আলাদা)
  const totalBaseSalaryAmount = filteredData.reduce((sum, item) => sum + (Number(item.baseSalary) || 0), 0);
  const totalSalaryAdvanceAmount = filteredData.reduce((sum, item) => sum + (Number(item.salaryAdvance) || 0), 0);
  const totalNetSalaryAmount = filteredData.reduce((sum, item) => sum + (Number(item.netSalary) || 0), 0);

  // আইডি কার্ড জেনারেট ট্রিগার ফাংশন
  const openIDCardGenerator = (worker: AttendanceLog) => {
    setSelectedEmpForCard(worker);
    setIsCardModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative print:p-0 print:bg-white">
      
      {/* গ্লোবাল প্রিন্ট স্টাইল ইনজেকশন */}
      <style jsx global>{`
        @media print {
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-card-layout {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            background: white !important;
            z-index: 9999999 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* প্রিমিয়াম সেন্ট্রাল হেডার সেকশন */}
      <div className="text-center mb-8 print:mb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent drop-shadow-sm uppercase">
          Staff Administration Management
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-2 max-w-2xl mx-auto print:hidden">
          গ্লোবাল এন্টারপ্রাইজ কর্মচারীদের দৈনিক বায়োমেট্রিক উপস্থিতি, রিয়েল-টাইম জিও-ট্র্যাকিং এবং স্যালারি অ্যাডভান্সমেন্ট কন্ট্রোল সিস্টেম।
        </p>
      </div>

      {/* অ্যাকশন বাটন সেকশন */}
      <div className="flex justify-end mb-6 gap-2 flex-wrap print:hidden">
        <button 
          onClick={fetchAttendance}
          title="Refresh Data"
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 bg-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
          </svg>
        </button>

        <button 
          onClick={handlePrintPDF}
          title="Print Report as PDF"
          className="p-2 border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Print PDF</span>
        </button>

        <button 
          onClick={handleWhatsAppRedirect}
          title="Chat via WhatsApp"
          className="p-2 border border-green-300 text-green-700 hover:bg-green-50 bg-white rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-green-500" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
        </button>

        <button 
          onClick={exportToCSV}
          className="border border-green-600 text-green-700 hover:bg-green-50 font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Record
        </button>
      </div>

      {/* সেন্ট্রাল সার্চ বার */}
      <div className="w-full flex justify-center mb-8 print:hidden">
        <div className="relative w-full max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search staff by Name, ID or Company instantaneously..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-28 py-3.5 bg-white text-gray-800 font-medium placeholder-gray-400 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-base"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Clear Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg whitespace-nowrap">
              {filteredData.length} Found
            </span>
          </div>
        </div>
      </div>

      {/* কুইক সামারি কার্ডস ও অটোসাম ফাইনান্সিয়াল ইন্টেলিজেন্স */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-6 print:hidden">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Logs</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-bold text-green-500 uppercase">Present</p>
          <p className="text-xl font-bold text-green-600 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-bold text-orange-500 uppercase">Late Entry</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{lateCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-bold text-red-500 uppercase">Absent</p>
          <p className="text-xl font-bold text-red-600 mt-1">{absentCount}</p>
        </div>
        
        {/* স্যালারি ফাইনান্সিয়াল ব্রেকডাউন সামারি */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-500 uppercase">Gross Base Salary</p>
          <p className="text-lg font-bold text-gray-700 mt-1">৳ {totalBaseSalaryAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-200 text-center">
          <p className="text-xs font-bold text-amber-700 uppercase">Advance Deducted</p>
          <p className="text-lg font-bold text-amber-700 mt-1">৳ {totalSalaryAdvanceAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-200 text-center">
          <p className="text-xs font-bold text-emerald-800 uppercase">Net Payable Salary</p>
          <p className="text-xl font-black text-emerald-900 mt-1">৳ {totalNetSalaryAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* ফিল্টার বার */}
      <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-end print:hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">Date:</span>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto"
            />
            {dateFilter && (
              <button onClick={() => { setDateFilter(''); setCurrentPage(1); }} className="text-xs text-red-500 underline">Clear</button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* মেইন টেবিল সেকশন */}
      <div className="bg-white shadow-sm border-x border-gray-200 overflow-x-auto print:no-print">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 animate-pulse">Loading administrative data...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
                <th className="p-4 text-left w-16">S.L</th> 
                <th className="p-4 text-left">Profile</th> 
                <th className="p-4 text-left">Staff & Corporate Info</th> 
                <th className="p-4 text-left">Salary Sheet (BDT)</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-left">Verification Details</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {currentItems.map((item, index) => {
                const isPresent = (item.status || '').toLowerCase() === 'present';
                const isLate = isPresent && item.time && item.time > OFFICE_START_TIME;
                const serialNumber = indexOfFirstItem + index + 1;

                return (
                  <tr key={item._id || item.id} className="hover:bg-gray-50 transition-colors break-inside-avoid">
                    <td className="p-4 font-medium text-gray-500">{serialNumber}</td>
                    <td className="p-4">
                      {item.profilePic ? (
                        <img 
                          src={item.profilePic} 
                          alt="Profile" 
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-semibold text-xs">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{item.name || "N/A"}</span>
                        <span className="text-xs text-gray-500 font-medium">ID: {item.employeeId || "N/A"}</span>
                        <span className="text-xs text-blue-600 font-bold mt-0.5">
                          {item.position || "N/A"} 
                        </span>
                        <span className="text-[11px] text-indigo-700 font-semibold italic">
                          🏢 {item.companyName || 'N/A'}
                        </span>
                        {item.bloodGroup && (
                          <span className="text-[11px] text-red-600 font-semibold">Blood: {item.bloodGroup}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-gray-500">Base: ৳{(item.baseSalary || 0).toLocaleString('en-IN')}</span>
                        <span className="text-amber-600 font-medium">Adv: -৳{(item.salaryAdvance || 0).toLocaleString('en-IN')}</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded w-max mt-1 text-sm">
                          Net: ৳{(item.netSalary || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{item.date || "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                        {item.method || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={isLate ? "text-red-600 font-semibold" : "text-gray-500"}>
                            {item.time || "N/A"}
                          </span>
                          {isLate && (
                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                              Late
                            </span>
                          )}
                        </div>
                        {item.location && (
                          <span className="text-[11px] text-blue-600 flex items-center gap-0.5">
                            📍 Geo-Tagged ({item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openIDCardGenerator(item)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded transition-colors"
                          title="Generate Worker ID Card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4a3 3 0 013 3v1" />
                          </svg>
                        </button>

                        <button 
                          onClick={() => handleDelete(item._id || item.id || '')}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete Record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium">No matching administrative records found.</p>
          </div>
        )}
      </div>

      {/* পেজিনেশন ফুটবার কন্ট্রোল */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-b-xl border-x border-b border-gray-200 flex items-center justify-between text-sm text-gray-600 print:no-print">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-medium text-gray-800">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* অ্যাড স্টাফ এন্ট্রি মডাল পপআপ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:no-print">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Add New Administrative Record</h2>
              <button onClick={() => { setIsModalOpen(false); setCustomCompanyActive(false); }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {formData.profilePic && (
                    <img src={formData.profilePic} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-blue-500" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePic')}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* কোম্পানি সিলেকশন (অটো ড্রপডাউন + ম্যানুয়াল ইনপুট কম্বো) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
                <select
                  required
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "CUSTOM") {
                      setCustomCompanyActive(true);
                      setFormData({...formData, companyName: ""});
                    } else {
                      setCustomCompanyActive(false);
                      setFormData({...formData, companyName: val});
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choose a corporate branch...</option>
                  {GLOBAL_COMPANIES.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                  <option value="CUSTOM">📝 Type Custom Company Name...</option>
                </select>

                {/* ড্রপডাউনে "CUSTOM" চুজ করলেই কেবল এই ম্যানুয়াল টেক্সট ইনপুট এরিয়াটি ট্র্রিগার হবে */}
                {customCompanyActive && (
                  <div className="mt-2 animate-fadeIn">
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter custom company name here" 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full border border-blue-400 bg-blue-50/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-800 placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input 
                    type="text" required placeholder="e.g. EMP-1002" value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input 
                    type="text" required placeholder="Enter name" value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input 
                    type="text" required placeholder="e.g. Architect" value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* স্যালারি ফাইনান্সিয়াল সেকশন - রিয়েলটাইম অটো-মাইনাস সাবট্রাকশন */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <p className="text-xs font-black uppercase text-gray-500 tracking-wider">Payroll & Deduction Intelligence</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Base Salary</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      placeholder="e.g. 25000" 
                      value={formData.baseSalary || ''}
                      onChange={(e) => setFormData({...formData, baseSalary: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-1">Salary Advance (Take)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="e.g. 5000" 
                      value={formData.salaryAdvance || ''}
                      onChange={(e) => setFormData({...formData, salaryAdvance: Number(e.target.value)})}
                      className="w-full border border-amber-300 bg-amber-50/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-amber-800"
                    />
                  </div>
                </div>
                <div className="bg-white border border-dashed border-gray-200 p-2 rounded-lg flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-600">Calculated Net Payable:</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    ৳ {(formData.netSalary).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  required 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">📁 Upload National ID (NID)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'nidDoc')}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {formData.nidDoc && (
                  <p className="text-[10px] text-green-600 mt-1 font-medium">✓ NID Document Loaded Successfully</p>
                )}
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">🛂 Upload Passport Document</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, 'passportDoc')}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {formData.passportDoc && (
                  <p className="text-[10px] text-green-600 mt-1 font-medium">✓ Passport Document Loaded Successfully</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record Date</label>
                  <input 
                    type="date" required value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-blue-700"
                  >
                    <option value="Manual">Manual Entry</option>
                    <option value="Fingerprint">👉 Fingerprint Scan</option>
                    <option value="ID Card">🪪 ID Card Swipe</option>
                  </select>
                </div>
              </div>

              {isScanning && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center animate-pulse">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-xs font-semibold text-blue-700">Connecting to Biometric Hardware Device...</p>
                </div>
              )}

              {scanSuccess && !isScanning && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center flex items-center justify-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-xs font-bold text-green-700">Hardware Auth Token Verified!</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" required 
                    disabled={formData.method !== 'Manual'} 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={useLocation}
                    onChange={(e) => handleLocationToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-800">Attach Secure Geo-Location Tag</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" onClick={() => { setIsModalOpen(false); setCustomCompanyActive(false); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting || isScanning}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* প্রিমিয়াম ওয়ালেট সাইজ (CR80) আইডি কার্ড জেনারেশন মডাল */}
      {isCardModalOpen && selectedEmpForCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 print:print-card-layout">
          
          <div className="flex items-center justify-between w-full max-w-[2.125in] mb-3 no-print min-w-[260px]">
            <h3 className="text-white font-bold text-base">ID Card Preview</h3>
            <button 
              onClick={() => { setIsCardModalOpen(false); setSelectedEmpForCard(null); }}
              className="text-white bg-white/20 hover:bg-white/30 rounded-full h-7 w-7 flex items-center justify-center font-bold text-lg transition-colors"
            >
              &times;
            </button>
          </div>

          {/* প্রফেশনাল আইডি কার্ডের স্ট্যান্ডার্ড ওয়ালেট সাইজ লেআউট (2.125" x 3.375") */}
          <div className="w-[2.125in] h-[3.375in] bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 relative flex flex-col items-center text-center font-sans bg-gradient-to-b from-gray-50 to-white print:shadow-none print:border-none print:rounded-none">
            
            <div className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 pt-3 pb-6 rounded-b-[20px] relative shadow-sm">
              <div className="absolute top-1 right-2 text-[7px] text-blue-200 font-bold tracking-widest uppercase">
                {selectedEmpForCard.method === 'Manual' ? 'Staff' : 'Verified'}
              </div>
              <h2 className="text-white font-black text-xs tracking-tight uppercase px-1 truncate">
                {selectedEmpForCard.companyName || "COMPANY CARD"}
              </h2>
              <p className="text-blue-100 text-[8px] font-medium tracking-wide uppercase mt-0.5">
                Identity Card
              </p>
            </div>

            <div className="-mt-4 mb-1.5 relative z-10">
              {selectedEmpForCard.profilePic ? (
                <img 
                  src={selectedEmpForCard.profilePic} 
                  alt="Worker Profile" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-md flex flex-col items-center justify-center text-gray-400 font-bold text-[8px] leading-tight">
                  <span>PHOTO</span>
                </div>
              )}
            </div>

            <div className="px-3 flex-1 flex flex-col justify-between pb-2 w-full">
              <div>
                <h3 className="text-gray-900 font-black text-sm tracking-tight truncate px-1">
                  {selectedEmpForCard.name}
                </h3>
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mt-0.5 truncate px-1">
                  {selectedEmpForCard.position || "Employee"}
                </p>
              </div>

              <div className="bg-gray-50/80 rounded-lg p-1.5 border border-gray-100 grid grid-cols-2 gap-x-1 gap-y-1 text-left text-[9px] text-gray-600 mt-1">
                <div>
                  <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wide">ID Number</span>
                  <span className="font-mono font-bold text-gray-800 text-[10px] truncate block">{selectedEmpForCard.employeeId || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wide">Blood Group</span>
                  <span className="font-bold text-red-600 text-[10px]">{selectedEmpForCard.bloodGroup || "O+"}</span>
                </div>
                <div className="col-span-2 border-t border-gray-200/60 pt-1">
                  <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wide">Issue Date</span>
                  <span className="font-semibold text-gray-700 text-[9px]">{selectedEmpForCard.date || "N/A"}</span>
                </div>
              </div>

              <div className="mt-1.5 pt-1 border-t border-dashed border-gray-200 flex items-center justify-between px-1">
                <div className="text-left">
                  <div className="w-8 h-2 border-b border-gray-300 bg-slate-50/50 rounded"></div>
                  <span className="block text-[6px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Holder Sign</span>
                </div>
                
                <div className="bg-white px-1 py-0.5 rounded font-mono text-[7px] tracking-tighter text-gray-800 border border-gray-100 select-none font-bold">
                  ||| | | || || |
                </div>

                <div className="text-right">
                  <div className="text-[8px] font-serif font-bold italic text-blue-900 leading-none">Alim Uddin</div>
                  <span className="block text-[6px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Authorized</span>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 flex gap-2 w-full max-w-[2.125in] no-print min-w-[260px]">
            <button
              onClick={() => { setIsCardModalOpen(false); setSelectedEmpForCard(null); }}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-xl text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrintIDCard}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Card
            </button>
          </div>

        </div>
      )}

    </div>
  );
}