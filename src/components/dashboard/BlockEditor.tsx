"use client";

import { useState, useTransition } from "react";
import { addBlock, removeBlock } from "@/app/dashboard/actions";
import { timeOptions } from "@/lib/schedule";
import { formatWhen } from "@/lib/when";

const OPTIONS = timeOptions();

export function BlockEditor({
  initial,
  timezone,
}: {
  initial: Array<{ id: string; startsAt: string; endsAt: string; reason: string }>;
  timezone: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-14">
      <h2 className="font-display text-2xl sm:text-3xl">Closed days</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-dim lg:mx-0">
        Block a Saturday, a window, or a trip. Those times will not be offered.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {initial.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
            No closed days yet.
          </li>
        ) : (
          initial.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-line bg-void-2 px-4 py-4 text-start"
            >
              <div className="min-w-0">
                <p className="text-sm">
                  {formatWhen(item.startsAt, timezone)}
                  {" to "}
                  {formatWhen(item.endsAt, timezone)}
                </p>
                {item.reason ? (
                  <p className="mt-1 text-sm text-dim">{item.reason}</p>
                ) : null}
              </div>
              <form
                className="mt-3"
                action={(formData) => {
                  setError(null);
                  startTransition(async () => {
                    const result = await removeBlock(formData);
                    if (result?.error) setError(result.error);
                  });
                }}
              >
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="min-h-11 text-sm text-dim hover:text-paper">
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form
        className="mt-6 space-y-3 rounded-2xl border border-line bg-void-2 p-4 text-start"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await addBlock(formData);
            if (result?.error) setError(result.error);
          });
        }}
      >
        <label className="block text-sm text-dim">
          Day
          <input
            type="date"
            name="date"
            required
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-dim">
            From
            <select
              name="start"
              defaultValue="00:00"
              className="mt-1 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
            >
              {OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-dim">
            To
            <select
              name="end"
              defaultValue="24:00"
              className="mt-1 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper"
            >
              {OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm text-dim">
          Reason (optional)
          <input
            name="reason"
            maxLength={80}
            placeholder="Travel, event, off"
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Close this window"}
        </button>
      </form>
    </div>
  );
}
