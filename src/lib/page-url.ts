export function pagePathLabel(origin: string, slug: string) {
  try {
    return `${new URL(origin).host}/book/${slug}`;
  } catch {
    return `/book/${slug}`;
  }
}
