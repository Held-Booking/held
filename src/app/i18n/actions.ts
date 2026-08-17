"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LANG_COOKIE } from "@/lib/i18n/config";

export async function setLang(formData: FormData) {
  const lang = String(formData.get("lang") ?? "en");
  if (!isLocale(lang)) return;
  const store = await cookies();
  store.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
