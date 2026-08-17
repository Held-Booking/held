import { BRAND } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";

export function BookBar({ lang = "en" }: { lang?: Locale }) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 px-3"
      style={{ paddingTop: "max(0.55rem, env(safe-area-inset-top))" }}
    >
      <div className="glass-island mx-auto flex h-12 max-w-lg items-center justify-between rounded-full px-4">
        <p className="font-display text-lg tracking-tight text-paper">
          {BRAND.name}
          <span className="text-signal">.</span>
        </p>
        <LanguageSwitcher current={lang} />
      </div>
    </header>
  );
}
