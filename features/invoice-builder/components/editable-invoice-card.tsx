"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Calendar, Plus, Trash2, Upload, X } from "lucide-react";
import {
  calculateItemsFromForm,
  calculateInvoiceTotals,
  resolveDiscountType,
} from "@/lib/invoice/calculations";
import { formatInvoiceCurrency } from "@/features/invoices/lib/format";
import { getDisplayVatRate } from "@/features/invoices/lib/invoice-document-utils";
import {
  addDaysToIsoDate,
  hasPaymentDetails,
  PAYMENT_TERMS_OPTIONS,
} from "@/features/invoice-builder/lib/defaults";
import type {
  BuilderInvoice,
  BuilderInvoiceAction,
  PaymentTermsDays,
} from "@/features/invoice-builder/types";
import { getCurrencySymbol } from "@/config/currencies";
import { getInvoiceTemplate } from "@/pdf/templates/catalog";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { InvoiceStampOverlay } from "@/features/invoice-builder/components/invoice-stamp-overlay";
import type { InvoiceStamp } from "@/features/invoice-builder/lib/stamps";
import {
  computeAccentVars,
  DEFAULT_ACCENT_HEX,
} from "@/lib/invoice-accent";
import "@/features/invoice-builder/styles/invoice-builder.css";

const MONEY_MAX = 999_999_999.99;

function autoGrow(event: React.FormEvent<HTMLTextAreaElement>) {
  const el = event.currentTarget;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function formatMoneyDisplay(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoneyDraft(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === ".") return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MONEY_MAX, n);
}

function measureTextWidth(
  text: string,
  font: string,
): number {
  if (typeof document === "undefined") return 0;
  const canvas =
    (measureTextWidth as unknown as { _c?: HTMLCanvasElement })._c ??
    document.createElement("canvas");
  (measureTextWidth as unknown as { _c?: HTMLCanvasElement })._c = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/** Step font 15→13 (then 12/11 if still needed) so values never clip. */
function fitNumericEl(el: HTMLElement | null) {
  if (!el) return;
  const full =
    el instanceof HTMLInputElement ? el.value : (el.textContent ?? "");
  if (full) el.setAttribute("title", full);
  const style = window.getComputedStyle(el);
  const available = Math.max(0, el.clientWidth);
  const weight = style.fontWeight || "400";
  const family = style.fontFamily || "sans-serif";
  for (const size of [15, 14, 13, 12, 11, 10, 9] as const) {
    el.style.fontSize = `${size}px`;
    const width = measureTextWidth(full, `${weight} ${size}px ${family}`);
    if (width <= available + 1) break;
  }
}

/** Price / money cell: commas + 2dp on blur; raw while editing. */
function LineItemMoneyInput({
  value,
  onCommit,
  ariaLabel,
  className,
  max = MONEY_MAX,
}: {
  value: number;
  onCommit: (n: number) => void;
  ariaLabel: string;
  className?: string;
  max?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    fitNumericEl(ref.current);
  }, [value, editing, draft]);

  return (
    <input
      ref={ref}
      className={cn("builder-field builder-num-field", className)}
      inputMode="decimal"
      value={editing ? draft : formatMoneyDisplay(value)}
      onFocus={() => {
        setEditing(true);
        setDraft(Number.isFinite(value) ? String(value) : "0");
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        // Prefer the live DOM value so Playwright fill / IME commits match.
        const next = Math.min(
          max,
          parseMoneyDraft(event.currentTarget.value || draft),
        );
        onCommit(next);
        setEditing(false);
      }}
      aria-label={ariaLabel}
    />
  );
}

function LineItemPlainNumberInput({
  value,
  onCommit,
  ariaLabel,
  className,
  min = 0,
  max,
}: {
  value: number;
  onCommit: (n: number) => void;
  ariaLabel: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    fitNumericEl(ref.current);
  }, [value]);

  return (
    <input
      ref={ref}
      className={cn("builder-field builder-num-field", className)}
      type="number"
      min={min}
      max={max}
      step="any"
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => {
        let n = Number(event.target.value);
        if (!Number.isFinite(n)) n = 0;
        if (max != null) n = Math.min(max, n);
        onCommit(Math.max(min, n));
      }}
      aria-label={ariaLabel}
    />
  );
}

