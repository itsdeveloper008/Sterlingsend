import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.canonicalUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/api",
        "/invoices",
        "/account",
        "/dev/",
        "/dev",
        "/i/",
        "/onboarding",
        "/settings",
        "/dashboard",
        "/pay/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
