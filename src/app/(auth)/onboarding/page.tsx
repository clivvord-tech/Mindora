"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowRight, ArrowLeft, Loader2, Sparkles, Target, Bell } from "lucide-react";
import { MOOD_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "anxiety", label: "Manage anxiety", emoji: "🧘" },
  { id: "depression", label: "Improve mood", emoji: "🌤️" },
  { id: "stress", label: "Reduce stress", emoji: "💆" },
  { id: "sleep", label: "Better sleep", emoji: "😴" },
  { id: "relationships", label: "Relationships", emoji: "💞" },
  { id: "selfcare", label: "Self-care", emoji: "✨" },
  { id: "productivity", label: "Focus & productivity", emoji: "🎯" },
  { id: "grief", label: "Process grief", emoji: "🌱" },
];

const STEPS = [
  { id: "welcome", title: "Welcome to Mindora", subtitle: "Let's personalise your experience" },
  { id: "mood", title: "How are you feeling right now?", subtitle: "No judgment — just honest" },
  { id: "goals", title: "What brings you here?", subtitle: "Select all that apply" },
  { id: "reminder", title: "Set a daily reminder", subtitle: "Small habits create big changes" },
  { id: "ready", title: "You're all set!", subtitle: "Mira is ready to meet you" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    initialMood: 0,
    goals: [] as string[],
    reminderTime: "09:00",
    reminderEnabled: true,
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  function toggleGoal(id: string) {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(id) ? d.goals.filter((g) => g !== id) : [...d.goals, id],
    }));
  }

  async function finish() {
    setLoading(true);
    try {
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: data.goals,
          reminderTime: data.reminderEnabled ? data.reminderTime : null,
          initialMood: data.initialMood || null,
        }),
      });
      router.push("/dashboard");
    } catch {
      toast({ title: "Something went wrong", description: "Let's try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const canNext =
    (step === 0) ||
    (step === 1 && data.initialMood > 0) ||
    (step === 2 && data.goals.length > 0) ||
    step === 3 ||
    step === 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Mindora</span>
        </div>
        <span className="text-sm text-muted-foreground">{step + 1} of {STEPS.length}</span>
      </header>

      {/* Progress */}
      <div className="px-6">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg animate-fade-in" key={step}>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto shadow-glow-lg animate-float">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{STEPS[0].title}</h1>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  I'm Mira, your AI wellness companion. I'm here to listen, support, and help you understand yourself better.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left">
                <strong>A quick note:</strong> Mindora is a wellness support tool, not a replacement for professional therapy. If you're in crisis, please call <strong>988</strong>.
              </div>
            </div>
          )}

          {/* Step 1: Initial Mood */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{STEPS[1].title}</h2>
                <p className="text-muted-foreground">{STEPS[1].subtitle}</p>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {MOOD_OPTIONS.map((mood) => (
                  <button
                    key={mood.score}
                    onClick={() => setData({ ...data, initialMood: mood.score })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                      data.initialMood === mood.score
                        ? "border-indigo-400 bg-indigo-50 scale-105 shadow-md"
                        : "border-transparent bg-white hover:border-indigo-200 hover:bg-indigo-50/50 shadow-sm"
                    )}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-xs text-muted-foreground font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <Target className="w-7 h-7 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold">{STEPS[2].title}</h2>
                <p className="text-muted-foreground">{STEPS[2].subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                      data.goals.includes(goal.id)
                        ? "border-indigo-400 bg-indigo-50 shadow-sm"
                        : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                    )}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Reminder */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                  <Bell className="w-7 h-7 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold">{STEPS[3].title}</h2>
                <p className="text-muted-foreground">{STEPS[3].subtitle}</p>
              </div>
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-card p-6 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium">Enable daily reminders</span>
                  <div
                    onClick={() => setData({ ...data, reminderEnabled: !data.reminderEnabled })}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors cursor-pointer",
                      data.reminderEnabled ? "bg-indigo-500" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      data.reminderEnabled ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </div>
                </label>
                {data.reminderEnabled && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Reminder time</label>
                    <Input
                      type="time"
                      value={data.reminderTime}
                      onChange={(e) => setData({ ...data, reminderTime: e.target.value })}
                      className="border-indigo-100 w-40"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Ready */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg animate-float">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold">{STEPS[4].title}</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Mira is ready to support your journey. Remember — every small step counts. Let's begin.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Daily check-ins", emoji: "📊" },
                  { label: "AI conversations", emoji: "💬" },
                  { label: "Journal reflections", emoji: "📓" },
                ].map(({ label, emoji }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-indigo-50 shadow-sm">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-xs text-muted-foreground font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <footer className="p-6 flex justify-between items-center max-w-lg mx-auto w-full">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={finish}
            disabled={loading}
            className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</> : <>Go to dashboard <ArrowRight className="w-4 h-4" /></>}
          </Button>
        )}
      </footer>
    </div>
  );
}
