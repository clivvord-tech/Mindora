"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, getMoodColor } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  Heart, MessageCircle, BookOpen, TrendingUp, Flame,
  Plus, ArrowRight, Sparkles
} from "lucide-react";
import type { UserProfile, MoodRecord, JournalRecord } from "@/lib/db";

interface Props {
  user: UserProfile;
  todayMood: MoodRecord | null;
  avgMood: number;
  streakDays: number;
  recentMoods: MoodRecord[];
  recentJournals: JournalRecord[];
  chatCount: number;
  chartData: { date: string; score: number; emoji: string }[];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="border-indigo-50 shadow-card card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    const emojis = ["", "😢", "😔", "😐", "🙂", "😄"];
    return (
      <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-card text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-bold">{emojis[payload[0].value]} {payload[0].value}/5</p>
      </div>
    );
  }
  return null;
};

export function DashboardClient({ user, todayMood, avgMood, streakDays, recentMoods, recentJournals, chatCount, chartData }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {todayMood ? `You checked in today feeling ${todayMood.emoji}` : "You haven't checked in today yet."}
          </p>
        </div>
        {!todayMood && (
          <Link href="/mood">
            <Button className="bg-slate-800 text-white hover:bg-slate-700 hover:scale-[0.97] gap-2">
              <Plus className="w-4 h-4" /> Check in now
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day streak" value={streakDays} sub="Keep it up!" color="bg-slate-700" />
        <StatCard icon={Heart} label="Avg mood" value={avgMood > 0 ? `${avgMood}/5` : "—"} sub="Last 30 days" color="bg-indigo-600" />
        <StatCard icon={BookOpen} label="Journal entries" value={recentJournals.length} sub="This month" color="bg-slate-600" />
        <StatCard icon={MessageCircle} label="Chats with Mira" value={chatCount} sub="Recent messages" color="bg-indigo-500" />
      </div>

      {/* Mood Chart */}
      <Card className="border-indigo-50 shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mood trends — last 14 days</CardTitle>
            <Link href="/insights">
              <Button variant="ghost" size="sm" className="text-indigo-600 gap-1 text-xs">
                Full insights <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => {
                  const date = new Date(d + "T00:00:00");
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#4f46e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Log your first mood to see your trends here
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Moods */}
        <Card className="border-indigo-50 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent check-ins</CardTitle>
              <Link href="/mood">
                <Button variant="ghost" size="sm" className="text-indigo-600 text-xs gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMoods.length > 0 ? recentMoods.slice(0, 5).map((mood) => (
              <div key={mood.entryId} className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl">
                <span className="text-2xl">{mood.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getMoodColor(mood.score)}`}>
                      {mood.score}/5
                    </span>
                    <span className="text-xs text-muted-foreground">{mood.date}</span>
                  </div>
                  {mood.note && <p className="text-xs text-muted-foreground truncate mt-0.5">{mood.note}</p>}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">No mood entries yet. <Link href="/mood" className="text-indigo-600 underline">Check in now</Link></p>
            )}
          </CardContent>
        </Card>

        {/* Recent Journal */}
        <Card className="border-indigo-50 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent journal entries</CardTitle>
              <Link href="/journal">
                <Button variant="ghost" size="sm" className="text-indigo-600 text-xs gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJournals.length > 0 ? recentJournals.slice(0, 4).map((entry) => (
              <Link key={entry.entryId} href={`/journal/${entry.entryId}`}>
                <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer">
                  <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(entry.createdAt)}</p>
                    {entry.aiReflection && (
                      <div className="flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-600">AI reflection available</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">No journal entries yet. <Link href="/journal" className="text-indigo-600 underline">Write your first</Link></p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-slate-100 bg-slate-50/60 shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold">Quick actions</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/chat", icon: MessageCircle, label: "Chat with Mira", color: "bg-indigo-600" },
              { href: "/mood", icon: Heart, label: "Log mood", color: "bg-slate-700" },
              { href: "/journal", icon: BookOpen, label: "Write journal", color: "bg-slate-600" },
              { href: "/insights", icon: TrendingUp, label: "View insights", color: "bg-indigo-500" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-center">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
