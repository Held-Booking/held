"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/app/auth/actions";
import type { Messages } from "@/lib/i18n";

export function PasswordSettings({ copy }: { copy: Messages["auth"] }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">
        {copy.changePassword}
      </h2>
      <p className="mt-3 text-sm text-dim">{copy.updateBody}</p>
      {saved ? (
        <p className="mt-3 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm">
          {copy.passwordSavedStay}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      <form
        className="mt-4 space-y-4"
        action={(formData) => {
          setError(null);
          setSaved(false);
          formData.set("stay", "1");
          startTransition(async () => {
            const result = await updatePassword(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <label className="block text-sm text-dim">
          {copy.newPassword}
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={copy.chars}
            className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40 sm:w-auto sm:px-6"
        >
          {pending ? copy.holdOn : copy.savePassword}
        </button>
      </form>
    </div>
  );
}
