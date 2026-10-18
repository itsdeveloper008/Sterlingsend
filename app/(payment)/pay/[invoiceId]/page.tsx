import { notFound } from "next/navigation";
import { isPaymentsEnabled } from "@/lib/config/payments";

export default async function PayInvoicePage() {
  if (!isPaymentsEnabled()) {
    notFound();
  }

  notFound();
}
