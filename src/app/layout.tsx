import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import { BRAND } from "@/lib/constants";
import { isRtl } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { FaviconSpread } from "@/components/brand/FaviconSpread";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip bg-void font-sans text-paper">
        <FaviconSpread />
        {children}
      </body>
    </html>
  );
}
