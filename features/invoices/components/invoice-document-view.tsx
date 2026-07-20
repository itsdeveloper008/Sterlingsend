"use client";

import Image from "next/image";
import type { BankDetails } from "@/types";
import type { InvoiceItem, InvoiceStatus, InvoiceTotals } from "@/types";
import { siteConfig } from "@/config/site";
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  formatTotalsSummary,
} from "@/features/invoices/lib/format";
import {
  formatPaymentTermsLabel,
  getDisplayVatRate,
  getInvoiceStampLabel,
  getInvoiceStampTone,
  hasBankDetails,
} from "@/features/invoices/lib/invoice-document-utils";
import { cn } from "@/lib/utils";
import "@/features/invoices/styles/invoice-document.css";

export type InvoiceDocumentViewData = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  notes?: string;
  business: {
    name: string;
    email?: string;
    logoUrl?: string;
    bankDetails?: BankDetails;
  };
  customer: {
    name: string;
    email?: string;
  };
};

function NoteContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}|\n/).filter(Boolean);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-[#64748B]">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function DisplayOrPlaceholder({
  value,
  placeholder,
  allowPlaceholder,
  className,
}: {
  value?: string;
  placeholder: string;
  allowPlaceholder?: boolean;
  className?: string;
}) {
  const trimmed = value?.trim();
  if (!trimmed) {
    if (!allowPlaceholder) return <span className={className}>-</span>;
    return (
      <span className={cn("invoice-doc-placeholder", className)}>
        {placeholder}
      </span>
    );
  }
  return <span className={className}>{trimmed}</span>;
}

