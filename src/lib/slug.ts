const RESERVED = new Set([
  "kade",
  "held",
  "login",
  "signup",
  "pricing",
  "dashboard",
  "onboarding",
  "api",
  "book",
  "admin",
  "www",
]);

export function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]{3,24}$/.test(slug) && !RESERVED.has(slug);
}
