"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

type Period = "weekly" | "monthly" | "quarterly";

interface Stats { avgMood: number; trend: string; totalEntries: number; journalCount: number; highestMood: number; lowestMood: number; }
interface ChartPoint { date: string; score: number; emoji: string; note: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    const emojis = ["", "😢", "😔", "😐", "🙂", "😄"];
    return (
      <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-card text-sm">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-bold">{emojis[payload[0].value]} {payload[0].value}/5</p>
      </div>
    );
  }
  return null;
};

export default function InsightsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("weekly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch(`/api/insights/weekly?period=${period}`);
      const data = await res.json();
      setInsight(data.insight);
      setStats(data.stats);
      setChartData(data.chartData ?? []);
    } catch {
      toast({ title: "Couldn't load insights", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, toast]);

  useEffect(() => { load(); }, [load]);

  const TrendIcon = stats?.trend === "improving" ? TrendingUp : stats?.trend === "declining" ? TrendingDown : Minus;
  const trendColor = stats?.trend === "improving" ? "text-green-600" : stats?.trend === "declining" ? "text-red-500" : "text-blue-500";

  const barData = [1, 2, 3, 4, 5].map((score) => ({
    score: ["😢 Very Sad", "😔 Sad", "😐 Neutral", "🙂 Happy", "😄 Very Happy"][score - 1],
    count: chartData.filter((d) => d.score === score).length,
  }));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground text-sm">AI-powered patterns from your mood & journal data.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["weekly", "monthly", "quarterly"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0" : "border-indigo-100"}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={() => load(true)} disabled={refreshing} title="Refresh insights">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : !stats ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="font-semibold">Not enough data yet</h3>
          <p className="text-sm text-muted-foreground">Check in daily and write in your journal to unlock insights.</p>
        </div>
      ) : (
        <>
          {/* AI Insight */}
          {insight && (
            <Card className="border-purple-100 bg-gradient-to-br from-purple-50 via-indigo-50 to-white shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Mira's {period} insight</p>
                    <p className="text-xs text-muted-foreground">Personalised AI analysis</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{insight}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Average mood", value: `${stats.avgMood}/5`, sub: "Out of 5" },
              { label: "Trend", value: stats.trend, sub: "Direction", icon: <TrendIcon className={`w-5 h-5 ${trendColor}`} /> },
              { label: "Check-ins", value: stats.totalEntries, sub: `This ${period.replace("ly","").replace("quarter","3 months")}` },
              { label: "Journal entries", value: stats.journalCount, sub: "Reflections written" },
            ].map(({ label, value, sub, icon }) => (
              <Card key={label} className="border-indigo-50 shadow-card">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold capitalize">{value}</p>
                    {icon}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Line chart */}
          <Card className="border-indigo-50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mood over time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => {
                      const date = new Date(d + "T00:00:00");
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={stats.avgMood} stroke="#a5b4fc" strokeDasharray="4 4" label={{ value: "avg", fontSize: 10, fill: "#a5b4fc" }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data for this period</div>
              )}
            </CardContent>
          </Card>

          {/* Bar chart — mood distribution */}
          <Card className="border-indigo-50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mood distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f8" vertical={false} />
                  <XAxis dataKey="score" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} days`, "Count"]} />
                  <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Range summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-100 bg-green-50/50 shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Best mood</p>
                <p className="text-2xl mt-1">{["", "😢", "😔", "😐", "🙂", "😄"][stats.highestMood]}</p>
                <Badge variant="success" className="mt-1">{stats.highestMood}/5</Badge>
              </CardContent>
            </Card>
            <Card className="border-orange-100 bg-orange-50/50 shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Lowest mood</p>
                <p className="text-2xl mt-1">{["", "😢", "😔", "😐", "🙂", "😄"][stats.lowestMood]}</p>
                <Badge variant="warning" className="mt-1">{stats.lowestMood}/5</Badge>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
