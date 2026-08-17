import { Hero } from "@/components/marketing/Hero";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { DEMO_SLUG, PRICE } from "@/lib/constants";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/utils";

export default async function Home() {
  const t = dict(await getLang());
  const steps = [
    { k: "1", t: t.home.step1, d: t.home.step1d },
    { k: "2", t: t.home.step2, d: t.home.step2d },
    { k: "3", t: t.home.step3, d: t.home.step3d },
  ];

  return (
    <SiteChrome>
      <main>
        <Hero copy={t.home} />

        <section className="relative z-10 px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-20 lg:text-start">
          <Reveal className="mx-auto max-w-4xl">
            <h2 className="font-display text-[clamp(1.55rem,6.5vw,4.5rem)] leading-[1.15]">
              {t.home.chatNotBooking}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-dim sm:text-lg lg:mx-0">
              {t.home.ifTheyBook}
            </p>
          </Reveal>
        </section>

        <section className="relative z-10 border-y border-line">
          <div className="mx-auto grid max-w-6xl md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal
                key={step.k}
                delay={i * 0.06}
                className="border-b border-line px-5 py-10 text-center last:border-b-0 md:border-b-0 md:border-r md:px-6 md:py-12 md:last:border-r-0 lg:text-start"
              >
                <p className="font-display text-2xl text-signal sm:text-4xl">
                  {step.k}
                </p>
                <h3 className="mt-3 font-display text-lg sm:mt-5 sm:text-3xl">
                  {step.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dim sm:mt-3 sm:text-base">
                  {step.d}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

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
