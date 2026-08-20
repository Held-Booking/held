export function phoneDigits(raw: string) {
  return raw.replace(/\D/g, "");
}

export function phoneLooksValid(raw: string) {
  const digits = phoneDigits(raw);
  return digits.length >= 8 && digits.length <= 15;
}
