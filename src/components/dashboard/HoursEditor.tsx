"use client";

import { useMemo, useState, useTransition } from "react";
import { saveHours, saveRules } from "@/app/dashboard/actions";
import { WEEKDAYS, minutesToTime, timeOptions } from "@/lib/schedule";

type DayState = {
  weekday: number;
  open: boolean;
  start: string;
  end: string;
};

const OPTIONS = timeOptions();

export function HoursEditor({
  initial,
  bufferMin = 0,
  leadMin = 30,
}: {
  initial: Array<{ weekday: number; startMin: number; endMin: number }>;
  bufferMin?: number;
  leadMin?: number;
}) {
  const seeded = useMemo<DayState[]>(() => {
    return WEEKDAYS.map((day) => {
      const match = initial.find((row) => row.weekday === day.id);
      return {
        weekday: day.id,
        open: Boolean(match),
        start: match ? minutesToTime(match.startMin) : "09:00",
        end: match ? minutesToTime(match.endMin) : "18:00",
      };
    });
  }, [initial]);

  const [days, setDays] = useState(seeded);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function patch(weekday: number, next: Partial<DayState>) {
    setSaved(false);
    setDays((prev) =>
      prev.map((day) => (day.weekday === weekday ? { ...day, ...next } : day)),
    );
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        hours
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Hours</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-dim lg:mx-0">
        Open days and the hours you actually work. Night, morning, or a short window.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm">
          Saved.
        </p>
      ) : null}

      <form
        className="mt-8 space-y-2 text-start"
        action={() => {
          setError(null);
          startTransition(async () => {
            const fd = new FormData();
            fd.set("hours", JSON.stringify(days));
            const result = await saveHours(fd);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        {WEEKDAYS.map((meta) => {
          const day = days.find((row) => row.weekday === meta.id)!;
          return (
            <div
              key={meta.id}
              className="rounded-2xl border border-line bg-void-2 px-4 py-3 text-start"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-10 font-medium">{meta.label}</p>
                <button
                  type="button"
                  onClick={() => patch(meta.id, { open: !day.open })}
                  className={`min-h-10 rounded-full px-4 text-sm ${
                    day.open
                      ? "bg-signal text-void"
                      : "border border-line text-dim"
                  }`}
                >
                  {day.open ? "Open" : "Closed"}
                </button>
              </div>
              {day.open ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs text-dim">
                    From
                    <select
                      value={day.start}
                      onChange={(e) => patch(meta.id, { start: e.target.value })}
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
                      value={day.end}
                      onChange={(e) => patch(meta.id, { end: e.target.value })}
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
              ) : null}
            </div>
          );
        })}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save hours"}
        </button>
      </form>

      <form
        className="mt-10 space-y-4 rounded-2xl border border-line bg-void-2 p-4 text-start"
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await saveRules(formData);
            if (result?.error) setError(result.error);
            else setSaved(true);
          });
        }}
      >
        <h2 className="text-center font-display text-xl lg:text-start lg:text-2xl">Booking rules</h2>
        <label className="block text-sm text-dim">
          Notice (minutes)
          <input
            name="leadMin"
            type="number"
            min={0}
            max={1440}
            step={15}
            defaultValue={leadMin}
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper"
          />
          <span className="mt-1 block text-xs">
            How soon someone can book. 120 means two hours from now.
          </span>
        </label>
        <label className="block text-sm text-dim">
          Gap after each booking (minutes)
          <input
            name="bufferMin"
            type="number"
            min={0}
            max={180}
            step={5}
            defaultValue={bufferMin}
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper"
          />
          <span className="mt-1 block text-xs">
            Travel or cleanup time before the next client.
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save rules"}
        </button>
      </form>
    </div>
  );
}
