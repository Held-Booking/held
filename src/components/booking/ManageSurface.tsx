"use client";

import { useEffect, useState } from "react";
import { BookBar } from "@/components/booking/BookBar";
import type { TimeSlot } from "@/lib/slots";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { fill } from "@/lib/i18n";
import { cn, formatMoney } from "@/lib/utils";

type Day = { id: string; label: string };

export function ManageSurface({
  slug,
  token,
  bookingId,
  lang,
  copy,
  vendor,
  packageName,
  when,
  status,
  rest,
  restPaid,
  currency,
  days,
  durationMin,
  location,
}: {
  slug: string;
  token: string;
  bookingId: string;
  lang: Locale;
  copy: Messages["manage"];
  vendor: string;
  packageName: string;
  when: string;
  status: string;
  rest: number;
  restPaid: boolean;
  currency: string;
  days: Day[];
  durationMin: number;
  location: string;
}) {
  const closed = status !== "confirmed";
  const [day, setDay] = useState(days[0]?.id ?? "");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setSlot("");
    if (!day || closed) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(
      `/api/availability?slug=${encodeURIComponent(slug)}&date=${day}&duration=${durationMin}&except=${encodeURIComponent(bookingId)}`,
    )
      .then((res) => res.json())
      .then((data: { slots?: TimeSlot[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, day, durationMin, bookingId, closed]);

  async function run(action: "cancel" | "reschedule") {
    if (busy) return;
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const res = await fetch("/api/booking/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action,
          date: day,
          start: slot,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update this booking.");
        setBusy(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Could not update this booking.");
      setBusy(false);
    }
  }

  async function payRest() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start payment.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start payment.");
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh bg-void px-4 pb-16 pt-[calc(4rem+env(safe-area-inset-top))] text-center">
      <BookBar lang={lang} />
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 font-medium">{vendor}</p>
        <p className="mt-1 text-sm text-dim">{packageName}</p>
        <p className="mt-3 font-display text-2xl">{when}</p>
        {location ? <p className="mt-2 text-sm text-dim">{location}</p> : null}

        {closed ? (
          <p className="mt-8 rounded-2xl border border-line bg-void-2 px-4 py-6 text-sm text-dim">
            {status === "cancelled" ? copy.cancelled : copy.done}
          </p>
        ) : (
          <>
            {rest > 0 ? (
              restPaid ? (
                <p className="mt-6 text-sm text-dim">{copy.restPaid}</p>
              ) : (
                <button
                  type="button"
                  onClick={payRest}
                  disabled={busy}
                  className="mt-6 min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
                >
                  {fill(copy.rest, { amount: formatMoney(rest, currency) })}
                </button>
              )
            ) : null}

            <section className="mt-8 text-start">
              <p className="text-sm font-medium">{copy.reschedule}</p>
              {days.length === 0 ? (
                <p className="mt-3 text-sm text-dim">{copy.done}</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {days.map((item) => {
                    const on = item.id === day;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDay(item.id)}
                        className={cn(
                          "min-h-12 rounded-2xl border px-2 text-sm font-medium",
                          on ? "border-signal bg-signal text-void" : "border-line",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {loading ? (
                <p className="mt-3 text-sm text-dim">...</p>
              ) : (
                <div className="mt-3 grid max-h-52 grid-cols-3 gap-2 overflow-y-auto">
                  {slots.map((item) => {
                    const on = item.start === slot;
                    return (
                      <button
                        key={item.start}
                        type="button"
                        onClick={() => setSlot(item.start)}
                        className={cn(
                          "min-h-12 rounded-2xl border px-1 text-sm font-medium",
                          on ? "border-signal bg-signal text-void" : "border-line",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => run("reschedule")}
                disabled={busy || !day || !slot}
                className="mt-4 min-h-12 w-full rounded-full border border-line text-sm disabled:opacity-40"
              >
                {copy.save}
              </button>
            </section>

            <button
              type="button"
              onClick={() => run("cancel")}
              disabled={busy}
              className="mt-8 min-h-12 w-full text-sm text-dim hover:text-paper disabled:opacity-40"
            >
              {copy.cancel}
            </button>
            <p className="mt-2 text-xs text-dim">{copy.cancelNote}</p>
          </>
        )}

        {error ? (
          <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}
        {note ? <p className="mt-4 text-sm text-dim">{note}</p> : null}
      </div>
    </main>
  );
}
