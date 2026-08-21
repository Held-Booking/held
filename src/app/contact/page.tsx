import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT, SOCIAL_PROFILES } from "@/lib/constants";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Write to Held Software Limited at hello@bookheld.app. If you booked someone, write to them. Held is not a party to that job.",
  path: "/contact",
});

export default function ContactPage() {
  const socials = SOCIAL_PROFILES.filter((item) => item.href);

  return (
    <LegalPage kicker="held" title="Contact" path="/contact">
      <p>
        Held is booking software. Who you write to depends on what you need.
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Held</h2>
      <p>
        {CONTACT.legalName}
        <br />
        {CONTACT.address}
      </p>
      <p>
        Open{" "}
        <Link href="/about" className="text-signal">
          About Held
        </Link>
        {" "}for the company. Product questions:{" "}
        <a href={`mailto:${CONTACT.email}`} className="text-signal">
          {CONTACT.email}
        </a>
        . Use the email on your Held account so we can find the right page. Do not send client card numbers.
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">If you booked someone</h2>
      <p>
        Write to the professional you booked. Use the WhatsApp link on their page or the message that came after you paid. Held is not a party to that job and cannot change their hours, prices, or work.
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">If you run a Held page</h2>
      <p>
        For a forgotten password, open{" "}
        <Link href="/forgot-password" className="text-signal">
          Reset password
        </Link>
        {" "}on the log in page. We email a reset link to the address on the account. For payout, calendar, or billing questions, start in Settings and Billing.
      </p>
      {socials.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Held on social</h2>
          <p>
            These are public profiles, not a booking inbox. For a booking, contact the professional. For your own page, use the account tools above.
          </p>
          <p className="flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start">
            {socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-signal"
              >
                {item.label}
              </a>
            ))}
          </p>
        </>
      ) : null}
    </LegalPage>
  );
}
