import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { BRAND, PRICE } from "@/lib/constants";
import { isRtl } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { AuthLinkCatch } from "@/components/auth/AuthLinkCatch";
import { FaviconSpread } from "@/components/brand/FaviconSpread";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07080a",
};

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} · ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
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
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className={`${sans.variable} ${display.variable} h-full overflow-x-clip antialiased`}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: BRAND.name,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: BRAND.description,
              offers: {
                "@type": "Offer",
                price: String(PRICE.monthly),
                priceCurrency: "USD",
              },
            }),
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
