import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManageSurface } from "@/components/booking/ManageSurface";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { loadVendorPage } from "@/lib/vendor-page";
import { formatWhen } from "@/lib/when";

export const metadata: Metadata = { title: "Your booking" };
export const dynamic = "force-dynamic";

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) notFound();

  const admin = createAdminSupabase();
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, vendor_id, status, starts_at, deposit_cents, balance_paid_at, services(name, duration_min, price_cents, location)",
    )
    .eq("manage_token", token)
    .maybeSingle();

  if (!booking) notFound();

  const page = await loadVendorPage(slug);
  if (!page || page.isDemo) notFound();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, slug, display_name, timezone, currency")
    .eq("id", booking.vendor_id)
    .maybeSingle();

  if (!profile || profile.slug !== slug) notFound();

  const service = booking.services as
    | {
        name?: string;
        duration_min?: number;
        price_cents?: number;
        location?: string | null;
      }
    | {
        name?: string;
        duration_min?: number;
        price_cents?: number;
        location?: string | null;
      }[]
    | null;
  const pack = Array.isArray(service) ? service[0] : service;
  const timezone = (profile.timezone as string) || "Africa/Lagos";
  const currency = (profile.currency as string) || "NGN";
  const rest = Math.max(
    0,
    ((pack?.price_cents ?? 0) - (booking.deposit_cents as number)) / 100,
  );
  const lang = await getLang();
  const t = dict(lang);

  return (
    <ManageSurface
      slug={slug}
      token={token}
      bookingId={booking.id as string}
      lang={lang}
      copy={t.manage}
      vendor={(profile.display_name as string) || page.name}
      packageName={pack?.name ?? "Package"}
      when={formatWhen(booking.starts_at as string, timezone)}
      status={booking.status as string}
      rest={rest}
      restPaid={Boolean(booking.balance_paid_at)}
      currency={currency}
      days={page.days}
      durationMin={pack?.duration_min ?? 60}
      location={(pack?.location as string) || ""}
    />
  );
}