function LineTotalCell({ text }: { text: string }) {
  const ref = useRef<HTMLTableCellElement>(null);
  useLayoutEffect(() => {
    fitNumericEl(ref.current);
  }, [text]);
  return (
    <td
      ref={ref}
      className="num builder-col-total builder-line-total font-semibold tabular-nums text-[#0F172A]"
      data-label="Total"
      title={text}
    >
      {text}
    </td>
  );
}

/** Amount with symbol glued (or NBSP before code when no symbol). Never wraps. */
function formatTotalAmountText(amount: number, currency: string): string {
  const digits = formatMoneyDisplay(amount);
  const symbol = getCurrencySymbol(currency);
  const hasGlyph = Boolean(symbol) && symbol !== currency && !/^[A-Z]{3}$/.test(symbol);
  if (hasGlyph) return `${symbol}${digits}`;
  return `${currency}\u00A0${digits}`;
}

function fitAmountEl(
  el: HTMLElement | null,
  sizes: readonly number[] = [28, 24, 22, 20, 18, 16],
) {
  if (!el) return;
  const text = el.textContent ?? "";
  if (text) el.setAttribute("title", text.replace(/\u00A0/g, " "));
  const style = window.getComputedStyle(el);
  const available = Math.max(0, el.clientWidth);
  const weight = style.fontWeight || "800";
  const family = style.fontFamily || "sans-serif";
  for (const size of sizes) {
    el.style.fontSize = `${size}px`;
    const width = measureTextWidth(text, `${weight} ${size}px ${family}`);
    if (width <= available + 1) break;
  }
}

function FitAmount({
  text,
  className,
  sizes,
}: {
  text: string;
  className?: string;
  sizes?: readonly number[];
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    fitAmountEl(ref.current, sizes);
  }, [text, sizes]);
  return (
    <span ref={ref} className={className} title={text.replace(/\u00A0/g, " ")}>
      {text}
    </span>
  );
}

/**
 * Medium-length editable invoice sheet (home hero + /create-invoice).
 */
