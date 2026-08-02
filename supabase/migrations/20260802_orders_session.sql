-- Link an order back to the quiz lead it came from.
--
-- quiz_leads already carries a per-session uuid (session_id, generated client-side
-- with crypto.randomUUID and stored in sessionStorage). The checkout flow now
-- forwards that same id so a paid order — especially a 150 GEL consultation booked
-- from the quiz result — can be joined to the originating lead:
--
--   select o.*, l.name, l.phone
--   from orders o
--   left join quiz_leads l on l.session_id = o.session_id;
--
-- Nullable: direct /checkout visits (no quiz session) simply store null.

alter table public.orders add column if not exists session_id uuid;

create index if not exists orders_session_id_idx on public.orders (session_id);
