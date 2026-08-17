import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  const lang = await getLang();
  const t = dict(lang);
  return <AuthForm mode="signup" lang={lang} nav={t.nav} copy={t.auth} />;
}
