-- Studio bank for Paystack subaccounts.
-- Keep this off public.profiles so a booking page cannot read the account number.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

create table if not exists public.payout_accounts (
  vendor_id uuid primary key references public.profiles (id) on delete cascade,
  bank_code text,
  account_number text,
  account_name text,
  paystack_subaccount text,
  updated_at timestamptz not null default now()
);

alter table public.payout_accounts enable row level security;

drop policy if exists "payout_own" on public.payout_accounts;
create policy "payout_own"
  on public.payout_accounts for all
  using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

grant select, insert, update, delete on public.payout_accounts to authenticated;