export function InvoiceDocumentView({
  data,
  className,
  amountDueLabel = "Amount Due",
  embedded = false,
  showPlaceholders = false,
  showPoweredBy = true,
}: {
  data: InvoiceDocumentViewData;
  className?: string;
  amountDueLabel?: string;
  embedded?: boolean;
  /** Marketing / empty guest drafts only - never on public or dashboard. */
  showPlaceholders?: boolean;
  showPoweredBy?: boolean;
}) {
  const formattedTotals = formatTotalsSummary(data.totals, data.currency);
  const vatRate = getDisplayVatRate(data.items);
  const paymentTerms = formatPaymentTermsLabel(data.issueDate, data.dueDate);
  const stampLabel = getInvoiceStampLabel(data.status);
  const stampTone = getInvoiceStampTone(data.status);

  const showVatColumn = data.items.some((item) => item.vatRate > 0);
  const showDiscountColumn = data.items.some((item) => item.discountRate > 0);

  const lineItems =
    data.items.length > 0
      ? data.items
      : showPlaceholders
        ? [
            {
              id: "placeholder",
              description: "",
              quantity: 1,
              unitPrice: 0,
              vatRate: 20,
              discountRate: 0,
              lineSubtotal: 0,
              lineVat: 0,
              lineDiscount: 0,
              lineTotal: 0,
            },
          ]
        : [];

  const businessInitial = (data.business.name || "V").charAt(0).toUpperCase();

  return (
    <div className={cn(embedded ? "" : "invoice-doc-shell", className)}>
      {!embedded ? <div className="invoice-doc-backdrop" aria-hidden /> : null}

      <article className="invoice-doc-card">
        <div className="invoice-doc-card-inner">
          <header className="invoice-doc-header">
            <div className="min-w-0">
              {data.business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.business.logoUrl}
                  alt={`${data.business.name || "Business"} logo`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-[10px] object-contain"
                />
              ) : (
                <div className="invoice-doc-logo-mark" aria-hidden>
                  {businessInitial}
                </div>
              )}
            </div>

            <div
              className={cn("invoice-doc-stamp", `invoice-doc-stamp--${stampTone}`)}
              aria-label={`Status: ${stampLabel}`}
            >
              {stampLabel}
            </div>

            <div className="invoice-doc-header-right">
              <h1 className="invoice-doc-title">INVOICE</h1>
              <p className="invoice-doc-id">{data.invoiceNumber}</p>
            </div>
          </header>

          <div className="invoice-doc-meta">
            <div className="space-y-2">
              <div className="invoice-doc-meta-row">
                <span className="invoice-doc-meta-label">Invoice ID</span>
                <span className="invoice-doc-meta-value">{data.invoiceNumber}</span>
              </div>
              <div className="invoice-doc-meta-row">
                <span className="invoice-doc-meta-label">Issue Date</span>
                <span className="invoice-doc-meta-value">
                  {formatInvoiceDate(data.issueDate)}
                </span>
              </div>
              <div className="invoice-doc-meta-row">
                <span className="invoice-doc-meta-label">Due Date</span>
                <span className="invoice-doc-meta-value">
                  {formatInvoiceDate(data.dueDate)}
                  <span className="ml-1 text-[#94A3B8]">({paymentTerms})</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="invoice-doc-meta-row">
                <span className="invoice-doc-meta-label">From:</span>
                <span className="invoice-doc-meta-value font-medium text-[#0F172A]">
                  <DisplayOrPlaceholder
                    value={data.business.name}
                    placeholder="Your business name"
                    allowPlaceholder={showPlaceholders}
                  />
                </span>
              </div>
              <div className="invoice-doc-meta-row">
                <span className="invoice-doc-meta-label">Invoice For:</span>
                <div>
                  <p className="font-medium text-[#0F172A]">
                    <DisplayOrPlaceholder
                      value={data.customer.name}
                      placeholder="Customer name"
                      allowPlaceholder={showPlaceholders}
                    />
                  </p>
                  {data.customer.email ? (
                    <p className="text-sm text-[#64748B]">{data.customer.email}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <table className="invoice-doc-table">
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col" className="invoice-doc-num">
                  Quantity
                </th>
                <th scope="col" className="invoice-doc-num">
                  Unit Price
                </th>
                {showVatColumn ? (
                  <th scope="col" className="invoice-doc-num">
                    VAT %
                  </th>
                ) : null}
                {showDiscountColumn ? (
                  <th scope="col" className="invoice-doc-num">
                    Disc. %
                  </th>
                ) : null}
                <th scope="col" className="invoice-doc-num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <DisplayOrPlaceholder
                      value={item.description}
                      placeholder="Line item description"
                      allowPlaceholder={showPlaceholders}
                    />
                  </td>
                  <td className="invoice-doc-num tabular-nums">
                    {item.quantity || "-"}
                  </td>
                  <td className="invoice-doc-num tabular-nums">
                    {formatInvoiceCurrency(item.unitPrice, data.currency)}
                  </td>
                  {showVatColumn ? (
                    <td className="invoice-doc-num tabular-nums">{item.vatRate}%</td>
                  ) : null}
                  {showDiscountColumn ? (
                    <td className="invoice-doc-num tabular-nums">
                      {item.discountRate}%
                    </td>
                  ) : null}
                  <td className="invoice-doc-num tabular-nums font-medium">
                    {formatInvoiceCurrency(item.lineTotal, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="invoice-doc-totals">
            <div className="invoice-doc-total-row">
              <dt className="text-[#64748B]">Subtotal</dt>
              <dd className="tabular-nums text-[#0F172A]">
                {formattedTotals.subtotal}
              </dd>
            </div>
            {data.totals.discountTotal > 0 ? (
              <div className="invoice-doc-total-row">
                <dt className="text-[#64748B]">Discount</dt>
                <dd className="tabular-nums text-[#0F172A]">
                  -{formatInvoiceCurrency(data.totals.discountTotal, data.currency)}
                </dd>
              </div>
            ) : null}
            {data.totals.vatTotal > 0 ? (
              <div className="invoice-doc-total-row">
                <dt className="text-[#64748B]">VAT ({vatRate}%)</dt>
                <dd className="tabular-nums text-[#0F172A]">
                  {formattedTotals.vatTotal}
                </dd>
              </div>
            ) : null}
            <div className="invoice-doc-total-row invoice-doc-total-final">
              <dt>{amountDueLabel}</dt>
              <dd className="tabular-nums">{formattedTotals.total}</dd>
            </div>
          </dl>

          {data.notes || hasBankDetails(data.business.bankDetails) ? (
            <section className="invoice-doc-note">
              {data.notes ? (
                <>
                  <h2 className="invoice-doc-note-heading">Note</h2>
                  <div className="mt-3">
                    <NoteContent text={data.notes} />
                  </div>
                </>
              ) : null}

              {hasBankDetails(data.business.bankDetails) ? (
                <div className={cn("invoice-doc-bank", data.notes && "mt-4")}>
                  <h3 className="invoice-doc-note-heading">Bank details</h3>
                  <dl className="mt-3 space-y-1.5 text-sm text-[#64748B]">
                    {data.business.bankDetails?.accountName ? (
                      <div>
                        <span className="font-medium text-[#0F172A]">
                          Account Name:{" "}
                        </span>
                        {data.business.bankDetails.accountName}
                      </div>
                    ) : null}
                    {data.business.bankDetails?.accountNumber ? (
                      <div>
                        <span className="font-medium text-[#0F172A]">
                          Account Number:{" "}
                        </span>
                        {data.business.bankDetails.accountNumber}
                      </div>
                    ) : null}
                    {data.business.bankDetails?.sortCode ? (
                      <div>
                        <span className="font-medium text-[#0F172A]">
                          Sort Code:{" "}
                        </span>
                        {data.business.bankDetails.sortCode}
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : null}
            </section>
          ) : null}

          {showPoweredBy ? (
            <div className="invoice-doc-powered">
              <Image
                src={siteConfig.logo}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              <span>Powered by {siteConfig.name}</span>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
