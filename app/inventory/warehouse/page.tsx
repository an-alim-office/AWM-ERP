"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Warehouse,
  Boxes,
  Search,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Layers,
  ScanLine,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  location: string;
  stock: number;
  threshold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export default function WarehousePage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "All" | InventoryItem["status"]
  >("All");

  const [items] = useState<InventoryItem[]>([
    {
      id: "WH-1001",
      name: "Office Chair Premium",
      sku: "OC-8891",
      location: "Aisle 3 - Shelf B",
      stock: 120,
      threshold: 20,
      status: "In Stock",
    },
    {
      id: "WH-1002",
      name: "Laptop Dell i7",
      sku: "DL-7712",
      location: "Aisle 1 - Shelf A",
      stock: 8,
      threshold: 15,
      status: "Low Stock",
    },
    {
      id: "WH-1003",
      name: "Printer Ink Cartridge",
      sku: "INK-5520",
      location: "Aisle 4 - Shelf D",
      stock: 0,
      threshold: 10,
      status: "Out of Stock",
    },
    {
      id: "WH-1004",
      name: "Office Desk",
      sku: "DSK-4401",
      location: "Aisle 2 - Shelf C",
      stock: 45,
      threshold: 10,
      status: "In Stock",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchQuery =
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.sku.toLowerCase().includes(query.toLowerCase()) ||
        i.location.toLowerCase().includes(query.toLowerCase());

      const matchFilter = filter === "All" || i.status === filter;

      return matchQuery && matchFilter;
    });
  }, [query, filter, items]);

  const statusStyle = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
      case "Low Stock":
        return "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";
      case "Out of Stock":
        return "text-red-300 bg-red-500/10 border-red-500/20";
    }
  };

  const stats = useMemo(() => {
    return {
      total: items.length,
      low: items.filter((i) => i.status === "Low Stock").length,
      out: items.filter((i) => i.status === "Out of Stock").length,
    };
  }, [items]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30%),#0b1220] text-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <Warehouse className="text-blue-400" />
          Warehouse Management
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Inventory control, stock tracking & warehouse operations dashboard
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-xs text-gray-400">Total Items</p>
          <p className="text-xl font-black">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-center">
          <p className="text-xs text-yellow-300">Low Stock</p>
          <p className="text-xl font-black text-yellow-300">{stats.low}</p>
        </div>

        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-center">
          <p className="text-xs text-red-300">Out of Stock</p>
          <p className="text-xl font-black text-red-300">{stats.out}</p>
        </div>

      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item, SKU, location..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">

          {(["All", "In Stock", "Low Stock", "Out of Stock"] as const).map(
            (f) => (
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
            )
          )}

        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-black/30 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Location</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">

              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-white/5 transition">

                  <td className="p-4">
                    <div className="font-black text-blue-300 flex items-center gap-2">
                      <Boxes size={14} />
                      {i.name}
                    </div>
                    <div className="text-xs text-gray-500">{i.id}</div>
                  </td>

                  <td className="p-4 text-gray-300">{i.sku}</td>

                  <td className="p-4 flex items-center gap-2 text-gray-300">
                    <MapPin size={14} />
                    {i.location}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-gray-400" />
                      <span className="font-bold">{i.stock}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold ${statusStyle(
                        i.status
                      )}`}
                    >
                      {i.status}
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
          No inventory items found
        </div>
      )}

    </main>
  );
}