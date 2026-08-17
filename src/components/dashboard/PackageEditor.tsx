"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addPackage,
  removePackage,
  updatePackage,
} from "@/app/dashboard/actions";
import { CURRENCIES } from "@/lib/gateways";
import { formatDuration } from "@/lib/schedule";
import { formatMoney } from "@/lib/utils";

export type PackageRow = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  depositPercent: number;
  note: string;
  location: string;
};

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-3 text-base text-paper placeholder:text-dim/60";

export function PackageEditor({
  initial,
  currency = "NGN",
}: {
  initial: PackageRow[];
  currency?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<PackageRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [durationMin, setDurationMin] = useState(60);
  const [currencyCode, setCurrencyCode] = useState(currency);

  useEffect(() => {
    setCurrencyCode(currency);
  }, [currency]);

  function resetForm() {
    setFormKey((n) => n + 1);
    setDurationMin(60);
    setEditing(null);
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        packages
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Packages</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-dim lg:mx-0">
        Name it how you sell it. Any price, any length, any deposit share.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 space-y-3">
        {initial.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
            No packages yet. Add the first one below.
          </li>
        ) : (
          initial.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-line bg-void-2 p-4 text-start"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-[15px] font-medium leading-snug">
                  {item.name}
                </p>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    className="text-sm text-dim hover:text-paper"
                    onClick={() => {
                      setEditing(item);
                      setDurationMin(item.durationMin);
                      setError(null);
                    }}
                  >
                    Edit
                  </button>
                  <form
                    action={(formData) => {
                      setError(null);
                      startTransition(async () => {
                        const result = await removePackage(formData);
                        if (result?.error) setError(result.error);
                      });
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-sm text-dim hover:text-paper"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-1 text-sm leading-5 text-dim">
                {formatDuration(item.durationMin)}
                <span className="px-1.5 text-dim/50">·</span>
                {item.depositPercent}% down
                {item.location ? (
                  <>
                    <span className="px-1.5 text-dim/50">·</span>
                    {item.location}
                  </>
                ) : null}
              </p>
              {item.note ? (
                <p className="mt-1 text-sm leading-5 text-dim">{item.note}</p>
              ) : null}
              <p className="mt-3 text-lg font-semibold tabular-nums tracking-tight">
                {formatMoney(item.price, currencyCode)}
              </p>
            </li>
          ))
        )}
      </ul>

      <form
        key={formKey + (editing?.id ?? "new")}
        className="mt-10 space-y-4 rounded-2xl border border-line bg-void-2 p-4 text-start sm:p-5"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = editing
              ? await updatePackage(formData)
              : await addPackage(formData);
            if (result?.error) setError(result.error);
            else resetForm();
          });
        }}
      >
        <p className="text-center text-sm font-medium lg:text-start">
          {editing ? "Edit package" : "Add a package"}
        </p>
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <label className="block text-sm text-dim">
          Name
          <input
            name="name"
            required
            minLength={2}
            defaultValue={editing?.name ?? ""}
            placeholder="Cut, lesson, set, visit"
            className={field}
          />
        </label>
        <label className="block text-sm text-dim">
          Note (optional)
          <input
            name="note"
            maxLength={280}
            defaultValue={editing?.note ?? ""}
            placeholder="What they get"
            className={field}
          />
        </label>
        <label className="block text-sm text-dim">
          Place (optional)
          <input
            name="location"
            maxLength={120}
            defaultValue={editing?.location ?? ""}
            placeholder="Studio, home visit, or a street"
            className={field}
          />
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_5.75rem] gap-3">
          <label className="min-w-0 text-sm text-dim">
            Minutes
            <input
              name="durationMin"
              type="number"
              min={5}
              max={24 * 60}
              step={5}
              required
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className={field}
            />
            <span className="mt-1 block text-xs">
              {formatDuration(durationMin || 0)}
            </span>
          </label>
          <label className="min-w-0 text-sm text-dim">
            Currency
            <select
              name="currency"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              aria-label="Currency"
              className={`${field} px-1 text-center text-sm font-semibold`}
            >
              {CURRENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-3">
          <label className="min-w-0 text-sm text-dim">
            Deposit %
            <input
              name="depositPercent"
              type="number"
              min={1}
              max={100}
              step={1}
              required
              inputMode="numeric"
              defaultValue={editing?.depositPercent ?? 30}
              className={`${field} px-2 text-center`}
            />
          </label>
          <label className="min-w-0 text-sm text-dim">
            Price
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              inputMode="decimal"
              defaultValue={editing?.price ?? ""}
              placeholder="0.00"
              className={`${field} px-3 tabular-nums`}
            />
          </label>
        </div>
        <p className="text-xs leading-5 text-dim">
          Currency defaults to your country. Checkout charges this currency.
          Deposit is 1 to 100. 100 means they pay in full now.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {editing ? (
            <button
              type="button"
              className="min-h-12 flex-1 rounded-full border border-line text-sm"
              onClick={resetForm}
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 flex-1 rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
          >
            {pending ? "Saving..." : editing ? "Save package" : "Add package"}
          </button>
        </div>
      </form>
    </div>
  );
}
