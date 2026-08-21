import { CONTACT } from "@/lib/constants";
import { absUrl } from "@/lib/seo";

export function GET() {
  const body = [
    `Contact: mailto:${CONTACT.email}`,
    `Expires: 2027-08-21T00:00:00.000Z`,
    "Preferred-Languages: en",
    `Canonical: ${absUrl("/.well-known/security.txt")}`,
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
