-- Mark a booking as notified so webhook + success page do not send twice.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.bookings
  add column if not exists notified_at timestamptz;
