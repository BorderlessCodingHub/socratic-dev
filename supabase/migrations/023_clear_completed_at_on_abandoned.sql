-- completeSession wrote completed_at unconditionally, so abandoned sessions
-- carried a "completed at" timestamp — misleading for any duration/funnel
-- analysis. The app now only sets completed_at on completed sessions; this
-- cleans up the historical rows.

update public.sessions
set completed_at = null
where status = 'abandoned'
  and completed_at is not null;
