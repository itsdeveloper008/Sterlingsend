import type { SerializedInvoice } from "@/features/invoices/lib/format";
import {
  getHistoryDisplayStatus,
  historyDisplayLabel,
} from "@/features/invoices/lib/display-status";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function invoicesToCsv(invoices: SerializedInvoice[]): string {
  const header = [
    "number",
    "client",
    "issue date",
    "due date",
    "subtotal",
    "VAT",
    "total",
    "currency",
    "status",
  ];
  const rows = invoices.map((invoice) => {
    const status = historyDisplayLabel(getHistoryDisplayStatus(invoice));
    return [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.issueDate,
      invoice.dueDate,
      invoice.totals.subtotal,
      invoice.totals.vatTotal,
      invoice.totals.total,
      invoice.currency,
      status,
    ]
      .map(csvEscape)
      .join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function downloadInvoicesCsv(
  invoices: SerializedInvoice[],
  filename = "invoices.csv",
) {
  const blob = new Blob([invoicesToCsv(invoices)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
