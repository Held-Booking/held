import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ForgotPasswordPage() {
  const lang = await getLang();
  const t = dict(lang);
  return <ForgotPasswordForm lang={lang} nav={t.nav} copy={t.auth} />;
}
