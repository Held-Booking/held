import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payment-fulfill";

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
  mode: "paid" | "cancel" = "paid",
) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return { ok: false as const, error: "Missing booking." };

  if (mode === "cancel") {
    return fulfillPayment({
      bookingId,
      reference: session.id,
      amountCents: 0,
      provider: "stripe",
      mode: "cancel",
    });
  }

  if (session.payment_status !== "paid") {
    return { ok: false as const, error: "Payment is not complete." };
  }

  return fulfillPayment({
    bookingId,
    reference: session.id,
    amountCents: session.amount_total ?? 0,
    provider: "stripe",
  });
}
