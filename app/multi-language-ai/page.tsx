"use client";

import React, { useEffect, useMemo, useState } from "react";

type LangOption = {
  label: string;
  value: string;
};

const LANGUAGES: LangOption[] = [
  { value: "en", label: "English (US)" },
  { value: "bn", label: "Bengali (বাংলাদেশ)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "de", label: "German (Deutsch)" },
  { value: "zh", label: "Chinese (简体中文)" },
  { value: "ar", label: "Arabic (العربية)" },
];

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-2/3 bg-slate-700/40 rounded" />
      <div className="h-4 w-full bg-slate-700/40 rounded" />
      <div className="h-4 w-5/6 bg-slate-700/40 rounded" />
      <div className="h-4 w-4/6 bg-slate-700/40 rounded" />
    </div>
  );
}

export default function MultiLanguageAIPage() {
  const [text, setText] = useState<string>("");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<
    { input: string; output: string; lang: string }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("ai-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-theme", theme);
  }, [theme]);

  const selectedLangLabel = useMemo(
    () => LANGUAGES.find((l) => l.value === targetLang)?.label,
    [targetLang]
  );

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const response = await fetch("/api/multi-language-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslatedText(data.translatedText);

        setHistory((prev) => [
          {
            input: text,
            output: data.translatedText,
            lang: targetLang,
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        setError(data.error || "Translation failed");
      }
    } catch {
      setError("Failed to connect to the translation server.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
  };

  const clearAll = () => {
    setText("");
    setTranslatedText("");
    setError("");
  };

  return (
    <div
      className={`flex flex-col h-screen w-full transition-colors duration-300 font-sans p-6 md:p-8 ${
        theme === "dark"
          ? "bg-[#0b1220] text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Multi-Language AI Engine
          </h1>
          <p className="text-sm mt-1 text-slate-400">
            Real-time enterprise translation with contextual intelligence
          </p>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition text-sm"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        {/* INPUT */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-indigo-400">
              Source Input
            </span>

            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:border-red-400 transition"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste enterprise data, contracts, or communication..."
            className="flex-1 w-full resize-none bg-transparent outline-none text-base leading-relaxed placeholder:text-slate-500"
          />

          <div className="mt-3 text-xs text-slate-500 flex justify-between">
            <span>Characters: {text.length}</span>
            <span className="text-slate-400">Auto-context enabled</span>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 gap-3">
            <span className="text-xs uppercase tracking-widest text-emerald-400">
              AI Output
            </span>

            <div className="flex gap-2 items-center">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                onClick={copyToClipboard}
                className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:border-emerald-400 transition"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto text-base leading-relaxed whitespace-pre-wrap">
            {loading ? (
              <Skeleton />
            ) : error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-slate-500 italic">
                Translation will appear here...
              </span>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Target: {selectedLangLabel}
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="mt-5 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="text-xs text-slate-500">
          Enterprise-grade AI translation pipeline
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !text.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
        >
          {loading ? "Processing..." : "Translate Now"}
        </button>
      </div>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="mt-6 border-t border-slate-800 pt-4">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">
            Recent Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/30 text-xs"
              >
                <div className="text-slate-400 mb-1">Lang: {h.lang}</div>
                <div className="text-slate-300 line-clamp-3">
                  {h.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}