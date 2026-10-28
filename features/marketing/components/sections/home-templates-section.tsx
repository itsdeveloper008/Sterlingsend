import Link from "next/link";
import {
  HOME_TEMPLATE_STRIP,
  INVOICE_LAYOUTS,
  INVOICE_TEMPLATE_COUNT,
  type InvoiceLayoutId,
} from "@/pdf/templates/catalog";
import { routes } from "@/config/routes";
import { DEFAULT_ACCENT_HEX, computeAccentVars } from "@/lib/invoice-accent";
import type { CSSProperties } from "react";
import { TemplateMiniPreview } from "@/features/templates/components/template-mini-preview";
import "@/features/templates/styles/template-preview.css";

export function HomeTemplatesSection() {
  const previews = HOME_TEMPLATE_STRIP.map(
    (id) => INVOICE_LAYOUTS.find((l) => l.id === id)!,
  ).filter(Boolean);
  const vars = computeAccentVars(DEFAULT_ACCENT_HEX);

  return (
    <section
      className="ss-section bg-[var(--surface-muted)] px-4 sm:px-6"
      style={{ borderTop: "1px solid var(--border-decorative)" }}
    >
      <div className="bonsai-container relative">
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="type-h2">Invoice templates</h2>
            <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
              {INVOICE_TEMPLATE_COUNT} layouts in any colour. Open the gallery
              to recolour every preview live.
            </p>
          </div>
          <Link
            href={routes.templates}
            className="clay-secondary inline-flex h-12 items-center px-5 text-[15px] font-semibold"
          >
            See all templates
          </Link>
        </div>
        <ul
          className="mt-10 grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "28px" }}
        >
          {previews.map((layout) => (
            <li key={layout.id}>
              <Link
                href={routes.templates}
                className="ss-card-lift glass group block h-full overflow-hidden rounded-2xl p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-600)]"
              >
                <div
                  className="relative aspect-[1/1.35] w-full overflow-hidden rounded-2xl bg-white"
                  style={{
                    ...(vars as CSSProperties),
                    border: "1px solid var(--border-decorative)",
                  }}
                >
                  <TemplateMiniPreview
                    layoutId={layout.id as InvoiceLayoutId}
                    accent={DEFAULT_ACCENT_HEX}
                    className="h-full min-h-0"
                  />
                </div>
                <p className="mt-4 text-base font-semibold text-[var(--ink)]">
                  {layout.name}
                </p>
                <p className="mt-1 text-[15px] leading-snug text-[var(--secondary-text)]">
                  {layout.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
