import { routes } from "@/config/routes";
import { PDF_TOOLS } from "@/features/pdf-tools/catalog";

export type SiteSearchItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  group: "Pages" | "PDF tools";
};

export function buildSiteSearchIndex(): SiteSearchItem[] {
  const pages: SiteSearchItem[] = [
    {
      id: "page-home",
      title: "Home",
      description: "Free invoice maker and PDF tools",
      href: routes.home,
      group: "Pages",
    },
    {
      id: "page-create",
      title: "Create invoice",
      description: "Build and download a PDF invoice",
      href: routes.createInvoice,
      group: "Pages",
    },
    {
      id: "page-templates",
      title: "Templates",
      description: "Invoice template gallery",
      href: routes.templates,
      group: "Pages",
    },
    {
      id: "page-tools",
      title: "PDF tools",
      description: "Merge, split, compress and more",
      href: routes.tools,
      group: "Pages",
    },
    {
      id: "page-privacy",
      title: "Privacy",
      description: "Privacy policy",
      href: routes.privacy,
      group: "Pages",
    },
    {
      id: "page-terms",
      title: "Terms",
      description: "Terms of service",
      href: routes.terms,
      group: "Pages",
    },
    {
      id: "page-cookies",
      title: "Cookies",
      description: "Cookie policy",
      href: routes.cookies,
      group: "Pages",
    },
  ];

  const tools: SiteSearchItem[] = PDF_TOOLS.map((tool) => ({
    id: `tool-${tool.slug}`,
    title: tool.title,
    description: tool.description,
    href: routes.tool(tool.slug),
    group: "PDF tools",
  }));

  return [...pages, ...tools];
}

export function filterSiteSearch(
  items: SiteSearchItem[],
  query: string,
): SiteSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 24);
  return items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    )
    .slice(0, 40);
}
