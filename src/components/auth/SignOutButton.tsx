"use client";

import { signOut } from "@/app/auth/actions";

export function SignOutButton({
  label = "Log out",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          compact
            ? "rounded-full px-3 py-2 text-sm text-dim hover:bg-void hover:text-paper"
            : "mt-3 w-full rounded-full px-3 py-2.5 text-center text-sm text-dim hover:bg-void hover:text-paper lg:text-start"
        }
      >
        {label}
      </button>
    </form>
  );
}
