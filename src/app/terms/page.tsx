import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage kicker="legal" title="Terms">
      <p>Last updated 17 August 2026.</p>
      <p>
        These terms are the agreement between you and Held when you create a page, book a page, or otherwise use the service. Held is booking software. You get a public page. Clients pick a package, a time, and pay a deposit to hold it. Held is not a marketplace, not an employer, and not a party to the job between the professional and the client.
      </p>

      <h2 className="font-display text-2xl text-paper">Who may use Held</h2>
      <p>
        You must be old enough to form a contract in your country and able to take or make a booking in good faith. We welcome professionals and clients of every background. You may not use Held to discriminate in a way that breaks the law of the place where the work happens, or to scam, harass, or harm anyone.
      </p>

      <h2 className="font-display text-2xl text-paper">Your page</h2>
      <p>
        If you create a page, you are responsible for your packages, hours, prices, descriptions, photos, and the work you sell. The client books you, not Held. You must keep your login safe and keep payout details accurate. If a job goes wrong, that dispute is between you and the client. Held can show what the system recorded. Held cannot redo the work or decide the quality of it.
      </p>

      <h2 className="font-display text-2xl text-paper">Bookings and deposits</h2>
      <p>
        A booking is held when the deposit is paid through checkout, not when someone messages you. Card and transfer payments run on Paystack where that is the processor for your country. When a payout bank is on file, client deposits are meant to land with you. Until that bank is saved, a deposit may land with Held’s Paystack account and need to be moved. Held does not take a percentage of the job.
      </p>
      <p>
        Held’s own fee is $12 a month or $99 a year after a 14 day trial. That fee is separate from client deposits. Paying it may require an international card or USD on Paystack. If the trial or subscription lapses, the public page may stop taking new deposits until billing is current. Existing confirmed bookings remain visible to you.
      </p>
      <p>
        Cancellation and reschedule rules on a booking follow what the professional set and what the manage link still allows. The deposit stays with the professional unless you both agree otherwise outside Held. Held does not hold job money as an escrow service.
      </p>

      <h2 className="font-display text-2xl text-paper">Demo</h2>
      <p>
        The Kade page is a demonstration. It cannot take a real deposit and is not an offer of work.
      </p>

      <h2 className="font-display text-2xl text-paper">Acceptable use</h2>
      <p>
        Do not use Held to collect payments for illegal goods or services, to impersonate another person, to abuse the payment network, or to attack the service. We can close a page that is used to scam, abuse, or break the law. We will not close a page because of race, religion, gender, disability, language, or who you serve, unless the use itself is unlawful.
      </p>

      <h2 className="font-display text-2xl text-paper">Availability and changes</h2>
      <p>
        We work to keep Held available. We do not promise uninterrupted access. We can change features, pricing, and these terms. If we change these terms, this page is the source. Continued use after the date above means you accept the current text. This is not legal advice. Local consumer or payment rules may also apply to you.
      </p>

      <h2 className="font-display text-2xl text-paper">Language</h2>
      <p>
        The product is available in several languages so more people can book and run a page. These terms are in English. If a translation disagrees with this page, this page controls.
      </p>
    </LegalPage>
  );
}
