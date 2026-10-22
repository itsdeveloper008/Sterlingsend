import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing";
import { TemplatesGallery } from "@/features/templates/components/templates-gallery";
import { INVOICE_TEMPLATE_COUNT } from "@/pdf/templates/catalog";
import { siteConfig } from "@/config/site";

const title = "Invoice templates";
const description = `Browse ${INVOICE_TEMPLATE_COUNT} invoice templates by layout and colour. Pick one, then create and download a PDF. No account required.`;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/templates`,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/templates/opengraph-image" }],
  },
};

export default function TemplatesPage() {
  return (
    <MarketingShell>
      <div className="border-b border-border-subtle bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="type-h1 text-foreground">Invoice templates</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {INVOICE_TEMPLATE_COUNT} designs from eight layouts and eleven
            colours. Choosing one sets the look of the PDF you download from
            Create invoice.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <TemplatesGallery />
      </div>
    </MarketingShell>
  );
}
