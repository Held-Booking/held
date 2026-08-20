import Link from "next/link";
import { BRAND, CONTACT, SOCIAL } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";

const SOCIAL_ITEMS = [
  { href: SOCIAL.whatsapp, label: "WhatsApp" },
  { href: SOCIAL.instagram, label: "Instagram" },
  { href: SOCIAL.x, label: "X" },
  { href: SOCIAL.linkedin, label: "LinkedIn" },
  { href: SOCIAL.facebook, label: "Facebook" },
  { href: SOCIAL.tiktok, label: "TikTok" },
] as const;

export function SiteFooter({
  labels,
}: {
  lang?: Locale;
  labels: {
    pricing: string;
    terms: string;
    privacy: string;
    contact: string;
    help: string;
    security: string;
    line: string;
  };
}) {
  const links = [
    { href: "/pricing", label: labels.pricing },
    { href: "/help", label: labels.help },
    { href: "/security", label: labels.security },
    { href: "/contact", label: labels.contact },
    { href: "/terms", label: labels.terms },
    { href: "/privacy", label: labels.privacy },
  ];
  const socials = SOCIAL_ITEMS.filter((item) => item.href);

  return (
    <footer className="relative z-10 mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-5 py-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-start">
        <div>
          <Link href="/" className="font-display text-xl text-paper">
            {BRAND.name}
            <span className="text-signal">.</span>
          </Link>
          <p className="mt-1 text-sm text-dim">{labels.line}</p>
          <p className="mt-3 text-sm text-dim">{CONTACT.legalName}</p>
          <p className="mt-1 text-sm text-dim">{CONTACT.address}</p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-1 inline-block text-sm text-signal"
          >
            {CONTACT.email}
          </a>
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
          {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center hover:text-signal"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
