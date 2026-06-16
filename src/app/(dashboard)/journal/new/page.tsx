"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MOOD_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle, Phone } from "lucide-react";
import Link from "next/link";

export default function NewJournalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasCrisis, setHasCrisis] = useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), mood: mood || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.hasCrisis) setHasCrisis(true);
      router.push(`/journal/${data.entry.entryId}`);
    } catch (err: unknown) {
      toast({ title: "Couldn't save entry", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/journal">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Journal
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">New entry</span>
      </div>

      {hasCrisis && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">We noticed something in your entry</p>
            <p className="text-xs text-red-700 mt-1">If you're struggling, please reach out for support.</p>
            <a href="tel:988" className="inline-flex items-center gap-1.5 mt-2 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600">
              <Phone className="w-3 h-3" /> Call/Text 988 — Free & Confidential
            </a>
          </div>
        </div>
      )}

      <Card className="border-indigo-50 shadow-card">
        <CardContent className="p-6 space-y-5">
          {/* Title */}
          <Input
            placeholder="Entry title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 border-b border-indigo-100 rounded-none focus-visible:ring-0 px-0 text-lg font-semibold placeholder:font-normal placeholder:text-muted-foreground"
            maxLength={200}
          />

          {/* Mood picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">How are you feeling while writing this?</label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.score}
                  onClick={() => setMood(mood === m.score ? 0 : m.score)}
                  title={m.label}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xl transition-all duration-150",
                    mood === m.score ? "bg-indigo-100 scale-110 shadow-sm" : "hover:bg-indigo-50"
                  )}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="What's on your mind? Write freely — this is your private space…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            maxLength={10000}
            className="border-0 focus-visible:ring-0 px-0 resize-none text-sm leading-relaxed placeholder:text-muted-foreground"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-indigo-50">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Mira will provide a thoughtful reflection after saving</span>
            </div>
            <span>{wordCount} words</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Link href="/journal">
          <Button variant="outline" className="border-indigo-100">Cancel</Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim() || loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90 gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving & reflecting…</> : <><Sparkles className="w-4 h-4" /> Save & get reflection</>}
        </Button>
      </div>
    </div>
  );
}
