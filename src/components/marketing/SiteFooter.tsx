import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BRAND, DEMO_SLUG, SOCIAL } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";

const SOCIAL_ITEMS = [
  { href: SOCIAL.whatsapp, label: "WhatsApp" },
  { href: SOCIAL.instagram, label: "Instagram" },
  { href: SOCIAL.x, label: "X" },
  { href: SOCIAL.linkedin, label: "LinkedIn" },
  { href: SOCIAL.facebook, label: "Facebook" },
  { href: SOCIAL.tiktok, label: "TikTok" },
] as const;

type FooterLabels = {
  product: string;
  company: string;
  support: string;
  legal: string;
  pricing: string;
  terms: string;
  privacy: string;
  contact: string;
  about: string;
  help: string;
  how: string;
  security: string;
  demo: string;
  line: string;
  rights: string;
};

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-sm text-dim hover:text-signal"
    >
      {label}
    </Link>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper">
        {title}
      </p>
      <nav className="mt-3 flex flex-col items-center lg:items-start">
        {children}
      </nav>
    </div>
  );
}

export function SiteFooter({
  labels,
  theme = "dark",
}: {
  lang?: Locale;
  labels: FooterLabels;
  theme?: Theme;
}) {
  const socials = SOCIAL_ITEMS.filter((item) => item.href);
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 lg:grid-cols-5 lg:text-start">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-display text-xl text-paper">
              {BRAND.name}
              <span className="text-signal">.</span>
            </Link>
            <p className="mt-2 text-sm text-dim">{labels.line}</p>
            {socials.length > 0 ? (
              <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 lg:justify-start">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center text-sm text-dim hover:text-signal"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>

          <FooterGroup title={labels.product}>
            <FooterLink href="/how-it-works" label={labels.how} />
            <FooterLink href="/pricing" label={labels.pricing} />
            <FooterLink href={`/book/${DEMO_SLUG}`} label={labels.demo} />
          </FooterGroup>

          <FooterGroup title={labels.company}>
            <FooterLink href="/about" label={labels.about} />
            <FooterLink href="/contact" label={labels.contact} />
          </FooterGroup>

          <FooterGroup title={labels.support}>
            <FooterLink href="/help" label={labels.help} />
            <FooterLink href="/security" label={labels.security} />
          </FooterGroup>

          <FooterGroup title={labels.legal}>
            <FooterLink href="/terms" label={labels.terms} />
            <FooterLink href="/privacy" label={labels.privacy} />
          </FooterGroup>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-center text-xs text-dim lg:text-start">
            © {year} {BRAND.name}. {labels.rights}
          </p>
          <ThemeToggle current={theme} className="border-0 bg-void-2" />
        </div>
      </div>
    </footer>
  );
}
