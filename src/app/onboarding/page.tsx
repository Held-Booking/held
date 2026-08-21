import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = { title: "Setup", robots: NOINDEX };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) {
    redirect("/signup");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, slug")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.slug) redirect("/dashboard");

  const lang = await getLang();
  const t = dict(lang);
  return (
    <OnboardingForm
      defaultName={profile?.display_name ?? ""}
      lang={lang}
      nav={t.nav}
      copy={t.auth}
    />
  );
}
