import { deleteGoogleEvent, upsertGoogleEvent } from "@/lib/google-calendar";
import type { PaymentProvider } from "@/lib/gateways";
import { notifyBooking } from "@/lib/notify";
import { createAdminSupabase } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminSupabase>;

async function syncGoogleEvent(admin: Admin, bookingId: string) {
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, vendor_id, starts_at, ends_at, google_event_id, customer_name, customer_email, services(name)",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, google_refresh_token, google_calendar_id")
    .eq("id", booking.vendor_id)
    .maybeSingle();
  if (!profile?.google_refresh_token) return;

  const service = booking.services as
    | { name?: string }
    | { name?: string }[]
    | null;
  const pack = Array.isArray(service) ? service[0] : service;
  const eventId = await upsertGoogleEvent({
    refreshToken: profile.google_refresh_token as string,
    calendarId: profile.google_calendar_id as string | null,
    eventId: (booking.google_event_id as string) || null,
    title: `${pack?.name ?? "Booking"} · ${booking.customer_name ?? "Client"}`,
    start: booking.starts_at as string,
    end: booking.ends_at as string,
    description: booking.customer_email
      ? `Booked on Held. ${booking.customer_email}`
      : "Booked on Held.",
  });
  if (eventId && eventId !== booking.google_event_id) {
    await admin
      .from("bookings")
      .update({ google_event_id: eventId })
      .eq("id", bookingId);
  }
}

export async function fulfillPayment(input: {
  bookingId: string;
  reference: string;
  amountCents: number;
  provider: PaymentProvider;
  mode?: "paid" | "cancel";
}) {
  const admin = createAdminSupabase();

  if (input.mode === "cancel") {
    const { data: booking } = await admin
      .from("bookings")
      .select("id, vendor_id, google_event_id, status")
      .eq("id", input.bookingId)
      .maybeSingle();
    await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", input.bookingId)
      .eq("status", "pending");
    if (booking?.google_event_id && booking.status === "confirmed") {
      const { data: profile } = await admin
        .from("profiles")
        .select("google_refresh_token, google_calendar_id")
        .eq("id", booking.vendor_id)
        .maybeSingle();
      if (profile?.google_refresh_token) {
        try {
          await deleteGoogleEvent({
            refreshToken: profile.google_refresh_token as string,
            calendarId: profile.google_calendar_id as string | null,
            eventId: booking.google_event_id as string,
          });
        } catch {
          // Calendar delete can fail without undoing cancel.
        }
      }
    }
    return { ok: true as const };
  }

  const { data: booking } = await admin
    .from("bookings")
    .select("id, status")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (!booking) return { ok: false as const, error: "Booking not found." };

  if (booking.status !== "confirmed") {
    const { error } = await admin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", input.bookingId);
    if (error) return { ok: false as const, error: error.message };
  }

  const { error: payError } = await admin.from("payments").upsert(
    {
      booking_id: input.bookingId,
      stripe_id: input.reference,
      amount_cents: input.amountCents,
      status: "paid",
      provider: input.provider,
    },
    { onConflict: "stripe_id" },
  );

  if (payError) return { ok: false as const, error: payError.message };
  try {
    await syncGoogleEvent(admin, input.bookingId);
  } catch {
    // Calendar is extra. The deposit already landed.
  }
  try {
    await notifyBooking(input.bookingId);
  } catch {
    // Deposit already landed. Mail can fail without undoing that.
  }
  return { ok: true as const };
}

export async function fulfillBalance(input: {
  bookingId: string;
  reference: string;
  amountCents: number;
  provider: PaymentProvider;
}) {
  const admin = createAdminSupabase();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, status, balance_paid_at")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (!booking) return { ok: false as const, error: "Booking not found." };
  if (booking.status !== "confirmed") {
    return { ok: false as const, error: "This booking cannot take the rest." };
  }

  if (!booking.balance_paid_at) {
    const { error } = await admin
      .from("bookings")
      .update({ balance_paid_at: new Date().toISOString() })
      .eq("id", input.bookingId);
    if (error) return { ok: false as const, error: error.message };
  }

  const { error: payError } = await admin.from("payments").upsert(
    {
      booking_id: input.bookingId,
      stripe_id: input.reference,
      amount_cents: input.amountCents,
      status: "paid",
      provider: input.provider,
    },
    { onConflict: "stripe_id" },
  );
  if (payError) return { ok: false as const, error: payError.message };
  return { ok: true as const };
}
