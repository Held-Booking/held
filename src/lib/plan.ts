import { PRICE } from "@/lib/constants";

export type PlanInterval = "monthly" | "yearly";

export const PLAN_CURRENCY = "USD";

export function isPlanInterval(value: string): value is PlanInterval {
  return value === "monthly" || value === "yearly";
}

export function planAmountCents(interval: PlanInterval) {
  return interval === "yearly" ? PRICE.yearly * 100 : PRICE.monthly * 100;
}

export function planIsLive(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function planDaysLeft(expiresAt?: string | null) {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function planPeriodEnd(interval: PlanInterval, from = new Date()) {
  const next = new Date(from);
  if (interval === "yearly") next.setUTCFullYear(next.getUTCFullYear() + 1);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(next.getUTCDate() + 2);
  return next;
}
