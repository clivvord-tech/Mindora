"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { Plus, BookOpen, Sparkles, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { JournalRecord } from "@/lib/db";

export default function JournalPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal/entries?limit=50");
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      toast({ title: "Couldn't load journal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter((e) =>
    search === "" ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-muted-foreground text-sm">Your private space for reflection and growth.</p>
        </div>
        <Link href="/journal/new">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90 gap-2">
            <Plus className="w-4 h-4" /> New entry
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your journal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-indigo-100"
        />
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-indigo-50">
              <CardContent className="p-5 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <Link key={entry.entryId} href={`/journal/${entry.entryId}`}>
              <Card className="border-indigo-50 shadow-card card-hover cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <h3 className="font-semibold truncate group-hover:text-indigo-600 transition-colors">{entry.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{truncate(entry.content, 150)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
                        {entry.aiReflection && (
                          <span className="flex items-center gap-1 text-xs text-purple-600">
                            <Sparkles className="w-3 h-3" /> AI reflection
                          </span>
                        )}
                        {entry.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {entry.mood && (
                      <span className="text-2xl flex-shrink-0">
                        {["", "😢", "😔", "😐", "🙂", "😄"][entry.mood]}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">{search ? "No entries found" : "Your journal is empty"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Try a different search term." : "Writing regularly helps you understand patterns and process emotions."}
            </p>
          </div>
          {!search && (
            <Link href="/journal/new">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" /> Write your first entry
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
