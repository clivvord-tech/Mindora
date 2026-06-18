import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { upsertUser } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  name: z.string().min(2).max(60),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = schema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If email confirmation is disabled, the session is created immediately
    // data.session will be non-null and user will be confirmed
    const confirmed = !!data.session || !!data.user?.confirmed_at;

    if (confirmed && data.user) {
      await upsertUser({ id: data.user.id, email, name });
      return NextResponse.json({ success: true, confirmed: true });
    }

    // Email confirmation is enabled — user needs to verify
    return NextResponse.json({ success: true, confirmed: false });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[signup]", err);
    return NextResponse.json({ error: "Sign up failed. Please try again." }, { status: 500 });
  }
}
