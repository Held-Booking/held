import { headers } from "next/headers";

export function originFromHeaders(h: Headers, fallback?: string) {
  const host = (h.get("x-forwarded-host") || h.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host) {
    return (
      fallback?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000"
    );
  }
  const proto = (
    h.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https")
  )
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

export function originFromRequest(request: {
  headers: Headers;
  nextUrl?: { origin: string };
}) {
  return originFromHeaders(request.headers, request.nextUrl?.origin);
}

export async function appOrigin() {
  return originFromHeaders(await headers());
}
