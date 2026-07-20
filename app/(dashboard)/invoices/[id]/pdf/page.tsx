import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { InvoicePdfPreviewPage } from "@/pdf/components/invoice-pdf-preview-page";
import { buildInvoicePdfDocument } from "@/pdf/utils/build-document";
import { invoiceService } from "@/services/invoice.service";
import { customerService } from "@/services/customer.service";
import { Skeleton } from "@/components/ui/skeleton";

function PdfPreviewFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-[900px] w-full max-w-3xl" />
    </div>
  );
}

export default async function InvoicePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business } = await requireOnboarding();
  const invoice = await invoiceService.getInvoice(id, business.id);

  if (!invoice) {
    notFound();
  }

  const customer = await customerService.getCustomer(
    invoice.customerId,
    business.id,
  );

  const document = buildInvoicePdfDocument({
    invoice,
    business,
    customer,
  });

  return (
    <Suspense fallback={<PdfPreviewFallback />}>
      <InvoicePdfPreviewPage document={document} />
    </Suspense>
  );
}
