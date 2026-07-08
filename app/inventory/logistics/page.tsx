"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
} from "lucide-react";

interface Shipment {
  id: string;
  carrier: string;
  destination: string;
  status: "In Transit" | "Delivered" | "Delayed";
  eta: string;
}

export default function LogisticsPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Shipment["status"] | "All">("All");

  const [shipments] = useState<Shipment[]>([
    {
      id: "SHIP-1001",
      carrier: "Global Express",
      destination: "Riyadh Warehouse",
      status: "In Transit",
      eta: "2026-06-30",
    },
    {
      id: "SHIP-1002",
      carrier: "FastTrack Logistics",
      destination: "Jeddah Hub",
      status: "Delivered",
      eta: "2026-06-27",
    },
    {
      id: "SHIP-1003",
      carrier: "Desert Cargo",
      destination: "Dammam Branch",
      status: "Delayed",
      eta: "2026-07-02",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const matchQuery =
        s.id.toLowerCase().includes(query.toLowerCase()) ||
        s.carrier.toLowerCase().includes(query.toLowerCase()) ||
        s.destination.toLowerCase().includes(query.toLowerCase());

      const matchFilter = filter === "All" || s.status === filter;

      return matchQuery && matchFilter;
    });
  }, [query, filter, shipments]);

  const statusStyle = (status: Shipment["status"]) => {
    switch (status) {
      case "Delivered":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "In Transit":
        return "text-blue-300 bg-blue-500/10 border-blue-500/20";
      case "Delayed":
        return "text-red-300 bg-red-500/10 border-red-500/20";
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <Truck className="text-blue-400" />
          Logistics & Shipment Tracking
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time shipment monitoring, carrier tracking & delivery analytics
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shipment, carrier, destination..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">

          {(["All", "In Transit", "Delivered", "Delayed"] as const).map((f) => (
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
                <th className="p-4">Shipment ID</th>
                <th className="p-4">Carrier</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Status</th>
                <th className="p-4">ETA</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">

              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-white/5 transition"
                >

                  <td className="p-4 font-black text-blue-300">
                    {s.id}
                  </td>

                  <td className="p-4 text-gray-200">
                    {s.carrier}
                  </td>

                  <td className="p-4 flex items-center gap-2 text-gray-300">
                    <MapPin size={14} />
                    {s.destination}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold ${statusStyle(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="p-4 flex items-center gap-2 text-gray-300">
                    <Calendar size={14} />
                    {s.eta}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No shipments found
        </div>
      )}

    </main>
  );
}