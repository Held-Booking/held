"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import { BRAND } from "@/lib/constants";
import { Atmosphere } from "@/components/fx/Atmosphere";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Locale, Messages } from "@/lib/i18n";

export function ForgotPasswordForm({
  lang = "en",
  nav,
  copy,
}: {
  lang?: Locale;
  nav?: Messages["nav"];
  copy?: Messages["auth"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const ready = isSupabaseConfigured();

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))] sm:px-6">
      <Atmosphere />
      <SiteHeader lang={lang} labels={nav} />
      <div className="relative z-10 w-full max-w-md text-center lg:text-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-void-2/90 p-5 text-center backdrop-blur-xl sm:rounded-3xl sm:p-8 lg:text-start">
          <p className="font-display text-sm text-signal md:hidden">
            {BRAND.name}.
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">
            {copy?.forgotTitle ?? "Reset your password"}
          </h1>
          <p className="mt-3 text-sm text-dim sm:text-base">
            {copy?.forgotBody ??
              "Enter the email on your Held page. If an account exists, we send a reset link."}
          </p>

          {sent ? (
            <p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-paper">
              {copy?.sent ??
                "If that email has a page, a reset link is on its way. Check the inbox and spam folder."}
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-xl border border-line bg-void px-4 py-3 text-sm text-paper">
              {error}
            </p>
          ) : null}

          {!sent ? (
            <form
              className="mt-6 space-y-4 text-start sm:mt-8"
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await requestPasswordReset(formData);
                  if (result?.error) setError(result.error);
                  else setSent(true);
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
              <button
                type="submit"
                disabled={pending || !ready}
                className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
              >
                {pending
                  ? (copy?.holdOn ?? "Hold on...")
                  : (copy?.sendLink ?? "Send reset link")}
              </button>
            </form>
          ) : null}

          <Link
            href="/login"
            className="mt-5 block text-center text-sm text-dim hover:text-signal"
          >
            {copy?.backToLogin ?? "Back to log in"}
          </Link>
        </div>
      </div>
    </main>
  );
}
