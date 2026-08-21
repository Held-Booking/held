import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { BRAND, CONTACT } from "@/lib/constants";
import { isRtl } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme-server";
import { THEME_COLORS } from "@/lib/theme";
import { AuthLinkCatch } from "@/components/auth/AuthLinkCatch";
import { FaviconSpread } from "@/components/brand/FaviconSpread";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absUrl,
  organizationNode,
  siteUrl,
  softwareNode,
  websiteNode,
} from "@/lib/seo";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const display = Syne({
  variable: "--font-display-en",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export async function generateViewport(): Promise<Viewport> {
  const theme = await getTheme();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    colorScheme: theme,
    themeColor: THEME_COLORS[theme],
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} · ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Held is booking software by Held Software Limited. One page on bookheld.app, a deposit, and the date is held. $12 a month. No cut of the job.",
  applicationName: BRAND.name,
  authors: [{ name: CONTACT.legalName, url: absUrl() }],
  creator: CONTACT.legalName,
  publisher: CONTACT.legalName,
  category: "business",
  keywords: [
    "Held",
    "Held Software Limited",
    "bookheld",
    "bookheld.app",
    "booking software",
    "booking page with deposit",
    "appointment booking software",
    "WhatsApp booking",
    "no commission booking",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    siteName: BRAND.name,
    locale: "en_US",
    alternateLocale: ["fr_FR", "es_ES", "pt_PT", "de_DE", "ar_001", "zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.description,
  },
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ||
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google:
            process.env.GOOGLE_SITE_VERIFICATION ||
            process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
          ...(process.env.BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : process.env.BING_SITE_VERIFICATION
      ? {
          verification: {
            other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION },
          },
        }
      : {}),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const theme = await getTheme();
  return (
    <html
      lang={lang}
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className={`${sans.variable} ${display.variable} h-full overflow-x-clip antialiased${theme === "light" ? " light" : ""}`}
      style={{ colorScheme: theme }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&family=Noto+Sans+SC:wght@400;700&display=swap"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png" />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-void font-sans text-paper">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [organizationNode(), websiteNode(), softwareNode()],
          }}
        />
        <AuthLinkCatch />
        <FaviconSpread />
        <div id="main" className="flex min-h-dvh flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
