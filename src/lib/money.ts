/** Deposit in major currency units (e.g. dollars). */
export function depositAmount(price: number, percent: number) {
  return depositCents(price, percent) / 100;
}

/** Deposit in integer cents from a dollar price. */
export function depositCents(price: number, percent: number) {
  if (price < 0 || percent < 0) return 0;
  const priceCents = Math.round(price * 100);
  return Math.round((priceCents * percent) / 100);
}
