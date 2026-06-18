"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("reset");
      toast({ title: "Code sent!", description: "Check your email for the reset code." });
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Password reset!", description: "You can now sign in with your new password." });
      router.push("/login");
    } catch (err: unknown) {
      toast({ title: "Reset failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {step === "email" ? "Forgot password?" : "Reset your password"}
        </h1>
        <p className="text-slate-500 text-sm">
          {step === "email" ? "Enter your email and we'll send a reset code." : `Enter the code sent to ${email}`}
        </p>
      </div>

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-900">
            {step === "email" ? "Send reset code" : "Set new password"}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {step === "email" ? "We'll send a 6-digit code to your email." : "Enter the code and your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="border-slate-200 focus:border-slate-400" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-700">6-digit code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" maxLength={6} required className="border-slate-200 text-center text-xl tracking-widest font-mono focus:border-slate-400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">New password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New strong password" required className="border-slate-200 focus:border-slate-400 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading || code.length < 6 || password.length < 8} className="w-full bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting…</> : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="hover:text-slate-800 inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>
      </p>
    </div>
  );
}
