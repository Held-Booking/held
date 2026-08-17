export const LOCALES = ["en", "fr", "ar", "es", "pt", "de", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  zh: "中文",
};

export const LANG_COOKIE = "held_lang";

export const LOCALE_CODES: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ar: "AR",
  es: "ES",
  pt: "PT",
  de: "DE",
  zh: "ZH",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && LOCALES.includes(value as Locale));
}

export function isRtl(lang: Locale) {
  return lang === "ar";
}
