import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT } from "@/lib/constants";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Security",
  description:
    "How Held handles payments, login, Google Calendar tokens, and account deletion. We do not store full card numbers.",
  path: "/security",
});

export default function SecurityPage() {
  return (
    <LegalPage kicker="held" title="Security" path="/security">
      <p>
        Held is booking software. We store what we need to run a page and a deposit. We do not store full card numbers.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Payments</h2>
      <p>
        Cards and transfers go through the processor named at checkout. Africa uses Paystack. US card deposits use Stripe, which is next. Held never sees the full card.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Accounts</h2>
      <p>
        Login uses email and a password. A session cookie keeps you signed in on this device. Password reset mail goes only to the address on the account.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Calendar</h2>
      <p>
        If you connect Google Calendar, we store a refresh token so new bookings can be written there. You can disconnect in Settings.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">What the public page shows</h2>
      <p>
        Name, photo if you add one, packages, prices, and open times. Not bank numbers, not login details, not a client’s private contact to strangers.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Delete an account</h2>
      <p>
        Write from the email on that account to{" "}
        <a href={`mailto:${CONTACT.email}`} className="text-signal">
          {CONTACT.email}
        </a>
        . The full notice is on{" "}
        <Link href="/privacy" className="text-signal">
          Privacy
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Held</h2>
      <p>
        {CONTACT.legalName}
        <br />
        {CONTACT.address}
        <br />
        <a href={`mailto:${CONTACT.email}`} className="text-signal">
          {CONTACT.email}
        </a>
      </p>
    </LegalPage>
  );
}