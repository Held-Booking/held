import { NextRequest, NextResponse } from "next/server";
import { DEMO_SLUG } from "@/lib/constants";
import { listVendorSlots } from "@/lib/availability";
import { generateSlots, type TimeSlot } from "@/lib/slots";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { weekdayOfDate, zonedParts } from "@/lib/timezone";
import { DEMO_HOURS, DEMO_TIMEZONE } from "@/lib/vendor-page";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const slug = String(request.nextUrl.searchParams.get("slug") ?? "");
  const dateId = String(request.nextUrl.searchParams.get("date") ?? "");
  const durationMin = Number(request.nextUrl.searchParams.get("duration"));
  const exceptBookingId =
    String(request.nextUrl.searchParams.get("except") ?? "").trim() || undefined;

  if (!slug || !DATE_RE.test(dateId)) {
    return NextResponse.json(
      { ok: false, error: "Missing day.", slots: [] },
      { status: 400 },
    );
  }
  if (!durationMin || durationMin < 5) {
    return NextResponse.json(
      { ok: false, error: "Missing package time.", slots: [] },
      { status: 400 },
    );
  }

  if (slug === DEMO_SLUG) {
    return NextResponse.json({
      ok: true,
      slots: demoSlots(dateId, durationMin),
    });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, slots: [] });
  }

  const supabase = await createServerSupabase();
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, timezone, buffer_min, lead_min")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    const retry = await supabase
      .from("profiles")
      .select("id, timezone")
      .eq("slug", slug)
      .maybeSingle();
    profile = retry.data as typeof profile;
  }

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Page not found.", slots: [] },
      { status: 404 },
    );
  }

  const timezone = (profile.timezone as string) || "UTC";
  const slots = await listVendorSlots(
    supabase,
    profile.id as string,
    timezone,
    dateId,
    durationMin,
    {
      leadMin: (profile as { lead_min?: number }).lead_min ?? 30,
      bufferMin: (profile as { buffer_min?: number }).buffer_min ?? 0,
      exceptBookingId,
    },
  );

  return NextResponse.json({ ok: true, slots });
}

function demoSlots(dateId: string, durationMin: number): TimeSlot[] {
  const weekday = weekdayOfDate(dateId, DEMO_TIMEZONE);
  const now = zonedParts(new Date(), DEMO_TIMEZONE);
  const nowMin = now.dateId === dateId ? now.minutes : undefined;
  return DEMO_HOURS.filter((row) => row.weekday === weekday).flatMap((row) =>
    generateSlots({
      startMin: row.startMin,
      endMin: row.endMin,
      durationMin,
      nowMin,
    }),
  );
}
