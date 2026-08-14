-- Challenges are generated in the caller's language but the pool reused them
-- for everyone, so EN users could receive PT challenges and vice versa. Tag
-- each challenge with its locale and filter every pool path by it.

alter table public.challenges
  add column if not exists locale text not null default 'pt';

alter table public.challenges
  add constraint challenges_locale_check check (locale in ('en', 'pt'));

-- Heuristic backfill for rows generated in English (default above assumes pt).
-- Mislabels, if any, can be fixed by hand: update challenges set locale=...
update public.challenges
set locale = 'en'
where description ~* '\m(the|should|that|which|implement)\M'
  and description !~* '[ãõç]|\m(que|para|uma|deve|não|função)\M';

create index if not exists challenges_locale_idx
  on public.challenges (locale);

drop function if exists public.next_challenge_for_user(uuid, text, text, text);

create or replace function public.next_challenge_for_user(
  p_user uuid,
  p_kind text,
  p_level text,
  p_stack text,
  p_locale text
)
returns setof public.challenges
language sql
security definer
set search_path = public
as $$
  select c.*
  from challenges c
  where c.kind = p_kind
    and c.level = p_level
    and c.locale = p_locale
    and (p_kind <> 'code' or c.stack = p_stack)
    and not exists (
      select 1 from sessions s
      where s.user_id = p_user and s.challenge_id = c.id
    )
  order by random()
  limit 1;
$$;

revoke all on function public.next_challenge_for_user(uuid, text, text, text, text) from public, anon, authenticated;
