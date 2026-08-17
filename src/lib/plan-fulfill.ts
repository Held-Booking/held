import { revalidatePath } from "next/cache";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  findPaystackSubscription,
  verifyPaystack,
} from "@/lib/paystack";
import {
  isPlanInterval,
  planPeriodEnd,
  type PlanInterval,
} from "@/lib/plan";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
}

function intervalFromCharge(input: {
  interval?: string;
  amountCents: number;
}): PlanInterval {
  if (isPlanInterval(input.interval ?? "")) return input.interval as PlanInterval;
  return input.amountCents >= 5000 ? "yearly" : "monthly";
}

export async function fulfillHeldPlan(input: {
  vendorId?: string | null;
  customerCode?: string | null;
  interval?: string;
  amountCents: number;
  nextPaymentDate?: string | null;
}) {
  const admin = createAdminSupabase();
  let vendorId = input.vendorId ?? null;

  if (!vendorId && input.customerCode) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("paystack_customer_code", input.customerCode)
      .maybeSingle();
    vendorId = (data?.id as string | undefined) ?? null;
  }

  if (!vendorId) return { ok: true as const };

  const interval = intervalFromCharge(input);
  const expiresAt = input.nextPaymentDate
    ? new Date(input.nextPaymentDate)
    : planPeriodEnd(interval);

  const sub = input.customerCode
    ? await findPaystackSubscription(input.customerCode).catch(() => null)
    : null;

  const patch: Record<string, unknown> = {
    plan_status: "active",
    plan_interval: interval,
    plan_expires_at: expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (input.customerCode) patch.paystack_customer_code = input.customerCode;
  if (sub?.subscription_code) patch.paystack_subscription_code = sub.subscription_code;
  if (sub?.email_token) patch.paystack_email_token = sub.email_token;

  const { error } = await admin.from("profiles").update(patch).eq("id", vendorId);

  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}

export async function fulfillHeldPlanReference(reference: string) {
  const tx = await verifyPaystack(reference);
  if (tx.status !== "success") {
    return { ok: false as const, error: "Payment is still processing." };
  }
  if (tx.metadata?.booking_id) {
    return { ok: false as const, error: "That was a booking deposit, not Held." };
  }
  const next =
    tx.metadata?.kind === "held_plan" || Boolean(tx.metadata?.vendor_id);
  if (!next) {
    return { ok: false as const, error: "That payment is not a Held plan." };
  }

  return fulfillHeldPlan({
    vendorId: tx.metadata?.vendor_id,
    customerCode: tx.customer?.customer_code,
    interval: tx.metadata?.interval,
    amountCents: tx.amount,
  });
}

export async function markPlanPastDue(input: {
  subscriptionCode?: string | null;
  customerCode?: string | null;
}) {
  const admin = createAdminSupabase();
  let query = admin.from("profiles").update({
    plan_status: "past_due",
    plan_expires_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (input.subscriptionCode) {
    query = query.eq("paystack_subscription_code", input.subscriptionCode);
  } else if (input.customerCode) {
    query = query.eq("paystack_customer_code", input.customerCode);
  } else {
    return { ok: true as const };
  }

  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  refresh();
  return { ok: true as const };
}
