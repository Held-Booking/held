"use client";

import { useState, useTransition } from "react";
import { cancelPlan, startPlan } from "@/app/dashboard/actions";
import { PRICE } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";

export function BillingPanel({
  live,
  paid,
  status,
  interval,
  daysLeft,
  expiresLabel,
}: {
  live: boolean;
  paid: boolean;
  status: string;
  interval: string | null;
  daysLeft: number;
  expiresLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pay(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startPlan(formData);
        if (result?.error) setError(result.error);
      } catch {
        // Paystack redirect
      }
    });
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.32em] text-signal">
        billing
      </p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Held</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-dim lg:mx-0">
        This is Held’s fee. It lands with Held, not in your bank. Client deposits stay on your account.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-line bg-void-2 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-line bg-void-2 px-4 py-5">
        <p className="font-display text-3xl sm:text-4xl">
          {formatMoney(PRICE.monthly)}
          <span className="text-lg text-dim">/mo</span>
        </p>
        <p className="mt-2 text-sm text-dim">
          Or {formatMoney(PRICE.yearly)} a year. No cut of the job.
        </p>
        <p className="mt-4 text-sm">
          {paid
            ? `You are on ${interval === "yearly" ? "yearly" : "monthly"} Held. Paid through ${expiresLabel}.`
            : live
              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left on the trial.`
              : "The trial ended. Pay to keep taking deposits."}
        </p>
      </div>

      {paid ? (
        status === "canceled" ? (
          <p className="mt-6 text-sm text-dim">
            Canceled. Deposits stay on until {expiresLabel}.
          </p>
        ) : (
          <form
            className="mt-6"
            action={() => {
              setError(null);
              startTransition(async () => {
                const result = await cancelPlan();
                if (result?.error) setError(result.error);
              });
            }}
          >
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-full border border-line text-sm disabled:opacity-40"
            >
              {pending ? "Canceling..." : "Cancel at period end"}
            </button>
          </form>
        )
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <form action={pay}>
            <input type="hidden" name="interval" value="monthly" />
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-full bg-paper text-sm font-medium text-void disabled:opacity-40"
            >
              {pending ? "Opening Paystack..." : `${formatMoney(PRICE.monthly)} a month`}
            </button>
          </form>
          <form action={pay}>
            <input type="hidden" name="interval" value="yearly" />
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-full border border-line text-sm disabled:opacity-40"
            >
              {pending ? "Opening Paystack..." : `${formatMoney(PRICE.yearly)} a year`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
