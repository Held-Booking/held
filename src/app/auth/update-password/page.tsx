import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "New password",
};

export default async function UpdatePasswordPage() {
  const lang = await getLang();
  const t = dict(lang);
  return <UpdatePasswordForm lang={lang} nav={t.nav} copy={t.auth} />;
}
