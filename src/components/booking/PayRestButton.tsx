"use client";

import { useState } from "react";

export function PayRestButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setError(null);
          setBusy(true);
          try {
            const res = await fetch("/api/checkout/balance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
              setError(data.error ?? "Could not start payment.");
              setBusy(false);
              return;
            }
            window.location.href = data.url;
          } catch {
            setError("Could not start payment.");
            setBusy(false);
          }
        }}
        className="flex min-h-12 w-full items-center justify-center rounded-full border border-signal px-6 text-sm text-signal disabled:opacity-40"
      >
        {label}
      </button>
      {error ? <p className="mt-2 text-xs text-dim">{error}</p> : null}
    </div>
  );
}
