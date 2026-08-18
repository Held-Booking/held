import { cache } from "react";
import { DEMO_NAME, DEMO_SLUG } from "@/lib/constants";
import { PAYSTACK_COUNTRIES, paymentsReady } from "@/lib/gateways";
import { planIsLive } from "@/lib/plan";
import { formatDuration, upcomingOpenDays } from "@/lib/schedule";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export type VendorPagePackage = {
  id: string;
  name: string;
  detail: string;
  durationMin: number;
  price: number;
  depositPercent: number;
  note: string;
  location: string;
};

export type VendorPageDay = {
  id: string;
  label: string;
};

export type VendorPage = {
  slug: string;
  name: string;
  blurb: string;
  photo: string | null;
  packages: VendorPagePackage[];
  days: VendorPageDay[];
  timezone: string;
  currency: string;
  country: string;
  isDemo: boolean;
  paymentsOn: boolean;
  bankReady: boolean;
  planLive: boolean;
};

const DEMO_PACKAGES: VendorPagePackage[] = [
  {
    id: "full",
    name: "Session",
    detail: "2 hours",
    durationMin: 120,
    price: 1800,
    depositPercent: 30,
    note: "",
    location: "",
  },
  {
    id: "half",
    name: "Consult",
    detail: "45 min",
    durationMin: 45,
    price: 950,
    depositPercent: 30,
    note: "",
    location: "",
  },
  {
    id: "film",
    name: "Visit",
    detail: "4 hours",
    durationMin: 240,
    price: 620,
    depositPercent: 40,
    note: "",
    location: "Your address",
  },
];

export const DEMO_HOURS = [
  { weekday: 6, startMin: 8 * 60, endMin: 18 * 60 },
  { weekday: 0, startMin: 8 * 60, endMin: 18 * 60 },
] as const;

export const DEMO_TIMEZONE = "Africa/Lagos";

export function demoVendorPage(): VendorPage {
  return {
    slug: DEMO_SLUG,
    name: DEMO_NAME,
    blurb: "Pick a package. Pay a deposit. The date is yours.",
    photo: null,
    packages: DEMO_PACKAGES,
    days: upcomingOpenDays([6, 0], 14, new Date(), DEMO_TIMEZONE),
    timezone: DEMO_TIMEZONE,
    currency: "USD",
    country: "NG",
    isDemo: true,
    paymentsOn: false,
    bankReady: false,
    planLive: true,
  };
}

export const loadVendorPage = cache(async (slug: string): Promise<VendorPage | null> => {
  const isDemoSlug = slug === DEMO_SLUG;

  if (!isSupabaseConfigured()) {
    return isDemoSlug ? demoVendorPage() : null;
  }

  const supabase = await createServerSupabase();
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, slug, timezone, country, currency, bio, logo_url, plan_expires_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile?.slug) {
    const retry = await supabase
      .from("profiles")
      .select("id, display_name, slug, timezone, country, currency, bio, logo_url, plan_expires_at")
      .eq("slug", slug)
      .maybeSingle();
    profile = retry.data as typeof profile;
  }

  if (!profile?.slug) {
    const retry = await supabase
      .from("profiles")
      .select("id, display_name, slug, timezone, country, currency, bio, logo_url")
      .eq("slug", slug)
      .maybeSingle();
    profile = retry.data as typeof profile;
  }

  if (!profile?.slug) {
    return isDemoSlug ? demoVendorPage() : null;
  }

  const [{ data: services }, { data: hours }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, duration_min, price_cents, deposit_percent, note, location")
      .eq("vendor_id", profile.id)
      .eq("active", true)
      .order("created_at", { ascending: true })
      .then(async (first) => {
        if (!first.error) return first;
        return supabase
          .from("services")
          .select("id, name, duration_min, price_cents, deposit_percent, note")
          .eq("vendor_id", profile.id)
          .eq("active", true)
          .order("created_at", { ascending: true });
      }),
    supabase
      .from("availability")
      .select("weekday")
      .eq("vendor_id", profile.id),
  ]);

  const serviceRows = services ?? [];
  const packages: VendorPagePackage[] = serviceRows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    detail: formatDuration(row.duration_min as number),
    durationMin: row.duration_min as number,
    price: (row.price_cents as number) / 100,
    depositPercent: row.deposit_percent as number,
    note: (row.note as string) || "",
    location: ((row as { location?: string | null }).location as string) || "",
  }));

  const weekdays = [
    ...new Set((hours ?? []).map((row) => row.weekday as number)),
  ];
  const timezone = (profile.timezone as string) || "Africa/Lagos";
  const country = ((profile.country as string) || "NG").toUpperCase();
  const currency = (profile.currency as string) || "NGN";
  const expiresAt = (profile as { plan_expires_at?: string | null }).plan_expires_at;
  const planLive =
    "plan_expires_at" in (profile as object) ? planIsLive(expiresAt) : true;

  let bankReady = !PAYSTACK_COUNTRIES.has(country);
  if (PAYSTACK_COUNTRIES.has(country) && isServiceRoleConfigured()) {
    try {
      const admin = createAdminSupabase();
      const { data: payout } = await admin
        .from("payout_accounts")
        .select("paystack_subaccount")
        .eq("vendor_id", profile.id)
        .maybeSingle();
      bankReady = Boolean(payout?.paystack_subaccount);
    } catch {
      bankReady = false;
    }
  }

  return {
    slug: profile.slug,
    name: profile.display_name as string,
    blurb:
      ((profile.bio as string) || "").trim() || "Pay a deposit. Keep the slot.",
    photo: ((profile as { logo_url?: string | null }).logo_url as string) || null,
    packages,
    days: upcomingOpenDays(weekdays, 14, new Date(), timezone),
    timezone,
    currency,
    country,
    isDemo: false,
    paymentsOn:
      isServiceRoleConfigured() && paymentsReady(country) && bankReady && planLive,
    bankReady,
    planLive,
  };
});
