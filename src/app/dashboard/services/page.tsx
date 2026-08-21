import type { Metadata } from "next";
import { PackageDraft } from "@/components/dashboard/PackageDraft";
import { PackageEditor } from "@/components/dashboard/PackageEditor";
import { requireVendor } from "@/lib/supabase/vendor";

export const metadata: Metadata = { title: "Packages" };
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { supabase, user, profile } = await requireVendor();
  const { data } = await supabase
    .from("services")
    .select("id, name, duration_min, price_cents, deposit_percent, note, location")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: true });

  const initial = (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    durationMin: row.duration_min as number,
    price: (row.price_cents as number) / 100,
    depositPercent: row.deposit_percent as number,
    note: (row.note as string) || "",
    location: ((row as { location?: string | null }).location as string) || "",
  }));

  return (
    <>
      <PackageEditor
        initial={initial}
        currency={(profile.currency as string) || "NGN"}
      />
      <PackageDraft
        currency={(profile.currency as string) || "NGN"}
        bio={profile.bio}
      />
    </>
  );
}
