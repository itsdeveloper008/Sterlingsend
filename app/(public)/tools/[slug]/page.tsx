import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing";
import { getToolBySlug, ToolWorkspace } from "@/features/pdf-tools";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "PDF Tool" };
  return {
    title: tool.title,
    description: tool.description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: `/tools/${slug}`,
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

  return (
    <MarketingShell>
      <div className="border-b border-border/70 bg-muted/30">
        <div className="bonsai-container flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <p className="text-muted-foreground">
            Running in your browser · nothing uploaded to our servers
          </p>
          <p className="text-muted-foreground">
            Save invoices & clients?{" "}
            <Link
              href={routes.login}
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="bonsai-container py-8 sm:py-10">
        <ToolWorkspace tool={tool} />
      </div>
    </MarketingShell>
  );
}
