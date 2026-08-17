-- Held v1 schema.
-- Run this in Supabase: Project → SQL Editor → New query → paste → Run.
-- Do not run this on sqliteonline.com or any SQLite site. Held uses Postgres.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  slug text unique,
  whatsapp text,
  logo_url text,
  timezone text not null default 'UTC',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (
    slug is null or slug ~ '^[a-z0-9]{3,24}$'
  )
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  duration_min integer not null check (duration_min > 0),
  price_cents integer not null check (price_cents >= 0),
  deposit_percent integer not null default 30 check (deposit_percent between 10 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_min integer not null check (start_min between 0 and 1439),
  end_min integer not null check (end_min between 1 and 1440),
  check (end_min > start_min)
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending',
  deposit_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  stripe_id text unique,
  amount_cents integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists services_vendor_idx on public.services (vendor_id);
create index if not exists availability_vendor_idx on public.availability (vendor_id);
create index if not exists bookings_vendor_idx on public.bookings (vendor_id, starts_at);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability enable row level security;
alter table public.time_blocks enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

create policy "profiles_own"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_public_read"
  on public.profiles for select
  using (slug is not null);

create policy "services_own"
  on public.services for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

create policy "services_public_read"
  on public.services for select
  using (
    active = true
    and exists (
      select 1 from public.profiles p
      where p.id = vendor_id and p.slug is not null
    )
  );

create policy "availability_own"
  on public.availability for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

create policy "availability_public_read"
  on public.availability for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = vendor_id and p.slug is not null
    )
  );

create policy "time_blocks_own"
  on public.time_blocks for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

create policy "bookings_own"
  on public.bookings for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

create policy "bookings_insert_public"
  on public.bookings for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = vendor_id and p.slug is not null
    )
  );

create policy "payments_own"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.vendor_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;
grant select, insert, update, delete on public.services to authenticated;
grant select on public.services to anon;
grant select, insert, update, delete on public.availability to authenticated;
grant select on public.availability to anon;
grant select, insert, update, delete on public.time_blocks to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant insert on public.bookings to anon;
grant select, insert, update, delete on public.payments to authenticated;
