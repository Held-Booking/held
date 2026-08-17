-- Busy windows for the public slot picker.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.
-- Safe to run even if 001_init.sql already ran.

create or replace function public.busy_windows_for(
  p_vendor uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.starts_at, b.ends_at
  from public.bookings b
  where b.vendor_id = p_vendor
    and b.starts_at < p_to
    and b.ends_at > p_from
    and (
      b.status = 'confirmed'
      or (
        b.status = 'pending'
        and b.created_at > now() - interval '45 minutes'
      )
    )
  union all
  select t.starts_at, t.ends_at
  from public.time_blocks t
  where t.vendor_id = p_vendor
    and t.starts_at < p_to
    and t.ends_at > p_from;
$$;

revoke all on function public.busy_windows_for(uuid, timestamptz, timestamptz) from public;
grant execute on function public.busy_windows_for(uuid, timestamptz, timestamptz) to anon, authenticated;
