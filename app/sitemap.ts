import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";

/**
 * Public marketing sitemap only.
 * Excludes: account, history, login, signup, onboarding, /i/*, /dev/*, /api/*.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.canonicalUrl.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    routes.createInvoice,
    routes.templates,
    routes.tools,
    routes.privacy,
    routes.terms,
    routes.cookies,
    routes.guideUkInvoice,
    routes.calcVat,
    routes.calcLateInterest,
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const tools = PDF_TOOLS.map((t) => ({
    url: `${base}${routes.tool(t.slug)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...tools];
}
