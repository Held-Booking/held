"use client";

import { useState } from "react";

export function CopyLink({
  value,
  label = "Copy link",
  copied = "Copied",
}: {
  value: string;
  label?: string;
  copied?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-paper px-5 text-sm font-medium text-void active:scale-[0.98] active:opacity-80 sm:w-auto"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? copied : label}
    </button>
  );
}
