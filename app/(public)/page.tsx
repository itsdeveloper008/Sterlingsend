import type { Metadata } from "next";
import { HomePage, MarketingShell } from "@/features/marketing";
import { siteConfig } from "@/config/site";

const title = "Free invoice maker and PDF tools";
const description =
  "Create UK invoices with VAT, download PDFs and use browser PDF tools free. No signup needed. Log in only if you want saved invoice history.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
};

export default function Page() {
  return (
    <MarketingShell>
      <HomePage />
    </MarketingShell>
  );
}
