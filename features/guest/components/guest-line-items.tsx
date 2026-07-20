"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateLineItem } from "@/lib/invoice/calculations";
import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import type { GuestInvoiceItem } from "@/features/guest/types";

export function GuestLineItems({
  items,
  currency,
  onAdd,
  onRemove,
  onChange,
  errors,
}: {
  items: GuestInvoiceItem[];
  currency: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<GuestInvoiceItem>) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">Line items</h2>
          <p className="text-sm text-muted-foreground">
            Add what you are billing for.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const calculated = calculateLineItem(item);

          return (
            <div
              key={item.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Item {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(item.id)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Input
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(event) =>
                      onChange(item.id, { description: event.target.value })
                    }
                    placeholder="Design work, consulting, product..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={item.quantity}
                    onChange={(event) =>
                      onChange(item.id, {
                        quantity: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`unitPrice-${item.id}`}>Unit price</Label>
                  <Input
                    id={`unitPrice-${item.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      onChange(item.id, {
                        unitPrice: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`vatRate-${item.id}`}>VAT %</Label>
                  <Input
                    id={`vatRate-${item.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={item.vatRate}
                    onChange={(event) =>
                      onChange(item.id, {
                        vatRate: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`discountRate-${item.id}`}>Discount %</Label>
                  <Input
                    id={`discountRate-${item.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={item.discountRate}
                    onChange={(event) =>
                      onChange(item.id, {
                        discountRate: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex items-end sm:col-span-2">
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
