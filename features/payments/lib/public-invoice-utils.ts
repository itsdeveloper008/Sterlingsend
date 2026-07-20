import { INVOICE_STATUSES } from "@/types";
import {
  INVOICE_PAYMENT_STATUSES,
  type PublicInvoiceView,
} from "@/types/public-invoice";

export {
  formatPaymentTermsLabel,
  getDisplayVatRate,
  hasBankDetails,
  INVOICE_STATUS_LABELS as PUBLIC_STATUS_LABELS,
} from "@/features/invoices/lib/invoice-document-utils";

export function shouldShowPayButton(invoice: PublicInvoiceView) {
  return (
    invoice.paymentEnabled &&
    invoice.paymentStatus !== INVOICE_PAYMENT_STATUSES.PAID &&
    invoice.status !== INVOICE_STATUSES.PAID &&
    invoice.status !== INVOICE_STATUSES.CANCELLED &&
    invoice.status !== INVOICE_STATUSES.DRAFT
  );
}
