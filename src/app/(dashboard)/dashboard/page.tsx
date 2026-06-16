import { getSession } from "@/lib/session";
import { getUser, getMoodEntries, getJournalEntries, getChatHistory } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, moods, journals, chatMessages] = await Promise.all([
    getUser(session.id),
    getMoodEntries(session.id, 30),
    getJournalEntries(session.id, 5),
    getChatHistory(session.id, 10),
  ]);

  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const todayMood = moods.find((m) => m.date === today) ?? null;
  const avgMood = moods.length > 0 ? moods.reduce((s, m) => s + m.score, 0) / moods.length : 0;

  const chartData = [...moods].reverse().slice(-14).map((m) => ({
    date: m.date,
    score: m.score,
    emoji: m.emoji,
  }));

  return (
    <DashboardClient
      user={user}
      todayMood={todayMood}
      avgMood={Number(avgMood.toFixed(1))}
      streakDays={user.streakDays}
      recentMoods={moods.slice(0, 7)}
      recentJournals={journals}
      chatCount={chatMessages.length}
      chartData={chartData}
    />
  );
}
