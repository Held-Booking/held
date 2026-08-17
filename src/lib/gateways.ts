import {
  isPaystackConfigured,
  isStripeConfigured,
} from "@/lib/supabase/config";

export const PAYSTACK_COUNTRIES = new Set(["NG", "GH", "KE", "ZA", "CI"]);

export const COUNTRIES = [
  { id: "NG", label: "Nigeria", currency: "NGN", timezone: "Africa/Lagos" },
  { id: "GH", label: "Ghana", currency: "GHS", timezone: "Africa/Accra" },
  { id: "KE", label: "Kenya", currency: "KES", timezone: "Africa/Nairobi" },
  { id: "ZA", label: "South Africa", currency: "ZAR", timezone: "Africa/Johannesburg" },
  { id: "CI", label: "Côte d’Ivoire", currency: "XOF", timezone: "Africa/Abidjan" },
  { id: "US", label: "United States", currency: "USD", timezone: "America/New_York" },
  { id: "GB", label: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { id: "CA", label: "Canada", currency: "CAD", timezone: "America/Toronto" },
] as const;

export const CURRENCIES = [
  ...new Map(COUNTRIES.map((item) => [item.currency, item])).values(),
].map((item) => ({ id: item.currency, label: `${item.currency} · ${item.label}` }));

export function currencyMeta(code: string) {
  return COUNTRIES.find((item) => item.currency === code.toUpperCase()) ?? COUNTRIES[0];
}

export type PaymentProvider = "paystack" | "stripe";

export function countryMeta(country: string) {
  return COUNTRIES.find((item) => item.id === country) ?? COUNTRIES[0];
}

export function resolveProvider(country: string): PaymentProvider | null {
  const code = (country || "NG").toUpperCase();
  if (PAYSTACK_COUNTRIES.has(code)) {
    return isPaystackConfigured() ? "paystack" : null;
  }
  return isStripeConfigured() ? "stripe" : null;
}

export function paymentsReady(country: string) {
  return Boolean(resolveProvider(country));
}
