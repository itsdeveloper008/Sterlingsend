import type { Metadata } from "next";
import { HomePage, MarketingShell } from "@/features/marketing";
import { siteConfig } from "@/config/site";

const title = "Free invoice maker and PDF tools";
const description =
  "Free UK invoice generator and 32 PDF tools. Create VAT invoices, download PDFs, and merge, compress or convert files. No login needed; sign up to save history.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.canonicalUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteConfig.canonicalUrl,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.canonicalUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </MarketingShell>
  );
}
