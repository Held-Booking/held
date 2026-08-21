import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";

const PRIVATE = [
  "/api/",
  "/dashboard",
  "/dashboard/",
  "/onboarding",
  "/auth/",
  "/login",
  "/signup",
  "/forgot-password",
  "/book/*/manage/",
  "/book/*/success",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl(),
  };
}
