import { NextRequest, NextResponse } from "next/server";
import { listVendorSlots } from "@/lib/availability";
import { deleteGoogleEvent, upsertGoogleEvent } from "@/lib/google-calendar";
import { timeToMinutes } from "@/lib/schedule";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { addCalendarDays, instantFromZoned } from "@/lib/timezone";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not ready." }, { status: 503 });
  }

  let body: { token?: string; action?: string; date?: string; start?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const action = String(body.action ?? "").trim();
  if (!token) return NextResponse.json({ error: "Missing booking." }, { status: 400 });

  const admin = createAdminSupabase();
  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, vendor_id, service_id, status, starts_at, ends_at, google_event_id, services(name, duration_min)",
    )
    .eq("manage_token", token)
    .maybeSingle();

  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "This booking cannot be changed." }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("timezone, google_refresh_token, google_calendar_id, display_name, buffer_min, lead_min")
    .eq("id", booking.vendor_id)
    .maybeSingle();

  const timezone = (profile?.timezone as string) || "Africa/Lagos";
  const service = booking.services as
    | { name?: string; duration_min?: number }
    | { name?: string; duration_min?: number }[]
    | null;
  const pack = Array.isArray(service) ? service[0] : service;

  if (action === "cancel") {
    await admin.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
    if (profile?.google_refresh_token && booking.google_event_id) {
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
    return NextResponse.json({ ok: true });
  }

  if (action !== "reschedule") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const dateId = String(body.date ?? "");
  const start = String(body.start ?? "");
  if (!DATE_RE.test(dateId) || !TIME_RE.test(start)) {
    return NextResponse.json({ error: "Pick a day and time." }, { status: 400 });
  }

  const durationMin = pack?.duration_min ?? 60;
  const slots = await listVendorSlots(
    admin,
    booking.vendor_id as string,
    timezone,
    dateId,
    durationMin,
    {
      leadMin: (profile as { lead_min?: number } | null)?.lead_min ?? 30,
      bufferMin: (profile as { buffer_min?: number } | null)?.buffer_min ?? 0,
      exceptBookingId: booking.id as string,
    },
  );
  if (!slots.some((slot) => slot.start === start)) {
    return NextResponse.json({ error: "That time was just taken." }, { status: 409 });
  }

  const startMin = timeToMinutes(start);
  const endMin = startMin + durationMin;
  const startsAt = instantFromZoned(dateId, startMin, timezone);
  const endsAt =
    endMin >= 24 * 60
      ? instantFromZoned(addCalendarDays(dateId, 1), endMin - 24 * 60, timezone)
      : instantFromZoned(dateId, endMin, timezone);

  await admin
    .from("bookings")
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", booking.id);

  if (profile?.google_refresh_token) {
    try {
      const eventId = await upsertGoogleEvent({
        refreshToken: profile.google_refresh_token as string,
        calendarId: profile.google_calendar_id as string | null,
        eventId: (booking.google_event_id as string) || null,
        title: `${pack?.name ?? "Booking"} with ${profile.display_name ?? "Held"}`,
        start: startsAt.toISOString(),
        end: endsAt.toISOString(),
        timeZone: timezone,
      });
      if (eventId) {
        await admin.from("bookings").update({ google_event_id: eventId }).eq("id", booking.id);
      }
    } catch {
      // Calendar update is extra.
    }
  }

  return NextResponse.json({ ok: true });
}
