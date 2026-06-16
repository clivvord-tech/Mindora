import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const sendSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(req: NextRequest) {
  try {
    const { email } = sendSchema.parse(await req.json());
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    });
    // Always return success to prevent email enumeration
    if (error) console.error("[forgot-password]", error);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, code, newPassword } = resetSchema.parse(await req.json());
    const supabase = await createClient();
    const { error: otpError } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
    if (otpError) {
      if (otpError.message.includes("expired")) return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) return NextResponse.json({ error: "Password reset failed." }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
