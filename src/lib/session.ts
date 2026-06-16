import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  plan: "basic" | "plus" | "premium";
  onboardingComplete: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, plan, onboarding_complete")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      name: profile?.name ?? user.email!.split("@")[0],
      plan: profile?.plan ?? "basic",
      onboardingComplete: profile?.onboarding_complete ?? false,
    };
  } catch {
    return null;
  }
}
