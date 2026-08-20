import { NextRequest, NextResponse } from "next/server";
import { DEMO_SLUG } from "@/lib/constants";
import { listVendorSlots } from "@/lib/availability";
import { resolveProvider } from "@/lib/gateways";
import { phoneLooksValid } from "@/lib/phone";
import { depositCents } from "@/lib/money";
import { initializePaystack } from "@/lib/paystack";
import { timeToMinutes } from "@/lib/schedule";
import { getStripe } from "@/lib/stripe";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { addCalendarDays, instantFromZoned } from "@/lib/timezone";
import { planIsLive } from "@/lib/plan";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function studioSubaccount(
  admin: ReturnType<typeof createAdminSupabase>,
  vendorId: string,
) {
  const { data, error } = await admin
    .from("payout_accounts")
    .select("paystack_subaccount")
    .eq("vendor_id", vendorId)
    .maybeSingle();
  if (error) return null;
  return (data?.paystack_subaccount as string | null) ?? null;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Payments are not on yet. Add the Supabase service role key." },
      { status: 503 },
    );
  }

  let body: {
    slug?: string;
    serviceId?: string;
    date?: string;
    start?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const serviceId = String(body.serviceId ?? "").trim();
  const dateId = String(body.date ?? "").trim();
  const start = String(body.start ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();

  if (slug === DEMO_SLUG) {
    return NextResponse.json(
      { error: "Demo page only. Open your own link to take a deposit." },
      { status: 400 },
    );
  }
  if (!slug || !serviceId || !DATE_RE.test(dateId) || !TIME_RE.test(start)) {
    return NextResponse.json({ error: "Pick a package, day, and time." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Add your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Add a real email." }, { status: 400 });
  }
  if (!phoneLooksValid(phone)) {
    return NextResponse.json({ error: "Add a real phone number." }, { status: 400 });
  }

  const admin = createAdminSupabase();
  let { data: profile, error: profileError } = await admin
    .from("profiles")
    .select(
      "id, display_name, slug, timezone, country, currency, plan_expires_at, buffer_min, lead_min",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (profileError) {
    const retry = await admin
      .from("profiles")
      .select("id, display_name, slug, timezone, country, currency")
      .eq("slug", slug)
      .maybeSingle();
    profile = retry.data as typeof profile;
  }

  if (!profile?.id) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  const expiresAt = (profile as { plan_expires_at?: string | null }).plan_expires_at;
  if ("plan_expires_at" in (profile as object) && !planIsLive(expiresAt)) {
    return NextResponse.json(
      {
        error:
          "This page is paused. The professional needs to renew Held to take deposits.",
      },
      { status: 403 },
    );
  }

  const country = ((profile.country as string) || "NG").toUpperCase();
  const currency = ((profile.currency as string) || "NGN").toUpperCase();
  const provider = resolveProvider(country);
  if (!provider) {
    return NextResponse.json(
      { error: "This page cannot take a deposit right now." },
      { status: 503 },
    );
  }

  const subaccount =
    provider === "paystack"
      ? await studioSubaccount(admin, profile.id as string)
      : null;
  if (provider === "paystack" && !subaccount) {
    return NextResponse.json(
      { error: "This page is not taking deposits until a bank is on file." },
      { status: 403 },
    );
  }

  const { data: service } = await admin
    .from("services")
    .select("id, name, duration_min, price_cents, deposit_percent, active")
    .eq("id", serviceId)
    .eq("vendor_id", profile.id)
    .maybeSingle();

  if (!service?.active) {
    return NextResponse.json({ error: "That package is not available." }, { status: 400 });
  }

  const timezone = (profile.timezone as string) || "Africa/Lagos";
  const durationMin = service.duration_min as number;
  const slots = await listVendorSlots(
    admin,
    profile.id as string,
    timezone,
    dateId,
    durationMin,
    {
      leadMin: (profile as { lead_min?: number }).lead_min ?? 30,
      bufferMin: (profile as { buffer_min?: number }).buffer_min ?? 0,
    },
  );

  if (!slots.some((slot) => slot.start === start)) {
    return NextResponse.json(
      { error: "That time was just taken. Pick another." },
      { status: 409 },
    );
  }

  const startMin = timeToMinutes(start);
  const endMin = startMin + durationMin;
  const startsAt = instantFromZoned(dateId, startMin, timezone);
  const endsAt =
    endMin >= 24 * 60
      ? instantFromZoned(addCalendarDays(dateId, 1), endMin - 24 * 60, timezone)
      : instantFromZoned(dateId, endMin, timezone);

  const amount = depositCents(
    (service.price_cents as number) / 100,
    service.deposit_percent as number,
  );

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .insert({
      vendor_id: profile.id,
      service_id: service.id,
      customer_name: name,
      customer_email: email,
      customer_phone: phone || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "pending",
      deposit_cents: amount,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: bookingError?.message ?? "Could not hold the time." },
      { status: 500 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || request.nextUrl.origin;
  const bookingId = booking.id as string;

  try {
    if (provider === "paystack") {
      const reference = `held_${bookingId.replace(/-/g, "")}`;
      const session = await initializePaystack({
        email,
        amount,
        currency,
        reference,
        callbackUrl: `${origin}/book/${slug}/success?reference=${reference}`,
        metadata: {
          booking_id: bookingId,
          kind: "deposit",
          slug,
          vendor_id: profile.id as string,
        },
        subaccount,
      });
      return NextResponse.json({ url: session.authorization_url });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
      success_url: `${origin}/book/${slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/${slug}`,
      metadata: {
        booking_id: bookingId,
        kind: "deposit",
        slug,
        vendor_id: profile.id as string,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: `${service.name} deposit`,
              description: `${profile.display_name} · ${dateId} · ${start}`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout link.");
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("status", "pending");

    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
