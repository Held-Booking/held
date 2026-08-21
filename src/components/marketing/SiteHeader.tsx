"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BRAND, DEMO_SLUG } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import type { Theme } from "@/lib/theme";
import { WeekMark } from "@/components/brand/WeekMark";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const PILL = {
  type: "spring" as const,
  stiffness: 240,
  damping: 30,
  mass: 0.85,
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  lang = "en",
  theme = "dark",
  labels = {
    home: "Home",
    demo: "Demo",
    pricing: "Pricing",
    login: "Log in",
    start: "Start",
    language: "Language",
  },
}: {
  lang?: Locale;
  theme?: Theme;
  labels?: {
    home: string;
    demo: string;
    pricing: string;
    login: string;
    start: string;
    language: string;
  };
}) {
  const pathname = usePathname();
  const prefersReduce = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const reduce = hydrated && prefersReduce === true;
  const [hover, setHover] = useState<string | null>(null);
  const NAV = [
    { href: "/", label: labels.home, icon: IconHome, laptop: true },
    { href: `/book/${DEMO_SLUG}`, label: labels.demo, icon: IconDemo, laptop: false },
    { href: "/pricing", label: labels.pricing, icon: IconPrice, laptop: true },
  ];

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-30 px-3"
        style={{ paddingTop: "max(0.65rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            className="glass-island relative flex h-12 overflow-hidden rounded-full sm:h-14"
            initial={false}
            animate={{ width: hydrated ? "100%" : "14.5rem" }}
            transition={{ duration: reduce ? 0 : 0.95, ease: EASE }}
          >
            <div className="flex h-12 w-full shrink-0 items-center sm:h-14">
              <Link
                href="/"
                className="relative z-10 flex h-full shrink-0 items-center gap-2 px-3 font-display text-lg tracking-tight sm:gap-2.5 sm:px-5 sm:text-xl"
              >
                <span>
                  {BRAND.name}
                  <span className="text-signal">.</span>
                </span>
                <WeekMark />
              </Link>

              <motion.div
                className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-1.5 sm:pr-2"
                initial={false}
                animate={{
                  opacity: hydrated ? 1 : 0,
                  x: hydrated ? 0 : -22,
                }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.32, ease: EASE }}
              >
                <nav className="hidden min-w-0 flex-1 justify-center md:flex">
                  <div
                    className="glass-chip relative flex rounded-full p-0.5"
                    onMouseLeave={() => setHover(null)}
                  >
                    {NAV.map((item) => {
                      const on = isActive(pathname, item.href);
                      const over = hover === item.href && !on;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onMouseEnter={() => setHover(item.href)}
                          className={cn(
                            "relative rounded-full px-4 py-1.5 text-sm",
                            on ? "text-on-pill" : "text-dim hover:text-paper",
                            !item.laptop && "lg:hidden",
                          )}
                        >
                          {on ? (
                            <motion.span
                              layoutId="nav-pill"
                              className="glass-pill absolute inset-0 rounded-full"
                              transition={reduce ? { duration: 0 } : PILL}
                            />
                          ) : null}
                          {over ? (
                            <motion.span
                              layoutId="nav-hover"
                              className="absolute inset-0 rounded-full bg-white/10"
                              transition={reduce ? { duration: 0 } : PILL}
                            />
                          ) : null}
                          <span className="relative z-10">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                  <ThemeToggle
                    current={theme}
                    className="h-9 w-9 border-0 bg-transparent sm:h-10 sm:w-10"
                  />
                  <LanguageSwitcher current={lang} />
                  <Link
                    href="/login"
                    className="glass-chip hidden h-9 min-h-9 items-center rounded-full px-4 text-sm text-dim hover:text-paper md:inline-flex sm:h-10 sm:min-h-10"
                  >
                    {labels.login}
                  </Link>
                  <ButtonLink
                    href="/signup"
                    className="h-9 min-h-9 px-4 text-sm sm:h-10 sm:min-h-10 sm:px-5"
                  >
                    {labels.start}
                  </ButtonLink>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      <motion.nav
        className="glass-island fixed inset-x-3 z-30 overflow-hidden rounded-full md:hidden"
        style={{
          bottom: "max(0.55rem, env(safe-area-inset-bottom))",
        }}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.2, ease: EASE }}
      >
        <div className="grid grid-cols-4 p-1">
          {[...NAV, { href: "/login", label: labels.login, icon: IconLogin }].map(
            (item) => {
              const on = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[11px] font-medium leading-none",
                    on ? "text-on-pill" : "text-dim",
                  )}
                >
                  {on ? (
                    <motion.span
                      layoutId="dock-pill"
                      className="glass-pill absolute inset-0 rounded-full"
                      transition={reduce ? { duration: 0 } : PILL}
                    />
                  ) : null}
                  <Icon />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            },
          )}
        </div>
      </motion.nav>
    </>
  );
}

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="relative z-10 h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8Z" />
    </svg>
  );
}

function IconDemo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="relative z-10 h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function IconPrice() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="relative z-10 h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 3 4.5 3 4.5 1.2 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className="relative z-10 h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" />
    </svg>
  );
}
