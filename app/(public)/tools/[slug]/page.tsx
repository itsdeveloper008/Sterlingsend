import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing";
import { getToolBySlug, PDF_TOOLS } from "@/features/pdf-tools";
import { ToolWorkspaceLazy } from "@/features/pdf-tools/components/tool-workspace-lazy";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return PDF_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "PDF tool" };
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    metadataBase: new URL(siteConfig.canonicalUrl),
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `${siteConfig.canonicalUrl}/tools/${slug}`,
      siteName: siteConfig.name,
      locale: "en_GB",
      type: "website",
      images: [{ url: "/tools/opengraph-image" }],
    },
  };
}

export default async function PublicToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const related = PDF_TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug,
  ).slice(0, 4);

  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm text-muted-foreground">
          <Link href={routes.tools} className="ss-link-underline">
            PDF tools
          </Link>
          <span aria-hidden> / </span>
          {tool.title}
        </p>
        <h1 className="mt-3 type-display text-foreground">{tool.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {tool.description}
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">{tool.privacyTag}</p>

        <div className="ss-calm-zone mt-8">
          <ToolWorkspaceLazy tool={tool} />
        </div>

        <section className="mt-12 max-w-2xl">
          <h2 className="type-h2 text-foreground">How it works</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
            {tool.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="type-h2 text-foreground">Questions</h2>
          <dl className="mt-4 space-y-4">
            {tool.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-foreground">{item.question}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 ? (
          <section className="mt-10">
            <h2 className="type-h2 text-foreground">Related tools</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={routes.tool(item.slug)}
                    className="ss-link-underline text-sm font-medium text-[var(--brand-700)]"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </MarketingShell>
  );
}
