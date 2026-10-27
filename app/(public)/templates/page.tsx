import type { Metadata } from "next";
import { MarketingShell } from "@/features/marketing";
import { TemplatesGallery } from "@/features/templates/components/templates-gallery";
import { INVOICE_TEMPLATE_COUNT } from "@/pdf/templates/catalog";
import { siteConfig } from "@/config/site";

const title = "Invoice templates";
const description = `Browse ${INVOICE_TEMPLATE_COUNT} free UK invoice templates by layout and colour. Pick one, fill in your details and download a professional PDF invoice. No account required.`;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.canonicalUrl),
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title,
    description,
    url: `${siteConfig.canonicalUrl}/templates`,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/templates/opengraph-image" }],
  },
};

export default function TemplatesPage() {
  return (
    <MarketingShell>
      <div
        className="ss-section bg-background"
        style={{ borderBottom: "1px solid var(--border-decorative)" }}
      >
        <div className="bonsai-container">
          <p className="ss-eyebrow">Gallery</p>
          <h1 className="bonsai-h1 mt-6">Invoice templates</h1>
          <p className="bonsai-lead ss-measure mt-6">
            {INVOICE_TEMPLATE_COUNT} layouts. Pick a colour, then a layout. Your
            choice applies to the PDF you download and print.
          </p>
        </div>
      </div>
      <div className="ss-section bg-[var(--surface-muted)]">
        <div className="bonsai-container">
          <TemplatesGallery />
        </div>
      </div>
    </MarketingShell>
  );
}
