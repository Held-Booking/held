-- Optional reviews. Run in Supabase SQL Editor.
-- Homepage only shows rows where publish is true.

create table if not exists public.held_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  display_name text not null,
  trade text,
  city text,
  rating integer not null default 5 check (rating between 1 and 5),
  publish boolean not null default false,
  source text not null default 'in_app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint held_reviews_body_len check (char_length(trim(body)) between 8 and 280),
  constraint held_reviews_one_per_vendor unique (vendor_id)
);

alter table public.profiles
  add column if not exists review_ask_sent_at timestamptz,
  add column if not exists review_prompt_hidden_at timestamptz;

create index if not exists held_reviews_publish_idx
  on public.held_reviews (created_at desc)
  where publish = true;

alter table public.held_reviews enable row level security;

drop policy if exists "held_reviews_own" on public.held_reviews;
create policy "held_reviews_own"
  on public.held_reviews for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

drop policy if exists "held_reviews_public_read" on public.held_reviews;
create policy "held_reviews_public_read"
  on public.held_reviews for select
  using (publish = true);
