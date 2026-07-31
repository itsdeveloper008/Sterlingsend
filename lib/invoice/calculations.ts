import type { InvoiceFormLineItem, InvoiceItem, InvoiceTotals } from "@/types";
import { createId } from "@/lib/id";

export function calculateLineItem(
  item: InvoiceFormLineItem | Omit<InvoiceItem, "lineSubtotal" | "lineVat" | "lineDiscount" | "lineTotal">,
): InvoiceItem {
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const vatRate = Number(item.vatRate) || 0;
  const discountRate = Number(item.discountRate) || 0;

  const gross = quantity * unitPrice;
  const lineDiscount = gross * (discountRate / 100);
  const lineSubtotal = Math.max(gross - lineDiscount, 0);
  const lineVat = lineSubtotal * (vatRate / 100);

  return {
    id: item.id,
    description: item.description,
    quantity,
    unitPrice,
    vatRate,
    discountRate,
    lineSubtotal: roundMoney(lineSubtotal),
    lineVat: roundMoney(lineVat),
    lineDiscount: roundMoney(lineDiscount),
    lineTotal: roundMoney(lineSubtotal + lineVat),
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[]): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const vatTotal = items.reduce((sum, item) => sum + item.lineVat, 0);
  const discountTotal = items.reduce((sum, item) => sum + item.lineDiscount, 0);

  return {
    subtotal: roundMoney(subtotal),
    vatTotal: roundMoney(vatTotal),
    discountTotal: roundMoney(discountTotal),
    total: roundMoney(subtotal + vatTotal),
  };
}

export function calculateItemsFromForm(items: InvoiceFormLineItem[]): InvoiceItem[] {
  return items.map((item) => calculateLineItem(item));
}

export function generateInvoiceNumber(prefix: string, sequence: number) {
  return `${prefix}${sequence}`;
}

export function createEmptyLineItem(vatRate = 20): InvoiceItem {
  return calculateLineItem({
    id: createId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    vatRate,
    discountRate: 0,
  });
}

export function createEmptyFormLineItem(vatRate = 20): InvoiceFormLineItem {
  return {
    id: createId(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    vatRate,
    discountRate: 0,
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
