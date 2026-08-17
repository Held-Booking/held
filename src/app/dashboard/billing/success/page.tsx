import type { Metadata } from "next";
import Link from "next/link";
import { fulfillHeldPlanReference } from "@/lib/plan-fulfill";
import { isPaystackConfigured, isServiceRoleConfigured } from "@/lib/supabase/config";
import { requireVendor } from "@/lib/supabase/vendor";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  await requireVendor();
  const { reference } = await searchParams;

  let paid = false;
  let detail = "Open this page after you pay Held.";

  if (reference && isPaystackConfigured() && isServiceRoleConfigured()) {
    try {
      const result = await fulfillHeldPlanReference(reference);
      if (result.ok) {
        paid = true;
        detail = "Held is on. Client deposits still go to your bank.";
      } else {
        detail = result.error ?? "Payment did not complete.";
      }
    } catch {
      detail = "We could not confirm that payment yet. Refresh in a moment.";
    }
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        billing
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">
        {paid ? "Held is on." : "Not paid yet."}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-dim lg:mx-0">{detail}</p>
      <Link
        href="/dashboard/billing"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-paper px-5 text-sm font-medium text-void sm:w-auto"
      >
        Back to billing
      </Link>
    </div>
  );
}
