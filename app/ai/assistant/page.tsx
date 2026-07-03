/* ============================================================================
   CLEANED + PRODUCTION READY AWM ERP AI PAGE
   Duplicate States Removed
   Duplicate Voice Recognition Removed
   Duplicate speakText Removed
   Callback Conflicts Fixed
   TypeScript Safe
   Production Optimized
============================================================================ */

"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Sparkles,
  SendHorizontal,
  Bot,
  User,
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  Mic,
  MicOff,
  Copy,
  CheckCheck,
  WandSparkles,
  BadgeCheck,
  PlayCircle,
  Trash2,
  Download,
  MoonStar,
  SunMedium,
  Command,
  Activity,
  Database,
  Lock,
  Zap,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ============================================================================
   TYPES
============================================================================ */

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

interface SuggestionItem {
  title: string;
  prompt: string;
  icon: React.ReactNode;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start(): void;
  stop(): void;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;
}

/* ============================================================================
   CONSTANTS
============================================================================ */

const STORAGE_KEY = "awm-erp-ai-chat";

const defaultSuggestions: SuggestionItem[] = [
  {
  "title": "সব ভাষায় সাহায্য",
  "prompt": "You are a multilingual assistant. Please understand and respond to the user in whichever language they communicate. Provide accurate translations and cross-lingual support.",
  "icon": <Sparkles className="w-5 h-5" />
},
  {
    title: "ERP Dashboard",
    prompt:
      "Create a premium enterprise ERP dashboard using Next.js and TailwindCSS.",
    icon: <Cpu className="w-5 h-5" />,
  },

  {
    title: "Marketing Script",
    prompt:
      "Generate a cinematic AI marketing script for AWM ERP AI.",
    icon: <PlayCircle className="w-5 h-5" />,
  },

  {
    title: "Architecture",
    prompt:
      "Generate Mermaid.js enterprise architecture for ERP AI.",
    icon: (
      <BrainCircuit className="w-5 h-5" />
    ),
  },

  {
    title: "Payroll AI",
    prompt:
      "Build an AI payroll automation engine using MongoDB and Next.js.",
    icon: (
      <ShieldCheck className="w-5 h-5" />
    ),
  },
];

/* ============================================================================
   HELPERS
============================================================================ */

