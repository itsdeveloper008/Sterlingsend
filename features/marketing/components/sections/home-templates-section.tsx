"use client";

import Link from "next/link";
import Image from "next/image";
import {
  INVOICE_TEMPLATES,
  INVOICE_TEMPLATE_COUNT,
} from "@/pdf/templates/catalog";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

/** One preview per distinct layout family. */
const PREVIEW_IDS = [
  "classic-teal",
  "modern-navy",
  "bold-rose",
  "sidebar-slate",
] as const;

export function HomeTemplatesSection() {
  const previews = PREVIEW_IDS.map((id) =>
    INVOICE_TEMPLATES.find((t) => t.id === id),
  ).filter(Boolean);

  return (
    <section className="ss-section relative border-b border-border-subtle bg-background">
      <div className="bonsai-container relative">
        <MotionReveal>
          <h2 className="bonsai-h2">Invoice templates</h2>
          <p className="marketing-body mt-3 max-w-2xl">
            Four layout styles with the same sample data. Open the gallery for
            all {INVOICE_TEMPLATE_COUNT} colour combinations.
          </p>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {previews.map((template, index) => {
            if (!template) return null;
            return (
              <li key={template.id}>
                <MotionReveal delayMs={Math.min(index, 3) * 60}>
                  <Link
                    href={routes.templates}
                    data-ss-tilt="card"
                    className="ss-card-lift ss-card-tilt ss-card-spotlight group block h-full overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-[var(--shadow-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
                  >
                    <div className="relative aspect-[1/1.414] w-full bg-[var(--surface-muted)]">
                      <Image
                        src={`/templates/${template.id}.webp`}
                        alt={`${template.name} template preview`}
                        width={480}
                        height={678}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="border-t border-border-subtle px-4 py-3">
                      <p className="text-lg font-semibold text-[var(--ink)]">
                        {template.category}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[0.9375rem] text-[var(--body-text)]">
                        {template.description}
                      </p>
                    </div>
                  </Link>
                </MotionReveal>
              </li>
            );
          })}
        </ul>
        <div className="mt-10">
          <Link
            href={routes.templates}
            className="bonsai-btn-secondary bonsai-btn-secondary--sm"
          >
            See all templates
          </Link>
        </div>
      </div>
    </section>
  );
}
