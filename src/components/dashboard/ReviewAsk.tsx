"use client";

import { useState, useTransition } from "react";
import { hideReviewPrompt, saveHeldReview } from "@/app/dashboard/actions";

export function ReviewAsk({
  displayName,
}: {
  displayName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="mx-auto mt-6 max-w-md rounded-xl border border-line bg-void-2 px-4 py-3 text-sm lg:mx-0">
        Saved. If you ticked the box, it can show on bookheld.app after we check it is real.
      </p>
    );
  }

  return (
    <form
      className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-void-2 p-4 text-start lg:mx-0"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await saveHeldReview(formData);
          if (result?.error) setError(result.error);
          else setDone(true);
        });
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-signal">
        from people who use Held
      </p>
      <p className="mt-2 text-sm font-medium text-paper">
        One sentence. Did the page hold a date?
      </p>
      <label className="mt-4 block text-sm text-dim">
        Your line
        <textarea
          name="body"
          required
          minLength={8}
          maxLength={280}
          rows={3}
          placeholder="The date stayed booked."
          className="mt-1.5 min-h-24 w-full rounded-xl border border-line bg-void px-3 py-3 text-base text-paper placeholder:text-dim/60"
        />
      </label>
      <label className="mt-3 block text-sm text-dim">
        Name on the quote
        <input
          name="displayName"
          required
          minLength={2}
          maxLength={80}
          defaultValue={displayName}
          className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
        />
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm text-dim">
          Trade
          <input
            name="trade"
            maxLength={60}
            placeholder="Tutor, photographer"
            className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
          />
        </label>
        <label className="block text-sm text-dim">
          City
          <input
            name="city"
            maxLength={60}
            placeholder="Ilorin"
            className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
          />
        </label>
      </div>
      <label className="mt-3 block text-sm text-dim">
        Stars
        <select
          name="rating"
          defaultValue="5"
          className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
        >
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
        </select>
      </label>
      <label className="mt-4 flex min-h-12 items-start gap-3 text-sm text-dim">
        <input
          name="publish"
          type="checkbox"
          value="yes"
          className="mt-1 h-5 w-5 shrink-0"
        />
        <span>You may show this on bookheld.app with my name and city.</span>
      </label>
      {error ? <p className="mt-3 text-sm text-paper">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Send"}
        </button>
        <button
          type="button"
          disabled={pending}
          className="min-h-12 w-full rounded-full border border-line text-sm disabled:opacity-40"
          onClick={() => {
            startTransition(async () => {
              await hideReviewPrompt();
              setDone(true);
            });
          }}
        >
          Not now
        </button>
      </div>
    </form>
  );
}
