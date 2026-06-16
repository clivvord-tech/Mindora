import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMoodEntries, getMoodByDate } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "30"), 90);
    const today = new Date().toISOString().split("T")[0];

    const [entries, todayEntry] = await Promise.all([
      getMoodEntries(session.id, limit),
      getMoodByDate(session.id, today),
    ]);

    return NextResponse.json({ entries, todayEntry });
  } catch (err) {
    console.error("[mood/history]", err);
    return NextResponse.json({ error: "Failed to fetch mood history." }, { status: 500 });
  }
}
