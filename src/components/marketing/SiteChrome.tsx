import { Atmosphere } from "@/components/fx/Atmosphere";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { dict } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = dict(lang);
  return (
    <>
      <Atmosphere />
      <SiteHeader lang={lang} labels={t.nav} />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
        <SiteFooter lang={lang} labels={t.footer} />
      </div>
    </>
  );
}
