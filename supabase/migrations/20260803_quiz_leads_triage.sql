-- ─────────────────────────────────────────────────────────────────────────────
-- quiz_leads.triage_status — medical triage tag written on insert
--
-- IMPORTANT: this is a NEW column and is DISTINCT from the existing
-- quiz_leads.status column. `status` is the sales-pipeline stage (new / paid /
-- …) that the admin Leads tab manages. `triage_status` is the medical routing
-- bucket derived from the quiz answers, used to prioritise call-backs (admin
-- CRM + Telegram alerts). Do not conflate the two.
--
-- Values (computed client-side by lib/scoring.ts computeTriageStatus(), off
-- stable option ids / the same flags computeResult() uses):
--   • refer_out  — q10 medical red flag → refer to a doctor, not a sales call
--   • needs_labs — competing cause (q11) OR sudden & severe onset (q7)
--   • qualified  — normal THAMRA candidate (default)
--
-- Re-runnable: safe no-op against a database that already has the column.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.quiz_leads
  add column if not exists triage_status text not null default 'qualified';

-- Fast filtering of the Leads list / alert queue by triage bucket.
create index if not exists quiz_leads_triage_status_idx
  on public.quiz_leads (triage_status);
