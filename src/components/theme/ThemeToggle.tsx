"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTheme } from "@/app/theme/actions";
import { nextTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  current,
  className = "",
}: {
  current: Theme;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = nextTheme(current);
  const label = next === "light" ? "Switch to light" : "Switch to dark";

  return (
    <button
      type="button"
      disabled={pending}
      title={label}
      aria-label={label}
      onClick={() => {
        document.documentElement.classList.toggle("light", next === "light");
        document.documentElement.style.colorScheme = next;
        startTransition(async () => {
          await setTheme(next);
          router.refresh();
        });
      }}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-paper disabled:opacity-50",
        className,
      )}
    >
      {current === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16.5 13.2A6.2 6.2 0 0 1 10.8 5 6.4 6.4 0 1 0 19 14.8a6.1 6.1 0 0 1-2.5-1.6Z" />
    </svg>
  );
}
