-- Fix: quiz_leads has an anon INSERT policy but NO SELECT policy — so /admin
-- (which reads with the logged-in authenticated session, exactly like orders,
-- quiz_events and lead_notes) sees an empty list even though rows exist.
--
-- Add the missing authenticated read policy to match the rest of the schema.
-- Access model stays: public site (anon) may INSERT; only signed-in admins read.

drop policy if exists "auth read leads" on public.quiz_leads;
create policy "auth read leads"
  on public.quiz_leads for select
  to authenticated
  using (true);
