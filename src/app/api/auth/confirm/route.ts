import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const confirmSchema = z.object({ email: z.string().email(), code: z.string().length(6) });
const resendSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = confirmSchema.parse(body);
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    if (error) {
      if (error.message.includes("expired")) return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email } = resendSchema.parse(await req.json());
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return NextResponse.json({ error: "Could not resend code." }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not resend code." }, { status: 500 });
  }
}
