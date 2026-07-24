-- Orders for the BOG (OPAY) card-checkout flow.
-- Written/updated ONLY by the server via the service-role key (RLS bypass).
-- Buyers never read or write this table directly.

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  external_order_id text unique not null,   -- our id, echoed on the BOG callback
  bog_order_id      text,                   -- BOG's order id
  program_id        text not null,          -- foundation | signature | longevity
  program_name      text not null,
  amount            numeric not null,       -- GEL
  currency          text not null default 'GEL',
  status            text not null default 'pending', -- pending | completed | failed
  customer_name     text,
  customer_phone    text,
  customer_email    text,
  city              text,
  address           text,
  payment_detail    jsonb,                  -- BOG payment_detail from the callback
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_external_order_id_idx on public.orders (external_order_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- No anon policies: the anon key can neither read nor write orders.
-- The service-role key (server-only) bypasses RLS for insert/update.
-- Allow signed-in admins to read orders for the dashboard.
drop policy if exists "auth read orders" on public.orders;
create policy "auth read orders" on public.orders
  for select to authenticated using (true);
