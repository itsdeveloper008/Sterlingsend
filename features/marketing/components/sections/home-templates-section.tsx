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
    <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-24 dark:border-[#1E293B] dark:bg-[#0F1A28] sm:px-6">
      <div className="bonsai-container relative">
        <MotionReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-tight text-[#0F172A] dark:text-white">
                Invoice templates
              </h2>
              <p className="mt-3 max-w-2xl text-base text-[#475569] dark:text-[#CBD5E1]">
                Four layout styles with the same sample data. Open the gallery
                for all {INVOICE_TEMPLATE_COUNT} colour combinations.
              </p>
            </div>
            <Link
              href={routes.templates}
              className="inline-flex h-11 items-center justify-center rounded-xl border-[1.5px] border-[#94A3B8] bg-white px-4 text-[15px] font-bold text-[#0F172A] transition-transform hover:-translate-y-0.5 dark:bg-[#13202F] dark:text-white"
            >
              See all templates
            </Link>
          </div>
        </MotionReveal>
        <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {previews.map((template, index) => {
            if (!template) return null;
            return (
              <li key={template.id}>
                <MotionReveal delayMs={Math.min(index, 3) * 60}>
                  <Link
                    href={routes.templates}
                    data-ss-tilt="card"
                    className="ss-card-lift ss-card-tilt ss-card-spotlight group block h-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6] dark:border-[#1E293B] dark:bg-[#13202F]"
                  >
                    <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-xl bg-[#F1F5F9]">
                      <Image
                        src={`/templates/${template.id}.webp`}
                        alt={`${template.name} template preview`}
                        width={480}
                        height={678}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <p className="mt-3 text-base font-bold text-[#0F172A] dark:text-white">
                      {template.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[15px] text-[#475569] dark:text-[#CBD5E1]">
                      {template.description}
                    </p>
                  </Link>
                </MotionReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
