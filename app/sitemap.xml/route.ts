import { sitemapIndexResponse } from "@/lib/sitemap";

export const dynamic = "force-static";

/** Sitemap index: site pages and PDF tools are listed in separate sitemaps. */
export function GET() {
  return sitemapIndexResponse(["/sitemap-pages.xml", "/sitemap-pdf-tools.xml"]);
}
