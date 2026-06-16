import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createJournalEntry, getJournalEntries } from "@/lib/db";
import { generateInsight } from "@/lib/aws/bedrock";
import { detectCrisis } from "@/lib/aws/bedrock";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  mood: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
    const entries = await getJournalEntries(session.id, limit);

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[journal/entries GET]", err);
    return NextResponse.json({ error: "Failed to fetch entries." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, content, mood, tags } = createSchema.parse(body);

    // Crisis check on journal content
    const hasCrisis = detectCrisis(content) || detectCrisis(title);

    let aiReflection: string | undefined;
    if (!hasCrisis) {
      try {
        const prompt = `A user wrote this journal entry titled "${title}":

"${content.slice(0, 2000)}"

${mood ? `Their current mood is ${mood}/5.` : ""}

Provide a thoughtful, warm, 3-4 sentence reflection. Identify any emotional patterns or themes, acknowledge their feelings, and offer one gentle, evidence-based suggestion or reframe. Be personal, not generic.`;
        aiReflection = await generateInsight(prompt);
      } catch {
        // Non-blocking
      }
    }

    const entry = await createJournalEntry({
      userId: session.id,
      title,
      content,
      aiReflection,
      mood,
      tags: tags || [],
    });

    return NextResponse.json({ entry, hasCrisis });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[journal/entries POST]", err);
    return NextResponse.json({ error: "Failed to create entry." }, { status: 500 });
  }
}
