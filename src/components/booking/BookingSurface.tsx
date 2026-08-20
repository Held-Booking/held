"use client";

import { useEffect, useMemo, useState } from "react";
import { BookBar } from "@/components/booking/BookBar";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { depositAmount } from "@/lib/money";
import { phoneLooksValid } from "@/lib/phone";
import type { TimeSlot } from "@/lib/slots";
import { PAYSTACK_COUNTRIES } from "@/lib/gateways";
import type { Locale, Messages } from "@/lib/i18n";
import { fill } from "@/lib/i18n";
import type { VendorPage } from "@/lib/vendor-page";
import { cn, formatMoney } from "@/lib/utils";

export function BookingSurface({
  page,
  lang,
  copy,
  nav,
}: {
  page: VendorPage;
  lang: Locale;
  copy: Messages["book"];
  nav?: Messages["nav"];
}) {
  const [pkg, setPkg] = useState(page.packages[0]?.id ?? "");
  const [day, setDay] = useState(page.days[0]?.id ?? "");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const selected = useMemo(
    () => page.packages.find((item) => item.id === pkg) ?? page.packages[0],
    [pkg, page.packages],
  );
  const dayLabel = page.days.find((item) => item.id === day)?.label ?? "";
  const slotLabel = slots.find((item) => item.start === slot)?.label ?? "";
  const deposit = selected
    ? depositAmount(selected.price, selected.depositPercent)
    : 0;
  const rest = selected ? Math.max(0, selected.price - deposit) : 0;
  const canPay = Boolean(
    selected &&
      day &&
      slot &&
      name.trim().length >= 2 &&
      email.includes("@") &&
      phoneLooksValid(phone) &&
      page.paymentsOn,
  );

  async function pay() {
    if (!selected || !canPay || paying) return;
    setPayError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: page.slug,
          serviceId: selected.id,
          date: day,
          start: slot,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setPayError(data.error ?? "Could not start payment.");
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPayError("Could not start payment.");
      setPaying(false);
    }
  }

  useEffect(() => {
    setSlot("");
    if (!selected || !day) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    fetch(
      `/api/availability?slug=${encodeURIComponent(page.slug)}&date=${day}&duration=${selected.durationMin}`,
    )
      .then((res) => res.json())
      .then((data: { slots?: TimeSlot[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page.slug, day, selected]);

  return (
    <main className="relative min-h-dvh bg-void text-paper">
      {page.isDemo ? (
        <SiteHeader lang={lang} labels={nav} />
      ) : (
        <BookBar lang={lang} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(126,180,255,0.16),transparent_50%)]" />

      <div
        className={cn(
          "relative z-10 mx-auto max-w-lg px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] sm:px-6",
          page.isDemo
            ? "pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-16"
            : "pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-20",
        )}
      >
        <header className="flex flex-col items-center text-center">
          {page.photo ? (
            <img
              src={page.photo}
              alt={page.name}
              className="h-24 w-24 rounded-[1.75rem] object-cover shadow-[0_16px_40px_-20px_rgba(126,180,255,0.55)] sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-line bg-void-2 font-display text-4xl text-signal sm:h-28 sm:w-28">
              {page.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="mt-5 font-display text-[clamp(2.1rem,9vw,3.25rem)] leading-[0.92]">
            {page.name}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-dim sm:text-base">
            {page.blurb}
          </p>
        </header>

        <section className="mt-9 text-center sm:mt-11">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
            01
          </p>
          <p className="mt-2 text-base font-medium">{copy.choose}</p>
          {page.packages.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
              {copy.noPackages}
            </p>
          ) : (
            <div className="mt-4 grid gap-2.5 text-start">
              {page.packages.map((item) => {
                const on = item.id === pkg;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPkg(item.id)}
                    className={cn(
                      "flex min-h-16 flex-col items-center gap-2 rounded-[1.25rem] border px-4 py-3.5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start",
                      on
                        ? "border-signal bg-signal text-void shadow-[0_0_24px_rgba(126,180,255,0.28)]"
                        : "border-line bg-void-2/80",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-medium">{item.name}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-sm",
                          on ? "text-void/70" : "text-dim",
                        )}
                      >
                        {item.detail}
                        {item.location ? ` · ${item.location}` : ""}
                        {item.note ? ` · ${item.note}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-display text-2xl sm:text-xl">
                      {formatMoney(item.price, page.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-9 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
            02
          </p>
          <p className="mt-2 text-base font-medium">{copy.pickDay}</p>
          {page.days.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
              {copy.noDays}
            </p>
          ) : (
            <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {page.days.map((item) => {
                const on = item.id === day;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDay(item.id)}
                    className={cn(
                      "min-h-14 shrink-0 rounded-2xl border px-4 text-sm font-medium",
                      on ? "border-signal bg-signal text-void" : "border-line bg-void-2/80",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-9 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
            03
          </p>
          <p className="mt-2 text-base font-medium">{copy.pickTime}</p>
          <p className="mt-1 text-xs text-dim">
            {fill(copy.timesIn, { zone: page.timezone })}
          </p>
          {slotsLoading ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
              {copy.loading}
            </p>
          ) : slots.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6 text-sm text-dim">
              {copy.noTimes}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {slots.map((item) => {
                const on = item.start === slot;
                return (
                  <button
                    key={item.start}
                    type="button"
                    onClick={() => setSlot(item.start)}
                    className={cn(
                      "min-h-12 rounded-2xl border px-1 text-sm font-medium",
                      on ? "border-signal bg-signal text-void" : "border-line bg-void-2/80",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-9 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
            04
          </p>
          <p className="mt-2 text-base font-medium">{copy.payReserve}</p>
          {selected && day && slot ? (
            <div className="mt-4 space-y-3 text-start">
              <div className="rounded-[1.35rem] bg-paper p-5 text-center text-void">
                <p className="text-sm text-void/70">
                  {selected.name} · {dayLabel} · {slotLabel}
                </p>
                <p className="mt-2 font-display text-4xl leading-none">
                  {formatMoney(deposit, page.currency)}
                </p>
                <p className="mt-3 text-sm text-void/70">
                  {fill(copy.percentNow, {
                    percent: selected.depositPercent,
                    name: page.name,
                  })}
                  {rest > 0
                    ? ` ${fill(copy.dueAt, {
                        rest: formatMoney(rest, page.currency),
                      })}`
                    : ` ${copy.paidFull}`}
                </p>
                {selected.location ? (
                  <p className="mt-2 text-sm text-void/70">{selected.location}</p>
                ) : null}
              </div>
              {page.paymentsOn ? (
                <div className="space-y-3 rounded-[1.35rem] border border-line bg-void-2/80 p-4">
                  <label className="block text-sm text-dim">
                    {copy.name}
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      placeholder={copy.yourName}
                      className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
                    />
                  </label>
                  <label className="block text-sm text-dim">
                    {copy.email}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@email.com"
                      className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
                    />
                  </label>
                  <label className="block text-sm text-dim">
                    {copy.phone}
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="08012345678"
                      className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-void px-4 text-base text-paper placeholder:text-dim/60"
                    />
                  </label>
                </div>
              ) : (
                <p className="rounded-[1.35rem] border border-dashed border-line px-4 py-6 text-center text-sm text-dim">
                  {page.isDemo
                    ? copy.demoOnly
                    : !page.planLive
                      ? copy.pausedPlan
                      : page.bankReady
                        ? copy.notOpen
                        : copy.needBank}
                </p>
              )}
              {payError ? (
                <p className="rounded-xl border border-line bg-void-2 px-4 py-3 text-center text-sm">
                  {payError}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 rounded-[1.35rem] border border-dashed border-line px-4 py-6 text-sm text-dim">
              {copy.pickFirst}
            </p>
          )}
        </section>
      </div>

      {page.paymentsOn && canPay ? (
        <div
          className="fixed inset-x-3 z-20"
          style={{
            bottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <p className="mb-2 text-center text-xs text-dim">
            {PAYSTACK_COUNTRIES.has(page.country)
              ? copy.methods
              : copy.methodsCard}
          </p>
          <button
            type="button"
            onClick={pay}
            disabled={paying}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-signal text-sm font-medium text-void disabled:opacity-40 md:min-h-14 md:text-base"
          >
            {paying
              ? copy.opening
              : fill(copy.payNow, {
                  amount: formatMoney(deposit, page.currency),
                })}
          </button>
        </div>
      ) : null}
    </main>
  );
}
