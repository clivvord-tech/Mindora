"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, CreditCard, ExternalLink, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/stripe";

const PLAN_ORDER = ["basic", "plus", "premium"] as const;

function BillingContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<string>("basic");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setCurrentPlan(d.user?.plan ?? "basic")).catch(() => {});
    if (searchParams.get("success") === "true") {
      toast({ title: "Subscription activated! 🎉", description: "Welcome to your new plan." });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No changes were made." });
    }
  }, [searchParams, toast]);

  async function handleSubscribe(plan: string) {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      toast({ title: "Checkout failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handlePortal() {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err: unknown) {
      toast({ title: "Portal unavailable", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setOpeningPortal(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground text-sm">Manage your subscription and billing details.</p>
        </div>
        {currentPlan !== "basic" && (
          <Button variant="outline" onClick={handlePortal} disabled={openingPortal} className="gap-2 border-slate-200">
            {openingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage subscription
          </Button>
        )}
      </div>

      <Card className="border-slate-100 bg-slate-50">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg capitalize">{currentPlan}</p>
              <Badge variant={currentPlan === "premium" ? "default" : currentPlan === "plus" ? "secondary" : "outline"}>
                {currentPlan === "basic" ? "Free" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLAN_ORDER.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const isPopular = planKey === "plus";

          return (
            <Card
              key={planKey}
              className={`relative border-2 shadow-card transition-all duration-200 ${
                isPopular ? "border-slate-700 shadow-glow" : isCurrent ? "border-green-300" : "border-slate-100"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Current
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${isPopular && !isCurrent ? "bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97]" : ""}`}
                  variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
                  disabled={isCurrent || !!loadingPlan}
                  onClick={() => !isCurrent && handleSubscribe(planKey)}
                >
                  {loadingPlan === planKey ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>
                  ) : isCurrent ? "Current plan" : planKey === "basic" ? "Downgrade" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Payments securely processed by Stripe. Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto space-y-4"><div className="h-20 animate-pulse bg-indigo-50 rounded-2xl" /><div className="grid grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="h-64 animate-pulse bg-indigo-50 rounded-2xl" />)}</div></div>}>
      <BillingContent />
    </Suspense>
  );
}
