"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  PackagePlus,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type POStatus = "Pending" | "Approved" | "Shipped" | "Cancelled";

interface PurchaseOrder {
  id: string;
  vendor: string;
  item: string;
  amount: number;
  status: POStatus;
  date: string;
  eta: string;
}

export default function PurchaseOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<POStatus | "All">("All");

  const [orders] = useState<PurchaseOrder[]>([
    {
      id: "PO-1001",
      vendor: "Al Noor Supplies",
      item: "Office Chairs",
      amount: 12000,
      status: "Approved",
      date: "2026-06-20",
      eta: "2026-06-30",
    },
    {
      id: "PO-1002",
      vendor: "Riyadh Tech Co.",
      item: "Laptops",
      amount: 85000,
      status: "Shipped",
      date: "2026-06-18",
      eta: "2026-06-28",
    },
    {
      id: "PO-1003",
      vendor: "Desert Office Mart",
      item: "Stationery Kit",
      amount: 3200,
      status: "Pending",
      date: "2026-06-25",
      eta: "2026-07-05",
    },
    {
      id: "PO-1004",
      vendor: "Global Office Hub",
      item: "Printers",
      amount: 22000,
      status: "Cancelled",
      date: "2026-06-15",
      eta: "-",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchQuery =
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.vendor.toLowerCase().includes(query.toLowerCase()) ||
        o.item.toLowerCase().includes(query.toLowerCase());

      const matchStatus = status === "All" || o.status === status;

      return matchQuery && matchStatus;
    });
  }, [query, status, orders]);

  const statusStyle = (s: POStatus) => {
    switch (s) {
      case "Approved":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "Shipped":
        return "text-blue-300 bg-blue-500/10 border-blue-500/20";
      case "Pending":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
      case "Cancelled":
        return "text-red-300 bg-red-500/10 border-red-500/20";
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <ClipboardList className="text-indigo-400" />
          Purchase Orders
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Procurement lifecycle, vendor orders & supply chain management
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PO, vendor, item..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">

          {(["All", "Pending", "Approved", "Shipped", "Cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                status === f
                  ? "bg-indigo-600 border-indigo-500 text-white"
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
                <th className="p-4">PO ID</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Item</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">ETA</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">

              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition">

                  <td className="p-4 font-black text-indigo-300">
                    {o.id}
                  </td>

                  <td className="p-4 text-gray-200">
                    {o.vendor}
                  </td>

                  <td className="p-4 text-gray-300">
                    {o.item}
                  </td>

                  <td className="p-4 text-gray-300">
                    ${o.amount.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="p-4 flex items-center gap-2 text-gray-300">
                    <Calendar size={14} />
                    {o.date}
                  </td>

                  <td className="p-4 flex items-center gap-2 text-gray-300">
                    <Truck size={14} />
                    {o.eta}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {filtered.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No purchase orders found
        </div>
      )}

    </main>
  );
}