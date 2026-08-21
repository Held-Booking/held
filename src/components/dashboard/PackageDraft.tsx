"use client";

import { useState, useTransition } from "react";
import { addPackage, draftHeldPackages } from "@/app/dashboard/actions";
import type { DraftPackage } from "@/lib/package-draft";
import { formatDuration } from "@/lib/schedule";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper placeholder:text-dim/60";

export function PackageDraft({
  currency,
  bio,
}: {
  currency: string;
  bio?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftPackage[]>([]);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-8 rounded-2xl border border-line bg-void-2 p-4 text-start sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-signal">
        draft
      </p>
      <p className="mt-2 text-sm font-medium text-paper">
        Say how you work. Held writes packages. You add the ones that are true.
      </p>
      <form
        className="mt-4"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await draftHeldPackages(formData);
            if (result.error) setError(result.error);
            else setDrafts(result.packages ?? []);
          });
        }}
      >
        <input type="hidden" name="currency" value={currency} />
        <input type="hidden" name="bio" value={bio ?? ""} />
        <label className="block text-sm text-dim">
          How you sell your time
          <textarea
            name="text"
            required
            minLength={8}
            maxLength={800}
            rows={4}
            placeholder="Wedding photos 150000 for 4 hours. Portraits 40000. I work Saturdays in Ilorin."
            className={`${field} min-h-28 py-3`}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Writing..." : "Draft packages"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-paper">{error}</p> : null}
      {drafts.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {drafts.map((item, i) => (
            <li key={`${item.name}-${i}`} className="rounded-xl border border-line bg-void p-3">
              <p className="text-[15px] font-medium">{item.name}</p>
              {item.note ? (
                <p className="mt-1 text-sm text-dim">{item.note}</p>
              ) : null}
              <p className="mt-1 text-sm text-dim">
                {formatDuration(item.durationMin)} · {item.depositPercent}% down
                {item.price > 0 ? ` · ${item.price}` : " · add a price"}
              </p>
              <form
                className="mt-3"
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const result = await addPackage(formData);
                    if (result?.error) setError(result.error);
                    else {
                      setDrafts((rows) => rows.filter((_, idx) => idx !== i));
                    }
                  });
                }}
              >
                <input type="hidden" name="name" value={item.name} />
                <input type="hidden" name="note" value={item.note} />
                <input type="hidden" name="durationMin" value={item.durationMin} />
                <input type="hidden" name="depositPercent" value={item.depositPercent} />
                <input type="hidden" name="currency" value={currency} />
                <label className="block text-sm text-dim">
                  Price
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    inputMode="decimal"
                    defaultValue={item.price || ""}
                    className={field}
                  />
                </label>
                <button
                  type="submit"
                  disabled={pending}
                  className="mt-3 min-h-12 w-full rounded-full border border-line text-sm disabled:opacity-40"
                >
                  Add this package
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
