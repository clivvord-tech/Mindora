import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getChatHistory, saveChatMessage } from "@/lib/db";
import { streamChatResponse, detectCrisis, CRISIS_RESPONSE } from "@/lib/aws/bedrock";
import { getUser } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
});

// Simple in-memory rate limit (per user, per minute)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(userId, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!checkRateLimit(session.id)) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { message, sessionId: existingSessionId } = schema.parse(body);
    const sessionId = existingSessionId || uuidv4();

    // Crisis detection — immediate safety response
    if (detectCrisis(message)) {
      await saveChatMessage({ userId: session.id, role: "user", content: message, sessionId });
      await saveChatMessage({ userId: session.id, role: "assistant", content: CRISIS_RESPONSE, sessionId });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(CRISIS_RESPONSE));
          controller.close();
        },
      });
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Session-Id": sessionId,
          "X-Crisis-Detected": "true",
        },
      });
    }

    // Load chat history for context (last 20 messages)
    const history = await getChatHistory(session.id, 20);
    const user = await getUser(session.id);

    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ];

    // Save user message immediately
    await saveChatMessage({ userId: session.id, role: "user", content: message, sessionId });

    // Stream from Bedrock
    const bedrockStream = await streamChatResponse(messages, user?.name);

    // Collect full response to save to DB
    let fullResponse = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullResponse += text;
        controller.enqueue(chunk);
      },
      async flush() {
        // Save assistant response after streaming completes
        if (fullResponse) {
          await saveChatMessage({ userId: session.id, role: "assistant", content: fullResponse, sessionId }).catch(console.error);
        }
      },
    });

    return new NextResponse(bedrockStream.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "X-Session-Id": sessionId,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[chat/stream]", err);
    return NextResponse.json({ error: "Failed to get response. Please try again." }, { status: 500 });
  }
}
