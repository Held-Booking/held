import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isMissingSchema } from "@/lib/supabase/errors";
import { absUrl } from "@/lib/seo";

export type PublishedReview = {
  id: string;
  body: string;
  displayName: string;
  trade: string;
  city: string;
  rating: number;
};

export async function listPublishedReviews(): Promise<PublishedReview[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("held_reviews")
      .select("id, body, display_name, trade, city, rating")
      .eq("publish", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) return [];
    return (data ?? []).map((row) => ({
      id: row.id as string,
      body: String(row.body ?? "").trim(),
      displayName: String(row.display_name ?? "").trim(),
      trade: String(row.trade ?? "").trim(),
      city: String(row.city ?? "").trim(),
      rating: Number(row.rating) || 5,
    })).filter((row) => row.body.length >= 8 && row.displayName.length > 0);
  } catch {
    return [];
  }
}

export function reviewsNode(reviews: PublishedReview[]) {
  if (reviews.length === 0) return null;
  const avg =
    Math.round(
      (reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length) * 10,
    ) / 10;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${absUrl()}/#app`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(avg),
      reviewCount: String(reviews.length),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((row) => ({
      "@type": "Review",
      reviewBody: row.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(row.rating),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: row.displayName,
      },
    })),
  };
}

export function reviewTableMissing(message?: string | null) {
  const text = (message ?? "").toLowerCase();
  return (
    isMissingSchema(message) ||
    text.includes("held_reviews") ||
    text.includes("review_ask_sent_at") ||
    text.includes("review_prompt_hidden_at")
  );
}
