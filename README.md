# 🧠 Mindora — AI-Powered Mental Wellness App

A production-ready, full-stack mental wellness web application built with Next.js 16, AWS Bedrock, Supabase, and Stripe.

## ✨ Features

- **AI Therapist "Mira"** — Empathetic CBT-inspired AI powered by Claude 3.5 Sonnet via Amazon Bedrock with streaming responses
- **Daily Mood Check-in** — Emoji mood selector with AI-generated insights and streak tracking
- **Reflective Journal** — Private journaling with AI reflections after each entry
- **Mood Insights Dashboard** — Beautiful charts (Recharts) showing trends over 7/30/90 days
- **Streak Tracking** — Gamified daily check-in streaks
- **Subscription Billing** — Three tiers (Basic $1, Plus $5, Premium $10) via Stripe
- **Safety Guardrails** — Crisis detection in chat and journal, immediate 988 resource display
- **Secure Auth** — Supabase Auth with email/password + email verification + forgot password

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase (Postgres) |
| AI | Amazon Bedrock (Claude 3.5 Sonnet) |
| Payments | Stripe Subscriptions |
| Hosting | AWS Amplify |
| Charts | Recharts |

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up Supabase database
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste and run the contents of `scripts/schema.sql`

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ☁️ Setup Guides

### Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**
3. Run `scripts/schema.sql` in the SQL editor — creates all tables, indexes, RLS policies, and a trigger to auto-create profiles on signup
4. In **Authentication → Email**, enable **Confirm email** and optionally set a custom SMTP

### Amazon Bedrock
1. Enable Claude 3.5 Sonnet model access in AWS Bedrock console
2. Ensure your IAM user has `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` permissions
3. Set `BEDROCK_MODEL_ID` and `BEDROCK_REGION` in `.env.local`

### Stripe
1. Create products and prices for each plan in Stripe Dashboard
2. Set up a webhook endpoint pointing to `/api/stripe/webhook`
3. Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🏗 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup, Onboarding, Forgot Password
│   ├── (dashboard)/     # Dashboard, Chat, Mood, Journal, Insights, Billing, Settings
│   ├── api/             # All API routes
│   │   ├── auth/        # login, signup, logout, me, confirm, onboarding, profile, callback
│   │   ├── chat/        # stream, history
│   │   ├── mood/        # checkin, history
│   │   ├── journal/     # entries, entry/[entryId]
│   │   ├── insights/    # weekly
│   │   └── stripe/      # checkout, portal, webhook
│   ├── safety/
│   ├── privacy/
│   ├── terms/
│   └── page.tsx         # Marketing landing page
├── components/
│   ├── ui/              # shadcn/ui base components
│   └── dashboard/       # Dashboard-specific components
├── lib/
│   ├── supabase/        # server.ts + client.ts
│   ├── aws/             # bedrock.ts
│   ├── stripe/          # index.ts
│   ├── db.ts            # Database helper functions (Supabase Postgres)
│   ├── session.ts       # Session helper (Supabase Auth)
│   └── utils.ts
├── hooks/
├── types/
└── proxy.ts             # Route protection middleware
scripts/
└── schema.sql           # Supabase Postgres schema + RLS policies
```

## 🔒 Security

- Supabase Auth sessions stored in HttpOnly cookies via `@supabase/ssr`
- Row Level Security (RLS) on all tables — users can only access their own data
- All API routes validate session server-side
- Input validation with Zod on all API endpoints
- Crisis detection on all user-generated content
- Rate limiting on chat endpoint (20 req/min per user)

## 🚨 Safety Features

- Crisis keyword detection in chat and journal
- Immediate display of 988 Suicide & Crisis Lifeline
- Crisis Text Line (741741) resources
- Prominent "not a replacement for therapy" disclaimers on every page
- Emergency button visible in navigation

## 📦 Deployment (AWS Amplify)

1. Push to a Git repository (GitHub, CodeCommit, etc.)
2. Connect repository in AWS Amplify Console
3. Set all environment variables in Amplify Console
4. Amplify auto-detects `amplify.yml` and builds/deploys

## ⚠️ Disclaimer

Mindora is a mental wellness **support tool**, not a licensed therapy platform. Mira is an AI companion and not a substitute for professional mental health treatment.
