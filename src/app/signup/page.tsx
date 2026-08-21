import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { AuthForm } from "@/components/auth/AuthForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Held booking page.",
  robots: NOINDEX,
};

export default async function SignupPage() {
  const lang = await getLang();
  const t = dict(lang);
  return <AuthForm mode="signup" lang={lang} nav={t.nav} copy={t.auth} />;
}
