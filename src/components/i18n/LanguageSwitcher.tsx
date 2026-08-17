"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLang } from "@/app/i18n/actions";
import {
  LOCALE_CODES,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  current,
  className = "",
}: {
  current: Locale;
  className?: string;
}) {
  const id = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={className}>
      <label className="sr-only" htmlFor={id}>
        Language
      </label>
      <select
        id={id}
        name="lang"
        value={current}
        disabled={pending}
        title={LOCALE_LABELS[current]}
        onChange={(event) => {
          const lang = event.target.value;
          const formData = new FormData();
          formData.set("lang", lang);
          startTransition(async () => {
            await setLang(formData);
            router.refresh();
          });
        }}
        className={cn(
          "min-h-9 min-w-[3.25rem] appearance-none rounded-full border border-line bg-void px-2.5 text-center text-[11px] font-semibold tracking-[0.14em] text-paper",
          pending && "opacity-50",
        )}
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {LOCALE_CODES[item]}
          </option>
        ))}
      </select>
    </div>
  );
}
