"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CommandStatus = "Active" | "Training" | "Disabled";
type StatusFilter = "All" | CommandStatus;
type ThemeMode = "light" | "dark";
type VPTheme = "Executive" | "Aurora" | "Cyber" | "Minimal";

interface VoiceCommand {
  _id: string;
  command: string;
  response: string;
  module: string;
  aiModel: string;
  status: CommandStatus;
  accuracy: number;
  executions: number;
  createdAt: string;
  language?: string;
  role?: string;
  automation?: boolean;
  features?: string[];
  voiceRecognition?: boolean;
  liveAIChat?: boolean;
  gptVoiceCommand?: boolean;
  multiLanguageVoice?: boolean;
  realtimeAnalytics?: boolean;
  voiceAuthentication?: boolean;
  aiAssistantAvatar?: boolean;
  websocketLiveUpdates?: boolean;
  mongodbStorage?: boolean;
  rolePermissionSystem?: boolean;
  aiAutomationWorkflow?: boolean;
  voicePayrollControl?: boolean;
  voiceInventoryControl?: boolean;
  aiMeetingAssistant?: boolean;
  aiERPCopilot?: boolean;
}

interface Analytics {
  totalCommands: number;
  activeUsers: number;
  aiRequests: number;
  automationTasks: number;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface NewCommandState {
  command: string;
  response: string;
  module: string;
  aiModel: string;
  language: string;
  role: string;
  automation: boolean;
}

const API_ENDPOINT = "/api/next-gen/ai-voice-erp";

const defaultNewCommand: NewCommandState = {
  command: "",
  response: "",
  module: "ERP Core",
  aiModel: "GPT-5",
  language: "English",
  role: "Admin",
  automation: true,
};

const statusOptions: StatusFilter[] = ["All", "Active", "Training", "Disabled"];

const vpThemes: Record<
  VPTheme,
  {
    label: string;
    shell: string;
    hero: string;
    accent: string;
    button: string;
    panelGlow: string;
  }
> = {
  Executive: {
    label: "Executive VP",
    shell:
      "bg-[radial-gradient(circle_at_top_left,#eef2ff,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff)] dark:bg-[radial-gradient(circle_at_top_left,#1e1b4b,transparent_35%),linear-gradient(135deg,#020617,#0f172a)]",
    hero: "from-indigo-600 via-blue-600 to-slate-900",
    accent: "text-indigo-600 dark:text-indigo-300",
    button: "bg-indigo-600 hover:bg-indigo-700",
    panelGlow: "shadow-indigo-100/70 dark:shadow-indigo-950/30",
  },
  Aurora: {
    label: "Aurora Premium",
    shell:
      "bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_30%),radial-gradient(circle_at_bottom_right,#ddd6fe,transparent_34%),linear-gradient(135deg,#f8fafc,#ecfeff)] dark:bg-[radial-gradient(circle_at_top_left,#064e3b,transparent_32%),radial-gradient(circle_at_bottom_right,#581c87,transparent_35%),linear-gradient(135deg,#020617,#0f172a)]",
    hero: "from-emerald-500 via-cyan-600 to-indigo-700",
    accent: "text-emerald-600 dark:text-emerald-300",
    button: "bg-emerald-600 hover:bg-emerald-700",
    panelGlow: "shadow-emerald-100/70 dark:shadow-emerald-950/30",
  },
  Cyber: {
    label: "Cyber AI",
    shell:
      "bg-[radial-gradient(circle_at_top_right,#cffafe,transparent_30%),linear-gradient(135deg,#f8fafc,#eff6ff)] dark:bg-[radial-gradient(circle_at_top_right,#155e75,transparent_34%),linear-gradient(135deg,#020617,#111827)]",
    hero: "from-cyan-600 via-blue-700 to-black",
    accent: "text-cyan-600 dark:text-cyan-300",
    button: "bg-cyan-600 hover:bg-cyan-700",
    panelGlow: "shadow-cyan-100/70 dark:shadow-cyan-950/30",
  },
  Minimal: {
    label: "Minimal Pro",
    shell:
      "bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] dark:bg-[linear-gradient(135deg,#020617,#0f172a)]",
    hero: "from-slate-900 via-slate-800 to-black",
    accent: "text-slate-900 dark:text-slate-200",
    button: "bg-slate-900 hover:bg-black",
    panelGlow: "shadow-slate-100/70 dark:shadow-slate-950/30",
  },
};

const quickActions = [
  {
    title: "AI Payroll",
    description: "Generate smart payroll automation",
    className: "from-indigo-600 to-blue-600",
  },
  {
    title: "Inventory Sync",
    description: "Sync ERP inventory with AI engine",
    className: "from-emerald-600 to-green-600",
  },
  {
    title: "AI Copilot",
    description: "Launch enterprise AI assistant",
    className: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "Voice Control",
    description: "Activate live voice automation",
    className: "from-orange-500 to-red-500",
  },
];

const activityFeed = [
  {
    color: "bg-green-500",
    title: "AI Voice Payroll Executed",
    description: "Payroll automation completed for 248 employees",
    time: "2 sec ago",
  },
  {
    color: "bg-blue-500",
    title: "AI Inventory Updated",
    description: "1,250 inventory records synchronized with MongoDB",
    time: "1 min ago",
  },
  {
    color: "bg-purple-500",
    title: "GPT-5 AI Copilot Response",
    description: "AI generated ERP operational insights successfully",
    time: "5 min ago",
  },
  {
    color: "bg-red-500",
    title: "Security Authentication Verified",
    description: "Voice authentication validated successfully",
    time: "8 min ago",
  },
];

const performanceItems = [
  { title: "CPU Usage", value: "42%", color: "bg-indigo-600", width: "42%" },
  { title: "AI Processing", value: "96%", color: "bg-green-600", width: "96%" },
  { title: "Memory Usage", value: "68%", color: "bg-yellow-500", width: "68%" },
  { title: "Voice Engine", value: "Stable", color: "bg-purple-600", width: "91%" },
  { title: "API Performance", value: "99ms", color: "bg-blue-600", width: "88%" },
  { title: "Cloud Uptime", value: "99.99%", color: "bg-green-700", width: "99%" },
];

const networkNodes = [
  { title: "USA Datacenter", subtitle: "New York Cloud Region", label: "Latency", value: "21ms" },
  { title: "Europe Node", subtitle: "Frankfurt AI Server", label: "Latency", value: "34ms" },
  { title: "Asia Infrastructure", subtitle: "Singapore AI Cluster", label: "Latency", value: "18ms" },
  { title: "AI Edge Network", subtitle: "Real-time ERP Sync Engine", label: "Uptime", value: "99.99%" },
];

const enterpriseCapabilities = [
  "Voice Recognition",
  "Live AI Chat",
  "GPT Voice Command",
  "Multi-Language Voice",
  "Realtime Analytics",
  "Voice Authentication",
  "AI Assistant Avatar",
  "WebSocket Live Updates",
  "MongoDB Storage",
  "Role Permission System",
  "AI Automation Workflow",
  "Voice Payroll Control",
  "Voice Inventory Control",
  "AI Meeting Assistant",
  "AI ERP Copilot",
];

const cx =
  (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const ProgressBar = memo(function ProgressBar({
  width,
  color,
}: {
  width: string;
  color: string;
}) {
  return (
    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className={cx("h-full rounded-full transition-all duration-700 ease-out", color)}
        style={{ width }}
      />
    </div>
  );
});

function SectionHeader({
  title,
  subtitle,
  badge,
  badgeClassName = "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeClassName?: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>

      {badge && (
        <span className={`${badgeClassName} px-4 py-2 rounded-full text-sm font-bold h-fit`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function WhitePanel({
  children,
  className = "",
  panelGlow = "shadow-slate-100/70 dark:shadow-slate-950/30",
}: {
  children: React.ReactNode;
  className?: string;
  panelGlow?: string;
}) {
  return (
    <section
      className={cx(
        "bg-white/90 dark:bg-slate-900/88 rounded-3xl shadow-lg border border-slate-200/80 dark:border-white/10 p-6 mb-6 backdrop-blur-xl",
        "transition-all duration-300",
        panelGlow,
        className
      )}
    >
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/88 rounded-3xl p-6 shadow border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
      <h2 className="text-gray-500 dark:text-slate-400">{label}</h2>
      <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: CommandStatus }) {
  const color =
    status === "Active"
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
      : status === "Training"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300"
        : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";

  return <span className={`${color} px-3 py-1 rounded-full text-sm font-bold`}>{status}</span>;
}

export default function AIVoiceERPPage() {
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [notification, setNotification] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [creating, setCreating] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [vpTheme, setVpTheme] = useState<VPTheme>("Executive");
  const [showNotifications, setShowNotifications] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [analytics, setAnalytics] = useState<Analytics>({
    totalCommands: 0,
    activeUsers: 0,
    aiRequests: 0,
    automationTasks: 0,
  });

  const [newCommand, setNewCommand] = useState<NewCommandState>(defaultNewCommand);

  const recognitionRef = useRef<any>(null);
  const notificationTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeTheme = vpThemes[vpTheme];

  const showMessage = useCallback((msg: string) => {
    setNotification(msg);

    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = window.setTimeout(() => setNotification(""), 3000);
  }, []);

  const fetchCommands = useCallback(async () => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      const response = await fetch(API_ENDPOINT, {
        cache: "no-store",
        signal: controller.signal,
      });

      const result = await response.json();

      if (result?.success) {
        const safeData: VoiceCommand[] = Array.isArray(result?.data) ? result.data : [];

        setCommands(safeData);
        setAnalytics({
          totalCommands: safeData.length,
          activeUsers: 124,
          aiRequests: 5840,
          automationTasks: 982,
        });
      } else {
        setError(result?.message || "Failed To Fetch");
        setCommands([]);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(err);
        setError("Failed To Fetch Data");
        setCommands([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("ai-erp-theme-mode") as ThemeMode | null;
    const savedVpTheme = window.localStorage.getItem("ai-erp-vp-theme") as VPTheme | null;

    if (savedMode === "light" || savedMode === "dark") setThemeMode(savedMode);
    if (savedVpTheme && vpThemes[savedVpTheme]) setVpTheme(savedVpTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ai-erp-theme-mode", themeMode);
    window.localStorage.setItem("ai-erp-vp-theme", vpTheme);
  }, [themeMode, vpTheme]);

  useEffect(() => {
    fetchCommands();

    const interval = window.setInterval(() => {
      setConnected(true);
    }, 1200);

    return () => {
      window.clearInterval(interval);
      abortRef.current?.abort();

      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fetchCommands]);

  const startVoiceRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showMessage("Speech Recognition Not Supported");
      return;
    }

    if (recognitionRef.current && voiceEnabled) {
      showMessage("Voice Recognition Already Running");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceEnabled(true);
      showMessage("Voice Recognition Started");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }

      setLiveTranscript(transcript);
    };

    recognition.onerror = () => {
      showMessage("Voice Recognition Error");
    };

    recognition.onend = () => {
      setVoiceEnabled(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [showMessage, voiceEnabled]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setVoiceEnabled(false);
      showMessage("Voice Recognition Stopped");
    }
  }, [showMessage]);

  const filteredCommands = useMemo(() => {
    const safeCommands = Array.isArray(commands) ? commands : [];
    let data = [...safeCommands];
    const keyword = search.trim().toLowerCase();

    if (keyword) {
      data = data.filter(
        (item) =>
          item.command?.toLowerCase().includes(keyword) ||
          item.module?.toLowerCase().includes(keyword) ||
          item.aiModel?.toLowerCase().includes(keyword) ||
          item.response?.toLowerCase().includes(keyword) ||
          item.language?.toLowerCase().includes(keyword) ||
          item.role?.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    return data;
  }, [commands, search, statusFilter]);

  const commandInsights = useMemo(() => {
    const total = commands.length || 1;
    const active = commands.filter((item) => item.status === "Active").length;
    const training = commands.filter((item) => item.status === "Training").length;
    const disabled = commands.filter((item) => item.status === "Disabled").length;
    const avgAccuracy =
      commands.length > 0
        ? Math.round(
            commands.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / commands.length
          )
        : 0;
    const totalExecutions = commands.reduce((sum, item) => sum + Number(item.executions || 0), 0);

    return {
      active,
      training,
      disabled,
      avgAccuracy,
      totalExecutions,
      activeRate: `${Math.round((active / total) * 100)}%`,
    };
  }, [commands]);

  const createCommand = async () => {
    if (!newCommand.command.trim() || !newCommand.response.trim()) {
      showMessage("Command And Response Required");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCommand),
      });

      const result = await response.json();

      if (result?.success) {
        showMessage("Voice Command Added");
        setShowModal(false);
        setNewCommand(defaultNewCommand);
        fetchCommands();
      } else {
        showMessage(result?.message || "Failed To Create");
      }
    } catch (err) {
      console.error(err);
      showMessage("Failed To Create");
    } finally {
      setCreating(false);
    }
  };

  const deleteCommand = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this voice command?");
    if (!ok) return;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json().catch(() => null);

      if (result?.success === false) {
        showMessage(result?.message || "Delete Failed");
        return;
      }

      showMessage("Deleted Successfully");
      fetchCommands();
    } catch (err) {
      console.error(err);
      showMessage("Delete Failed");
    }
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text },
      {
        sender: "ai",
        text: "AI ERP Assistant Processing Request...",
      },
    ]);

    setChatInput("");
    showMessage("AI Request Sent");
  };

  const runQuickAction = (title: string) => {
    if (title.toLowerCase().includes("voice")) {
      startVoiceRecognition();
      return;
    }

    showMessage(`${title} Action Triggered`);
  };

  const exportCommands = () => {
    const rows = filteredCommands.map((item) => ({
      Command: item.command,
      Response: item.response,
      Module: item.module,
      AIModel: item.aiModel,
      Status: item.status,
      Accuracy: item.accuracy ?? 0,
      Executions: item.executions ?? 0,
      Language: item.language || "English",
      Role: item.role || "Admin",
      Automation: item.automation ? "Enabled" : "Disabled",
    }));

    const csv = [
      Object.keys(rows[0] || { Command: "", Response: "", Module: "" }).join(","),
      ...rows.map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ai-voice-erp-commands.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    showMessage("Commands Exported");
  };

  if (loading) {
    return (
      <main
        className={cx(
          themeMode === "dark" && "dark",
          "min-h-screen flex items-center justify-center p-6",
          activeTheme.shell
        )}
      >
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Loading AI Voice ERP...
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Initializing secure enterprise AI workspace
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cx(
        themeMode === "dark" && "dark",
        "min-h-screen p-4 sm:p-6 transition-colors duration-300",
        activeTheme.shell
      )}
    >
      {notification && (
        <div className="fixed top-5 right-5 bg-black text-white px-6 py-3 rounded-2xl z-50 shadow-xl border border-white/10">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/90 dark:bg-slate-900/88 rounded-3xl shadow-lg p-6 sm:p-8 mb-6 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 px-3 py-1 rounded-full text-xs font-black animate-pulse">
                  2026 AI ERP CORE
                </span>
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-black">
                  {activeTheme.label}
                </span>
                <span className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                  Backward Compatible
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                AI Voice ERP
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-2">
                Enterprise AI Voice Automation System
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={startVoiceRecognition}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02]"
              >
                {voiceEnabled ? "Listening..." : "Start Voice"}
              </button>

              <button
                onClick={stopVoiceRecognition}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02]"
              >
                Stop
              </button>

              <button
                onClick={() => setShowModal(true)}
                className={`${activeTheme.button} text-white px-5 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02]`}
              >
                Add Command
              </button>

              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-5 py-3 rounded-2xl font-bold transition-all"
              >
                Alerts
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={vpTheme}
              onChange={(e) => setVpTheme(e.target.value as VPTheme)}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none"
              aria-label="Premium VP Theme"
            >
              {(Object.keys(vpThemes) as VPTheme[]).map((theme) => (
                <option key={theme} value={theme}>
                  {vpThemes[theme].label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 font-bold"
            >
              {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={() => setCompactMode((prev) => !prev)}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 font-bold"
            >
              {compactMode ? "Comfort View" : "Compact View"}
            </button>

            <button
              onClick={exportCommands}
              className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 font-bold"
            >
              Export CSV
            </button>
          </div>
        </div>

        {showNotifications && (
          <WhitePanel panelGlow={activeTheme.panelGlow}>
            <SectionHeader
              title="Smart Notification Center"
              subtitle="AI risk, automation, security and workflow notifications"
              badge="Priority Queue"
              badgeClassName="bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["Security", "Voice authentication policy synchronized.", "High"],
                ["Workflow", "Payroll automation queue optimized for next cycle.", "Medium"],
                ["AI Insight", "Inventory demand forecast improved by 7.8%.", "AI"],
              ].map(([title, desc, tag]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{desc}</p>
                </div>
              ))}
            </div>
          </WhitePanel>
        )}

        {/* TOP STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-5 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-sm opacity-80">Total Revenue</h2>
            <p className="text-4xl font-black mt-3">$284,540</p>
            <div className="mt-4 text-sm">+18.4% This Month</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-sm opacity-80">Pending Orders</h2>
            <p className="text-4xl font-black mt-3">148</p>
            <div className="mt-4 text-sm">Live Processing</div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-sm opacity-80">AI Predictions</h2>
            <p className="text-4xl font-black mt-3">92%</p>
            <div className="mt-4 text-sm">Sales Accuracy</div>
          </div>

          <div className={`md:col-span-4 bg-gradient-to-r ${activeTheme.hero} rounded-3xl p-6 text-white shadow-2xl overflow-hidden relative`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="relative flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black">AI ERP Core System</h2>
                <p className="opacity-80 mt-2">
                  Real-Time AI Automation & Voice Infrastructure
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
                {[
                  ["Live Users", "1,284"],
                  ["API Health", "99.9%"],
                  ["Security Shield", "Protected"],
                  ["Voice AI", "Active"],
                  ["WebSocket", "Live"],
                  ["MongoDB", "Connected"],
                  ["AI Copilot", "Enabled"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                    <p className="text-sm">{label}</p>
                    <h3 className="text-xl font-black">{value}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {[
            ["Total Commands", analytics.totalCommands],
            ["Active Users", analytics.activeUsers],
            ["AI Requests", analytics.aiRequests],
            ["Automation Tasks", analytics.automationTasks],
          ].map(([label, value]) => (
            <MetricCard key={label} label={String(label)} value={value} />
          ))}

          <MetricCard
            label="Socket Status"
            value={
              <span className={connected ? "text-green-600 dark:text-green-300" : "text-red-600"}>
                {connected ? "Connected" : "Offline"}
              </span>
            }
          />
        </div>

        {/* FUTURE READY CONTROL PLANE */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Enterprise AI Control Plane"
            subtitle="Future-ready capability matrix, governance and operational readiness"
            badge="VP Governance Ready"
            badgeClassName="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {enterpriseCapabilities.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4"
                >
                  <div className="w-3 h-3 rounded-full bg-green-500 mb-3" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-6">
              <h3 className="text-2xl font-black">Role Matrix</h3>
              <p className="text-slate-400 mt-2 text-sm">
                Admin, Manager, Operator and Auditor permission layers are preserved and scalable.
              </p>

              <div className="mt-6 space-y-3">
                {["Admin Full Access", "Manager Approvals", "Operator Workflow", "Auditor Readonly"].map(
                  (role) => (
                    <div key={role} className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                      <span className="text-sm font-bold">{role}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </WhitePanel>

        {/* ADVANCED ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {[
            ["Total Revenue", "$284,500", "+18% This Month"],
            ["Total Orders", "14,892", "Live Real-Time Orders"],
            ["AI Automation Tasks", "98.2%", "Enterprise Optimized"],
            ["AI Voice Accuracy", "99.4%", "GPT-5 Enterprise Optimized"],
          ].map(([title, value, desc]) => (
            <div
              key={title}
              className="bg-white/90 dark:bg-slate-900/88 rounded-3xl p-6 shadow-lg border border-slate-200/80 dark:border-white/10 backdrop-blur-xl"
            >
              <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
              <h2 className="text-4xl font-black mt-2 text-slate-900 dark:text-white">{value}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">{desc}</p>
            </div>
          ))}
        </div>

        {/* LIVE ACTIVITY */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Live AI Activity Feed"
            subtitle="Real-time AI ERP system events & automation logs"
            badge="LIVE"
            badgeClassName="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 animate-pulse"
          />

          <div className="space-y-4">
            {activityFeed.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                <div className={`w-3 h-3 rounded-full ${item.color} mt-2`} />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{item.description}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* HEALTH MONITOR */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="AI System Health Monitor"
            subtitle="Real-time infrastructure & AI engine performance"
            badge="All Systems Operational"
            badgeClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              ["CPU Usage", "28%", "bg-green-500", "28%"],
              ["AI Processing", "94%", "bg-indigo-600", "94%"],
              ["MongoDB Sync", "99%", "bg-blue-600", "99%"],
              ["Voice Engine", "Stable", "bg-purple-600", "97%"],
            ].map(([title, value, color, width]) => (
              <div key={title} className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-slate-50 dark:bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                  <span className="font-black text-slate-800 dark:text-white">{value}</span>
                </div>
                <ProgressBar width={width} color={color} />
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* ENTERPRISE QUICK ACTIONS */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Enterprise AI Quick Actions"
            subtitle="AI powered ERP operations & automation controls"
            badge="GPT-5 Enterprise"
            badgeClassName="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => runQuickAction(action.title)}
                className={`bg-gradient-to-r ${action.className} text-white rounded-2xl p-6 text-left hover:scale-[1.02] transition-all shadow-lg`}
              >
                <h3 className="text-xl font-black">{action.title}</h3>
                <p className="text-sm opacity-80 mt-2">{action.description}</p>
              </button>
            ))}
          </div>
        </WhitePanel>

        {/* COMMAND INTELLIGENCE */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Voice Command Intelligence"
            subtitle="Operational command quality, usage and status insights"
            badge={`Active Rate ${commandInsights.activeRate}`}
            badgeClassName="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              ["Active", commandInsights.active],
              ["Training", commandInsights.training],
              ["Disabled", commandInsights.disabled],
              ["Avg Accuracy", `${commandInsights.avgAccuracy}%`],
              ["Executions", commandInsights.totalExecutions],
              ["Filtered", filteredCommands.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{value}</h3>
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* REVENUE / TEAM / SECURITY */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <WhitePanel className="xl:col-span-2 mb-0" panelGlow={activeTheme.panelGlow}>
            <SectionHeader
              title="Revenue Performance"
              subtitle="AI-driven e-commerce revenue analytics"
              badge="+24.8%"
            />

            <div className="space-y-6">
              {[
                ["Monthly Revenue", "$284,500", "bg-indigo-600", "82%"],
                ["AI Automation Efficiency", "98.2%", "bg-emerald-600", "98%"],
                ["Customer Satisfaction", "96.4%", "bg-purple-600", "96%"],
              ].map(([label, value, color, width]) => (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                    <span className="font-black text-slate-800 dark:text-white">{value}</span>
                  </div>
                  <ProgressBar width={width} color={color} />
                </div>
              ))}
            </div>
          </WhitePanel>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-black">AI Sales Target</h2>
            <p className="opacity-70 mt-2">Enterprise revenue growth tracking</p>

            <div className="mt-10 flex items-center justify-center">
              <div className="w-44 h-44 rounded-full border-[12px] border-indigo-500 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-5xl font-black">82%</h3>
                  <p className="text-sm opacity-70 mt-2">Target Completed</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white/10 rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <span>Remaining Goal</span>
                <span className="font-bold">$62K</span>
              </div>
              <ProgressBar width="82%" color="bg-indigo-400" />
            </div>
          </div>
        </div>

        {/* TEAM + SECURITY + CLOUD */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <WhitePanel className="xl:col-span-2 mb-0" panelGlow={activeTheme.panelGlow}>
            <SectionHeader
              title="AI Team Performance"
              subtitle="Live enterprise workforce productivity analytics"
              badge="Productivity +18%"
            />

            <div className="space-y-5">
              {[
                ["Payroll Department", "AI payroll automation efficiency", "96%", "bg-indigo-600"],
                ["Inventory Management", "Smart inventory AI processing", "92%", "bg-emerald-600"],
                ["AI Customer Support", "GPT-5 enterprise support optimization", "98%", "bg-purple-600"],
              ].map(([title, desc, value, color]) => (
                <div key={title} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">{value}</span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar width={value} color={color} />
                  </div>
                </div>
              ))}
            </div>
          </WhitePanel>

          <WhitePanel className="mb-0" panelGlow={activeTheme.panelGlow}>
            <SectionHeader
              title="Staff Status"
              subtitle="Live employee monitoring"
              badge="248 Online"
              badgeClassName="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
            />

            <div className="space-y-4">
              {[
                ["HR Department", "AI Connected", "Active", "bg-green-500"],
                ["Accounts Team", "Voice Automation Enabled", "Running", "bg-indigo-500"],
                ["AI Support Desk", "GPT-5 Live Assistant", "Online", "bg-purple-500"],
              ].map(([title, desc, status, color]) => (
                <div key={title} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                  <span className="font-black text-slate-700 dark:text-slate-200">{status}</span>
                </div>
              ))}
            </div>
          </WhitePanel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <WhitePanel className="xl:col-span-2 mb-0" panelGlow={activeTheme.panelGlow}>
            <SectionHeader
              title="AI Security Center"
              subtitle="Enterprise protection & live threat monitoring"
              badge="Protected"
            />

            <div className="space-y-5">
              {[
                ["Firewall Security", "AI firewall protection status", "99.9%", "bg-green-600", "99%"],
                ["Voice Authentication", "Biometric voice verification system", "Active", "bg-indigo-600", "96%"],
                ["AI Threat Detection", "Smart anomaly & threat analysis engine", "Monitoring", "bg-red-500", "91%"],
              ].map(([title, desc, value, color, width]) => (
                <div key={title} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">{value}</span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar width={width} color={color} />
                  </div>
                </div>
              ))}
            </div>
          </WhitePanel>

          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-2xl font-black">Security Logs</h2>
            <p className="opacity-70 mt-1">Real-time protection events</p>

            <div className="space-y-4 mt-6">
              {[
                "Unauthorized Access Blocked",
                "Voice Authentication Verified",
                "MongoDB Backup Completed",
              ].map((title, index) => (
                <div key={title} className="border border-white/10 rounded-2xl p-4 bg-white/5">
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm opacity-70 mt-1">
                    AI security event processed successfully.
                  </p>
                  <span className="text-xs opacity-50 mt-3 block">
                    {index === 0 ? "12 sec ago" : `${index + 1} min ago`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="AI Cloud Infrastructure"
            subtitle="Enterprise distributed cloud & backup architecture"
            badge="Multi Cloud Active"
            badgeClassName="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
          />

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              ["AWS Infrastructure", "Online", "Global AI server deployment operational", "bg-green-600", "97%"],
              ["MongoDB Cluster", "Synced", "Distributed database replication active", "bg-indigo-600", "99%"],
              ["AI Backup Engine", "Running", "Autonomous cloud backup automation enabled", "bg-purple-600", "94%"],
              ["CDN Network", "Optimized", "Global content delivery acceleration active", "bg-orange-500", "96%"],
            ].map(([title, status, desc, color, width]) => (
              <div key={title} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                  <span className="text-green-600 dark:text-green-300 font-black">{status}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{desc}</p>
                <div className="mt-5">
                  <ProgressBar width={width} color={color} />
                </div>
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* TRANSACTIONS */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Live Revenue Transactions"
            subtitle="Real-time AI powered order & payment monitoring"
            badge="Live Transactions"
            badgeClassName="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 animate-pulse"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                  {["Transaction ID", "Customer", "Payment", "Status", "AI Risk"].map((head) => (
                    <th key={head} className="pb-4 font-black text-slate-700 dark:text-slate-200">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {[
                  ["#TXN-2026-001", "Olivia Johnson", "$4,850", "Completed", "Safe"],
                  ["#TXN-2026-002", "Ethan Walker", "$12,400", "Pending", "Verified"],
                  ["#TXN-2026-003", "Sophia Martinez", "$8,920", "Completed", "Medium"],
                ].map(([id, customer, payment, status, risk]) => (
                  <tr key={id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <td className="py-5 font-semibold text-slate-800 dark:text-slate-100">{id}</td>
                    <td className="py-5 text-slate-700 dark:text-slate-300">{customer}</td>
                    <td className="py-5 font-black text-emerald-600 dark:text-emerald-300">{payment}</td>
                    <td className="py-5">
                      <span className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                        {status}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                        {risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WhitePanel>

        {/* REVENUE CHART */}
        <WhitePanel className="p-8" panelGlow={activeTheme.panelGlow}>
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Revenue Analytics</h2>
              <p className="text-gray-500 dark:text-slate-400 mt-2">AI Powered Revenue Monitoring</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {["Monthly", "Weekly", "Daily"].map((btn, index) => (
                <button
                  key={btn}
                  onClick={() => showMessage(`${btn} Analytics Loaded`)}
                  className={`${index === 0 ? `${activeTheme.button} text-white` : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"} px-5 py-2 rounded-2xl font-bold`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4 h-72">
            {[
              ["Jan", "45%", "bg-indigo-600"],
              ["Feb", "60%", "bg-blue-600"],
              ["Mar", "70%", "bg-violet-600"],
              ["Apr", "90%", "bg-cyan-600"],
              ["May", "80%", "bg-emerald-600"],
              ["Jun", "95%", "bg-orange-500"],
            ].map(([month, height, color]) => (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div className={`w-full ${color} rounded-t-3xl transition-all duration-700 hover:opacity-80`} style={{ height }} />
                <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">{month}</p>
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* COPILOT */}
        <div className="bg-gradient-to-r from-slate-900 to-black rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 text-white">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-4xl font-black">AI ERP Copilot</h2>
              <p className="text-slate-300 mt-3">
                Smart AI Assistant For Enterprise Automation
              </p>

              <div className="mt-8 space-y-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-sm text-slate-300">AI Suggestion</p>
                  <h3 className="text-xl font-bold mt-1">Inventory Running Low</h3>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-sm text-slate-300">AI Detection</p>
                  <h3 className="text-xl font-bold mt-1">Sales Increased 24%</h3>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="space-y-4 h-72 overflow-y-auto pr-2">
                <div className="bg-indigo-600 rounded-2xl p-4 w-fit max-w-[80%]">
                  Hello Admin 👋
                </div>
                <div className="bg-white/20 rounded-2xl p-4 w-fit max-w-[80%] ml-auto">
                  Show Today Revenue
                </div>
                <div className="bg-indigo-600 rounded-2xl p-4 w-fit max-w-[80%]">
                  Today's Revenue: $24,580
                </div>

                {chatMessages.map((msg, index) => (
                  <div
                    key={`${msg.sender}-${index}`}
                    className={`rounded-2xl p-4 w-fit max-w-[80%] ${
                      msg.sender === "user" ? "bg-white/20 ml-auto" : "bg-indigo-600"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChatMessage();
                  }}
                  placeholder="Ask AI Copilot..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 outline-none text-white placeholder:text-slate-400"
                />

                <button
                  onClick={sendChatMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-2xl font-bold"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <WhitePanel className="p-8" panelGlow={activeTheme.panelGlow}>
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Recent Orders</h2>
              <p className="text-gray-500 dark:text-slate-400 mt-2">Real-Time E-Commerce Transactions</p>
            </div>

            <button
              onClick={() => showMessage("All Orders View Opened")}
              className={`${activeTheme.button} text-white px-6 py-3 rounded-2xl font-bold`}
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  {["Order ID", "Customer", "Product", "Amount", "Status"].map((head) => (
                    <th key={head} className="text-left py-4 px-3 text-slate-800 dark:text-slate-200">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  ["#ERP-2026", "John Carter", "AI Voice System", "$2,450", "Completed"],
                  ["#ERP-2027", "Sarah Wilson", "ERP Automation", "$1,280", "Pending"],
                  ["#ERP-2028", "Michael Lee", "AI Copilot", "$3,920", "Processing"],
                ].map(([id, customer, product, amount, status]) => (
                  <tr key={id} className="border-b border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <td className="py-4 px-3 font-bold text-slate-800 dark:text-slate-100">{id}</td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300">{customer}</td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300">{product}</td>
                    <td className="py-4 px-3 font-bold text-slate-800 dark:text-slate-100">{amount}</td>
                    <td className="py-4 px-3">
                      <span className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WhitePanel>

        {/* SEARCH */}
        <div className="bg-white/90 dark:bg-slate-900/88 rounded-3xl shadow p-6 mb-6 flex flex-col lg:flex-row gap-4 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
          <input
            type="text"
            placeholder="Search Voice Commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500"
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <button
            onClick={fetchCommands}
            className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-2xl px-6 py-4 font-bold"
          >
            Refresh
          </button>
        </div>

        {/* INVENTORY + RECOMMENDATION */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="Smart Inventory Alerts"
            subtitle="AI Powered Inventory Monitoring"
            badge="3 Critical Alerts"
            badgeClassName="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
          />

          <div className="space-y-4">
            {[
              ["AI Voice Device", "Stock Running Low", "4", "Remaining", "red"],
              ["ERP Dashboard License", "Medium Inventory Level", "18", "Remaining", "yellow"],
              ["AI Payroll Package", "Inventory Stable", "84", "Available", "green"],
            ].map(([title, desc, count, label, color]) => (
              <div
                key={title}
                className={`border rounded-2xl p-5 flex items-center justify-between ${
                  color === "red"
                    ? "border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20"
                    : color === "yellow"
                      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/20"
                      : "border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20"
                }`}
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{desc}</p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{count}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </WhitePanel>

        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black">AI Recommendation Engine</h2>
              <p className="text-gray-300 mt-2">
                Smart AI Suggestions Based On User Activities & ERP Analytics
              </p>
            </div>

            <div className="bg-white/10 px-5 py-3 rounded-2xl h-fit">
              <p className="text-sm text-gray-300">AI Confidence</p>
              <h3 className="text-3xl font-black mt-1">97%</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
            {[
              ["AI Payroll Upgrade", "HIGH", "AI detected increased payroll processing activity. Upgrade recommended for automation.", "bg-indigo-600"],
              ["Inventory Optimization", "MEDIUM", "AI predicts low inventory in next 48 hours for top-selling products.", "bg-yellow-500"],
              ["Voice AI Expansion", "AI", "Voice AI engagement increased 68% this week. Multi-language expansion suggested.", "bg-blue-600"],
            ].map(([title, tag, desc, btn]) => (
              <div key={title} className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">{title}</h3>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">{tag}</span>
                </div>

                <p className="text-gray-300 mt-3 text-sm leading-relaxed">{desc}</p>

                <button
                  onClick={() => showMessage(`${title} Applied`)}
                  className={`mt-5 w-full ${btn} hover:opacity-90 transition-all py-3 rounded-2xl font-bold`}
                >
                  Apply Recommendation
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ADVANCED STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            ["AI ENGINE", "Online", "from-indigo-600 to-blue-600"],
            ["SYSTEM HEALTH", "Excellent", "from-green-600 to-emerald-600"],
            ["SERVER LOAD", "Optimized", "from-orange-500 to-red-500"],
          ].map(([label, value, gradient]) => (
            <div key={label} className={`bg-gradient-to-r ${gradient} text-white rounded-3xl p-6 shadow-xl`}>
              <h2 className="text-sm opacity-80">{label}</h2>
              <p className="text-3xl font-black mt-2">{value}</p>
            </div>
          ))}
        </div>

        {/* TRANSCRIPT */}
        {liveTranscript && (
          <div className="bg-black text-green-400 rounded-3xl p-5 mb-6 font-mono shadow-xl border border-green-500/20">
            {liveTranscript}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* LIVE AI CHAT */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Live AI ERP Assistant</h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1">
                GPT Powered Real-Time Business Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-300">AI Online</span>
            </div>
          </div>

          <div className="h-[320px] overflow-y-auto bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                No AI Messages Yet...
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={`${msg.sender}-chat-${index}`}
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white ml-auto"
                      : "bg-white dark:bg-white/10 dark:text-slate-100 shadow border border-slate-100 dark:border-white/10"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mt-5">
            <input
              type="text"
              placeholder="Ask AI About ERP, Sales, Payroll, Inventory..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChatMessage();
              }}
              className="flex-1 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500"
            />

            <button
              onClick={sendChatMessage}
              className={`${activeTheme.button} text-white px-8 py-4 rounded-2xl font-bold transition-all`}
            >
              Send
            </button>
          </div>
        </WhitePanel>

        {/* PERFORMANCE */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="AI System Performance Monitor"
            subtitle="Real-time cloud infrastructure & AI engine performance"
            badge="SYSTEM HEALTHY"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {performanceItems.map((item) => (
              <div key={item.title} className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-white/40 dark:bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 dark:text-slate-400">{item.title}</p>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.value}</span>
                </div>
                <ProgressBar width={item.width} color={item.color} />
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* COLLABORATION */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="AI Team Collaboration Workspace"
            subtitle="Real-time enterprise collaboration & AI workspace management"
            badge="LIVE WORKSPACE"
            badgeClassName="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="border border-slate-200 dark:border-white/10 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Team</h3>
                <span className="text-sm text-green-600 dark:text-green-300 font-bold">24 Online</span>
              </div>

              <div className="space-y-4">
                {[
                  ["AR", "Admin Rahul", "ERP Administrator"],
                  ["AI", "AI Operator", "Automation Manager"],
                  ["WS", "Warehouse Supervisor", "Inventory Control"],
                ].map(([initial, name, role]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center font-black text-indigo-700 dark:text-indigo-300">
                        {initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{name}</h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{role}</p>
                      </div>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 dark:border-white/10 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Live Tasks</h3>
                <span className="text-sm text-indigo-600 dark:text-indigo-300 font-bold">AUTO SYNC</span>
              </div>

              <div className="space-y-5">
                {[
                  ["Payroll Automation", "92%", "bg-indigo-600"],
                  ["Inventory AI Sync", "86%", "bg-green-600"],
                  ["Voice Recognition Training", "74%", "bg-yellow-500"],
                ].map(([task, value, color]) => (
                  <div key={task}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{task}</p>
                      <span className="text-sm text-gray-500 dark:text-slate-400">{value}</span>
                    </div>
                    <ProgressBar width={value} color={color} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 dark:border-white/10 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Meeting Feed</h3>
                <span className="text-sm text-purple-600 dark:text-purple-300 font-bold">LIVE TRANSCRIPT</span>
              </div>

              <div className="space-y-4">
                {[
                  "ERP Strategy Meeting",
                  "Warehouse Sync Call",
                  "Security Review Session",
                ].map((meeting) => (
                  <div key={meeting} className="bg-slate-100 dark:bg-white/5 rounded-2xl p-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">{meeting}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      AI generated summary & automation planning synced.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WhitePanel>

        {/* GLOBAL NETWORK */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <SectionHeader
            title="AI Global ERP Network"
            subtitle="Worldwide AI cloud infrastructure & enterprise network monitoring"
            badge="GLOBAL ONLINE"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {networkNodes.map((node) => (
              <div key={node.title} className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-white/40 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 dark:text-white">{node.title}</h3>
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                <p className="text-sm text-gray-500 dark:text-slate-400 mt-3">{node.subtitle}</p>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{node.label}</p>
                  <h2 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">{node.value}</h2>
                </div>
              </div>
            ))}
          </div>
        </WhitePanel>

        {/* AI QUICK ACTIONS */}
        <WhitePanel panelGlow={activeTheme.panelGlow}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">AI Quick Actions</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Enterprise Automation Shortcuts</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Generate Invoice", "bg-indigo-600 hover:bg-indigo-700"],
                ["AI Payroll", "bg-green-600 hover:bg-green-700"],
                ["Inventory Sync", "bg-orange-500 hover:bg-orange-600"],
                ["Voice Analytics", "bg-black hover:bg-slate-800"],
              ].map(([label, color]) => (
                <button
                  key={label}
                  onClick={() => runQuickAction(label)}
                  className={`${color} text-white rounded-2xl px-5 py-4 font-bold transition-all`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </WhitePanel>

        {/* COMMANDS */}
        {filteredCommands.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-900/88 rounded-3xl p-10 text-center shadow mb-6 border border-slate-200/80 dark:border-white/10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">No Voice Commands Found</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3">
              Add New AI Voice Commands To Activate ERP Automation
            </p>
          </div>
        ) : (
          <div className={cx("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6", compactMode && "xl:grid-cols-4 gap-4")}>
            {filteredCommands.map((item) => (
              <div
                key={item._id}
                className="bg-white/90 dark:bg-slate-900/88 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-white/10 hover:shadow-2xl transition-all duration-300 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{item.command}</h2>
                  <StatusPill status={item.status} />
                </div>

                <p className="text-gray-600 dark:text-slate-400 mb-3">{item.response}</p>

                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>Module:</strong> {item.module}
                  </p>

                  <p>
                    <strong>AI Model:</strong> {item.aiModel}
                  </p>

                  <p>
                    <strong>Accuracy:</strong> {item.accuracy ?? 0}%
                  </p>

                  <p>
                    <strong>Executions:</strong> {item.executions ?? 0}
                  </p>

                  <p>
                    <strong>Language:</strong> {item.language || "English"}
                  </p>

                  <p>
                    <strong>Role:</strong> {item.role || "Admin"}
                  </p>

                  <p>
                    <strong>Automation:</strong> {item.automation ? "Enabled" : "Disabled"}
                  </p>

                  {item.features && item.features.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-bold mb-2 text-slate-900 dark:text-white">AI Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, index) => (
                          <span
                            key={`${feature}-${index}`}
                            className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => showMessage(`${item.command} Launched`)}
                    className={`${activeTheme.button} w-full text-white py-3 rounded-2xl font-bold`}
                  >
                    Launch
                  </button>

                  <button
                    onClick={() => deleteCommand(item._id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD COMMAND MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl p-6 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Add AI Voice Command</h2>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                  Create new ERP voice automation command
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-2 rounded-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Command"
                value={newCommand.command}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, command: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none md:col-span-2"
              />

              <textarea
                placeholder="AI Response"
                value={newCommand.response}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, response: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none md:col-span-2 min-h-[120px]"
              />

              <input
                type="text"
                placeholder="Module"
                value={newCommand.module}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, module: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none"
              />

              <input
                type="text"
                placeholder="AI Model"
                value={newCommand.aiModel}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, aiModel: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none"
              />

              <input
                type="text"
                placeholder="Language"
                value={newCommand.language}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, language: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none"
              />

              <input
                type="text"
                placeholder="Role"
                value={newCommand.role}
                onChange={(e) =>
                  setNewCommand((prev) => ({ ...prev, role: e.target.value }))
                }
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none"
              />

              <label className="md:col-span-2 flex items-center gap-3 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 cursor-pointer text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={newCommand.automation}
                  onChange={(e) =>
                    setNewCommand((prev) => ({
                      ...prev,
                      automation: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />
                <span className="font-bold">Enable AI Automation Workflow</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={createCommand}
                disabled={creating}
                className={`flex-1 ${activeTheme.button} disabled:opacity-60 text-white py-4 rounded-2xl font-bold`}
              >
                {creating ? "Creating..." : "Create Command"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white py-4 rounded-2xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}