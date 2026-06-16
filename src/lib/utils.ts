import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getMoodLabel(score: number): string {
  if (score >= 5) return "Very Happy";
  if (score >= 4) return "Happy";
  if (score >= 3) return "Neutral";
  if (score >= 2) return "Sad";
  return "Very Sad";
}

export function getMoodColor(score: number): string {
  if (score >= 5) return "text-yellow-500";
  if (score >= 4) return "text-green-500";
  if (score >= 3) return "text-blue-500";
  if (score >= 2) return "text-orange-500";
  return "text-red-500";
}

export function getMoodBg(score: number): string {
  if (score >= 5) return "bg-yellow-50 border-yellow-200";
  if (score >= 4) return "bg-green-50 border-green-200";
  if (score >= 3) return "bg-blue-50 border-blue-200";
  if (score >= 2) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}
