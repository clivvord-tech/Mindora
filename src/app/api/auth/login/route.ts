import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { upsertUser } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Please verify your email first.", code: "UNCONFIRMED" }, { status: 403 });
      }
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = data.user;
    const name = user.user_metadata?.name ?? email.split("@")[0];

    // Ensure profile row exists
    await upsertUser({ id: user.id, email, name });

    // Fetch full profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, onboarding_complete")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email,
        name,
        plan: profile?.plan ?? "basic",
        onboardingComplete: profile?.onboarding_complete ?? false,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
