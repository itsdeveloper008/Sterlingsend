import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";

type SitemapEntry = {
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export const SITEMAP_BASE = siteConfig.canonicalUrl.replace(/\/$/, "");

/**
 * Public marketing pages only.
 * Excludes: account, history, login, signup, onboarding, admin, /i/*, /dev/*, /api/*.
 */
export const PAGE_ENTRIES: SitemapEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: routes.createInvoice, changeFrequency: "weekly", priority: 0.9 },
  { path: routes.tools, changeFrequency: "weekly", priority: 0.9 },
  { path: routes.templates, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.guideUkInvoice, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.calcVat, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.calcLateInterest, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.privacy, changeFrequency: "monthly", priority: 0.3 },
  { path: routes.terms, changeFrequency: "monthly", priority: 0.3 },
  { path: routes.cookies, changeFrequency: "monthly", priority: 0.3 },
];

/** One entry per PDF tool, each on its own URL. */
export const PDF_TOOL_ENTRIES: SitemapEntry[] = PDF_TOOLS.map((tool) => ({
  path: routes.tool(tool.slug),
  changeFrequency: "monthly",
  priority: 0.8,
}));

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
};

export function urlsetResponse(entries: SitemapEntry[]) {
  const lastmod = new Date().toISOString();
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${SITEMAP_BASE}${e.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${e.changeFrequency}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: XML_HEADERS },
  );
}

export function sitemapIndexResponse(paths: string[]) {
  const lastmod = new Date().toISOString();
  const items = paths
    .map(
      (p) =>
        `  <sitemap>\n    <loc>${SITEMAP_BASE}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`,
    { headers: XML_HEADERS },
  );
}
