"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Edit2, Trash2, Sparkles, Save, X, Loader2 } from "lucide-react";
import type { JournalRecord } from "@/lib/db";

export default function JournalEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const entryId = params.entryId as string;

  const [entry, setEntry] = useState<JournalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/journal/entry/${entryId}`);
      if (!res.ok) { router.push("/journal"); return; }
      const data = await res.json();
      setEntry(data.entry);
      setEditTitle(data.entry.title);
      setEditContent(data.entry.content);
    } catch {
      router.push("/journal");
    } finally {
      setLoading(false);
    }
  }, [entryId, router]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/journal/entry/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setEntry((e) => e ? { ...e, title: editTitle, content: editContent } : e);
      setEditing(false);
      toast({ title: "Entry updated" });
    } catch {
      toast({ title: "Couldn't save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this journal entry? This can't be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/journal/entry/${entryId}`, { method: "DELETE" });
      toast({ title: "Entry deleted" });
      router.push("/journal");
    } catch {
      toast({ title: "Couldn't delete", variant: "destructive" });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/journal">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Journal
          </Button>
        </Link>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-muted-foreground">
                <Edit2 className="w-4 h-4" /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditTitle(entry.title); setEditContent(entry.content); }} className="gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Entry content */}
      <Card className="border-indigo-50 shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            {editing ? (
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border-0 border-b border-indigo-100 rounded-none focus-visible:ring-0 px-0 text-xl font-bold" />
            ) : (
              <h1 className="text-xl font-bold">{entry.title}</h1>
            )}
            {entry.mood && <span className="text-3xl flex-shrink-0">{["", "😢", "😔", "😐", "🙂", "😄"][entry.mood]}</span>}
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
          {editing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={14}
              className="border-0 focus-visible:ring-0 px-0 resize-none text-sm leading-relaxed"
            />
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{entry.content}</div>
          )}
        </CardContent>
      </Card>

      {/* AI Reflection */}
      {entry.aiReflection && (
        <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-700">Mira's reflection</p>
                <p className="text-xs text-muted-foreground">AI-generated insight for this entry</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 italic">"{entry.aiReflection}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
