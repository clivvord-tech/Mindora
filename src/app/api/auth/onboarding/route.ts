import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { updateUser, createMoodEntry } from "@/lib/db";
import { MOOD_OPTIONS } from "@/types";

const schema = z.object({
  goals: z.array(z.string()).min(1),
  reminderTime: z.string().nullable().optional(),
  initialMood: z.number().min(1).max(5).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goals, reminderTime, initialMood } = schema.parse(await req.json());

    await updateUser(session.id, {
      goals,
      reminderTime: reminderTime ?? undefined,
      onboardingComplete: true,
    });

    if (initialMood) {
      const today = new Date().toISOString().split("T")[0];
      const moodOption = MOOD_OPTIONS.find((m) => m.score === initialMood)!;
      await createMoodEntry({
        userId: session.id,
        score: initialMood,
        emoji: moodOption.emoji,
        tags: [],
        date: today,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[onboarding]", err);
    return NextResponse.json({ error: "Failed to complete onboarding." }, { status: 500 });
  }
}
