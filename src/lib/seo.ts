import type { Metadata } from "next";
import { BRAND, CONTACT, PRICE, SOCIAL } from "@/lib/constants";

export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.bookheld.app";
  try {
    const url = new URL(raw);
    const host = url.hostname;
    if (
      host === "localhost" ||
      host.startsWith("127.") ||
      host.endsWith(".vercel.app")
    ) {
      return "https://www.bookheld.app";
    }
    if (host === "bookheld.app") url.hostname = "www.bookheld.app";
    return url.origin;
  } catch {
    return "https://www.bookheld.app";
  }
}

export function absUrl(path = "/") {
  if (!path || path === "/") return siteUrl();
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const NOINDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
  },
};

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absUrl(input.path);
  const index = input.index !== false;
  const fullTitle = input.title;
  return {
    title: input.absoluteTitle ? { absolute: fullTitle } : fullTitle,
    description: input.description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : NOINDEX,
    openGraph: {
      type: "website",
      url,
      siteName: BRAND.name,
      title: fullTitle,
      description: input.description,
      locale: "en_US",
      alternateLocale: [
        "fr_FR",
        "es_ES",
        "pt_PT",
        "de_DE",
        "ar_001",
        "zh_CN",
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
  };
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationNode() {
  const id = `${absUrl()}/#org`;
  const sameAs = [
    process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL?.trim(),
    SOCIAL.instagram,
    SOCIAL.x,
    SOCIAL.linkedin,
    SOCIAL.facebook,
    SOCIAL.tiktok,
  ].filter((url): url is string => Boolean(url));
  return {
    "@type": "Organization",
    "@id": id,
    name: CONTACT.legalName,
    legalName: CONTACT.legalName,
    alternateName: BRAND.name,
    url: absUrl(),
    email: CONTACT.email,
    brand: { "@type": "Brand", name: BRAND.name },
    logo: {
      "@type": "ImageObject",
      url: absUrl("/icon-512.png"),
      width: 512,
      height: 512,
    },
    image: absUrl("/icon-512.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressLocality: "Ilorin",
      addressRegion: "Kwara",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT.email,
      contactType: "customer support",
      areaServed: ["NG", "GH", "KE", "ZA", "CI", "US"],
      availableLanguage: ["English", "French", "Spanish", "Portuguese", "German", "Arabic", "Chinese"],
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": `${absUrl()}/#website`,
    url: absUrl(),
    name: BRAND.name,
    alternateName: ["Held booking", "bookheld"],
    description: BRAND.description,
    inLanguage: "en",
    publisher: { "@id": `${absUrl()}/#org` },
  };
}

export function softwareNode() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${absUrl()}/#app`,
    name: BRAND.name,
    url: absUrl(),
    image: absUrl("/opengraph-image"),
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AppointmentSchedulingApplication",
    operatingSystem: "Web",
    description: BRAND.description,
    featureList: [
      "Public booking page",
      "Deposit at checkout",
      "No commission on the job",
      "Google Calendar sync",
      "WhatsApp after booking",
    ],
    offers: [
      {
        "@type": "Offer",
        price: String(PRICE.monthly),
        priceCurrency: "USD",
        name: "Monthly",
        url: absUrl("/pricing"),
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        price: String(PRICE.yearly),
        priceCurrency: "USD",
        name: "Yearly",
        url: absUrl("/pricing"),
        availability: "https://schema.org/InStock",
      },
    ],
    publisher: { "@id": `${absUrl()}/#org` },
  };
}

export function faqNode(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absUrl()}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function breadcrumbNode(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export function howToNode() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to take bookings with a deposit on Held",
    description:
      "Create a public booking page, share one link, and take a deposit so the date is held.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Create your page",
        text: "Sign up, name the page, add packages, hours, and a payout bank.",
        url: absUrl("/signup"),
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Share one link",
        text: "Put your Held link in WhatsApp, Instagram, or your bio. That is the booking door.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "They pay to hold the date",
        text: "The client picks a package and a time, then pays a deposit. A chat reply is not a booking.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "The date is held",
        text: "You both get mail. The booking can land on Google Calendar. The rest is due at the job unless they pay it earlier.",
      },
    ],
  };
}

export const HOME_FAQS = [
  {
    q: "Is a chat a booking?",
    a: "No. A booking is held when the deposit is paid.",
  },
  {
    q: "Do you take a cut of the job?",
    a: "No. $12 a month or $99 a year. That is Held. The deposit is theirs.",
  },
  {
    q: "What happens after the 14 days?",
    a: "The dashboard stays open. New deposits pause until Held is paid.",
  },
  {
    q: "Does Held work in Africa and the US?",
    a: "Yes. Open a page from either. Africa takes deposits on Paystack today. US card deposits use Stripe, which is next.",
  },
  {
    q: "Can I try it first?",
    a: "Open the demo. It cannot take a real deposit. Your own page can, after a bank is on file.",
  },
] as const;
