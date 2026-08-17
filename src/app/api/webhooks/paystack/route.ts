import { NextRequest, NextResponse } from "next/server";
import { fulfillBalance, fulfillPayment } from "@/lib/payment-fulfill";
import {
  fulfillHeldPlan,
  markPlanPastDue,
} from "@/lib/plan-fulfill";
import { paystackSignatureOk } from "@/lib/paystack";
import { isPaystackConfigured } from "@/lib/supabase/config";

type PaystackEvent = {
  event?: string;
  data?: {
    status?: string;
    amount?: number;
    reference?: string;
    metadata?: {
      booking_id?: string;
      kind?: string;
      vendor_id?: string;
      interval?: string;
    };
    customer?: { customer_code?: string };
    subscription_code?: string;
    next_payment_date?: string;
  };
};

export async function POST(request: NextRequest) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Paystack is not configured." }, { status: 503 });
  }

  const raw = await request.text();
  if (!paystackSignatureOk(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  const data = event.data;
  if (event.event === "charge.success" && data?.status === "success") {
    if (data.metadata?.booking_id && data.reference) {
      const result =
        data.metadata.kind === "balance"
          ? await fulfillBalance({
              bookingId: data.metadata.booking_id,
              reference: data.reference,
              amountCents: data.amount ?? 0,
              provider: "paystack",
            })
          : await fulfillPayment({
              bookingId: data.metadata.booking_id,
              reference: data.reference,
              amountCents: data.amount ?? 0,
              provider: "paystack",
            });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } else if (data.metadata?.kind === "held_plan" || data.metadata?.vendor_id) {
      const result = await fulfillHeldPlan({
        vendorId: data.metadata?.vendor_id,
        customerCode: data.customer?.customer_code,
        interval: data.metadata?.interval,
        amountCents: data.amount ?? 0,
        nextPaymentDate: data.next_payment_date,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }
  }

  if (
    event.event === "invoice.payment_failed" ||
    event.event === "subscription.not_renewed"
  ) {
    await markPlanPastDue({
      subscriptionCode: data?.subscription_code,
      customerCode: data?.customer?.customer_code,
    });
  }

  return NextResponse.json({ ok: true });
}
