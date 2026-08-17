-- Freer packages, and a short public bio.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.services drop constraint if exists services_deposit_percent_check;
alter table public.services
  add constraint services_deposit_percent_check
  check (deposit_percent between 1 and 100);

alter table public.services
  add column if not exists note text;

alter table public.profiles
  add column if not exists bio text;
