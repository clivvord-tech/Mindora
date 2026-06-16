import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { updateUser } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2).max(60).optional(),
  reminderTime: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, reminderTime } = schema.parse(await req.json());

    await updateUser(session.id, {
      ...(name && { name }),
      reminderTime: reminderTime ?? undefined,
    });

    // Sync name to Supabase auth metadata
    if (name) {
      const supabase = await createClient();
      await supabase.auth.updateUser({ data: { name } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[profile]", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
