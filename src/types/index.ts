// Shared TypeScript types across the app

export type Plan = "basic" | "plus" | "premium";

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export const MOOD_OPTIONS = [
  { score: 5 as MoodScore, emoji: "😄", label: "Very Happy", color: "text-yellow-500", bg: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { score: 4 as MoodScore, emoji: "🙂", label: "Happy",      color: "text-green-500",  bg: "bg-green-50  hover:bg-green-100  border-green-200"  },
  { score: 3 as MoodScore, emoji: "😐", label: "Neutral",    color: "text-blue-500",   bg: "bg-blue-50   hover:bg-blue-100   border-blue-200"   },
  { score: 2 as MoodScore, emoji: "😔", label: "Sad",        color: "text-orange-500", bg: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { score: 1 as MoodScore, emoji: "😢", label: "Very Sad",   color: "text-red-500",    bg: "bg-red-50    hover:bg-red-100    border-red-200"    },
] as const;

export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface MoodEntry {
  entryId: string;
  score: MoodScore;
  emoji: string;
  label: string;
  note?: string;
  aiInsight?: string;
  date: string;
  createdAt: string;
}

export interface JournalEntry {
  entryId: string;
  title: string;
  content: string;
  aiReflection?: string;
  mood?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  averageMood: number;
  moodTrend: "improving" | "declining" | "stable";
  streakDays: number;
  totalEntries: number;
  journalCount: number;
  chatSessions: number;
}

export const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "988", type: "call/text", available: "24/7", url: "tel:988" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741", type: "text", available: "24/7", url: "sms:741741" },
  { name: "International Association for Suicide Prevention", contact: "https://www.iasp.info/resources/Crisis_Centres/", type: "web", available: "24/7", url: "https://www.iasp.info/resources/Crisis_Centres/" },
  { name: "SAMHSA Helpline", contact: "1-800-662-4357", type: "call", available: "24/7", url: "tel:18006624357" },
];
