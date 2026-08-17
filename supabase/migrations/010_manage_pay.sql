-- Manage links, remaining balance, Google Calendar.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.bookings
  add column if not exists manage_token uuid unique default gen_random_uuid();

alter table public.bookings
  add column if not exists balance_paid_at timestamptz;

alter table public.bookings
  add column if not exists google_event_id text;

update public.bookings
  set manage_token = gen_random_uuid()
  where manage_token is null;

alter table public.profiles
  add column if not exists google_refresh_token text;

alter table public.profiles
  add column if not exists google_calendar_id text default 'primary';
