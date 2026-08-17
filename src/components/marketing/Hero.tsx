"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { DateLock } from "@/components/marketing/DateLock";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { DEMO_SLUG } from "@/lib/constants";
import type { Messages } from "@/lib/i18n";

export function Hero({ copy }: { copy: Messages["home"] }) {
  const router = useRouter();

  return (
    <section className="relative z-10 overflow-x-clip px-4 pb-14 pt-[calc(5rem+env(safe-area-inset-top))] sm:px-6 sm:pb-16 sm:pt-28 lg:px-10 lg:pb-24">
      <div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-40 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-signal/15 blur-[80px] sm:h-56" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="text-center lg:text-start">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-signal sm:text-[11px] sm:tracking-[0.28em]"
          >
            {copy.eyebrow}
          </motion.p>
          <h1 className="mt-3 font-display text-[clamp(1.85rem,8.5vw,7.25rem)] leading-[0.92] text-paper sm:mt-4">
            <motion.span
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {copy.hold}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="block text-signal"
            >
              {copy.theDate}
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-dim sm:mt-6 sm:text-lg lg:mx-0"
          >
            {copy.sub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
            className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
          >
            <MagneticButton
              className="w-full sm:w-auto"
              onClick={() => router.push("/signup")}
            >
              {copy.getPage}
            </MagneticButton>
            <Link
              href={`/book/${DEMO_SLUG}`}
              className="inline-flex min-h-12 items-center justify-center text-sm text-paper underline decoration-signal/50 underline-offset-4 sm:min-h-11"
            >
              {copy.seeBooking}
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
        >
          <DateLock
            openLabel={copy.open}
            packageLabel={copy.pkg}
            dueLabel={copy.dueNow}
            hint={copy.tapDate}
          />
        </motion.div>
      </div>
    </section>
  );
}

