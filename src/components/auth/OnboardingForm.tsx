"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { completeOnboarding } from "@/app/auth/actions";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import type { Locale, Messages } from "@/lib/i18n";
import { slugify } from "@/lib/slug";

export function OnboardingForm({
  defaultName = "",
  lang = "en",
  nav,
  copy,
}: {
  defaultName?: string;
  lang?: Locale;
  nav?: Messages["nav"];
  copy?: Messages["auth"];
}) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [host, setHost] = useState("held.app");
  const slug = useMemo(() => slugify(name) || "yourname", [name]);

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return (
    <main className="relative min-h-dvh bg-void px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))]">
      <SiteHeader lang={lang} labels={nav} />
      <div className="mx-auto w-full max-w-md text-center lg:text-start">
        <p className="text-[10px] uppercase tracking-[0.28em] text-signal">
          {copy?.setup ?? "setup"}
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          {copy?.namePage ?? "Name the page"}
        </h1>
        <p className="mt-3 text-sm text-dim sm:text-base">
          {copy?.nameBody ??
            "This is what clients see. You can change hours and packages next."}
        </p>

        {error ? (
          <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <form
          className="mt-8 space-y-5 text-start"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await completeOnboarding(formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <label className="block text-sm text-dim">
            {copy?.yourName ?? "Your name"}
            <input
              name="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Your name or trade name"
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void-2 px-4 text-base text-paper placeholder:text-dim/60"
            />
          </label>
          <input type="hidden" name="slug" value={slugify(name)} />
          <p className="rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
            <span className="text-dim">{copy?.yourLink ?? "Your link "}</span>
            <span className="text-signal">{host}/book/{slug}</span>
          </p>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm text-dim">
            <input
              type="checkbox"
              name="seedStarter"
              value="1"
              defaultChecked
              className="mt-1 h-4 w-4 shrink-0 accent-signal"
            />
            <span>
              <span className="block text-paper">
                {copy?.seedYes ?? "Add a starter package and weekday hours"}
              </span>
              <span className="mt-1 block">
                {copy?.seedHint ??
                  "We can add a first package and weekday hours. Change them any time."}
              </span>
            </span>
          </label>
          <button
            type="submit"
            disabled={pending || slugify(name).length < 3}
            className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
          >
            {pending ? (copy?.saving ?? "Saving...") : (copy?.openDash ?? "Open dashboard")}
          </button>
        </form>
      </div>
    </main>
  );
}
