-- 024's EN backfill missed English rows whose text dodges the marker words
-- (e.g. "Design a single-service architecture with one database to store
-- users' recipes"). Stronger pass: no Portuguese accents, no PT stopwords,
-- and at least one common English function word.

update public.challenges
set locale = 'en'
where locale = 'pt'
  and (title || ' ' || description) !~* '[ãõçáàâéêíóôú]'
  and (title || ' ' || description) !~* '\m(que|para|uma|um|de|do|da|dos|das|não|nao|por|com|os|as|seu|sua|você|voce|função|funcao)\M'
  and (title || ' ' || description) ~* '\m(the|and|with|to|for|of|users?|app|your|that|should)\M';
