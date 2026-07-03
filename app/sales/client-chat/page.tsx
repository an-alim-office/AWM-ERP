"use client";

import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Presence = "online" | "away" | "offline";

type Priority = "High" | "Medium" | "Low";

type Message = {
  id: string;
  sender: "agent" | "client";
  text: string;
  time: string;
  delivered?: boolean;
};

type Conversation = {
  id: string;
  client: string;
  company: string;
  avatar: string;
  presence: Presence;
  unread: number;
  lastMessage: string;
  lastSeen: string;
  priority: Priority;
  aiScore: number;
  tags: string[];
  messages: Message[];
};

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_linear_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent overflow-hidden relative";

const conversationsSeed: Conversation[] = [
  {
    id: "CH-2001",
    client: "Sarah Mitchell",
    company: "NovaCore Ltd",
    avatar: "SM",
    presence: "online",
    unread: 4,
    lastMessage: "Need updated enterprise pricing structure.",
    lastSeen: "Now",
    priority: "High",
    aiScore: 94,
    tags: ["Enterprise", "Priority"],
    messages: [
      {
        id: "1",
        sender: "client",
        text: "Need updated enterprise pricing structure.",
        time: "09:18 AM",
      },
      {
        id: "2",
        sender: "agent",
        text: "AI pricing recommendation generated and shared securely.",
        time: "09:20 AM",
        delivered: true,
      },
    ],
  },
  {
    id: "CH-2002",
    client: "Daniel Foster",
    company: "Apex Retail",
    avatar: "DF",
    presence: "away",
    unread: 1,
    lastMessage: "Shipment analytics dashboard looks great.",
    lastSeen: "12m ago",
    priority: "Medium",
    aiScore: 88,
    tags: ["Retail"],
    messages: [
      {
        id: "1",
        sender: "client",
        text: "Shipment analytics dashboard looks great.",
        time: "08:14 AM",
      },
      {
        id: "2",
        sender: "agent",
        text: "Glad it helped optimize your logistics operations.",
        time: "08:16 AM",
        delivered: true,
      },
    ],
  },
  {
    id: "CH-2003",
    client: "Emily Carter",
    company: "Vertex Dynamics",
    avatar: "EC",
    presence: "online",
    unread: 0,
    lastMessage: "Can AI automate invoice follow-ups?",
    lastSeen: "Now",
    priority: "Low",
    aiScore: 81,
    tags: ["Automation"],
    messages: [
      {
        id: "1",
        sender: "client",
        text: "Can AI automate invoice follow-ups?",
        time: "Yesterday",
      },
      {
        id: "2",
        sender: "agent",
        text: "Yes, autonomous invoice automation workflow is supported.",
        time: "Yesterday",
        delivered: true,
      },
    ],
  },
];

const priorityStyles: Record<Priority, string> = {
  High:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  Medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Low:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

const presenceStyles: Record<Presence, string> = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  offline: "bg-zinc-500",
};

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div
      className={cn(
        "h-28 rounded-[28px] border border-white/10 bg-white/[0.03]",
        shimmer
      )}
    />
  );
});

const StatCard = memo(function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[30px]",
        "border border-white/10 bg-white/[0.04]",
        "backdrop-blur-2xl transition-all duration-500",
        "hover:-translate-y-1 hover:border-cyan-400/20"
      )}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_38%)]" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">{title}</div>

            <div className="mt-3 text-3xl font-black tracking-tight text-white">
              {value}
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              {sub}
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            ✦
          </div>
        </div>
      </div>
    </div>
  );
});

