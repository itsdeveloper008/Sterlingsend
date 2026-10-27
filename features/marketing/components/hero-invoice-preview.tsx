import Link from "next/link";
import { Pencil } from "lucide-react";
import { routes } from "@/config/routes";
import "@/features/invoice-builder/styles/invoice-builder.css";
import "@/features/marketing/styles/hero-sheet.css";

/**
 * Server-rendered static invoice preview for the home hero.
 * Entire sheet links to /create-invoice — no inputs, no client JS for the sheet.
 */
export function HeroInvoicePreview() {
  return (
    <div className="home-hero-invoice w-full">
      <div className="home-hero-invoice-grid">
        <Link
          href={routes.createInvoice}
          className="home-hero-preview-link home-hero-invoice-sheet"
          aria-label="Create your invoice"
        >
          <span className="home-hero-preview-hint glass">
            <Pencil className="h-3.5 w-3.5" aria-hidden strokeWidth={1.5} />
            Click to edit this invoice
          </span>
          <div className="builder-stack">
            <div className="builder-stack-layer" aria-hidden />
            <div className="builder-stack-sheet">
              <article
                className="builder-card hero-builder-card"
                data-invoice-builder-card
                data-template="classic"
                data-layout="classic"
              >
                <div className="builder-accent" aria-hidden />
                <div className="builder-card-inner">
                  <header className="builder-header builder-header--compact">
                    <div className="builder-header-left min-w-0">
                      <div className="builder-logo-box" aria-hidden>
                        Logo
                      </div>
                      <h2 className="builder-title">INVOICE</h2>
                      <p className="builder-invoice-no">INV-001</p>
                      <p className="builder-reference" style={{ fontStyle: "italic", color: "#64748b" }}>
                        Reference (optional)
                      </p>
                    </div>
                    <div className="builder-company text-right">
                      <p className="text-base font-bold text-[#0F172A]">North &amp; Co</p>
                      <p className="builder-field--muted mt-1" style={{ fontStyle: "italic" }}>
                        14 Quay Street
                        <br />
                        Bristol BS1 4AX
                      </p>
                      <p className="builder-field--muted">hello@northand.co</p>
                      <p className="builder-field--muted">0117 000 0000</p>
                      <p className="builder-vat-row mt-0.5 text-sm">
                        <span className="builder-vat-label">VAT no.</span>{" "}
                        <span className="builder-field--muted" style={{ fontStyle: "italic" }}>
                          GB123456789
                        </span>
                      </p>
                      <p className="builder-field--muted mt-0.5" style={{ fontStyle: "italic" }}>
                        Company no. 12345678
                      </p>
                    </div>
                  </header>

                  <div className="builder-billed">
                    <div>
                      <p className="builder-label">Billed to</p>
                      <p className="mt-2 font-semibold text-[#0F172A]">Acme Ltd</p>
                      <p className="builder-field--muted mt-1" style={{ fontStyle: "italic" }}>
                        88 King Street
                        <br />
                        Manchester M2 4WQ
                      </p>
                      <p className="builder-field--muted">accounts@acme.test</p>
                    </div>
                    <div className="builder-billed-dates">
                      <div>
                        <p className="builder-label">Issue date</p>
                        <p className="mt-2 font-medium text-[#0F172A]">23/10/2026</p>
                      </div>
                      <div>
                        <p className="builder-label">Due date</p>
                        <p className="mt-2 font-medium text-[#0F172A]">06/11/2026</p>
                      </div>
                      <div>
                        <p className="builder-label">Payment terms</p>
                        <p className="mt-2 font-medium text-[#0F172A]">14 days</p>
                      </div>
                    </div>
                  </div>

                  <table className="builder-table">
                    <thead>
                      <tr>
                        <th scope="col" className="builder-col-desc">
                          Description
                        </th>
                        <th scope="col" className="num">
                          Qty
                        </th>
                        <th scope="col" className="num">
                          Price
                        </th>
                        <th scope="col" className="num">
                          Discount
                        </th>
                        <th scope="col" className="num">
                          VAT %
                        </th>
                        <th scope="col" className="num">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="builder-col-desc">Brand workshop</td>
                        <td className="num">1</td>
                        <td className="num">1,200.00</td>
                        <td className="num">0%</td>
                        <td className="num">20</td>
                        <td className="num font-semibold">£1,440.00</td>
                      </tr>
                    </tbody>
                  </table>

                  <dl className="builder-totals">
                    <div className="builder-total-row">
                      <dt className="text-[#64748B]">Subtotal</dt>
                      <dd className="tabular-nums text-[#0F172A]">£1,200.00</dd>
                    </div>
                    <div className="builder-total-row">
                      <dt className="text-[#64748B]">VAT (20%)</dt>
                      <dd className="builder-total-vat tabular-nums">+ £240.00</dd>
                    </div>
                    <div className="builder-total-final">
                      <dt className="builder-total-final-currency">
                        <span className="text-sm font-semibold text-[#0F172A]">GBP</span>
                      </dt>
                      <dd className="builder-total-final-meta">
                        <span className="builder-total-due-label">Total due</span>
                        <span className="builder-total-final-amount tabular-nums">
                          £ 1,440.00
                        </span>
                      </dd>
                    </div>
                  </dl>

                  <section className="builder-section builder-notes">
                    <h3 className="builder-section-title">Notes</h3>
                    <p className="mt-1.5 text-[14px] text-[#334155]">
                      Thank you for your business!
                    </p>
                  </section>

                  <section className="builder-section builder-payment">
                    <h3 className="builder-section-title">Payment details</h3>
                    <div className="builder-payment-grid">
                      <div className="builder-payment-cell">
                        <span className="builder-payment-label">Account Holder</span>
                        <span className="text-[14px] text-[#334155]">North &amp; Co</span>
                      </div>
                      <div className="builder-payment-cell">
                        <span className="builder-payment-label">Bank Name</span>
                        <span className="text-[14px] text-[#334155]">HSBC</span>
                      </div>
                      <div className="builder-payment-cell">
                        <span className="builder-payment-label">Account/IBAN</span>
                        <span className="text-[14px] text-[#334155]">12345678</span>
                      </div>
                      <div className="builder-payment-cell">
                        <span className="builder-payment-label">Sort Code/SWIFT</span>
                        <span className="text-[14px] text-[#334155]">12-34-56</span>
                      </div>
                    </div>
                  </section>

                  <section className="builder-section builder-terms">
                    <h3 className="builder-section-title">Terms</h3>
                    <p className="mt-1.5 text-[14px] text-[#334155]">
                      Payment due within 30 days of the invoice date.
                    </p>
                  </section>

                  <footer className="builder-sheet-footer">
                    <p>North &amp; Co · hello@northand.co · INV-001</p>
                  </footer>
                </div>
              </article>
            </div>
          </div>
        </Link>

        <div className="home-hero-actions no-print">
          <Link href={routes.createInvoice} className="inv-panel-btn-outline clay home-hero-action-btn">
            Print
          </Link>
          <Link
            href={routes.createInvoice}
            className="inv-panel-btn-primary clay-teal home-hero-action-btn"
          >
            Download PDF
          </Link>
        </div>
      </div>
    </div>
  );
}
