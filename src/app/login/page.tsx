import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { AuthForm } from "@/components/auth/AuthForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Held booking page.",
  robots: NOINDEX,
};

export default async function LoginPage() {
  const lang = await getLang();
  const t = dict(lang);
  return <AuthForm mode="login" lang={lang} nav={t.nav} copy={t.auth} />;
}
