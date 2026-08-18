import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT, SOCIAL } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact" };

const SOCIAL_ITEMS = [
  { href: SOCIAL.whatsapp, label: "WhatsApp" },
  { href: SOCIAL.instagram, label: "Instagram" },
  { href: SOCIAL.x, label: "X" },
  { href: SOCIAL.linkedin, label: "LinkedIn" },
  { href: SOCIAL.facebook, label: "Facebook" },
  { href: SOCIAL.tiktok, label: "TikTok" },
] as const;

export default function ContactPage() {
  const socials = SOCIAL_ITEMS.filter((item) => item.href);

  return (
    <LegalPage kicker="held" title="Contact">
      <p>
        Held is booking software. Who you write to depends on what you need.
      </p>
      <h2 className="font-display text-2xl text-paper">If you booked someone</h2>
      <p>
        Write to the professional you booked. Use the WhatsApp link on their page or the message that came after you paid. Held is not a party to that job and cannot change their hours, prices, or work.
      </p>
      <h2 className="font-display text-2xl text-paper">If you run a Held page</h2>
      <p>
        For a forgotten password, open{" "}
        <Link href="/forgot-password" className="text-signal">
          Reset password
        </Link>
        {" "}on the log in page. We email a reset link to the address on the account. For payout, calendar, or billing questions, start in Settings and Billing. Those screens hold the details that fix most account issues.
      </p>
      {CONTACT.email ? (
        <p>
          Product questions:{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-signal">
            {CONTACT.email}
          </a>
          . Use the email on your Held account so we can find the right page.
        </p>
      ) : (
        <p>
          Until a public support inbox is listed here, use the email on your Held account from the log in page if you cannot reach Settings. Do not send client card numbers.
        </p>
      )}
      {CONTACT.whatsapp ? (
        <p>
          WhatsApp:{" "}
          <a href={CONTACT.whatsapp} className="text-signal">
            Message Held
          </a>
        </p>
      ) : null}
      {socials.length > 0 ? (
        <>
          <h2 className="font-display text-2xl text-paper">Held on social</h2>
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
