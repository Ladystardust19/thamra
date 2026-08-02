-- Consultation slot bookings for the paid (150 GEL, BOG) result-page flow.
-- Written ONLY by the server (service-role): a slot is "held" the moment the
-- buyer starts payment, flips to "booked" on a successful BOG callback, and to
-- "released" if payment fails. A held slot that is never paid simply expires
-- (hold_expires_at) and the slots API treats it as free again.
--
-- Availability itself is a code template (lib/consultation.ts) — this table only
-- records which template slots are taken, so slot_start must match a template
-- instant exactly.

create table if not exists public.consultation_bookings (
  id                uuid primary key default gen_random_uuid(),
  slot_start        timestamptz not null,
  status            text not null default 'held',   -- held | booked | released
  external_order_id text,                            -- joins to orders.external_order_id
  session_id        uuid,                            -- joins to quiz_leads.session_id
  customer_name     text,
  customer_phone    text,
  hold_expires_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- At most one ACTIVE (held/booked) booking per slot — the final guard against
-- double-booking even if two buyers race for the same time.
create unique index if not exists consultation_bookings_slot_active_idx
  on public.consultation_bookings (slot_start)
  where status in ('held', 'booked');

create index if not exists consultation_bookings_order_idx  on public.consultation_bookings (external_order_id);
create index if not exists consultation_bookings_status_idx on public.consultation_bookings (status);

alter table public.consultation_bookings enable row level security;

-- No anon access. Server (service-role) manages rows; signed-in admins may read.
drop policy if exists "auth read bookings" on public.consultation_bookings;
create policy "auth read bookings" on public.consultation_bookings
  for select to authenticated using (true);
