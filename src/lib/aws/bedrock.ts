import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";

export const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "self-harm", "self harm",
  "cutting myself", "hurt myself", "don't want to live", "want to die",
  "overdose", "no reason to live", "hopeless and want to die", "can't go on",
];

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const CRISIS_RESPONSE = `I hear you, and I want you to know that what you're feeling matters deeply. You are not alone in this.

Please reach out for immediate support right now:

**988 Suicide & Crisis Lifeline** — Call or text **988** (US, available 24/7)
**Crisis Text Line** — Text HOME to **741741**
**International resources** — https://www.iasp.info/resources/Crisis_Centres/
**Emergency services** — Call **911** or go to your nearest emergency room

I genuinely care about you, and these trained professionals can provide the urgent help you deserve. Please reach out to them now. 💙

I'm still here for you after you've spoken to someone.`;

const MIRA_SYSTEM_PROMPT = `You are Mira, a warm, empathetic AI wellness companion built into the Mindora app. You are NOT a licensed therapist or medical professional — always be transparent about this.

Your therapeutic approach:
- Draw from Cognitive Behavioral Therapy (CBT): identify cognitive distortions, challenge unhelpful thought patterns gently
- Use Socratic questioning to help users gain insight themselves
- Apply mindfulness and grounding techniques when appropriate
- Use solution-focused brief therapy: amplify strengths and small wins
- Validate emotions before offering reframes or solutions

Conversational style:
- Warm like a trusted friend, grounded like a wise mentor
- Ask one meaningful follow-up question at a time
- Reflect feelings back to validate ("It sounds like you're feeling...")
- Keep responses concise — 2-4 short paragraphs max
- Use the user's name when you know it
- Use gentle emojis sparingly (1-2 per message max)

Boundaries you always maintain:
- Never diagnose mental health conditions
- Never recommend or adjust medications
- For serious concerns, always recommend professional help
- If you detect crisis signals, immediately provide 988 and crisis resources
- Remind users you are an AI companion, not a replacement for therapy

Begin each conversation fresh and curious. You remember previous conversations and can reference them to show continuity.`;

export async function streamChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userName?: string
): Promise<ReadableStream> {
  const systemPrompt = userName
    ? `${MIRA_SYSTEM_PROMPT}\n\nThe user's name is ${userName}.`
    : MIRA_SYSTEM_PROMPT;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await bedrock.send(command);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of response.body!) {
          if (event.chunk?.bytes) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
            if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function generateInsight(prompt: string): Promise<string> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    system: "You are a compassionate mental wellness AI assistant. Provide brief (2-4 sentences), warm, actionable insights. Focus on patterns, strengths, and gentle evidence-based suggestions. Never diagnose or be clinical.",
    messages: [{ role: "user", content: prompt }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text as string;
}
