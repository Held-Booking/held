import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <LegalPage kicker="held" title="Help">
      <p>
        Short answers. If you booked someone, write to them. Held is not a party to the job.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Is a chat a booking?</h2>
      <p>No. A booking is held when the deposit is paid through checkout.</p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Can I try Held without paying?</h2>
      <p>
        Open the{" "}
        <Link href="/book/kade" className="text-signal">
          demo
        </Link>
        . It cannot take a real deposit. Your own page has 14 days, then $12 a month.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">I forgot my password</h2>
      <p>
        Use{" "}
        <Link href="/forgot-password" className="text-signal">
          Reset password
        </Link>
        . We email a link to the address on the account.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">The page will not take a deposit</h2>
      <p>
        The professional needs a live Held plan, a bank on file in a country where checkout works, and at least one package and open hours. The demo never charges.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Where do deposits go?</h2>
      <p>
        To the professional, through the payment processor for their country. Held takes none of the job. $12 is Held’s fee, billed in USD, separate from the deposit. Card and transfer fees belong to the processor.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">I cancelled. Where is the deposit?</h2>
      <p>
        The deposit stays with the professional unless you both agree otherwise outside Held. Held does not hold job money as escrow.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Still stuck</h2>
      <p>
        Open{" "}
        <Link href="/contact" className="text-signal">
          Contact
        </Link>
        {" "}or write to{" "}
        <a href={`mailto:${CONTACT.email}`} className="text-signal">
          {CONTACT.email}
        </a>
        . {CONTACT.legalName}, {CONTACT.address}. Use the email on your Held account if you run a page.
      </p>
    </LegalPage>
  );
}