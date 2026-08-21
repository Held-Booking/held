import type { MetadataRoute } from "next";
import { DEMO_SLUG } from "@/lib/constants";
import { absUrl } from "@/lib/seo";
import { createAdminSupabase } from "@/lib/supabase/admin";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const MARKETING: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.9 },
  { path: `/book/${DEMO_SLUG}`, changeFrequency: "weekly", priority: 0.8 },
  { path: "/help", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/security", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
];

async function publicSlugs() {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) return [];
  try {
    const admin = createAdminSupabase();
    const { data } = await admin
      .from("profiles")
      .select("slug, updated_at")
      .not("slug", "is", null)
      .limit(4000);
    return (data ?? []).filter(
      (row): row is { slug: string; updated_at: string | null } =>
        typeof row.slug === "string" && row.slug.length > 0 && row.slug !== DEMO_SLUG,
    );
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const vendors = await publicSlugs();
  return [
    ...MARKETING.map((item) => ({
      url: absUrl(item.path),
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...vendors.map((row) => ({
      url: absUrl(`/book/${row.slug}`),
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
