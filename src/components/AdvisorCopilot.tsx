"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useConversationControls,
  useConversationStatus,
  useConversationMode,
} from "@elevenlabs/react";
import { Send, Square, Settings2, Paperclip, AlertCircle, Loader2 } from "lucide-react";
import {
  mapClientToAgentContext,
  type ClientPageData,
} from "@/lib/mapClientToAgentContext";
import { Orb, type AgentState } from "@/components/ui/orb";

type Message = {
  role: "user" | "agent";
  text: string;
};

type AdvisorCopilotProps = {
  client: ClientPageData;
};

const AGENT_ID = "agent_3601kn42803kettadetreqdh54rb";

export default function AdvisorCopilot({ client }: AdvisorCopilotProps) {
  const dynamicVariables = useMemo(() => mapClientToAgentContext(client), [client]);

  const { startSession, endSession, sendUserMessage } = useConversationControls();
  const { status } = useConversationStatus();
  const { mode } = useConversationMode();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  // isWaiting: true from the moment user sends until text starts revealing
  const [isWaiting, setIsWaiting] = useState(false);
  // Streaming typewriter state — holds the in-progress agent reply
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [displayedChars, setDisplayedChars] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledRef = useRef(false);
  const pendingMessageRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (userScrolledRef.current) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const connected = status === "connected";
  const connecting = status === "connecting";

  // Map ElevenLabs conversation state to Orb AgentState
  const orbAgentState: AgentState = !connected
    ? null
    : mode === "speaking"
      ? "talking"
      : mode === "listening"
        ? "listening"
        : "thinking";

  /* ── Smart auto-scroll ── */
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (isWaiting || streamingText !== null) scrollToBottom(); }, [isWaiting, streamingText, displayedChars, scrollToBottom]);

  /* ── Typewriter reveal ── */
  useEffect(() => {
    if (streamingText === null) return;
    if (prefersReducedMotion) {
      setMessages((prev) => [...prev, { role: "agent", text: streamingText }]);
      setStreamingText(null);
      setDisplayedChars(0);
      setIsWaiting(false);
      return;
    }
    if (displayedChars >= streamingText.length) {
      setMessages((prev) => [...prev, { role: "agent", text: streamingText }]);
      setStreamingText(null);
      setDisplayedChars(0);
      setIsWaiting(false);
      return;
    }
    // Adaptive chunk: ~180 ticks (~2.9s at 16ms/tick) for smooth feel
    const chunk = Math.max(3, Math.ceil(streamingText.length / 180));
    const id = setTimeout(() => {
      setDisplayedChars((c) => Math.min(c + chunk, streamingText.length));
    }, 16);
    return () => clearTimeout(id);
  }, [streamingText, displayedChars, prefersReducedMotion]);

  /* ── Flush pending on connect ── */
  useEffect(() => {
    if (connected && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      // Flush pending message that triggered auto-start
      if (pendingMessageRef.current) {
        const msg = pendingMessageRef.current;
        pendingMessageRef.current = null;
        sendUserMessage(msg);
      }
    }
    if (status === "disconnected") {
      sessionStartedRef.current = false;
      setIsWaiting(false);
    }
  }, [connected, status, sendUserMessage]);

  /* ── Start session ── */
  const handleStart = useCallback(async () => {
    setError(null);
    try {
      await startSession({
        agentId: AGENT_ID,
        textOnly: true,
        dynamicVariables,
        onMessage: ({ message, role }) => {
          if ((role as string) === "agent") {
            setIsWaiting(false);
            setStreamingText(message);
            setDisplayedChars(0);
          }
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de démarrer la session.");
      pendingMessageRef.current = null;
      setIsWaiting(false);
    }
  }, [startSession, dynamicVariables]);

  /* ── End session ── */
  const handleEnd = useCallback(() => {
    endSession();
    setError(null);
  }, [endSession]);

  /* ── Send / auto-start ── */
  const handleSend = useCallback(() => {
    const value = input.trim();
    if (!value) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistic user bubble + immediately show the assistant waiting row
    setMessages((prev) => [...prev, { role: "user", text: value }]);
    setIsWaiting(true);
    userScrolledRef.current = false;

    if (connected) {
      sendUserMessage(value);
    } else if (!connecting) {
      // Auto-start session, message will be flushed in useEffect
      pendingMessageRef.current = value;
      handleStart();
    }
  }, [input, connected, connecting, sendUserMessage, handleStart]);

  return (
    <div className="flex h-full flex-col">
      {/* ── Error banner ── */}
      {error && (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          userScrolledRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 60;
        }}
      >
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-6">
            <Orb
              agentState={orbAgentState}
              colors={["#2563eb", "#60a5fa"]}
              className="size-40"
            />
            <div className="mt-10 flex flex-col items-center gap-1">
              <p className="flex items-center justify-center gap-2 text-lg text-white">
                <img src="/clarity-logo.png" alt="Clarity" className="h-5 w-auto inline-block align-middle invert dark:invert-0" />
                <span className="font-medium">, your advisory copilot</span>
              </p>
              <p className="max-w-[260px] text-center text-sm text-muted-foreground/70">
                Ask or message Clarity to start a new conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="text-sm break-words py-2 px-4 rounded-2xl bg-muted text-foreground">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="w-full flex gap-2.5 justify-start">
                  <img
                    src="/orb.png"
                    alt=""
                    className="h-6 w-6 rounded-full shrink-0 mt-0.5 object-cover"
                  />
                  <div className="min-w-0 pr-8">
                    <div className="text-sm text-foreground break-words leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ── Active reply row (waiting dots → typewriter text) ── */}
            {(isWaiting || streamingText !== null) && (
              <div className="w-full flex gap-2.5 justify-start">
                <img
                  src="/orb.png"
                  alt=""
                  className="h-6 w-6 rounded-full shrink-0 mt-0.5 object-cover"
                />
                <div className="min-w-0 pr-8 py-0.5">
                  {isWaiting && streamingText === null ? (
                    /* Waiting for first token */
                    <p className="text-sm text-white/40 animate-pulse">
                      Clarity prépare sa réponse
                    </p>
                  ) : (
                    /* Text being revealed */
                    <div className="text-sm text-foreground break-words leading-relaxed whitespace-pre-wrap">
                      {streamingText!.slice(0, displayedChars)}
                      {displayedChars < (streamingText?.length ?? 0) && (
                        <span className="inline-block w-[2px] h-[1.1em] bg-foreground/60 ml-px align-text-bottom animate-[pulse_0.8s_ease-in-out_infinite]" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="px-5 pb-5 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] px-5 py-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={connected ? "Envoyez un message…" : "Envoyez un message pour démarrer…"}
              className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[13.5px] leading-5 text-foreground placeholder:text-muted-foreground/35 focus:outline-none"
              style={{ maxHeight: "150px" }}
            />
            <div className="flex shrink-0 items-center gap-1 self-end pb-0.5">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
                tabIndex={-1}
              >
                <Paperclip className="size-4" />
              </button>
              {connected && (
                <button
                  type="button"
                  onClick={handleEnd}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:text-destructive/70"
                >
                  <Square className="size-4" />
                </button>
              )}
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
                tabIndex={-1}
              >
                <Settings2 className="size-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || connecting}
                className="ml-0.5 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-20"
              >
                {connecting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
