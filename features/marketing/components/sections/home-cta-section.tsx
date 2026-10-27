import Link from "next/link";
import { routes } from "@/config/routes";
import { AtmosphereImage } from "@/components/media/atmosphere-image";

export function HomeCtaSection() {
  return (
    <section className="ss-section relative px-4 sm:px-6">
      <div className="bonsai-container">
        <div className="glass relative grid items-center gap-10 overflow-hidden rounded-[24px] p-8 sm:p-12 md:grid-cols-2">
          <div className="relative z-[1]">
            <h2 className="type-h2 text-[var(--ink)]">
              Join freelancers and firms using SterlingSend to streamline
              invoicing.
            </h2>
            <p className="ss-measure mt-6 text-[17px] leading-[1.7] text-[var(--secondary-text)]">
              Create invoices and use every PDF tool free, no login needed. Sign
              up only when you want to save your work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={routes.createInvoice}
                className="clay-teal clay-teal-lg inline-flex h-[52px] items-center px-6 text-[19px] font-bold text-white"
              >
                Create a free invoice
              </Link>
              <Link
                href={routes.tools}
                className="clay-secondary inline-flex h-[52px] items-center px-6 text-[17px] font-semibold"
              >
                Open PDF tools
              </Link>
            </div>
          </div>
          <AtmosphereImage
            file="cta-desk.webp"
            alt="Desk with laptop and invoice paperwork"
            aspect="4 / 3"
            className="relative z-[1]"
          />
        </div>
      </div>
    </section>
  );
}
