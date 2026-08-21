import type { Metadata } from "next";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HomeFaq } from "@/components/marketing/HomeFaq";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEMO_SLUG, PRICE } from "@/lib/constants";
import { dict, fill } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { faqNode, pageMeta } from "@/lib/seo";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Held pricing",
  description:
    "Held booking software is $12 a month or $99 a year. 14 days to set up. No marketplace. No commission on the job. Deposits go to you.",
  path: "/pricing",
});

export default async function PricingPage() {
  const t = dict(await getLang());
  const faqs = [
    { q: t.home.faq2q, a: t.home.faq2a },
    { q: t.home.faq3q, a: t.home.faq3a },
    { q: t.home.faq4q, a: t.home.faq4a },
    { q: "What do I pay Held?", a: t.pricing.fees },
  ];
  return (
    <SiteChrome>
      <JsonLd data={faqNode(faqs)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8 pt-[calc(4.75rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pt-28 lg:text-start">
        <Reveal>
          <Breadcrumbs items={[{ name: "Pricing", path: "/pricing" }]} />
          <h1 className="mt-6 flex items-baseline justify-center gap-1.5 font-display leading-none lg:justify-start">
            <span className="text-5xl tracking-tight sm:text-7xl lg:text-8xl">
              {formatMoney(PRICE.monthly)}
            </span>
            <span className="text-xl text-dim sm:text-3xl lg:text-4xl">/mo</span>
          </h1>
          <p className="mt-4 text-base text-dim sm:mt-5 sm:text-lg">
            {t.pricing.keep}
          </p>
          <p className="mt-2 text-sm text-dim">{t.pricing.trial}</p>
        </Reveal>

        <Reveal
          delay={0.08}
          className="mt-8 rounded-2xl border border-line bg-void-2 p-5 sm:mt-10 sm:rounded-3xl sm:p-10"
        >
          <ul className="space-y-3 text-base text-paper sm:space-y-4 sm:text-lg">
            <li>{t.pricing.page}</li>
            <li>{t.pricing.deposits}</li>
            <li>{t.pricing.noMarket}</li>
          </ul>
          <p className="mt-5 text-sm text-dim sm:mt-6">
            {fill(t.pricing.orYear, { price: formatMoney(PRICE.yearly) })}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-dim">{t.pricing.fees}</p>
          <p className="mt-2 text-sm leading-relaxed text-dim">{t.pricing.where}</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 lg:flex-row lg:items-center">
            <ButtonLink href="/signup" className="w-full sm:w-auto">
              {t.pricing.start}
            </ButtonLink>
            <ButtonLink
              href={`/book/${DEMO_SLUG}`}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              {t.pricing.seeBooking}
            </ButtonLink>
          </div>
        </Reveal>
        <HomeFaq title={t.home.faqTitle} items={faqs} />
      </main>
    </SiteChrome>
  );
}
