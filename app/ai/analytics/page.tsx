// app/ai/analytics/page.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BrainCircuit,
  Cpu,
  Database,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  Bell,
  RefreshCw,
  CheckCircle2,
  BarChart3,
  Server,
  Globe,
  ArrowUpRight,
} from "lucide-react";

type AnalyticsCard = {
  title: string;
  value: string;
  growth: string;
  icon: React.ElementType;
  color: string;
};

export default function AnalyticsPage() {
  const [darkMode, setDarkMode] = useState(true);

  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const analyticsData: AnalyticsCard[] = useMemo(
    () => [
      {
        title: "Total Users",
        value: "1,245",
        growth: "+12.5%",
        icon: Users,
        color: "from-cyan-500 to-blue-600",
      },

      {
        title: "AI Accuracy",
        value: "98.9%",
        growth: "+4.3%",
        icon: BrainCircuit,
        color: "from-violet-500 to-purple-600",
      },

      {
        title: "System Load",
        value: "42%",
        growth: "-2.1%",
        icon: Cpu,
        color: "from-orange-500 to-yellow-500",
      },

      {
        title: "Cloud Storage",
        value: "2.8TB",
        growth: "+8.7%",
        icon: Database,
        color: "from-green-500 to-emerald-600",
      },
    ],
    []
  );

  const recentActivities = [
    "AI prediction engine updated successfully.",
    "Database backup completed.",
    "New analytics report generated.",
    "Security monitoring scan finished.",
  ];

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#030712] text-white"
          : "bg-[#f3f7fb] text-black"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-black/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl">
              <Sparkles size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                AI Analytics
              </h1>

              <p className="text-sm text-gray-400">
                Advanced Dashboard System
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {darkMode ? "Light" : "Dark"}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition-all duration-300"
            >
              <RefreshCw size={18} />

              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6">
                <Activity
                  className="text-green-400"
                  size={18}
                />

                <span className="text-sm font-semibold">
                  Live AI Monitoring System
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Advanced AI
                <br />

                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </span>
              </h2>

              <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
                Monitor AI performance, cloud infrastructure,
                real-time analytics, predictive insights and
                premium business intelligence with a modern
                enterprise dashboard experience.
              </p>
            </div>

            {/* Right */}
            <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  System Status
                </h3>

                <Bell className="text-yellow-400" />
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">
                      AI Engine
                    </span>

                    <span className="text-green-400">
                      Online
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[96%] bg-gradient-to-r from-cyan-500 to-blue-600" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">
                      Security Layer
                    </span>

                    <span className="text-green-400">
                      Protected
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[99%] bg-gradient-to-r from-green-500 to-emerald-600" />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <CheckCircle2 className="text-green-400" />

                  <p className="text-sm text-gray-300">
                    Last updated:{" "}
                    {lastUpdated || "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />

          <p className="mt-6 text-lg text-gray-400">
            Loading Premium Analytics...
          </p>
        </div>
      ) : (
        <>
          {/* Analytics Cards */}
          <section className="relative z-10 px-6 md:px-10 pb-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {analyticsData.map((card, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden p-8 rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-2xl hover:scale-105 transition-all duration-500"
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-all duration-500 bg-gradient-to-br ${card.color}`}
                  />

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${card.color} shadow-xl mb-6`}
                  >
                    <card.icon size={30} />
                  </div>

                  <h3 className="text-gray-400 text-sm mb-2">
                    {card.title}
                  </h3>

                  <h2 className="text-4xl font-black mb-3">
                    {card.value}
                  </h2>

                  <div className="flex items-center gap-2 text-green-400">
                    <TrendingUp size={18} />

                    <span className="font-semibold">
                      {card.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dashboard Grid */}
          <section className="relative z-10 px-6 md:px-10 pb-20">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
              {/* Performance */}
              <div className="lg:col-span-2 p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black">
                      AI Performance
                    </h2>

                    <p className="text-gray-400 mt-2">
                      Real-time system analytics overview.
                    </p>
                  </div>

                  <BarChart3
                    className="text-cyan-400"
                    size={40}
                  />
                </div>

                <div className="space-y-6">
                  {[
                    {
                      title: "Prediction Accuracy",
                      value: "95%",
                    },

                    {
                      title: "Cloud Stability",
                      value: "89%",
                    },

                    {
                      title: "Server Response",
                      value: "92%",
                    },

                    {
                      title: "Optimization Rate",
                      value: "98%",
                    },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {item.title}
                        </span>

                        <span className="text-cyan-400">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{
                            width: item.value,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">
                    Recent Activity
                  </h2>

                  <ShieldCheck
                    className="text-green-400"
                    size={32}
                  />
                </div>

                <div className="space-y-5">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <CheckCircle2
                        className="text-green-400 mt-1"
                        size={18}
                      />

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {activity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="relative z-10 px-6 md:px-10 pb-24">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Server,
                  title: "Cloud Server",
                  desc: "Enterprise-grade secure infrastructure.",
                },

                {
                  icon: Globe,
                  title: "Global Network",
                  desc: "Worldwide analytics & AI connectivity.",
                },

                {
                  icon: ArrowUpRight,
                  title: "Growth Tracking",
                  desc: "Advanced AI-powered business growth.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl hover:scale-105 transition-all duration-300"
                >
                  <item.icon
                    className="text-cyan-400 mb-6"
                    size={42}
                  />

                  <h3 className="text-2xl font-bold mb-4">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center">
        <p className="text-gray-500">
          © 2026 AI Analytics Dashboard — Advanced Premium
          Interface
        </p>
      </footer>
    </main>
  );
}