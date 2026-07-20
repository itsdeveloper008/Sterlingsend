import { requireOnboarding } from "@/actions/auth.actions";
import { CreateInvoicePage } from "@/features/invoices";
import { getDefaultInvoiceDates } from "@/features/invoices/lib/dates";

export default async function NewInvoicePage() {
  const { business } = await requireOnboarding();
  const { issueDate, dueDate } = getDefaultInvoiceDates();

  return (
    <CreateInvoicePage
      currency={business.currency}
      issueDate={issueDate}
      dueDate={dueDate}
    />
  );
}
