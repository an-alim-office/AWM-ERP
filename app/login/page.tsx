"use client";
 
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useCallback,
} from "react";
 
import { useAuth } from "@/hooks/useAuth";
 
type ThemeMode = "dark" | "light";
 
type LoginStep = "credentials" | "otp" | "success";
 
export default function LoginPage() {
  const { sendOtp, verifyOtp, loading } = useAuth();
 
  const [mounted, setMounted] = useState(false);
 
  const [theme, setTheme] = useState<ThemeMode>("dark");
 
  const [step, setStep] = useState<LoginStep>("credentials");
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
 
  const [rememberMe, setRememberMe] = useState(true);
 
  const [showPassword, setShowPassword] = useState(false);
 
  const [trustedDevice, setTrustedDevice] = useState(true);
 
  const [otpCountdown, setOtpCountdown] = useState(60);
 
  const [deviceId, setDeviceId] = useState("");
 
  const [securityScore, setSecurityScore] = useState(92);
 
  // === নতুন: এরর স্টেট, যাতে ব্যাকএন্ড থেকে আসা বার্তা ব্যবহারকারীকে দেখানো যায় ===
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
  const [, startTransition] = useTransition();
 
  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "awm-auth-theme"
    ) as ThemeMode | null;
 
    if (savedTheme) {
      setTheme(savedTheme);
    }
 
    const existingDeviceId = localStorage.getItem("awm-device-id");
 
    if (existingDeviceId) {
      setDeviceId(existingDeviceId);
    } else {
      const generated = crypto.randomUUID();
 
      localStorage.setItem("awm-device-id", generated);
 
      setDeviceId(generated);
    }
 
    setMounted(true);
  }, []);
 
  useEffect(() => {
    localStorage.setItem("awm-auth-theme", theme);
  }, [theme]);
 
  useEffect(() => {
    if (step !== "otp") return;
 
    if (otpCountdown <= 0) return;
 
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
 
    return () => clearInterval(timer);
  }, [step, otpCountdown]);
 
  const isDark = useMemo(() => theme === "dark", [theme]);
 
  const emailValid = /\S+@\S+\.\S+/.test(email);
 
  const passwordValid = password.length >= 6;
 
  const otpValue = otp.join("");
 
  const otpValid = otpValue.length === 6;
 
  const ui = isDark
    ? {
        bg: "bg-[#040816]",
        card: "bg-white/[0.05]",
        border: "border-white/10",
        input:
          "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500",
        text: "text-white",
        muted: "text-slate-400",
        secondary: "text-slate-300",
        surface: "bg-white/[0.03]",
        hover: "hover:bg-white/[0.06]",
      }
    : {
        bg: "bg-[#f4f7fb]",
        card: "bg-white/80",
        border: "border-slate-200",
        input:
          "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
        text: "text-slate-900",
        muted: "text-slate-500",
        secondary: "text-slate-700",
        surface: "bg-slate-50",
        hover: "hover:bg-slate-100",
      };
 
  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      if (!/^\d?$/.test(value)) return;
 
      const updated = [...otp];
 
      updated[index] = value;
 
      setOtp(updated);
 
      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`);
 
        next?.focus();
      }
    },
    [otp]
  );
 
  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`);
 
        prev?.focus();
      }
    },
    [otp]
  );
 
  // === ফিক্স: এখন প্রকৃতপক্ষে ব্যাকএন্ডে OTP পাঠানোর অনুরোধ করা হয় ===
  const handleCredentialSubmit = async () => {
    if (!emailValid || !passwordValid) return;
 
    setErrorMessage(null);
 
    try {
      await sendOtp(email.trim(), password, deviceId);
 
      setStep("otp");
      setOtpCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "OTP পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    }
  };
 
  // === ফিক্স: এখন সঠিকভাবে verifyOtp কল হয়, handleLogin নয় ===
  const handleVerifyOtp = async () => {
    if (!otpValid) return;
 
    setErrorMessage(null);
 
    try {
      await verifyOtp(email.trim(), otpValue, deviceId, trustedDevice);
 
      if (trustedDevice) {
        localStorage.setItem("awm-trusted-device", "true");
      }
 
      setStep("success");
    } catch (error: any) {
      setErrorMessage(
        error?.message || "OTP যাচাই ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    }
  };
 
  // === ফিক্স: Resend বাটন এখন প্রকৃতপক্ষে নতুন OTP অনুরোধ পাঠায় ===
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
 
    setErrorMessage(null);
 
    try {
      await sendOtp(email.trim(), password, deviceId);
 
      setOtpCountdown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (error: any) {
      setErrorMessage(
        error?.message || "OTP পুনরায় পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    }
  };
 
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040816] p-6">
        <div className="w-full max-w-md animate-pulse rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
          <div className="h-10 w-44 rounded-2xl bg-white/10" />
 
          <div className="mt-5 h-4 w-64 rounded-xl bg-white/5" />
 
          <div className="mt-10 space-y-5">
            <div className="h-14 rounded-2xl bg-white/[0.05]" />
 
            <div className="h-14 rounded-2xl bg-white/[0.05]" />
 
            <div className="h-14 rounded-2xl bg-white/[0.05]" />
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <main
      className={`relative flex min-h-screen overflow-hidden transition-all duration-500 ${ui.bg}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
 
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
 
        <div className="absolute left-[35%] top-[25%] h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>
 
      {/* LEFT PANEL */}
      <section className="relative hidden flex-1 overflow-hidden lg:flex">
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-400 backdrop-blur-xl">
              AWM Secure Identity Fabric
            </div>
 
            <div className="mt-10 text-center">
              <h1
                className={`text-4xl font-black leading-[1.05] tracking-tight ${ui.text}`}
              >
                Authentication Platform
              </h1>
 
              <p className={`mt-6 text-base leading-8 ${ui.muted}`}>
                AI-powered device recognition, OTP verification, session
                intelligence and enterprise-grade threat detection system for
                advanced workforce security.
              </p>
            </div>
 
            <div className="mt-10 grid grid-cols-2 gap-5">
              {[
                { label: "Security Layer", value: "AES-256" },
                { label: "Threat Detection", value: "99.9%" },
                { label: "Device Trust", value: "Verified" },
                { label: "Response", value: "34ms" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-[28px] border p-6 backdrop-blur-2xl ${ui.card} ${ui.border}`}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.18em] ${ui.muted}`}
                  >
                    {item.label}
                  </p>
 
                  <h3
                    className={`mt-4 text-3xl font-black tracking-tight ${ui.text}`}
                  >
                    {item.value}
                  </h3>
                </div>
              ))}
            </div>
          </div>
 
          <div className={`rounded-[32px] border p-6 ${ui.card} ${ui.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${ui.muted}`}
                >
                  Device Security Score
                </p>
 
                <h3 className={`mt-3 text-5xl font-black ${ui.text}`}>
                  {securityScore}%
                </h3>
              </div>
 
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
 
                <div className="absolute inset-2 rounded-full border border-cyan-400/30" />
 
                <span className="text-3xl">🛡️</span>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* RIGHT PANEL */}
      <section className="relative z-10 flex w-full items-center justify-center p-4 sm:p-6 lg:max-w-[760px] lg:p-10">
        <div
          className={`w-full max-w-2xl overflow-hidden rounded-[36px] border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${ui.card} ${ui.border}`}
        >
          {/* HEADER */}
          <div
            className={`flex items-center justify-between border-b px-6 py-5 sm:px-8 ${ui.border}`}
          >
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${ui.text}`}>
                {step === "credentials" && "Secure Login"}
 
                {step === "otp" && "OTP Verification"}
 
                {step === "success" && "Access Granted"}
              </h2>
 
              <p className={`mt-1 text-sm ${ui.muted}`}>
                Enterprise identity validation system
              </p>
            </div>
 
            <button
              onClick={() =>
                startTransition(() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                )
              }
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${ui.border} ${ui.surface} ${ui.hover}`}
            >
              <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
            </button>
          </div>
 
          {/* CONTENT */}
          <div className="p-6 sm:p-8">
            {/* STATUS CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { title: "Zero Trust", value: "Enabled", icon: "🛡️" },
                { title: "Device", value: "Recognized", icon: "💻" },
                { title: "MFA", value: "Active", icon: "🔐" },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border p-4 ${ui.surface} ${ui.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-[11px] font-bold uppercase tracking-[0.18em] ${ui.muted}`}
                      >
                        {item.title}
                      </p>
 
                      <h4 className={`mt-3 font-bold ${ui.secondary}`}>
                        {item.value}
                      </h4>
                    </div>
 
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                </div>
              ))}
            </div>
 
            {/* ERROR MESSAGE - নতুন যোগ করা হয়েছে */}
            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-400">
                {errorMessage}
              </div>
            )}
 
            {/* STEP: CREDENTIALS */}
            {step === "credentials" && (
              <div className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${ui.secondary}`}
                  >
                    Enterprise Email
                  </label>
 
                  <input
                    autoComplete="email"
                    spellCheck={false}
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-14 w-full rounded-2xl border px-5 text-sm outline-none transition-all duration-300 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 ${ui.input}`}
                  />
 
                  {!emailValid && email.length > 0 && (
                    <p className="mt-2 text-xs text-rose-400">
                      Invalid enterprise email address
                    </p>
                  )}
                </div>
 
                {/* PASSWORD */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${ui.secondary}`}
                  >
                    Secure Password
                  </label>
 
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`h-14 w-full rounded-2xl border px-5 pr-14 text-sm outline-none transition-all duration-300 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10 ${ui.input}`}
                    />
 
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition-all duration-300 ${ui.hover}`}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
 
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        password.length >= 10
                          ? "w-full bg-emerald-400"
                          : password.length >= 6
                          ? "w-2/3 bg-amber-400"
                          : password.length > 0
                          ? "w-1/3 bg-rose-400"
                          : "w-0"
                      }`}
                    />
                  </div>
                </div>
 
                {/* TRUSTED DEVICE */}
                <div className={`rounded-2xl border p-5 ${ui.surface} ${ui.border}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-xl">
                      💻
                    </div>
 
                    <div className="flex-1">
                      <h4 className={`font-bold ${ui.text}`}>
                        Trusted Device Registration
                      </h4>
 
                      <p className={`mt-1 text-sm leading-6 ${ui.muted}`}>
                        Reduce future verification friction using secure
                        device fingerprinting.
                      </p>
 
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-xs ${ui.muted}`}>
                          Device ID: {deviceId.slice(0, 12)}...
                        </span>
 
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={trustedDevice}
                            onChange={() =>
                              setTrustedDevice((prev) => !prev)
                            }
                            className="peer sr-only"
                          />
 
                          <div
                            className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
                              trustedDevice ? "bg-cyan-500" : "bg-slate-600"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-300 ${
                                trustedDevice ? "left-6" : "left-1"
                              }`}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* OPTIONS */}
                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe((prev) => !prev)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent"
                    />
 
                    <span className={`text-sm font-medium ${ui.secondary}`}>
                      Persistent secure session
                    </span>
                  </label>
 
                  <button
                    type="button"
                    className="text-sm font-semibold text-cyan-400 transition-all hover:text-cyan-300"
                  >
                    Forgot password?
                  </button>
                </div>
 
                {/* LOGIN */}
                <button
                  disabled={loading || !emailValid || !passwordValid}
                  onClick={handleCredentialSubmit}
                  className={`relative mt-2 inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-bold text-white transition-all duration-300 ${
                    loading || !emailValid || !passwordValid
                      ? "cursor-not-allowed bg-slate-700/50 opacity-60"
                      : "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 shadow-2xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98]"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    )}
                    Continue Secure Login →
                  </span>
                </button>
              </div>
            )}
 
            {/* STEP: OTP */}
            {step === "otp" && (
              <div className="space-y-6">
                <div className={`rounded-2xl border p-5 ${ui.surface} ${ui.border}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                      🔐
                    </div>
 
                    <div>
                      <h4 className={`font-bold ${ui.text}`}>
                        Multi-Factor Authentication
                      </h4>
 
                      <p className={`mt-1 text-sm leading-6 ${ui.muted}`}>
                        Enter the 6-digit OTP sent to{" "}
                        <span className="font-semibold text-cyan-400">
                          {email}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
 
                {/* OTP INPUTS */}
                <div className="flex items-center justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(e.target.value, index)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className={`h-16 w-14 rounded-2xl border text-center text-2xl font-black outline-none transition-all duration-300 focus:scale-105 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 ${ui.input}`}
                    />
                  ))}
                </div>
 
                {/* TIMER */}
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${ui.muted}`}>
                    Code expires in{" "}
                    <span className="font-bold text-cyan-400">
                      {otpCountdown}s
                    </span>
                  </p>
 
                  <button
                    disabled={otpCountdown > 0 || loading}
                    onClick={handleResendOtp}
                    className={`text-sm font-semibold transition-all ${
                      otpCountdown > 0 || loading
                        ? "cursor-not-allowed text-slate-500"
                        : "text-cyan-400 hover:text-cyan-300"
                    }`}
                  >
                    Resend OTP
                  </button>
                </div>
 
                {/* VERIFY */}
                <button
                  disabled={!otpValid || loading}
                  onClick={handleVerifyOtp}
                  className={`relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-bold text-white transition-all duration-300 ${
                    !otpValid || loading
                      ? "cursor-not-allowed bg-slate-700/50 opacity-60"
                      : "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98]"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {loading && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    )}
                    Verify & Access Dashboard
                  </span>
                </button>
              </div>
            )}
 
            {/* SUCCESS */}
            {step === "success" && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-5xl">
                  ✅
                </div>
 
                <h3 className={`mt-6 text-3xl font-black ${ui.text}`}>
                  Authentication Successful
                </h3>
 
                <p
                  className={`mx-auto mt-4 max-w-md text-sm leading-7 ${ui.muted}`}
                >
                  Your identity, OTP and trusted device verification
                  completed successfully. Secure session initialized.
                </p>
 
                <div
                  className={`mt-8 rounded-2xl border p-5 text-left ${ui.surface} ${ui.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${ui.muted}`}>
                      Session Security
                    </span>
 
                    <span className="font-bold text-emerald-400">ACTIVE</span>
                  </div>
 
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
                  </div>
                </div>
              </div>
            )}
 
            {/* FOOTER */}
            <div className={`mt-8 border-t pt-6 text-center ${ui.border}`}>
              <p className={`text-xs leading-6 ${ui.muted}`}>
                Enterprise-grade OTP security, device intelligence, behavioral
                verification, encrypted session management and zero-trust
                access architecture.
              </p>
            </div>
          </div>
        </div>
      </section>
 
      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(120, 120, 120, 0.3) transparent;
        }
 
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
 
        *::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.3);
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}