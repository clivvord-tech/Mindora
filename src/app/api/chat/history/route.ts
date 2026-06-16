import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getChatHistory } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const messages = await getChatHistory(session.id, 50);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[chat/history]", err);
    return NextResponse.json({ error: "Failed to fetch chat history." }, { status: 500 });
  }
}
