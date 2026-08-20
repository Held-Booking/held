import type { Metadata } from "next";
import Link from "next/link";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { PAYSTACK_COUNTRIES } from "@/lib/gateways";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { pagePathLabel } from "@/lib/page-url";
import { planDaysLeft, planIsLive } from "@/lib/plan";
import { requireVendor } from "@/lib/supabase/vendor";
import { addCalendarDays, instantFromZoned, zonedParts } from "@/lib/timezone";
import { formatWhen } from "@/lib/when";

export const metadata: Metadata = {
  title: "Home",
};

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const { supabase, user, profile } = await requireVendor();
  const t = dict(await getLang());
  const timezone = (profile.timezone as string) || "Africa/Lagos";
  const now = new Date();
  const todayId = zonedParts(now, timezone).dateId;
  const dayStart = instantFromZoned(todayId, 0, timezone);
  const dayEnd = instantFromZoned(addCalendarDays(todayId, 1), 0, timezone);

  const [
    { count: packageCount },
    { count: hourCount },
    { count: todayCount },
    { data: nextBooking },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id),
    supabase
      .from("availability")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id)
      .eq("status", "confirmed")
      .gte("starts_at", dayStart.toISOString())
      .lt("starts_at", dayEnd.toISOString()),
    supabase
      .from("bookings")
      .select("customer_name, starts_at, services(name)")
      .eq("vendor_id", user.id)
      .eq("status", "confirmed")
      .gte("starts_at", now.toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const country = ((profile.country as string) || "NG").toUpperCase();
  const needsBank =
    PAYSTACK_COUNTRIES.has(country) && !profile.paystack_subaccount;
  const live = planIsLive(profile.plan_expires_at);
  const daysLeft = planDaysLeft(profile.plan_expires_at);
  const paid =
    profile.plan_status === "active" || profile.plan_status === "canceled";
  const hasPackages = (packageCount ?? 0) > 0;
  const hasHours = (hourCount ?? 0) > 0;
  const ready = hasPackages && hasHours && !needsBank;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const pageUrl = `${origin}/book/${profile.slug}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Book with ${profile.display_name}: ${pageUrl}`)}`;
  const emailShare = `mailto:?subject=${encodeURIComponent(`Book with ${profile.display_name}`)}&body=${encodeURIComponent(pageUrl)}`;

  const nextService = nextBooking?.services as
    | { name?: string }
    | { name?: string }[]
    | null
    | undefined;
  const nextName = Array.isArray(nextService)
    ? nextService[0]?.name
    : nextService?.name;

  const steps = [
    {
      done: hasPackages,
      href: "/dashboard/services",
      label: t.dash.addPackage,
    },
    {
      done: hasHours,
      href: "/dashboard/availability",
      label: t.dash.setHours,
    },
    {
      done: !needsBank,
      href: "/dashboard/settings",
      label: t.dash.addBank,
    },
    {
      done: Boolean(profile.whatsapp),
      href: "/dashboard/settings",
      label: t.dash.addWa,
    },
  ];

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        home
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">
        {profile.display_name}
      </h1>
      <p className="mt-3 text-dim">{pagePathLabel(origin, profile.slug as string)}</p>
      <p className="mx-auto mt-6 max-w-md text-dim lg:mx-0">
        {ready && live
          ? t.dash.pageReady
          : ready && !live
            ? t.dash.pausedPage
            : t.dash.finishSetup}
      </p>

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
        <CopyLink value={pageUrl} label={t.dash.copy} copied={t.dash.copied} />
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 text-sm sm:w-auto"
        >
          {t.dash.share}
        </a>
        <a
          href={emailShare}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 text-sm sm:w-auto"
        >
          {t.dash.shareEmail}
        </a>
        <Link
          href={`/book/${profile.slug}`}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 text-sm sm:w-auto"
        >
          {t.dash.view}
        </Link>
      </div>

      {!ready ? (
        <ul className="mx-auto mt-8 max-w-md space-y-2 lg:mx-0">
          {steps.map((step) => (
            <li key={step.label}>
              <Link
                href={step.href}
                className="flex items-center justify-between rounded-2xl border border-line bg-void-2 px-4 py-3 text-sm"
              >
                <span>{step.label}</span>
                <span className={step.done ? "text-signal" : "text-dim"}>
                  {step.done ? t.dash.done : t.dash.open}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {needsBank ? (
        <p className="mx-auto mt-6 max-w-md rounded-xl border border-line bg-void-2 px-4 py-3 text-sm lg:mx-0">
          Deposits stay closed until you add a bank.{" "}
          <Link href="/dashboard/settings" className="text-signal">
            Add bank
          </Link>
        </p>
      ) : null}
      {!profile.plan_expires_at ? null : !paid && live ? (
        <p className="mx-auto mt-6 max-w-md rounded-xl border border-line bg-void-2 px-4 py-3 text-sm lg:mx-0">
          {daysLeft} day{daysLeft === 1 ? "" : "s"} left on the Held trial. Then{" "}
          <Link href="/dashboard/billing" className="text-signal">
            $12 a month
          </Link>
          .
        </p>
      ) : !live ? (
        <p className="mx-auto mt-6 max-w-md rounded-xl border border-line bg-void-2 px-4 py-3 text-sm lg:mx-0">
          The trial ended. Pay Held to keep taking deposits.{" "}
          <Link href="/dashboard/billing" className="text-signal">
            Billing
          </Link>
        </p>
      ) : null}

      {nextBooking ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-void-2 px-4 py-4 lg:mx-0">
          <p className="text-xs uppercase tracking-[0.18em] text-dim">{t.dash.next}</p>
          <p className="mt-2 font-medium">{nextBooking.customer_name as string}</p>
          <p className="text-sm text-dim">
            {nextName ?? "Package"} ·{" "}
            {formatWhen(nextBooking.starts_at as string, timezone)}
          </p>
        </div>
      ) : null}

      <div className="mt-10 h-px w-full bg-line" />
      {(todayCount ?? 0) > 0 ? (
        <>
          <p className="mt-8 font-display text-5xl text-paper/15 sm:text-7xl">
            {String(todayCount).padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm text-dim">{t.dash.bookingsToday}</p>
        </>
      ) : (
        <>
          {ready && live ? (
            <p className="mt-8 text-base text-paper">{t.dash.pageLive}</p>
          ) : null}
          <p className={`text-sm text-dim ${ready && live ? "mt-2" : "mt-8"}`}>
            {t.dash.noBookings}
          </p>
        </>
      )}
    </div>
  );
}
