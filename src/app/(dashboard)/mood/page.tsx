"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MOOD_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles, Flame, CheckCircle, ArrowRight } from "lucide-react";

export default function MoodPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<number>(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  // Check if already checked in today
  useEffect(() => {
    fetch("/api/mood/history?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.todayEntry) setAlreadyCheckedIn(true);
      })
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setStreakDays(data.user?.streakDays ?? 0))
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mood/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: selected, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setAlreadyCheckedIn(true);
          return;
        }
        throw new Error(data.error);
      }
      setInsight(data.aiInsight ?? null);
      setSubmitted(true);
      setStreakDays((s) => s + 1);
    } catch (err: unknown) {
      toast({ title: "Couldn't save check-in", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (alreadyCheckedIn && !submitted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in text-center pt-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Already checked in today!</h1>
        <p className="text-muted-foreground">You've already logged your mood for today. Come back tomorrow to keep your streak going.</p>
        <div className="flex items-center justify-center gap-2 text-orange-500 font-semibold">
          <Flame className="w-5 h-5" />
          <span>{streakDays} day streak — keep it up!</span>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          <Button className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]" onClick={() => router.push("/journal")}>
            Write in journal
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const moodOption = MOOD_OPTIONS.find((m) => m.score === selected)!;
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in text-center pt-10">
        <div className="text-6xl animate-bounce">{moodOption.emoji}</div>
        <div>
          <h1 className="text-2xl font-bold">Check-in complete!</h1>
          <p className="text-muted-foreground mt-1">You're feeling <span className="font-semibold text-foreground">{moodOption.label}</span> today.</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-orange-500 font-semibold text-lg">
          <Flame className="w-6 h-6" />
          <span>{streakDays} day streak 🎉</span>
        </div>
        {insight && (
          <Card className="border-slate-100 bg-slate-50 shadow-card text-left">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-700">Mira's reflection</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          <Button
            className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] gap-2"
            onClick={() => router.push("/chat")}
          >
            <span>Talk to Mira</span> <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Daily check-in</h1>
        <p className="text-muted-foreground">How are you feeling right now? Be honest — this is just for you.</p>
        {streakDays > 0 && (
          <div className="inline-flex items-center gap-1.5 text-sm text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
            <Flame className="w-4 h-4" />
            {streakDays} day streak — great work!
          </div>
        )}
      </div>

      {/* Mood selector */}
      <div className="grid grid-cols-5 gap-3">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.score}
            onClick={() => setSelected(mood.score)}
            aria-label={mood.label}
            aria-pressed={selected === mood.score}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400",
              selected === mood.score
                ? "border-indigo-400 bg-indigo-50 scale-105 shadow-md"
                : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/40 shadow-sm"
            )}
          >
            <span className="text-3xl sm:text-4xl">{mood.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium leading-tight text-center">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Optional note */}
      {selected > 0 && (
        <div className="space-y-2 animate-fade-in">
          <label htmlFor="note" className="text-sm font-medium text-foreground/80">
            Want to add a note? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            id="note"
            placeholder="What's on your mind? Any particular reason for this mood?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            className="border-indigo-100 focus:border-indigo-300 resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{note.length}/500</p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!selected || loading}
        className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] h-11 text-base"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving & generating insight…</>
        ) : (
          `Log my mood ${selected ? MOOD_OPTIONS.find(m => m.score === selected)?.emoji ?? "" : ""}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your check-ins are private and encrypted. Mira uses them to give you personalised insights.
      </p>
    </div>
  );
}
