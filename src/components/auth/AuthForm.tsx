"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/auth/actions";
import { BRAND, DEMO_SLUG } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Atmosphere } from "@/components/fx/Atmosphere";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Locale, Messages } from "@/lib/i18n";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  lang = "en",
  nav,
  copy,
}: {
  mode: Mode;
  lang?: Locale;
  nav?: Messages["nav"];
  copy?: Messages["auth"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const ready = isSupabaseConfigured();
  const title =
    mode === "signup"
      ? (copy?.getPage ?? "Get your page")
      : (copy?.welcome ?? "Welcome back");
  const body =
    mode === "signup"
      ? (copy?.getBody ?? "One link. Clients pay to keep the day.")
      : (copy?.wait ?? "Your dates are waiting.");
  const action =
    mode === "signup" ? (copy?.create ?? "Create page") : (copy?.logIn ?? "Log in");
  const alt =
    mode === "signup"
      ? (copy?.havePage ?? "Already have a page? Log in")
      : (copy?.newHere ?? "New here? Get your page");
  const altHref = mode === "signup" ? "/login" : "/signup";

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))] sm:px-6">
      <Atmosphere />
      <SiteHeader lang={lang} labels={nav} />
      <div className="relative z-10 w-full max-w-md text-center lg:text-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-void-2/90 p-5 text-center backdrop-blur-xl sm:rounded-3xl sm:p-8 lg:text-start">
          <p className="font-display text-sm text-signal md:hidden">
            {BRAND.name}.
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-dim sm:text-base">{body}</p>

          {!ready ? (
            <p className="mt-6 rounded-xl border border-line bg-void px-4 py-3 text-sm text-dim">
              Accounts need a free Supabase project. Add the two public keys to
              .env.local, run the SQL in supabase/migrations, then restart the
              app.
            </p>
          ) : null}

          {confirm ? (
            <p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-paper">
              Check your email and confirm. Then log in.
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-xl border border-line bg-void px-4 py-3 text-sm text-paper">
              {error}
            </p>
          ) : null}

          <form
            className="mt-6 space-y-4 text-start sm:mt-8"
            action={(formData) => {
              setError(null);
              startTransition(async () => {
                const run = mode === "signup" ? signUp : signIn;
                const result = await run(formData);
                if (result?.confirm) setConfirm(true);
                if (result?.error) setError(result.error);
              });
            }}
          >
            <label className="block text-sm text-dim">
              {copy?.email ?? "Email"}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
              />
            </label>
            <label className="block text-sm text-dim">
              {copy?.password ?? "Password"}
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder={copy?.chars ?? "8 characters or more"}
                className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
              />
            </label>
            <button
              type="submit"
              disabled={pending || !ready}
              className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
            >
              {pending ? (copy?.holdOn ?? "Hold on...") : action}
            </button>
            {mode === "signup" ? (
              <p className="text-center text-xs text-dim">
                {copy?.agree ?? "By creating a page you agree to"}{" "}
                <Link href="/terms" className="text-signal">
                  {copy?.terms ?? "Terms"}
                </Link>{" "}
                {copy?.and ?? "and"}{" "}
                <Link href="/privacy" className="text-signal">
                  {copy?.privacy ?? "Privacy"}
                </Link>
                .
              </p>
            ) : null}
          </form>

          <Link
            href={altHref}
            className="mt-5 block text-center text-sm text-dim hover:text-signal"
          >
            {alt}
          </Link>
          <ButtonLink
            href={`/book/${DEMO_SLUG}`}
            variant="ghost"
            className="mt-4 w-full"
          >
            {copy?.tryDemo ?? "Try the demo instead"}
          </ButtonLink>
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-xs text-dim md:pb-0">
            <Link href="/pricing" className="hover:text-signal">
              {nav?.pricing ?? "Pricing"}
            </Link>
            <Link href="/terms" className="hover:text-signal">
              {copy?.terms ?? "Terms"}
            </Link>
            <Link href="/privacy" className="hover:text-signal">
              {copy?.privacy ?? "Privacy"}
            </Link>
            <LanguageSwitcher current={lang} />
          </nav>
        </div>
      </div>
    </main>
  );
}
