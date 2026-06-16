import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createPortalSession } from "@/lib/stripe";
import { getUser } from "@/lib/db";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(session.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    const portalSession = await createPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Failed to open billing portal." }, { status: 500 });
  }
}
