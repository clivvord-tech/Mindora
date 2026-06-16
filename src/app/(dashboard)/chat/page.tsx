"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Send, Loader2, Heart, AlertTriangle, Phone, RefreshCw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessageUI } from "@/types";

const MIRA_INTRO = `Hi there 💙 I'm Mira, your wellness companion. I'm here to listen without judgment, help you explore your thoughts and feelings, and support your mental wellbeing.

How are you feeling today? You can share anything — big or small.`;

function CrisisAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-4 mb-2 bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-red-800 text-sm">Crisis resources detected</p>
          <p className="text-xs text-red-700 mt-1">It sounds like you may be going through something very difficult. Please reach out for immediate support:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href="tel:988" className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
              <Phone className="w-3 h-3" /> Call/Text 988
            </a>
            <a href="sms:741741" className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
              Text HOME to 741741
            </a>
          </div>
        </div>
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-xs">✕</button>
      </div>
    </div>
  );
}

function Message({ msg }: { msg: ChatMessageUI }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 px-4 py-1", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Heart className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
        isUser
          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm"
          : "bg-white border border-indigo-50 text-foreground rounded-tl-sm"
      )}>
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>
            {line.startsWith("**") && line.endsWith("**") ? (
              <strong>{line.slice(2, -2)}</strong>
            ) : line.includes("**") ? (
              line.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>)
            ) : line}
            {i < msg.content.split("\n").length - 1 && <br />}
          </span>
        ))}
        {msg.role === "assistant" && msg.content === "" && (
          <span className="streaming-cursor" />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    { id: "intro", role: "assistant", content: MIRA_INTRO, createdAt: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [showCrisis, setShowCrisis] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history
  useEffect(() => {
    fetch("/api/chat/history")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.messages?.length > 0) {
          setMessages(data.messages.map((m: { messageId: string; role: "user" | "assistant"; content: string; createdAt: string }) => ({
            id: m.messageId,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.createdAt),
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessageUI = { id: uuidv4(), role: "user", content: text, createdAt: new Date() };
    const assistantMsg: ChatMessageUI = { id: uuidv4(), role: "assistant", content: "", createdAt: new Date() };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get response");
      }

      if (res.headers.get("X-Crisis-Detected") === "true") {
        setShowCrisis(true);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantMsg.id ? { ...m, content: full } : m)
        );
      }
    } catch (err: unknown) {
      toast({ title: "Couldn't reach Mira", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, sessionId, toast]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const SUGGESTIONS = [
    "I've been feeling anxious lately",
    "I'm struggling with low motivation",
    "I want to talk about my stress",
    "Help me practice breathing",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] max-w-3xl mx-auto -mt-4 sm:-mt-6 lg:-mt-8 animate-fade-in">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 sm:px-0 py-4 border-b border-indigo-50 flex-shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="font-semibold">Mira</h1>
          <p className="text-xs text-muted-foreground">AI Wellness Companion · Always here for you</p>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMessages([{ id: "intro", role: "assistant", content: MIRA_INTRO, createdAt: new Date() }]);
            }}
            title="New conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700 flex-shrink-0">
        Mira is an AI companion, not a licensed therapist. In crisis? <a href="tel:988" className="underline font-semibold">Call/text 988</a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2" role="log" aria-live="polite" aria-label="Chat messages">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
            {/* Suggestions when no real messages yet */}
            {messages.length === 1 && (
              <div className="px-4 space-y-2 mt-4">
                <p className="text-xs text-muted-foreground text-center mb-3">Quick starts — tap to send:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                      className="text-left text-sm bg-white border border-indigo-100 rounded-xl px-3 py-2.5 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Crisis alert */}
      {showCrisis && <CrisisAlert onDismiss={() => setShowCrisis(false)} />}

      {/* Input area */}
      <div className="border-t border-indigo-50 p-4 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind… (Shift+Enter for new line)"
            rows={2}
            maxLength={4000}
            disabled={loading}
            className="resize-none border-indigo-100 focus:border-indigo-300 flex-1"
            aria-label="Message to Mira"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90 flex-shrink-0 h-10 w-10 p-0"
            aria-label="Send message"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Conversations are encrypted and private · <a href="tel:988" className="text-red-500 underline">988 Crisis Line</a>
        </p>
      </div>
    </div>
  );
}
