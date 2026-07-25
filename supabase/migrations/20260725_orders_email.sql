-- Track that the order-confirmation email has been sent, so BOG callback
-- retries don't send the buyer/business a duplicate email.
-- Set once, atomically, by the server (service-role key) in the pay callback.

alter table public.orders
  add column if not exists confirmation_email_sent boolean not null default false;
