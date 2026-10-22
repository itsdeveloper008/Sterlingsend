import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/features/marketing";
import { ToolsCatalog, PDF_TOOLS } from "@/features/pdf-tools";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

const toolCount = PDF_TOOLS.length;
const title = "PDF tools";
const description = `${toolCount} PDF tools for merge, split, compress, convert and more. Most run in your browser. No account required.`.slice(
  0,
  160,
);

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/tools/opengraph-image" }],
  },
};

export default function PublicToolsPage() {
  return (
    <MarketingShell>
      <div className="ss-section border-b border-border-subtle bg-background">
        <div className="bonsai-container">
          <h1 className="bonsai-h1">PDF tools</h1>
          <p className="bonsai-lead mt-4 max-w-2xl">
            {toolCount} tools for everyday PDF jobs. Search or browse by
            category. Most tools keep your files on your device.
          </p>
          <p className="mt-4 text-base text-[var(--secondary-text)]">
            Need to invoice a client?{" "}
            <Link
              href={routes.createInvoice}
              className="ss-link-underline font-semibold text-[var(--brand-700)]"
            >
              Create an invoice
            </Link>
          </p>
        </div>
      </div>
      <div className="ss-section bg-[var(--surface-muted)]">
        <div className="bonsai-container">
          <ToolsCatalog />
        </div>
      </div>
    </MarketingShell>
  );
}
