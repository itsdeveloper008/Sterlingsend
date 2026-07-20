import type { Metadata } from "next";
import { InvoiceBuilderPage } from "@/features/invoice-builder";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Create Invoice",
  description:
    "Create a professional invoice in minutes. No account required - edit on the sheet, then download or print.",
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/create-invoice",
  },
};

export default function CreateInvoicePage() {
  return <InvoiceBuilderPage />;
}
