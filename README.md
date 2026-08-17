# Held

Hold the date. Take the deposit.

Booking pages for people who sell their time. Clients pick a slot and pay a deposit to keep it. English UI. $12/month. No commission.

## Locked decisions

- **Name:** Held
- **Who it is for:** any professional who takes bookings
- **UI language:** English only (v1)
- **Second language:** skipped for now

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo public page: `/book/kade`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · Paystack · Stripe (US later) · Resend · Vercel

## Turn accounts on

1. Create a free project at [supabase.com](https://supabase.com).
2. Project Settings > API: copy **Project URL** and **anon public** key into `.env.local` (see `.env.example`).
3. Authentication > Providers: keep Email on. For local testing, Authentication > Sign In / Providers, turn off **Confirm email** so you can log in at once.
4. SQL Editor: paste and run `supabase/migrations/001_init.sql`.
5. Restart `npm run dev`.

Then open `/signup`, create a page, and you land on the dashboard.

## 20-day build

| Days | Outcome |
| --- | --- |
| 1–2 | Brand, landing, route tree |
| 3–4 | Auth + database — **you are here** |
| 5–7 | Services + hours |
| 8–11 | Real slot picker |
| 12–14 | Stripe deposits |
| 15–16 | Bookings dashboard |
| 17–18 | Email + WhatsApp link |
| 19–20 | Domain + launch checklist |
