import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HomeFaq } from "@/components/marketing/HomeFaq";
import { DEMO_SLUG, PRICE } from "@/lib/constants";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/utils";
import { faqNode, howToNode, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How Held booking works",
  description:
    "Held is booking software with a deposit. Share one link on bookheld.app. The client picks a time, pays, and the date is held. No marketplace cut.",
  path: "/how-it-works",
});

const FAQS = [
  {
    q: "Is Held like Calendly?",
    a: "Calendly is a calendar. Held is a booking page with a deposit. The money is what stops a maybe from eating the day.",
  },
  {
    q: "Is Held like Fresha or Booksy?",
    a: "Those are marketplaces. They take a cut of the job. Held is software you run. $12 a month. The deposit is yours.",
  },
  {
    q: "Can clients still message me?",
    a: "Yes. After they pay, they can open WhatsApp. Chat is for the job. Checkout is for the date.",
  },
  {
    q: "What if they no-show?",
    a: "The deposit already landed with you, through the processor for your country. Held does not hold it as escrow.",
  },
];

export default async function HowItWorksPage() {
  const t = dict(await getLang());
  return (
    <SiteChrome>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [howToNode(), faqNode(FAQS)],
        }}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-16 pt-[calc(4.75rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pt-28 lg:text-start">
        <Reveal>
          <Breadcrumbs items={[{ name: "How it works", path: "/how-it-works" }]} />
          <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-signal">
            held
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-6xl">How it works</h1>
          <p className="mt-4 text-sm leading-relaxed text-dim sm:text-lg">
            People still book serious time in WhatsApp and Instagram. Then they vanish. Held is one page that takes the booking and a deposit so the date is real.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-10 space-y-8 text-sm leading-relaxed text-dim sm:text-base">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              The problem
            </h2>
            <p className="mt-3">
              A reply in chat is not a booking. It is a maybe. You blocked the afternoon. They did not come. You lost the work and the hours you spent typing the same answers.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              What Held is
            </h2>
            <p className="mt-3">
              Booking software for professionals. You get a public page. Clients pick a package, a time, and pay a deposit to hold it. Held is not a marketplace, not an employer, and not a party to the job.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Four steps
            </h2>
            <ol className="mt-4 space-y-4 text-start">
              <li>
                <p className="font-medium text-paper">1. Build the page</p>
                <p className="mt-1">
                  Name, packages, hours, timezone, and a payout bank. 14 days to set it up.
                </p>
              </li>
              <li>
                <p className="font-medium text-paper">2. Share one link</p>
                <p className="mt-1">
                  Put it in your bio, your WhatsApp status, or the first reply you send instead of “are you free Saturday?”
                </p>
              </li>
              <li>
                <p className="font-medium text-paper">3. They pay to hold the date</p>
                <p className="mt-1">
                  Checkout is the lock. Card, transfer, or USSD where the processor allows it. Africa runs on Paystack today. US cards use Stripe, which is next.
                </p>
              </li>
              <li>
                <p className="font-medium text-paper">4. You both keep the day</p>
                <p className="mt-1">
                  Mail goes out. They can add the time to their calendar. You can connect Google Calendar so new bookings land there. WhatsApp is for the work, not for hunting a yes.
                </p>
              </li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Money
            </h2>
            <p className="mt-3">
              Held is {formatMoney(PRICE.monthly)} a month or {formatMoney(PRICE.yearly)} a year, billed in USD. That is Held’s fee. The deposit is the client’s payment to you. We never take a cut of the job. Processor fees stay with the processor.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Try it without paying
            </h2>
            <p className="mt-3">
              Open the{" "}
              <Link href={`/book/${DEMO_SLUG}`} className="text-signal">
                demo
              </Link>
              . It cannot take a real deposit. Your own page can, after a bank is on file.
            </p>
          </section>
        </Reveal>

        <HomeFaq title={t.home.faqTitle} items={FAQS} />

        <Reveal className="mt-4 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
          <ButtonLink href="/signup" className="w-full sm:w-auto">
            Get your page
          </ButtonLink>
          <ButtonLink href="/pricing" variant="ghost" className="w-full sm:w-auto">
            See pricing
          </ButtonLink>
        </Reveal>
      </main>
    </SiteChrome>
  );
}
