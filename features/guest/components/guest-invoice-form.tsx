"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GuestLineItems } from "@/features/guest/components/guest-line-items";
import { GuestTotals } from "@/features/guest/components/guest-totals";
import type { GuestInvoice, GuestInvoiceItem } from "@/features/guest/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function GuestInvoiceForm({
  invoice,
  errors = {},
  onBusinessChange,
  onCustomerChange,
  onInvoiceChange,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
}: {
  invoice: GuestInvoice;
  errors?: Record<string, string>;
  onBusinessChange: (patch: Partial<GuestInvoice["business"]>) => void;
  onCustomerChange: (patch: Partial<GuestInvoice["customer"]>) => void;
  onInvoiceChange: (patch: Partial<GuestInvoice>) => void;
  onLineItemChange: (id: string, patch: Partial<GuestInvoiceItem>) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Your business</h2>
            <p className="text-sm text-muted-foreground">
              Shown at the top of your invoice.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessName">Business name *</Label>
              <Input
                id="businessName"
                value={invoice.business.name}
                onChange={(event) =>
                  onBusinessChange({ name: event.target.value })
                }
                placeholder="Acme Ltd"
              />
              <FieldError message={errors["business.name"]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={invoice.business.email}
                onChange={(event) =>
                  onBusinessChange({ email: event.target.value })
                }
                placeholder="hello@acme.com"
              />
              <FieldError message={errors["business.email"]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                value={invoice.business.phone ?? ""}
                onChange={(event) =>
                  onBusinessChange({ phone: event.target.value })
                }
                placeholder="+44 20 1234 5678"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessAddress">Business address</Label>
              <Textarea
                id="businessAddress"
                rows={3}
                value={invoice.business.address}
                onChange={(event) =>
                  onBusinessChange({ address: event.target.value })
                }
                placeholder={"123 High Street\nLondon\nSW1A 1AA\nUnited Kingdom"}
              />
              <FieldError message={errors["business.address"]} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vatNumber">VAT number</Label>
              <Input
                id="vatNumber"
                value={invoice.business.vatNumber ?? ""}
                onChange={(event) =>
                  onBusinessChange({ vatNumber: event.target.value })
                }
                placeholder="GB123456789"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Bank details</h2>
            <p className="text-sm text-muted-foreground">
              Optional - shown on the invoice note section when set.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                value={invoice.business.bankDetails?.accountName ?? ""}
                onChange={(event) =>
                  onBusinessChange({
                    bankDetails: {
                      accountName: event.target.value,
                      accountNumber:
                        invoice.business.bankDetails?.accountNumber ?? "",
                      sortCode: invoice.business.bankDetails?.sortCode ?? "",
                    },
                  })
                }
                placeholder="Acme Ltd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                value={invoice.business.bankDetails?.accountNumber ?? ""}
                onChange={(event) =>
                  onBusinessChange({
                    bankDetails: {
                      accountName:
                        invoice.business.bankDetails?.accountName ?? "",
                      accountNumber: event.target.value,
                      sortCode: invoice.business.bankDetails?.sortCode ?? "",
                    },
                  })
                }
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort code</Label>
              <Input
                id="sortCode"
                value={invoice.business.bankDetails?.sortCode ?? ""}
                onChange={(event) =>
                  onBusinessChange({
                    bankDetails: {
                      accountName:
                        invoice.business.bankDetails?.accountName ?? "",
                      accountNumber:
                        invoice.business.bankDetails?.accountNumber ?? "",
                      sortCode: event.target.value,
                    },
                  })
                }
                placeholder="00-00-00"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Customer</h2>
            <p className="text-sm text-muted-foreground">
              Who you are invoicing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input
                id="customerName"
                value={invoice.customer.name}
                onChange={(event) =>
                  onCustomerChange({ name: event.target.value })
                }
                placeholder="Client name or company"
              />
              <FieldError message={errors["customer.name"]} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerEmail">Customer email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={invoice.customer.email ?? ""}
                onChange={(event) =>
                  onCustomerChange({ email: event.target.value })
                }
                placeholder="client@company.com"
              />
              <FieldError message={errors["customer.email"]} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerAddress">Customer address</Label>
              <Textarea
                id="customerAddress"
                rows={3}
                value={invoice.customer.address ?? ""}
                onChange={(event) =>
                  onCustomerChange({ address: event.target.value })
                }
                placeholder="Billing address"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-medium">Invoice details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input
                id="issueDate"
                type="date"
                value={invoice.issueDate}
                onChange={(event) =>
                  onInvoiceChange({ issueDate: event.target.value })
                }
              />
              <FieldError message={errors.issueDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoice.dueDate}
                onChange={(event) =>
                  onInvoiceChange({ dueDate: event.target.value })
                }
              />
              <FieldError message={errors.dueDate} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                rows={3}
                value={invoice.notes ?? ""}
                onChange={(event) =>
                  onInvoiceChange({ notes: event.target.value })
                }
                placeholder="Payment terms or thank you message"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <GuestLineItems
            items={invoice.items}
            currency={invoice.currency}
            onAdd={onAddLineItem}
            onRemove={onRemoveLineItem}
            onChange={onLineItemChange}
            errors={errors}
          />
        </section>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <GuestTotals items={invoice.items} currency={invoice.currency} />
      </div>
    </div>
  );
}
