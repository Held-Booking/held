"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DEMO_NAME, DEMO_SLUG } from "@/lib/constants";
import { depositAmount } from "@/lib/money";
import { cn, formatMoney } from "@/lib/utils";

const SLOTS = [
  { id: "22", dow: "SAT", day: "22", mon: "AUG", service: "Session", price: 1800 },
  { id: "23", dow: "SUN", day: "23", mon: "AUG", service: "Consult", price: 950 },
  { id: "29", dow: "SAT", day: "29", mon: "AUG", service: "Visit", price: 620 },
  { id: "30", dow: "SUN", day: "30", mon: "AUG", service: "Session", price: 1800 },
  { id: "05", dow: "SAT", day: "05", mon: "SEP", service: "Consult", price: 950 },
  { id: "06", dow: "SUN", day: "06", mon: "SEP", service: "Session", price: 1800 },
];

export function DateLock({
  openLabel = "Open",
  packageLabel = "Package",
  dueLabel = "Due now",
  hint = "Select a date. See it held.",
}: {
  openLabel?: string;
  packageLabel?: string;
  dueLabel?: string;
  hint?: string;
}) {
  const [held, setHeld] = useState("22");
  const slot = useMemo(
    () => SLOTS.find((s) => s.id === held) ?? SLOTS[0],
    [held],
  );
  const deposit = depositAmount(slot.price, 30);

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden sm:overflow-visible">
      <div className="absolute inset-0 rounded-[1.5rem] bg-signal/10 blur-2xl sm:-inset-6 sm:rounded-[2.5rem] sm:blur-3xl" />
      <motion.div
        layout
        className="relative overflow-hidden rounded-[1.25rem] border border-line bg-void-2/90 shadow-[0_24px_80px_-32px_rgba(126,180,255,0.35)] backdrop-blur-xl sm:rounded-[1.5rem]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-20 overflow-hidden sm:block">
          <div className="scan absolute inset-x-0 h-14" />
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-3 sm:px-5 sm:py-3.5">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-signal">
              {DEMO_NAME}
            </p>
            <p className="mt-0.5 truncate text-xs text-dim sm:text-sm">
              held.app/{DEMO_SLUG}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-xs text-paper">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-signal" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            {openLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4">
          {SLOTS.map((s) => {
            const active = s.id === held;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setHeld(s.id)}
                className={cn(
                  "min-h-[3.6rem] rounded-xl border px-2 py-2 text-center transition-all duration-300 sm:min-h-20 sm:rounded-2xl sm:px-3 sm:py-3",
                  active
                    ? "border-signal bg-signal text-void shadow-[0_0_20px_rgba(126,180,255,0.3)]"
                    : "border-line bg-void/70 text-paper",
                )}
              >
                <span className="block text-[9px] tracking-widest opacity-70 sm:text-[10px]">
                  {s.dow}
                </span>
                <span className="mt-0.5 block font-display text-lg leading-none sm:text-2xl">
                  {s.day}
                </span>
                <span className="mt-0.5 block text-[9px] tracking-widest opacity-70 sm:text-[10px]">
                  {s.mon}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-3 pb-4 sm:px-5 sm:pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-xl border border-line bg-void p-3.5 sm:rounded-2xl sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-dim sm:text-sm">{packageLabel}</p>
                  <p className="mt-0.5 truncate text-base font-medium text-paper sm:text-lg">
                    {slot.service}
                  </p>
                </div>
                <p className="shrink-0 font-display text-xl text-paper sm:text-2xl">
                  {formatMoney(slot.price, "USD")}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2.5 text-void sm:mt-4 sm:px-4 sm:py-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.16em]">
                  {dueLabel}
                </span>
                <motion.span
                  key={deposit}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-xl leading-none sm:text-2xl"
                >
                  {formatMoney(deposit, "USD")}
                </motion.span>
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-2.5 text-center text-xs text-dim sm:mt-3 sm:text-sm">
            {hint}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