export function EditableInvoiceCard({
  invoice,
  dispatch,
  onLogoFile,
  className,
  currencySelect,
  stampRepositioning = false,
  onStampChange,
  onExitStampReposition,
  stampAnimate = false,
}: {
  invoice: BuilderInvoice;
  dispatch: React.Dispatch<BuilderInvoiceAction>;
  onLogoFile: (file: File | null) => void;
  className?: string;
  currencySelect?: ReactNode;
  stampRepositioning?: boolean;
  onStampChange?: (stamp: InvoiceStamp) => void;
  onExitStampReposition?: () => void;
  stampAnimate?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const calculatedItems = calculateItemsFromForm(invoice.items);
  const totals = calculateInvoiceTotals(calculatedItems);
  const vatRate = getDisplayVatRate(calculatedItems);
  const paymentFilled = hasPaymentDetails(invoice.payment);
  const companyFilled = Boolean(invoice.business.companyNumber.trim());
  const termsFilled = Boolean(invoice.terms.trim());
  const currencySymbol = getCurrencySymbol(invoice.currency);
  const template = getInvoiceTemplate(invoice.templateId);
  const accentHex = invoice.accent ?? DEFAULT_ACCENT_HEX;
  const accentVars = computeAccentVars(accentHex);
  const notesEmpty = !invoice.notes.trim();
  const referenceEmpty = !invoice.reference.trim();
  const footerVisible =
    Boolean(invoice.business.name.trim()) ||
    Boolean(invoice.business.email.trim());

  function applyPaymentTerms(days: PaymentTermsDays) {
    dispatch({
      type: "patch",
      patch: {
        paymentTermsDays: days,
        dueDate: addDaysToIsoDate(invoice.issueDate, days),
      },
    });
  }

  return (
    <article
      className={cn("builder-card", className)}
      data-invoice-builder-card
      data-template={template.id}
      data-layout={template.layout}
      style={
        {
          ...accentVars,
        } as CSSProperties
      }
    >
      <div className="builder-accent" aria-hidden />
      <div className="builder-sidebar-rail" aria-hidden />
      {invoice.stamp ? (
        <InvoiceStampOverlay
          stamp={invoice.stamp}
          repositioning={stampRepositioning}
          onChange={onStampChange ?? (() => {})}
          onExitReposition={onExitStampReposition ?? (() => {})}
          animate={stampAnimate}
        />
      ) : null}
      <div
        className={cn(
          "builder-card-inner",
          stampRepositioning && "builder-card-inner--inert",
        )}
      >
        <header className="builder-header builder-header--compact">
          <div className="builder-header-left min-w-0">
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
              <div className="builder-logo-wrap">
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
                  className="builder-logo-remove clay no-print"
                  onClick={() => onLogoFile(null)}
                  aria-label="Remove logo"
                >
                  <X className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="builder-logo-box"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4" aria-hidden />
                Logo
              </button>
            )}
            <h2 className="builder-title">INVOICE</h2>
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
            <input
              className={cn(
                "builder-field builder-reference",
                referenceEmpty && "builder-empty-print",
              )}
              value={invoice.reference}
              onChange={(event) =>
                dispatch({
                  type: "patch",
                  patch: { reference: event.target.value },
                })
              }
              placeholder="Reference (optional)"
              aria-label="Reference or PO number"
            />
          </div>

          <div className="builder-company text-right">
            <input
              className="builder-field text-base font-bold text-[#0F172A] text-right"
              value={invoice.business.name}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { name: event.target.value },
                })
              }
              placeholder="Your Company"
              aria-label="Business name"
            />
            <textarea
              className="builder-field builder-field--area builder-field--muted mt-1 text-right"
              rows={2}
              value={invoice.business.address}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { address: event.target.value },
                })
              }
              onInput={autoGrow}
              placeholder="123 Main St, City, State 12345"
              aria-label="Business address"
            />
            <input
              className="builder-field builder-field--muted text-right"
              type="email"
              value={invoice.business.email}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { email: event.target.value },
                })
              }
              placeholder="your@email.com"
              aria-label="Business email"
            />
            <input
              className={cn(
                "builder-field builder-field--muted text-right",
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
              aria-label="Phone"
            />
            <div
              className={cn(
                "builder-vat-row mt-0.5 flex items-baseline justify-end gap-1.5 text-sm",
                !invoice.business.vatNumber.trim() && "builder-empty-print",
              )}
            >
              <span className="builder-vat-label shrink-0 font-medium not-italic">
                VAT no.
              </span>
              <input
                className="builder-field builder-field--muted w-auto min-w-[8rem] text-right"
                value={invoice.business.vatNumber}
                onChange={(event) =>
                  dispatch({
                    type: "patchBusiness",
                    patch: { vatNumber: event.target.value },
                  })
                }
                placeholder="Add VAT number"
                aria-label="VAT number"
              />
            </div>
            <input
              className={cn(
                "builder-field builder-field--muted text-right mt-0.5",
                !companyFilled && "builder-empty-print",
              )}
              value={invoice.business.companyNumber}
              onChange={(event) =>
                dispatch({
                  type: "patchBusiness",
                  patch: { companyNumber: event.target.value },
                })
              }
              placeholder="Company no. (optional)"
              aria-label="Company number"
            />
          </div>
        </header>

        <div className="builder-billed">
          <div>
            <p className="builder-label">Billed to</p>
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
              onInput={autoGrow}
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

          <div className="builder-billed-dates">
            <div>
              <p className="builder-label">Issue date</p>
              <div className="builder-date-field mt-2">
                <input
                  className="builder-field builder-date-input font-medium text-[#0F172A]"
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
                <Calendar className="builder-date-icon no-print" aria-hidden />
              </div>
            </div>
            <div>
              <p className="builder-label">Due date</p>
              <div className="builder-date-field mt-2">
                <input
                  className="builder-field builder-date-input font-medium text-[#0F172A]"
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
                <Calendar className="builder-date-icon no-print" aria-hidden />
              </div>
            </div>
            <div>
              <p className="builder-label">Payment terms</p>
              <select
                className="builder-field builder-terms-select mt-2 font-medium text-[#0F172A]"
                value={invoice.paymentTermsDays}
                onChange={(event) =>
                  applyPaymentTerms(
                    Number(event.target.value) as PaymentTermsDays,
                  )
                }
                aria-label="Payment terms"
              >
                {PAYMENT_TERMS_OPTIONS.map((opt) => (
                  <option key={opt.days} value={opt.days}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <table className="builder-table">
          <colgroup>
            <col className="builder-col-desc" />
            <col className="builder-col-qty" />
            <col className="builder-col-price" />
            <col className="builder-col-discount" />
            <col className="builder-col-vat" />
            <col className="builder-col-total" />
            <col className="builder-col-remove no-print" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="builder-col-desc">
                Description
              </th>
              <th scope="col" className="num builder-col-qty">
                Qty
              </th>
              <th scope="col" className="num builder-col-price">
                Price
              </th>
              <th scope="col" className="num builder-col-discount">
                Discount
              </th>
              <th scope="col" className="num builder-col-vat">
                VAT %
              </th>
              <th scope="col" className="num builder-col-total">
                Total
              </th>
              <th scope="col" className="no-print builder-col-remove">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const calculated = calculatedItems[index];
              const discountType = resolveDiscountType(item.discountType);
              const discountIsPercent = discountType === "percent";
              const lineTotalText = formatInvoiceCurrency(
                calculated?.lineTotal ?? 0,
                invoice.currency,
              );

              return (
                <tr key={item.id} className="builder-item-row">
                  <td className="builder-col-desc" data-label="Description">
                    <textarea
                      className="builder-field builder-field--area"
                      rows={1}
                      value={item.description}
                      onChange={(event) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { description: event.target.value },
                        })
                      }
                      onInput={autoGrow}
                      placeholder="Service or Product"
                      aria-label="Description"
                    />
                  </td>
                  <td className="num builder-col-qty" data-label="Qty">
                    <LineItemPlainNumberInput
                      value={item.quantity}
                      ariaLabel="Quantity"
                      className="text-[#0F172A]"
                      onCommit={(quantity) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { quantity },
                        })
                      }
                    />
                  </td>
                  <td className="num builder-col-price" data-label="Price">
                    <LineItemMoneyInput
                      value={item.unitPrice}
                      ariaLabel="Price"
                      className="text-[#0F172A]"
                      onCommit={(unitPrice) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { unitPrice },
                        })
                      }
                    />
                  </td>
                  <td
                    className="num builder-col-discount"
                    data-label="Discount"
                  >
                    <div className="builder-discount-compound">
                      {discountIsPercent ? (
                        <LineItemPlainNumberInput
                          value={item.discountRate}
                          max={100}
                          ariaLabel="Discount percent"
                          className="builder-discount-value text-[#0F172A]"
                          onCommit={(discountRate) =>
                            dispatch({
                              type: "patchItem",
                              id: item.id,
                              patch: { discountRate },
                            })
                          }
                        />
                      ) : (
                        <LineItemMoneyInput
                          value={item.discountRate}
                          ariaLabel="Discount amount"
                          className="builder-discount-value text-[#0F172A]"
                          onCommit={(discountRate) =>
                            dispatch({
                              type: "patchItem",
                              id: item.id,
                              patch: { discountRate },
                            })
                          }
                        />
                      )}
                      <button
                        type="button"
                        className="builder-discount-suffix"
                        aria-pressed={discountIsPercent}
                        aria-label={
                          discountIsPercent
                            ? "Discount type: percent, press to switch to pounds"
                            : "Discount type: pounds, press to switch to percent"
                        }
                        onClick={() =>
                          dispatch({
                            type: "patchItem",
                            id: item.id,
                            patch: {
                              discountType: discountIsPercent
                                ? "fixed"
                                : "percent",
                              discountRate: discountIsPercent
                                ? item.discountRate
                                : Math.min(100, item.discountRate),
                            },
                          })
                        }
                      >
                        {discountIsPercent ? "%" : currencySymbol}
                      </button>
                    </div>
                  </td>
                  <td className="num builder-col-vat" data-label="VAT %">
                    <LineItemPlainNumberInput
                      value={item.vatRate}
                      min={0}
                      max={100}
                      ariaLabel="VAT percent"
                      className="text-[#0F172A]"
                      onCommit={(vatRate) =>
                        dispatch({
                          type: "patchItem",
                          id: item.id,
                          patch: { vatRate },
                        })
                      }
                    />
                  </td>
                  <LineTotalCell text={lineTotalText} />
                  <td className="no-print builder-col-remove">
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

        <div className="no-print mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="builder-add-item clay"
            onClick={() => dispatch({ type: "addItem" })}
          >
            <Plus className="builder-add-item-icon" aria-hidden />
            Add Item
          </button>
        </div>

        <dl className="builder-totals">
          <div className="builder-total-row">
            <dt className="builder-total-row-label">Subtotal</dt>
            <dd className="builder-total-row-value">
              <FitAmount
                className="builder-total-value tabular-nums text-[#0F172A]"
                text={formatInvoiceCurrency(totals.subtotal, invoice.currency)}
                sizes={[15, 14, 13, 12]}
              />
            </dd>
          </div>
          {totals.discountTotal > 0 ? (
            <div className="builder-total-row">
              <dt className="builder-total-row-label">Discount</dt>
              <dd className="builder-total-row-value">
                <FitAmount
                  className="builder-total-value builder-total-discount tabular-nums"
                  text={`-${formatInvoiceCurrency(totals.discountTotal, invoice.currency)}`}
                  sizes={[15, 14, 13, 12]}
                />
              </dd>
            </div>
          ) : null}
          <div className="builder-total-row">
            <dt className="builder-total-row-label">VAT ({vatRate}%)</dt>
            <dd className="builder-total-row-value">
              <FitAmount
                className="builder-total-value builder-total-vat tabular-nums"
                text={`+${formatInvoiceCurrency(totals.vatTotal, invoice.currency)}`}
                sizes={[15, 14, 13, 12]}
              />
            </dd>
          </div>
          <div className="builder-total-final">
            <div className="builder-total-final-row1">
              <span className="builder-total-due-label">Total due</span>
              <div className="builder-currency-compact">
                <span className="builder-currency-compact-code" aria-hidden>
                  {invoice.currency}
                </span>
                {currencySelect}
                <span className="builder-currency-print">{invoice.currency}</span>
              </div>
            </div>
            <div className="builder-total-final-row2">
              <FitAmount
                className="builder-total-final-amount tabular-nums"
                text={formatTotalAmountText(totals.total, invoice.currency)}
              />
            </div>
          </div>
        </dl>

        <section
          className={cn(
            "builder-section builder-notes",
            notesEmpty && "builder-empty-print",
          )}
        >
          <h2 className="builder-section-title">Notes</h2>
          <textarea
            className="builder-field builder-field--area builder-field--muted mt-1.5"
            rows={1}
            value={invoice.notes}
            onChange={(event) =>
              dispatch({
                type: "patch",
                patch: { notes: event.target.value },
              })
            }
            onInput={autoGrow}
            placeholder="Thank you for your business!"
            aria-label="Notes"
          />
        </section>

        <section
          className={cn(
            "builder-section builder-payment",
            !paymentFilled && "builder-empty-print",
          )}
        >
          <h2 className="builder-section-title">Payment details</h2>
          <div className="builder-payment-grid">
            <label className="builder-payment-cell">
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
                aria-label="Account Holder"
              />
            </label>
            <label className="builder-payment-cell">
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
                aria-label="Bank Name"
              />
            </label>
            <label className="builder-payment-cell">
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
                placeholder="e.g. 12345678"
                aria-label="Account/IBAN"
              />
            </label>
            <label className="builder-payment-cell">
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
                aria-label="Sort Code/SWIFT"
              />
            </label>
          </div>
        </section>

        <section
          className={cn(
            "builder-section builder-terms",
            !termsFilled && "builder-empty-print",
          )}
        >
          <h2 className="builder-section-title">Terms</h2>
          <textarea
            className="builder-field builder-field--area builder-field--muted mt-1.5"
            rows={2}
            value={invoice.terms}
            onChange={(event) =>
              dispatch({
                type: "patch",
                patch: { terms: event.target.value },
              })
            }
            onInput={autoGrow}
            placeholder="e.g. Payment due within 30 days of the invoice date"
            aria-label="Terms"
          />
        </section>

        {footerVisible ? (
          <footer className="builder-sheet-footer">
            <p>
              {[
                invoice.business.name.trim(),
                invoice.business.email.trim(),
                invoice.invoiceNumber.trim(),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </footer>
        ) : null}
      </div>
    </article>
  );
}
