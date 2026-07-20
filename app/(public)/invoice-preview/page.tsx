import { Suspense } from "react";
import { GuestInvoicePreview } from "@/features/guest";
import { Skeleton } from "@/components/ui/skeleton";

function PreviewFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-[900px] w-full max-w-3xl" />
    </div>
  );
}

export default function InvoicePreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <GuestInvoicePreview />
    </Suspense>
  );
}
