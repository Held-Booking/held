import type { Metadata } from "next";
import { BlockEditor } from "@/components/dashboard/BlockEditor";
import { HoursEditor } from "@/components/dashboard/HoursEditor";
import { requireVendor } from "@/lib/supabase/vendor";

export const metadata: Metadata = { title: "Hours" };
export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const { supabase, user, profile } = await requireVendor();
  const [{ data: hours }, { data: blocks }] = await Promise.all([
    supabase
      .from("availability")
      .select("weekday, start_min, end_min")
      .eq("vendor_id", user.id),
    supabase
      .from("time_blocks")
      .select("id, starts_at, ends_at, reason")
      .eq("vendor_id", user.id)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
  ]);

  const initial = (hours ?? []).map((row) => ({
    weekday: row.weekday as number,
    startMin: row.start_min as number,
    endMin: row.end_min as number,
  }));

  return (
    <>
      <HoursEditor
        initial={initial}
        bufferMin={profile.buffer_min ?? 0}
        leadMin={profile.lead_min ?? 30}
      />
      <BlockEditor
        timezone={(profile.timezone as string) || "Africa/Lagos"}
        initial={(blocks ?? []).map((row) => ({
          id: row.id as string,
          startsAt: row.starts_at as string,
          endsAt: row.ends_at as string,
          reason: (row.reason as string) || "",
        }))}
      />
    </>
  );
}
