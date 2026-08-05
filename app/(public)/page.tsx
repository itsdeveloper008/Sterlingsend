import type { Metadata } from "next";
import { HomePage, MarketingShell } from "@/features/marketing";
import { siteConfig } from "@/config/site";

const title = `${siteConfig.name} - Professional invoicing for service businesses`;
const description =
  "Create invoices and use every PDF tool free, no login required. Create an account only when you want to save customers, invoices, and payments.";

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
  },
};

/** Marketing homepage - Bonsai-style layout (hellobonsai.com structure). */
export default function Page() {
  return (
    <MarketingShell>
      <HomePage />
    </MarketingShell>
  );
}
