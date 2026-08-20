export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url.startsWith("https://") && key.length > 20;
}

export function isServiceRoleConfigured() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").length > 20;
}

export function isStripeConfigured() {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_");
}

export function paystackSecret() {
  return (process.env.PAYSTACK_SECRET_KEY ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function isPaystackConfigured() {
  return paystackSecret().startsWith("sk_");
}

export function isResendConfigured() {
  return (process.env.RESEND_API_KEY ?? "").startsWith("re_");
}

export function isGoogleConfigured() {
  const id = (process.env.GOOGLE_CLIENT_ID ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  const secret = (process.env.GOOGLE_CLIENT_SECRET ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  return Boolean(id && secret);
}
