-- Held $12/month (and $99/year) lives on the studio profile.
-- Client deposits stay on payout_accounts. This money goes to Held's Paystack.
-- Run in Supabase: Project → SQL Editor → New query → paste → Run.

alter table public.profiles
  add column if not exists plan_status text not null default 'trialing',
  add column if not exists plan_interval text,
  add column if not exists plan_expires_at timestamptz not null default (now() + interval '14 days'),
  add column if not exists paystack_customer_code text,
  add column if not exists paystack_subscription_code text,
  add column if not exists paystack_email_token text;

update public.profiles
  set plan_expires_at = now() + interval '14 days'
  where plan_expires_at is null;
