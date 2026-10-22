import type { Metadata } from "next";
import { InvoiceBuilderPage } from "@/features/invoice-builder";
import { siteConfig } from "@/config/site";

const title = "Create an invoice";
const description =
  "Build a UK invoice with VAT, pick a template, then download or print a PDF. No account required. Log in later if you want saved history.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/create-invoice",
  },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/create-invoice`,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/create-invoice/opengraph-image" }],
  },
};

export default function CreateInvoicePage() {
  return (
    <div className="ss-calm-zone">
      <InvoiceBuilderPage />
    </div>
  );
}
