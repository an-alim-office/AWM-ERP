"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Activity,
} from "lucide-react";

type DeliveryStatus = "In Transit" | "Delivered" | "Pending" | "Delayed";

type Delivery = {
  id: string;
  title: string;
  destination: string;
  eta: string;
  status: DeliveryStatus;
  progress: number;
};

export default function DeliveryTrackingPage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DeliveryStatus | "All">("All");

  useEffect(() => {
    setMounted(true);
  }, []);

  const deliveries: Delivery[] = useMemo(
    () => [
      {
        id: "DLV-1001",
        title: "Office Equipment Shipment",
        destination: "Riyadh Central Hub",
        eta: "2h 30m",
        status: "In Transit",
        progress: 65,
      },
      {
        id: "DLV-1002",
        title: "Client Package Delivery",
        destination: "Al Malaz District",
        eta: "Delivered",
        status: "Delivered",
        progress: 100,
      },
      {
        id: "DLV-1003",
        title: "Warehouse Stock Transfer",
        destination: "North Logistics Center",
        eta: "5h 10m",
        status: "Delayed",
        progress: 40,
      },
      {
        id: "DLV-1004",
        title: "Retail Supply Drop",
        destination: "Downtown Branch",
        eta: "1h 45m",
        status: "Pending",
        progress: 10,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesQuery =
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.destination.toLowerCase().includes(query.toLowerCase());

      const matchesFilter = filter === "All" || d.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [query, filter, deliveries]);

  const statusStyle = (status: DeliveryStatus) => {
    switch (status) {
      case "Delivered":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "In Transit":
        return "text-blue-300 bg-blue-500/10 border-blue-500/20";
      case "Pending":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
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
          Delivery Tracking System
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time logistics monitoring & enterprise delivery intelligence
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search delivery..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">

          {(["All", "In Transit", "Delivered", "Pending", "Delayed"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  filter === f
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            )
          )}

        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:-translate-y-1 transition"
          >

            <div className="flex items-start justify-between">

              <div>
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Package size={16} />
                  {item.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">{item.id}</p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full border font-bold ${statusStyle(
                  item.status
                )}`}
              >
                {item.status}
              </span>

            </div>

            <div className="mt-4 text-sm text-gray-300 flex items-center gap-2">
              <MapPin size={14} />
              {item.destination}
            </div>

            <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
              <Clock size={14} />
              ETA: {item.eta}
            </div>

            {/* PROGRESS */}
            <div className="mt-4">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                <span>Progress</span>
                <span>{item.progress}%</span>
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="mt-10 text-center text-gray-500">
          No deliveries found
        </div>
      )}

    </main>
  );
}