import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage kicker="legal" title="Privacy">
      <p>Last updated 17 August 2026.</p>
      <p>
        Held stores what it needs to run a booking page. We do not sell that data.
      </p>
      <h2 className="font-display text-2xl text-paper">What we keep</h2>
      <p>
        You: name, link, country, hours, packages, WhatsApp number, and payout bank details you type in. Client: name, email, phone, the slot they booked, and the deposit amount. Login emails live in Supabase Auth.
      </p>
      <h2 className="font-display text-2xl text-paper">Who else sees it</h2>
      <p>
        Paystack processes cards. We do not store full card numbers. Supabase stores the app data. Resend sends booking mail when that key is on. A public booking page shows your name, packages, and open times. It does not show your bank number.
      </p>
      <h2 className="font-display text-2xl text-paper">Mail and WhatsApp</h2>
      <p>
        After a deposit, we may email you and the client, and we may show a WhatsApp link. Those messages exist so the booking is real, not for ads.
      </p>
      <h2 className="font-display text-2xl text-paper">How long</h2>
      <p>
        Data stays while the page is open. If you want an account removed, say so from the email on that account and we will delete what we can.
      </p>
    </LegalPage>
  );
}
