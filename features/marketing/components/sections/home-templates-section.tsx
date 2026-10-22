"use client";

import Link from "next/link";
import Image from "next/image";
import {
  INVOICE_TEMPLATES,
  INVOICE_TEMPLATE_COUNT,
} from "@/pdf/templates/catalog";
import { routes } from "@/config/routes";
import { MotionReveal } from "@/features/marketing/lib/motion-reveal";

const PREVIEW_IDS = [
  "classic-teal",
  "bold-navy",
  "sidebar-slate",
  "modern-emerald",
  "minimal-indigo",
  "band-rose",
] as const;

export function HomeTemplatesSection() {
  const previews = PREVIEW_IDS.map((id) =>
    INVOICE_TEMPLATES.find((t) => t.id === id),
  ).filter(Boolean);

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-background py-16 sm:py-20">
      <div
        className="ss-float pointer-events-none absolute right-8 top-10 size-14 rounded-[30%] clay opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <MotionReveal>
          <h2 className="type-h2 text-foreground">Invoice templates</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pick a layout and colour. The template applies to the PDF you download.
          </p>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {previews.map((template, index) => {
            if (!template) return null;
            return (
              <li key={template.id}>
                <MotionReveal delayMs={Math.min(index, 5) * 60}>
                  <Link
                    href={routes.templates}
                    className="ss-card-lift ss-card-tilt ss-card-spotlight group block overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
                    onPointerMove={(event) => {
                      const node = event.currentTarget;
                      const rect = node.getBoundingClientRect();
                      node.style.setProperty(
                        "--ss-spot-x",
                        `${((event.clientX - rect.left) / rect.width) * 100}%`,
                      );
                      node.style.setProperty(
                        "--ss-spot-y",
                        `${((event.clientY - rect.top) / rect.height) * 100}%`,
                      );
                    }}
                  >
                    <div className="relative aspect-[3/4] w-full bg-muted">
                      <Image
                        src={`/templates/${template.id}.webp`}
                        alt={`${template.name} template preview`}
                        width={480}
                        height={640}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="border-t border-border-subtle px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {template.name}
                      </p>
                    </div>
                  </Link>
                </MotionReveal>
              </li>
            );
          })}
        </ul>
        <p className="mt-8">
          <Link
            href={routes.templates}
            className="ss-link-underline text-sm font-semibold text-[var(--brand-700)]"
          >
            See all {INVOICE_TEMPLATE_COUNT} templates
          </Link>
        </p>
      </div>
    </section>
  );
}
