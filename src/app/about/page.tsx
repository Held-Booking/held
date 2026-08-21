import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { BRAND, CONTACT, PRICE, SOCIAL } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { absUrl, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About Held",
  description:
    "Held Software Limited makes booking software for professionals. One page, a deposit, and the date is held. Not a marketplace. Not a payment company.",
  path: "/about",
});

const sameAs = Object.values(SOCIAL).filter(Boolean);

export default function AboutPage() {
  return (
    <SiteChrome>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${absUrl("/about")}#page`,
          url: absUrl("/about"),
          name: "About Held",
          description:
            "Held Software Limited makes booking software for professionals. A deposit holds the date. Held takes none of the job.",
          isPartOf: { "@id": `${absUrl()}/#website` },
          about: { "@id": `${absUrl()}/#org` },
          mainEntity: { "@id": `${absUrl()}/#app` },
        }}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-16 pt-[calc(4.75rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pt-28 lg:text-start">
        <Reveal>
          <Breadcrumbs items={[{ name: "About Held", path: "/about" }]} />
          <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-signal">
            held
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-6xl">About Held</h1>
          <p className="mt-4 text-sm leading-relaxed text-dim sm:text-lg">
            Held is booking software. Professionals publish a page. Clients pick a time and pay a deposit. The date is then real.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-10 space-y-8 text-sm leading-relaxed text-dim sm:text-base">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Who makes it
            </h2>
            <p className="mt-3">
              {CONTACT.legalName} builds and operates Held. The product name is {BRAND.name}. The company is registered in Nigeria.
            </p>
            <p className="mt-3">
              {CONTACT.address}
            </p>
            <p className="mt-3">
              Write to{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-signal">
                {CONTACT.email}
              </a>
              . That inbox is for the product, not for a booking with a professional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              What Held is
            </h2>
            <p className="mt-3">
              Software as a service. You get a public booking page, packages, hours, and checkout for a deposit. Held’s fee is {formatMoney(PRICE.monthly)} a month or {formatMoney(PRICE.yearly)} a year, billed in USD. Held takes none of the job.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              What Held is not
            </h2>
            <p className="mt-3">
              Not a marketplace. Not an employer. Not a bank. Not a payment service provider. Client deposits go through a licensed processor for the professional’s country. Held does not hold that money as escrow and is not a party to the job.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Where it works
            </h2>
            <p className="mt-3">
              You can open a page from Africa or the United States. Africa deposits run on Paystack today. US and UK card deposits need Stripe, which is next. Read{" "}
              <Link href="/how-it-works" className="text-signal">
                How it works
              </Link>
              {" "}and{" "}
              <Link href="/contact" className="text-signal">
                Contact
              </Link>
              .
            </p>
          </section>
        </Reveal>

        {sameAs.length > 0 ? (
          <p className="mt-8 text-sm text-dim">
            Public profiles are listed on{" "}
            <Link href="/contact" className="text-signal">
              Contact
            </Link>
            .
          </p>
        ) : null}

        <Reveal className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
          <ButtonLink href="/signup" className="w-full sm:w-auto">
            Get your page
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="ghost" className="w-full sm:w-auto">
            How it works
          </ButtonLink>
        </Reveal>
      </main>
    </SiteChrome>
  );
}
