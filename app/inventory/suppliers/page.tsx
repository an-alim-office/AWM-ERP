"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Package,
  BadgeCheck,
  AlertTriangle,
  Building2,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  status: "Active" | "Inactive" | "Pending";
  performance: number;
}

export default function SupplierManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Supplier["status"]>("All");

  const [suppliers] = useState<Supplier[]>([
    {
      id: "SUP-1001",
      name: "Al Noor Supplies",
      email: "contact@alnoor.com",
      phone: "+966 55 123 4567",
      category: "Office Supplies",
      rating: 4.8,
      status: "Active",
      performance: 92,
    },
    {
      id: "SUP-1002",
      name: "Desert Tech Vendors",
      email: "info@deserttech.com",
      phone: "+966 50 987 6543",
      category: "Electronics",
      rating: 4.5,
      status: "Active",
      performance: 88,
    },
    {
      id: "SUP-1003",
      name: "Riyadh Industrial Co.",
      email: "sales@riyadhind.com",
      phone: "+966 54 222 8899",
      category: "Industrial Tools",
      rating: 3.9,
      status: "Pending",
      performance: 74,
    },
    {
      id: "SUP-1004",
      name: "Global Office Hub",
      email: "support@globaloffice.com",
      phone: "+966 56 111 2233",
      category: "Furniture",
      rating: 4.2,
      status: "Inactive",
      performance: 65,
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase());

      const matchFilter = filter === "All" || s.status === filter;

      return matchQuery && matchFilter;
    });
  }, [query, filter, suppliers]);

  const statusStyle = (status: Supplier["status"]) => {
    switch (status) {
      case "Active":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "Inactive":
        return "text-red-300 bg-red-500/10 border-red-500/20";
      case "Pending":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  const performanceColor = (p: number) => {
    if (p >= 85) return "text-emerald-300";
    if (p >= 70) return "text-yellow-300";
    return "text-red-300";
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <Users className="text-blue-400" />
          Supplier Management
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Vendor database, contracts & performance analytics
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search supplier, email, category..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">

          {(["All", "Active", "Pending", "Inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                filter === f
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}

        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-black/30 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Supplier</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Performance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">

              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition">

                  <td className="p-4">
                    <div className="font-black text-blue-300 flex items-center gap-2">
                      <Building2 size={14} />
                      {s.name}
                    </div>
                    <div className="text-xs text-gray-500">{s.id}</div>
                  </td>

                  <td className="p-4 text-gray-300 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail size={12} />
                      {s.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone size={12} />
                      {s.phone}
                    </div>
                  </td>

                  <td className="p-4 text-gray-300">{s.category}</td>

                  <td className="p-4 flex items-center gap-1 text-yellow-300">
                    <Star size={14} />
                    {s.rating}
                  </td>

                  <td className={`p-4 font-bold ${performanceColor(s.performance)}`}>
                    {s.performance}%
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusStyle(s.status)}`}>
                      {s.status}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {filtered.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No suppliers found
        </div>
      )}

    </main>
  );
}