const generateId = (): string => {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.error(error);
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 11)}`;
};

/* ============================================================================
   COMPONENT
============================================================================ */

export default function AWMERPAIPage() {
  /* ==========================================================================
     STATES
  ========================================================================== */

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([
    {
      id: generateId(),
      role: "assistant",
      content:
        "Welcome to AWM ERP AI — the elite enterprise intelligence system of 2026.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  const [isLiveMode, setIsLiveMode] =
    useState(true);

  /* ==========================================================================
     REFS
  ========================================================================== */

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const recognitionRef =
    useRef<CustomSpeechRecognition | null>(
      null
    );

/* ==========================================================================
   ENTERPRISE ADVANCED SPEECH ENGINE
========================================================================== */

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  priority?: boolean;
};

type SpeechStatus =
  | "idle"
  | "speaking"
  | "paused";

type SpeechRecognitionErrorEvent =
  Event & {
    error: string;
  };

/* ==========================================================================
   HOOK
========================================================================== */

 const useAdvancedSpeech = () => {
  /* ======================================================================
     STATES
  ====================================================================== */

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [status, setStatus] =
    useState<SpeechStatus>("idle");

  const [voices, setVoices] =
    useState<
      SpeechSynthesisVoice[]
    >([]);

  /* ======================================================================
     REFS
  ====================================================================== */

  const synthRef =
    useRef<SpeechSynthesis | null>(
      null
    );

  const voicesRef = useRef<
    SpeechSynthesisVoice[]
  >([]);

  const queueRef = useRef<
    SpeechSynthesisUtterance[]
  >([]);

  const sessionRef =
    useRef<number>(0);

  const mountedRef =
    useRef<boolean>(true);

  /* ======================================================================
     SUPPORT
  ====================================================================== */

  const isSupported =
    typeof window !==
      "undefined" &&
    "speechSynthesis" in window;

  /* ======================================================================
     HELPERS
  ====================================================================== */

  const delay = (
    ms: number
  ): Promise<void> =>
    new Promise((resolve) =>
      setTimeout(resolve, ms)
    );

  /* ======================================================================
     INIT
  ====================================================================== */

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    mountedRef.current = true;

    synthRef.current =
      window.speechSynthesis;

    const loadVoices = () => {
      const loadedVoices =
        synthRef.current?.getVoices() ||
        [];

      voicesRef.current =
        loadedVoices;

      setVoices(loadedVoices);
    };

    loadVoices();

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      mountedRef.current = false;

      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );

      synthRef.current?.cancel();

      queueRef.current = [];
    };
  }, [isSupported]);

  /* ======================================================================
     WAIT FOR VOICES
  ====================================================================== */

  const waitForVoices =
    useCallback(async () => {
      return new Promise<void>(
        (resolve) => {
          const existingVoices =
            window.speechSynthesis.getVoices();

          if (
            existingVoices.length
          ) {
            resolve();

            return;
          }

          const handler = () => {
            const loadedVoices =
              window.speechSynthesis.getVoices();

            if (
              loadedVoices.length
            ) {
              clearTimeout(timeout);

              window.speechSynthesis.removeEventListener(
                "voiceschanged",
                handler
              );

              resolve();
            }
          };

          const timeout =
            setTimeout(() => {
              window.speechSynthesis.removeEventListener(
                "voiceschanged",
                handler
              );

              resolve();
            }, 2000);

          window.speechSynthesis.addEventListener(
            "voiceschanged",
            handler
          );
        }
      );
    }, []);

  /* ======================================================================
     LANGUAGE DETECTION
  ====================================================================== */

  const detectLanguage =
    useCallback(
      (
        text: string
      ): string => {
        const patterns = [
          {
            regex:
              /[\u0980-\u09FF]/,
            lang: "bn-BD",
          },

          {
            regex:
              /[\u0600-\u06FF]/,
            lang: "ar-SA",
          },

          {
            regex:
              /[\u0900-\u097F]/,
            lang: "hi-IN",
          },

          {
            regex:
              /[\u4E00-\u9FFF]/,
            lang: "zh-CN",
          },

          {
            regex:
              /[\u3040-\u30FF]/,
            lang: "ja-JP",
          },

          {
            regex:
              /[\uAC00-\uD7AF]/,
            lang: "ko-KR",
          },

          {
            regex:
              /[\u0400-\u04FF]/,
            lang: "ru-RU",
          },
        ];

        for (const item of patterns) {
          if (
            item.regex.test(text)
          ) {
            return item.lang;
          }
        }

        return "en-US";
      },
      []
    );

  /* ======================================================================
     GET BEST VOICE
  ====================================================================== */

  const getBestVoice =
    useCallback(
      (
        targetLang: string
      ):
        | SpeechSynthesisVoice
        | null => {
        const availableVoices =
          voicesRef.current;

        if (
          !availableVoices.length
        ) {
          return null;
        }

        /* EXACT MATCH */

        let voice =
          availableVoices.find(
            (v) =>
              v.lang.toLowerCase() ===
              targetLang.toLowerCase()
          ) || null;

        /* PARTIAL MATCH */

        if (!voice) {
          voice =
            availableVoices.find(
              (v) =>
                v.lang
                  .toLowerCase()
                  .startsWith(
                    targetLang
                      .split("-")[0]
                      .toLowerCase()
                  )
            ) || null;
        }

        /* GOOGLE */

        if (!voice) {
          voice =
            availableVoices.find(
              (v) =>
                v.name
                  .toLowerCase()
                  .includes(
                    "google"
                  )
            ) || null;
        }

        /* MICROSOFT */

        if (!voice) {
          voice =
            availableVoices.find(
              (v) =>
                v.name
                  .toLowerCase()
                  .includes(
                    "microsoft"
                  )
            ) || null;
        }

        /* ENHANCED */

        if (!voice) {
          voice =
            availableVoices.find(
              (v) =>
                v.name
                  .toLowerCase()
                  .includes(
                    "enhanced"
                  )
            ) || null;
        }

        /* DEFAULT */

        if (!voice) {
          voice =
            availableVoices.find(
              (v) => v.default
            ) ||
            availableVoices[0];
        }

        return voice;
      },
      []
    );

  /* ======================================================================
     SMART TEXT SPLITTER
  ====================================================================== */

  const splitText =
    useCallback(
      (
        text: string,
        maxLength = 180
      ): string[] => {
        if (!text.trim()) {
          return [];
        }

        const cleanText =
          text
            .replace(/\s+/g, " ")
            .trim();

        const sentences =
          cleanText.match(
            /[^.!?।،。！？\n]+[.!?।،。！？]?/g
          ) || [];

        const chunks: string[] =
          [];

        let currentChunk = "";

        for (const sentence of sentences) {
          /* LONG SENTENCE */

          if (
            sentence.length >
            maxLength
          ) {
            const words =
              sentence.split(
                /\s+/
              );

            let wordChunk = "";

            for (const word of words) {
              if (
                (
                  wordChunk +
                  " " +
                  word
                ).length >
                maxLength
              ) {
                if (
                  wordChunk.trim()
                ) {
                  chunks.push(
                    wordChunk.trim()
                  );
                }

                wordChunk = word;
              } else {
                wordChunk +=
                  " " + word;
              }
            }

            if (
              wordChunk.trim()
            ) {
              chunks.push(
                wordChunk.trim()
              );
            }

            continue;
          }

          /* NORMAL */

          if (
            (
              currentChunk +
              sentence
            ).length >
            maxLength
          ) {
            if (
              currentChunk.trim()
            ) {
              chunks.push(
                currentChunk.trim()
              );
            }

            currentChunk =
              sentence;
          } else {
            currentChunk +=
              " " + sentence;
          }
        }

        if (
          currentChunk.trim()
        ) {
          chunks.push(
            currentChunk.trim()
          );
        }

        return chunks;
      },
      []
    );

  /* ======================================================================
     STOP
  ====================================================================== */

  const stop = useCallback(() => {
    sessionRef.current++;

    const synth =
      synthRef.current;

    if (synth?.paused) {
      synth.resume();
    }

    synth?.cancel();

    queueRef.current = [];

    if (mountedRef.current) {
      setIsSpeaking(false);

      setStatus("idle");
    }
  }, []);

  /* ======================================================================
     PAUSE
  ====================================================================== */

  const pause =
    useCallback(() => {
      const synth =
        synthRef.current;

      if (
        !synth ||
        !synth.speaking
      ) {
        return;
      }

      synth.pause();

      if (mountedRef.current) {
        setStatus("paused");
      }
    }, []);

  /* ======================================================================
     RESUME
  ====================================================================== */

  const resume =
    useCallback(() => {
      const synth =
        synthRef.current;

      if (
        !synth ||
        !synth.paused
      ) {
        return;
      }

      synth.resume();

      if (mountedRef.current) {
        setStatus("speaking");
      }
    }, []);

  /* ======================================================================
     SPEAK
  ====================================================================== */

  const speak =
    useCallback(
      async (
        text: string,
        options?: SpeakOptions
      ) => {
        try {
          if (
            !isSupported
          ) {
            return;
          }

          if (
            !text?.trim()
          ) {
            return;
          }

          const synth =
            synthRef.current;

          if (!synth) {
            return;
          }

          /* RESET */

          stop();

          await delay(60);

          /* SESSION */

          const sessionId =
            ++sessionRef.current;

          /* WAIT FOR VOICES */

          await waitForVoices();

          if (
            sessionId !==
            sessionRef.current
          ) {
            return;
          }

          /* LANGUAGE */

          const targetLang =
            options?.lang ||
            detectLanguage(
              text
            );

          /* VOICE */

          const voice =
            getBestVoice(
              targetLang
            );

          /* CHUNKS */

          const chunks =
            splitText(text);

          if (!chunks.length) {
            return;
          }

          if (
            mountedRef.current
          ) {
            setIsSpeaking(
              true
            );

            setStatus(
              "speaking"
            );
          }

          /* CREATE QUEUE */

          queueRef.current =
            chunks.map(
              (chunk) => {
                const utterance =
                  new SpeechSynthesisUtterance(
                    chunk
                  );

                utterance.lang =
                  targetLang;

                if (voice) {
                  utterance.voice =
                    voice;
                }

                utterance.rate =
                  options?.rate ||
                  (targetLang.startsWith(
                    "ar"
                  )
                    ? 0.9
                    : 1);

                utterance.pitch =
                  options?.pitch ||
                  1;

                utterance.volume =
                  options?.volume ||
                  1;

                utterance.onstart =
                  () => {
                    if (
                      !mountedRef.current
                    ) {
                      return;
                    }

                    setStatus(
                      "speaking"
                    );
                  };

                utterance.onerror =
                  (
                    event: SpeechSynthesisErrorEvent
                  ) => {
                    console.error(
                      "Speech error:",
                      event.error
                    );
                  };

                utterance.onboundary =
                  (
                    event: SpeechSynthesisEvent
                  ) => {
                    console.log(
                      "Speech boundary:",
                      event.charIndex
                    );
                  };

                return utterance;
              }
            );

          /* SPEAK NEXT */

          const speakNext = (
            index: number
          ) => {
            if (
              !mountedRef.current
            ) {
              return;
            }

            if (
              sessionId !==
              sessionRef.current
            ) {
              return;
            }

            if (
              index >=
              queueRef.current
                .length
            ) {
              queueRef.current =
                [];

              setIsSpeaking(
                false
              );

              setStatus(
                "idle"
              );

              return;
            }

            const utterance =
              queueRef.current[
                index
              ];

            utterance.onend =
              () => {
                speakNext(
                  index + 1
                );
              };

            utterance.onerror =
              (
                event: SpeechSynthesisErrorEvent
              ) => {
                console.error(
                  "Speech error:",
                  event.error
                );

                if (
                  event.error ===
                    "interrupted" ||
                  event.error ===
                    "canceled"
                ) {
                  return;
                }

                speakNext(
                  index + 1
                );
              };

            if (
              synth.speaking
            ) {
              synth.cancel();
            }

            synth.speak(
              utterance
            );
          };

          speakNext(0);
        } catch (error) {
          console.error(
            "Speech synthesis failed:",
            error
          );

          if (
            mountedRef.current
          ) {
            setIsSpeaking(false);

            setStatus("idle");
          }
        }
      },
      [
        detectLanguage,
        getBestVoice,
        splitText,
        stop,
        waitForVoices,
        isSupported,
      ]
    );

  /* ======================================================================
     RETURN
  ====================================================================== */

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    status,
    voices,
    isSupported,
  };
};

  
  /* ==========================================================================
     LOCAL STORAGE
  ========================================================================== */

  useEffect(() => {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) return;

    try {
      const parsed =
        JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );
  }, [messages]);

  /* ==========================================================================
     AUTO SCROLL
  ========================================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  /* ==========================================================================
     KEYBOARD SHORTCUT
  ========================================================================== */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key === "k"
      ) {
        event.preventDefault();

        const textarea =
          document.getElementById(
            "ai-message"
          ) as HTMLTextAreaElement | null;

        textarea?.focus();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* ==========================================================================
     SEND MESSAGE
  ========================================================================== */

  const handleSendMessage =
    useCallback(
      async (
        textOverride?: string
      ) => {
        const textToSend =
          textOverride || input;

        if (
          !textToSend.trim() ||
          loading
        ) {
          return;
        }

        const userMessage: ChatMessage =
          {
            id: generateId(),
            role: "user",
            content:
              textToSend.trim(),
            createdAt:
              new Date().toISOString(),
          };

        const updatedMessages = [
          ...messages,
          userMessage,
        ];

        setMessages(updatedMessages);

        setInput("");

        setLoading(true);

        try {
          const response =
            await fetch(
              "/api/chat",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  message:
                    userMessage.content,

                  messages:
                    updatedMessages,
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Server Error"
            );
          }

          const assistantMessage: ChatMessage =
            {
              id: generateId(),
              role: "assistant",
              content:
                data.reply,
              createdAt:
                new Date().toISOString(),
            };

          setMessages((prev) => [
            ...prev,
            assistantMessage,
          ]);

          if (isLiveMode) {
            (data.reply);
          }
        } catch (error) {
          console.error(error);

          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: "assistant",
              content:
                "AWM ERP AI server connection failed.",
              createdAt:
                new Date().toISOString(),
            },
          ]);
        } finally {
          setLoading(false);
        }
      },
      [
        input,
        loading,
        messages,
        isLiveMode,
      
      ]
    );

  /* ==========================================================================
     SPEECH RECOGNITION
  ========================================================================== */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const SpeechRecognitionAPI =
      (
        window as Window &
          typeof globalThis & {
            webkitSpeechRecognition?: new () => CustomSpeechRecognition;
            SpeechRecognition?: new () => CustomSpeechRecognition;
          }
      ).SpeechRecognition ||
      (
        window as Window &
          typeof globalThis & {
            webkitSpeechRecognition?: new () => CustomSpeechRecognition;
          }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn(
        "Speech Recognition Unsupported"
      );

      return;
    }

    const recognition =
      new SpeechRecognitionAPI();

    recognition.lang = "bn-BD";

    recognition.continuous = false;

    recognition.interimResults =
      false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = async (
      event : SpeechRecognitionEvent
    ) => {
      const transcript =
        event.results[0][0]
          .transcript;

      setInput(transcript);

      await handleSendMessage(
        transcript
      );
    };

    recognitionRef.current =
      recognition;

    return () => {
      recognition.stop();
    };
  }, [handleSendMessage]);

  /* ==========================================================================
     VOICE TOGGLE
  ========================================================================== */

  const handleVoiceToggle =
    useCallback(() => {
      if (!recognitionRef.current) {
        return;
      }

      if (listening) {
        recognitionRef.current.stop();

        setListening(false);

        return;
      }

      recognitionRef.current.start();
    }, [listening]);

  /* ==========================================================================
     COPY MESSAGE
  ========================================================================== */

  const handleCopy =
    useCallback(
      async (
        id: string,
        content: string
      ) => {
        try {
          await navigator.clipboard.writeText(
            content
          );

          setCopiedId(id);

          setTimeout(() => {
            setCopiedId(null);
          }, 2000);
        } catch (error) {
          console.error(error);
        }
      },
      []
    );

  /* ==========================================================================
     CLEAR CHAT
  ========================================================================== */

  const clearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content:
          "Chat reset successfully.",
        createdAt:
          new Date().toISOString(),
      },
    ]);
  };

  /* ==========================================================================
     EXPORT CHAT
  ========================================================================== */

  const exportChat = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          messages,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "awm-erp-ai-chat.json";

    a.click();

    URL.revokeObjectURL(url);
  };

  /* ==========================================================================
     DATE FORMAT
  ========================================================================== */

  const formattedDate =
    useMemo(() => {
      return new Intl.DateTimeFormat(
        "en-US",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    }, []);

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div
      className={`min-h-screen overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-[#050816] text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{
                scale: 1.05,
              }}
              className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-black tracking-tight">
                AWM ERP AI
              </h1>

              <p className="text-sm text-slate-400">
                Enterprise Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
            >
              {darkMode ? (
                <SunMedium className="w-5 h-5" />
              ) : (
                <MoonStar className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={exportChat}
              className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={clearChat}
              className="w-11 h-11 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-6">
            <WandSparkles className="w-4 h-4" />
            AI Powered ERP Ecosystem
          </div>

          <h2 className="text-5xl md:text-7xl font-black leading-tight">
            The Future of{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              Enterprise AI
            </span>
          </h2>
        </div>
      </section>

      {/* CHAT */}

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
          {/* TOP */}

          <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-black text-lg">
                  AWM ERP AI Assistant
                </h3>

                <p className="text-sm text-slate-400">
                  Enterprise Intelligence Core
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Command className="w-4 h-4" />
              CTRL + K
            </div>
          </div>

          {/* SUGGESTIONS */}

          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {defaultSuggestions.map(
                (item) => (
                  <motion.button
                    key={item.title}
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() =>
                      setInput(
                        item.prompt
                      )
                    }
                    className="group rounded-2xl border border-white/10 bg-black/20 p-5 text-left"
                  >
                    <div className="text-blue-400">
                      {item.icon}
                    </div>

                    <h4 className="mt-4 font-bold">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">
                      {item.prompt}
                    </p>
                  </motion.button>
                )
              )}
            </div>
          </div>

          {/* MESSAGES */}

          <div className="h-[700px] overflow-y-auto px-6 py-6 space-y-6">
            <AnimatePresence>
              {messages.map(
                (message) => {
                  const isAssistant =
                    message.role ===
                    "assistant";

                  return (
                    <motion.div
                      key={
                        message.id
                      }
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className={`flex ${
                        isAssistant
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-4xl rounded-3xl border px-5 py-5 ${
                          isAssistant
                            ? "bg-white/5 border-white/10"
                            : "bg-gradient-to-br from-blue-600 to-violet-600 border-transparent"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10">
                            {isAssistant ? (
                              <Bot className="w-5 h-5" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold">
                                  {isAssistant
                                    ? "AWM ERP AI"
                                    : "Enterprise User"}
                                </h4>

                                <p className="text-xs text-slate-400 mt-1">
                                  {formattedDate.format(
                                    new Date(
                                      message.createdAt
                                    )
                                  )}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  handleCopy(
                                    message.id,
                                    message.content
                                  )
                                }
                                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
                              >
                                {copiedId ===
                                message.id ? (
                                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <div className="prose prose-invert max-w-none mt-5">
                              <ReactMarkdown
                                remarkPlugins={[
                                  remarkGfm,
                                ]}
                              >
                                {
                                  message.content
                                }
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 flex items-center gap-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />

                  <span>
                    AWM ERP AI is
                    processing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <div className="border-t border-white/10 p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
                <textarea
                  id="ai-message"
                  value={input}
                  onChange={(e) =>
                    setInput(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Ask AWM ERP AI anything..."
                  className="w-full resize-none bg-transparent outline-none"
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                        "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();

                      handleSendMessage();
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={
                    handleVoiceToggle
                  }
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                    listening
                      ? "bg-red-500 border-red-400"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {listening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() =>
                    handleSendMessage()
                  }
                  disabled={loading}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center"
                >
                  <SendHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                "AI Analytics",
                "Payroll AI",
                "ERP Automation",
                "Face Recognition",
                "MongoDB",
                "Enterprise Security",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full border border-white/10 text-xs text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}