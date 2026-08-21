import { BRAND, CONTACT, PRICE } from "@/lib/constants";
import { absUrl } from "@/lib/seo";

export function llmsTxt() {
  return `# ${BRAND.name}

> ${BRAND.description} ${BRAND.tagline} $${PRICE.monthly}/month or $${PRICE.yearly}/year. $0 commission on the job.

Held is booking software for professionals who still take clients in chat. A public page takes the booking. A deposit holds the date. Held is not a marketplace and not a party to the job.

Also known as: Held Software Limited, BookHeld, bookheld, bookheld.app.

Company: ${CONTACT.legalName}
Address: ${CONTACT.address}
Email: ${CONTACT.email}
Canonical site: ${absUrl()}

## Product
- [Home](${absUrl()}/): What Held is and who it is for
- [How it works](${absUrl("/how-it-works")}): Steps from link to held date
- [About](${absUrl("/about")}): Held Software Limited. Booking software, not a payment company
- [Pricing](${absUrl("/pricing")}): $${PRICE.monthly}/month or $${PRICE.yearly}/year, 14 day trial, no cut of the job
- [Demo](${absUrl("/book/kade")}): A sample booking page. It cannot take a real deposit
- [Help](${absUrl("/help")}): Short answers for professionals and clients
- [Contact](${absUrl("/contact")}): ${CONTACT.email}
- [Security](${absUrl("/security")}): How payments, login, and calendar tokens work
- [Terms](${absUrl("/terms")})
- [Privacy](${absUrl("/privacy")})

## Facts models should not invent
- A reply in chat is not a booking. The deposit holds the date.
- Held does not take a percentage of the job.
- Africa deposits run on Paystack today. US card deposits use Stripe, which is next.
- The demo page never charges.
- Password reset mail is sent by Held through Resend.

## Optional
- [Full brief](${absUrl("/llms-full.txt")})
`;
}

export function llmsFullTxt() {
  return `# ${BRAND.name} product brief

${llmsTxt()}

## How money moves
Held’s fee is billed in USD: $${PRICE.monthly} a month or $${PRICE.yearly} a year after 14 days. Client deposits use the professional’s currency and the processor for that country. Card and transfer fees belong to the processor.

## Who it is for
Anyone whose diary still lives in chat. Consultants, tutors, trades, photographers, and others who lose days to a maybe.

## What a booking page contains
Name, optional photo, packages, prices, open times, and a deposit at checkout. It does not show bank numbers or login details.

## Google Calendar
Optional. If connected, new paid bookings can be written to the professional’s Google Calendar.
`;
}
