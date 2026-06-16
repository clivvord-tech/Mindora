import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createMoodEntry, getMoodByDate, updateUser, getUser } from "@/lib/db";
import { generateInsight } from "@/lib/aws/bedrock";
import { MOOD_OPTIONS } from "@/types";

const schema = z.object({
  score: z.number().min(1).max(5),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { score, note } = schema.parse(body);

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const existing = await getMoodByDate(session.id, today);
    if (existing) {
      return NextResponse.json({ error: "You've already checked in today!", entry: existing }, { status: 409 });
    }

    const moodOption = MOOD_OPTIONS.find((m) => m.score === score)!;

    // Generate AI insight
    let aiInsight: string | undefined;
    try {
      const prompt = `A user just logged their mood as "${moodOption.label}" (${score}/5).${note ? ` They added a note: "${note}"` : ""} 
      Provide a warm, brief (2-3 sentences) personalized reflection or gentle suggestion. Be empathetic and encouraging. Don't be generic.`;
      aiInsight = await generateInsight(prompt);
    } catch {
      // Non-blocking — insight is optional
    }

    const entry = await createMoodEntry({
      userId: session.id,
      score,
      emoji: moodOption.emoji,
      note,
      aiInsight,
      tags: [],
      date: today,
    });

    // Update streak
    const user = await getUser(session.id);
    if (user) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const newStreak = user.lastCheckIn === yesterdayStr ? user.streakDays + 1 : 1;
      await updateUser(session.id, { streakDays: newStreak, lastCheckIn: today });
    }

    return NextResponse.json({ entry, aiInsight });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[mood/checkin]", err);
    return NextResponse.json({ error: "Failed to save mood entry." }, { status: 500 });
  }
}
