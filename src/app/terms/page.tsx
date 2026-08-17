import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage kicker="legal" title="Terms">
      <p>Last updated 17 August 2026.</p>
      <p>
        Held is booking software. You get a public page. Clients pick a package, a time, and pay a deposit to hold it. Held is not a marketplace, not an employer, and not a party to the job.
      </p>
      <h2 className="font-display text-2xl text-paper">Your page</h2>
      <p>
        You are responsible for your packages, hours, prices, and the work you sell. The client books you, not Held. If a job goes wrong, that is between you and the client.
      </p>
      <h2 className="font-display text-2xl text-paper">Deposits</h2>
      <p>
        Card payments run on Paystack. When you add your bank, client deposits are meant to land with you. Until that bank is on file, a deposit may land with Held’s Paystack and need to be moved. Held does not take a cut of the job.
      </p>
      <p>
        Held’s own fee is $12 a month or $99 a year after a 14 day trial. That fee is separate from client deposits. It may require international payments on Paystack.
      </p>
      <h2 className="font-display text-2xl text-paper">Demo</h2>
      <p>
        The Kade page is a demo. It cannot take a real deposit.
      </p>
      <h2 className="font-display text-2xl text-paper">Accounts</h2>
      <p>
        Keep your login safe. We can close a page that is used to scam, abuse, or break the law. The product is available in several languages. These terms are in English.
      </p>
      <h2 className="font-display text-2xl text-paper">These terms</h2>
      <p>
        Held is early. We can change the product and these terms. If we do, this page is the source. This is not legal advice.
      </p>
    </LegalPage>
  );
}
