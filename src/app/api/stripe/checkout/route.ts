import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createCheckoutSession } from "@/lib/stripe";
import { getUser } from "@/lib/db";
import { PLANS } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["basic", "plus", "premium"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { plan } = schema.parse(body);

    const user = await getUser(session.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const checkoutSession = await createCheckoutSession(
      session.id,
      plan,
      session.email,
      user.stripeCustomerId
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
