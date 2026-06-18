"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Check, Heart } from "lucide-react";

type Step = "register" | "verify";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColor = score === 3 ? "bg-emerald-500" : score === 2 ? "bg-indigo-400" : "bg-rose-400";
  if (!password) return null;
  return (
    <div className="space-y-2 mt-2">
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${(score / 3) * 100}%` }}
        />
      </div>
      <div className="flex gap-4">
        {checks.map(({ label, ok }) => (
          <span key={label} className={`text-xs flex items-center gap-1 transition-colors ${ok ? "text-emerald-600" : "text-slate-400"}`}>
            {ok && <Check className="w-3 h-3" />}{label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialStep = searchParams.get("verify") === "true" ? "verify" : "register";
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: initialEmail, password: "" });
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.confirmed) {
        // Email confirmation disabled — log in immediately
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error);
        router.push(loginData.user?.onboardingComplete ? "/dashboard" : "/onboarding");
      } else {
        // Email confirmation enabled — show verify step
        setStep("verify");
        toast({ title: "Check your email!", description: "We sent a verification code to " + form.email });
      }
    } catch (err: unknown) {
      toast({ title: "Sign up failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      router.push(loginRes.ok ? "/onboarding" : "/login");
    } catch (err: unknown) {
      toast({ title: "Verification failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await fetch("/api/auth/confirm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      toast({ title: "Code resent!", description: "Check your email for a new code." });
    } catch {
      toast({ title: "Failed to resend", description: "Please try again.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-indigo-700 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {step === "register" ? "Start your wellness journey" : "Verify your email"}
        </h1>
        <p className="text-slate-500 text-sm">
          {step === "register" ? "Create your free Mindora account" : `We sent a code to ${form.email}`}
        </p>
      </div>

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-900">
            {step === "register" ? "Create account" : "Enter verification code"}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {step === "register" ? "Free forever, upgrade anytime" : "Enter the 6-digit code from your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Full name</Label>
                <Input id="name" placeholder="Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoComplete="name" className="border-slate-200 focus:border-slate-400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="border-slate-200 focus:border-slate-400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="new-password"
                    className="border-slate-200 focus:border-slate-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors" aria-label={showPassword ? "Hide" : "Show"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account…</> : "Create free account"}
              </Button>
              <p className="text-xs text-center text-slate-400">
                By signing up you agree to our{" "}
                <Link href="/terms" className="underline hover:text-slate-600">Terms</Link> and{" "}
                <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-700">6-digit code</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="border-slate-200 text-center text-2xl tracking-widest font-mono focus:border-slate-400"
                  autoComplete="one-time-code"
                />
              </div>
              <Button type="submit" disabled={loading || code.length < 6} className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</> : "Verify email"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-sm text-slate-500 hover:text-slate-800" onClick={handleResend} disabled={resending}>
                {resending ? "Resending…" : "Didn't get a code? Resend"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-slate-800 hover:underline font-semibold">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse bg-slate-100 rounded-2xl" />}>
      <SignupForm />
    </Suspense>
  );
}
