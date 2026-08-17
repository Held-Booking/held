import { SiteChrome } from "@/components/marketing/SiteChrome";
import { Reveal } from "@/components/fx/Reveal";

export function LegalPage({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-10 pt-[calc(4.75rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pt-28 lg:text-start">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
            {kicker}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-6xl">{title}</h1>
        </Reveal>
        <Reveal delay={0.06} className="mt-8 space-y-5 text-sm leading-relaxed text-dim sm:text-base">
          {children}
        </Reveal>
      </main>
    </SiteChrome>
  );
}
