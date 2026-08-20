import type { Metadata } from "next";
import Link from "next/link";
import { BookBar } from "@/components/booking/BookBar";
import { PayRestButton } from "@/components/booking/PayRestButton";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { googleCalendarUrl, icsHref } from "@/lib/calendar";
import { DEMO_SLUG } from "@/lib/constants";
import { dict, fill } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { fulfillBalance, fulfillPayment } from "@/lib/payment-fulfill";
import { verifyPaystack } from "@/lib/paystack";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/stripe-fulfill";
import {
  isPaystackConfigured,
  isServiceRoleConfigured,
  isStripeConfigured,
} from "@/lib/supabase/config";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/utils";
import { formatWhen } from "@/lib/when";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Booked",
};

export const dynamic = "force-dynamic";

export default async function BookSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; reference?: string }>;
}) {
  const { slug } = await params;
  const { session_id: sessionId, reference } = await searchParams;
  const lang = await getLang();
  const t = dict(lang);

  let paid = false;
  let detail = t.success.notYet;
  let bookingId: string | null = null;

  if (isServiceRoleConfigured()) {
    if (reference && isPaystackConfigured()) {
      try {
        const tx = await verifyPaystack(reference);
        if (tx.status === "success" && tx.metadata?.booking_id) {
          bookingId = tx.metadata.booking_id;
          const isBalance =
            tx.metadata.kind === "balance" || reference.startsWith("heldbal_");
          const result = isBalance
            ? await fulfillBalance({
                bookingId,
                reference: tx.reference,
                amountCents: tx.amount,
                provider: "paystack",
              })
            : await fulfillPayment({
                bookingId,
                reference: tx.reference,
                amountCents: tx.amount,
                provider: "paystack",
              });
          if (result.ok) {
            paid = true;
            detail = t.success.holds;
          } else {
            detail = result.error ?? t.success.confirmFail;
          }
        } else {
          detail = t.success.processing;
        }
      } catch {
        detail = t.success.confirmFail;
      }
    } else if (sessionId && isStripeConfigured()) {
      try {
        const session = await getStripe().checkout.sessions.retrieve(sessionId);
        bookingId = session.metadata?.booking_id ?? null;
        const result = await fulfillCheckoutSession(session);
        if (result.ok && session.payment_status === "paid") {
          paid = true;
          detail = t.success.holds;
        } else {
          detail = result.ok ? t.success.processing : (result.error ?? t.success.confirmFail);
        }
      } catch {
        detail = t.success.confirmFail;
      }
    }
  }

  let chatUrl: string | null = null;
  let calendarUrl: string | null = null;
  let calendarFile: string | null = null;
  let manageUrl: string | null = null;
  let receipt: {
    vendor: string;
    packageName: string;
    when: string;
    deposit: string;
    rest: string;
    restAmount: number;
    restPaid: boolean;
    location: string;
    token: string | null;
  } | null = null;

  if (paid && bookingId && isServiceRoleConfigured()) {
    try {
      const admin = createAdminSupabase();
      const { data: booking } = await admin
        .from("bookings")
        .select(
          "customer_name, starts_at, ends_at, deposit_cents, balance_paid_at, manage_token, vendor_id, services(name, price_cents, location)",
        )
        .eq("id", bookingId)
        .maybeSingle();
      if (booking?.vendor_id) {
        const { data: studio } = await admin
          .from("profiles")
          .select("display_name, whatsapp, country, timezone, currency")
          .eq("id", booking.vendor_id)
          .maybeSingle();
        const service = booking.services as
          | { name?: string; price_cents?: number; location?: string | null }
          | { name?: string; price_cents?: number; location?: string | null }[]
          | null;
        const pack = Array.isArray(service) ? service[0] : service;
        const timezone = (studio?.timezone as string) || "Africa/Lagos";
        const currency = (studio?.currency as string) || "NGN";
        const when = formatWhen(booking.starts_at as string, timezone);
        const deposit = (booking.deposit_cents as number) / 100;
        const price = (pack?.price_cents ?? 0) / 100;
        const rest = Math.max(0, price - deposit);
        const token = (booking.manage_token as string) || null;
        receipt = {
          vendor: (studio?.display_name as string) || "Held",
          packageName: pack?.name ?? "Package",
          when,
          deposit: formatMoney(deposit, currency),
          rest: rest > 0 ? formatMoney(rest, currency) : "",
          restAmount: rest,
          restPaid: Boolean(booking.balance_paid_at),
          location: (pack?.location as string) || "",
          token,
        };
        if (token) manageUrl = `/book/${slug}/manage/${token}`;
        const cal = {
          title: `${receipt.packageName} with ${receipt.vendor}`,
          start: new Date(booking.starts_at as string),
          end: new Date(booking.ends_at as string),
          details: `Deposit ${receipt.deposit}${receipt.rest ? `. ${receipt.rest} due at the booking.` : ""}`,
        };
        calendarUrl = googleCalendarUrl(cal);
        calendarFile = icsHref(cal);
        chatUrl = whatsappUrl(
          studio?.whatsapp as string | null,
          `Hi ${studio?.display_name || "there"}, I just booked ${receipt.packageName} for ${when}.`,
          (studio?.country as string) || "NG",
        );
      }
    } catch {
      chatUrl = null;
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-x-clip bg-void px-4 pb-16 pt-[calc(4rem+env(safe-area-inset-top))] text-center">
      {slug === DEMO_SLUG ? (
        <SiteHeader lang={lang} labels={t.nav} />
      ) : (
        <BookBar lang={lang} />
      )}
      <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-signal/20 blur-3xl sm:h-64 sm:w-64" />
      <h1 className="relative font-display text-[clamp(2.4rem,12vw,6rem)] leading-[0.9] whitespace-pre-line">
        {paid ? t.success.booked : t.success.notLocked}
      </h1>
      <p className="relative mt-5 max-w-sm text-base text-dim sm:mt-6 sm:text-lg">
        {detail}
      </p>
      {receipt ? (
        <div className="relative mt-8 w-full max-w-sm rounded-2xl border border-line bg-void-2 px-5 py-5 text-center">
          <p className="font-medium">{receipt.vendor}</p>
          <p className="mt-1 text-sm text-dim">{receipt.packageName}</p>
          <p className="mt-3 font-display text-2xl">{receipt.when}</p>
          <p className="mt-3 text-sm text-dim">
            {fill(t.success.depositPaid, { amount: receipt.deposit })}
          </p>
          {receipt.rest ? (
            <p className="text-sm text-dim">
              {receipt.restPaid
                ? t.manage.restPaid
                : fill(t.book.dueAt, { rest: receipt.rest })}
            </p>
          ) : (
            <p className="text-sm text-dim">{t.book.paidFull}</p>
          )}
          {receipt.location ? (
            <p className="mt-2 text-sm text-dim">{receipt.location}</p>
          ) : null}
        </div>
      ) : null}
      <div className="relative mt-8 flex w-full max-w-xs flex-col gap-3">
        {chatUrl ? (
          <a
            href={chatUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center rounded-full bg-paper px-6 text-sm font-medium text-void"
          >
            {t.success.chat}
          </a>
        ) : null}
        {calendarUrl ? (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center rounded-full border border-line px-6 text-sm hover:border-signal hover:text-signal"
          >
            {t.success.calendar}
          </a>
        ) : null}
        {calendarFile ? (
          <a
            href={calendarFile}
            download="held.ics"
            className="flex min-h-12 items-center justify-center rounded-full border border-line px-6 text-sm hover:border-signal hover:text-signal"
          >
            {t.success.calendarFile}
          </a>
        ) : null}
        {manageUrl ? (
          <Link
            href={manageUrl}
            className="flex min-h-12 items-center justify-center rounded-full border border-line px-6 text-sm hover:border-signal hover:text-signal"
          >
            {t.success.manage}
          </Link>
        ) : null}
        {receipt && receipt.restAmount > 0 && !receipt.restPaid && receipt.token ? (
          <PayRestButton token={receipt.token} label={t.success.payRest} />
        ) : null}
        <Link
          href={`/book/${slug}`}
          className="flex min-h-12 items-center justify-center rounded-full border border-line px-6 text-sm hover:border-signal hover:text-signal"
        >
          {paid ? t.success.another : t.success.back}
        </Link>
      </div>
    </main>
  );
}
