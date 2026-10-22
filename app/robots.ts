import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/invoices",
        "/account",
        "/dev/",
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
