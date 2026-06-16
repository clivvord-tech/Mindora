"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, LogOut, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [form, setForm] = useState({ name: "", reminderTime: "09:00", reminderEnabled: true });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setForm({
            name: data.user.name || "",
            reminderTime: data.user.reminderTime || "09:00",
            reminderEnabled: !!data.user.reminderTime,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          reminderTime: form.reminderEnabled ? form.reminderTime : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Settings saved", variant: "default" });
    } catch {
      toast({ title: "Couldn't save settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Card className="border-indigo-50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="border-indigo-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reminders</CardTitle>
            <CardDescription>Set a daily check-in reminder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Enable daily reminder</span>
              <div
                onClick={() => setForm({ ...form, reminderEnabled: !form.reminderEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.reminderEnabled ? "bg-indigo-500" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.reminderEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </label>
            {form.reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="time">Reminder time</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                  className="border-indigo-100 w-36"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90 gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save settings</>}
        </Button>
      </form>

      <Separator className="bg-indigo-100" />

      {/* Danger zone */}
      <Card className="border-red-100 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <CardTitle className="text-base text-red-700">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign out of all devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
