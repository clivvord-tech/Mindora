"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Heart, LayoutDashboard, MessageCircle, BookOpen,
  TrendingUp, CreditCard, Settings, LogOut, Menu, X,
  Phone, AlertTriangle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat with Mira", icon: MessageCircle },
  { href: "/mood", label: "Mood Check-in", icon: Heart },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: TrendingUp },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function CrisisBanner() {
  return (
    <div className="bg-red-50 border-b border-red-100 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Mindora is not a replacement for professional therapy. In crisis?</span>
        </div>
        <a href="tel:988" className="flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-900 transition-colors">
          <Phone className="w-4 h-4" /> Call/Text 988
        </a>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    } finally {
      setSigningOut(false);
    }
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Mindora</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-slate-800" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-100">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-red-50 text-sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col">
      <CrisisBanner />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-64 flex-shrink-0 flex-col fixed top-[41px] left-0 bottom-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile header */}
        <div className="lg:hidden fixed top-[41px] left-0 right-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">Mindora</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-20 top-[89px]" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative w-72 h-full bg-white shadow-xl">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-64 mt-[41px] lg:mt-0">
          <div className="lg:hidden h-14" /> {/* mobile header spacer */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
