import type { Metadata } from "next";
import { PayoutSettings } from "@/components/dashboard/PayoutSettings";
import { dict } from "@/lib/i18n";
import { googleRedirectUri } from "@/lib/google-calendar";
import { getLang } from "@/lib/i18n/server";
import { originFromHeaders } from "@/lib/origin";
import { headers } from "next/headers";
import { isGoogleConfigured } from "@/lib/supabase/config";
import { requireVendor } from "@/lib/supabase/vendor";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, profile } = await requireVendor();
  const t = dict(await getLang());
  const origin = originFromHeaders(await headers());
  return (
    <PayoutSettings
      email={user.email ?? ""}
      displayName={(profile.display_name as string) || ""}
      slug={(profile.slug as string) || ""}
      country={(profile.country as string) || "NG"}
      currency={(profile.currency as string) || "NGN"}
      bio={(profile.bio as string) || ""}
      whatsapp={(profile.whatsapp as string) || ""}
      bankCode={(profile.bank_code as string) || ""}
      accountNumber={(profile.account_number as string) || ""}
      accountName={(profile.account_name as string) || ""}
      connected={Boolean(profile.paystack_subaccount)}
      photo={(profile.logo_url as string) || ""}
      googleOn={Boolean(
        (profile as { google_refresh_token?: string | null }).google_refresh_token,
      )}
      googleReady={isGoogleConfigured()}
      googleTitle={t.dash.google}
      googleOnCopy={t.dash.googleOn}
      googleOffCopy={t.dash.googleOff}
      googleRedirectUri={googleRedirectUri(origin)}
      appUrl={origin}
      connectGoogle={t.dash.connectGoogle}
      passwordCopy={t.auth}
    />
  );
}
