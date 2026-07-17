-- ─────────────────────────────────────────────────────────────────────────────
-- Thamra quiz funnel analytics + admin CRM schema
--
-- STATUS: already applied to production (project zxwkjlcklbypaawlfdno) — the
-- tables, columns and policies below already exist there. This file is kept as an
-- accurate, re-runnable reference so a fresh Supabase project (e.g. staging) can
-- be stood up to the exact same shape. Running it against a database that already
-- has this schema is a true no-op.
--
-- Objects:
--   • quiz_events  — one row per funnel event (landing, screen views, lead,
--                    plan select, bank reached). Anon-insertable.
--   • lead_notes   — free-text notes the admin attaches to a lead.
--   • quiz_leads.* — attribution + session_id (join to events) and
--                    called / called_at (CRM call tracking).
--
-- Access model mirrors the existing quiz_leads table: the public site (anon key)
-- may INSERT funnel events; only an authenticated user (the admin, gated in-app by
-- email) may SELECT. Notes are admin-only. session_id is uuid — the client always
-- generates it with crypto.randomUUID().
-- ─────────────────────────────────────────────────────────────────────────────

-- ── quiz_leads: analytics + CRM columns ─────────────────────────────────────
alter table public.quiz_leads add column if not exists attribution jsonb;
alter table public.quiz_leads add column if not exists session_id  uuid;
alter table public.quiz_leads add column if not exists called      boolean not null default false;
alter table public.quiz_leads add column if not exists called_at   timestamptz;

-- ── quiz_events ─────────────────────────────────────────────────────────────
create table if not exists public.quiz_events (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid        not null,
  event_type        text        not null,
  screen            text,
  question_index    integer,
  prev_screen       text,
  prev_duration_ms  integer,
  meta              jsonb       not null default '{}'::jsonb,
  attribution       jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists quiz_events_created_at_idx on public.quiz_events (created_at);
create index if not exists quiz_events_session_id_idx  on public.quiz_events (session_id);
create index if not exists quiz_events_event_type_idx  on public.quiz_events (event_type);

alter table public.quiz_events enable row level security;

-- Public site inserts events with the anon key (policy name matches production).
drop policy if exists "anon insert events" on public.quiz_events;
create policy "anon insert events"
  on public.quiz_events for insert
  to anon
  with check (true);

-- Only signed-in users (the admin) may read events.
drop policy if exists "auth read events" on public.quiz_events;
create policy "auth read events"
  on public.quiz_events for select
  to authenticated
  using (true);

-- ── lead_notes ──────────────────────────────────────────────────────────────
create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.quiz_leads (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on public.lead_notes (lead_id);

alter table public.lead_notes enable row level security;

-- Notes are admin-only (authenticated) for all operations (policy name matches production).
drop policy if exists "auth all notes" on public.lead_notes;
create policy "auth all notes"
  on public.lead_notes for all
  to authenticated
  using (true)
  with check (true);
