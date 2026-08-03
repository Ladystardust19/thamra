-- ─────────────────────────────────────────────────────────────────────────────
-- quiz_leads: allow the `authenticated` role to INSERT (not just `anon`)
--
-- BUG: the quiz submit failed with 42501 "new row violates row-level security
-- policy" for any visitor who had a Supabase auth session (e.g. anyone logged
-- into /cabinet). The existing INSERT policy grants only the `anon` role, so
-- supabase-js — which sends the logged-in `authenticated` JWT instead of the
-- anon key when a session exists — had no matching insert policy and was
-- rejected. Anonymous (logged-out) visitors were unaffected.
--
-- Fix: add a complementary INSERT policy for `authenticated`. The quiz is a
-- public funnel, so a submission must succeed whether or not the browser holds
-- a session. This does not touch the existing anon insert policy.
--
-- Re-runnable: drop-if-exists then create.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "auth insert leads" on public.quiz_leads;
create policy "auth insert leads"
  on public.quiz_leads for insert
  to authenticated
  with check (true);
