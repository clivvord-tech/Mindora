import { createClient } from "@/lib/supabase/server";

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: "basic" | "plus" | "premium";
  onboardingComplete: boolean;
  goals: string[];
  reminderTime?: string;
  streakDays: number;
  lastCheckIn?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return dbRowToProfile(data);
}

export async function upsertUser(data: Partial<UserProfile> & { id: string; email: string }) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  await supabase.from("profiles").upsert({
    id: data.id,
    email: data.email,
    name: data.name ?? data.email.split("@")[0],
    plan: data.plan ?? "basic",
    onboarding_complete: data.onboardingComplete ?? false,
    goals: data.goals ?? [],
    reminder_time: data.reminderTime ?? null,
    streak_days: data.streakDays ?? 0,
    last_check_in: data.lastCheckIn ?? null,
    stripe_customer_id: data.stripeCustomerId ?? null,
    stripe_subscription_id: data.stripeSubscriptionId ?? null,
    updated_at: now,
    created_at: data.createdAt ?? now,
  });
}

export async function updateUser(userId: string, updates: Partial<UserProfile>) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.plan !== undefined) payload.plan = updates.plan;
  if (updates.onboardingComplete !== undefined) payload.onboarding_complete = updates.onboardingComplete;
  if (updates.goals !== undefined) payload.goals = updates.goals;
  if (updates.reminderTime !== undefined) payload.reminder_time = updates.reminderTime;
  if (updates.streakDays !== undefined) payload.streak_days = updates.streakDays;
  if (updates.lastCheckIn !== undefined) payload.last_check_in = updates.lastCheckIn;
  if (updates.stripeCustomerId !== undefined) payload.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) payload.stripe_subscription_id = updates.stripeSubscriptionId;
  await supabase.from("profiles").update(payload).eq("id", userId);
}

function dbRowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    plan: (row.plan as "basic" | "plus" | "premium") ?? "basic",
    onboardingComplete: (row.onboarding_complete as boolean) ?? false,
    goals: (row.goals as string[]) ?? [],
    reminderTime: row.reminder_time as string | undefined,
    streakDays: (row.streak_days as number) ?? 0,
    lastCheckIn: row.last_check_in as string | undefined,
    stripeCustomerId: row.stripe_customer_id as string | undefined,
    stripeSubscriptionId: row.stripe_subscription_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── MOOD ──────────────────────────────────────────────────────────────────────
export interface MoodRecord {
  entryId: string;
  userId: string;
  score: number;
  emoji: string;
  note?: string;
  aiInsight?: string;
  tags: string[];
  date: string;
  createdAt: string;
}

export async function createMoodEntry(data: Omit<MoodRecord, "entryId" | "createdAt">) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("mood_entries")
    .insert({
      user_id: data.userId,
      score: data.score,
      emoji: data.emoji,
      note: data.note ?? null,
      ai_insight: data.aiInsight ?? null,
      tags: data.tags,
      date: data.date,
      created_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return dbRowToMood(row);
}

export async function getMoodEntries(userId: string, limit = 30): Promise<MoodRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []).map(dbRowToMood);
}

export async function getMoodByDate(userId: string, date: string): Promise<MoodRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  return data ? dbRowToMood(data) : null;
}

function dbRowToMood(row: Record<string, unknown>): MoodRecord {
  return {
    entryId: row.id as string,
    userId: row.user_id as string,
    score: row.score as number,
    emoji: row.emoji as string,
    note: row.note as string | undefined,
    aiInsight: row.ai_insight as string | undefined,
    tags: (row.tags as string[]) ?? [],
    date: row.date as string,
    createdAt: row.created_at as string,
  };
}

// ─── JOURNAL ───────────────────────────────────────────────────────────────────
export interface JournalRecord {
  entryId: string;
  userId: string;
  title: string;
  content: string;
  aiReflection?: string;
  mood?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function createJournalEntry(data: Omit<JournalRecord, "entryId" | "createdAt" | "updatedAt">) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: data.userId,
      title: data.title,
      content: data.content,
      ai_reflection: data.aiReflection ?? null,
      mood: data.mood ?? null,
      tags: data.tags,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return dbRowToJournal(row);
}

export async function getJournalEntries(userId: string, limit = 20): Promise<JournalRecord[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(dbRowToJournal);
}

export async function getJournalEntry(userId: string, entryId: string): Promise<JournalRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? dbRowToJournal(data) : null;
}

export async function updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalRecord>) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.mood !== undefined) payload.mood = updates.mood;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.aiReflection !== undefined) payload.ai_reflection = updates.aiReflection;
  await supabase.from("journal_entries").update(payload).eq("id", entryId).eq("user_id", userId);
}

export async function deleteJournalEntry(userId: string, entryId: string) {
  const supabase = await createClient();
  await supabase.from("journal_entries").delete().eq("id", entryId).eq("user_id", userId);
}

function dbRowToJournal(row: Record<string, unknown>): JournalRecord {
  return {
    entryId: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    content: row.content as string,
    aiReflection: row.ai_reflection as string | undefined,
    mood: row.mood as number | undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── CHAT ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  messageId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  sessionId: string;
  createdAt: string;
}

export async function saveChatMessage(data: Omit<ChatMessage, "messageId" | "createdAt">) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: data.userId,
      role: data.role,
      content: data.content,
      session_id: data.sessionId,
      created_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return dbRowToChat(row);
}

export async function getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(dbRowToChat).reverse();
}

function dbRowToChat(row: Record<string, unknown>): ChatMessage {
  return {
    messageId: row.id as string,
    userId: row.user_id as string,
    role: row.role as "user" | "assistant",
    content: row.content as string,
    sessionId: row.session_id as string,
    createdAt: row.created_at as string,
  };
}
