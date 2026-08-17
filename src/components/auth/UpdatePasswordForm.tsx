"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/auth/actions";
import { BRAND } from "@/lib/constants";
import { Atmosphere } from "@/components/fx/Atmosphere";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import type { Locale, Messages } from "@/lib/i18n";

export function UpdatePasswordForm({
  lang = "en",
  nav,
  copy,
}: {
  lang?: Locale;
  nav?: Messages["nav"];
  copy?: Messages["auth"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

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
            {copy?.updateTitle ?? "Choose a new password"}
          </h1>
          <p className="mt-3 text-sm text-dim sm:text-base">
            {copy?.updateBody ?? "Use at least 8 characters."}
          </p>

          {done ? (
            <p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-paper">
              {copy?.passwordUpdated ?? "Your password is saved. Log in with it."}
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-xl border border-line bg-void px-4 py-3 text-sm text-paper">
              {error}
            </p>
          ) : null}

          {!done ? (
            <form
              className="mt-6 space-y-4 text-start sm:mt-8"
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await updatePassword(formData);
                  if (result?.error) setError(result.error);
                  else setDone(true);
                });
              }}
            >
              <label className="block text-sm text-dim">
                {copy?.newPassword ?? "New password"}
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={copy?.chars ?? "8 characters or more"}
                  className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
              >
                {pending
                  ? (copy?.holdOn ?? "Hold on...")
                  : (copy?.savePassword ?? "Save new password")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="mt-5 block text-center text-sm text-signal"
            >
              {copy?.logIn ?? "Log in"}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
