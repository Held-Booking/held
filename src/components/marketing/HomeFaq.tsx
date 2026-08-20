export function HomeFaq({
  title,
  items,
}: {
  title: string;
  items: Array<{ q: string; a: string }>;
}) {
  return (
    <section className="relative z-10 px-4 py-14 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl lg:text-start">
          {title}
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-start text-base font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-signal transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pr-12 text-start text-sm leading-relaxed text-dim sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
