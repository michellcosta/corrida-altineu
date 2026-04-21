alter table public.events
add column if not exists withdrawal_amount numeric default 0;
