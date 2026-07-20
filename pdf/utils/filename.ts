export function getInvoicePdfFilename(invoiceNumber: string) {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, "").trim();
  return `${safe || "invoice"}.pdf`;
}
