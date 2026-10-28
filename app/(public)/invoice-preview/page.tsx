import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestInvoicePreview } from "@/features/guest";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Invoice preview",
  description:
    "Preview your SterlingSend invoice exactly as it will look when downloaded or printed. Check the details, then download the PDF or go back and edit it.",
  alternates: { canonical: "/invoice-preview" },
};

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
