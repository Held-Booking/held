import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New password",
};

export default async function UpdatePasswordPage() {
  const lang = await getLang();
  const t = dict(lang);
  let hasSession = false;
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSession = Boolean(user);
  }
  return (
    <UpdatePasswordForm
      lang={lang}
      nav={t.nav}
      copy={t.auth}
      hasSession={hasSession}
    />
  );
}
