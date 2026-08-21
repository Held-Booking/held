import { Hero } from "@/components/marketing/Hero";
import { HomeFaq } from "@/components/marketing/HomeFaq";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { VoiceOfHeld } from "@/components/marketing/VoiceOfHeld";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, DEMO_SLUG, PRICE } from "@/lib/constants";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { faqNode, pageMeta } from "@/lib/seo";
import { listPublishedReviews, reviewsNode } from "@/lib/reviews";
import { formatMoney } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = pageMeta({
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description:
    "Booking software for professionals who still take clients in chat. One page, a deposit, and the date is held. $12 a month. No cut of the job.",
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const t = dict(await getLang());
  const reviews = await listPublishedReviews();
  const reviewSchema = reviewsNode(reviews);
  const faqs = [
    { q: t.home.faq1q, a: t.home.faq1a },
    { q: t.home.faq2q, a: t.home.faq2a },
    { q: t.home.faq3q, a: t.home.faq3a },
    { q: t.home.faq4q, a: t.home.faq4a },
    { q: t.home.faq5q, a: t.home.faq5a },
  ];
  const steps = [
    { k: "01", t: t.home.step1, d: t.home.step1d },
    { k: "02", t: t.home.step2, d: t.home.step2d },
    { k: "03", t: t.home.step3, d: t.home.step3d },
  ];
  const pillars = [
    { t: t.home.whoTitle, d: t.home.whoBody },
    { t: t.home.moneyTitle, d: t.home.moneyBody },
    { t: t.home.whereTitle, d: t.home.whereBody },
  ];

  return (
    <SiteChrome>
      <JsonLd data={faqNode(faqs)} />
      {reviewSchema ? <JsonLd data={reviewSchema} /> : null}
      <main>
        <Hero copy={t.home} />

        <section className="relative z-10 px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-20 lg:text-start">
          <Reveal className="mx-auto max-w-3xl">
            <h2 className="text-[clamp(1.7rem,4.6vw,2.75rem)] font-semibold uppercase tracking-tight leading-[1.2]">
              {t.home.chatNotBooking}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-dim sm:text-lg lg:mx-0">
              {t.home.ifTheyBook}
            </p>
          </Reveal>
        </section>

        <section className="relative z-10 px-4 py-4 sm:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-void-2 sm:rounded-3xl">
            <ol>
              {steps.map((step, i) => (
                <li
                  key={step.k}
                  className={`flex gap-4 px-5 py-7 text-start sm:gap-6 sm:px-8 sm:py-8 ${
                    i < steps.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <p className="w-8 shrink-0 text-sm font-semibold tracking-[0.12em] text-signal">
                    {step.k}
                  </p>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                      {step.t}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-dim sm:text-base">
                      {step.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="relative z-10 px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3 md:gap-8">
            {pillars.map((block, i) => (
              <Reveal key={block.t} delay={i * 0.05} className="text-center md:text-start">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-signal">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{block.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim sm:text-base">
                  {block.d}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        <VoiceOfHeld reviews={reviews} />

        <HomeFaq title={t.home.faqTitle} items={faqs} />

        <section className="relative z-10 px-4 py-16 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <Reveal className="mx-auto max-w-5xl rounded-2xl border border-line bg-void-2 px-5 py-12 text-center sm:rounded-3xl sm:px-12 sm:py-14">
            <p className="font-display text-5xl leading-none sm:text-7xl lg:text-8xl">
              {formatMoney(PRICE.monthly)}
            </p>
            <p className="mt-2 text-sm text-dim sm:text-lg">{t.home.month}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center">
              <ButtonLink href="/signup" className="w-full px-8 sm:w-auto">
                {t.home.getPage}
              </ButtonLink>
              <ButtonLink
                href={`/book/${DEMO_SLUG}`}
                variant="ghost"
                className="w-full sm:w-auto"
              >
                {t.home.seeDemo}
              </ButtonLink>
            </div>
          </Reveal>
        </section>
      </main>
    </SiteChrome>
  );
}
