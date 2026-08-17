import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/supabase/config";

export function getStripe() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
