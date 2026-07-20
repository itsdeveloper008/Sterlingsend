import { siteConfig } from "@/config/site";

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0]!;
}

export function getDefaultInvoiceDates(paymentTermsDays?: number) {
  const days = paymentTermsDays ?? siteConfig.defaultPaymentTermsDays;
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);

  return {
    issueDate: formatDateInput(issueDate),
    dueDate: formatDateInput(dueDate),
  };
}
