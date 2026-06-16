import Stripe from "stripe";

// Lazy-initialized — prevents build-time failure when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  basic: {
    name: "Basic",
    price: "$1",
    priceId: process.env.STRIPE_PRICE_BASIC || "price_basic",
    amount: 100,
    features: ["Daily mood check-in", "7-day mood history", "5 AI chats/month", "Basic journal (10 entries)"],
    chatLimit: 5,
    journalLimit: 10,
  },
  plus: {
    name: "Plus",
    price: "$5",
    priceId: process.env.STRIPE_PRICE_PLUS || "price_plus",
    amount: 500,
    features: ["Unlimited mood tracking", "100 AI chats/month", "Unlimited journal + AI reflections", "30-day insights", "Streak tracking"],
    chatLimit: 100,
    journalLimit: 9999,
  },
  premium: {
    name: "Premium",
    price: "$10",
    priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium",
    amount: 1000,
    features: ["Everything in Plus", "Unlimited AI chat", "Advanced analytics (3 months)", "Priority support", "Early access to features"],
    chatLimit: Infinity,
    journalLimit: Infinity,
  },
} as const;

export async function createCheckoutSession(
  userId: string,
  plan: keyof typeof PLANS,
  email: string,
  customerId?: string
) {
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    customer_email: customerId ? undefined : email,
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    allow_promotion_codes: true,
  });
}

export async function createPortalSession(customerId: string) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });
}
