"use client";

import React, { useEffect, useMemo, useState, memo, useCallback } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  Sparkles,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const INITIAL_DATA: InventoryItem[] = [
  { id: "INV-001", name: "Raw Steel", category: "Raw Material", stock: 500, status: "In Stock" },
  { id: "INV-002", name: "Aluminium Plate", category: "Raw Material", stock: 12, status: "Low Stock" },
  { id: "INV-003", name: "Finished Product A", category: "Goods", stock: 0, status: "Out of Stock" },
  { id: "INV-004", name: "Copper Wire", category: "Raw Material", stock: 88, status: "In Stock" },
  { id: "INV-005", name: "Packaging Box", category: "Packaging", stock: 34, status: "Low Stock" },
];

type SortKey = "name" | "stock" | "category";

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("stock");
  const [asc, setAsc] = useState(false);

  useEffect(() => setMounted(true), []);

  const categories = useMemo(() => {
    const set = new Set(INITIAL_DATA.map((i) => i.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    let data = [...INITIAL_DATA];

    if (search) {
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      data = data.filter((i) => i.category === category);
    }

    data.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "number" && typeof valB === "number") {
        return asc ? valA - valB : valB - valA;
      }

      return asc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return data;
  }, [search, category, sortKey, asc]);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setAsc((p) => !p);
      else {
        setSortKey(key);
        setAsc(false);
      }
    },
    [sortKey]
  );

  const stats = useMemo(() => {
    return {
      total: INITIAL_DATA.length,
      low: INITIAL_DATA.filter((i) => i.status === "Low Stock").length,
      out: INITIAL_DATA.filter((i) => i.status === "Out of Stock").length,
      ok: INITIAL_DATA.filter((i) => i.status === "In Stock").length,
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white p-6 animate-pulse">
        <div className="h-10 w-64 bg-white/10 rounded-xl mb-6" />
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
            <Sparkles size={14} />
            2026 Inventory Engine
          </div>

          <h1 className="text-3xl md:text-4xl font-black mt-3">
            Inventory Management
          </h1>

          <p className="text-sm text-white/60 mt-2">
            Real-time stock intelligence & warehouse tracking system
          </p>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <Search size={16} className="text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU or item..."
              className="bg-transparent outline-none text-sm w-48 md:w-64"
            />
          </div>

          {/* CATEGORY */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl">
            <Filter size={16} className="text-white/50" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Items" value={stats.total} icon={<Boxes size={18} />} />
        <Stat label="In Stock" value={stats.ok} icon={<CheckCircle2 size={18} />} />
        <Stat label="Low Stock" value={stats.low} icon={<AlertTriangle size={18} />} />
        <Stat label="Out of Stock" value={stats.out} icon={<XCircle size={18} />} />
      </div>

      {/* TABLE */}
      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <Th label="SKU" />
                <Th label="Item" onClick={() => toggleSort("name")} />
                <Th label="Category" onClick={() => toggleSort("category")} />
                <Th label="Stock" onClick={() => toggleSort("stock")} />
                <Th label="Status" />
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <Td className="text-cyan-300 font-bold">{item.id}</Td>
                  <Td>{item.name}</Td>
                  <Td className="text-white/70">{item.category}</Td>
                  <Td className="font-semibold">{item.stock}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-white/50 text-sm">
            No inventory found
          </div>
        )}
      </div>
    </main>
  );
}

/* ========================= UI COMPONENTS ========================= */

const Stat = memo(function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">{label}</p>
        <div className="text-cyan-300">{icon}</div>
      </div>
      <h2 className="text-2xl font-black mt-2">{value}</h2>
    </div>
  );
});

const Th = memo(function Th({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className="text-left p-4 font-semibold cursor-pointer select-none"
    >
      <div className="flex items-center gap-2">
        {label}
        {onClick && <ArrowUpDown size={14} className="text-white/40" />}
      </div>
    </th>
  );
});

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`p-4 ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: InventoryItem["status"] }) {
  const map = {
    "In Stock": "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    "Low Stock": "text-amber-300 bg-amber-500/10 border-amber-500/20",
    "Out of Stock": "text-red-300 bg-red-500/10 border-red-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${map[status]}`}
    >
      {status}
    </span>
  );
}