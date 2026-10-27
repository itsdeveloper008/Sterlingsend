import type { CSSProperties } from "react";
import type { InvoiceLayoutId } from "@/pdf/templates/catalog";
import { computeAccentVars } from "@/lib/invoice-accent";
import { cn } from "@/lib/utils";

/** Shared full-page static preview used by home strip, gallery and dialog. */
export function TemplateMiniPreview({
  layoutId,
  accent,
  className,
}: {
  layoutId: InvoiceLayoutId;
  accent: string;
  className?: string;
}) {
  const vars = computeAccentVars(accent);
  return (
    <div
      className={cn("tpl-preview", className)}
      data-layout={layoutId}
      style={vars as CSSProperties}
      aria-hidden
    >
      <div className="tpl-preview-accent tpl-depth-layer" />
      <div className="tpl-preview-rail" />
      <div className="tpl-preview-seal tpl-depth-layer" />
      <div className="tpl-preview-inner">
        <div className="tpl-preview-header">
          <div>
            <div className="tpl-preview-logo" />
            <p className="tpl-preview-title">INVOICE</p>
            <p className="tpl-preview-no">INV-1042</p>
          </div>
          <div className="tpl-preview-biz">
            <p className="font-bold">North &amp; Co</p>
            <p>14 Harbour Way, Bristol</p>
            <p>hello@north.co</p>
            <p>VAT GB123456789</p>
          </div>
        </div>
        <div className="tpl-preview-amount">
          <p className="tpl-preview-label">Amount due</p>
          <p className="tpl-preview-amount-value">£1,920.00</p>
        </div>
        <div className="tpl-preview-billed">
          <div>
            <p className="tpl-preview-label">Billed to</p>
            <p className="font-semibold">Acme Ltd</p>
            <p>41 Client Road</p>
            <p>London EC1A 1BB</p>
          </div>
          <div className="tpl-preview-dates">
            <p className="tpl-preview-label">Issue</p>
            <p>12 Jan 2026</p>
            <p className="tpl-preview-label mt-1">Due</p>
            <p>26 Jan 2026</p>
          </div>
        </div>
        <table className="tpl-preview-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Brand workshop</td>
              <td>1</td>
              <td>£800.00</td>
            </tr>
            <tr>
              <td>Website design</td>
              <td>1</td>
              <td>£720.00</td>
            </tr>
            <tr>
              <td>Content migration</td>
              <td>4</td>
              <td>£240.00</td>
            </tr>
            <tr>
              <td>Support retainer</td>
              <td>1</td>
              <td>£160.00</td>
            </tr>
          </tbody>
        </table>
        <div className="tpl-preview-total">
          <span>Total due</span>
          <strong>£1,920.00</strong>
        </div>
        <div className="tpl-preview-notes">
          <p className="tpl-preview-label">Notes</p>
          <p>Thank you for your business. Payment within 14 days.</p>
        </div>
        <div className="tpl-preview-pay">
          <p className="tpl-preview-label">Payment details</p>
          <p>North &amp; Co · Sort 12-34-56 · Acc 12345678</p>
        </div>
        <div className="tpl-preview-terms">
          <p className="tpl-preview-label">Terms</p>
          <p>Late payment interest may apply under UK statute.</p>
        </div>
      </div>
    </div>
  );
}
