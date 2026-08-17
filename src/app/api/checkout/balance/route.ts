import { NextRequest, NextResponse } from "next/server";
import { PAYSTACK_COUNTRIES, resolveProvider } from "@/lib/gateways";
import { initializePaystack } from "@/lib/paystack";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

async function studioSubaccount(
  admin: ReturnType<typeof createAdminSupabase>,
  vendorId: string,
) {
  const { data } = await admin
    .from("payout_accounts")
    .select("paystack_subaccount")
    .eq("vendor_id", vendorId)
    .maybeSingle();
  return (data?.paystack_subaccount as string | null) ?? null;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not ready." }, { status: 503 });
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  if (!token) return NextResponse.json({ error: "Missing booking." }, { status: 400 });

  const admin = createAdminSupabase();
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, vendor_id, customer_email, deposit_cents, status, balance_paid_at, services(price_cents, name)",
    )
    .eq("manage_token", token)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "This booking cannot take the rest." }, { status: 400 });
  }
  if (booking.balance_paid_at) {
    return NextResponse.json({ error: "The rest is already paid." }, { status: 400 });
  }

  const service = booking.services as
    | { price_cents?: number; name?: string }
    | { price_cents?: number; name?: string }[]
    | null;
  const pack = Array.isArray(service) ? service[0] : service;
  const rest = Math.max(0, (pack?.price_cents ?? 0) - (booking.deposit_cents as number));
  if (rest < 1) {
    return NextResponse.json({ error: "Nothing left to pay." }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, slug, country, currency, display_name")
    .eq("id", booking.vendor_id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Page not found." }, { status: 404 });

  const country = ((profile.country as string) || "NG").toUpperCase();
  const currency = ((profile.currency as string) || "NGN").toUpperCase();
  const provider = resolveProvider(country);
  if (provider !== "paystack") {
    return NextResponse.json({ error: "Balance pay is on Paystack." }, { status: 400 });
  }
  const subaccount = PAYSTACK_COUNTRIES.has(country)
    ? await studioSubaccount(admin, profile.id as string)
    : null;
  if (!subaccount) {
    return NextResponse.json({ error: "Bank is not on file." }, { status: 403 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || request.nextUrl.origin;
  const slug = profile.slug as string;
  const reference = `heldbal_${(booking.id as string).replace(/-/g, "")}`;

  const session = await initializePaystack({
    email: (booking.customer_email as string) || "client@held.app",
    amount: rest,
    currency,
    reference,
    callbackUrl: `${origin}/book/${slug}/success?reference=${reference}`,
    metadata: {
      booking_id: booking.id,
      kind: "balance",
      slug,
      vendor_id: profile.id,
    },
    subaccount,
  });

  return NextResponse.json({ url: session.authorization_url });
}
