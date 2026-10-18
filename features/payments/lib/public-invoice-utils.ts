import { INVOICE_STATUSES } from "@/types";
import {
  INVOICE_PAYMENT_STATUSES,
  type PublicInvoiceView,
} from "@/types/public-invoice";
import { isPaymentsEnabled } from "@/lib/config/payments";

export {
  formatPaymentTermsLabel,
  getDisplayVatRate,
  hasBankDetails,
  INVOICE_STATUS_LABELS as PUBLIC_STATUS_LABELS,
} from "@/features/invoices/lib/invoice-document-utils";

export function shouldShowPayButton(invoice: PublicInvoiceView) {
  if (!isPaymentsEnabled()) return false;
  return (
    invoice.paymentEnabled &&
    invoice.paymentStatus !== INVOICE_PAYMENT_STATUSES.PAID &&
    invoice.status !== INVOICE_STATUSES.PAID &&
    invoice.status !== INVOICE_STATUSES.CANCELLED &&
    invoice.status !== INVOICE_STATUSES.DRAFT
  );
}
