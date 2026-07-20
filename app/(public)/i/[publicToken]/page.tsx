import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicInvoicePage } from "@/features/payments";
import { invoicePaymentService } from "@/services/invoice-payment.service";
import { Skeleton } from "@/components/ui/skeleton";

function PublicInvoiceFallback() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default async function PublicInvoiceRoute({
  params,
  searchParams,
}: {
  params: Promise<{ publicToken: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { publicToken } = await params;
  const { payment } = await searchParams;

  const invoice = await invoicePaymentService.buildPublicInvoiceView(publicToken);
  if (!invoice) {
    notFound();
  }

  await invoicePaymentService.recordPublicView(publicToken);

  const refreshed = await invoicePaymentService.buildPublicInvoiceView(publicToken);
  if (!refreshed) {
    notFound();
  }

  return (
    <Suspense fallback={<PublicInvoiceFallback />}>
      <PublicInvoicePage invoice={refreshed} paymentState={payment ?? null} />
    </Suspense>
  );
}
