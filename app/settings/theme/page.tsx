"use client";

import { useEffect, useState } from "react";

import {
  Moon,
  Sun,
  Sparkles,
  Rocket,
  ShieldCheck,
  Palette,
  Zap,
  Menu,
  X,
  Play,
  ArrowRight,
  CheckCircle2,
  Globe,
  Layers3,
  Cpu,
  Bell,
  Star,
  BarChart3,
  Code2,
} from "lucide-react";

type ThemeType = "cyan" | "pink" | "green" | "orange";

type ThemeConfig = {
  gradient: string;
  glow: string;
  button: string;
  border: string;
};

type FeatureItem = {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
};

export default function TestPage() {
  const [darkMode, setDarkMode] = useState(true);

  const [theme, setTheme] =
    useState<ThemeType>("cyan");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [notification, setNotification] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior =
      "smooth";
  }, []);

  const themes: Record<
    ThemeType,
    ThemeConfig
  > = {
    cyan: {
      gradient:
        "from-cyan-400 via-blue-500 to-purple-600",
      glow: "bg-cyan-500/20",
      button: "from-cyan-500 to-blue-600",
      border: "border-cyan-400/30",
    },

    pink: {
      gradient:
        "from-pink-400 via-rose-500 to-red-500",
      glow: "bg-pink-500/20",
      button: "from-pink-500 to-rose-600",
      border: "border-pink-400/30",
    },

    green: {
      gradient:
        "from-green-400 via-emerald-500 to-teal-600",
      glow: "bg-green-500/20",
      button: "from-green-500 to-emerald-600",
      border: "border-green-400/30",
    },

    orange: {
      gradient:
        "from-orange-400 via-amber-500 to-yellow-500",
      glow: "bg-orange-500/20",
      button: "from-orange-500 to-amber-600",
      border: "border-orange-400/30",
    },
  };

  const featureData: FeatureItem[] = [
    {
      icon: Rocket,
      title: "Ultra Performance",
      desc: "Blazing fast modern interface with optimized architecture.",
      color: "text-cyan-400",
    },

    {
      icon: ShieldCheck,
      title: "Secure Security",
      desc: "Advanced premium protection with scalable modern system.",
      color: "text-purple-400",
    },

    {
      icon: Palette,
      title: "Luxury Themes",
      desc: "Beautiful VIP themes with smooth transition effects.",
      color: "text-pink-400",
    },

    {
      icon: Globe,
      title: "Responsive Design",
      desc: "Perfect layout for mobile, tablet and desktop devices.",
      color: "text-green-400",
    },

    {
      icon: Layers3,
      title: "Modern Components",
      desc: "Reusable premium quality frontend components.",
      color: "text-orange-400",
    },

    {
      icon: Cpu,
      title: "Advanced Experience",
      desc: "Powerful frontend structure with premium interface.",
      color: "text-yellow-400",
    },
  ];

  const statsData = [
    {
      number: "100+",
      label: "Premium Components",
    },

    {
      number: "50+",
      label: "Luxury Themes",
    },

    {
      number: "99%",
      label: "Performance",
    },

    {
      number: "24/7",
      label: "Support",
    },
  ];

  // Get Started
  const handleGetStarted = () => {
    setLoading(true);

    const section =
      document.getElementById("features");

    setTimeout(() => {
      setLoading(false);

      setNotification(true);

      setTimeout(() => {
        setNotification(false);
      }, 3000);

      section?.scrollIntoView({
        behavior: "smooth",
      });
    }, 1200);
  };

  // Preview
  const handleLivePreview = () => {
    window.open(
      "https://nextjs.org",
      "_blank"
    );
  };

  // Close Mobile Menu
  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  return (
    <div
      className={`relative overflow-hidden min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-[#030712] text-white"
          : "bg-[#f5f7fb] text-black"
      }`}
    >
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] animate-bounce">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500 text-white shadow-2xl">
            <Bell size={20} />

            <span className="font-semibold">
              VIP Interface Activated 🚀
            </span>
          </div>
        </div>
      )}

      {/* Background Glow */}
      <div
        className={`absolute top-[-120px] left-[-120px] w-[320px] h-[320px] rounded-full blur-[120px] ${themes[theme].glow} animate-pulse`}
      />

      <div
        className={`absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full blur-[120px] ${themes[theme].glow} animate-pulse`}
      />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/10 bg-black/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-2xl bg-gradient-to-r ${themes[theme].gradient}`}
            >
              <Sparkles size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                VIP UI
              </h1>

              <p className="text-xs text-gray-400">
                Advanced Interface
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            {[
              "Home",
              "Features",
              "Dashboard",
              "Stats",
              "About",
            ].map((item) => (
              <a
                key={item}
                href={`#${
                  item === "Home"
                    ? ""
                    : item.toLowerCase()
                }`}
                className="hover:text-cyan-400 transition"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Theme Switch */}
            <div className="hidden md:flex items-center gap-2">
              {(
                Object.keys(
                  themes
                ) as ThemeType[]
              ).map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setTheme(item)
                  }
                  aria-label={item}
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${
                    themes[item].gradient
                  } border-2 ${
                    theme === item
                      ? "border-white scale-110"
                      : "border-transparent"
                  } transition-all duration-300`}
                />
              ))}
            </div>

            {/* Dark Mode */}
            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="md:hidden p-3 rounded-full bg-white/10"
            >
              {mobileMenu ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4">
            {[
              "Home",
              "Features",
              "Dashboard",
              "Stats",
              "About",
            ].map((item) => (
              <a
                key={item}
                onClick={closeMobileMenu}
                href={`#${
                  item === "Home"
                    ? ""
                    : item.toLowerCase()
                }`}
                className="hover:text-cyan-400 transition"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-10 py-28">
        <div className="max-w-7xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
            <Zap
              className="text-yellow-400"
              size={18}
            />

            <span className="text-sm font-semibold">
              100% Advanced Premium Interface
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
            Create Amazing
            <br />

            <span
              className={`bg-gradient-to-r ${themes[theme].gradient} bg-clip-text text-transparent`}
            >
              VIP Future UI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto">
            Beautiful premium landing page
            with advanced animation,
            responsive layout and modern
            frontend experience.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-5">

            <button
              disabled={loading}
              onClick={handleGetStarted}
              className={`px-8 py-4 rounded-2xl font-bold bg-gradient-to-r ${themes[theme].button} shadow-2xl hover:scale-105 disabled:opacity-50 transition-all duration-300 flex items-center gap-2`}
            >
              {loading
                ? "Loading..."
                : "Get Started"}

              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleLivePreview}
              className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <Play size={18} />

              Live Preview
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}