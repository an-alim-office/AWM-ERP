"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Boxes,
  Cpu,
  MapPin,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Radio,
  Database,
} from "lucide-react";

type StockItem = {
  id: string;
  name: string;
  location: string;
  qty: number;
  status: "Stable" | "Moving" | "Low" | "Critical";
  lastUpdate: string;
};

export default function LiveStockTrackingPage() {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setOnline((prev) => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const stocks: StockItem[] = useMemo(
    () => [
      {
        id: "STK-001",
        name: "Warehouse A - Electronics",
        location: "Riyadh Central",
        qty: 120,
        status: "Stable",
        lastUpdate: "2 sec ago",
      },
      {
        id: "STK-002",
        name: "Cold Storage - Food",
        location: "North Hub",
        qty: 42,
        status: "Low",
        lastUpdate: "10 sec ago",
      },
      {
        id: "STK-003",
        name: "Pharma Supplies",
        location: "Zone B3",
        qty: 8,
        status: "Critical",
        lastUpdate: "5 sec ago",
      },
      {
        id: "STK-004",
        name: "Auto Parts Unit",
        location: "Warehouse C",
        qty: 78,
        status: "Moving",
        lastUpdate: "1 sec ago",
      },
    ],
    []
  );

  const statusStyle = (status: StockItem["status"]) => {
    switch (status) {
      case "Stable":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "Moving":
        return "text-blue-300 bg-blue-500/10 border-blue-500/20";
      case "Low":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
      case "Critical":
        return "text-red-300 bg-red-500/10 border-red-500/20";
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <Boxes className="text-cyan-400" />
          Live Stock Tracking System
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Real-time warehouse IoT inventory monitoring & movement intelligence
        </p>
      </div>

      {/* STATUS BAR */}
      <div className="flex flex-wrap gap-3 mb-6">

        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm">
          <Radio size={16} />
          Sensor Stream: {online ? "Active" : "Reconnecting"}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm">
          <Cpu size={16} />
          IoT Nodes: 24 Online
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm">
          <Database size={16} />
          Sync: Real-time
        </div>

      </div>

      {/* GRID */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {stocks.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:-translate-y-1 transition"
          >

            <div className="flex items-start justify-between">

              <div>
                <h2 className="font-black text-lg flex items-center gap-2">
                  <Activity size={16} />
                  {item.name}
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
              {item.location}
            </div>

            <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
              <TrendingUp size={14} />
              Quantity: {item.qty} units
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Last Update: {item.lastUpdate}
            </div>

          </div>
        ))}

      </div>

      {/* FOOTER STATUS */}
      <div className="mt-10 text-center text-xs text-gray-500">
        Live IoT Warehouse Tracking • AI Sync Enabled
      </div>

    </main>
  );
}