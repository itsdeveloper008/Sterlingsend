import { notFound } from "next/navigation";
import { requireOnboarding } from "@/actions/auth.actions";
import { EditInvoicePage } from "@/features/invoices";
import { serializeInvoice } from "@/features/invoices/lib/serialize";
import { serializeCustomer } from "@/features/customers/lib/serialize";
import { invoiceService } from "@/services/invoice.service";
import { customerService } from "@/services/customer.service";

export default async function InvoiceEditPage({
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

  return (
    <EditInvoicePage
      invoice={serializeInvoice(invoice)}
      currency={business.currency}
      customer={customer ? serializeCustomer(customer) : null}
    />
  );
}
