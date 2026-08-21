import { Reveal } from "@/components/fx/Reveal";
import type { PublishedReview } from "@/lib/reviews";

export function VoiceOfHeld({ reviews }: { reviews: PublishedReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="relative z-10 px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
      <Reveal className="mx-auto max-w-5xl">
        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-signal lg:text-start">
          from people who use Held
        </p>
        <h2 className="mt-3 text-center text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight lg:text-start">
          The date stayed booked.
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {reviews.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-line bg-void-2 p-5 text-start"
            >
              <p className="text-sm leading-relaxed text-paper">“{row.body}”</p>
              <p className="mt-4 text-sm font-medium text-paper">{row.displayName}</p>
              <p className="text-xs text-dim">
                {[row.trade, row.city].filter(Boolean).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
