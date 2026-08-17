"use client";

import { useState, useTransition } from "react";
import { setBookingStatus } from "@/app/dashboard/actions";
import { formatWhen } from "@/lib/when";

export type BookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  when: string;
  startsAt: string;
  packageName: string;
  deposit: string;
  status: string;
  chatUrl: string | null;
  remindUrl: string | null;
};

function statusLabel(status: string) {
  if (status === "no_show") return "Did not show";
  if (status === "completed") return "Complete";
  if (status === "pending") return "On the card page";
  return "Confirmed";
}

function List({
  title,
  rows,
  empty,
  timezone,
  actions,
}: {
  title: string;
  rows: BookingRow[];
  empty: string;
  timezone: string;
  actions?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl lg:text-2xl">{title}</h2>
      {error ? (
        <p className="mt-3 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
            {empty}
          </li>
        ) : (
          rows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-line bg-void-2 p-4 text-start"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-[15px] font-medium leading-snug">
                  {row.name}
                </p>
                <p className="shrink-0 text-xs uppercase tracking-[0.16em] text-signal">
                  {statusLabel(row.status)}
                </p>
              </div>
              <p className="mt-1 text-sm leading-5 text-dim">
                {row.packageName}
                <span className="px-1.5 text-dim/50">·</span>
                {formatWhen(row.startsAt, timezone)}
              </p>
              {row.email ? (
                <p className="mt-1 break-all text-sm leading-5 text-dim">
                  {row.email}
                </p>
              ) : null}
              <p className="mt-3 text-lg font-semibold tabular-nums tracking-tight">
                {row.deposit}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {row.chatUrl ? (
                  <a
                    href={row.chatUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-signal"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {row.remindUrl ? (
                  <a
                    href={row.remindUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-signal"
                  >
                    Remind
                  </a>
                ) : null}
              </div>
              {actions && row.status === "confirmed" ? (
                <div className="mt-4 flex gap-2">
                  <form
                    action={(formData) => {
                      setError(null);
                      startTransition(async () => {
                        const result = await setBookingStatus(formData);
                        if (result?.error) setError(result.error);
                      });
                    }}
                    className="flex-1"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button
                      type="submit"
                      disabled={pending}
                      className="min-h-11 w-full rounded-full bg-paper px-3 text-sm text-void disabled:opacity-40"
                    >
                      Complete
                    </button>
                  </form>
                  <form
                    action={(formData) => {
                      setError(null);
                      startTransition(async () => {
                        const result = await setBookingStatus(formData);
                        if (result?.error) setError(result.error);
                      });
                    }}
                    className="flex-1"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value="no_show" />
                    <button
                      type="submit"
                      disabled={pending}
                      className="min-h-11 w-full rounded-full border border-line px-3 text-sm disabled:opacity-40"
                    >
                      Did not show
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function BookingsBoard({
  upcoming,
  pending,
  past,
  timezone,
}: {
  upcoming: BookingRow[];
  pending: BookingRow[];
  past: BookingRow[];
  timezone: string;
  currency?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        bookings
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Bookings</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-dim lg:mx-0">
        Confirmed means the deposit landed. Complete or mark a no show after the slot.
      </p>
      <List
        title="Upcoming"
        rows={upcoming}
        empty="No upcoming bookings."
        timezone={timezone}
        actions
      />
      <List
        title="Still paying"
        rows={pending}
        empty="No one is on the card page."
        timezone={timezone}
      />
      <List
        title="Past"
        rows={past}
        empty="No past bookings yet."
        timezone={timezone}
        actions
      />
    </div>
  );
}
