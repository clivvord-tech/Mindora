-- Mindora Supabase Schema
-- Run this in your Supabase project: Dashboard > SQL Editor > New Query

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  plan text not null default 'basic' check (plan in ('basic', 'plus', 'premium')),
  onboarding_complete boolean not null default false,
  goals text[] not null default '{}',
  reminder_time text,
  streak_days integer not null default 0,
  last_check_in date,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── MOOD ENTRIES ─────────────────────────────────────────────────────────────
create table if not exists mood_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  emoji text not null,
  note text,
  ai_insight text,
  tags text[] not null default '{}',
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists mood_entries_user_date on mood_entries(user_id, date desc);

-- ─── JOURNAL ENTRIES ──────────────────────────────────────────────────────────
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  content text not null,
  ai_reflection text,
  mood integer check (mood between 1 and 5),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_entries_user_created on journal_entries(user_id, created_at desc);

-- ─── CHAT MESSAGES ────────────────────────────────────────────────────────────
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  session_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_created on chat_messages(user_id, created_at desc);
create index if not exists chat_messages_session on chat_messages(session_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table mood_entries enable row level security;
alter table journal_entries enable row level security;
alter table chat_messages enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Mood entries
create policy "mood_select_own" on mood_entries for select using (auth.uid() = user_id);
create policy "mood_insert_own" on mood_entries for insert with check (auth.uid() = user_id);
create policy "mood_update_own" on mood_entries for update using (auth.uid() = user_id);

-- Journal entries
create policy "journal_select_own" on journal_entries for select using (auth.uid() = user_id);
create policy "journal_insert_own" on journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on journal_entries for update using (auth.uid() = user_id);
create policy "journal_delete_own" on journal_entries for delete using (auth.uid() = user_id);

-- Chat messages
create policy "chat_select_own" on chat_messages for select using (auth.uid() = user_id);
create policy "chat_insert_own" on chat_messages for insert with check (auth.uid() = user_id);
