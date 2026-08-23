-- Every call to the Claude API costs money, and until now none of them left a
-- trace: the largest variable expense of the product was invisible. This table
-- is the ledger.
--
-- Tokens are stored raw instead of a frozen cost in dollars on purpose — model
-- prices change (the Sonnet 5 introductory rate expires 2026-08-31), so the
-- durable fact is the token count plus the model that produced it. Cost is
-- derived downstream, where the price table can be corrected without a
-- backfill.

create table if not exists public.ai_usage (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete set null,
  -- No foreign key on purpose: session_id arrives in the request body and is
  -- not always a real session (a tutor 'reply' has none). A dangling id must
  -- never cost us a cost record — the analytics layer flags orphans instead.
  session_id         uuid,
  route              text not null,
  mode               text,
  model              text not null,
  input_tokens       integer not null default 0,
  output_tokens      integer not null default 0,
  cache_read_tokens  integer not null default 0,
  cache_write_tokens integer not null default 0,
  latency_ms         integer,
  created_at         timestamptz not null default now()
);

alter table public.ai_usage enable row level security;
-- No client policies: only the service role writes (from the AI client) and
-- reads (from analytics). A user has no reason to query the cost ledger, and
-- exposing it would leak our unit economics.

-- Cost per user over time. Doubles as the index for the user_id foreign key,
-- which Postgres does not create automatically.
create index if not exists ai_usage_user_created_idx
  on public.ai_usage (user_id, created_at desc);

-- Cost per route over time ("which endpoint is eating the budget?").
create index if not exists ai_usage_route_created_idx
  on public.ai_usage (route, created_at desc);

-- Daily rollups and incremental extraction to the data lake.
create index if not exists ai_usage_created_idx
  on public.ai_usage (created_at desc);
