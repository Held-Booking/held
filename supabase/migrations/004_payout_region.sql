-- Vendor country + currency, and a provider label on payments.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.profiles
  add column if not exists country text not null default 'NG',
  add column if not exists currency text not null default 'NGN';

alter table public.payments
  add column if not exists provider text not null default 'paystack';
