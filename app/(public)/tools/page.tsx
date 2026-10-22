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
      <div className="border-b border-border-subtle bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="type-h1 text-foreground">PDF tools</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {toolCount} tools for everyday PDF jobs. Most run in your browser so
            files stay on your device. Translate PDF sends extracted text to a
            translation service. OCR may download language data on first use.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <ToolsCatalog />
      </div>
    </MarketingShell>
  );
}
