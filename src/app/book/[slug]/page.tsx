import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingSurface } from "@/components/booking/BookingSurface";
import { JsonLd } from "@/components/seo/JsonLd";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { absUrl, pageMeta } from "@/lib/seo";
import { loadVendorPage } from "@/lib/vendor-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadVendorPage(slug);
  if (!page) {
    return pageMeta({
      title: "Page not found",
      description: "That Held booking page does not exist.",
      path: `/book/${slug}`,
      index: false,
    });
  }
  const name = page.name;
  const description = page.isDemo
    ? `Demo booking page for ${name}. Pick a package and a time. This demo cannot take a real deposit.`
    : `Book ${name} on Held. Choose a package and a time, then pay a deposit to hold the date.`;
  return pageMeta({
    title: page.isDemo ? `Demo · ${name}` : `Book ${name}`,
    description,
    path: `/book/${slug}`,
  });
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await loadVendorPage(slug);
  if (!page) notFound();
  const lang = await getLang();
  const t = dict(lang);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: page.name,
          url: absUrl(`/book/${page.slug}`),
          description:
            page.blurb ||
            `Book ${page.name} on Held. Pay a deposit to hold the date.`,
          image: page.photo || undefined,
          areaServed: page.country,
        }}
      />
      <BookingSurface
        page={page}
        lang={lang}
        copy={t.book}
        nav={page.isDemo ? t.nav : undefined}
      />
    </>
  );
}
