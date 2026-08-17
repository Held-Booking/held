export function whatsappDigits(raw: string, country = "NG") {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (country === "NG" && digits.startsWith("0")) {
    digits = `234${digits.slice(1)}`;
  }
  return digits;
}

export function whatsappUrl(raw: string | null | undefined, text: string, country = "NG") {
  if (!raw) return null;
  const digits = whatsappDigits(raw, country);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
