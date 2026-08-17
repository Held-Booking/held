import type { Metadata } from "next";
import { BillingPanel } from "@/components/dashboard/BillingPanel";
import { planDaysLeft, planIsLive } from "@/lib/plan";
import { requireVendor } from "@/lib/supabase/vendor";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { profile } = await requireVendor();
  const expiresAt = profile.plan_expires_at;
  const live = planIsLive(expiresAt);
  const paid =
    profile.plan_status === "active" || profile.plan_status === "canceled";

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "the trial end";

  return (
    <BillingPanel
      live={live}
      paid={paid}
      status={profile.plan_status}
      interval={profile.plan_interval}
      daysLeft={planDaysLeft(expiresAt)}
      expiresLabel={expiresLabel}
    />
  );
}