const ConversationCard = memo(function ConversationCard({
  item,
  active,
  onClick,
}: {
  item: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition-all duration-300",
        active
          ? "border-cyan-400/30 bg-cyan-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]" />

      <div className="relative flex items-start gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a] text-sm font-black text-white">
            {item.avatar}
          </div>

          <span
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0b1220]",
              presenceStyles[item.presence]
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-white">
                {item.client}
              </h3>

              <p className="truncate text-xs text-zinc-500">
                {item.company}
              </p>
            </div>

            <div className="text-[11px] text-zinc-500">
              {item.lastSeen}
            </div>
          </div>

          <p className="mt-3 truncate text-sm text-zinc-400">
            {item.lastMessage}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {item.unread > 0 && (
              <div className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-cyan-400 px-2 text-[11px] font-black text-[#05111d]">
                {item.unread}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

export default function ClientChatPage() {
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [activeChat, setActiveChat] = useState(
    conversationsSeed[0]
  );

  const [sending, setSending] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat]);

  const filteredConversations = useMemo(() => {
    const normalized = search.toLowerCase();

    return conversationsSeed.filter((item) =>
      [item.client, item.company, item.id]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [search]);

  const metrics = useMemo(() => {
    const unread = conversationsSeed.reduce(
      (acc, item) => acc + item.unread,
      0
    );

    const avgAi = Math.round(
      conversationsSeed.reduce(
        (acc, item) => acc + item.aiScore,
        0
      ) / conversationsSeed.length
    );

    return {
      unread,
      avgAi,
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    setSending(true);

    window.setTimeout(() => {
      setSending(false);
      setMessage("");
    }, 700);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#050816] p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-zinc-100 transition-colors duration-300 dark:bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div className="mx-auto max-w-[1900px]">
          <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_34%)]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  AI Communication Layer Active
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                  Client Chat
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                  Enterprise realtime messaging infrastructure with
                  AI-powered communication workflows, intelligent
                  customer engagement, autonomous response assistance,
                  and secure operational collaboration.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:max-w-xl">
                <StatCard
                  title="Active Conversations"
                  value="1,284"
                  sub="Realtime enterprise communication"
                />

                <StatCard
                  title="AI Response Accuracy"
                  value={`${metrics.avgAi}%`}
                  sub="Autonomous smart reply optimization"
                />
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Unread Messages"
              value={metrics.unread.toString()}
              sub="Priority communication queue"
            />

            <StatCard
              title="Avg Response Time"
              value="0.8s"
              sub="Realtime enterprise delivery"
            />

            <StatCard
              title="AI Suggestions"
              value="9,428"
              sub="Autonomous response generation"
            />

            <StatCard
              title="Secure Sessions"
              value="99.99%"
              sub="Encrypted operational messaging"
            />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
            <aside className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Conversations
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Smart client communication hub
                  </p>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="relative mb-5">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  ⌕
                </div>

                <input
                  aria-label="Search conversations"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients, companies..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220]/80 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                />
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 max-h-[850px]">
                {filteredConversations.map((item) => (
                  <ConversationCard
                    key={item.id}
                    item={item}
                    active={activeChat.id === item.id}
                    onClick={() => setActiveChat(item)}
                  />
                ))}

                {!filteredConversations.length && (
                  <div className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                    <div className="text-4xl">💬</div>

                    <h3 className="mt-4 text-lg font-black text-white">
                      No conversations found
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      No matching communication records available.
                    </p>
                  </div>
                )}
              </div>
            </aside>

            <section className="flex min-h-[850px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
              <div className="flex flex-col gap-5 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a] text-lg font-black text-white">
                      {activeChat.avatar}
                    </div>

                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#0b1220]",
                        presenceStyles[activeChat.presence]
                      )}
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      {activeChat.client}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {activeChat.company}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-bold",
                          priorityStyles[activeChat.priority]
                        )}
                      >
                        {activeChat.priority} Priority
                      </span>

                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                        AI Score {activeChat.aiScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    AI Assist
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01),transparent)] p-5">
                <div className="mx-auto flex max-w-5xl flex-col gap-5">
                  {activeChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "agent"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[90%] rounded-[28px] border px-5 py-4 shadow-lg transition-all duration-300 md:max-w-[70%]",
                          msg.sender === "agent"
                            ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-50"
                            : "border-white/10 bg-white/[0.04] text-zinc-100"
                        )}
                      >
                        <p className="text-sm leading-7">
                          {msg.text}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-4">
                          <span className="text-[11px] text-zinc-500">
                            {msg.time}
                          </span>

                          {msg.sender === "agent" &&
                            msg.delivered && (
                              <span className="text-[11px] font-semibold text-cyan-300">
                                Delivered
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div ref={messageEndRef} />
                </div>
              </div>

              <div className="border-t border-white/10 p-5">
                <div className="mb-4 flex flex-wrap gap-3">
                  {[
                    "AI Suggested Reply",
                    "Generate Proposal",
                    "Smart Summary",
                    "Attach Analytics",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="relative flex-1">
                    <textarea
                      aria-label="Type your message"
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      placeholder="Type secure enterprise message..."
                      rows={4}
                      className="w-full resize-none rounded-[28px] border border-white/10 bg-[#0b1220]/80 px-5 py-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-400/40"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending}
                      className="inline-flex h-14 items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-500/10 px-6 text-sm font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </button>

                    <button
                      type="button"
                      className="inline-flex h-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.03] px-6 text-sm font-semibold text-zinc-200 transition-all duration-300 hover:bg-white/[0.05]"
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}