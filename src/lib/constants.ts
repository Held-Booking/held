export const BRAND = {
  name: "Held",
  tagline: "Hold the date. Take the deposit.",
  description:
    "Booking software for professionals. Clients choose a time and pay a deposit to hold the date.",
} as const;

export const BRAND_ALIASES = [
  "Held Software Limited",
  "BookHeld",
  "bookheld",
  "bookheld.app",
  "Held booking",
] as const;

export const PRICE = {
  monthly: 12,
  yearly: 99,
} as const;

export const DEMO_SLUG = "kade";
export const DEMO_NAME = "Kade";
export const DEMO_TIMEZONE = "Africa/Lagos";

export const CONTACT = {
  email: "hello@bookheld.app",
  whatsapp: "",
  legalName: "Held Software Limited",
  address: "No. 10, Bolakale Street, Ilorin West, Ilorin, Kwara, Nigeria",
} as const;

/** Held’s three public profiles. Paste live URLs when the accounts exist. */
export const SOCIAL = {
  linkedin: "",
  instagram: "",
  youtube: "",
} as const;

export const SOCIAL_PROFILES = [
  { href: SOCIAL.linkedin, label: "LinkedIn" },
  { href: SOCIAL.instagram, label: "Instagram" },
  { href: SOCIAL.youtube, label: "YouTube" },
] as const;
