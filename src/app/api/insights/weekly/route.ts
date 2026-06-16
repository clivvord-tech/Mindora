import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMoodEntries, getJournalEntries } from "@/lib/db";
import { generateInsight } from "@/lib/aws/bedrock";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly";
    const limit = period === "monthly" ? 30 : period === "quarterly" ? 90 : 7;

    const [moods, journals] = await Promise.all([
      getMoodEntries(session.id, limit),
      getJournalEntries(session.id, Math.min(limit, 20)),
    ]);

    if (moods.length === 0) {
      return NextResponse.json({ insight: null, stats: null, chartData: [] });
    }

    const avgMood = moods.reduce((s, m) => s + m.score, 0) / moods.length;
    const scores = moods.map((m) => m.score);
    const recentAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
    const olderAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
    const trend = scores.length >= 4 ? (recentAvg > olderAvg ? "improving" : recentAvg < olderAvg ? "declining" : "stable") : "stable";

    const moodSummary = moods
      .slice(0, 10)
      .map((m) => `${m.date}: ${m.emoji} ${m.score}/5${m.note ? ` — "${m.note}"` : ""}`)
      .join("\n");

    const journalThemes = journals.slice(0, 5).map((j) => `"${j.title}"`).join(", ");

    const prompt = `Analyze this user's ${period} mental wellness data and provide compassionate, actionable insights.

Mood entries (${moods.length} entries, avg: ${avgMood.toFixed(1)}/5, trend: ${trend}):
${moodSummary}
${journals.length > 0 ? `\nRecent journal topics: ${journalThemes}` : ""}

Provide a warm, personalized insight in 3-4 sentences covering: a positive pattern or strength, a potential trigger or area to watch, and one specific evidence-based suggestion. Be empathetic and specific, not generic.`;

    let insight: string | null = null;
    try { insight = await generateInsight(prompt); } catch { /* non-blocking */ }

    return NextResponse.json({
      insight,
      stats: {
        avgMood: Number(avgMood.toFixed(2)),
        trend,
        totalEntries: moods.length,
        journalCount: journals.length,
        highestMood: Math.max(...scores),
        lowestMood: Math.min(...scores),
      },
      chartData: [...moods].reverse().map((m) => ({
        date: m.date,
        score: m.score,
        emoji: m.emoji,
        note: m.note || "",
      })),
    });
  } catch (err) {
    console.error("[insights/weekly]", err);
    return NextResponse.json({ error: "Failed to generate insights." }, { status: 500 });
  }
}
