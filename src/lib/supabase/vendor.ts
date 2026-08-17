import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

const PROFILE_WITH_OPS =
  "id, display_name, slug, timezone, country, currency, whatsapp, bio, logo_url, buffer_min, lead_min, plan_status, plan_interval, plan_expires_at, paystack_subscription_code, paystack_email_token, google_refresh_token, google_calendar_id";
const PROFILE_WITH_PLAN =
  "id, display_name, slug, timezone, country, currency, whatsapp, bio, plan_status, plan_interval, plan_expires_at, paystack_subscription_code, paystack_email_token";
const PROFILE_BASE = "id, display_name, slug, timezone, country, currency, whatsapp";

export async function requireVendor() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_OPS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const withPlan = await supabase
      .from("profiles")
      .select(PROFILE_WITH_PLAN)
      .eq("id", user.id)
      .maybeSingle();
    profile = withPlan.data as typeof profile;
  }

  if (!profile) {
    const retry = await supabase
      .from("profiles")
      .select(PROFILE_BASE)
      .eq("id", user.id)
      .maybeSingle();
    profile = retry.data as typeof profile;
  }

  if (!profile?.slug) redirect("/onboarding");

  const { data: payout } = await supabase
    .from("payout_accounts")
    .select("bank_code, account_number, account_name, paystack_subaccount")
    .eq("vendor_id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile: {
      ...profile,
      plan_status: (profile as { plan_status?: string }).plan_status ?? "trialing",
      plan_interval: (profile as { plan_interval?: string | null }).plan_interval ?? null,
      plan_expires_at: (profile as { plan_expires_at?: string | null }).plan_expires_at ?? null,
      paystack_subscription_code:
        (profile as { paystack_subscription_code?: string | null }).paystack_subscription_code ??
        null,
      paystack_email_token:
        (profile as { paystack_email_token?: string | null }).paystack_email_token ?? null,
      whatsapp: (profile as { whatsapp?: string | null }).whatsapp ?? null,
      bio: (profile as { bio?: string | null }).bio ?? null,
      logo_url: (profile as { logo_url?: string | null }).logo_url ?? null,
      buffer_min: (profile as { buffer_min?: number }).buffer_min ?? 0,
      lead_min: (profile as { lead_min?: number }).lead_min ?? 30,
      google_refresh_token:
        (profile as { google_refresh_token?: string | null }).google_refresh_token ?? null,
      google_calendar_id:
        (profile as { google_calendar_id?: string | null }).google_calendar_id ?? "primary",
      bank_code: payout?.bank_code ?? null,
      account_number: payout?.account_number ?? null,
      account_name: payout?.account_name ?? null,
      paystack_subaccount: payout?.paystack_subaccount ?? null,
    },
  };
}
