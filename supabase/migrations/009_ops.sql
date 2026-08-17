-- Photo, location, buffers, lead time, reminders, no-show.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.services
  add column if not exists location text;

alter table public.profiles
  add column if not exists buffer_min integer not null default 0,
  add column if not exists lead_min integer not null default 30;

alter table public.profiles
  drop constraint if exists profiles_buffer_min_check;
alter table public.profiles
  add constraint profiles_buffer_min_check
  check (buffer_min between 0 and 180);

alter table public.profiles
  drop constraint if exists profiles_lead_min_check;
alter table public.profiles
  add constraint profiles_lead_min_check
  check (lead_min between 0 and 1440);

alter table public.bookings
  add column if not exists reminder_sent_at timestamptz;

insert into storage.buckets (id, name, public)
values ('page-photos', 'page-photos', true)
on conflict (id) do nothing;

drop policy if exists "page_photos_public_read" on storage.objects;
create policy "page_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'page-photos');
