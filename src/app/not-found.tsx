import type { Metadata } from "next";
import { SiteChrome } from "@/components/marketing/SiteChrome";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: NOINDEX,
};

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 pb-16 pt-[calc(5.5rem+env(safe-area-inset-top))] text-center lg:items-start lg:text-start">
        <p className="text-[10px] uppercase tracking-[0.32em] text-signal">held</p>
        <h1 className="mt-3 font-display text-3xl sm:text-5xl">Page not found</h1>
        <p className="mt-4 max-w-md text-sm text-dim sm:text-base">
          That address is not a Held page. Check the link, or open the home page.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <ButtonLink href="/" className="w-full sm:w-auto">
            Home
          </ButtonLink>
          <ButtonLink href="/login" variant="ghost" className="w-full sm:w-auto">
            Log in
          </ButtonLink>
        </div>
      </main>
    </SiteChrome>
  );
}
