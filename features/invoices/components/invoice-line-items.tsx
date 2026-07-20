"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateInvoiceTotals,
  calculateLineItem,
  createEmptyFormLineItem,
} from "@/lib/invoice/calculations";
import type { InvoiceFormLineItem } from "@/types";
import {
  formatInvoiceCurrency,
} from "@/features/invoices/lib/format";

export function InvoiceLineItems({
  items,
  currency,
  onChange,
  errors,
  disabled,
}: {
  items: InvoiceFormLineItem[];
  currency: string;
  onChange: (items: InvoiceFormLineItem[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}) {
  function updateItem(id: string, patch: Partial<InvoiceFormLineItem>) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    onChange([...items, createEmptyFormLineItem()]);
  }

  function removeItem(id: string) {
    if (items.length === 1) return;
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Line items</h3>
          <p className="text-sm text-muted-foreground">
            Add products or services to this invoice.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const calculated = calculateLineItem(item);
          const itemError = errors?.[`items.${index}.description`];

          return (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">Item {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                  disabled={disabled || items.length === 1}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Input
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(event) =>
                      updateItem(item.id, { description: event.target.value })
                    }
                    placeholder="Service or product description"
                    disabled={disabled}
                  />
                  {itemError ? (
                    <p className="text-sm text-destructive">{itemError}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, {
                        quantity: Number(event.target.value),
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`unitPrice-${item.id}`}>Unit price</Label>
                  <Input
                    id={`unitPrice-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, {
                        unitPrice: Number(event.target.value),
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vatRate-${item.id}`}>VAT %</Label>
                  <Input
                    id={`vatRate-${item.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.vatRate}
                    onChange={(event) =>
                      updateItem(item.id, {
                        vatRate: Number(event.target.value),
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`discountRate-${item.id}`}>Discount %</Label>
                  <Input
                    id={`discountRate-${item.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.discountRate}
                    onChange={(event) =>
                      updateItem(item.id, {
                        discountRate: Number(event.target.value),
                      })
                    }
                    disabled={disabled}
                  />
                </div>

                <div className="flex items-end md:col-span-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Line total: </span>
                    <span className="font-medium">
                      {formatInvoiceCurrency(calculated.lineTotal, currency)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errors?.items ? (
        <p className="text-sm text-destructive">{errors.items}</p>
      ) : null}
    </div>
  );
}

export function useInvoiceTotals(items: InvoiceFormLineItem[]) {
  const calculatedItems = items.map((item) => calculateLineItem(item));
  return calculateInvoiceTotals(calculatedItems);
}
