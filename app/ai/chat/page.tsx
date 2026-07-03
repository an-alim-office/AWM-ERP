"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  ArrowUp,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Command,
  Copy,
  Cpu,
  Database,
  Globe,
  Loader2,
  Mic,
  MoonStar,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stars,
  SunMedium,
  Trash2,
  TriangleAlert,
  WandSparkles,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ThemeMode = "dark" | "light";

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

type SuggestionType = {
  id: number;
  label: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const SUGGESTIONS: SuggestionType[] = [
  {
    id: 1,
    label:
      "Generate enterprise sales forecast",
  },
  {
    id: 2,
    label:
      "Analyze workforce performance trends",
  },
  {
    id: 3,
    label:
      "Build AI automation workflow",
  },
  {
    id: 4,
    label:
      "Create executive business summary",
  },
];

const STORAGE_KEY =
  "awm-synapse-ai-chat-history";

/* =========================================================
   PAGE
========================================================= */

export default function AIChatPage() {
  const [message, setMessage] =
    useState<string>("");

  const [messages, setMessages] =
    useState<MessageType[]>([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [theme, setTheme] =
    useState<ThemeMode>("dark");

  const [typingText, setTypingText] =
    useState<string>("");

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================================
     THEME
  ========================================================= */

  const isDark = theme === "dark";

  /* =========================================================
     LOAD STORAGE
  ========================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  /* =========================================================
     SAVE STORAGE
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );
  }, [messages]);

  /* =========================================================
     AUTO RESIZE
  ========================================================= */

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height =
      "auto";

    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      220
    )}px`;
  }, [message]);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top:
        scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingText]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage =
    useCallback(async () => {
      if (
        !message.trim() ||
        isLoading
      )
        return;

      setError("");
      setTypingText("");

      const userMessage: MessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content: message.trim(),
        createdAt: Date.now(),
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      const currentMessage = message;

      setMessage("");
      setIsLoading(true);

      try {
        const res = await fetch(
          "/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message:
                currentMessage,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            "AI response failed. Please retry."
          );
        }

        const data =
          await res.json();

        const replyText =
          data?.reply ||
          "No response generated.";

        let current = "";

        for (
          let i = 0;
          i < replyText.length;
          i++
        ) {
          current += replyText[i];

          setTypingText(current);

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                8
              )
          );
        }

        const aiMessage: MessageType = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: replyText,
          createdAt: Date.now(),
        };

        setMessages((prev) => [
          ...prev,
          aiMessage,
        ]);

        setTypingText("");
      } catch (err: any) {
        setError(
          err?.message ||
            "Something went wrong."
        );
      } finally {
        setIsLoading(false);
      }
    }, [isLoading, message]);

  /* =========================================================
     KEYDOWN
  ========================================================= */

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  const clearChat = () => {
    setMessages([]);
    setTypingText("");
    setError("");

    localStorage.removeItem(
      STORAGE_KEY
    );
  };

  /* =========================================================
     COPY
  ========================================================= */

  const copyMessage = async (
    text: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================================================
     STATS
  ========================================================= */

  const totalMessages = useMemo(
    () => messages.length,
    [messages]
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className={`min-h-screen overflow-hidden transition-all duration-500 ${
        isDark
          ? "bg-[#020617] text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-15%] right-[-5%] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`hidden xl:flex w-[320px] flex-col border-r backdrop-blur-2xl ${
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-slate-200 bg-white/70"
          }`}
        >
          <div className="border-b border-inherit p-7">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-2xl shadow-cyan-500/20">
                <BrainCircuit
                  className="text-white"
                  size={32}
                />

                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400">
                  <CheckCircle2
                    size={12}
                    className="text-black"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  AWM SYNAPSE AI
                </h1>

                <p
                  className={`mt-1 text-sm ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Enterprise Intelligence
                  System
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <SidebarCard
              isDark={isDark}
              icon={<Cpu size={20} />}
              title="Neural Processing"
              value="98.7%"
              subtitle="AI core stability"
            />

            <SidebarCard
              isDark={isDark}
              icon={<ShieldCheck size={20} />}
              title="Security Layer"
              value="Protected"
              subtitle="Enterprise encrypted"
            />

            <SidebarCard
              isDark={isDark}
              icon={<Database size={20} />}
              title="Data Pipeline"
              value="Realtime"
              subtitle="Ultra-low latency"
            />

            <div
              className={`rounded-3xl border p-5 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-black">
                    Smart Actions
                  </h3>

                  <p
                    className={`mt-1 text-xs ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    AI quick commands
                  </p>
                </div>

                <Command
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <div className="space-y-3">
                {SUGGESTIONS.map(
                  (item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setMessage(
                          item.label
                        )
                      }
                      className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isDark
                          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                          <Sparkles
                            size={15}
                          />
                        </div>

                        <span className="text-sm font-medium leading-relaxed">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-inherit p-6">
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  AI Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-sm font-semibold">
                    Online & Adaptive
                  </span>
                </div>
              </div>

              <Activity className="text-emerald-400" />
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="flex min-h-screen flex-1 flex-col">
          {/* =====================================================
              HEADER
          ===================================================== */}

          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-2xl ${
              isDark
                ? "border-white/10 bg-[#020617]/70"
                : "border-slate-200 bg-slate-100/70"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-400">
                  <Stars size={14} />

                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Autonomous Intelligence
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  Enterprise AI Workspace
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setTheme(
                      isDark
                        ? "light"
                        : "dark"
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                    isDark
                      ? "border border-white/10 bg-white/[0.05] hover:bg-white/[0.1]"
                      : "border border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  {isDark ? (
                    <SunMedium
                      size={18}
                    />
                  ) : (
                    <MoonStar
                      size={18}
                    />
                  )}

                  {isDark
                    ? "Light"
                    : "Dark"}
                </button>

                <button
                  onClick={clearChat}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-rose-600"
                >
                  <Trash2 size={18} />
                  Clear
                </button>
              </div>
            </div>
          </header>

          {/* =====================================================
              DASHBOARD STRIP
          ===================================================== */}

          <div className="grid grid-cols-1 gap-4 px-4 py-5 md:grid-cols-2 xl:grid-cols-4 md:px-8">
            <TopCard
              isDark={isDark}
              icon={<Bot size={22} />}
              title="AI Conversations"
              value={String(
                totalMessages
              )}
            />

            <TopCard
              isDark={isDark}
              icon={<Zap size={22} />}
              title="Inference Speed"
              value="0.4s"
            />

            <TopCard
              isDark={isDark}
              icon={<Globe size={22} />}
              title="Cloud Region"
              value="Global"
            />

            <TopCard
              isDark={isDark}
              icon={<Clock3 size={22} />}
              title="Availability"
              value="24/7"
            />
          </div>

          {/* =====================================================
              CHAT AREA
          ===================================================== */}

          <div className="flex flex-1 flex-col px-4 pb-8 md:px-8">
            <div
              ref={scrollRef}
              className={`relative flex-1 overflow-y-auto rounded-[34px] border p-4 md:p-6 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-white/70"
              }`}
            >
              {/* EMPTY STATE */}

              {messages.length === 0 &&
                !isLoading && (
                  <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20 blur-2xl" />

                      <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-2xl shadow-cyan-500/20">
                        <WandSparkles
                          size={42}
                          className="text-white"
                        />
                      </div>
                    </div>

                    <h3 className="mt-8 text-4xl font-black tracking-tight">
                      Synapse Intelligence
                    </h3>

                    <p
                      className={`mt-4 max-w-2xl text-sm leading-relaxed md:text-base ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Advanced enterprise-grade
                      conversational AI for
                      strategic analysis,
                      automation, forecasting,
                      executive insights, and
                      intelligent workflow
                      orchestration.
                    </p>

                    <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                      {SUGGESTIONS.map(
                        (item) => (
                          <button
                            key={
                              item.id
                            }
                            onClick={() =>
                              setMessage(
                                item.label
                              )
                            }
                            className={`group rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                              isDark
                                ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
                                <Sparkles
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <div>
                                <h4 className="font-bold">
                                  {
                                    item.label
                                  }
                                </h4>

                                <p
                                  className={`mt-2 text-sm ${
                                    isDark
                                      ? "text-slate-500"
                                      : "text-slate-500"
                                  }`}
                                >
                                  AI-powered
                                  strategic
                                  execution
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* MESSAGES */}

              <div className="space-y-6">
                {messages.map(
                  (item) => (
                    <div
                      key={item.id}
                      className={`flex ${
                        item.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`group max-w-4xl rounded-[28px] border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 ${
                          item.role ===
                          "user"
                            ? "border-cyan-500/20 bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                            : isDark
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="mb-4 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                                item.role ===
                                "user"
                                  ? "bg-white/15"
                                  : "bg-cyan-500/10 text-cyan-400"
                              }`}
                            >
                              {item.role ===
                              "user" ? (
                                <Command
                                  size={
                                    20
                                  }
                                />
                              ) : (
                                <Bot
                                  size={
                                    20
                                  }
                                />
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">
                                {item.role ===
                                "user"
                                  ? "Operator"
                                  : "Synapse AI"}
                              </h4>

                              <p
                                className={`mt-1 text-xs ${
                                  item.role ===
                                  "user"
                                    ? "text-white/70"
                                    : isDark
                                    ? "text-slate-500"
                                    : "text-slate-500"
                                }`}
                              >
                                {new Date(
                                  item.createdAt
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              copyMessage(
                                item.content
                              )
                            }
                            className={`opacity-0 transition-all duration-300 group-hover:opacity-100 ${
                              item.role ===
                              "user"
                                ? "text-white/80"
                                : "text-cyan-400"
                            }`}
                          >
                            <Copy
                              size={18}
                            />
                          </button>
                        </div>

                        <div
                          className={`whitespace-pre-wrap break-words text-[15px] leading-8 md:text-base ${
                            item.role ===
                            "user"
                              ? "text-white"
                              : isDark
                              ? "text-slate-200"
                              : "text-slate-700"
                          }`}
                        >
                          {item.content}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* TYPING */}

                {(isLoading ||
                  typingText) && (
                  <div className="flex justify-start">
                    <div
                      className={`max-w-4xl rounded-[28px] border p-5 ${
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                          {isLoading ? (
                            <Loader2
                              className="animate-spin"
                              size={
                                20
                              }
                            />
                          ) : (
                            <Bot
                              size={
                                20
                              }
                            />
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.2em]">
                            Synapse AI
                          </h4>

                          <p
                            className={`mt-1 text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            Neural reasoning
                            active
                          </p>
                        </div>
                      </div>

                      <div
                        className={`whitespace-pre-wrap break-words text-[15px] leading-8 ${
                          isDark
                            ? "text-slate-200"
                            : "text-slate-700"
                        }`}
                      >
                        {typingText}

                        {isLoading && (
                          <span className="ml-1 inline-flex">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-300">
                <TriangleAlert
                  size={20}
                  className="mt-0.5"
                />

                <div>
                  <h4 className="font-bold">
                    AI Response Error
                  </h4>

                  <p className="mt-1 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =====================================================
                INPUT
            ===================================================== */}

            <div
              className={`sticky bottom-0 mt-6 rounded-[34px] border p-4 backdrop-blur-2xl ${
                isDark
                  ? "border-white/10 bg-[#020617]/90"
                  : "border-slate-200 bg-white/90"
              }`}
            >
              <div className="flex items-end gap-4">
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    disabled={
                      isLoading
                    }
                    rows={1}
                    placeholder="Ask Synapse AI anything..."
                    className={`max-h-[220px] min-h-[70px] w-full resize-none rounded-[28px] border px-6 py-5 pr-28 text-[15px] outline-none transition-all duration-300 ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-cyan-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                    }`}
                  />

                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <button
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                        isDark
                          ? "bg-white/[0.06] hover:bg-white/[0.12]"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      <Mic
                        size={18}
                      />
                    </button>

                    <button
                      onClick={
                        sendMessage
                      }
                      disabled={
                        !message.trim() ||
                        isLoading
                      }
                      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {isLoading ? (
                        <Loader2
                          className="relative z-10 animate-spin"
                          size={
                            18
                          }
                        />
                      ) : (
                        <ArrowUp
                          className="relative z-10"
                          size={
                            18
                          }
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-1">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-500"
                  }`}
                >
                  <RotateCcw
                    size={14}
                  />

                  Enterprise AI memory active
                </div>

                <div
                  className={`text-xs ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-500"
                  }`}
                >
                  Enter ↵ to send · Shift + Enter
                  for newline
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

type SidebarCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  isDark: boolean;
};

function SidebarCard({
  title,
  value,
  subtitle,
  icon,
  isDark,
}: SidebarCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-semibold ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight">
            {value}
          </h3>

          <p
            className={`mt-2 text-xs ${
              isDark
                ? "text-slate-500"
                : "text-slate-500"
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

type TopCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  isDark: boolean;
};

function TopCard({
  title,
  value,
  icon,
  isDark,
}: TopCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-semibold ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight">
            {value}
          </h3>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>
      </div>
    </div>
  );
}