import { cookies } from "next/headers";
import { isLocale, LANG_COOKIE, type Locale } from "@/lib/i18n/config";

export async function getLang(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}
