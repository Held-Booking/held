import { busyOnDate, generateSlots, type TimeSlot } from "@/lib/slots";
import {
  addCalendarDays,
  instantFromZoned,
  weekdayOfDate,
  zonedParts,
} from "@/lib/timezone";

export async function listVendorSlots(
  supabase: {
    from: (table: string) => any;
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => PromiseLike<{
      data: Array<{ starts_at: string; ends_at: string }> | null;
    }>;
  },
  vendorId: string,
  timezone: string,
  dateId: string,
  durationMin: number,
  rules?: { leadMin?: number; bufferMin?: number; exceptBookingId?: string },
): Promise<TimeSlot[]> {
  const weekday = weekdayOfDate(dateId, timezone);
  const { data: hoursData } = await supabase
    .from("availability")
    .select("weekday, start_min, end_min")
    .eq("vendor_id", vendorId)
    .eq("weekday", weekday);
  const hours = (hoursData ?? []) as Array<{
    start_min: number;
    end_min: number;
  }>;

  const from = instantFromZoned(dateId, 0, timezone);
  const to = instantFromZoned(addCalendarDays(dateId, 1), 0, timezone);
  const { data: busyRows } = await supabase.rpc("busy_windows_for", {
    p_vendor: vendorId,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });

  let windows = (busyRows ?? []).map((row: { starts_at: string; ends_at: string }) => ({
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }));

  if (rules?.exceptBookingId) {
    const { data: except } = await supabase
      .from("bookings")
      .select("starts_at, ends_at")
      .eq("id", rules.exceptBookingId)
      .maybeSingle();
    if (except?.starts_at) {
      const stamp = new Date(except.starts_at as string).getTime();
      windows = windows.filter(
        (row: { startsAt: string }) => new Date(row.startsAt).getTime() !== stamp,
      );
    }
  }

  const busy = busyOnDate(windows, dateId, timezone);

  const now = zonedParts(new Date(), timezone);
  const nowMin = now.dateId === dateId ? now.minutes : undefined;

  return hours.flatMap((row) =>
    generateSlots({
      startMin: row.start_min,
      endMin: row.end_min,
      durationMin,
      busy,
      nowMin,
      leadMin: rules?.leadMin ?? 30,
      bufferMin: rules?.bufferMin ?? 0,
    }),
  );
}
