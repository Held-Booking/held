import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage kicker="legal" title="Privacy">
      <p>Last updated 20 August 2026.</p>
      <p>
        This notice explains what Held collects, why we collect it, who can see it, and how you can ask us to change or delete it. It applies to people who create a Held page and to people who book through one. Held is booking software. We are not a marketplace and we do not sell personal data. The controller is {CONTACT.legalName}, {CONTACT.address}. Write to{" "}
        <a href={`mailto:${CONTACT.email}`} className="text-signal">
          {CONTACT.email}
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Who this covers</h2>
      <p>
        A professional is anyone who creates a Held page to take bookings. A client is anyone who uses that page to reserve time and pay a deposit. Both groups have a right to clear information about their data, regardless of country, language, or how they pay.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">What we collect</h2>
      <p>
        From professionals we store the name shown on the page, the public link, country, timezone, currency, hours, packages, optional intro and photo, WhatsApp number if provided, and payout bank details entered in Settings. Login is handled by Supabase Auth using the email and password you choose. A session cookie keeps you signed in on this device. If you connect Google Calendar, we store a refresh token so new bookings can be written to that calendar. You can disconnect Google in Settings. Password reset mail is sent through the email provider connected to Held’s login system.
      </p>
      <p>
        From clients we store name, email, phone or WhatsApp if provided, the package and time booked, deposit amount, and payment status. We do not store full card numbers. Paystack (or another processor named at checkout) handles the card or transfer.
      </p>
      <p>
        We also store technical logs needed to run the service, such as sign in time and basic device data used to keep the session secure. We do not use that data to build advertising profiles.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Why we collect it</h2>
      <p>
        We use this information to create and run the booking page, to take and confirm deposits, to show the professional who is booked, to send booking mail when email sending is turned on, and to display a WhatsApp link so the two of you can talk about the job. We do not use client details to market other products.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Who else can see it</h2>
      <p>
        The public booking page shows the professional’s name, photo if added, packages, prices, and open times. It does not show bank account numbers, login details, or a client’s private contact information to strangers.
      </p>
      <p>
        Paystack processes payments. Supabase stores application data. Resend sends mail when that service is connected. Google Calendar receives booking times only if the professional chooses to connect Google. Each of those providers processes data to provide that function, not to sell it for us.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Mail and WhatsApp</h2>
      <p>
        After a deposit, Held may email the professional and the client, and may show a WhatsApp link. Those messages exist so the booking is real and so you can reach each other. They are not advertising. You can stop extra product mail by asking from the email on the account. Transactional booking mail may still be needed for a paid reservation.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">How long we keep it</h2>
      <p>
        Account and booking records stay while the page is open and for as long as we need them to show history, handle disputes, or meet accounting and legal duties. If you want an account removed, write from the email on that account. We will delete or anonymise what we can. Payment processors and banks may keep records they are required to keep even after we delete the Held page.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Your choices</h2>
      <p>
        Professionals can change page details, bank details, and calendar connection in Settings. Clients can use the manage link sent after a booking to move or cancel where that is still allowed. You may ask what we hold about you, ask us to correct it, or ask us to delete it, subject to records we must keep. We will not refuse a request because of language, disability, or which country you work in.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Children</h2>
      <p>
        Held is meant for adults who offer or book professional time. Do not create an account or book on behalf of a child without a lawful basis. If we learn that we hold a child’s data without that basis, we will delete it.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">Changes</h2>
      <p>
        If this notice changes in a way that affects you, we will update the date on this page. The current text is the one that applies. This notice is written in English. Other languages in the product are for using Held, not a replacement for this text.
      </p>
    </LegalPage>
  );
}
