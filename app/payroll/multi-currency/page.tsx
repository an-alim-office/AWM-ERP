"use client";

import React, { useMemo, useState } from "react";

type Currency = {
  code: string;
  name: string;
  balance: number;
  rate: number;
};

const INITIAL_CURRENCIES: Currency[] = [
  { code: "SAR", name: "Saudi Riyal", balance: 150000, rate: 1.0 },
  { code: "USD", name: "US Dollar", balance: 40000, rate: 3.75 },
  { code: "EUR", name: "Euro", balance: 35000, rate: 4.02 },
  { code: "GBP", name: "British Pound", balance: 25000, rate: 4.78 },
];

export default function MultiCurrencyPage() {
  const [currencies] = useState<Currency[]>(INITIAL_CURRENCIES);

  const [from, setFrom] = useState("SAR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fromCurrency = useMemo(
    () => currencies.find((c) => c.code === from),
    [from, currencies]
  );

  const toCurrency = useMemo(
    () => currencies.find((c) => c.code === to),
    [to, currencies]
  );

  const converted = useMemo(() => {
    const amt = Number(amount);
    if (!amt || !fromCurrency || !toCurrency) return 0;

    const inSAR = amt * fromCurrency.rate;
    return inSAR / toCurrency.rate;
  }, [amount, fromCurrency, toCurrency]);

  const totalPortfolio = useMemo(() => {
    return currencies.reduce((acc, c) => acc + c.balance * c.rate, 0);
  }, [currencies]);

  const handleConvert = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setResult(converted);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#070b14] text-white p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Multi-Currency Treasury System
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time FX simulation & global liquidity tracking
        </p>
      </div>

      {/* PORTFOLIO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {currencies.map((c) => (
          <div
            key={c.code}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/40"
          >
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-blue-400">{c.code}</div>
              <div className="text-[10px] text-slate-400">
                Rate {c.rate}
              </div>
            </div>

            <div className="text-xl font-bold mt-2">
              {c.balance.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">{c.name}</div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mb-6 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="text-xs text-slate-400 uppercase">
          Total Portfolio Value (SAR Equivalent)
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          SAR {totalPortfolio.toLocaleString()}
        </div>
      </div>

      {/* EXCHANGE */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-blue-400 mb-4">
          FX Conversion Engine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="p-3 rounded-lg bg-slate-950 border border-slate-800"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                From: {c.code}
              </option>
            ))}
          </select>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="p-3 rounded-lg bg-slate-950 border border-slate-800"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                To: {c.code}
              </option>
            ))}
          </select>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="Amount"
            className="p-3 rounded-lg bg-slate-950 border border-slate-800 outline-none"
          />

          <button
            onClick={handleConvert}
            disabled={loading}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 font-semibold disabled:opacity-50 active:scale-95 transition"
          >
            {loading ? "Converting..." : "Convert"}
          </button>
        </div>

        {/* RESULT */}
        <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40">
          <div className="text-xs text-slate-400 uppercase">Result</div>
          <div className="text-xl font-bold text-cyan-400">
            {result !== null
              ? `${result.toFixed(2)} ${to}`
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}