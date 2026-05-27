-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per authenticated user. id mirrors auth.users.id.
create table public.profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  email                       text not null,
  total_challenges_completed  integer not null default 0,
  total_hints_used            integer not null default 0,
  created_at                  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── challenges ──────────────────────────────────────────────────────────────
create table public.challenges (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text not null,
  stack            text not null check (stack in ('javascript', 'typescript')),
  level            text not null check (level in ('beginner', 'intermediate')),
  client_briefing  text not null,
  created_at       timestamptz not null default now()
);

alter table public.challenges enable row level security;

-- Challenges are public read, admin-only write
create policy "Anyone can view challenges"
  on public.challenges for select
  using (true);

-- ─── sessions ────────────────────────────────────────────────────────────────
create table public.sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  status        text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz
);

alter table public.sessions enable row level security;

create policy "Users can manage their own sessions"
  on public.sessions for all
  using (auth.uid() = user_id);

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_challenge_id_idx on public.sessions(challenge_id);

-- ─── hints_used ──────────────────────────────────────────────────────────────
create table public.hints_used (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  hint_level  integer not null check (hint_level in (1, 2, 3)),
  used_at     timestamptz not null default now()
);

alter table public.hints_used enable row level security;

create policy "Users can view their own hints"
  on public.hints_used for select
  using (auth.uid() = user_id);

create policy "Users can insert their own hints"
  on public.hints_used for insert
  with check (auth.uid() = user_id);

create index hints_used_user_id_idx on public.hints_used(user_id);
create index hints_used_session_id_idx on public.hints_used(session_id);

-- ─── code_submissions ────────────────────────────────────────────────────────
create table public.code_submissions (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  code             text not null,
  review_response  text,
  submitted_at     timestamptz not null default now()
);

alter table public.code_submissions enable row level security;

create policy "Users can manage their own submissions"
  on public.code_submissions for all
  using (auth.uid() = user_id);

create index code_submissions_user_id_idx on public.code_submissions(user_id);
create index code_submissions_session_id_idx on public.code_submissions(session_id);
