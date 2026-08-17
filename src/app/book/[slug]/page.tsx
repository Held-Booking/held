import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingSurface } from "@/components/booking/BookingSurface";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadVendorPage } from "@/lib/vendor-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadVendorPage(slug);
  return { title: page?.name ?? "Live lock" };
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
    <BookingSurface
      page={page}
      lang={lang}
      copy={t.book}
      nav={page.isDemo ? t.nav : undefined}
    />
  );
}
