"use client";

import { useRef } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateItemsFromForm,
  calculateInvoiceTotals,
} from "@/lib/invoice/calculations";
import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import { getDisplayVatRate } from "@/features/invoices/lib/invoice-document-utils";
import { hasPaymentDetails } from "@/features/invoice-builder/lib/defaults";
import type {
  BuilderInvoice,
  BuilderInvoiceAction,
} from "@/features/invoice-builder/types";
import {
  getCurrenciesForSelect,
  getCurrencySymbol,
  isCurrencyCode,
} from "@/config/currencies";
import { cn } from "@/lib/utils";
import "@/features/invoice-builder/styles/invoice-builder.css";

/**
 * Clean editable invoice sheet - logo upload, company block, Billed To panel,
 * line items, teal total bar, notes + payment details.
 */
export function EditableInvoiceCard({
  invoice,
  dispatch,
  onLogoFile,
  className,
}: {
  invoice: BuilderInvoice;
  dispatch: React.Dispatch<BuilderInvoiceAction>;
  onLogoFile: (file: File | null) => void;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const calculatedItems = calculateItemsFromForm(invoice.items);
  const totals = calculateInvoiceTotals(calculatedItems);
  const vatRate = getDisplayVatRate(calculatedItems);
  const showPayment = hasPaymentDetails(invoice.payment);
  const currencySymbol = getCurrencySymbol(invoice.currency);
  const currencies = getCurrenciesForSelect();

  return (
    <article
      className={cn("builder-card", className)}
      data-invoice-builder-card
    >
      <div className="builder-card-inner">
        {/* Header: logo + company */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                onLogoFile(file);
                event.target.value = "";
              }}
            />
            {invoice.logoDataUrl ? (
              <div>
                <button
                  type="button"
                  className="block"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change logo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoice.logoDataUrl}
                    alt="Business logo"
                    className="builder-logo-preview"
                  />
                </button>
                <button
                  type="button"
                  className="no-print mt-1 text-[11px] text-[#64748B] underline-offset-2 hover:underline"
                  onClick={() => onLogoFile(null)}
                >
                  Remove logo
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="builder-logo-box"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-6 w-6" aria-hidden />
                Click to upload
              </button>
            )}

            <h1 className="builder-title">INVOICE</h1>
            <input
              className="builder-field builder-invoice-no"
              value={invoice.invoiceNumber}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { invoiceNumber: event.target.value },
                })
              }
              placeholder="INV-001"
              aria-label="Invoice number"
            />
          </div>

          <div className="builder-company min-w-[200px] flex-1 sm:max-w-xs">
            <input
              className="builder-field text-base font-bold text-[#0F172A]"
              value={invoice.business.name}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { name: event.target.value },
                })
              }
              placeholder="Your Company"
              aria-label="Company name"
            />
            <textarea
              className="builder-field builder-field--area builder-field--muted mt-1"
              rows={2}
              value={invoice.business.address}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { address: event.target.value },
                })
              }
              placeholder="123 Main St, City, State 12345"
              aria-label="Company address"
            />
            <input
              className="builder-field builder-field--muted"
              type="email"
              value={invoice.business.email}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { email: event.target.value },
                })
              }
              placeholder="your@email.com"
              aria-label="Company email"
            />
            <input
              className={cn(
                "builder-field builder-field--muted",
                !invoice.business.phone.trim() && "builder-empty-print",
              )}
              type="tel"
              value={invoice.business.phone}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { phone: event.target.value },
                })
              }
              placeholder="Phone Number"
              aria-label="Phone (optional)"
            />
            <div
              className={cn(
                "mt-0.5 flex items-baseline justify-end gap-1 text-sm text-[#94A3B8]",
                !invoice.business.vatNumber.trim() && "builder-empty-print",
              )}
            >
              <span className="italic">VAT:</span>
              <input
                className="builder-field builder-field--muted w-auto min-w-[8rem] text-right italic"
                value={invoice.business.vatNumber}
                onChange={(event) =>
                  dispatch({
                    type: "patchBusiness",
                    patch: { vatNumber: event.target.value },
                  })
                }
                placeholder="Add VAT Number"
                aria-label="VAT number (optional)"
              />
            </div>
          </div>
        </header>

        {/* Billed To + dates */}
        <div className="builder-billed">
          <div>
            <p className="builder-label">Billed To</p>
            <input
              className="builder-field mt-2 font-semibold text-[#0F172A]"
              value={invoice.customer.name}
              onChange={(event) =>
                dispatch({
                  type: "patchCustomer",
                  patch: { name: event.target.value },
                })
              }
              placeholder="Client Company"
              aria-label="Client name"
            />
            <textarea
              className="builder-field builder-field--area builder-field--muted mt-1"
              rows={2}
              value={invoice.customer.address}
              onChange={(event) =>
                dispatch({
                  type: "patchCustomer",
                  patch: { address: event.target.value },
                })
              }
              placeholder="Client Address"
              aria-label="Client address"
            />
            <input
              className="builder-field builder-field--muted"
              type="email"
              value={invoice.customer.email}
              onChange={(event) =>
                dispatch({
                  type: "patchCustomer",
                  patch: { email: event.target.value },
                })
              }
              placeholder="client@email.com"
              aria-label="Client email"
            />
          </div>

          <div>
            <p className="builder-label">Issue Date</p>
            <input
              className="builder-field mt-2 font-medium text-[#0F172A]"
              type="date"
              value={invoice.issueDate}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { issueDate: event.target.value },
                })
              }
              aria-label="Issue date"
            />
          </div>

          <div>
            <p className="builder-label">Due Date</p>
            <input
              className="builder-field mt-2 font-medium text-[#0F172A]"
              type="date"
              value={invoice.dueDate}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { dueDate: event.target.value },
                })
              }
              aria-label="Due date"
            />
          </div>
        </div>

        {/* Line items */}
        <table className="builder-table">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col" className="num">
                Qty
              </th>
              <th scope="col" className="num">
                Price
              </th>
              <th scope="col" className="num">
                Discount (%)
              </th>
              <th scope="col" className="num">
                VAT (%)
              </th>
              <th scope="col" className="num">
                Total
              </th>
              <th scope="col" className="no-print w-8">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const calculated = calculatedItems[index];

              return (
                <tr key={item.id}>
                  <td>
                    <input
                      className="builder-field"
                      value={item.description}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { description: event.target.value },
                        })
                      }
                      placeholder="Service or Product"
                      aria-label="Description"
                    />
                  </td>
                  <td className="num">
                    <input
                      className="builder-field text-right"
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { quantity: Number(event.target.value) || 0 },
                        })
                      }
                      aria-label="Quantity"
                    />
                  </td>
                  <td className="num">
                    <input
                      className="builder-field text-right"
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { unitPrice: Number(event.target.value) || 0 },
                        })
                      }
                      aria-label="Price"
                    />
                  </td>
                  <td className="num">
                    <input
                      className="builder-field text-right"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={item.discountRate}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: {
                            discountRate: Number(event.target.value) || 0,
                          },
                        })
                      }
                      aria-label="Discount percent"
                    />
                  </td>
                  <td className="num">
                    <input
                      className="builder-field text-right"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={item.vatRate}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: {
                            vatRate: Math.min(
                              100,
                              Math.max(0, Number(event.target.value) || 0),
                            ),
                          },
                        })
                      }
                      aria-label="VAT percent"
                    />
                  </td>
                  <td className="num font-semibold tabular-nums">
                    {formatInvoiceCurrency(
                      calculated?.lineTotal ?? 0,
                      invoice.currency,
                    )}
                  </td>
                  <td className="no-print">
                    <button
                      type="button"
                      className="builder-row-remove inline-flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        dispatch({ type: "removeItem", id: item.id })
                      }
                      disabled={invoice.items.length <= 1}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="no-print mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "addItem" })}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Totals */}
        <dl className="builder-totals">
          <div className="builder-total-row">
            <dt className="text-[#64748B]">Subtotal</dt>
            <dd className="tabular-nums text-[#0F172A]">
              {formatInvoiceCurrency(totals.subtotal, invoice.currency)}
            </dd>
          </div>
          <div className="builder-total-row">
            <dt className="text-[#64748B]">Discount</dt>
            <dd className="builder-total-discount tabular-nums">
              - {formatInvoiceCurrency(totals.discountTotal, invoice.currency)}
            </dd>
          </div>
          <div className="builder-total-row">
            <dt className="text-[#64748B]">VAT ({vatRate}%)</dt>
            <dd className="builder-total-vat tabular-nums">
              + {formatInvoiceCurrency(totals.vatTotal, invoice.currency)}
            </dd>
          </div>
          <div className="builder-total-final">
            <div className="flex items-center gap-2">
              <select
                className="no-print max-w-[11rem] rounded-md border border-[#99F6E4] bg-white px-2 py-1 text-sm font-semibold text-[#0F172A]"
                value={invoice.currency}
                onChange={(event) => {
                  const next = event.target.value;
                  if (!isCurrencyCode(next)) return;
                  dispatch({
                    type: "patch",
                    patch: { currency: next },
                  });
                }}
                aria-label="Currency"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({getCurrencySymbol(c.code)})
                  </option>
                ))}
              </select>
              <span className="text-sm font-semibold text-[#0F172A] print:inline">
                <span className="no-print sr-only">Total</span>
                <span className="hidden print:inline">{currencySymbol}</span>
              </span>
            </div>
            <dd className="builder-total-final-amount tabular-nums">
              {currencySymbol}{" "}
              {totals.total.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
        </dl>

        {/* Notes */}
        <section className="builder-section">
          <h2 className="builder-section-title">Notes</h2>
          <textarea
            className="builder-field builder-field--area builder-field--muted mt-2"
            rows={2}
            value={invoice.notes}
            onChange={(event) =>
              dispatch({ type: "patch", patch: { notes: event.target.value } })
            }
            placeholder="Thank you for your business!"
            aria-label="Notes"
          />
        </section>

        {/* Payment */}
        <section
          className={cn(
            "builder-section",
            !showPayment && "builder-empty-print",
          )}
        >
          <h2 className="builder-section-title">Payment Details</h2>
          <div className="builder-payment-grid">
            <span className="builder-payment-label">Account Holder</span>
            <input
              className="builder-field builder-field--muted"
              value={invoice.payment.accountHolder}
              onChange={(event) =>
                dispatch({
                  type: "patchPayment",
                  patch: { accountHolder: event.target.value },
                })
              }
              placeholder="e.g. John Doe"
            />
            <span className="builder-payment-label">Bank Name</span>
            <input
              className="builder-field builder-field--muted"
              value={invoice.payment.bankName}
              onChange={(event) =>
                dispatch({
                  type: "patchPayment",
                  patch: { bankName: event.target.value },
                })
              }
              placeholder="e.g. Global Bank"
            />
            <span className="builder-payment-label">Account/IBAN</span>
            <input
              className="builder-field builder-field--muted"
              value={invoice.payment.accountIban}
              onChange={(event) =>
                dispatch({
                  type: "patchPayment",
                  patch: { accountIban: event.target.value },
                })
              }
              placeholder="e.g. GB29NWBK60161331926819"
            />
            <span className="builder-payment-label">Sort Code/SWIFT</span>
            <input
              className="builder-field builder-field--muted"
              value={invoice.payment.sortSwift}
              onChange={(event) =>
                dispatch({
                  type: "patchPayment",
                  patch: { sortSwift: event.target.value },
                })
              }
              placeholder="e.g. 12-34-56"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="builder-footer">
          <div className="min-w-0">
            <p className="font-semibold text-[#0F172A]">
              {invoice.business.name.trim() || "Your Company"}
            </p>
            <p className="text-sm text-[#64748B]">
              {invoice.business.email.trim() || "your@email.com"}
            </p>
          </div>
          <div className="builder-footer-meta">
            <span className="builder-label">Invoice No.</span>
            <p className="builder-footer-no">
              {invoice.invoiceNumber.trim() || "INV-001"}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
