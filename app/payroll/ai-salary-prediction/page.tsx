"use client";

import React, { useEffect, useMemo, useState } from "react";

type RoleOption = {
  label: string;
  value: string;
};

type PredictionHistory = {
  role: string;
  experience: number;
  salary: number;
  confidence: number;
  timestamp: number;
};

const ROLES: RoleOption[] = [
  { label: "Software Engineer", value: "software_engineer" },
  { label: "Data Analyst", value: "data_analyst" },
  { label: "Project Manager", value: "project_manager" },
  { label: "DevOps Engineer", value: "devops_engineer" },
  { label: "AI Engineer", value: "ai_engineer" },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-3 w-1/3 bg-slate-700/40 rounded" />
      <div className="h-10 w-2/3 bg-slate-700/40 rounded" />
      <div className="h-3 w-1/2 bg-slate-700/40 rounded" />
    </div>
  );
}

export default function AISalaryPredictionPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState("software_engineer");
  const [experience, setExperience] = useState<string>("");

  const [salary, setSalary] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [history, setHistory] = useState<PredictionHistory[]>([]);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("salary_theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("salary_theme", theme);
  }, [theme]);

  const roleLabel = useMemo(() => {
    return ROLES.find((r) => r.value === role)?.label;
  }, [role]);

  const handlePredict = () => {
    const exp = Number(experience);

    if (!exp || exp < 0) return;

    setLoading(true);
    setSalary(null);
    setConfidence(0);

    setTimeout(() => {
      const base = 12000;
      const multiplier =
        role === "ai_engineer"
          ? 1.8
          : role === "software_engineer"
          ? 1.6
          : role === "devops_engineer"
          ? 1.5
          : role === "project_manager"
          ? 1.4
          : 1.2;

      const computedSalary = Math.round(base + exp * 3200 * multiplier);
      const conf = Math.min(98, 78 + exp * 2 + Math.random() * 6);

      setSalary(computedSalary);
      setConfidence(Number(conf.toFixed(1)));

      setHistory((prev) => [
        {
          role,
          experience: exp,
          salary: computedSalary,
          confidence: conf,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9),
      ]);

      setLoading(false);
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 p-6 md:p-10 ${
        theme === "dark"
          ? "bg-[#070b14] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AI Salary Intelligence Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Predictive workforce compensation analytics (2026 model)
          </p>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2 rounded-xl border border-slate-700 text-xs hover:border-emerald-400 transition"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-5">
            Prediction Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Employee Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">
                Experience (Years)
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
                placeholder="e.g. 5"
              />
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500 font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "Analyzing Workforce Data..." : "Run AI Prediction"}
            </button>
          </div>
        </div>

        {/* RESULT */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
            Predicted Market Salary
          </h3>

          {loading ? (
            <SkeletonCard />
          ) : salary ? (
            <>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                SAR {salary.toLocaleString()}
              </div>

              <div className="mt-4 text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Confidence Score: {confidence}%
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Role: {roleLabel} • Experience: {experience} yrs
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-sm">
              Run prediction to see AI estimation
            </div>
          )}
        </div>
      </div>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
            Prediction History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/30"
              >
                <div className="text-xs text-slate-400">
                  {ROLES.find((r) => r.value === h.role)?.label}
                </div>
                <div className="text-lg font-bold">
                  SAR {h.salary.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  {h.experience} yrs • {h.confidence.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}