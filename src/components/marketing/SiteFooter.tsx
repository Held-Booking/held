import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { BRAND } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";

export function SiteFooter({
  lang,
  labels,
}: {
  lang: Locale;
  labels: { pricing: string; terms: string; privacy: string };
}) {
  const links = [
    { href: "/pricing", label: labels.pricing },
    { href: "/terms", label: labels.terms },
    { href: "/privacy", label: labels.privacy },
  ];

  return (
    <footer className="relative z-10 mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-5 py-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-start">
        <div>
          <Link href="/" className="font-display text-xl text-paper">
            {BRAND.name}
            <span className="text-signal">.</span>
          </Link>
          <p className="mt-1 text-sm text-dim">{BRAND.tagline}</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-dim">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center hover:text-signal"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher current={lang} />
        </nav>
      </div>
    </footer>
  );
}
