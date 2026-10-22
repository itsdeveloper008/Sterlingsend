import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceBuilderPage } from "@/features/invoice-builder";
import { siteConfig } from "@/config/site";
import { getCurrentUserContext } from "@/actions/auth.actions";
import { invoiceService } from "@/services/invoice.service";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import type { SerializedInvoice } from "@/features/invoices/lib/format";

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

export default async function CreateInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  let initialInvoice: SerializedInvoice | null = null;

  if (edit) {
    const context = await getCurrentUserContext();
    if (!context?.business) {
      notFound();
    }
    const invoice = await invoiceService.getInvoice(
      edit,
      context.business.id,
    );
    if (!invoice) {
      notFound();
    }
    initialInvoice = serializeInvoice(invoice);
  }

  return (
    <div className="ss-calm-zone">
      <InvoiceBuilderPage
        editId={edit ?? null}
        initialInvoice={initialInvoice}
      />
    </div>
  );
}
